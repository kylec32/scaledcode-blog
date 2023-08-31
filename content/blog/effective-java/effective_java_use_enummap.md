---
title: Effective Java! Use EnumMap instead of Ordinal Indexing
description: A dive into chapter 37 of Effective Java
date: 2020-08-10
tags:
  - java
  - effective java review
  - design
  - architecture
---

We again consider another special collection type that handles `enum`s in an efficient manner. This time we consider `EnumMap`s. Let's consider some code that doesn't use an `EnumMap` and instead uses the `ordinal` built in function. As discussed in a previous chapter this is a function that should only be used by internal libraries and not by our code.

```java
class PLant {
  enum LifeCycle {ANNUAL, PERENNIAL, BIENNIAL }

  final String name;
  final LifeCycle lifeCycle;

  Plant(String name, LifeCycle lifecycle) {
    this.name = name;
    this.lifecycle = lifecycle;
  }

  @Override
  public String toString() {
    return name;
  }
}
```

Now let's say we have a bunch of plants in our garden and we want to collect our plants together into groups of their lifecycles. To do this we create three sets and iterate through the garden and put the plants in the correct location.

```java
// Using ordinal() to index into an array. Boo.
Set<Plant>[] plantsByLifecycle = (Set<Plant>[]) new Set[Plant.LifeCycle.values().length];

for (int i=0; i < plantsByLifeCycle.length; i++) {
  plantsByLifeCycle[i] = new HashSet<>();
}

for (Plant p : garden) {
  plantsByLifeCycle[p.lifeCycle.ordinal()].add(p);
}

for (int i = 0; i < plantsByLifeCycle.length; i++) {
  System.out.printf("%s: %s%n", Plant.LifeCycle.values()[i], plantsByLifeCycle[i]);
}
```

This code does work but it does have various problems. This code doesn't compile cleanly because arrays and generics aren't compatible with each other. This requires an unchecked cast. The indices also don't have any meaning so we have to come with our own ways of bringing back the values. The is also a disconnect on the simple `int` that is returned from the ordinal and what it actually means. This requires us to be very careful with this work. The one benefit we have is that this code is quite performant.

Now let's consider the `EnumMap` version of the same code:

```java
Map<Plant.LifeCycle, Set<Plant>> plantsByLifeCycle = new EnumMap<>(Plant.LifeCycle.class);

for (Plant.LifeCycle lc : Plant.LifeCycle.values()) {
  plantsByLifeCycle.put(lc, new HashSet<>());
}

for (Plant p : garden) {
  plantsByLifeCycle.get(p.lifeCycle).add(p);
}

System.out.println(plantsByLifecycle);
```

We see the benefits here. No unchecked exceptions, cleaner code, no need to label our own values, and, due to the fact of the optimized implementation, we still get great performance. We can even shorten this further by using streams.

```java
System.out.println(Arrays.stream(garden).collect(groupingBy(p -> p.lifeCycle, () -> new EnumMap<>(LifeCycle.class), toSet())));
```
This is much more terse and still quite understandable. Do not that we do need to use the `Collectors.groupingBy` implementation that allows including a `mapFactory` to have it create a `EnumMap` rather than the traditional `Map` implementation it would create. 

While we can come up with more complex examples, and the book does, the above example is instructive enough to get the point. This again is a situation where there really is no benefit for not following this guidance. We get better type safety, equal performance, and more concise code. 
