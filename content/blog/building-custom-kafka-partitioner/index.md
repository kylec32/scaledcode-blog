---
title: Diving Into Kafka Partitioning By Building a Custom Partition Assignor
description: Digging into the details of partition assignment in Kafka as well as implementing our own custom partition assignment system.
date: 2022-03-07
hero_image: ./custom-partitioner-hero.jpg
tags:
  - parition
  - kafka
  - distributed systems
  - design patterns
  - load balancing
---

Building a distributed system is not easy. There are many concerns a distributed system developer must take into account at all times. The more concerns a developer must keep track of, the more likely something is going to slip through the cracks and be missed. Often these concerns that need to be addressed and maintained are not core to the problem that is being solved, often labeled "undifferentiated heavy lifting." This is why developers often look to tools and frameworks to offload some of those tasks so they can focus on the core, unique business problem they are trying to solve. For a developer using Kafka one of those concerns is scheduling different instances of an application to be in charge of different partitions on a particular Kafka topic. Thankfully, Kafka consumers handle this issue transparently to the developer. Let's pull back the curtain a little and see how that works and then get our hands dirty building our own partitioning scheme.

Let's start by reminding ourselves a bit about the internals of Kafka. The data in Kafka is divided into topics. A topic is a logical grouping of data. Topics are further subdivided into one or more partitions. Partitions are the unit of scalability for a Kafka topic. While one consumer can handle all partitions in a topic, more than one consumer cannot operate on a particular partition at the same time. This means if I have a topic with 20 partitions and more than 20 consumers will not benefit me as far as throughput goes. Finally, multiple consumers can indicate that they want to work together to process a topic by being part of the same consumer group. It is within the scope of a consumer group that all partitions of a topic will be divided.

To understand how partition balancing is accomplished it is useful to understand a bit about group management in Kafka and what the broker is responsible for and what the client is responsible for. When a consumer comes online it notifies the broker of what topics it wants to subscribe to and what consumer groups it is part of. Each consumer group will be assigned one of the broker instances as its group coordinator. The group coordinator is in charge of tracking the partitions of the subscribed topics as well as the member of the group. Any changes to either of these items will require a change to the distributions of partitions. The group coordinator doesn't have a lot of tools in its toolbelt to affect change, it really only has one, the rebalance.

A rebalance is straightforward in concept. The group coordinator requires all consumers to rejoin the group at which point the distribution of work (partitions to process) can be changed (likely to make it more even between consumers). There could be many strategies for rebalancing a set of topics and partitions and thus, interestingly, the job of rebalancing is delegated to the client-side, not the broker.

The question this raises is how does the client handle a rebalance if it is unaware and potentially unable to communicate with the other consumer? The facilitate this one client is chosen to be the group leader for a rebalance. At this point, the two-phase rebalance is started. As a response to the message, the broker will respond with a request that all consumers rejoin the group. Each consumer will then send an appropriately named message called a `JoinGroup` message which includes which topics it would like to subscribe to. After receiving this message from each consumer we are ready to proceed.

> *Something to note here is that a consumer cannot send this `JoinGroup` message while it is processing records it has received from a previous poll call. This means if a particular consumer is taking a long time to process its record all other consumers must wait for it to be done and send its `JoinGroup` message. During this waiting period, none of those consumers can continue processing their assigned partitions.*

Once the group coordinator has received all the `JoinGroup` messages it consolidates them all into a `JoinGroup` response which is sent to the group leader (one of the consumer processes).

The group leader takes this response and determines which consumers will be assigned which partitions of which topics and sends the details to the group coordinator in a `SyncGroup` request. All other consumers also send a `SyncGroup` request. The group coordinator then responds to each consumer's `SyncGroup` request with that consumer's assigned partitions. This completes the second stage of the rebalance at which point all consumers can start processing their partitions. With this rebalance protocol there is no processing of partitions from the time a consumer sends its `JoinGroup` request to the time it receives its `SyncGroup` response. This can be a significant amount of time and this can negatively affect the throughput of your processing. This problem only gets worse the more consumers you have in a group.

What is described above is what is referred to as the *Eager Rebalance Protocol*. This was the original default protocol that all Kafka consumers used and still is the default for non-Streams applications. The other protocol that has been developed is called the *incremental cooperative rebalance protocol*. We won't cover all the details here but at a high level, the difference with this protocol is that it trades off having an additional rebalance step in favor of allowing consumers to keep processing at least some of their partitions throughout the process. The way it accomplishes this is by having the first rebalance simply focus on revoking partitions. Once all the partitions that need to be revoked have been then there is an additional rebalance step where the now revoked partitions are reassigned. By separating those two steps, all retained partitions can be processed continually throughout the process and it is only the partitions that are revoked that are effectively temporarily paused. Through this relatively straightforward algorithm, we can have this great improvement.

## Building A Custom Assignor

So let's put together our new found knowledge about partition assignment and build our own partition assignor. Kafka's client libraries include an interface, `ConsumerPartitionAssignor`, that anyone can implement to create their own assignment process. Then a user can configure their consumer to use this custom partition assignor by passing in the consumer configuration value: `properties.put(ConsumerConfig.PARTITION_ASSIGNMENT_STRATEGY_CONFIG, <Class name of assignor>.class.getName());` This can of course also point to one of the bundled strategies as well (`RoundRobinAssignor`, `StickyAssignor`, `RangeAssignor`, `CooperativeStickyAssignor`). The interface requires two methods to be provided. The `assign` method that returns the actual assignments and a `name` method that returns a name for the assignor. For our example, we will be using an abstract class that implements this interface and provides some helper method and thus the signature of our required `assign` method will be slightly different but the idea is the same.

### What Will Our Assignor Do

Let's cover what our customer assignor will do and what attributes we would like it to have. I didn't want something super trivial but also wanted it to be explainable within a blog post. With this in mind, I settled on creating an assignor that will be sticky and assign partitions based on a "weight" given to each consumer. "Sticky" for an assignor means that partitions assigned to a particular consumer will have a preference for staying on that consumer. This is one of the requirements if you are trying to make a cooperative rebalance strategy (our example will be eager for simplicity's sake). Our second requirement of weighted assignments somewhat flies in the face of what a regular balancer would do in that it is trying to make an unequal assignment but, in principle, the weight would have justification. Perhaps you are using different sized machines with different capabilities and thus you want to put more partitions on a more capable machine than a less capable machine. It is somewhat contrived but I still think the concept could be useful in the real world. So let's get to implementing.

### Implementation Details

We won't go over every line of code in my example (but a link to the repository will be below if you would like to) but we will hit some of the interesting points as we go. One of the first problems we need to address is that of providing information from each consumer to the group leader. This information will include that consumer's weight as well as its currently assigned partitions (if any).

> *Interestingly one of the methods on one of the objects passed to the assignor is `ownedPartitions` this appears like it would be very useful for our implementation but, unfortunately, it doesn't appear to ever have any data from my tests and I am unable to find anywhere where it is used. I'm sure I'm misconfiguring something but I'm not sure what. If you know, please comment, I would love to understand. (Update: A reader pointed out that this is because this assignor is an `Eager` assignor and uses the eager protocol which means each consumer group will drop its currently assigned partitions before calling `JoinGroup`, conversely, if it was a `Cooperative` assignor the `ownedPartitions` value would be as expected.)*

To accomplish this we will need to reach into some of the overridable methods on the `ConsumerPartitionAssignor` interface. The first of these is the `onAssignment` method. This will be called on each consumer when it has partitions changed. We will simply take our assignments and store them to be used later.

```java
private List<TopicParition> memberAssignedPartitions;

@Override
public void onAssignment(Assignment assignment, ConsumerGroupMetadata metadata) {
    memberAssignedPartitions = assignment.partitions();
}
```

We then will also override the `subscriptionUserData` method. This method is called and the data returned is passed in the `JoinGroup` request alone with the subscription information. This can return any data as the return type is a `ByteBuffer`. To save space on the wire I decided to create my own serialization code to take the `weight` assigned to the node as well as the assigned partitions that we stored above from the `onAssignment` method. This code won't be included for brevity but the high-level concept can be seen from just reading the `subscriptionUserData` function.

```java
@Override
public ByteBuffer subscriptionUserData(Set<String> topics) {
    Map<String, List<Integer>> topicPartitions =
                                    memberAssignedPartitions == null ? Collections.emptyMap()
                                                                    : groupPartitionsByTopic(memberAssignedPartitions);
    byte[] assignmentBytes = serializeAssignment(topicPartitions);
    var size = assignmentBytes.length + (Integer.SIZE/BITS_IN_BYTE);
    ByteBuffer totalBuffer = ByteBuffer.allocate(size);
    totalBuffer.putInt(weight);
    totalBuffer.put(assignmentBytes);
    totalBuffer.flip();
    return totalBuffer;
}

private static Map<String, List<Integer>> groupPartitionsByTopic(List<TopicPartition> partitions) {
    Map<String, List<Integer>> topicPartitions = new HashMap<>();
    partitions.forEach(partition -> topicPartitions.computeIfAbsent(partition.topic(),
                                                                    k -> new ArrayList<>()).add(partition.partition()));
    return topicPartitions;
}
```

Given that there may not be any stored partitions we check for that first, if there are none be simply create an empty map. If there are partitions assigned we group them by topic. Our serialization method then takes each subscription. Writes an `int` for the size of the topic name, writes the topic name using UTF-8 encoding, writes an `int` for the number of partitions in that topic that are assigned, writes an `int` for each partition, and then returns that byte array that has been built up. We then put the `int` of the weight on the byte buffer followed by the bytes from the partition serializer discussed above and return that. This is quite manual of a serialization setup but it does make for a very efficient setup. We then can get access to this information when we are assigning partitions.

Now that we have that pre-work done we can dive into the actual `assign` function implementation. The `assign` function is passed two parameters. The first is a map of topic names to the number of partitions in that topic. The second is a map of consumer ids to `Subscription` objects. A `Subscription` object holds the topics that a consumer would like to subscribe to as well as its user data and a few other things.

```java
@Override
public Map<String, List<TopicPartition>> assign(Map<String, Integer> partitionsPerTopic,
                                                Map<String, Subscription> subscriptions) {
    memberAssignmentInfo = new HashMap<>();
    subscriptions.forEach((memberId, subscription) ->
                                memberAssignmentInfo.put(memberId, getMemberAssignmentInfo(subscription.userData())));

    var topicMemberPortions = generateMemberTopicPortions(subscriptions, partitionsPerTopic);

    var partitionsToAssign = allPartitionsSorted(partitionsPerTopic, subscriptions);

    var assignments = subscriptions.keySet().stream()
                                    .collect(Collectors.toMap(item -> item,
                                                            item -> (List<TopicPartition>) new ArrayList<TopicPartition>()));

    // Assign owned up to quota
    subscriptions.forEach((key, value) ->
                                    memberAssignmentInfo.get(key).getAssignments().forEach(topicPartition -> {
                                        if (topicMemberPortions.get(topicPartition.topic()).get(key) > 0
                                                                    && partitionsToAssign.contains(topicPartition)) {
                                            assignments.get(key).add(topicPartition);
                                            partitionsToAssign.remove(topicPartition);
                                            topicMemberPortions.get(topicPartition.topic())
                                                                .put(key, topicMemberPortions
                                                                            .get(topicPartition.topic())
                                                                            .get(key) - 1);
                                        }
                                    }));

    // Assign unassigned up to quota
    topicMemberPortions.forEach((topic, topicMemberPortion) ->
                                        topicMemberPortion.forEach((memberId, remainingToFill) -> {
                                            for (int i = 0; i < remainingToFill; i++) {
                                                if (!partitionsToAssign.isEmpty()) {
                                                    assignments.get(memberId).add(partitionsToAssign.remove(0));
                                                }
                                            }
                                        }));

    // Assign stragglers evenly
    if (!partitionsToAssign.isEmpty()) {
        CircularIterator<String> memberIterator = new CircularIterator<>(subscriptions.keySet());
        partitionsToAssign.forEach(topicPartition -> {
            assignments.get(memberIterator.next()).add(topicPartition);
        });
    }

    return assignments;
}
```

A lot is going on with this function and even more in the supporting functions but hopefully seeing the code above gives a sense of how it works. The contract is quite simple. A collection of subscriptions comes in the method and you must return a collection mapping consumer ids to a list of topic partitions. How you get there can happen however you would like.

As mentioned above there are a lot of details glossed over in the above description of the implementation. If you want to find out more you can dive into all the code in the following repository.

[https://github.com/kylec32/kafka-repartitioning-poc](https://github.com/kylec32/kafka-repartitioning-poc)

Running a quick test of our new assignor we do see that it works. When weights are equal we get roughly equal distribution. When running a 100 partition topic with three consumers of weights 900, 90, and 10 we get the distribution of topics of 90, 9, and1 which perfectly matches the weights we assigned.

### Wrapping Up

I think the way that the Kafka developers have designed this is very well designed. There are places where issues can occur with this rebalancing setup but they are making continual improvements which is great. I also really appreciate the ability to design your own assignor. I have yet to find a reason to legitimately do that in a production application but knowing the capability is there is great. The Kafka Streams developers have taken advantage of this and built one purpose-built for running a Stream application so there are examples out there. As with most of my deep dive posts, you don't need to know this information to take advantage of all of this but I think it is extremely beneficial to have an understanding of this for when things go wrong and for understanding when you are using the system wrong.