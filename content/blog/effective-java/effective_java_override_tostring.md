---
title: Effective Java! Override toString
description: A dive into chapter eleven of Effective Java
date: 2020-02-03
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today's topic is a lot less prescriptive than our previous couple chapters where there were very mathematical sounding principles behind the contracts we were to follow. Today's is much simpler. The `toString()` method. As _Effective Java_ points out, `Object` gives us a default implementation of this method but it's rather not useful, especially when you are trying to debug and are simply greeted with something like `Animal@23a5b2`. The documentation for `toString()` even says that "It is recommended that all subclasses override this method." Well all classes are subclasses of `Object` so that must mean it is recommended that all classes should override this method. 

One of the main uses of the `toString` method in my experience is to assist in debugging. Whether you override the `toString` method or not developers will try using the `toString` method for debugging. There is an art to knowing how much of the objects data to expose via the `toString` method. You should try to expose as much information as possible via the method but obviously a large object may not be able to practically expose all that information. In these cases we must just use our judgement to determine which fields are the most useful.

A decision that must be made is whether to document the format with which the method will return. With such a contract the users of your class can expect what will be returned and can use it in expected ways. If you do define the contract it can be a good idea to also provide a static factory method that takes the string representation and creates the object (this of course would be impossible if not all the data was exposed via the `toString` method, see above). Of course the downside of specifying the format is that you will then be stuck with that format for life and thus end up with a loss of flexibility. 

Another item to keep in mind as well is to expose all the data in the `toString` method via regular getters as well. What we want to avoid is forcing a developer to parse the output of the `toString` method in order to get at the information they need. Not only will this not be performant but also error prone. 

There are some times that overriding the `toString` method can be skipped such as in enums and utility classes. 

Once again we find a place where Lombok can help us overcome the boilerplate. Lombok's `@ToString` annotation has a very specific format. It's a fairly solid format that gets the information out in a simple manner. There definitely can be better formats for a particular context but it uses a good default. 

Thankfully this chapter was a little simpler than our previous chapters. Overriding the `toString` method is one of those little things that doesn't get much attention but it's the little things that matter. 