---
title: Effective Java! Design and Document Classes for Inheritance or Else Prohibit It.
description: A dive into chapter nineteen of Effective Java
date: 2020-04-03
tags:
  - java
  - effective java review
  - design
  - architecture
  - inheritance
---

In our review of the last chapter we talked about the dangers of implementation inheritance. The point was conceded that sometimes implementation inheritance is the correct thing to do. It is these cases that we are going to talk about today. How to help implementation inheritance succeed. 

The first thing to know is that you should document the effects of overriding each overridable methods(i.e. methods that are non-final and public or protected). This means that you must document when the class uses it's own methods internally and thus where overriding a method can have unexpected results. We saw an example of this in a previous chapter's review. Other things that should be documented are whether this method could be called from a static context, from a background thread, etc. Anything that could affect how an implementer implements a method. 

As of Java 8 a new capability was added to JavaDoc to facilitate this. This capability adds a new section in the documentation that is specifically to facilitate this documentation, `@implspec`. Let's seem an example of the use of this in `java.util.AbstractCollection`'s `remove` method's JavaDoc.
```
{@inheritDoc}

This implementation iterates over the collection looking for the specified
element.  If it finds the element, it removes the element from the collection
using the iterator's remove method.
     
Note that this implementation throws an UnsupportedOperationException if the
iterator returned by this collection's iterator method does not implement the
remove method and this collection contains the specified object.
```
This makes it clear that changing how the `iterator` works will affect how this `remove` function behaves. Imagine if we had this type of documentation when we overrode the `add` and `addAll` functions in `HashSet` in our previous review, we could have known that the `addAll` function called the `add` function.

"But Kyle," you say, "shouldn't our documentation talk about what a function does, not how it does it." You are correct, that is what good API documentation practices suggests. Unfortunately, because implementation inheritance breaks encapsulation, in order to facilitate the implementation of the subclasses we need to make this "how" documentation so that implementors of subclasses know how to do it and are not blindsided by unexpected behavior. 

You may also need to create protected methods just so that implementors can implement their subclasses in an efficient manner. This leads to extra work in the implementation and potentially more code to facilitate this behavior. These methods should exist on the `protected` access level and not on the `public` access level in order to avoid polluting the public API.

So what do you make `private` and what do you make `protected`? This will just take some thinking and trying it out. Unfortunately there is no formula. The best way to make sure that you are making accessible what you need but not making accessible what you don't need to is just to write some subclasses and see how it feels. The pitch that _Effective Java_ makes is to create three subclasses for each of the classes you write for extension and have one of those subclasses be written by someone other than the author of the superclass before you release it. Once released you are pretty much forced to keep the implementation you started out with.

You must also not call overridable methods from the constructor. This can lead to weird failures that are just better to be avoided. This is because the method will be invoked before the subclass's constructor runs. Let's look at an example.
```java
public class Super {
  public Super() {
    overrideMe();
  }

  public void overrideMe() {}
}

public class Sub extends Super {
  private final Instant instant;

  public Sub() {
    this.instant = Instant.now();
  }

  @Override
  public void overrideMe() {
    System.out.println(instant);
  }

  public static void main() {
    Sub sub = new Sub();
    System.out.println(sub.overrideMe());
  }
}
```

Running this code you will see two outputs to your standard out. One is `null` and one is the value in `instant`. This is because `overrideMe` is invoked from the `Super` class's constructor. The craziest part of this is that we get two different values output for the same `final` variable. 

Some other things to keep in mind are that implementing `Cloneable` and `Serializable` can be dangerous when implemented on one of these classes created for inheritance. There are some techniques that can be found in the chapter talking about `Cloneable` to mitigate this risk. It basically comes down to not calling overridable methods in order to accomplish the work of cloneable. 

So as you can see this is a lot of work. Indeed it is. This is why our default action should be not to create our classes for inheritance unless we really need to. So how do we prevent this? There are two main ways of doing it.
1. Make the class `final`
2. Make the constructors private or package-private.

I will also concede another point that the book doesn't. A lot of this safety depends on the audience of your code. If you are a library author of classes that will be used by various projects that you aren't directly connected with, be it that you are in a large company and your code is used by various other groups that you have no control over or if you are writing an open source library that will be used across the world, the advice in this chapter is extremely pertinent. However, if you a developer on a microservice where your code will only be used within your own team in a much smaller and focused manner I think you can loosen some of these requirements. Yes we should still be writing good, safe code with solid engineering practices but you also have the ability to change the consuming code if you had to do so.

So there are some tips and tricks for how to create classes built for inheritance.  It's a lot of work but if we take the time to do it right we can end up with a solid base for others to build on top of in a safer manner. 