---
title: Effective Java! Prefer Class Hierarchies to Tagged Classes
description: A dive into chapter 23 of Effective Java
date: 2020-05-05
tags:
  - java
  - effective java review
  - design
  - architecture
---

It seems like a lot of the previous chapters of _Effective Java_ have shared some concerns with using all the capabilities that object-oriented programming offers us. There are indeed pitfalls with over using some of the functionality of these patterns so they should be used with prudence. Today, however, we look at a topic where object-oriented programming can come to the rescue. 

Let's start out by looking at the following class. 
```java
class Figure {
  enum Shape {CIRCLE, RECTANGLE}

  final Shape shape;
  double length;
  double width;

  double radius;

  Figure(double radius) {
    shape = Shape.CIRCLE;
    this.radius = radius;
  }

  Figure(double length, double width) {
    shape = Shape.RECTANGLE;
    this.length = length;
    this.width = width;
  }

  double area() {
    switch(shape) {
      case RECTANGLE:
        return length * width;
        break;
      case CIRCLE:
        return Math.PI * (radius * radius);
        break;
      default:
        throw new AssertionError(shape);
    }
  }
}
```
As you can see in the class above this is a single class that has a `enum` in it that is being used a flag to indicate whether the class is a `Circle` or a `Rectangle`. Presumably the reasoning (albeit extremely thin) was that they both have a area function. Outside of saving that one line everything else is worse about this class. Let's list some of the problems.
* There is a lot of boilerplate. 
  * Anywhere where we are dealing with the values and how they need to be treated differently between the tagged types there will need to be some tedious boilerplate. This will lead to greatly reduced readability.
* The memory footprint is increased as all instances of the class will be burdened with unnecessary values. 
* The class can't be made immutable as the fields can't be made `final` unless the constructors initialize irrelevant values.
* We also lose out on some benefits of our compiler as the tagged class doesn't use all the fields together.

So what's the answer? Well thankfully object-oriented programming has the answer with class hierarchies. How do we turn the tagged classes into a class hierarchy? The first step is to create a shared `abstract` class that houses the shared variables and abstract declarations of shared methods. In our `Figure` class there is only one shared method, the `area` method. Next we should create a class that extends from the root abstract class for each of the types that have a tag. Let's look at how our `Figure` could be changed to follow this method:

```java
abstract class Figure {
  abstract double area();
}

class Rectangle extends Figure {
  final double width;
  final double length;

  Rectangle(double width, double length) {
    this.width = width;
    this.length = length;
  }

  @Override
  double area() {
    return width * length;
  }
}

class Circle extends Figure {
  final double radius;

  Circle(double radius) {
    this.radius = radius;
  }

  @Override
  double area() {
    return Math.PI * (radius * radius);
  }
}
```

Even though we do end up with more classes in this example, each class is much simpler and straightforward and more efficient. Now let's consider if we needed to add a new type:
```java
class Square extends Rectangle {
  Square(double side) {
    super(side, side);
  }
}
```
It's as easy as that to add a new type. Imagine what it would have looked like in the tagged class example. Whereas this is very clean, the tagged class would have only gotten more complicated and less straightforward.

As you can see there are really no benefits of using tagged classes instead of a proper class hierarchy. If you are thinking about using a tagged class, reconsider and consider how you can utilize a class hierarchy instead. This will lead to more efficient, easier to maintain, and less error prone code.
