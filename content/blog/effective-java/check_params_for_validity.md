---
title: Effective Java! Check Parameters for Validity
description: A dive into chapter 49 of Effective Java
date: 2020-09-06
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter begins a new section about methods. We start off talking about something that affects all of our methods, that is of checking the validity of the method parameters. This is a concern that affects all of our development. Invalid parameters, if not handled correctly can lead to various issues. From innocuous as delayed errors to something as serious as invalid data being persisted and corrupting all the valid data being processed. 

So how can we mitigate this? It's usually fairly easy. As calls are made into our methods we check to see what if the parameters fit within our acceptable constraints. This may be something like running parameters through `Objects.requireNonNull` or checking if an index is non-negative. Along with writing these checks in our code we also should update our Javadoc and other documentation to explain that these checks are happening and what parameters values are valid and which are not. 

So what methods should we put these checks on. There are a few things to consider. Private and package-private methods you hold complete control over and thus should do the necessary checks before calling, in these methods we should not need to do the validity checks. _Effective Java_ proposes using assertions in these cases instead of validity checks but I have never found that too useful. There are also cases where checking the validity could be expensive and/or will be performed in the regular business logic of the method. 

All of this is solid advice and should be applied in places where this makes sense. It seems to me that much of _Effective Java_'s guidance is largely applicable to library designers. While this is very useful, most developers don't find themselves writing reusable libraries with a wide distribution everyday.

The downside of these validity checks can be that the code gets much less clear. Validity checks, while often simple code, can be fairly lengthy. This is where things like the various `@Nullable` and `@NonNull` annotations can come in as well as JSR-308. The beauty of these tools is that it allows you to add validation while not polluting your code. 

Much of this section will be focussed on writing defensive code. Validating our parameters is a great step in that direction. As we do this we can bring errors earlier in the process, protect our business logic, and overall build a better system. 
 