---
title: Effective Java! Document Thread Safety
description: A dive into chapter 82 of Effective Java
date: 2021-12-01
tags:
  - java
  - effective java review
  - design
  - architecture
---

Users of classes you write need to know how they behave. One of the attributes of your class that a user needs to know is whether the class is thread-safe or not. Outside of this documentation a user of the class needs to guess about the class's thread-safety. This can lead either to excessive synchronization or insufficient synchronization which can lead to invariant issues. 

It is important to know that thread-safety is not black and white. There are levels of thread safety. 

* *Immutable objects* - Since there is no mutable data inside of an immutable object they are inherently thread-safe. Examples of immutable objects are: `String`, `Long`, and `BigInteger`
* *Unconditionally thread-safe objects* - These objects are thread-safe in all usages. This can make them simple to use as all operations on the object can be considered thread-safe and we don't need to account for the differences between methods. Examples of unconditionally thread-safe objects are `AtomicLong` and `ConcurrentHashMap`.
* *Conditionally thread-safe objects* - These objects include both thread-safe and thread-unsafe functions depending on what part of the object you are interacting with. These objects need great documentation to help the users of the objects to know where external synchronization may be required. An example of this would be the `Collections.synchronized` wrappers that synchronize much of interactions with the object but do require external synchronization of `iterators` returned.
* *Not thread-safe objects* - The objects contain mutable data and make no effort at synchronization. If a user of one of these objects would like to use it in a concurrent way they must bring their own synchronization. There are many, many examples of these types of objects such as `ArrayList` and `HashMap`.
* *Thread-hostile* - These objects are often not implemented this way on purpose and are unsafe to use even if you perform perfect external synchronization. The most common way this can occur is through the unsafe interaction with `static` values. 

As noted above, documenting a conditionally thread-safe class requires care. You must not only indicate that the class is not completely thread-safe but what locks must be obtained to make its non-thread-safe methods thread-safe. For example, let's look at the documentation for `Collections.synchronizedMap`:

```
It is imperative that the user manually synchronize on the returned map when iterating over any of its collection views:

  Map m = Collections.synchronizedMap(new HashMap());
      ...
  Set s = m.keySet();  // Needn't be in synchronized block
      ...
  synchronized (m) {  // Synchronizing on m, not s!
      Iterator i = s.iterator(); // Must be in synchronized block
      while (i.hasNext())
          foo(i.next());
  }
 
Failure to follow this advice may result in non-deterministic behavior.
```

Thread-safety documentation usually belongs in the class level documentation but if a specific method has special concerns the documentation can also live there. Documenting the thread-safety of static factories (like in the `Collections.synchronizedMap` example above) is also a good idea.

When a class uses a publicly accessible lock it can initially feel like it is enabling clients of the class more control. However, this flexibility can come at the cost. This is because it is incompatible with high-performance internal concurrent controls such as those used in `ConcurrentHashMap`. It also opens yourself up for a client holding the lock for a long time either accidentally or intentionally. In either case, it can lead to serious problems. 

Alternatively, we can use a private lock object in our synchronized methods.

```java
private final Object lock = new Object();

public void bar() {
  synchronized(lock) {
    ...
  }
}
```

There are a few things we can learn from this example. By marking the object as private we protect ourselves from someone external to our class holding the object for too long. We also mark it as `final` protecting ourselves from accidentally reassigning it and from subclasses changing it as well. Even when using locks from the `java.util.concurrent.locks` package we should always make them `final`. 

As convenient and beneficial as this private lock pattern is, we can only use this method when writing _unconditionally thread-safe objects_. When writing a conditionally thread-safe object we are unable to do this because we have to provide the user of the class a handle to hold a lock when doing operations on the non-thread-safe parts of the object.

Thread-safety can be a tricky problem within an application. It becomes much more difficult when the classes we are using haven't documented what level of thread-safety they have implemented. There is no right or wrong level of thread-safety, different types of behavior can lend themselves to different levels of thread-safety. No matter the level we can document their status. Remember to make all your lock objects `final` and when possible also `private`. By following these guidelines we can mitigate some of the difficulty out of working in a concurrent environment.  