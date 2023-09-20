---
title: Effective Java! Use Checked Exceptions for Recoverable Conditions
description: A dive into chapter 70 of Effective Java
date: 2021-08-10
hero_image: ./use-checked.jpg
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter takes on describing when which type of `Throwable`s should be thrown. The two main `Throwable` types we mostly interact with are checked and unchecked exceptions. The major difference between the two being that checked exceptions are part of method signatures which forces the caller to handle the checked in some way (either catching the exception or passing the exception up the call stack). The question is, when should you use which exception type. 

_Effective Java_ suggests the use cases break down as the following. If an exception is recoverable you should use a checked exception and if it isn't reasonable to assume that someone could recover from an exception you should use an unchecked exception. I actually wouldn't agree with this. I believe that checked exceptions lead to harder to read code with almost no benefits. It is for this reason that I never write checked exceptions. While the concept of using a checked exception to force the caller of your API to try to recover from an exception makes sense it doesn't seem worth it to me. 

There is one type of `Throwable` we skipped over, that is `Error`s. The reason for this is because you almost should never interact with `Error`s. By a widely accepted convention `Error`s are reserved for the JVM to throw when something truly unrecoverable happens. This means you should never catch them (or `Throwable`, its superclass) or throw them outside of `AssertionError`. This extends to extending directly from the `Throwable` base class. This would be handled like a checked exception however it is not a thing that should be done, either extend from `Exception` or `RuntimeException`.

The final thing to keep in mind is that exceptions are just regular classes. Because of this, you can add arbitrary data as well as methods to your exceptions classes. This can be extremely useful when you want to pass additional information about the exception or state of the object throwing the exception. You never want to force a handler of your exception to try to parse the exception message to get the required information when handling an exception.

While there may be some disagreement about when checked and unchecked exceptions should be used, having consistency throughout your code is critical and will lead to much more maintainable code. 