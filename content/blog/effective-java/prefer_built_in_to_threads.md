---
title: Effective Java! Prefer Executors, Tasks, and Streams to Threads
description: A dive into chapter 80 of Effective Java
date: 2021-11-12
hero_image: https://miro.medium.com/v2/resize:fit:720/0*mNsziXxNlmBWPCka
tags:
  - java
  - effective java review
  - design
  - architecture
---

Eventually, it seems that every developer will be presented with a problem that requires some kind of _work queue_. These work queues can be used to store a collection of tasks to be worked in some order and move on. Although the concept of these work queues may be simple, actually developing one of these in a safe, performant manner can be tricky and error-prone. Thankfully we have a solution built right into the Java language. 

Within the `java.util.concurrent` package we have the _Executor Framework_ which is a flexible framework based on separating the work to be performed, a _task_, from the unit of execution, the _executor_. Let's look at a very simple use of the Executor framework:

```java
ExecutorService executor = Executors.newSingleThreadExecutor();

executor.execute(runnable);

executor.shutdown();
```

The steps usually follow that model above: create the right type of executor for what you are trying to accomplish, add work to it, then shut it down (don't forget that last part as your JVM likely won't shut down in that case). 

This simplest case is not all you can do. You can wait for a task to finish, you can wait for any or all of a group of tasks to finish, you can wait for the executor to finish, you can retrieve the results of your asynchronous tasks, you can run particular tasks on a schedule, and more. 

In the above example, we used a single-threaded executor, in case you need more threads than that you can use a different factory method and configure what you need. Changing from using one thread or multiple, the rest of the code will stay the same. There are a number of options and which one is going to be best is going to be based on how busy it's going to be, what kind of work it will be doing, and what environment you are running in. In short, there isn't a one size fits all solution. Take a look at what your options are and choose which one fits your use case the best. 

One of the things the executor framework allows you to do is to avoid working directly with `Thread`s. Threads are fairly error-prone to work directly with so having this abstraction layer on top of them can greatly simplify working with them and make it much safer. The executor interface takes two different types of tasks that are fairly closely related. The first is a `Runnable`, this is a task that doesn't have a return value, and then you have a Callable which can have a return value and can throw an arbitrary exception.

From Java 7 onwards the Executor framework has also extended to support fork-join tasks. These are a special kind of job where a particular piece of work is split between a number of executors that can steal work from each other in order to stay busy. One of the more recent enhancements to the Java language, parallel streams, is built on the fork-join pool that the executor framework provides. This makes it a little easier to work with but still comes with its own caveats and pitfalls. 

There is a lot one could dig into when considering all that the executor service can do but even this simple introduction I hope can raise awareness of it so that when you may be tempted to reach for a `Thread` you can instead look deeper into this framework. 