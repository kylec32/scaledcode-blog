---
title: Effective Java! Design Interfaces for Posterity
description: A dive into chapter 21 of Effective Java
date: 2020-04-15
tags:
  - java
  - effective java review
  - design
  - architecture
  - interfaces
---

Today we are focusing again on interfaces. The focus of today's chapter was largely on a feature that was added in Java 8, _default_ methods. The problem that _default_ methods try to solve is, before Java 8, once an interface was released to the wild you could never change it safely. If you did, the classes that implemented it would encounter an error as they would no longer be implementing the full interface. So how do _default_ methods attempt to solve this problem? What they allow us to do is provide a default implementation for a particular method so we can evolve an interface without requiring the consumer of the service to implement that method right away.

This sounds like a great idea and it can be a great tool but what should we be aware of when using a _default_ method? The main concern is that we don't have a guarantee that our default implementation will work with all the implementations of the interface. An example of how this can bite us is with the `removeIf` _default_ method added to the `Collection` interface in Java 8. This method takes in a `Predicate` and it iterates through the collection and calls remove on all the entries that match the predicate. This seems like a simple, logical implementation and it does indeed work a lot of the time. However, for example, in the Apache Commons library there is a `SynchronizedCollection` which implements the `Collection` interface and basically forwards all requests onto a backing collection after locking on the object. This method does not override the `removeIf` function and thus inherits the default implementation. However, this default implementation of `removeIf` breaks the invariants of the class since it doesn't lock on the object.

This chapter ends up being pretty short and simple, the summation of the chapter is as follows, even though we have default methods as a tool in our tool belt, we shouldn't count on using this ability. Just like when we are implementing classes for inheritance we should try implementing multiple classes off the new interface and also consider having another person implement a class off your interface. This allows us to get experience with using the interface and we can see if there is something missing or if there is unneeded items in our interface. So, although we may be able to fix some mistakes after the fact with default methods, we shouldn't count on that and put in the work to build it right the first time. 
