---
title: Effective Java! Use Instance Fields Instead of Ordinals
description: A dive into chapter 35 of Effective Java
date: 2020-07-27
tags:
  - java
  - effective java review
  - design
  - architecture
---

There are times that there is a natural ordering and ordinals that could be assigned to our different `enums`.  For example consider the following:
```java
public enum Ensemble {
  SOLO, DUET, TRIO, QUARTET, QUINTET, SEXTET, SEPTET, OCTET, NONTET, DECTET; 

  public int numberOfMusicians( return ordinal() + 1; );
}
```

Using the `ordinal` built-in function may initially seem like a good idea as the ordinals follow the correct number that should be returned from our `numberOfMusicians` function. The problem lies in the maintenance of the `enum`. The ordering of the values in the `enum` are tied to their value. This can cause problems for if we want two values to return the same value or if we want to skip a value. For example consider a _double quartet_ which should return `8` from the `numberOfMusicians` function. However an ordinal can only be connected to one value and `OCTET` is already connected with that ordinal. Also consider if we wanted to make a value for _triple quartet_ which should return a `12` from the `numberOfMusicians` function. However ordinals go in order and the last value we have would match up with `11` and not `12`. So we either need to make a useless value to fill up space or we can't do it. 

So what we should reach for instead is using instance variables. Using this method we get way more flexibility without giving up much conciseness. Let's take a look at how this would look.
```java
public enum Ensemble {
  SOLO(1), DUET(2), TRIO(3), QUARTET(4), QUINTET(5), SEXTET(6), SEPTET(7), OCTET(8), DOUBLE_QUARTET(8), NONTET(9), DECTET(10), TRIPLE_QUARTET(12); 

  private final int numberOfMusicians;

  public Ensemble(int numberOfMusicians) {
    this.numberOfMusicisians = numberOfMusicians;
  }

  public int numberOfMusicians( return numberOfMusicians; );
}
```
In this new and improved version we no longer use the `ordinal` function and instead use the instance fields. This has given the flexibility to easily add the _double_ and _triple_ quartet ensemble values. 

So what good is the `ordinal` function if we basically are told never to use it. Well the documentation itself says: "Most programmers will have no use for this method. It is designed for use by general-purpose enum-based data structures such as `EnumSet` and `EnumMap`". Unless you are writing code like that you don't need to worry about this function. 
 