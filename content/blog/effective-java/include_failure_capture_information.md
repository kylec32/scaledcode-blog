---
title: Effective Java! Include Failure-Capture Information in Detail Messages
description: A dive into chapter 75 of Effective Java
date: 2021-09-28
hero_image: https://miro.medium.com/v2/resize:fit/0*2YlZDMSIW0p3DGY2
tags:
  - java
  - effective java review
  - design
  - architecture
---

Often when we are analyzing a failure of some code all we are left with is the logs that are left behind. Seeing as this is the case, we want to give ourselves the best chance of success. When a program fails the system will automatically output the exception's stack trace which includes the value that gets returned from the `toString` method of the exception. This message serves as a core capability in explaining the state of the system and particularly the exception to the future investigators. Because of this, we should do our best to include any relevant information to understand why the system failed. 

An example that _Effective Java_ provides is the example of a `IndexOutOfBoundsException`. Thinking through what information could be useful when analyzing such a failure some of the things that could be useful are the lower bound, upper bound, and index specified. Through having these pieces of information we can get some solid insight into the state at the time of the failure. One exception to this is with security-sensitive information. Because log visibility can often be fairly far-reaching we should keep all passwords, encryption keys, and other security-sensitive information out of the logs and thus out of the exception messages of our code. 

When writing the `toString` method we should focus on providing details rather than lots of prose. The audience for logs messages are developers and other engineers working on the system. Because of this, these people already have access to the source code and documentation and thus the focus shouldn't be on that and more on the current state. Put another way, focus your messages on what changes, not on what is the same.

The best way to ensure this critical information gets provided when the exception is thrown is to require the pertinent information in the constructor. By doing this it ensures that the data will be provided. This also allows the caller of the exception to not need to know how to write the detailed `toString` messages. As an example of what this could look like in our `IndexOutOfBoundsException` example let us consider the following code:

```java
public IndexOutOfBoundsException(int lowerBound, int higherBound, int index) {
  super(String.format("Lower bound %d, Upper bound %d, Index: %d", lowerBound, higherBound, index));

  this.lowerBound = lowerBound;
  this.higherBound = higherBound;
  this.index = index;
}
```

Another item to note in this example is that the variables are saved off in the exception object thus they are able to be pulled out by any code that catches these exceptions. 

By providing useful detailed messages in exceptions we can speed up the dispositioning and recovery from exceptions. As often is the case, considering simple things at the beginning of a project can pay off big when operating a service.