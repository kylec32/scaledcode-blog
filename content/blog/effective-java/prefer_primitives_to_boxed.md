---
title: Effective Java! Prefer Primitive Types to Boxed Types
description: A dive into chapter 61 of Effective Java
date: 2021-04-15
tags:
  - java
  - effective java review
  - design
  - architecture
---

Types in Java come in two flavors, _primitive_ types (_int_, _long_, etc) and _reference_ types (_String_, _List_, etc). Each primitive type has a corresponding reference type called a boxed primitive. Java does have autoboxing and unboxing which can abstract away the difference between these types but not completely as we will see. Let's look at a few examples of where we can get in trouble with using primitives and reference types together.

To start off we need to consider the main differences between primitive and reference types:
1. Primitives identity and values are the same. Boxed types have distinct identity values from what their value is. 
2. Primitives always have a value, boxed types also have the option of having `null` as a value.
3. Primitives are more time and space efficient.

Now let's go over an example of how each of these can get us in trouble.

Consider the following attempt at building a comparator for sorting `Integer values`.

```java 
Comparator<Integer> naturalOrder = (i, j) -> (i < j) ? -1 : (i == j ? 0 : 1)
```

The above comparator seems like it could work and in some cases it  would work.  The problem comes in with `i == j`. This is comparing the identities of the variables which is almost never what you want because the identity and value of boxed types are different. This being said let's look at another example.

```java
Integer int1 = 42;
Integer int2 = 42;
System.out.println(int1 == int2);
```

Based on what was just discussed, what would you expect this to return `false` but it actually returns `true`, but why? We weren't lying above in that `Integer` identities and values are separate but in fact what we are seeing above is an optimization Java has taken. All `Integer` values between -128 and 127 are returned by using a pre-setup `Integer` pool of objects. Because the two `Integer` objects are actually the same object (have the same memory address) that is why the above check returns `true`. Obviously we shouldn't count on this optimization when checking equality between `Integer` types but it is an interesting optimization to learn about.

Let's now consider a different program:

```java 
public class Failure {
  private Integer myValue;

  public static void main() {
    if (myValue == 42) {
      System.out.println("Answer to the Ultimate Question of Life, the Universe, and Everything");
    }
  }
}
```

What would you expect this program to output? It turns out it doesn't print out the message and also doesn't just not output nothing, it throws a `NullPointerException`. As noted in item two above; although primitives always have a value, boxed types can also not have a value and this is indeed their default state. When you mix primitive types and boxed types like we do above the boxed type will be unboxed which in the case of the boxed type being `null` leads to a `NullPointerException`.

The final code we will review is the following:

```java
public static void main() {
  Long sum = 0L;
  for(int i=0; i < Integer.MAX_VALUE; i++) {
    sum+=i;
  }

  System.out.println(sum);
}
```

This code does actually work and gets the right answer. The problem is it's slow. A quick test on my machine just barely led to it taking a little over 5s, that doesn't feel right. Now what if we change `Long sum = 0L`; to `long sum = 0L`, just lowercasing the `L` thus converting it from a boxed type to a primitive. This tiny change leads to it taking about 700 mx, a more than 5x improvement in speed! What we are seeing here is the time and space tradeoff we accept when using a boxed type. While sometimes this won't be that big of deal, in others it can have a measurable effect. 

So when should we use boxed types instead of primitives. There are a few cases that come to mind:
1. When `null` is an acceptable value for the variable.
2. You must use boxed types in parameterized types. You can't use primitives here so that makes it a pretty easy decision. 
3. When making reflexive calls.

The above shows some of the dangers we can run into when using boxed types instead of the primitive siblings. Autoboxing does make working with boxed types more convenient but it doesn't make it any safer. This being the case, default to using primitives whenever you can. 

