---
title: Effective Java! The Builder Pattern!
description: A dive into chapter two of Effective Java
date: 2019-09-24
tags:
  - java
  - effective java review
  - design
  - architecture
  - post
---

It's time for episode two of the effective Java review series. The topic of today is the builder pattern. Just like our previous chapter this is another creational pattern.

When we are faced with a class that has a significant number of optional members what is the best way to create these objects? The three methods detailed in Effective Java are telescoping constructors, the JavaBean pattern, and the builder pattern. Let's walk through these methods and see where the first two fall short and how the builder pattern can shine. 

*Option 1: Telescoping Constructors*
First up is my least favorite option if you have more than one or two optional parameters. The telescoping constructor. A telescoping constructor is basically a group of constructors that basically covers all the available permutations of parameters that could be used to create an object. Let's look at an example:

```java
public Burger(String bunType)
public Burger(String bunType, List<String> condiments)
public Burger(String bunType, List<String> condiments, String meat)
public Burger(String bunType, List<String> condiments, String meat, String temperature)
```

Looking at these constructors you can see where it gets it's name. Telescoping constructors suffer from a problem talked about in my previous post in this series. With multiple parameters of the same type it can be easy to get lost in what each parameter is what. (Although hat tip to my favorite IDE [Intellij](https://www.jetbrains.com/idea/) for giving little tool tips giving the parameter name). With the above example the problem could be wondering if the fourth or the fifth parameter was the meat. Better not mess that up or else you may end up with a rare meat cooked beef 😕. Another awkwardness that can be seen above is what if I only want want one condiment? Well I need to create collection anyway with something like `Collection.singletonList("Ketchup")` (Hey look, a [factory method](https://dev.to/kylec32/effective-java-tuesday-let-s-consider-static-factory-methods-170p)!). One idea would be to use a varargs but you can only use one varargs argument in a function and it must be at the end so that makes its use limited in this case. A benefit of this method is that you can make an immutable objects which is a good thing indeed. If you only have a single optional parameter or two it can work but as we can see it has some issues.

*Option 2: JavaBeans*
The JavaBeans method is quite straightforward. You start off with having a no arguments constructor and then create setters for each member variable. Something along the lines of:

```java
Burger burger = new Burger();
burger.setBread("Sour dough");
burger.setMeat("Beef");
```

This is pretty straightforward but has it's problems. One of the big ones to me is your object can be an inconsistent state as you are building it. There is a lot less control which is not great. It also feels a little messy and verbose. Another shortcoming of this approach is the lack of ability to create immutable objects. Effective Java goes over a method where some people "freeze" their object but that seems fairly error prone and messy. If there is no risk of half created object and immutability is not desired this method can work fine but we should also consider what this chapter is about. 

*Option 3: Builder Pattern*
This brings us to what this chapter is about, the builder pattern. This pattern gives us the best of both worlds. We get the safety of the telescoping constructor but also get vastly improved readability like the JavaBeans method (I would argue better than the JavaBeans even). In this pattern we create a static class internal to the object we want to create traditionally simply called `Builder`. The methods of the builder object allow the user to set the values of the object and then it returns the builder object back. This allows for a clean fluent API. Once all the calls are made the user calls a parameterless `build` method at which point the object is actually created. The `build` method allows a moment to make sure the object is in a solid state. Personally when I have required attributes with a builder pattern I put them in the initial `build` call. 

What does this give us? For one, the option of immutability. While not always taken advantage of it is an attribute that I personally think is beneficial to have. However the greatest benefit is through the fluent API we have a much more maintainable codebase. It also makes optional parameters much easier to handle. If a consumer of the class doesn't need to set an attribute they simply don't call the method. We can also see that we could call methods to construct multiple attributes with lists and don't run into any of the issues with varargs that we may with the above methods. 

Other languages have ways of handling this with named parameters and optional parameters. This is one of the reasons I like Kotlin. But without this option a builder pattern is solid. There has to be an easier way and indeed there is. One tools that I think should be in every Java developers is Lombok. This processor takes a ton of the boiler plate of writing Java out which is great. They also have a [@Builder](https://projectlombok.org/features/Builder) annotation that will make this very clean for us. There are [some people](https://medium.com/@vgonzalo/dont-use-lombok-672418daa819) that think Lombok is a bad idea but I am definitely not one of them. 

So there you have it. The builder pattern. Have you had any success with this pattern? Are there any pitfalls that you have experienced? Let us know in the comments below. 

