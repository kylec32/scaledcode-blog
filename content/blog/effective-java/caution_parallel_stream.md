---
title: Effective Java! Use Caution When Making Streams Parallel
description: A dive into chapter 48 of Effective Java
date: 2020-10-26
tags:
  - java
  - effective java review
  - design
  - architecture
---

While nowadays there are many great languages with useful mechanisms to enable safe concurrency like channels in Rust and Go, Java has historically had solid support for enabling concurrency in your code. As time has gone on the mechanisms built in the language to allow safe concurrency have grown. This is no different in Java 8 with streams. By simply adding a processing node of `parallel()` as part of the stream we can have Java take over the heavy lifting and we can write our stream like normal (at least it feels that way) and Java will handle the necessary splitting of inputs and combining at the end. Alas, we don't have a free lunch here though. We can't simply throw `parallel` into our streams and expect everything to be better. 

The issues with streams and concurrent programming aren't really different than concurrent programming using other tools in Java. There are cases where it can be of great use and there can be places where it will cause new problems with zero benefit. That being said there are some heuristics that can be used to identify in which cases a parallel stream can be useful. For example, streams that are creating infinite streams with `limit` processing nodes. This can lead to un-halting code as the code tries to figure out how to properly handle it. Another thing to keep in mind is what the terminal operation of the stream is. If it's a collector, that doesn't lend itself to parallelization as much as, for example, a reduction operation. Another challenge of parallel streams is that by default they use the default system fork-join pool. Even if in your testing you see good improvement with your use of a parallel stream, it can have horrible results in production where the code can run multiple times in parallel. What can happen is that all the work can queue up waiting for an open thread and you can end up with much decreased performance as a result. While you can provide a thread pool for just a specific operation then you are ending up with a number of largely unused threads.

So there seems to be a lot we are up against when using parallel streams. This indeed is the case, no one said parallel programming would be simple. So what are some use cases where this can be useful. As with all parallel processing problems there needs to be a sufficiently large amount of work to be performed by each thread. For example, I have had good experience with using a parallel stream before where, as part of my stream, there were HTTP requests being made to gain further information about the data. This was a very IO bound operation that allowed multiple requests to be sent in parallel thus vastly speeding up the operation. HTTP requests are not the only large amount of work that that be performed. The only way to know if your code will benefit from a parallel stream is to try it out in the different environments.

Really the key to working with parallel streams is to treat it like any other parallel programming. Test it out, only use it when each thread gets a significant amount of work, and keep this useful tool in your toolbelt. 