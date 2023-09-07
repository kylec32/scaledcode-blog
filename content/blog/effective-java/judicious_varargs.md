---
title: Effective Java! Use Varargs Judiciously
description: A dive into chapter 53 of Effective Java
date: 2020-12-03
tags:
  - java
  - effective java review
  - design
  - architecture
---

A varargs parameter is a syntactic sugar feature of Java that allows you to define a parameter that allows the caller to provide zero or more arguments of the defined type. Inside the receiving function these values are provided as an array of the specified type. 

Let's look at a quick example:
```java
static int sum(int... args) {
  int sum = 0;
  for (int arg : args) {
    sum += arg;
  }
  return sum;
}
```

This method can be called like `sum(1,2)` which of course would produce `3` or `sum(1,2,3)` which of course would produce `6` or even `sum()` which would produce `0`. 

This capability can be of great use but there are some problem areas when using varags. Let's consider some of them and how we might overcome the challenge. 

Sometimes you may want to have a minimum number of parameters that you want to accept. As pointed out above, varags by itself allows 0 to n parameters to be passed in. We could consider checking the size of the array at runtime. While this would work it does have the downside of errors being found at runtime not compile time. This solution can also be ugly and gets in the way of the true logic. There is a better way though. Consider if we wanted to take a minimum of one argument. The solution to this would be to give our method two parameters. One simply of the type and the second as the vararg parameter. This would force the caller to provide at least one parameter at compile time. That may look something like:

```java
static int min(int firstValue, int... restOfValues) {
  int currentMin = firstValue;
  for (int value : restOfValues) {
    if ( value < currentMin) {
      currentMin = value;
    }

  }
  return currentMin;
}
```

Another potential pitfall of using vararg parameters is in performance critical applications. The reason for this is every method call requires the creation of an array. If this occurs on a loop this can produce avoidable memory pressure that can hurt the performance of your application. A possible mitigation strategy to this is, if for example 95% of the callers of the function will include 3 or less parameters you can create three functions that take 1, 2, and 3 parameters of the argument type to handle the 95% and a fourth that takes three parameters and a vararg parameter to handle the rest of the 5%. This is what the `EnumSet` object does to help it keep its great performance. Many times this optimization won't be appropriate but in the cases it does it can be a lifesaver. 

In summary, varargs parameters are a useful feature as part of the Java language. As with all features there are some rough edges to this feature that we should be aware of. However, as we keep these things in mind we can make some great improvements to our code. 