---
title: Effective Java! Don't Use Raw Types
description: A dive into chapter 26 of Effective Java
date: 2020-05-27
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

This chapter starts a new section of _Effective Java_ about generics. Before Java 5 where generics were introduced to the language, retrieving items from a collection required a cast of the object being returned. Thankfully, in modern Java, we don't need to deal with this anymore and can use generics to provide us type safety as well as cleaner code.

Let's briefly go over the definition of a generic in Java. A generic is a class or interface that has one or more type parameters. The way that this ends up looking is the class or interface name followed by angled brackets with the actual type in it. So an example of this would be `List<String> myList = ...`. Each generic type also has a `raw type` which is simply the generic type without the actual type called out so the `raw type` of the previous example would simply be: `List myList = ...`. Raw types act as if all the type information is erased and these exist for compatibility reasons. It is the relationship between generic types and raw types that this chapter is about. 

Before generics existed in Java if you wanted a collection and add some object to it you would do something like the following:

```java 
Collection myStampCollection = ...;

myStampCollection.add(new Stamp(...));

myStampCollection.add(new Coin(...));

(Stamp)myStampCollection.get(1);
```

Uh oh, looks like I made a mistake. The above code will compile without much issue (other than a vague warning) but at runtime we will get a `ClassCastException`. This is rather unfortunate. Whenever we can, we want to push the discovery of all of our issues as early as possible, preferably to compile time. Now let's look at the above example with generics:

```java 
Collection<Stamp> myStampCollection = ...;

myStampCollection.add(new Stamp(...));

// Compile time error
myStampCollection.add(new Coin(...));

myStampCollection.get(1);
```

With the above where we are telling the compiler the type that will be in the collection it can stop us at compile time and tell us that we are trying to put an incompatible type into the collection. This saves us from having to wait until runtime to discover this issue. Using generics also makes our code cleaner as we don't have to insert the casts but invisible casts are put into the code for us.

So why do raw types exist? Well to it's benefit and detriment Java has always held backwards compatibility as a top requirement and thus in order to allow generic types to coexist with raw types, at compile time, the types are removed from the generics, this is called `type erasure.` While this is helpful for backward compatibility it does bring with it it's own issues that we will discuss in a future chapter. As you use generics it is helpful to know that their benefit is largely pre and during compile time only, they disappear after being compiled. (We will discuss this further in a future post but it can help you when you try to do certain things and the compiler throws errors saying it's not possible.) It comes down to when we use raw types we forfeit all benefits that the generics give us as far as safety and expressiveness. 

So what if we have a type that doesn't have a specific actual type it's related to, is that an acceptable time to use a raw type? Even then using `List<Object>` over simply `List` is prefered. The reasoning being that the raw type opts out of the generic type system. For example while we can pass a `List<String>` to a method that takes a `List` we cannot pass that collection to a method that takes a `List<Object>`

What about cases where we don't care about the type, you may be tempted in this case to use a raw type. Again, if we use a raw type we forfeit the safety of the generic type system. In this case we can use `unbounded wildcard types.` These take the form of replacing the actual type with a `?`. So for example if we wanted to create a method that counts the number of elements in common between two sets we could create signature as follows:

```java
static int elementsInCommon(Set<?> set1, Set<?> set2) { ... }
``` 

Since this method likely only relies on an `equals` method which is common to all objects this is a fine signature. When using an unbounded wildcard type the compiler will prevent us from inserting anything other than `null` this gives us further safety. Since we all need to do is read the objects as opaque values this turns out fine for us.

So is there anywhere where using the raw type is acceptable? There are a few exceptions where it is useful/required
* Class literals cannot use generics. `List.class` is legal, `List<String>.class` is not.
* In `instanceof` checks. Because of our friend type erasure the type information is removed at runtime and thus the only legal parameterized type for an instance of check is the unbounded wildcard which doesn't provide us any value in an `instanceof` check and thus just adds noise. So doing something like `myObject instanceof List` is the preferred method over `myObject instanceof List<?>`. However once we check the type we should cast to an unbounded wildcard type for additional safety.

```java 
if (myObject instanceof List) {
   List<?> myList = (List<?>) myObject;
   ...
}
```

So in summary, raw types continue to exist in Java for compatibility reasons with code that predates generics and can lead to errors at runtime. Because of this, raw types should not be used and generic types should be used instead to lead to safer, cleaner code. 

