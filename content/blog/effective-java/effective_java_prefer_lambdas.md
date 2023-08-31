---
title: Effective Java! Prefer Lambdas to Anonymous Classes
description: A dive into chapter 42 of Effective Java
date: 2020-09-14
tags:
  - java
  - effective java review
  - design
  - architecture
---

This new chapter brings us to a new section on some newer Java features, lambdas and streams. I'm a big fan of lambdas and I think it has been a great addition to the Java language. I use lambdas everyday in my development and it definitely makes my code much clearer.

Before lambdas, interfaces and sometimes abstract classes with a single method would be used as _function types_. Implementations of these instances would be created via _anonymous inner classes_ and allow a form of functional programming in your Java code. Let's look at an example:
```java
Collections.sort(words, new Comparator<String> () {
  public int compare(String s1, String s2) {
    return Integer.compare(s1.length(), s2.length());
  }
});
```

The above honestly doesn't look too bad and served adequately for the occasional function object within our object-oriented code. This being said, with the introduction of lambdas in Java 8, things get much cleaner and more usable. What lambdas do for us is codify that interfaces with a single method should receive special treatment. These interfaces, called _functional interfaces_, allow a shortcut for defining what we wrote above using the anonymous class.

```java
Collections.sort(words, (s1, s2) -> Integer.compare(s1.length(), s2.length());
```

Even with this smallest change to use lambdas we get rid of basically all of the boilerplate code. We can see that the parameters to the lamba don't declare a type. This is because lambdas can use type inference (like the `var` keyword in recent versions of Java) that allow us to skip this boilerplate as well. This isn't to say we can't provide a type and in rare cases the compiler will not be able to infer the type, only in these cases, when the compiler requires, should we define the type. There are even shorter hand ways we can write the above such as using comparator construction methods along with a method reference:

```java
Collections.sort(words, comparingInt(String::length));
```
or even shorter using the `List.sort` method (an example of a default method)
```java
words.sort(commparingInt(String::length));
```

By the shortening of code and being able to focus on more of the real logic, lambdas allow the use of functional programming where it wasn't practical before.

In a previous chapter we discussed an `Operation` enum that looked something like:
```java
public enum Operation {
  PLUS { public double apply(double x, double y) { return x + y;}},
  MINUS { public double apply(double x, double y) { return x - y; }},
  TIMES { public double apply(double x, double y) { return x * y; }},
  DIVIDE { public double apply(double x, double y) {  return x / y; }};

 public abstract double apply(double x, double y);
}
```

we can simplify this code using lambdas:

```java
public enum Operation {
  PLUS((x,y) -> x + y),
  MINUS((x,y) -> x - y),
  TIMES((x,y) -> x * y),,
  DIVIDE((x,y) -> x / y),

  private final DoubleBinaryOperator operator;
  
  Operation(DoubleBinaryOperator operator) {
    this.operator = operator;
  }

  public double apply(double x, double y) {
    return operator.applyAsDouble(x, y);
  }
}
```

The above example uses the `DoubleBinaryOperator` class which is just one of the many interfaces in `java.util.function` package that is full of lots of different interfaces that are useful. This one in particular takes in two `double` parameters and returns another `double`. You can create your own interface like these by simply creating an interface with a single method then annotating the class with `@FunctionalInterface`. The annotation, akin to the `@Override` annotation, doesn't drive behavior but is simply an indicator to the compiler that this class is expected to only have one method and will fail to compile if you don't meet the functional interface expectations.

So are anonymous classes obsolete and without any use? Not quite. Something anonymous classes can do that lambdas can't do is implement an interface of extend an abstract class that has more than one abstract method. Lambdas also can't refer to themselves with the `this` keyword. In practice these limitations seem to be the exception rather than the rule. 

Lambdas are very useful for writing concise code that allows a developer to focus on the logic and less on the boilerplate. If you find yourself reaching for anonymous inner classes to implement some behavior, consider using a lambda, it will often be the right choice and will end up leading to much clearer code for you and the other developers that work on your code in the future. 