---
title: Effective Java! Favor Generic Types
description: A dive into chapter 29 of Effective Java
date: 2020-06-16
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

Using a generic type in our declarations is quite simple. The next step is allowing generics to be used in the types we create ourselves. Let us consider the following class that doesn't use generics:

```java
// Simple stack
public class Stack {
  private Object[] elements;
  private int size = 0;
  private static final int DEFAULT_INITIAL_CAPACITY = 16;

  public Stack() {
    elements = new Object[DEFAULT_INTITIAL_CAPACITY];
  }

  public void push(Object e) {
    ensureCapacity();
    elements[size++] = e;
  }

  public Object pop() {
    if (size == 0) {
      throw new EmptyStackException();
    }
    Object result = elements[--size];
    elements[size] = null;
    result result;
  }

  public boolean isEmpty() {
    return size == 0;
  }

  private void ensureCapacity() {
    if(elements.length == size) {
      elements = Arrays.copyOf(elements, 2 * size + 1);
    }
  }
}
```

This class will definitely work but it's not very convenient nor safe to use. In order to get anything productive done with this class we need to cast all accesses which can make our code less clear as well as can lead to accidents with type management. Never fear, we can simply generify this and fix these problems. Let's take a look. The main thing we need to do is replace all places we mention `Object` with `E` as well as call out the generic type in the class declaration.

```java
// Simple stack
public class Stack<E> {
  private E[] elements;
  private int size = 0;
  private static final int DEFAULT_INITIAL_CAPACITY = 16;

  public Stack() {
    elements = new Object[DEFAULT_INTITIAL_CAPACITY];
  }

  public void push(E e) {
    ensureCapacity();
    elements[size++] = e;
  }

  public E pop() {
    if (size == 0) {
      throw new EmptyStackException();
    }
    Object result = elements[--size];
    elements[size] = null;
    result result;
  }

  // No further changes.
}
```

Cool, we are done, right? Unfortunately not as the above code won't compile. The problem we run into is what we discussed in our previous chapter, we are attempting to create a generic array which isn't allowed due to the fact we can't create arrays of non-reifiable types (which generic are). There are two main ways we could choose to solve this. Let's look at them. 

The first, and the preferred way, is to create an `Object` array and cast it to a generic type. We end up with something like `elements = (E[]) new Object[DEFAULT_INITIAL_CAPACITY];` This will now compile but we are presented with an unchecked warning at compile time. We get this warning because the compiler cannot guarantee our type safety here. However, as discussed in a previous chapter, we may be able to prove it's safety to ourself. If we look through the class we see that the `elements` array is private and only insert objects of type `E` so it appears to be safe. Given this, we can add `@SuppressWarnings("unchecked")` to the constructor and not be bothered by the warning.

The second option is to cast each object retrieval to the type `E`. This will also give us an unchecked warning which we can also verify are safe and suppress as well. 

Both of these solutions give us compilable code as well as equivalent type safety. The first however is more readable and much more contained versus the cast at each access of the second solution. Because of this, the first solution is preferred and most commonly used. 

The above example may seem like it breaches our previous chapter's topic of preferring Lists over arrays. And, indeed, it does kind of go against that. However, often this is required as Lists are not natively supported in Java. Thus, if you were implementing something like an `ArrayList` you would need to use an array. 

One final thing to consider is that, while it can be nice to make unbounded types in our generics it can sometimes be required or perferred to put some limits on what types our generic parameters take. For example lets consider `java.util.concurrent.DelayQueue` which is declared like `class DelayQueue<E extends Delayed> implements BlockingQueue<E>`. This limits what this type parameter can take to only be types that are subclasses of `Delayed.` While this is a limitation, it allows DelayQueue to call into the methods declared on the `Delayed` type inside it's implementation. Definitely something to keep in our back pocket.

All of this to say, generics are safer and easier to use than non-generic types. When we are write new code it is preferred to make it so that casts are not required when it's used. The way to accomplish this is often by using generics. Even if you have already created a type without generics, you can often generify it after the fact without breaking current usages. 