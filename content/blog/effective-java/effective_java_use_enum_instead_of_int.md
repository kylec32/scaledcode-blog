---
title: Effective Java! Use Enums Instead of int Constants
description: A dive into chapter 34 of Effective Java
date: 2020-07-22
tags:
  - java
  - effective java review
  - design
  - architecture
  - generics
---

With this chapter we leave the discussion of Generics behind and move on to talking about `enums`. Let's start with what our code may look like without `enums`. Let's say we have a finite set of types of fruits that we need to represent in our code. We may decide to do the following:
```java
public static final int APPLE_FUJI = 1;
public static final int APPLE_GRANNY_SMITH = 2;
public static final int APPLE_PIPPEN = 3;

// Somewhere else in the code

public static final int ORANGE_NAVEL = 1;
public static final int ORANGE_TEMPLE = 2;
public static final int ORGANE_BLOOD = 3;
```
The above is indeed a step up from making people need to know that `1` represents a fuji apple, `2` represents a temple orange, and so on. So I will admit it isn't without its merits; however, there is still a lot to be desired. Largely because the compiler has no concept of what these represent and instead just see a bunch of integers. We can also see that since there is no namespacing of the values we chose to prefix the values with their namespace of "orange" and "apple." This being the case the compiler is not going to prevent us from writing code such as:
```java
if ((APPLE_FUJI - ORANGE_BLOOD) < someUserInput) ...
```
The above is perfectly legitimate code as far as the compiler is concerned but as a human we can obviously see this doesn't seem right. As we have talked about before, we should strive to push all errors as early in the development process as we can, thus, compile time errors are better than runtime errors. 

Another issue with using these constant `ints` as the items representing our values is that they are simply constants. This being the case, the compiler can inline these values at their use site, this is a solid optimization with constants however what would happen if the value that was associated with the constant was changed? For example, what if we added a new apple type and gave it the value of `1` and incremented all the other values. The code would still compile, the code would still run fine without exception, but the behavior would not be what we expected. 

More of a debugging problem but there is no way to easily convert a constant int into a human readable string. This can sometimes also be seen in REST APIs. They may have a field that takes an integer value that represents some state of the system. At this point you are sure hoping there is solid documentation to understand what the integers mean. This is poor API design whether it is a Java API or exposed via HTTP. You may try to get around this problem by using String constants and this can assist in having a human readable version; however, it can also lead to a naive developer hard coding strings into their code and they may make an error in typing it out. Again the compiler will not catch this and we are instead left to runtime to find these issues.

Java doesn't leave us without an answer here. As you could have probably  guessed from the chapter title this answer is `enum` types. In their simplest form we can convert the above constants into the following. 

```java
public enum Orange { NAVEL, BLOOD, TEMPLE }
public enum Apple {GRANNY_SMITH, PIPPEN, FUJI }
``` 

The above example is quite simple and looks a lot like `enums` you may have interacted with in other languages. Even at this very simple use of enums they still provide a solid value. We get our namespacing for free such that if we had one enum with a value of `THING_ONE` and a different enum with a value of `THING_ONE` these two could coexist happily because they live under different namespaces. Even though this basic form of enums is useful and may be as far as you need to take it in many cases, enums are full-fledged types and thus can be extremely powerful.

So what protections do enums give us? Off the bat they give us the type safety that we are after. Unlike our `int` constants, if I try to pass an `Apple.GRANNY_SMITH` to a method that takes an `Orange` the compiler will tell me that this is not allowed. 

Getting into the more class-like behaviors of enums we can also give our `enums` arbitrary fields and methods. This also means that they can implement arbitrary interfaces. Even without writing additional code we are provided with high quality implementations of our `Object` methods (`equals`, `hashcode`, `toString`) as well as implementations of `Comparable` and `Serialiable`. So what value would adding methods be to enums? Because we can associate data along with our constant `enum` values we can add functions to act on that data. For example we may find it useful to give our `Apple` an attribute of the color that each type of apple is. After doing this the enum can then act on that data.

Let's consider another example representing Planets:

```java
public enum Planets {
  MERCURY(3.302e+23, 2.439e6),
  VENUS(4.869e+24, 6.051e6),
  EARTH(5.975e+24, 6.378e6),
  MARS(6.419e+23, 3.393e6),
  JUPITER(1.899e+27, 7.149e7),
  SATURN(5.68e+26, 6.027e7),
  URANUS(8.683e+25, 2.556e7),
  NEPTUNE(1.024e+26, 2.477e7);

  private final double mass;
  private final double radius;
  private final double surfaceGravity;

  private static final double G = 6.67300E-11;

  Planet(double mass, double radius) {
    this.mass = mass;
    this.radius = radius;
    surfaceGravity = G * mass / (radius * radius);
  }

  public double mass() {
    return mass;
  }

  public double radius() {
    return radius;
  }

  public double surfaceGravity() {
    return surfaceGravity;
  }

  public double surfaceWeight(double mass) {
    return mass * surfaceGravity;
  }
}
```
As you can see this `enum` is more involved but still is fairly straightforward. To add data to our enum we create a constructor that we provide with the data that we are looking to store. Because enums are inherently immutable, all fields should be final. Even though the fields are final we still likely want to make the fields private and provide accessors when appropriate. 

Let's now see how we can use this enum:

```java
public class WeightTable {
  public static void main(String[] args) {
    double earthWeight = Double.parseDouble(args[0]);
    double mass = earthWeight / Planet.EARTH.surfaceGravity();
    for (Planet p : Planet.values()) {
      System.out.println("Weight on %s is %f%n", p, p.surfaceWeight(mass);
    }
  }
}
```

which produces something like: 

```java
Weight on MERCURY is 69.612
Weight on VENUS is 167.43
Weight on EARTH is 185
Weight on MARS is 70.2267
Weight on JUPITER is 467.99
Weight on SATURN is 197.120
Weight on URANUS is 167.3982
Weight on NEPTUNE is 210.2087
```

Our `Planet` enum, like all `enums`, has a static `values` method that returns an array of it's values ordered in the order they were declared. We also took advantage of the built in `toString` function. Combining this all together we get interesting functionality via this concise code.

Let's consider if we had made this enum before the year 2006 we would have also had a value for `PLUTO`. What would have happened when we removed it? First, our method above would have worked without change as it simply loops through the values and prints them. What about programs that used the `PLUTO` value from the `Planet` enum before it was removed? If they recompiled they would get a helpful compilation error. If it tries to use it at runtime it will also throw a helpful error. No more silently doing the wrong thing.

While the technique shown with the `Planet` is powerful enough for most cases, sometimes we need a little more power. Let's consider a case where we want different behavior for each enum value and how we might accomplish this:

```java
public enum Operation {
  PLUS, MINUS, TIMES, DIVIDE;

  public double apply(double x, double y) {
    switch (this) {
      case PLUS: return x + y;
      case MINUS: return x - y;
      case TIMES: return x * y;
      case DIVIDE:  return x / y;
    }
    throw new AssertionError("Unknown op: " + this);
  }
}
```

This code does work but it's not as clean as it could be. We are forced to write the thrown exception even though, in its current form, there is no way that we would get into that case. However, let's say we add another operation, there is nothing preventing us from forgetting to add it's processing to our `apply` function. Luckily there is a way to associate value specific behavior to individual enum values. Let's look at what that would look like:

```java
public enum Operation {
  PLUS { public double apply(double x, double y) { return x + y;}},
  MINUS { public double apply(double x, double y) { return x - y; }},
  TIMES { public double apply(double x, double y) { return x * y; }},
  DIVIDE { public double apply(double x, double y) {  return x / y; }};

 public abstract double apply(double x, double y);
}
```

With this version the implementations are much more closely attached to the values. Even if we forgot to implement the `apply` function for a new operation type, the fact that it's defined as an `abstract` function would lead the compiler to notifying us of our error.

Looking at an example similar to our `Planet` example above, we could write the following:
```java
public static void main(String[] args) {
  double x = Double.parseDouble(args[0]);
  double y = Double.parseDouble(args[1]);
  for (Operation op : Operation.values()) {
    System.out.println("%f %s %f = %f%n", x, op, y, op.apply(x, y));
}
```

Running the above will produce something like:

```java
2.0 + 4.0 = 6.0
2.0 - 4.0 = -2.0
2.0 * 4.0 = 8.0
2.0 / 4.0 = 0.5
```
One disadvantage of constant-specific method implementation is that it makes it difficult to share implementation logic across constant types. For example, let's consider an enum that handles the calculation of pay for different pay types connected to days of the week including overtime pay. It may look something like:
```java
enum PayrollDay {
  MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY;

  private static final int MINUTES_PER_SHIFT = 8 * 60;

  int pay(int minutesWorked, int payRate) {
    int basePay = minutesWorked * payRate;
 
    int overtimePay
    switch(this) {
      case SATURDAY: case SUNDAY:
        overtimePay = basePay / 2;
        break;
      default:
        overtimePay = minutesWorked <= MINUTES_PER_SHIFT ? 0 : (minutesWorked - MINUTES_PER_SHIFT) * payRAte / 2;
    }

   return basePay + overtimePay;
  }
}
```
This code is quite concise but may lead to unfortunate maintenance burdens. Imagine adding a new value to this enum, for example to represent a vacation day, but forget to add a new entry into our `switch` statement. This would lead to us incorrectly processing it at the regular pay schedule. If we wanted to use a constant-specific method like we did for our `Operation` enum, we would have to potentially duplicate functionality in different values. What we are looking for is to be forced into making a choice of the calculation method when we create a new value, but also the ability to share implementations. Let's look at an example of how we could do that. 

```java
enum PayrollDay {
  MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY(PayType.WEEKEND), SUNDAY(PayType.WEEKEND);

  private final PayType payType;

  PayrollDay(PayType payType) { this.payType = payType; }
  PayrollDAy() { this(PayType.WEEKDAY); }

  int pay(int minutesWorked, int payRate) {
    return payType.pay(minutesWorked, payRate);
  }

  private enum PayType {
    WEEKDAY {
      int overtimePay(int minutesWorked, int payRate) {
        return minutesWorked <= MINUTES_PER_SHIFT ? 0 : (minutesWorked - MINUTES_PER_SHIFT) * payRate / 2;
      }
    }, 
    WEEKEND {
      int overtimePay(int minutesWorked, int payRate) {
        return minutesWorked * payRate / 2;
      }
    }

    abstract int overtimePay(int minutesWorked, int payRate);
    private static final int MINUTES_PER_SHIFT = 8 * 60;

    int pay(int minutesWorked, int payRate) {
      int basePay = minutesWorked * payRate;
      return basePay + overtimePay(minutesWorked, payRate);
    }
  }
}
```

This does meet our requirements of not duplicating functionality and, somewhat, forcing us to confront our pay type. While this is held up as a good example in the book it does feel like this is still defaulting to using the non-overtime pay system if you do nothing. It also is fairly complicated so before taking on this complexity determine if it's worth it for your use case. 

We should use enums any time we need a set of constants whose values are known at compile time. These can be things such as days of the week and planets as well as more dynamic things like license levels and command line flags. The requirement is not that the constants never change, just that they change less often and are known at compile time. 

There are many benefits to enums over integer constants. They are more readable, safer, and more powerful. Enums also allow a varying level of complexity depending on what we need. They can start life as a simple collection of constants and later evolve into state and function carrying objects. For more advanced use cases with enums consider using constant-specific methods or the strategy enum pattern as shown above with the `PayrollDay` example.

