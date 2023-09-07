---
title: Effective Java! Favor The Use of Standard Exceptions
description: A dive into chapter 72 of Effective Java
date: 2021-08-23
tags:
  - java
  - effective java review
  - design
  - architecture
---

 As a developer becomes more proficient in a language one of the significant things that makes them more successful is a solid understanding of the standard library of the language. Through knowing what is available out of the box and how to use it these developers can leverage those existing solutions and focus on solving the real problems at hand. In addition to greater efficiency for the original author of the code, future readers of the code benefit from the use of familiar APIs which can improve readability and maintainability. One such area of the standard library in Java that can be useful to understand is the built-in exception types. 

Let's look at some of the most commonly used exception types and discuss their uses:

_IllegalArgumentException_: This exception is generally thrown when a caller of a function provides an inappropriate value. This could be something like a negative value for the number of iterations of some algorithm.

_IllegalStateException_: This exception is used if, when a method is called, the state of the object is not valid for that operation. Potentially you have a filehandle  and you call `read` before it has been opened. 

_NullPointerException_: This exception only has one direct use by a developer and that is when a `null` value is passed in as an argument and that is not an acceptable value. In this way, it can be looked at as being used as a specialization of the `IllegalArgumentException`. Outside of this use case, I would hesitate to use this exception type.

_IndexOutOfBoundsException_: Another exception type that can be looked at as a specialization of the `IllegalArgumentException` except in this case a user of an API is passing in an index that is out of the calling collection.

_ConcurrentModificationException_: I'll be honest, I haven't found myself needing to use this exception in my own code but maybe I have just not been working in the correct domains to need it. This exception is thrown when a particular object is modified by two different threads when the object is not meant to be used concurrently. This exception is mostly a hint to the caller that something funny is happening as reliably detecting a concurrent modification to an object is difficult. 

_UnsupportedOperationException_: Another exception type that gets less usage. This exception type is used when there is some function in an object's API that is not supported. I say this exception type is used fairly rarely because usually you want to be implementing all of your methods. A valid use of this exception though may be a collection that implements the `Collection` interface but is an unmodifiable collection. Thus when the `add` method is called from the interface it would throw this exception type. If you feel the need to use this exception type, do take a moment to stop and think about whether you are implementing the correct interface and whether it is reasonable that you are not implementing a particular function. 

Some built-in exception types are discouraged from direct use. These would be `Exception`, `RuntimeException`, `Throwable`, and `Error`. The reason being is that these types largely serve the purpose of an abstract class in that they are a jumping-off point for more specialized types. When you use them directly you are making the handler of these exceptions life much more difficult because of how generic the types are. 

Many other built-in exception types in Java can be used for particular situations. Feel free to leverage them when the situation arises but do consider not only the name of the exception but the details and semantics outlined in the JavaDoc of the exception type. If your particular use case does not fit those semantics, think twice before the reuse of the exception. If there is simply more information you would like to add to an exception, a good middle ground would be to extend that exception type and provide your additional data on that subclass. 

Sometimes two exception types seem like they could fit the use cases. In cases such as this, you will need to use your best discretion to decide which one to use. For example, let us consider the case where a function takes in a parameter of how many items to pull out of a bag. If a caller proves 5 as the number of items to pull from the bag and there are only 3 items left, what exception makes sense? On the one hand, `IllegalArgumentException` could be argued to be the correct one as the argument they provided was not valid. On the other hand, it could be argued that `IllegalStateException` would be the correct one as the state of the object could be thought of as the problem and if there were more things in the bag it would have succeeded. The decision criteria _Effective Java_ sets out, which I think is solid logic, is to use `IllegalStateException` if no parameter value would be construed as valid, and `IllegalArgumentException` if that particular argument is invalid within a set of valid arguments.

Having even a shallow exposure to different built-in exception types can be quite beneficial to your code. It can save you time and effort from reinventing the wheel, make your code much easier to understand for future developers as they are already familiar with the types you are using, and even (in extreme cases) help the JVM load a little faster and use less memory in that fewer classes need to be loaded.