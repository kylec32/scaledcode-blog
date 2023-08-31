---
title: Effective Java! Use EnumSet Instead of Bit Fields
description: A dive into chapter 36 of Effective Java
date: 2020-08-03
tags:
  - java
  - effective java review
  - design
  - architecture
---

Sometimes when we have an enumerated type that is primarily used in sets developers will set each value as an `int` or `long` with each being a different power of two. Something like the following:

```java

public class TextStyles {
  public static final int STYLE_BOLD = 1 << 0; // 1
  public static final int STYLE_ITALIC = 1 << 1; // 2
  public static final int STYLE_UNDERLINE = 1 << 2; // 4
  public static final int STYLE_STRIKETHROUGH = 1 << 3; // 8

  public void applyStyles(int styles) { ... }
}
```

This class can then be used using bitwise ORs to combine styles. For example:

```java
text.applyStyles(TextStyles.STYLE_BOLD | TextStyles.STYLE_UNDERLINE);
```

We can also perform union and intersection operations with this setup. It also proves to be very space efficient. All of this being said, this system suffers from the same issues that we discussed in the previous chapter. While debugging this system likely suffers from even further confusion as figuring out the current state of the variables requires considering the bits of each value. Another thing that we need to consider is how many enumerated types we will ever need to determine if we need an `int` or `long`. If we need to change this type later it is difficult to change the API throughout the system.

There is a better way built into the `java.util` package in the form of the `EnumSet` class. This class implements the `Set` interface with all of it's richness, type safety, and interoperability. On top of this the implementation is extremely efficient in using a single `long` internally if the enum holds less than 64 values. Bulk actions on the set are also performed with bitwise operations. This means that the performance is comparable to the bit method described above. This ends up being the best of both worlds. 

Let's see what our above example would look like using a proper `enum` and `EnumSet`:

```java
public class TextStyles {
  public enum Style { BOLD, ITALIC, UNDERLINE, STRIKETHROUGH }

  public void apply(Set<Style> styles) { ... }
}
```
and it's use:
```java
text.apply(EnumSet.of(Style.BOLD, Style.UNDERLINE));
```

This leads to a much safe and extensible system. This is one of the rare examples where we don't really have any real downsides. We get to keep the performance we desire with the richer API of the collections.

