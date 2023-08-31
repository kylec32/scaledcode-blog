---
title: Effective Java! Combine Generics and Varargs Judiciously
description: A dive into chapter 32 of Effective Java
date: 2020-07-07
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

Today we look at the intersection of _varargs_ and _generics_. Both of these features were introduced in Java 5 so they have a long history; however, as we will see in the review of this chapter, they don't work great together. The reason for this is that varargs is a leaky abstraction. If you haven't interacted with a varargs argument before it allows a client of your code to pass a variable number of arguments to your function. It accomplishes this by wrapping them up into an array on the other side. Unfortunately, this array, which feels like it should just be an implementation detail, is exposed and is what leads to the less than ideal interaction between generics and varargs. So let's dig into the details.

We again find ourselves talking about non-reifiable types, which, as a refresher, are types that have less type information at runtime than at compile time. Arrays are reifiable whereas generics are not. If we create a function that takes a non-reifiable varargs parameter we are presented with a warning talking about `Possible heap pollution`. _Heap pollution_ here refers to having a parameterized type that refers to an object that is not of that type. That sounds likely more confusing than it is so let's look at an example:

```java
void badIdea(List<String>... stringLists) {
  List<Integer> integerList = List.of(13);
  Object[] objects = stringLists;
  objects[0] = integerList;
  String myString = stringList[0].get(0);
} 
```

Honestly there are a lot of things wrong with the above function; however, it is a concise, instructive example of what we are after. While the above code compiles, at runtime our last line throws a `ClassCastException` without us ever having written a cast. The reason for this is that the compiler adds an invisible cast there for us which, due to `Object` not being a subtype of `String`, leads to our `ClassCastException` at runtime. This shows that we have lost our type safety which we are seeking when we use generics. Applying this generally, this means we should never store a value in a generic varargs parameter.

Given this unsafety, why would the language designers even allow a parameterized varargs argument? This especially is interesting when you consider that, as discussed before, parameterized arrays are disallowed, why the inconsistency? They allowed this inconsistency to persist as parameterized vararg arguments turned out to be extremely useful in practice. The core language itself uses this capability in a number of places such as `Arrays.asList(T... a);` and `Collections.addAll(Collection<? super T> c, T... elements);`. They can also still be safely used if certain rules are followed.

Given that the core language uses this capability, and you very likely have used the functions stated before, you may ask the question, "Why haven't I seen these warnings you mention?" This is a fair question. Before Java 7 there was no way for the caller or author of methods that used generic varargs to avoid the warnings described above outside of annotating the calling code with `@SuppressWarnings("unchecked")`. This led to a decrease in readability and potential warning fatigue that could lead to becoming blind to real issues. That is why the `@SafeVarargs` annotation was introduced in Java 7. 

The `@SafeVarargs` annotation constitutes a promise from the author of the function that the function is safe to use with a parameterized varargs argument. While there is no way for the language to enforce that the method is safe it allows the author to suppress the warning for the consumer of the function leading to cleaner code on all accounts.

I have mentioned a few times that there are rules to follow to ensure that a method can safely use a parameterized varargs argument so what are they?
1. As we have already seen in the first example, the function should not store any values in the varargs argument. 
2. The function should not allow a reference to the varargs array to escape the function as this could lead to unsafe code having access to the array.

Let's look at another example to see how rule two can hurt our code. Consider the following helper function:

```java
static <T> T[] toArray(T... items) {
  return items;
}
```

This function is fine and simply returns the array provided to it. Now let's add in a function to call it:

```java
static <T> T[] pickTwo(T item1, T item2, T item3) {
  switch(ThreadLocalRandom.current().nextInt(3)) {
    case 0: return toArray(item1, item2);
    case 1: return toArray(item2, item3);
    case 2: return toArray(item1, item3);
  }
  // can't get here
  throw new AssertionError();
}
```

The above function is simply a method to grab two of the provided items at random and return them in an array, nothing special here. This does throw a compiler warning though as we are calling `toArray` with a parameterized type but, other than that, there is no indication of a problem. Finally let's look at the caller of `pickTwo`.

```java
public static void main(String[] args) {
  String[] picked = pickTwo("Item1", "Item2", "Item3");
}
```

The above again is quite simple and there isn't even a warning here when we compile. So what happens at runtime? Again we get a `ClassCastException` from an invisible `String` cast that sits in front of `pickTwo("Item1", "Item2", "Item3")`. Let's walk through why that is. Because the only type that can contain all possible `T` values is `Object`, the compiler allocates an `Object[]` to be returned by `pickTwo.`  Then in our `main` function we are assigning the returned array to a `String[]` with the invisible cast to `String[]` being added by the compiler. All of this put together leads to our `ClassCastException.` This exception is quite annoying as we are a level removed from where the actual issue is and, at the failure site, we don't even have a warning to point us in the direction of our issue. This shows the danger of passing these parameterized varargs parameters to other functions. The only two places where it is acceptable to pass generic varargs arrays is other `@SafeVarargs` functions as well as to a non-varargs function that merely computes something with the array values. 

Let's look at a typical example of a function that correctly uses `@SafeVarargs`
```java
@SaveVarargs
static <T> List<T> flatten(List<? extends T>... lists) {
  List<T> result = new ArrayList<>();
  for (List<? extends T> list : lists) {
    result.addAll(list);
  }
  return result;
}
```
This method is safe because it doesn't set the value of any entry in the array as well as it doesn't pass the varargs array to any untrusted code. 

The rule of thumb is that we should be using `@SafeVarargs` on every function we write that takes a generic or parameterized type. Of note, we cannot annotate a method with `@SafeVarargs` that is overridable because it is impossible to guarantee safety of all overrides of the function. In Java 8 the annotation was legal only on static methods and final instance methods. In Java 9 and beyond it is also legal on private instance methods. 

What alternatives do we have to using generic vararg methods? As suggested in a previous chapter, we can replace many array usages with `List`s. Here is what the above function would look like without varargs but instead using a `List`.
```java
static <T> List<T> flatten(List<List<? extends T>> lists) {
  List<T> result = new ArrayList<>();
  for (List<? extends T> list : lists) {
    result.addAll(list);
  }
}
```
Other than the signature, this method is exactly the same as the above option. We would call it like `flatten(List.of(friends, romans, countrymen))` instead of `flatten(friends, romans, countrymen)` like before. This does add an extra function call to `List.of` that we didn't have with the varargs version, but it does give us the type safety we want and removes the need to annotate the method with `@SafeVarargs.`

Unfortunately varargs and generics do not mix well. That being said, if we can promise the safety of the operations we are performing on the array underlying our vararg parameter, we do have an option of how to suppress the warnings. We also have the option of replacing our vararg usages with `List`s which often can provide us type safety as well as avoid the downfalls of the varargs method. 

