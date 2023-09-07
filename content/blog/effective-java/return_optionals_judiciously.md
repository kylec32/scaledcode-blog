---
title: Effective Java! Return Optionals Judiciously
description: A dive into chapter 55 of Effective Java
date: 2020-12-23
tags:
  - java
  - effective java review
  - design
  - architecture
---

Prior to Java 8 if a method didn't want to return a value some of the time and return a value at other times there were a few options. The method could return a `null`, the method could throw an exception, or you could come up with some state holding object that could be returned (although I've never seen this). The first two options aren't great. Returning `nulls` is just asking for Null pointer exceptions. Throwing exceptions is extremely heavy handed, slow, and a pain to deal with. With Java 8 the language provided a standard way to use the third option with the introduction of the `Optional` class. Conceptually an `Optional` is an immutable collection that can hold at most one item. While it doesn't actually implement the `Collection` interface it could. On top of this state holding behavior it also has a number of helpful methods that really make it useful.

In a previous chapter we talked about a method that could calculate the maximum value in a collection. 

```java
public static <E extends Comparable<E>> E max(Collection<E> collection) {
  if (collection.isEmpty()) {
    throw new IllegalArgumentException("Empty collection");
  }
  E maximumValue = null;
  // Insert business logic for calculating maximum
  return maximumValue. 
}
```

The above method takes the stance of throwing exceptions when it doesn't have anything to return. We can choose to not do this and instead convert to the use of optionals. 

```java
public static <E extends Comparable<E>> Optional<E> max(Collection<E> collection) {
  E maximumValue = null;
  // Insert business logic for calculating maximum
  return Optional.ofNullable(maximumValue). 
}
```

As we can see above this actually even simplifies the code. If `Optional.ofNullable` is passed a null it will return the same things as `Optional.empty()` and if it is passed a concrete object it will return the object wrapped in an `Optional` (this can also be done manually by using `Optional.of()`, it simply doesn't do the `null` check for you).

Something of note, an `Optional` is just another class and thus you can return `null` from methods that return `Optionals`. While the language allows this unfortunately you _should not do this_. This ruins the point of the `Optional` and you lose all faith in the writers of code that do this. 

Another interesting thing is that `Streams` and `Optionals` entered the language at the same time. This being the case there are many terminal operations in the `Streams` API that return `Optionals`. Using this we can actually make our `max` function even more concise. 

```java
public static <E extends Comparable<E>> Optional<E> max(Collection<E> collection) {
  return collection.stream().max(Comparator.naturalOrder()); 
}
```

Our whole method has turned into a one-liner.

Another thing that you may discover as you work with `Optional` returning methods is that they have the same spirit as checked exceptions. This is because they force the caller of your method to confront the possibility of an empty value. While I'm not a fan of checked exceptions I am a fan of `Optionals`. Confronting this fact I think it is because of two reasons. 1. `Optionals` are less invasive to deal with. 2. Optionals provide functions that are very useful when dealing with potential emptiness that take them above and beyond simple state holders. 

What about these methods that I speak of? There are many of these functions and I can't cover them all but they range from simple things like `isPresent()` and `orElse(E)` to more fun things like `map()`. As you use `Optionals` you discover these methods and they really can change the way you code, very similar to `Streams`. While the easiest thing is usually to use `ifPresent()` off the bat, I challenge you to try using the higher-powered methods and see how it works for you. 

So when should `Optionals` not be used. One case would be when using a container class already such as a collection. In these cases simply return an empty collection like discussed in our previous installment of this series. Honestly this is the main reason I wouldn't use an `Optional` with a method that may return an empty result. 

Creating `Optional` objects does have a cost, just like creating any object. This is especially prevalent with boxed types. This is the reason why there are special versions of `Optionals` for these (`OptionalInt`, `OptionalLong`, etc). When interacting with these types, always use the specialized `Optional` type. 

As a final grab bag of items to consider let's go over some final thoughts. It's almost never appropriate to use an `Optional` as a key into an object. Also taking an `Optional` as a parameter is a smell. In these cases you will likely just want to overload the method and provide both options of passing the parameter and not.

In my view `Optionals` were a great addition to the language. Although there are more powerful equivalent types in some other languages I think this class does a great job for something added so late into a language. Hopefully this chapter review gives you a little more confidence when using `Optionals`.
