---
title: Effective Java! Utility Classes!
description: A dive into chapter four of Effective Java
date: 2019-10-09
tags:
  - java
  - effective java review
  - design
  - architecture
---

Time for chapter four of our Effective Java review! Today is a quick and easy chapter. 

Today we are talking about utility classes. As the author points out these classes can often feel like an anti-pattern and a way of getting around using proper objects. That being said they definitely have their purpose in the world, especially in Java. So let's consider some of the places that utility classes could be beneficial:

* For grouping actions on primitive objects. ie `java.lang.Math`, `java.util.Arrays`
* For grouping actions on classes you don't own. This is similar to the above but in this case its on object that you may not have access to change. `LocalDateUtils` is something I have seen before. This is something that [extension functions](https://www.baeldung.com/kotlin-extension-methods) can solve in a much cleaner manner in languages such as Kotlin.
* They can also be a home for factory methods such as in `java.util.Collections`

So we can see there are some use cases where this is useful so how do we accomplish it? What it really comes down to is not to forget to account for making it not instantiable. We know that even if you don't include a constructor Java will add a default no-args constructor.  

The first method is making the class an abstract class. This does indeed make the class not able to be instantiated directly but doesn't really accomplish what it is after. The reasoning is two fold. First, a user of the class can derive from that abstract class and make the child class can be instantiated in that case. The other problem is that the abstract class doesn't communicate the intent of what is happening. When we see an abstract class it is basically asking to be extended from. 

So what is the other option and the one that Effective Java suggests? Well you probably could guess it but the pitch is to create a private no-args constructor. And simply as that you lose your public default constructor and have protected instantiation of your class. It is even mentioned that your private no-args constructor should have only one line which is throwing an `AssertionError`. This takes it to a further level that even if one of the static methods tries to create the object it will error. Personally the way I usually go about this is using Lombok with `@NoArgsConstructor(access = AccessLevel.PRIVATE)`. You don't get the `AssertionError` being thrown but it is simple and gives us what we wanted. 

So as you can see it is pretty simple and straightforward. If we find ourselves create a lot of utility classes this could be a smell that we are starting to lean towards more procedural programming and potentially there is a better way to accomplish our task. However if we do need a utility class remember to keep your class from being instantiable. 