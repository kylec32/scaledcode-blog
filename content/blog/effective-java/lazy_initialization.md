---
title: Effective Java! Use Lazy Initialization Judiciously
description: A dive into chapter 83 of Effective Java
date: 2021-12-08
tags:
  - java
  - effective java review
  - design
  - architecture
---

_Lazy initialization_ is the pattern of putting off the creation of an object or process until it is needed. The idea behind this pattern is that you may never need the object and thus you saved the initialization costs. The main reason that lazy initialization is used is as an optimization. The other use that lazy initialization has is breaking tricky circular dependencies in your code.

As discussed in a previous item going down the path of optimizations is often fraught with peril and we can sometimes even decrease performance in the search of performance improvements. As with all optimizations, we should test out and confirm that we will truly see the improvements we are after. With lazy initialization, this will largely rely on how often we can completely avoid initialization of the object and how expensive that initialization is.  Of note though, bringing in lazy initialization, especially in the presence of multiple threads, can introduce a new level of complexity which might not be worth its cost. For these reasons, unless presented with hard evidence to the contrary, you should use eager instantiation in almost all cases. 

Let's say that we have determined that lazy instantiation is required, let's look at a few patterns of how to accomplish it. The first method can be used when trying to break a circular dependency since it is the simplest:

```java
private FieldType field;

private synchronized FieldType getField() {
  if (field == null) {
    field = computeFieldValue();
  }
  return field;
}
```

This ends up being fairly simple. Within a synchronized method, determine if the field is initialized, if it isn't, initialize it, if it is, just return it. The `synchronized` keyword allows us to use this method with concurrent threads at the cost of some performance. This same pattern can be used with a static field by simply marking the field as static and the function as static.

The next pattern we can use is useful when we need to lazily initialize a static field with a pattern called _lazy initialization holder class idiom_. This idiom uses the guarantee that a class will not be initialized until it is used.

```java
private static class FieldHolder {
  static final FieldType field = computeFieldValue();
}

private static FieldType getField() {
  return FieldHolder.field;
}
```

This is quite a beautiful pattern. On the first call to the `getField` method, the object reads `FieldHolder.field` at which point the class will be initialized. This idiom doesn't require any explicit synchronization as that will be provided only on the initialization of the class and only does a field access which means it's going to be extremely performant as well. 

The next use case we may find ourselves in is needing to do lazy initialization for performance reasons on an instance field. In this case, we should look at the _double-check idiom_. This pattern avoids the cost of synchronization once the field is initialized with the trade-off that we need to check the field twice. It first checks the field to determine if it should look into initializing the field. If it appears it needs initialization then it obtains the lock and then double checks that initialization is still required.  Because there is no locking once initialized the field must be marked as volatile.

```java
private volatile FieldType field;

private FieldType getField() {
  FieldType result = field;
  if (result == null) {
    synchronized(this) {
      if (field == null) {
        field = result = computeFieldValue();
      }
    }
  }
  return result;
}
```

The code is a bit convoluted, to be honest, but via that convolution there are benefits. The need for the local `result` variable may seem unclear. The purpose of this local variable is to ensure that in the common case (the case where the field is initialized) it is only read once. While not necessary it can improve performance. In the case where a field can tolerate repeated initialization, we can instead use the _single-check idiom_. As the name suggests, this pattern drops one of the checks to simplify the code at the cost of possible multiple initializations. 

```java
private volatile FieldType field;

private FieldType getField() {
  FieldType result = field;
  if (result == null) {
    field = result = computeFieldValue();
  }
  return result.
}
```
The final variant that can be considered is if we are OK with up to a reinitialization per thread and the field is of a primitive type (except `long` and `double`) we can forgo the `volatile` keyword. On some architectures that can lead to greater performance. 

There are many complications when trying to tackle lazy initialization. If at all possible we should avoid it. That said if after testing it is confirmed it will be of benefit, lazy initialization can be useful for improving performance or breaking a circular dependency. There are proven methods we can use presented above that balance safety and performance even in a concurrent environment. 
