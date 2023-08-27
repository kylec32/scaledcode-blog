---
title: Effective Java! Favor Generic Methods
description: A dive into chapter 30 of Effective Java
date: 2020-06-23
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

This week's chapter continues where our last chapter left off. Whereas last week we talked about generic types, this week we discuss generic methods. As it was with making generic types, one of the main goals of using generic methods is to improve the readability and safety of the code which often can be realized by noticing that there are no casts and no unchecked warnings at compile time. So let's look at some examples. 

Let's look at a method that doesn't use generics first:

```java
public static Set union(Set s1, Set s2) {
  Set result = new HashSet(s1);
  result.addAll(s2);
  return result;
}
```
While the above code works it does throw warnings at compile time as it can't enforce type safety at compile time. The fix is slightly simple. We add a type parameter list which declares the type parameters to be used between the method's modifiers and the return type. From there we can use the type parameter throughout the function. Let's look at our above function in a generic way.

```java
public static <E> Set<E> union(Set<E> s1, Set<E> s2) {
  Set<E> result = new HashSet<>(s1);
  result.addAll(s2);
  return result;
}
```

It's as easy as that, we now have gotten rid of our warnings as well as provided better type safety. A current limitation of the `union` function is that the type of the three sets must be exactly the same, we can loosen this requirement using _bounded wildcard types_ which we will get into in the next chapter.

Another capability that we have with generic methods is creating functions that provide typed generic immutable objects. Because generics are implemented via type erasure we can have an immutable class that serves all types. This is one benefit of type erasure. We can see examples of these in the JRE with methods such as `Collections.reverseOrder` and `Collections.emptySet`. Let's look at an example of this. Let's imagine we want to implement our own `identityFunction`. We of course shouldn't do this because it already exists but it is educational to consider.

```java
private static UnaryOperator<Object> IDENTITY_FN = (t) -> t;

@SuppressWarnings("unchecked")
public static <T> UnaryOperator<T> identityFunction() {
  return (UnaryOperator<T>) IDENTITY_FN;
}
```

We do need to do a cast but we know it's safe due to no actions actually happening on the object in question so we suppress the warnings. 

The final thing for us to consider is something called a _recursive type bound_. What these are is when a type parameter is bounded by some expression involving the type itself. This sounds more confusing than it is. A common place this can be seen used is in connection with the `Comparable<T>` interface. The type `T` of `Comparable` denotes to what type the object can be compared. In practice most types simply are comparable with themselves thus `String` implements `Comparable<String>` and `Integer` implements `Comparable<Integer>` and so on. So as an example of a _recursive type bound_ let's look at a function that finds the maximum value in a collection.

```java
public static <E extends Comparable<E>> Optional<E> max(Collection<E> c) {
  E result = null;
  for (E e : c) {
    if (result == null || e.compareTo(result) > 0) {
      result = Objects.requireNonNull(e);
    }
  }
  return Optional.ofNullable(result);
}
```

The type parameter can be read as "any type E that can be compared to itself" which ends up being exactly what we are looking for. While _recursive type bounds_ can get fairly complex hopefully you can see how these can be useful.

Overall, preferring generic methods and types leads to safer code as well as easier to use code. We should do what we can to make our code warning and cast free.   