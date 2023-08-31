---
title: Effective Java! Use Marker Interfaces to Define Types
description: A dive into chapter 41 of Effective Java
date: 2020-09-08
tags:
  - java
  - effective java review
  - design
  - architecture
---

In this chapter _marker interfaces_ and _marker annotations_ are discussed. A _marker interface_ is an interface that has no method declarations but simply is used to _mark_ an implementing class as having a certain attribute. An example of a marker interface is the `Serializable` interface built into the core of Java. Another similar thing you may hear about is of _marker annotations_. These serve a similar purpose of marking a specific item as having an attribute but, as the name suggests, uses an annotation instead of an interface to accomplish its task. So should we use one versus the other? 

_Marker interfaces_, as all interfaces do, define a type. This is really where the core of when they should be used comes from. In defining a type we allow ourselves to use that power to help us at compile time. Let's consider the above example of `Serializable`. The main consumer of this interface, `ObjectOutputStream.write`, could use this ability of knowing it requires an object of the `Serializable` type to define it's `write` method as taking a `Serializable` object. If this was done we would know at compile time (or more likely coding time because of our IDE's help) when we were trying to pass an object that isn't going to work to this method. Unfortunately the designer of this class didn't take the opportunity to make the interface this way and it instead takes an `Object` but it still is instructive of a good potential use for a _marker interface_. Other times when we should use a marker interface is when we see that marker interface as only applicable to subtypes of a certain parent interface. In this case we simply extend the parent interface and then we know that all classes implementing this interface are also of the parent interface. As stated above, if deinfing a type makes sense for the marker you are creating, _marker interfaces_ are the way to go. 

So when do _marker annotations_ make sense? Some of the things can lead us to using one of these instead of interfaces is when we are marking something other than a type. This is obviously impossible with an interface so naturally fits in here. We can also gain value of cohesiveness when working within an annotation heavy framework to follow the norm and use _marker annotations_ rather than _marker interfaces_. This is nice in that the framework all feels put together and you aren't using interfaces sometimes and annotations at other times.

As often is the case when making decisions between two techniques in development, whether to use a _marker interface_ or _marker annotation_ largely comes down to use case. Both of these methods have valid use cases and by understanding those use cases we can make the best decision when writing our code now.