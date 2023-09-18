---
title: Effective Java! Prefer Concurrency Utilities Over wait and notify
description: A dive into chapter 81 of Effective Java
date: 2021-11-19
hero_image: https://miro.medium.com/v2/resize:fit:720/0*eSNNU57TfcLdDtZV
tags:
  - java
  - effective java review
  - design
  - architecture
---

At the core of each `Object` in the Java language there are three methods, `wait`, `notify`, and `notifyAll`. These methods allow you low-level concurrency control options. Up until Java 5, this was the go-to option for facilitating concurrency control. However, since the release of Java 5 (in 2004) there are now higher-level tools that can be used that are much easier and less error-prone. This being the case, in new code, we should be using exclusively these provided concurrency utilities. 

The `java.util.concurrent` provides three different kinds of utilities. The first is the Executor framework discussed in a previous item, concurrent collections implementations, and synchronizers. 

The concurrent collections provided by the Java language are high-performance concurrent implementation of the common collection interfaces (`List`, `Queue`, and `Map). These collections bring their own concurrency controls and thus don't need (and shouldn't be) externally synchronized. At times these collections provide lock-free implementations of functions and the fact that the user of the collection doesn't need to know how the implementation works is great.

Because these concurrent collections sometimes need to do multiple actions (because they are state-dependent) atomically they provide functions to facilitate this. These methods can be extremely useful so in Java 8 many of these functions were provided on the main Collection interfaces. One example of this is `putIfAbsent(key, value)`. We could use this functionality to develop a `Strin.intern` implementation.

```
private static final ConcurrentMap<String, String> map = new ConcurrentHashMap<>();

public static String intern(String s) {
  String previousValue = map.putIfAbsent(s, s);
  return previousValue == null ? s : previousValue;
}
```

This is pretty efficient and concise but we can make it even more performant but using the knowledge that `get` operations are optimized in `ConcurrentHashMap` and write the following:

```
public static String intern(String s) {
  String result = map.get(s);
  if (result == null) {
    result = map.putIfAbsent(s, s);
    if (result == null) {
      result = s;
    }
  }
  return result;
}
```

This new implementation is actually faster than the built-in `intern` function (although it doesn't take into account some of the memory management jobs that the built-in `intern` function must perform).

These built-in concurrent capable collections effectively obsolete the built-in synchronizing collection operations (`Collections.synchronizedMap` etc). Simply replacing one of these usages with its concurrent counterpart is likely a great performance benefit. These concurrent collections are even used internally by the concurrent package to facilitate its work like the `BlockingQueue`'s usage in `ThreadPoolExecutor` as discussed in the previous item. 

Another type of concurrent utility provided by the `java.util.concurrent` package is _synchronizers_. These are objects that allow one thread to wait on another thread. Although this is a fairly basic concept it can be used powerfully. The most common synchronizers are the `CountdownLatch` and the `Semaphore` but there are also more advanced synchronizers like the `CyclicBarrier`, `Exchanger`, and `Phaser`.

Let's look a little more into `CountdownLatch`. This class serves as a single-use barrier that allows threads to wait on one another before proceeding. The class takes an `int` in its constructor of the number of times its `countdown` method must be invoked before it unblocks the threads waiting on it. Using this class let's build a simple timer function that has all threads initialize, wait until all are ready, start processing, and then stop and determine how long the process took. 

```
public static long time(Executor executor, int concurrency, Runnable action) {
  CountDownLatch ready = new CountDownLatch(concurrency);
  CountDownLatch start = new CountDownLatch(1);
  CountDownLatch done = new CountDownLatch(concurrency);

  for(int i=0; i<concurrency; i++) {
    executor.execute(() -> {
      ready.countDown();
      try {
        start.await();
        action.run()
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      } finally {
        done.countdown();
      }
    });
  }

  ready.await();
  long startNanos = System.nanoTime();
  start.countDown();
  done.await();
  return System.nanoTime() - startNanos();
}
```

In this example we use three different `CountdownLatch`s which can get a little muddy but it does keep things pretty separated. We have the `ready` latch that each thread checks in with and the main thread is waiting on. Once all threads check in the main thread starts the timer and triggers the `start` latch which all the worker threads have been waiting on. All the worker threads do their work and then check-in when finished via the `done` latch. The main thread is waiting on the `done` latch to open and then marks the finished processing time. 

Let's consider a few other things about this example. What would happen if we passed in a `concurrency` count that didn't match the number of threads? If it was too few we would end up prematurely starting our time and finishing our timer. If it was higher than our thread count then we would be deadlocked in what is known as a `thread starvation deadlock`. You will also notice that we catch the `InterruptedException`. By convention whenever this exception type is caught we should call `Thread.currentThread().interrupt()` to signal to the owner of the thread that the thread has been interrupted and allow it to handle that in whatever way seems fit. Finally, you will notice the usage of `System.nanoTime()` vs something like `System.currentTimeMillis()`. This is because it is more accurate and because it is unaffected by the system's real-time clock. It is also of note that, unless the `Runnable` represents a significant amount of work, this function won't return very interesting work. This is because even `System.nanonTime()` is not accurate enough for microbenchmarking. It is for this reason that tools like JMH exist for this specific purpose. 

This only begins to cover the utilities provided by the concurrent utilities built into the core language. Feel free to dig deeper into these utilities.

Even though there are better methods out there than using `wait` and `notify` directly we may need to maintain code that does use these functions. The `wait` method is, as the name suggests, used to make a thread wait for some condition. It must be invoked in a synchronized region that locks the on the method it is invoked. The colloquial usage looks like this:

```
synchronized(obj) {
  while(<condition does not hold) {
    obj.wait();
  }
  // perform action now that condition holds.
}
```

Things of note, we need to always call `wait` within a loop checking that the condition we are waiting for is true. If the condition we are waiting for is true and the `notify` or `notifyAll` method is called before the `wait` method is called there is no guarantee the thread will ever wake up. By putting the check in a loop we ensure safety. If the thread moves past the `wait` before the condition holds we lose the protection of our invariant. There are several ways that a thread can be woken up when the condition it is waiting for is not true. 

* Another thread could have also been notified and taken the lock.
* Another thread could have invoked `notify` incorrectly.
* The invoking thread could have triggered `notify` too early before it was actually ready.
* In rare circumstances, a waiting thread can be woken up even without a `notify` call.

One topic that comes up when discussing `wait` and `notify` is whether to use `notify` or `notifyAll`. As a reminder `notify` wakes up one waiting thread and `notifyAll` wakes up all waiting threads. Waking up all waiting threads is a safe, conservative choice. It will always guarantee you will wake up all threads that need to be awakened. You actually may be waking up more threads than you need to, but if you are properly checking on condition before proceeding after waiting, these additional threads that were woken up will simply go back to waiting. Using only `notify` could lead to a bit of an optimization but in the long run, it's not likely worth it. 

Simply put, `wait` and `notify` rarely need to be used in new code. By using modern concurrent utilities we can have much simpler code, safer code, and likely more performant. If we do find ourselves maintaining code that does use `wait` and `notify` we should be careful we are using the functionality correctly. Always check before proceeding, loop if the condition isn't met, and prefer `notifyAll` over `notify`.