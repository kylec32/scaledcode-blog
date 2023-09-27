---
title: Performance Differences of Java Streams
description: A benchmark comparison between different collection grouping in Java across different Java versions.
date: 2022-07-18
hero_image: ./streams-hero.jpg
tags:
  - performance
  - java
  - Benchmark
  - Clean Code
  - Java Streams
---

Recently I was working on a piece of functionality where we ended up with a collection of items that each had a status of if they had been successfully handled or not. At this particular part of the application, we needed to do certain actions on items that were successfully processed and something else on those that had failed. The original code looked something like the following:

```java
List<String> failedItems = targetList.stream()
                    .filter(record -> record.getResult() == ProcessingResult.FAILURE)
                    .map(record -> record.getEntity().getId())
                    .collect(Collectors.toList());

// Handle failed items

List<String> successfullyProcessedItems = targetList.stream()
                                    .filter(record -> record.getEntity().getId())
                                    .map(record -> record.getEntity().getId())
                                    .collect(Collectors.toList());
// Process successful items
```

During the [code review](/tags/code-review/) for this change, the discussion came up about if we could still use Java streams but only loop through the result collection once. That led us to write something along the lines of the following:

```java
var resultsGroupedByResult = targetList.stream()
                        .collect(Collectors.groupingBy(EntityWithResult::getResult,
                        Collectors.mapping((record) -> record.getEntity().getId(),
                                            Collectors.toList()));
// Process failed items.
// Process successful items.
```

This is no doubt terser than the original solution and did serve the purpose of only streaming over the input collection once. We were also quite sure it would be more performant. That said, we decided that the performance improvements were not going to be worth the readability costs the group by solution brought with it. In the majority of my work, I will almost always choose readability over performance. All that being said, we were interested in what the performance difference ended up being so we decided to run a benchmark against the different implementations across different collection sizes. The results were quite interesting.

<div align="center">

**Number of Items**|**Method**|**Throughput Ops/ms**
:-----:|:-----:|:-----:
25|Group By|1,741.89
25|Double Loop|2,337.535
1,000|Group By|54.75
1,000|Double Loop|77.319
50,000|Group By|1.085
50,000|Double Loop|0.963
250,000|Group By|0.167
250,000|Double Loop|0.14
1,000,000|Group By|0.041
1,000,000|Double Loop|0.035

</div>

It turned out for small collections that the group by was actually slower than streaming over the list twice. From our tests it looked like the flip from the double stream to the group by being more efficient happens somewhere between 1,000 and 50,000 items. Knowing that our result set would always be less than or equal to 25 we not only decided that the readability was better but we had given ourselves confidence that our original solution was more performant than the group by anyway.

Finding this interesting we decided to dig a little further to see if previous or newer versions of Java would have different results. These are our results.

<div align="center">

**Java Version**|**Number of Items**|**Method**|**Throughput Ops/ms**
:-----:|:-----:|:-----:|:-----:
Java 17|25|Group By|1,840.462
Java 17|25|Double Loop|2,432.982
Java 8|25|Group By|2,481.166
Java 8|25|Double Loop|2,370.741
Java 17|1,000|Group By|55.222
Java 17|1,000|Double Loop|47.378
Java 8|1,000|Group By|78.105
Java 8|1,000|Double Loop|59.908
Java 17|50,000|Group By|1.09
Java 17|50,000|Double Loop|0.918
Java 8|50,000|Group By|1.583
Java 8|50,000|Double Loop|0.909
Java 17|250,000|Group By|0.206
Java 17|250,000|Double Loop|0.171
Java 8|250,000|Group By|0.25
Java 8|250,000|Double Loop|0.159
Java 17|1000000|Group By|0.041
Java 17|1000000|Double Loop|0.041
Java 8|1000000|Group By|0.064
Java 8|1000000|Double Loop|0.042

</div>

There are many interesting things to pull out from this one. The first is that, in Java 8, the group by implementation was faster than the double stream solution. I see in many benchmarks that Java 8 is often faster than later versions of Java. This feels backward from what I would expect we would want but there is more to this story I expect. Another interesting thing is that the point where group by outpaces the double stream comes sooner in Java 17 as we see this even with a collection of 1,000 items. I also find it interesting that in the 1,000,000 items test Java 17 ends up with the same performance with the group by and the double stream. So it seems like potentially the group by functionality was improved between Java 11 and Java 17. However, it does look like there might be some degradations between Java 8 and Java 11. More investigation would be needed.

The final test I want to run was one more implementation that didn’t use streams at all and instead just used regular old loops and one that kept more control inside our code. That implementation looked like this:

```java
List<String> failedItems = new LinkedList<>();
List<String> successfullyProcessedItems = new LinkedList<>();

for (int i=0; i<targetList.size(); i++) {
    if (targetList.get(i).getResult() == ProcessingResult.SUCCESS) {
        successfullyProcessedItems.add(targetList.get(i).getEntity().getId());
    } else {
        failedItems.add(targetList.get(i).getEntity().getId());
    }
}

// Process failed items.
// Procss successful items.
```

This still doesn’t take that much code but potentially would take a moment to process through it to understand what is going on. I do like the streams API where things are more declarative and thus can be easy to see what is being done. So what were the results?

<div align="center">

**Number of Items**|**Throughput**
:-----:|:-----:
25|5,534.454
1,000|122.58
50,000|2.096
250,000|0.376
1,000,000|0.09

</div>

This represents a 2–3x improvement over our other improvements. There are a lot fewer allocations of memory and we are only looping through once so there are many ways this is better. Just proof that you don’t need to have fancy code to make it performant. While I find the first double system system the most readable, every solution comes with trade-offs. You just need to decide what trade-offs you are most happy with.

There are a lot of interesting things to be learned when benchmarking code. While I imagine that people spend more time worrying about performance than they probably should, having the tools and knowledge in your toolbelt to solve these problems can pay dividends in your work.

The JMH tests used for the testing can be found in the repo below.

[https://github.com/kylec32/java-streams-groupby-performance-tests](https://github.com/kylec32/java-streams-groupby-performance-tests)

*Tests were performed against: Amazon Corretto 17.0.2, Amazon Corretto 11.0.7, and Amazon Corretto 8.252.09.2. Your results may vary.*