---
title: Effective Java! Use Bounded Wildcards to Increase API Flexibility
description: A dive into chapter 31 of Effective Java
date: 2020-06-30
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

Today we take on a bit of a complicated topic but one that, when done correctly, can really make your code much more flexible in its usage. Previously we have talked about how parameterized types are _invariant_. This means that for two types, `TypeA` and `TypeB`, `Collection<TypeA>` can not be either a subtype or super type of `Collection<TypeB>`. Making this more concrete, `List<String>` is not a subtype of `List<Object>.` This is because any object can go into `List<Object>` but not any object can go into `List<String>`. While this may follow logically, sometimes we want/need more flexibility and that's what the chapter we are reviewing today covers. 

Let's consider a previous example we looked at.
```java
public class Stack<E> {
  public Stack();
  public void push(E e);
  public E pop();
}
```
Above is the currently exposed API. Let's say we want to add a new method to add many items to the stack at once. We may consider writing it as such:
```java
public void pushAll(Iterable<E> newItems) {
  for (E e : newItems) {
    push(e);
  }
}
```
This will compile and work fine but we do lose some flexibility that we may want. Let's consider an example where this may lead to frustration:
```java
Stack<Number> numberStack = new Stack<>();
Iterable<Integer> integers = ...;
numberStack.pushAll(integers);
```
While the above feels like it should work (`Integer` being a subtype of `Number`) it actually won't compile because of the invariants. This is where our _bounded wildcard types_ come in to save the day. If we simply change the function signature to the following the above code will work.

```java
public void pushAll(Iterable<? extends E> newItems) {
  for (E e : newItems) {
    push(e);
  }
}
```

So what does the above signature, `? extends E`, mean? It basically means it can take any subtype of `E` (as well as `E` itself which can feel a little strange with the `extends` keyword). This indeed fits exactly into what we were after. 

Now let's consider a similar but different case. Let's create the cousin to the `pushAll` function and create a `popAll` function. How this one will work is we will give the function a collection and it will `pop` all the contents of the `Stack` into it. Personally I'm not a huge fan of using parameters as output from a function but it serves to illustrate this point well. So our initial implementation may be something like:

```java
public void popAll(Collection<E> destination) {
  while(!isEmpty()) {
    destination.add(pop());
  }
}
```

Once again this will compile with no issues and is usable but isn't as usable as it could be. Also again we get in trouble with a very similar example that we ran into with the `pushAll` function.

```java
Collection<Number> numberCollection = ...;
Stack<Integer> integerStack = ...;
integerStack.popAll(numberCollection);
```

This feels like it should work just fine but it doesn't because again we get bit by the invariants. The difference with this one is rather than looking for a subtype of E we are wanting a collection passed in that is type of E or a supertype of E. Java provides a way to do this like the following:

```java
public void popAll(Collection<? super E> destination) {
  while(!isEmpty()) {
    destination.add(pop());
  }
}
```

With this new signature the client code with compile and execute fine as well as the Stack code. 

The rule of thumb that we are invited to follow is as follows. If an input parameter is something that we will be reading values from or writing to we should consider the use of wildcard types. 

In the above two examples we used `extends` in one and `super` in another. You may ask, when should I use which one. This is indeed a great question. The mnemonic that the book suggests is `PECS - producer-extends, consumer-super`. Honestly this mnemonic doesn't really work for me as the `producer/consumer` terminology is a bit weird for me in this case. The way that I think of it is `GEPS - get-extends, put-super`. As in, if I'm getting values from it, I should use `extends` and if I'm putting values into it I should use `super`. Use whatever mnemonic works for you or come up with your own! So let's apply this to our examples above. In `pushAll` we were _getting_ values out of the provided parameter to put somewhere else, so we used `extends`. In `popAll` we were _putting_ values into the provided parameter, therefore `super`. This can take some practice to get the hang of thinking about. Let's go through some examples from previous examples in our generic section of the book.

First up, the `Chooser` function originally written as `public Chooser(Collection<T> choices);`. This takes in a selection of choices to be chosen from. Stop reading and thinking about which keyword should we use? Did you say `extends`? Great! Since we will be _getting_ values from the `choices` collection (or in other words, if it's a producer) we use the `extends` keyword.

Next, `public static <E> Set<E> union(Set<E> s1, Set<E> s2);` which takes two sets in and provides a set that is the union of both the sets together. What keywords would we use for our parameters here? Did you say `extends` again? Perfect! Again we are grabbing values out of the provided Sets and therefore we want to use `extends` so the new function would look like `public static <E> Set<E> union(Set<? extends E> s1, Set<? extends E> s2);` But wait, what do we do with the return type, it still has no wildcards, is that OK? Indeed it is, in fact, it's preferred to be that way. Return types shouldn't use wildcards as it forces the use of wildcards on the receiver of those values. As a rule of thumb, if the user of your function needs to think about the wildcards you are using, you are likely doing it wrong. With the above changes we can now write code like:

```java
Set<Integer> integerSet = Set.of(1,3,5);
Set<Double> doubleSet = Set.of(2.0,4.0,6.0);
Set<Number> numberSet = union(integerSet, doubleSet);
```

The above code is great and quite clean in that the compiler is capable of inferring the type that we want. While there were great steps in improving the type inference of Java in Java 8 and beyond we still do run into cases where the compiler is still unable to infer the types for us. In these cases we will get fairly hairy error messages but, thankfully, there is a way to help the compiler along via an _explicit type argument_. Let's see what our above `union` call would need to look like prior to Java 8. 

```java
Set<Number> numberSet = Union.<Number>union(integerSet, doubleSet);
```

Definitely not the prettiest code I have ever seen but at least it's possible and is something you can put in the back of your mind if you ever do run into this type of issue. 

Ok, let's return from that detour to our practice game of `Super or Extends`. Let's consider the `max` function from the previous chapter. `public static <T extends Comparable<T>> T max(List<T> list)`. It's a workout even to type that thing but let's think about how we would write this when in search of greater flexibility. Consider each type parameter individually. What we end up with is `public static <T extends Comparable<? super T>> T max(List<? extends T> list);` That has to be up there with one of the more complicated type signatures I have ever written. Let's consider the two parts. With our `Comparable` part we are providing a value to something there so in that area we are going to want to use `super` whereas in the `list` parameter we are grabbing items from that `List` and thus we want to use `extends`. Rule of thumb is that `Comparables` always are consumers and thus will always use `super`. This added complexity doesn't come without it's benefits though. We are now able to find the max of types such as `ScheduledFuture` which doesn't implement `Comparable<ScheduledFuture>` but instead implements `Comparable<Delayed>` the super type of `ScheduledFuture`. 

There is one last thing to consider. When to use wildcards, and when to use type parameters. Consider the following two function signatures that implement a `swap` function:

```java
public static <E> void swap(List<E> list, int from, int to);
public static void swap(List<?> list, int from, int to);
```

So which one should be preferred? _Effective Java_ says a rule to follow is, if a type parameter only shows up in a method signature once that we should go with the wildcard option (the second option). This also does seem like the simpler type signature. However, before we jump to that solution let's consider how the implementation would work. 

```java
public static void swap(List<?> list, int from, int to) {
  list.set(from, list.set(to, list.get(from));
}
```

This actually won't compile because the only thing allowed to be put into a wildcard collection is `null`. There is a way around this though, with a helper function that can capture the type. So if we change it to the following it will work.

```java
public static void swap(List<?> list, int from, int to) {
  swapHelper(list, from, to);
}

private static <E> void swapHelper(List<E> list, int from, int to){
  list.set(from, list.set(to, list.get(from));
}
```

Because the `swapHelper` function can capture the type of `E` and verify that the operation is safe to do this will work. However, take a look at it again, didn't we just write the first option? We did indeed, so in this case I would definitely vote in favor of going with the type parameter option rather than the wildcard option here. 

This has been a fairly heavy chapter. It will likely take more practice and exposure to these wildcard parameters to really get your mind around them, I know it did for me and I continue to get confused about them at times. As you use these in the wild you will likely find that you use the `extends` option a lot more than you use the `super` option. This is just the nature of the fact that we usually pass parameters in to read from more than we pass them in to put values into. As we use these capabilities of bounded wildcard parameters in our code we can indeed make our code much more flexible and this is very much something that I think is worth the effort. 