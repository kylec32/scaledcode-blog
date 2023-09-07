---
title: Effective Java! Design Method Signatures Carefully
description: A dive into chapter 51 of Effective Java
date: 2020-11-16
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter takes us through a grab bag of different tips for good method design. Methods are something we will interact with everyday so good method design is extremely important.

_Choose Method Names Carefully_
The names of methods are often the first thing we will interact with when using a piece of code. Having a good descriptive name can make it easy to discover the method that we are looking for as well as serve as simple documentation. When writing our method names we need to walk the line between overly terse names and overly long methods. Personally I think erroring on the side of longer is probably worth your time. 

_Don't go overboard on providing convenience methods_
This tips gets more into the length of the method bodies. Methods shouldn't do too much (single responsibility principle) but they also should do something meaningful and generally useful. This goes doubly for interfaces where the implementers are forced to implement the methods we define. 

_Avoid lengthy argument lists_
Methods that take many parameters are full of problems. Even though modern IDEs can help us along our way it still can get pretty confusing and you may not always have the IDE to help you know what parameters are (for example in your source control tool during code reviews and the like). We should shoot to keep our argument lists to four parameters and below, preferably two or less. Something else that can make this worse as well is multiple parameters of the same type. When parameters are of the same type it is trivial to transpose arguments and the compiler can unfortunately not help us when this happens. Let's consider some options:
* _Break up the method into multiple methods with less parameters each_: Where these smaller methods can make sense and stand on their own this can be a great option.
* _Creating a Helper Class_: Where the same group of parameters is being passed to various methods this can be a useful process. You create a value object that simply holds values and use a builder or setters to set the values on it before passing to methods. 
* _Builder Method-Like_: This is probably the most different type. This is a slight change to the builder pattern where instead of object creation it is used for method invocation. The different methods can be used to gather information and then the last method would be `execute()` (instead of `build()` for builder). At which point parameters would be checked for validity and business logic executed. It's an interesting system and I'm not sure I have found a great place to use this pattern. 

_Use Interfaces as Parameters, Not Classes_
This is pretty connected to much of what we have talked about in previous chapters. We should expose and accept interfaces where available and not on concrete classes. There is basically no reason to have an argument type that specifies the concrete class rather than the interface.

_Prefer Two Element Enums over Booleans_
This is an interesting one but it makes sense to me. For example if we have a method that provided temperatures and could provide them on different scales rather than taking a parameter like `isCelcius` we should create the following enum:

```java
public enum Scale {
  CELSIUS, FAHRENHEIT
}
```
This allows clearer method calls while still allowing extension to other values such as `KELVIN` someday. 