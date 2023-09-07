---
title: Effective Java! Prefer Side-Effect-Free Functions in Streams
description: A dive into chapter 46 of Effective Java
date: 2020-10-12
tags:
  - java
  - effective java review
  - design
  - architecture
---

As has been discussed in previous chapter reviews, streams can greatly shorten our code into very terse expressions. There are two sides to this coin. There is the side of simplified code that gets right to the point and there is also the denseness of the code. Many developers, especially those without a functional programming background, can find themselves on the dense, hard to understand side when it comes to streams. If this explains your feelings towards streams, keep up the faith, in time the pattern will come to you. What today's topic covers will help use streams in the way they were intended and thus not have to fight against them. 

As discussed before, streams are a processing pipeline, this is a powerful concept when used correctly, when used incorrectly it can make the use more confusing and harder to reason about, even hide bugs. So what is the right way to use streams? This largely comes down to using _pure functions_ with streams. A _pure function_ is one that simply operates on it's input and provides an output, it doesn't use any data from outside the function and doesn't affect anything outside of the function. 

As is often our pattern, let's look at an example that goes against this advice. In this case a program that builds a frequency table of words from a file. 

```java
Map<String, Long> frequency = new HashMap<>();
try (Stream<String> words = new Scanner(file).tokens()) {
  words.forEach(word -> frequency.merge(word.toLowerCase(), 1L, Long::sum));
}
```

This code is simple, it's terse, and it gets the job done so what could be the problem? This isn't stream code. This is iterative code using the stream API. Simply put, all that we get from the stream API here is added confusion. The `forEach` function can feel very comfortable for a developer that has worked with iterative code before when starting with the streams API when used this way. Let's now look how we could use the stream API with stream processing code:

```java
Map<String, Long> frequency;
try(Stream<String> words = new Scanner(file).tokens()) {
  frequency = words.collect(groupingBy(String::toLowerCase, counting());
}
```

So what are the notable differences here? The code ends up being shorter but also clearer with defining what should happen rather than how it should be done. In this case collect the words by their lowercase version and set the value as the count. Compare this againstg the `forEach` version which is inherently iterative and does not lend itself to pipeline and parallel processing, the `foreach` function should be used simply for reporting on the results of the pipeline processing and not to do the actual business logic processing. 

You will find yourself using the `collect` terminal function in varying ways and we can't go into all of them in this blog post but it can be useful to go over them at some point to know what is possible. Much like the functional interfaces you will likely not be able to memorize all of them but knowing the types of things there will help you remember what functions to use when the time comes. There are methods to create collections of all types from lists, to maps, to sets, and everything in between. There are specializations of basically all of these functions that give you more control if you need it as well. 

While this chapter focuses on the terminal node in a stream, that is not the only place that we need to be worried about no-side effect actions. For example, I have seen code before that took a stream of JPA entities, and then updated them as part of a stream. While this code looked very good and seemed very clean it was extremely inefficient as it was open and closing connections and acting on one row at a time rather than as sets like is most efficient in an SQL system. 

It will take some practice to get used to handling streams in a proper pipeline processing manner but as you learn this mode it will become clear the power that it provides and what you can accomplish using this pattern. 