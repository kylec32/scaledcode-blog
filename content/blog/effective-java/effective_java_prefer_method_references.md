---
title: Effective Java! Prefer Method References to Lambdas
description: A dive into chapter 43 of Effective Java
date: 2020-09-21
tags:
  - java
  - effective java review
  - design
  - architecture
---

One of the main benefits of lambdas is the conciseness of the code versus the use of an anonymous class. Even so, there are times that even lambdas end up with unnecessary boilerplate. In these cases we can often make use of method references which is something we even saw used in our last post. 

Method references are really just that, a reference to a method that allows us to skip the boilerplate of simply passing parameters from one place to another.  Let's look at an extremely simple example:

```java
IntStream.of(1,2,3).reduce((a, b) -> Integer.sum(a, b));
```

This is pretty simple code that simply creates an `IntStream`, sums all the values together, and returns the sum. We use a lambda as part of the `reduce` call. This isn't very verbose but the `(a, b) ->` provides us no value. Looking at this same code but with method references.

```java
IntStream.of(1,2,3).reduce(Integer::sum);
```

This indeed is simpler and I do like that it focuses on what is being done not how to do it. Not showing how the sum is accomplished by calling out directly that it is a sum that is happening. 

Almost in all cases we should use a method reference instead of the equivalent lambda. The reason for this is most of the time it increases the readability. You can even use this capability to your advantage in that you can write a method to contain all of your business logic and give it a descriptive name and call it via a method reference. If this is not the case in your code you should use the lambda instead. This may be because the containing class that needs to be called out may have a really long name or the parameter names serve as good documentation. 

Finally, the way you call a method reference changes slightly based on what kind of code it is. 

| Reference Type | Example                | Lambda Equivalent                                   | 
|----------------|------------------------|-----------------------------------------------------|
| Static         | Integer::parseInt      | str -> Integer.parseInt(str)                        | 
| Bound          | Instant.now()::isAfter | Instant then = Instant.now(); t -> then.isAFter(t); | 
| Unbound        | String::toLowerCase    | str -> str.toLowerCase()                            | 
| Class Constructor | TreeMap<K,V>::new    | () -> new TreeMap<K,V>    | 
| Array Constructor | int[]::new    | len -> new int[len]    | 

It basically comes down to this rule of thumb, when method references are shorter and clearer (which is often the case) use them. 
