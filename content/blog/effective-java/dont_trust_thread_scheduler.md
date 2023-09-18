---
title: Effective Java! Don't Depend on the Thread Scheduler
description: A dive into chapter 84 of Effective Java
date: 2021-12-16
hero_image: https://miro.medium.com/v2/resize:fit:720/0*U7wZtF9ItUypmLuQ
tags:
  - java
  - effective java review
  - design
  - architecture
---

Even on modern systems that have many CPU cores and thus can be concurrently executing multiple threads, they are likely no match for the number of threads in a runnable state on a system. For this reason, we have the _thread scheduler_ which determines which threads will run and for how long. Implementations of thread schedulers strive for equality in how they treat threads but their exact semantics vary from implementation to implementation. This being the case, relying on the particular semantics of a thread scheduler is not wise and can lead to unexpected behavior on different systems and non-portable code. 

A good plan for having a robust, responsive application is to aim for the number of runnable threads to be, on average, the number of cores your system has. Of note, this is aimed at _runnable_ threads and not simply threads that exist. Runnable threads are threads that are ready to do work and that are not in a waiting state. Threads in a waiting state are easier for the thread scheduler to reason about because they aren't requesting to be run therefore they won't be scheduled. That's not to say there is no cost to having waiting threads but those aren't being discussed in this topic because they aren't related to the thread scheduler. 

The simple rule of thumb is that any runnable threads should be doing useful work and not simply running to keep themselves scheduled. Threads should also keep their work short (but not too short thus spending all of its time in dispatching overhead). At its core, this means your threads should not be busy-waiting. While busy-waiting can be an advanced technique that can be used in some specific circumstances they are rare and likely not what you are wanting. Busy waiting just wastes CPU cycles while not progressing the work of the application. Let us look at an example of an extremely poor CountdownLatch implementation. 

```java
public class BadCountDownLatch {
  private int count;

  public BadCountDownLatch(int count) {
    if (count < 0) {
      throw new IllegalArgumentException(count + " < 0");
    }
    this.count = count;
  }

  public void await() {
    while (true) {
      synchronized(this) {
        if (count == 0) {
          return;
        }
      }
    }
  }

  public synchronized void countDown() {
    if (count !=0) {
      count--;
    }
  }
}
```

This implementation underperforms the built-in implementation by 10x when 1,000 threads are waiting on the latch. While at first glance this implementation may look like something that wouldn't be written, it comes up much more than it should.

When presented with an application that has issues due to thread scheduling one might be tempted to "fix" the issue by calling `Thread.yield` on the problematic thread. Even if this works in your case it is not guaranteed to work in other cases. There are no testable semantics to the `yield` function. A much better reaction to this issue would be to restructure your application to correctly handle the concurrent runnable threads it has.

Another technique that you may be tempted to use is Thread priorities. These again don't have testable semantics and have different implementations on different systems and JVMs and thus should not be used to attempt to fix issues.

Summing this topic up, do not rely on the thread scheduling algorithm of your JVM to provide correctness to your application. This includes relying on `Thread.yield` and thread priorities. Instead, strive to keep the number of runnable threads to around the number of executable processes your system can run concurrently.