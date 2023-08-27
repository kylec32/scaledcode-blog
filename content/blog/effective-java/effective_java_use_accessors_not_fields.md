---
title: Effective Java! In Public Classes, Use Accessors, Not Public Fields
description: A dive into chapter sixteen of Effective Java
date: 2020-03-10
tags:
  - java
  - effective java review
  - design
  - architecture
  - encapsulation
---

Today we have a pretty quick and easy topic. Very much related to our previous item about keeping accessibility as low as possible. Today's topic is about using accessor methods instead of providing public access to fields. 

The core of what this chapter comes down to is to resist the urge to make fields of a class publicly accessible. By making these items accessible we surrender the encapsulation of the class and all the benefits it brings. You can't change the representation of the data, enforce invariants, or perform other actions when a field is accessed. While many _hard-core_ object oriented programmers, as Effective Java puts it, will say that all fields should have accessors and none should be accessible outside of the class Effective Java disagrees in some cases. While it agrees that this should be the case with _public_ classes, it suggests that this may be unnecessary with package-private and private classes. The main reason for this pitch is that you can avoid the visual clutter while still keeping safety as the blast radius is low when changes need to be made. It's up to you and your organization if you agree (below I will share a way to decrease the clutter).

What about other exceptions? Exposing constant values from a class can be acceptable in some cases. There are still trade-offs, For example you cannot change the internal representation of the value nor can you do auxiliary actions when data is accessed. However, you can enforce invariants in that there isn't any varying of data in constants.

Finally, how can we lessen the visual clutter of accessors. As pitched numerous times in this blog series, _Lombok_ again comes to the rescue. Lombok has the `@Getter` and `@Setter` annotations that do just as they sound like, provide getters and setters. This allows very low clutter in your code and you still get the ability to implement the method yourself later and enforce invariants, do auxiliary actions, etc. 

That's it for this chapter. It's pretty straightforward and simply allows you to keep control of your classes. With modern tooling it doesn't even create much clutter. 


