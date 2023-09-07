---
title: Effective Java! Avoid Strings When Other Types Are More Appropriate
description: A dive into chapter 62 of Effective Java
cover_image: https://images.unsplash.com/photo-1619133080807-a9e3266b3449?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80
date: 2021-04-26
tags:
  - java
  - effective java review
  - design
  - architecture
---

Often when receiving data from files, HTTP requests, keyboard input, etc. we receive that data as a _String_. Often we just keep these variables as a `String` even if a different variable type is more appropriate. The most appropriate type depends on what we are trying to represent; if we are trying to represent a finite set of items we may use a _enum_, true/false means boolean, numbers could be an `int`, `long`, or even `BigInteger`. The benefits of using the appropriate type are as follows:

* Performance improvements with not having to convert back and forth between the _String_ type.
* The built in functions of the type work correctly for that type such as `equals`, `hashcode`, etc. 
* Less error prone.

It can sometimes take a little more effort to save our variables as the correct type, especially if they are provided as a `String` initially. The payoff is worth it and will keep your code much cleaner. 

