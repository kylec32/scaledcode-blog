---
title: Effective Java! Consider Typesafe Heterogenous Containers
description: A dive into chapter 33 of Effective Java
date: 2020-07-15
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

The most common use cases of generics are collections such as `List` and `Map` as well as single-element containers like `ThreadLocal` and `AtomicReference`. In both the collection case as well as the single-element objects there is a very finite list of types taken. This serves us well in many cases however sometimes we need additional flexibility. We may have a use case like mapping a row from a database in a type safe manner. In these cases we have to use another technique. This technique is to parameterize the _key_ to the data and not the _container_ entirely. That is, rather than specifying the type of the container we specify the type of a particular piece of data. By doing this we can enable additional flexibility while still preserving type safety.

Let's consider an example. Consider a `Favorite` class. The purpose of this class is to collect your favorite object of an arbitrary amount of types. The `Class` object will serve as the key into our `Favorite` class. This works because the `Class` type is generic and holds it's own type `Class<T>`. Thus `String.class` is `Class<String>`, `Integer.class` is `Class<Integer>`, and so on.

The API for our `Favorite` class is straightforward:

```java
public class Favorites {
  public <T> void putFavorite(Class<T> type, T value);
  public <T> T getFavorite(Class<T> type);
}
```

and its use would look something like:

```java
Favorites favorites = new Favorites();
favorites.putFavorite(String.class, "Hello world");
favorites.putFavorite(Integer.class, 123);
favorites.putFavorite(Class.class, Favorite.class); 
```

and finally let's check out the implementation:

```java
public class Favorites {
  private Map<Class<?>, Object> favorites = new HashMap<>();
  public <T> void putFavorite(Class<T> type, T value) {
    favorites.put(Objects.requireNonNull(type), value);
  }
  public <T> T getFavorite(Class<T> type) {
     return type.cast(favorites.get(type));
  }
}
```

For what this class does this is not too complicated. What the `Favorite` class ends up representing is a type-safe as well as has a different type for each element, thus heterogeneous. This is how we get to a _heterogeneous container_ description from the chapter title. Looking at the above implementation probably the most interesting part is the `getFavorite` function. Because we lose the type information once we put the value in the `Map` we need a way to retrieve the value in a type safe manner. This is where the `Class.cast` function comes in handy. If the object can't be cast to the type we will get a `ClassCastException`. Because we control the types that go into the `Map` we know this won't happen in the usual case. 

What limitations does our `Favorites` implementation have? The first one is if a user of our class creates a raw class object they can corrupt the type safety of our class. This is no different than having a `HashSet<Integer>` and putting a `String` by accessing it as a raw `HashSet`. We actually can enforce runtime type safety if we are willing to pay for it. By changing the `putFavorite` function to the following we can enforce the type safety at runtime even if accessed via raw types.

```java
public <T> void putFavorite(Class<T> type, T value) {
  favorites.put(Objects.requireNonNull(type), type.cast(value));
}
```

There are collection wrappers in `java.util.Collections` that do this same thing. `checkedList`, `checkedSet`, etc perform the same runtime check and can be useful when tracking down where type unsafe changes are made in code that works with parameterized as well as raw collections. 

The second limitation is that our `Favorites` class can't be used with non-reifiable  types. This means that we can store our favorite `String`, `Integer`, `String[]` but we cannot store our favorite `List<String>` and other non-reifiable  types. This is because at runtime we lose the parameterized part of our type and are just left with `List.class` in the above cause and thus there would be no way of knowing the difference between `List<String>` and `List<Integer>` at runtime. 

While often we can get by with parameterized collections and single element types sometimes we want the extra flexibility of typesafe heterogeneous containers. This is made possible via the `Class` type that allows type safety in a more dynamic manner. 