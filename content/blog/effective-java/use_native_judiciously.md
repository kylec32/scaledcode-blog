---
title: Effective Java! Use Native Methods Judiciously
description: A dive into chapter 66 of Effective Java
date: 2021-06-24
hero_image: https://miro.medium.com/v2/resize:fit:720/0*tooSZnf2IX1q_WB-
tags:
  - java
  - effective java review
  - design
  - architecture
---

Java provides the Java Native Interface (JNI) that allows Java programs to call into native methods written in native programming languages such as C, C++, or Rust. Historically this capability has been used for three different things:
1. The ability to call into platform-specific features such as registries.
1. Access to existing native code so that you don't need to re-implement it.
1. For writing performance-critical parts of your application.

As stated above it is valid to use native methods to access platform-specific functionality although that is seldom needed. Java over the years has done a good job of providing platform agnostic solutions to platform features such as the process apis in Java 9. 

While the Java ecosystem is massive and you can probably find some JVM library for about any purpose JNI can still be useful for calling into native libraries when they provide unique functionality. A library that I have been using a lot lately is Kafka Streams which uses JNI to call into RocksDB to use as a local data store. 

Finally, using native code for performance critical code is a dangerous game. Attempting this can often bring about the opposite effect along with all the other downsides detailed below. 

With all the reasons that one might choose to use native code in Java there are a number of serious downsides. Native languages are not safe and work outside of the garbage collector. This can lead to corrupted memory leaks, and all the other downsides that native programming brings along with it. When taking on native code we also take on all the platform-dependence that it brings along that we were allowed to ignore with using pure Java. If you are not careful a simple native method call can greatly decrease the stability, interoperability, and maintainability of your code. 

Given all of these considerations it is often best to steer clear of native methods if at all possible. If you cannot avoid the use of them be very careful with your code and make sure to thoroughly test the code for safety. 


