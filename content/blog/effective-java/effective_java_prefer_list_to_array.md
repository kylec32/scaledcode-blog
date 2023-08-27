---
title: Effective Java! Prefer Lists to Array
description: A dive into chapter 28 of Effective Java
date: 2020-06-09
tags:
  - java
  - effective java review
  - design
  - architecture
---

When we want to hold an ordered, indexable collection of items in Java we have two main options: arrays and Lists (OK so there are other data structures but for the sake of this argument we will focus on Lists as it can serve the place of any generic collection as far as the rules that will be considered in the post are concerned). 

These two data structures are different in many ways but one of the main things is arrays are _covariant_ which simply means that if `Sub` is a subtype of `Super` that means that `Sub[]` is a subtype of `Super[].` Lists on the other hand are _invariant_ which means that `List<Sub>` would not be a subtype of `List<Super>`. This can seem like arrays have more capabilities than Lists but there are benefits to this. Let's look at one, consider the following:

```java
Object[] objectArray = new Long[1];
objectArray[0] = "Store a non long"; //ArrayStoreException


List<Object> objectList = new ArrayList<Long>(); // Won't compile
```

So as we see here one of the nice things is that we can get some of our issues raised sooner at compile time rather than at runtime. 

Another big difference between arrays and Lists is that arrays are _reified_ which basically means that the array knows its type and enforces it at runtime. This is why, in the above example, it throws the `ArrayStoreException` at runtime, it knows its type and is enforcing it. In contrast, as discussed in a previous chapter, generics are implemented via _type erasure_ and thus the type information is not known at runtime and thus is enforced at compile time.

Because of these fundamental difference, arrays and lists don't intermix well. This means that the following are illegal declarations: `new List<E>[]`, `new List<String>[]`, and `new E[]`. If the previous declarations were allowed, we would end up in situations where we would lose our type safety that generics are supposed to enforce at compile time.

While not discussed in the book another reason that I will often use a List (or other generic collection type) is that the API for interacting with it is much richer. Whereas arrays are largely just storage containers a List has behavior that can be taken advantage of to implement your code.

From what is mentioned above it looks like Lists have a lot of benefits. What do arrays offer that can be better than lists? One thing is that we can lose some performance if we use a List instead of an array. Simply being a container of items, this can lead to faster code. Although this is something to consider, and may be something meaningful for your code, often our code can benefit more from taking advantage of the type safety as well as convenience of Lists. Another thing that I do like about arrays is that they can take primitives rather than having to settle for the boxed types meaning I can create an array such as `int[] myValues = new int[]{}` but I can't make a list like `List<int> myValues = new ArrayList<>();` and instead have to settle for `List<Integer> myValues = new ArrayList<>();`. Is it a large difference, no, but I try to avoid boxed types when I can because I don't like the ability for it to represent `null` as well as boxing and unboxing seem like unnecessary conversions to me.

It is helpful to know the different type rules that control arrays and lists. Arrays are _covariant_ and _reified_ whereas lists are _invariant_ as well as _non-reified_. What this means for our code is that arrays and Lists don't mix well, if we find ourselves trying to mix them, we should default to using just Lists. 