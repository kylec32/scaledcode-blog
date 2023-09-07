---
title: Effective Java! Optimize Judiciously
description: A dive into chapter 67 of Effective Java
date: 2021-07-01
tags:
  - java
  - effective java review
  - design
  - architecture
---

There are a number of sayings that have grown in popularity in the technical industry:

> We _should_ forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil
- Donald E. Knuth

> We follow two rules in the matter of optimization:
Rule 1: Don't do it.
Rule 2: (for experts only) Don't do it yet--that is, not until you have a perfectly clear and unoptimized solution
- M. A. Jackson

It's pretty clear that there are major concerns with optimizing applications early. A root of a lot of these concerns is that when trying to optimize we can often do more harm than good. This harm can be lower maintainability, unreadable code, or even worse performance. In the grand scene of things the benefit we have is that when we write well architected code we often end up with more performant code. Even when we don't start off with more performant code, the well architected code can allow the actual helpful optimization to be written. 

Even though well architected code often does lead to more performant code there are some decisions we can make that can paint ourselves in a corner. These decisions would be largely where we make decisions that affect the performance of the API itself. Examples of this would be returning mutable collections or values from a method requiring copies to be made, using inheritance which ties your implementation to it's parent's class, or returning too much unnecessary data when a more scoped call could be used. Your API becomes your contract, a bad contract design can cause issues for the foreseeable future. It's best to get these decisions correct from the outset. 

After making a solid design and designing your API correctly you may still find that the performance of your code is not to your liking. How do you know what to optimize though? If you just try to guess at what is slow you are likely to make a wrong guess. This is where tools such as profilers are invaluable. Profilers can highlight the code paths that are problematic and also help you understand if your code changes are actually making a difference. Another tool that can help determine if code changes are making positive benefits to your code is to use the Java Microbenchmark Harness (JMH). This tool provides a framework to write benchmarking tests that help you gain visibility into the performance of specific code paths. 

The Java virtual machine (JVM) has been extremely optimized over decades of time. This allows it to take lots of different code and come up with an optimized executable code. Often it is in the best interest to just trust the virtual machine off the bat and only optimize once we know concrete items to focus on and fix. 

