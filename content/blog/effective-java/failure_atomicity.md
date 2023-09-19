---
title: Effective Java! Strive for Failure Atomicity 
description: A dive into chapter 76 of Effective Java
date: 2021-10-10
hero_image: https://miro.medium.com/v2/resize:fit/0*5bHlDGwp4Oxz4V4l
tags:
  - java
  - effective java review
  - design
  - architecture
---

Even after an object throws an exception it is expected and desirable that the object is still in a valid state. Unless the exception that is thrown is a fatal exception the application will keep moving forward and thus leaving the object in an invalid state is just asking for further issues. This being the case, we should strive to leave objects in a valid state even after an exception is thrown. 

Let us consider some ways that we can accomplish leaving our objects in a valid state. 

The first of these options is to create immutable objects. This greatly simplifies keeping the state valid even after an exception because the state can't change. Even beyond this, immutable objects have numerous benefits. All this being the case we can't always use immutable objects and thus we need strategies when dealing with mutable objects. 

The first of these mutable strategies is to push all your parameter checking that could cause exceptions to the beginning of your function before making any state changes. The core of this idea is that, once you have passed the parameter checking, there is no way that an exception will be thrown. Let's consider an example of a `Stack.pop` method:

```java
public Object pop() {
  if (size == 0) {
    throw new EmptyStackException();
  }
  Object result = elements[--size];
  elements[size] = null;
  return result;
}
```

By checking the preconditions of the function at the beginning we can throw the necessary exception before we get the object in a bad state. You can imagine if we didn't check the size before processing we wouldn't not only throw an `ArrayIndexOutOfBoundsException` (which wouldn't be appropriate for the abstraction) but also leave the `size` variable negative which is not a valid value. 

A similar approach for mutable objects is to order the operations of a function in such a way that the methods that can fail are performed before any state is changed. This results in the same idea as the previous strategy in that, once we get to the mutable actions, we are guaranteed success.

Yet another strategy would be to perform the operations on a temporary copy of the object that replaces the current state upon success. This does require some additional operations and more memory usage but often it is worth the cost for the safety this would bring. On the flip side, there are certain algorithms (such as some sorting algorithms) that get performance improvements from operating on a temporary copy. 

The final strategy covered is that of writing a _recovery code_ that causes a rollback. This could be accomplished via a DB or file system storage. This method is not used often but can be a good method to have in our back pocket if the situation arises. 

Finally, there are exceptions to any rule. There may be situations that we cannot recover from gracefully such as concurrent modification between two threads.  There could also be situations where the cost of building in this resilience is not worth the cost. In the usual case though this atomicity comes at a low cost as long as we are mindful of the desire to achieve it and already are familiar with the patterns to accomplish it. 

I greatly enjoy these types of thought exercises. When we can use code organization to make our systems more resilient to error it is always a win. Considering and addressing these concerns is one sign of a senior engineer in my mind and that technical leadership can rise all boats in the harbor of our code. 