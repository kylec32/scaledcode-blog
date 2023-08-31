---
title: Effective Java! Favor the Use of Standard Functional Interfaces
description: A dive into chapter 44 of Effective Java
date: 2020-09-29
tags:
  - java
  - effective java review
  - design
  - architecture
---

With lambdas as part of the Java language more possible implementations have opened up. Where before we may have used an alternate pattern such as maybe the _Template Method Pattern_ where a subclass overrides a method to specialize the behavior of the superclass, we can now use a factory method that takes a lambda that serves as the specialization function. 

Let's look at another example, _LinkedHashMap_. This can serve as a cache by overriding the `removeEldestEntry` which gets invoked on each `put` operation with the oldest item and which, when it returns `true`, removes the oldest entry. For example, if we wanted to limit our map to 100 entries we could write something like: 

```java
protected boolean removeEldestEntry(Map.Entry<K,V> eldest) {
  return size() > 100;
}
```

This method works fine but if it was built today it may be cleaner to pass a lambda to fulfill this purpose. So let's think through what this map would need to take. It would of course take `Map.Entry<K,V>` just like our `removeEldestEntry` method. It also needs a reference to the map itself since it calls the `size` method. Finally we need to consider the return type which in this case would be `boolean`. So putting this all together we would get: 

```java 
@FunctionalInterface
interface EldestEntryRemovalFunction<K,V> {
  boolean remove(Map<K,V> map, Map.Entry<K,V> eldest);
}
```

This interface will work great, it's exactly what we need. The question is is this necessary? Java provides us with forty-three functional interfaces in the `java.util.function` package which covers many, many use cases. I don't think anyone expects you to memorize all the interfaces but there are certain building blocks that if we understand we can derive what interfaces are available to us.

Let's dive into these building blocks. There are five main classes of functional interfaces. _Operator_ interfaces (which there are _Unary_ and _Binary_ versions that take one and two arguments respectively) which take and return the same argument type. _Predicate_ which takes an argument and returns a _boolean_. _Function_ which arguments and return type differ. _Supplier_ which takes no arguments and returns a value. _Consumer_ which takes arguments and returns nothing. 

There are three variants of each of these that operate on `int`, `long`, and `double`, for example `IntPredicate` which takes an `int` and returns a `boolean`. We also have _Function_ interfaces that convert from one primitive type to another in the pattern such as `SrcToResult` for example `LongToIntFunction`. If the source is a primitive and the result is an object we will follow the pattern `SrcToObj`, for example `DoubleToObjFunction`.

This should give you a sense of the possibilities when you are looking to use an interface. The core of this chapter is to encourage you to use these standard interfaces instead of just creating your own. By using these standard interfaces you are using something that people will be more familiar with, it's less code for you to manage, and the built in types have helpful methods that you can use such as combining _predicates_ together. 

Another thing to point out, of all these interfaces created for us the bulk of them are to allow the use of primitives without boxing and unboxing. With all this provided for us there is no reason to use boxed types in place of primitives. 

So when should we create our own functional interfaces? There are a few cases where you will want to create your own interfaces. The first case is the most obvious, if none of the interfaces fulfill your requirements then create your own. The other case is when it makes a lot of sense to make a more descriptive name as well as if it's going to be used in many places to represent a specific thing. 

In summary, when using lambdas first consider using one of the built in functional interfaces rather than building your own. 