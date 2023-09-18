---
title: Effective Java! Document All Exceptions Thrown By Each Method
description: A dive into chapter 74 of Effective Java
date: 2021-09-09
hero_image: https://miro.medium.com/v2/resize:fit:720/0*PoHOhaiKpDG8TSTU
tags:
  - java
  - effective java review
  - design
  - architecture
---

Documentation is critical for quickly understanding a class and its methods. Exceptions, both checked and unchecked, are part of the contract of a method and thus should be properly documented to allow users of your code to quickly understand how your code behaves.

Part of what makes good documentation is that it is very specific. While it is not a lie to document that a method throws `Exception` or even `Throwable` it isn't useful. We should be striving to throw (and by extension document) the most specific exception type possible. This is of particular import when we are documenting an interface where the interface's documentation will serve as the common documentation for all the implementations.

JavaDoc offers a simple way to document exceptions thrown by a method by using the `throws` tag. This first-class support for exceptions in JavaDoc can be used for both checked as well as unchecked exceptions. A particular thing that can be extra beneficial about documenting these exceptions can turn into the documentation of the _preconditions_ for the method which can be extremely useful for users of your class. If a particular exception will be thrown from each method in a class you can choose to use a class level comment which can clean up the documentation to an extent.

Documentation is extremely important. We may not always see the immediate payoff of this documentation but in the grand scheme of things, it can pay for itself many times over. 