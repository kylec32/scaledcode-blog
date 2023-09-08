---
title: Effective Java! Synchronize Access to Shared Mutable Data
description: A dive into chapter 78 of Effective Java
date: 2021-11-02
tags:
  - java
  - effective java review
  - design
  - architecture
---

This item starts a new section of _Effective Java_ that focuses on concurrency and tips and tricks around that topic. This first topic focuses on the use of synchronization. When Java developers think about synchronization they likely think of the _synchronized_ keyword. This is for good reason, this keyword is very useful. One of the main uses that Java developers reach for the _synchronized_ keyword for is to enforce _mutual exclusion_. Using the _synchronized_ keyword to enforce mutual exclusion allows different threads of an application to see a consistent view of the data. While this is very useful it's not the whole story of what the _synchronized_ keyword provides. 

The other part of synchronization is of ensuring that not only different threads see a consistent state, but also to ensure that threads entering the synchronized block see each other's changes to state. While the observant reader will note that the Java language specification guarantees that reading and writing variables will be atomic (unless it is a _long_ or _double) that actually isn't enough for two threads to see each other's changes without synchronization. 

While you will often hear that synchronization across threads can cause performance issues for an application this is often overblown and can lead to a developer avoiding the use of synchronization when it is required. Simply put, synchronization is required for reliable communication between threads as well as mutual exclusion. This all comes down to the memory model specified by the Java language specification in what it specifies what will be visible between threads. 

This will become clearer with an example. Let's consider a simple application where a thread is spun up and then the application exits about a second later. 

```java
public class StopThread {
  private static boolean stopRequested;

  public static void main(String[] args) throws InterruptedException {
    Thread backgroundThread = new Thread(() -> {
      int i =0;
      while (!stopRequested)
        i++;
    });
    backgroundThread.start();

    TimeUnit.SECONDS.sleep(1);
    stopRequested = true;
  }
}
```

This code seems reasonable. There is no synchronization but with the atomic nature, we may feel safe. Unfortunately this code actually never executes? How can this be possible though? Without synchronization,there is no guarantee when the background thread will see the changed value. Without synchronization it is fine for the compiler to change: 

```java
while(!stopRequested)
  i++;
```

to

```java
if(!stopRequested)
  while (true)
    i++;
```

This optimization, known as hoisting, is exactly what the OpenJDK Java VM does. This ends up causing a _liveness failure_ where the program fails to make useful progress. Let's look at our example with proper synchronization:

```java
public class StopThread {
  private static boolean stopRequested;

  private static synchronized void requestStop() {
    stopRequested = true;
  }

  private static synchronized bool stopRequested() {
    return stopRequested;
  }

  public static void main(String[] args) throws InterruptedException {
    Thread backgroundThread = new Thread(() -> {
      int i =0;
      while (!stopRequested())
        i++;
    });
    backgroundThread.start();

    TimeUnit.SECONDS.sleep(1);
    requestStop();
  }
}
```

You'll notice that both the read and the write side are synchronized. Synchronization is guaranteed to only work if both the read and write operations are synchronized. Of note, the StopThread class's actions are already atomic thus the synchronization above is strictly for synchronizing communication. Even though the above code does work there is another way we could write this code that would be more performant and less verbose. 

```java
public class StopThread {
  private static volatile boolean stopRequested;

  public static void main(String[] args) throws InterruptedException {
    Thread backgroundThread = new Thread(() -> {
      int i = 0;
      while(!stopRequested) {
        i++;
      }
    });
    backgroundThread.start();

    TimeUnit.SECONDS.sleep(1);
    stopRequested = true;  
  }
}
```

What we have here is the `volatile` keyword. The `volatile` keyword provides no mutual exclusion but it does guarantee that any thread that reads the marked field will see the most recently written value. Even when using the `volatile` keyword you can get yourself in trouble if you aren't careful. Let's consider the following code:

```java
private static volatile int nextSerialNumber = 0;

public static int generatedSerialNumber() {
  return nextSerialNumber++;
}
```

The idea behind this code is to return a unique value for each invocation. While the reads of `nextSerialNumber` are atomic the `++` operator is not. Using the `++` operator first starts with reading the value, increments it, and then saves it back. If a second thread reads the field between increment and write back this could lead to two threads receiving the same value.

There are a couple of ways to fix this. You could use the `synchronized` keyword on the `generateSerialNumber`. After doing this you can remove the `volatile` keyword as synchronization of the _volatile_ keyword is taken care of by the _synchronized_ keyword. Better than even the `synchronized` keyword solution is to use something like `AtomicLong` which is lock-free and thread-safe. For added measure, we should change the method to use a `long` instead of `int` and throw an exception before wrapping. 

A final method that can be utilized to facilitate state sharing is to only synchronize the process of passing the variables between threads. Other threads can read these _effectively immutable_ variables without further synchronization. 

As always, avoiding mutable state is going to be the best way for sharing state between threads. Immutable state makes many things easier. If immtuable state is not an option we do need to consider what synchronization is required. Without synchronization, in many cases, there is no guarentee of threads seeing each other's changes. The issues encountered can range from liveness failures, state issues, and safety failures. When communication is all you need and not mutual exclusion, the `volatile` keyword can facilitate this. Finally, consider using the options from the `java.util.concurrent` package as this can allow you to leverage best-in-class concurrent code without as much fuss. 