---
title: Effective Java! Eliminate Unchecked Warnings
description: A dive into chapter 27 of Effective Java
date: 2020-06-01
tags:
  - java
  - effective java review
  - design
  - architecture
---

As you start to use more and more generics you often will run into more unchecked warnings. Because Java has backwards compatability via raw types, as discussed in our previous chapter review, the compiler will not prevent us from writing type unsafe code. Even though it won't prevent us from compiling it will give us warnings. It is these warnings that we are focusing on in this chapter. 

As far as warnings go there are some that are harder to address than others. Some warnings simply require us to add the type to the declaration. For example the following code will throw an unchecked warning:

```java
Set<String> myStrings = HashSet();
```

We can fix it as simply as:

```java
Set<String> myStrings = HashSet<>();
```

We don't even need to list the type on the right-hand-side in this case as the diamond operator (`<>`) will cause the compiler to infer the type. Some other cases may not be as easy to remove the unchecked exceptions but if we can get rid of all the unchecked exceptions we can gain confidence that we won't have a `ClassCastException.`

So what if we find ourselves in a situation where we either can't get rid of the warning or the warning is showing up even though we know there is no risk of a class cast exception? If we have no other options the next step would be to annotate the unchecked usage with the `@SuppressWarnings("unchecked")` annotation. This, as the name suggests, will suppress the warning so that we don't get buried in warnings and so we can give the proper attention to future unchecked warnings. So what should we keep in mind when suppressing these warnings?
 * Only suppress warnings for locations you know are already type safe.
 * Put the suppress warnings annotation on smallest scope you can to accomplish the desired suppression.
 * Provide a comment for future developers of why the suppress warnings annotation is there and why it is still safe. 

That's what it comes down to. Remove all warnings (honestly all warnings not just the unchecked ones that we are focusing in this chapter) and for all places where you can't fix the warnings, suppress the warnings.  
