---
title: Effective Java! Refer to Objects By Their Interfaces
description: A dive into chapter 64 of Effective Java
date: 2021-06-02
hero_image: https://miro.medium.com/v2/0*RoY8J_lkTbAGk9sw
tags:
  - java
  - effective java review
  - design
  - architecture
---

This topic of today is focussed on flexibility. When defining parameters, return types, or variables it is encouraged to define them as the interface that the concrete types implement. So instead of something like:
```java
LinkedHashSet<String> stringSet = new LinkedHashSet();
```
we should instead implement something like:
```java
Set<String> stringSet = new LinkedHashSet();
```

What writing our code like this allows us to do is change out the implementation of our variables as long as they meet the same interfaces. So maybe instead of using a `LinkedHashSet` like defined in the first example we could change it to a `HashSet` without having to change any other code. That being said we do need to know if there are attributes of the previous implementation that the code is relying on (such as the ordering guarantees of `LinkedHashSet` vs `HashSet`).

What are some reasons we might decide to change the implementation? Some examples might be:
* Performance improvements
* Memory savings
* Desired additional functionality (such as ordering guarantees)
* etc.

While it may be possible in some situations to change all type declarations if we wanted to change the concrete type of a variable, it will be much more painful and that extra cost may end up being enough of an obstacle that it is not worth it to make the change. 

Let's consider some of the reasons we may not choose to follow this advice or be able to follow this advice.

If the types we are using don't have any expectation of alternate implementations such as `String`, `BigInteger`, etc we choose to not use interfaces in these cases (in fact we don't have an option to use an interface since none exists). 

Some class hierarchies are not based on interfaces but are based on inheritance. In these cases the alternative is often to use a base class for the type (often an abstract type). An example of this would be `ByteArrayOutputStream` to `OutputStream`.

A final idea would be that, even though an interface exists, we choose not to use it due to wanting to call into a specific function only available on a unique concrete type that doesn't exist on the interface. An example of this would be `PriorityQueue`'s `comparator` interface that is missing from the `Queue` interface.

Even above and beyond the main focus of this chapter being focussing on using interfaces over concrete classes this chapter really is talking about focusing on using the most generic type that gets the job done. The ultimate generic type would be that of `Object` but that type often doesn't provide us with the method we need to get our job down so we keep moving down the class hierarchy until we hit something good enough to be used. An example of this that I run into fairly often is passing a collection of objects to a method and iterating over it. Instead of taking a parameter of type `List` for example I could instead take `Iterable` which leaves my options more open. Flexibility is a super power when developing. We should look for opportunities to increase our flexibility wherever we can and this is one more opportunity for us to accomplish that. 