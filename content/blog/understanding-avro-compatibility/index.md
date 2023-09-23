---
title: Understanding Avro Compatibility
description: Digging into the different compatibility levels of Avro that can be used and what they actually mean.
date: 2022-02-07
hero_image: ./avro_compat_hero.jpg
tags:
  - avro
  - kafka
  - schema
  - design patterns
---

I have recently been working more and more with [Avro](https://avro.apache.org/docs/1.11.1/) as a data-interchange format. Avro aims to provide a format that has rich data structures, a fast and compact binary format, integrations with many languages out of the box, and even a remote procedure call (RPC) capability. Avro is a format very similar in spirit to Protobuf, Thrift, MessagePack, etc. They all have fairly similar design goals and just accomplish their tasks slightly differently. Because Avro is the de facto standard serialization frameworks for Kafka I have had the opportunity to work with it in that environment. The Avro schema definition is core to the design and functionality of Avro. One of the pieces of functionality that Avro provides and can enforce is compatibility between different versions of a particular schema. It is this compatibility mechanism that this post is about.

In [Confluent's schema registry documentation](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html) there is a great chart detailing the different levels of compatibility that Avro has and what it can mean for the order of upgrading producer and consumer code in an application that passes messages back and forth that are Avro formatted. Because this was created by Confluent, the idea is that you would be passing these messages over Kafka but even if you aren't using Kafka, you will always have a system writing (producer) and a system reading (consumer) when you are using Avro. Maybe that will be the same version of the same piece of software, in that case you don't need to think about this, but many times you will need to have a different application read a message than wrote it or even an updated version of a system read data it wrote previously. In all these cases, knowing how the compatibility levels break down can be useful.

{% image "./avro_compatability_chart.png", "Chart of Avro Compatibility From Confluent's Documentation" %}

The "none" compatibility level is the easiest to code against because there are no requirements. That said, it comes with no guarantees that the data you write today will be readable by the code you have tomorrow. If all you are after with Avro is a fast, binary data exchange format then this could be a reasonable choice. However, if you need to have some level of compatibility you need to dig into your business requirements to understand what is required. The remaining compatibility levels break down into three buckets: backward compatibility, forward compatibility, and full compatibility. Let's discuss the differences.

## Backward Compatibility

You would use this compatibility level when you are looking to evolve your schema and you can always make sure that the consumers will upgrade first. Only after all consumers of messages have the latest schema can you start to upgrade the producers without issue. This level also limits what changes you can make to a schema. One limit is that if you want to add a field it must come with a default thus making it optional. Since this compatibility level requires consumers are the first one upgraded, the consumer will simply get the optional value for the field until the producer-side starts sending messages with the field populated.

> **What does "optional" mean?**


> When a field is referred to as optional that means it is defined with a default value to be used if one is not provided. That may mean there is a reasonable default for the value, for example, if you are adding a "number_of_likes" attribute to a schema it may be reasonable to default that to 0. It also may mean that we create a union type with the expected type and `null` and default to `null`. (`null` would need to come first in the union since the default value of a union type must be of the type of the first element in the union.)

With this compatibility strategy you are free to delete whatever field you would like (required or optional) from the consumer service. Since this field is not requested to be read Avro will simply skip it on deserialization.

## Forward Compatibility

Unsurprisingly, forward compatibility is the opposite side of backward compatibility. If you instead can ensure that the producer side will be the first to upgrade to a new schema, this will be the compatibility level you will choose. This also comes with the opposite abilities as backward compatibility. You can now add optional and required fields at will but can only delete optional fields.

## Full Compatibility

Finally, we have full compatibility. This is the most strict of the options but also frees up the implementer to upgrade the consumer and producer side in whatever order they please and even have a mix of versions used on the producer and consumer side. On the flip side of this increased flexibility, we get to the part where we have to pay for this flexibility. This comes in what we are allowed to do with our schema and still keep them compatible. We now can only add or remove optional fields. This puts a much higher burden on the initial state of your schema as you are unable to delete anything if it is not already optional. You also cannot later decide that there must be a field now because it wouldn't make business sense not to have it but instead can only add a field as optional and likely your required checks would have to live at the application level, not the Avro level.

## Transitivity
An observant reader will realize that I have covered only four of the compatibility levels described above and skipped the levels ending with `_TRANSITIVE`. What the transitive modifier adds to the equation is that it applies the compatibility checks not only to the previous version and the current version but all the way to the end of that schema. So for backward compatibility that means your new schema must be compatible with all versions of that schema since the beginning. For forward compatibility it means that all systems using a previous version of a schema should be able to read its next version. And for full compatibility that means that any producer or consumer on any version of the schema will be able to read the other side's messages (or write messages readable by the other side) on any version. From a compatibility standpoint, you can see how something like `FULL_TRANSITIVE` is alluring because it leaves you wide open to deploy systems in whatever order and read messages that have been written whenever. This also is extremely helpful when reading Avro serialized data stored for future usage rather than using it simply to pass messages. This of course does also ratchet down what you can do with your schema and keep it compatible so you have to choose which side of the equation you want to fall on.

## Other Points Of Consideration

While these technically fall into the rules described above they may still surprise you so they are worth listing:

* Regardless if it has a default, if you add a new symbol to an enum type it must be added to the reader side first. If you would like to remove a symbol it must be removed from the writer first. Because both of these requirements can't be satisfied at the same time, you can't make enum symbol changes at the full compatibility level.
* For backward compatibility you can add new types to a union of types but you can't remove them, with forward compatibility you can remove types out of a union but cannot add them. With full compatibility, you cannot add or remove from a union.
* Aliases are useful for enabling the renaming of fields in a backward compatible way. Of note, aliases can not help keep forward compatibility or full compatibility.

There are a lot of considerations to be made when deciding the compatibility level that you want to run. Many of these will be driven by business requirements and what parts of the system are driving changes to the schema. Even if you obey the schema compatibility rules, it is worth considering that schema evolution in Avro requires that you provide the schema used for writing the data and the schema that will be used to read the data at deserialization time. This can be quite a tricky proposition and is usually where a schema registry comes into play. This will be a topic for another post.