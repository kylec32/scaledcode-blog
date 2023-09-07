---
title: Effective Java! Avoid Unnecessary Use of Checked Exceptions
description: A dive into chapter 71 of Effective Java
date: 2021-08-16
tags:
  - java
  - effective java review
  - design
  - architecture
---

Many developers are not fans of checked exceptions. _Effective Java_ argues that this doesn't need to be the case. The defining feature of a checked exception is forcing the caller to handle the exception either by catching it or by passing the exception up the call stack via its signature. 

Why does being forced to handle checked exceptions bother developers though? I would suggest that it is because they don't know how to handle the exception. Because of this, the compiler forces you to handle it puts the developer in a tough position where no choice feels correct. This is where the difference lies I believe. If, more often than not, the developer that is presented with a checked exception has a clear way of handling it I think this is a good use of the checked exception. It forces the developer to do something that they already are wanting to do. If, however, there is not a clear way forward a checked exception is not the correct way to go. This does entail a tricky line to walk, how can you know at API development time what exceptions will have reasonable ways of handling them at API use time? It is for this reason that I would error on the side of runtime exceptions unless you are absolutely sure.

Other mechanisms that can facilitate some of the desired benefits of checked exceptions. One of these is providing a function that can check whether an operation is allowed that can be called before the operation is called. This may not work all the time but can be a tool that can be useful.

Another technique is to return an `Optional` and return an empty optional when the data can't be processed. This again can work but we lose the ability to have typed exceptions with state and functions that we get with exceptions in Java. It could also be argued that if this technique makes sense in your case you likely don't have an exceptional case happening and thus you shouldn't have been using exceptions anyway.

Checked exceptions should be used sparingly. This is because they often can make an API painful to use. If a caller doesn't have a reasonable way to handle a checked exception then all they can do is ignore it or pass on the problem to the next caller which leads to more complicated code with no benefit. 