---
title: Effective Java! Prefer Collection To Stream as a Return Type
description: A dive into chapter 47 of Effective Java
date: 2020-10-19
tags:
  - java
  - effective java review
  - design
  - architecture
---

Often when writing methods we will find ourselves returning a group of items. This may be getting generated at run time, returned from a persistence store, or some other method. With our new found tools of streams we may look to return a `Stream` object as well from these methods. This sometimes can make a lot of sense but at others is not the correct choice. That is what this chapter is all about, deciding when to use collections and when to use streams. 

In a perfect world we will always know which object type should be returned. Often we don't live too far from this perfect world. When writing code that will only be used internally to a class or package we have total control over its usage. In these cases we can more easily choose the correct response type. How do we determine the correct response type though? This is all based on usage. If we are simply going to iterate over a list an `Iterable` is very likely what we want to use, if we have a small finite list of objects that we will be indexing into, ask for its size, etc, this is a good case for a `Collection` type. Finally, if we are dealing with infinite collections of data and/or dealing will just be further processing items after being returned from the function a `Stream` is likely the best choice. 

When we are building a public interface into our classes we aren't so lucky. No longer having control over the clients of our code we must further analyze the usage patterns of our code. We will never be able to fulfill all clients demands but the hope is that there will be a small set of usual patterns that we can latch onto and facilitate the best return type for these access patterns. The selection criteria would follow the same ideas as expressed in the previous paragraph. 

The book goes into much more detail with interesting examples where unbounded collections of data are being returned that can most correctly be served by a stream or a custom Iterable implementation. Even though this is quite powerful it is pointed out that really the most flexible, and thus should be our default, is the simple `Collection`. This is easily converted into a stream or can be iterated over. This being the case, outside of specific use cases that drive for it, we should prefer returning collections over returning streams.

This whole chapter can be summed up in its title, prefer returning collections over streams. Even this being the case, knowing where our different types thrive can be instructive to us to understand where the exceptions lie and have the confidence to not use the wrong tool for the job. 