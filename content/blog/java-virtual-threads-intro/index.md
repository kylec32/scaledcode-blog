---
title: Java Virtual Threads, Millions of Threads Within Grasp
description: A dive into the Java 19 preview feature of virtual threads. What are they good for, what are they not good for, and more.
date: 2022-08-23
hero_image: ./virtual-threads-hero.webp
tags:
  - java
  - Threading
  - Project Loom
  - performance
---

Virtual threads in Java have been a long-awaited feature in the Java language and we are finally getting to play with it in as a preview feature of Java 19. Virtual threads were added in JEP-425 as part of Project Loom. The goal of Project Loom is to enable a high-throughput, lightweight concurrency model in Java, virtual threads are a core part of enabling that goal.

## Why are virtual threads important?

In the early days of Java, the original threading model was similar to virtual threads in that the threads were managed in user space and did not use OS threads directly. However, in version 1.2 of Java this was changed. The modern concurrency model is that `java.lang.Thread` objects are simply a thin wrapper around OS threads. This honestly has served the language well for many years. However. it does come with its issues.

The most common modern server threading model today is called "thread-per-request." In this model, a pre-allocated collection of handling threads are created for handling requests. While the Java server waits for a request the thread sits in the "parked" state where it takes no CPU resources. Once a request comes into the server, a thread is assigned to that request and that thread is dedicated to that request until it is fully processed. This threading model is pretty easy to get your mind around and thus is quite maintainable. The downside is that if you have 100 threads allocated for processing and an additional request comes in, the last one will need to wait to be processed. If all 100 allocated threads were continually processing there wouldn't be any additional capacity to handle that 101st request anyway so this feels reasonable. The problem is that in real applications threads are almost always waiting at some point. During this time of waiting nothing useful is being accomplished yet additional requests that could be getting processed are blocked.

So if our threads are waiting maybe we could just make more and more threads so that there are always requests available. This comes with several issues.

* An OS can only manage a finite number of threads.
* Creating and managing threads takes system calls to the OS which are slow.
* OS threads take a chunk of memory just by existing to store its stack (In Java this is 1MB)

For these reasons we can't just create as many OS (or "Platform" as they are called in the Project Loom world) threads as we want. Creating and managing threads is expensive and this is why we have the best practice of thread pools. We pay the thread creation and memory costs just once and reuse those finite threads over and over.

This all gets flipped on its head with virtual threads. Virtual threads are threads that are managed within the JVM. Because of this, the memory usage is extremely small and dynamic. There are also no costs for context switches since it is all done in user space. Finally, threads don't need to take a fixed size in memory and thus millions of virtual threads can be created within a particular JVM.

## How Do Virtual Threads Work

The best thing about virtual threads to me is how they were implemented. Looking through the history of Project Loom there were many options considered for how to implement the functionality. The solution they ended up with is impressive. Virtual threads are simply a new implementation of the same `java.lang.Thread` that we have been using for years. This means the transition to using virtual threads where it makes sense should be much easier than it would be if it was a whole new class with a different interface. This has required more work no doubt but I think it is worth it. Updates also needed to be made to blocking APIs to signal to the virtual thread infrastructure where control can be transferred. Perhaps counter to what you would assume, virtual threads don't know about blocking methods, blocking methods know about virtual threads and signal to virtual threads when they [are going to block](https://twitter.com/pressron/status/1529194803317055489). This has shown up in several refactor JEPs in previous Java releases and now we get some of that payoff.

There are some limitations compared to platform threads currently. These may change in the future but this is the current state.

* Virtual threads are always daemon threads. This means the JVM won't wait for virtual threads to finish before exiting.
* You can't set the thread priority on virtual threads.
* All virtual threads belong to a special "VirtualThread" thread group.
* The `stop`, `suspend`, and `resume` methods are not implemented on virtual threads.

Now that we have the virtual thread interface defined how do they work under the hood? Even though the JVM manages virtual threads, for them to be executed they need to run on an OS thread (platform thread). By default, the JVM will create a FIFO ForkJoin thread pool specifically for running virtual threads (this is different than the common ForkJoin thread pool that has existed for some time in the JVM). This thread pool will have the same number of threads as there are processors on the system you are executing the code (this is configurable though). The OS is in charge of scheduling the platform threads but the JVM is in charge of scheduling the virtual threads. All transfers between different virtual threads will happen when the code running in the virtual thread calls a blocking operation in the JDK API. When this happens the runtime performs a nonblocking OS call and automatically suspends the virtual thread until the blocking operation finishes. The platform thread (called a *carrier thread* in the documentation) that a particular virtual thread is scheduled on (or *mounted* to) may change throughout the lifetime of the virtual thread. There is no permanent relationship between a virtual thread and platform threads, only a temporary relationship as a particular virtual thread is run.

## Virtual Threads In Action

### Memory Usage

First, everyone talks about how you can create millions of virtual threads so let's try it. First, we will see what happens with platform threads.

```java
public class PlatformThread {
    public static void main(String[] args) {
        for (int i = 0; i < 1_000_000; i++) {
            if (i%10_000 == 0) {
                System.out.println(i);
            }
            new Thread(() -> {
                try {
                    Thread.sleep(Duration.ofMinutes(10).toMillis());
                } catch (Exception e) {
                    e.printStackTrace();
                }}).start();
        }
    }
}
```

While my machine doesn’t run out of memory executing this codes after 60k or so threads I just give up on the execution because it takes too long just to try to spin up the threads.

Compare this to the virtual thread option:

```java
public class VirtualThread {
    public static void main(String[] args) {
        for (int i = 0; i < 1_000_000; i++) {
            if (i%10_000 == 0) {
                System.out.println(i);
            }
            Thread.startVirtualThread(() -> {
                try {
                    Thread.sleep(Duration.ofMinutes(10).toMillis());
                } catch (Exception e) {
                    e.printStackTrace();
                }});
        }
    }
}
```

With almost identical code this completes spinning up the threads almost immediately!

### Improved Utilization

The previous example was interesting but not very useful. Let’s consider something more useful. I gathered the top 250 sites from the Alexa ranking list and I will have my computer access the landing page of each. This is much closer to a real type of application where there are interactions with web services doing a non-trivial amount of work while still being something we can grok quickly.

The core part of the implementation looks like this:

```java
public void process(ExecutorService executorService) {
    long startTime = System.currentTimeMillis();
    try (ExecutorService executor = executorService) {
        for (String url : getUrls()) {
            executor.execute(() -> {
                try {
                    new URL("https://" + url).getContent();
                    System.out.println("Finished processing: " + url);
                } catch (IOException e) {
                }
            });
        }
    }

    System.out.println("Processing time: "
                        + (System.currentTimeMillis() - startTime)/1000.0f
                        + " seconds");
}
```

The only difference between the platform thread and the virtual thread version is that the platform thread’s `ExecutorService` is generated with `Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors())` and the virtual thread’s `ExecutorService` is created with `Executors.newVirtualThreadPerTaskExecutor()` which, as the name suggests, creates a new virtual thread for each task passed to it.

Comparing the run time between the two systems on my machine I am seeing a 25–50% shorter execution time with the virtual threads. These are top websites and thus are quite quick to respond, even so, being able to fully utilize the waiting time with virtual threads results in impressive results.

### Is There Anything Virtual Threads Can Not Improve?

At this point it appears that there isn’t anything that virtual threads cannot improve. Understandably this is not the case. Virtual threads do not make your code faster (outside of the faster creation of threads but that is likely an insignificant part of your application’s run time). What it aims to do is improve your application’s *throughput*. So rather than making one specific processing path faster, it allows you to process more items in the same amount of time. You can think of this as virtual threads are great at *waiting*. If there is no waiting or blocking on something, for example, file I/O or the network, virtual threads will not lower execution time.

Let’s look at an example of this. For [this experiment](https://github.com/kylec32/JavaVirtualThreadsExperiments/tree/main/src/main/java/com/scaledcode/vthreads/primegeneration). we will calculate a certain number of prime numbers using a naïve, inefficient algorithm both using virtual threads and platform threads. Executing this code with both types of threads leads to almost identical results. Because the functionality is CPU-bound, and there are no points where a blocking call is made where control is yielded in the virtual threads, they behave almost identically.

It is worth noting that even though it is similar the behavior of platform threads and virtual threads in this case have a significant difference related to scheduling. With a platform thread where the OS is in charge of scheduling the threads, it will preempt a thread to give all threads a “fair” amount of CPU. Currently, virtual threads do not do anything in the name of fairness. A virtual thread will only be unmounted from its carrier thread when it finishes execution or makes a blocking call. [This article](https://www.morling.dev/blog/loom-and-thread-fairness/) goes into more detail about how scheduling fairness and virtual threads currently work. Of note, mechanisms for providing fairness with virtual threads were initially implemented but [were removed](https://twitter.com/pressron/status/1529816395025764352). It appears go routines in Go originally had this same issue but later were fixed, maybe Java is in for a similar process.

### Issues that Can Be Encountered

There are two main ways that a virtual thread will be in a position where it is unable to unmount from its carrier thread when it hits a blocking call. The first of these is when a carrier thread gets captured which blocks both the virtual thread and the carrier, platform thread. This capturing behavior can happen by running into certain OS limitations (particularly file operations) and also limitations in the JVM with operations such as `Object.wait()`. In the case of a captured thread being detected the JVM will temporarily create another platform thread while the thread is captured. This leads to temporarily having more threads in the virtual threads thread pool than there are processors. There is a configuration that can set an upper limit of how many threads can be added to this thread pool though.

The other time that a virtual method can get in trouble is when it calls a native method, a foreign method, or a `synchronized` block. This leads to the virtual thread being *pinned* to the carrier thread. A pinned thread will not unmount from the carrier thread at times it would have otherwise. The JVM does not try to compensate for pinned threads because it is believed that developers can avoid pinning if they desire. You can request the JVM output a stack trace when a virtual thread pins by providing the `-Djdk.tracePinnedThreads` JVM flag. If you provide `full` as the value to the flag you will receive a full stack trace such as:

```log
Thread[#40,ForkJoinPool-1-worker-8,5,CarrierThreads]
 java.base/java.lang.VirtualThread$VThreadContinuation.onPinned(VirtualThread.java:180)
 java.base/jdk.internal.vm.Continuation.onPinned0(Continuation.java:398)
 java.base/jdk.internal.vm.Continuation.yield0(Continuation.java:390)
 java.base/jdk.internal.vm.Continuation.yield(Continuation.java:357)
 java.base/java.lang.VirtualThread.yieldContinuation(VirtualThread.java:370)
 java.base/java.lang.VirtualThread.parkNanos(VirtualThread.java:532)
 java.base/java.lang.VirtualThread.doSleepNanos(VirtualThread.java:713)
 java.base/java.lang.VirtualThread.sleepNanos(VirtualThread.java:686)
 java.base/java.lang.Thread.sleep(Thread.java:451)
 com.scaledcode.vthreads.pinnedthreads.ClassThatPins.incrementer(ClassThatPins.java:6) <== monitors:1
 com.scaledcode.vthreads.pinnedthreads.Runner.lambda$main$0(Runner.java:12)
 java.base/java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:577)
 java.base/java.util.concurrent.ThreadPerTaskExecutor$ThreadBoundFuture.run(ThreadPerTaskExecutor.java:352)
 java.base/java.lang.VirtualThread.run(VirtualThread.java:287)
 java.base/java.lang.VirtualThread$VThreadContinuation.lambda$new$0(VirtualThread.java:174)
 java.base/jdk.internal.vm.Continuation.enter0(Continuation.java:327)
 java.base/jdk.internal.vm.Continuation.enter(Continuation.java:320)
```

If the value of `short` is provided only the stack frame that caused the pinning to occur will be printed such as.

```log
Thread[#24,ForkJoinPool-1-worker-1,5,CarrierThreads]
 com.scaledcode.vthreads.pinnedthreads.ClassThatPins.incrementer(ClassThatPins.java:6) <== monitors:1
```

### Observability and Tooling

The observability and the tooling around virtual threads is another place where the designers of this functionality kept in line with the status quo. There is no problem setting breakpoints in virtual threads because they are still just running on a platform thread. Other tools like Java Flight Recorder are also already integrated into virtual threads. Because the existing thread dump format isn’t prepared for having the sheer number of threads that can be created with virtual threads, the existing thread dump functionality will only dump platform threads at this time. There has been an additional capability added to `jcmd` that allows dumping of all threads, virtual threads included, in a format better prepared for a large number of threads. Overall, even though virtual threads are still in preview the tooling is already in a great place largely because virtual threads work so similarly to platform threads.

### Things to Keep In Mind

Virtual threads are still a feature in preview and thus, even if you are using Java 19, aren’t immediately available (the `--enable-preview` flag must be passed to the JVM). Even with the preview flag virtual threads shouldn’t be used in a production system.

Virtual threads will require a mind shift to use coming from a world of only OS-managed threads in Java. Where historically thread pools were a best practice when working with threads, with virtual threads they are now an anti-pattern. Virtual threads are cheap, you should feel comfortable creating them whenever you have a piece of work to spin up and then trust the scheduler to handle the rest.

Another reason that developers will use thread pools is to protect downstream services by only allowing a certain number (the size of the thread pool) of threads to access a downstream resource. This practice can still be implemented with virtual threads however the mechanism would instead be facilitated via a semaphore or other similar process.

Another item to be careful of is to watch out for `synchronized` blocks in often accessed code. As explained above a synchronized block will *pin* a virtual thread to its carrier disallowing it from unmounting as expected and picking up other useful work while it is blocked. Instead, consider using something like a `ReentrantLock` to facilitate the same behavior. This doesn’t necessarily mean that you must remove all `synchronized` blocks from your code before using virtual threads. Particularly start-up tasks and other low-volume calls may be perfectly fine to use `synchronized` blocks. Make use of the `jdk.tracePinnedThreads` JVM flag to detect and analyze which sections of your code (if any) are at risk of causing issues with thread pinning.

The final thing to keep in mind is to consider limiting your use of thread-local variables. To the credit of the designers of virtual threads, thread-local variables still work with virtual threads but they take memory up in the stack that must be copied back and forth when a virtual thread is unmounted and mounted. When you have the possibility of millions of virtual threads this can quickly add up. There were changes made in the JVM itself to decrease the usage of thread-local variables to help along these lines. There are ideas of how to mimic the behavior of a thread-local variable in a world of millions of threads but those are still in the early JEP proposal phases.

### Conclusion

It has been a long time coming but virtual threads in Java is starting to feel like it is within grasp. I think the current design for virtual threads is fascinating and very Java-esque in its backward compatibility. While they may not be immediately usable in production systems, the forward progress we have seen in their implementation is hopeful and represents a continued bright future for Java in my mind.

My experiment code can be found here:

[https://github.com/kylec32/JavaVirtualThreadsExperiments](https://github.com/kylec32/JavaVirtualThreadsExperiments)
