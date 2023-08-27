---
title: Effective Java! Use Interfaces Only to Define Types
description: A dive into chapter 22 of Effective Java
date: 2020-04-28
tags:
  - java
  - effective java review
  - design
  - architecture
  - interfaces
---

The purpose of interfaces is to define a type. When a class implements an interface that should tell the user of the class something about what that class can do. If we are abusing interfaces for other purposes that is an inappropriate use of an interface. That's basically the whole of the content of this chapter. So if the interfaces is not being used to define a type what is it being used for? The most common use case is the Constant Interface Anti-Pattern. It looks something like this:
```java
// Antipattern
public interface PhysicalConstants {
  static final double AVOGAROS_NUMBER = 6.022_140_857e23;
  static final double ELECTRON_MASS = 9.109_383_56e-31;
}
```
When a class implements an interface like the above what does that tell us about that class? Really nothing. It's implementing it because it want's access to those constants but the consumers of the class don't need to know that. What it can also do is cause the consumers of your class to become dependent on those constants which locks you as the implementer from being able to remove these constants. If the constants aren't part of the value that is provided by your class we shouldn't be exposing them to our consumers like this interface does. So if we aren't to do this what are we to do? 

```java
public final class PhysicalConstants {
  private PhysicalConstants() { }
  public static final double AVOGAROS_NUMBER = 6.022_140_857e23;
  public static final double ELECTRON_MASS = 9.109_383_56e-31;
}
```

What we did above was create a utility class that holds the constants. This now forces it to stay simply an implementation detail and not pollute the public interface of our class. We may seem to lose out from accessing the constants in such a simple manner and have to fully qualify them (`ELECTRON_MASS` vs `PhysicalConstants.ELECTRON_MASS`) but we can get around this annoyance by doing a static import of the constant. 

This chapter simply comes down to use the tools and functionality for what it was built, don't abuse it and use it in a way that it wasn't intended. 