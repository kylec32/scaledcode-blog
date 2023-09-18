---
title: Effective Java! Prefer Interfaces To Reflection
description: A dive into chapter 65 of Effective Java
hero_image: https://miro.medium.com/v2/resize:fit:720/0*4LbF3iLpr4vyzzNK
date: 2021-06-16
tags:
  - java
  - effective java review
  - design
  - architecture
---

Java provides a very powerful capability in its reflection system. Reflection allows us to have extreme flexibility when calling classes, their constructors, and methods. These classes that we are interacting with may not even exist at the time that our reflexive code is written. This flexibility is not free, however; there are downsides to its use. Some of these are the following:

* *You lose out on compile time checks.*  Issues that would be exposed at compile-time when coded in non-reflexive style turn into runtime issues when coded via the reflexive apis.
* Related to the above, static code analysis tools have trouble being helpful working with reflection code. 
* Reflexive code often is clumsy and hard to read.
* *Reflexive code has worse performance than non-reflexive code.* In one benchmark, reflexive code proved to be 11x slower than a non-reflexive access. 

There can be specific applications where reflexive coding practices can be preferred. Examples such as code analysis tools and dependency injection frameworks. Even that said, recently these types of tools have been switching away from using reflection to avoid the above downfalls. 

Many of the times that we are reaching for reflection to solve a problem, what we are really after is the use of interfaces. By coding against an interface we still can code against code that has yet to be written, just like with reflection, and still gain some of the benefits of reflection. All of this without most of the downsides of the reflection APIs. 

Reflection is an extremely powerful tool in the toolbelt of a Java developer. It is helpful to understand how it works and that it exists but most of the time is not the tool that we should be reaching for. 

 

