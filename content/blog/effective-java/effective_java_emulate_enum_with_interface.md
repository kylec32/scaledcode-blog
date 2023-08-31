---
title: Effective Java! Emulate Extensible Enums With Interfaces
description: A dive into chapter 38 of Effective Java
date: 2020-08-17
tags:
  - java
  - effective java review
  - design
  - architecture
---

We continue digging into different considerations while working with `enums`. Earlier in this series we considered the alternatives to the use of `enum`s. Throughout the preceding chapters we have shown that enums are the preferred method. There is one place where the alternatives of using regular classes are superior to `enum`s, that is with extending existing functionality. For good reason the `enum` type does not allow extension.

That being said, there are times when we could want this type of functionality, particularly when working with `enum`s that represent different operations. In a previous chapter we saw this use case with our Calculator class and taking the `Operation` enum. Luckily there is a way to mimic the extension behavior via interfaces. Let's look at what this would look like with our `Operation` enum.

```java
public interface Operation {
  double apply(double x, double y);
}

public enum BasicOperation implements Operation {
  PLUS("+") {
    public double apply(double x, double y) { return x + y; }
  },
  MINUS("-") {
    public double apply(double x, double y) { return x - y; }
  },
  TIMES("*") {
    public double apply(double x, double y) { return x * y; }
  },
  DIVIDE("/") {
    public double apply(double x, double y) { return x / y; }
  };

  private final String symbol;

  BasicOperation(String symbol) {
    this.symbol = symbol;
  }

  @Override
  public String toString() {
    return symbol;
  }
}
```

While the actual enum `BasicOperation` is not extensible, via the interface, we can mimic somewhat the behavior of extensibility. For example we can define a new `enum` that implements the `Operation` interface and can be used in the place of `BasicOperation`. That might look something like:

```java
public enum ExtendedOperation implements Operation {
  EXPONENT("^") {
    public double apply(double x, double y) {
      return Math.pow(x, y);
    }
  },
  REMAINDER("%") {
    public double apply(double x, double y) {
      return x % y;
    }
  };

  private final String symbol;

  ExtendedOperation(String symbol) {
    this.symbol = symbol;
  }

  @Override
  public String toString() {
    return symbol;
  }
}
```

So as you can see we again implement the `Operation` interface, this allows us to use this enum in the same place as our other enum that implemented `Operation`. Now let's look at a use of this.

```java
public static void main(String[] args) {
  double x = Double.parseDouble(args[0]);
  double y = Double.parseDouble(args[1]);
  test(ExtendedOperation.class, x, y);
}

private static <T extends Enum<T> & Operation> void test(Class<T> opEnumType, double x, double y) {
  for (Operation operation : opEnumType.getEnumConstants()) {
    System.out.printf("%f %s %f = %f%n", x, operation, y, operation.apply(x, y));
  }
}
```
Now I'll be the first to admit that that is a fairly intense type declaration, basically it just means that we want an `enum` that implements the `Operation` interface. That being said you should be able to see how we could pass either type of `enum` to this method and have it work.

So what are the downsides here? Well as you could see I had to repeat myself some in the two enums. Now these two examples are pretty straightforward therefore there wasn't a ton of duplication but there was still some. If the shared code was larger you would likely want to look into creating a helper class.

To sum it all up, even though we cannot have our enums extend from each other we can mimic some of the behavior of inheritance by using interfaces. 
