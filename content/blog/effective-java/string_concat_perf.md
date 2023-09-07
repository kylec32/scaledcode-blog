---
title: Effective Java! Beware the Performance of String Concatenation
description: A dive into chapter 63 of Effective Java
cover_image: https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80
date: 2021-05-18
tags:
  - java
  - effective java review
  - design
  - architecture
---

An attribute of the `String` type is that they are immutable. This allows for a number of good attributes. Another attribute of the `String` type is that Java provides some syntactic sugar to concatenate `String`s by using the `+` operator. This is a very beneficial ability but putting these two capabilities together, immutability and simple contenation can lead us to accidentally cause performance issues. Let's consider an example:

```java
public String concatenateStrings(int numberOfIterations) {
  String result = "";
  for (int i=0; i < numberOfIterations; i++) {
    result += randomStringOfLength(m);
  }
  return result;
}
```

With a low value for `numberOfIterations` this can turn out to be fine. As the number of iterations goes up the cost goes up drastically. This is because the `String`s can't be modified and must be copied. This not only costs a lot of compute power but also creates a lot of garbage for the garbage collector to clean up. Compare this to the much more performant version:

```java
public String concatenateStrings(int numberOfIterations) {
  StringBuilder result = new StringBuilder();
  for (int i=0; i < numberOfIterations; i++) {
    result.append(randomStringOfLength(m));
  }
  return result.toString();
}
```

This code uses a mutable holder to collect the `String`s so it can concatenate them all at once. 

So when should we use string concatenation and when should we use the `StringBuilder`. A good rule of thumb is to use a `StringBuilder` when concatenating in a loop. When concatenating a static number of `String`s the performance won't get any better or worse from your initial testing so you won't be surprised by performance problems. 