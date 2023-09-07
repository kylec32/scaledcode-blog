---
title: Effective Java! Make Defensive Copies When Necessary
description: A dive into chapter 50 of Effective Java
date: 2020-11-10
tags:
  - java
  - effective java review
  - design
  - architecture
---

One of the benefits of Java as a language is that it can provide some safeties that other lower-level languages don't provide. Safety from things such as buffer overflows, misplaced pointers, and other memory corruption issues of languages like C and C++. That being said, Java is not immune to safety issues and we must still be vigilant. 

Let's look at an example of where this can hurt us. Let's take a look at a class called `Period` that strives to be an immutable class that holds a beginning and ending `Date` object.

```java
public final class Period {
  private final Date start;
  private final Date end;

  public Period(Date start, Date end) {
    if (start.compareTo(end) > 0) {
      throw new IllegalArgumentException("Start is after end");
    }
    this.start = start;
    this.end = end;
  }

  public Date start() {
    return start;
  }

  public Date end() {
    return end;
  }
}
```

At first glance this may seem like a reasonable implementation and that it enforces the invariant of start preceding end. That being said it's quite easy to break that invariant though. The following code does that:

```java
Date start = new Date()
Date end = new Date();
Period p = new Period(start, end);
end.setYear(50);
```

The last line of that code modifies the internals of our `Period` object. So what are some ways we can fix this? Probably the best way in Java 8 and beyond is using one of the improved date objects that were introduced in that version such as `Instant` or `LocalDateTime`. That's going to be our best option. What about cases where we don't have that option? Let's look at a constructor that can get us part of the way there to solving our problem.

```java
public Period(Date start, Date end) {
    this.start = new Date(start.getTime());
    this.end = new Date(end.getTime());
    if (start.compareTo(end) > 0) {
      throw new IllegalArgumentException("Start is after end");
    }
  }
```

With just this code in place the previous attack has now been thwarted. Something of note is that we make our copy right away in the constructor without reading the value to prevent timing attacks where the value is changed between checking and storing. Finally we don't use the `clone` method to avoid getting around the implied safety by overriding the `clone` method and giving it an unsafe implementation.

There is one last place we need to protect, that is the getters that we exposed. With how they were implemented above the receiver of the object could change the internal state.

```java
  public Date start() {
    return new Date(start.getTime());
  }

  public Date end() {
    return new Date(end.getTime());
  }
```

With this simple change we now have truly made this class immutable. 

So what are the downsides of making these defensive copies. The main issue can be the memory pressure that can come from this. If these copies are being made in a tight, large loop this can have a significant impact to your code. This is not a reason to avoid using defensive copies but it is something to keep in mind. 

So is this all really worth it? Are people really out to get our code this much? Like many parts of _Effective Java_ I find the defensive copy to prevent attacks to be largely applicable for library writers and not as applicable to those of us writing internally consumed code. What defensive copies do give us above and beyond guarding against attacks is protecting against accidental changes to our internal state. It can be easy to accidentally mutate this state when we don't make defensive copies and the bugs can be extremely difficult to track down. 

In summary, defensive copies can protect our code against bad actors as well as our own mistakes without too much additional code and effort. 
