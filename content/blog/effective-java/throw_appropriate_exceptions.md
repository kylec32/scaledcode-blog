---
title: Effective Java! Throw Exceptions Appropriate To The Abstraction
description: A dive into chapter 73 of Effective Java
date: 2021-09-08
tags:
  - java
  - effective java review
  - design
  - architecture
---

Much of _Effective Java_ focuses on building a clean, understandable API and how that is the foundation of a great library. Part of the API of a class is any exceptions it may throw up the stack both checked (where it becomes part of the signature) or unchecked. As writers of the code, it is our responsibility to make sure that there aren't any surprises or anything shocking from this API. One of the ways this can happen is with the exposure of an exception that doesn't make sense for the class we are writing. 

A potential example of a mismatched exception would be if you requested two numbers to be added together and the method threw an `IOException`. I would have many questions if such a method threw an `IOException` but the issue still stands that the exception thrown does not match the abstraction. By throwing this low-level exception you are exposing implementation details to the caller, implementation details that may change in the future but now it is part of your API so it makes it hard to change. So what are some ways to account for this? 

The primary method employed to account for this issue is to do what is called _exception translation_. Exception translation is when you catch a lower-level exception and wrap it in a higher-level exception that matches the abstraction you are dealing with. We can find an example of this in the `AbstractSequentialList` class.

```java
public E get(int index) {
  ListIterator<E> = listIterator(index);
  try {
    return i.next();
  } catch (NoSuchElementException e) {
    throw new IndexOutOfBoundsException("Index: " + index);
  }
}
```

In this case, the interface it is implementing even tells it that `IndexOutOfBoundsException` is the exception that should be thrown from this method. 

A special form of exception translation is when you wrap the lower-level exception in a higher-level exception but also pass the lower-level exception into the higher-level exception as a _cause_. Many methods expose this cause field and it gets passed up to the Throwable class. If a particular method doesn't expose a cause in its construction you can even call `Throwable`'s `initCause` on the exception.  Throwable provides a `getCause` method that can then be used higher in the stack to retrieve the underlying issue. Even more importantly, this cause is exposed via stack traces which can greatly help the debugging of issues. This does expose lower-level details to a calling method indirectly. It, however, doesn't do it very directly thus it doesn't force the caller to handle the low-level exception, but instead, they can still handle the high-level exception and not worry about the low-level implementation details. 

The easiest exception to handle is the exception that doesn't get thrown. We should always strive in all of our code to not throw avoidable exceptions. _Effective Java_ even suggests at times we can work around exceptions and simply log them and keep moving on. I would caution against the use of this pattern though. If we are only throwing an exception in exceptional cases then likely the caller needs to know that something happened and simply hiding it from the caller can be problematic. 

Always remember that any thrown exceptions are part of your API. As such, you should take into consideration what exception you are throwing and bubbling up to your callers. Make sure those exceptions are appropriate to the abstraction your code is working at. If you do have lower-level exceptions being thrown use the _exception translation_ pattern to translate that exception into a higher-level exception type appropriate to your abstraction. Also, consider making use of the _cause_ field in such caught and rethrown exceptions. Through doing this you can end up with easier to read, maintain, and modify code. 