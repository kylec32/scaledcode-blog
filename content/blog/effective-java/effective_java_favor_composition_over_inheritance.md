---
title: Effective Java! Favor Composition Over Inheritance
description: A dive into chapter seventeen of Effective Java
date: 2020-03-25
tags:
  - java
  - effective java review
  - design
  - architecture
  - inheritance
---

Today we get to take on one of the core items of object-oriented programming, inheritance. Particularly the dangers of inheritance and what is a better way in many cases. Inheritance is a core part of what makes object-oriented great and powerful when used correctly. What we will go over in this blog post is a particular pattern that gives us some of the capabilities of inheritance, while keeping us safe and maintaining encapsulation. 

First off, there are a couple of different types of inheritance; the first is _implementation inheritance_ which is one class extends the functionality of another class. This is the type of inheritance we will be talking about in this blog post. There is also _interface inheritance_ where a class implements an interface or one interface extends another interface. This second type of inheritance is not covered in this blog post.

The core of what the title of this blog post comes down to is that inheritance breaks encapsulation. The problem comes in that changes to the super class can cause issues in the sub-classes without the sub-classes realizing it.  This can lead to breakage, unexpected data leakage, and other issues that would best be avoided. This means the sub-classes need to evolve in lock step with their parent classes or risk encountering issues. 

Let's look at an example, and although contrived, the example in the book is solid at showing the issues. The idea behind this example class is that it creates a method for a user to have a `HashSet` that can retrieve how many times an item was added to it. Let's take a look. 

```java
@NoArgsConstructor
public class InstrumentedHashSet<E> extends HashSet<E> {
  @Getter
  private int addCount = 0;

  public InstrumentedHashSet(int initCap, float loadFactor) {
    super(initCap, loadFactor);
  }

  @Override
  public boolean add(E e) {
    addCount++;
    return super.add(e);
  }

  @Override
  public boolean addAll(Collection<? extends E> c) {
    addCount += c.size();
    return super.addAll(c);
  }
}
```

This implementation, although it looks reasonable, has an issue that you won't discover until you realize how the implementation of `HashSet` works. Under the hood `addAll` simply calls `add` to insert elements so when you perform the call `myCoolInstrumentedHashSet.addAll(List.of("a","b","c"))` you end up with an `addCount` of `6` not `3` like you would expect. Three get added in the `addAll` call and 3 get added in the `add` call. There are ways to "fix" this issue, like removing the code in the `addAll` call, but that is still making it dependent on the implementation of the class. While it works today, will it work tomorrow?

In addition to the coupling discussed above, there are other issues with using inheritance when it comes to fragility. As time goes on various things can happen  to the super class. It can inherit new abilities with new methods, potentially conflicting with the names of methods in your subclass, it can expose internal state that you were depending on controlling the invariants of, and various other issues.

There must be a better way!? Well there is. Enter composition. What in the world is composition? Well simply put, instead of extending a class's functionality a class simply has an instance of that class as an internal member and it delegates behaviors to it. This changes the inheritance `is-a` relationship to a `has-a` relationship. Let's take a look at what this could look like with our example from above:
```java
public class InstrumentedSet<E> extends ForwardingSet<E> {
  @Getter
  private int addCount;

  public InstrumentedSet(Set<E> wrappedSet) {
    super(wrappedSet);
  }

  @Override
  public boolean add(E newElement) {
    addCount++;
    super.add(newElement);
  }

  @Override
  public boolean addAll(Collection<? extends E> newElements) {
    addCount += newElements.size();
    return super.addAll(newElements);
  }
}

@RequiredArgsConstructor
public class ForwardingSet<E> implements Set<E> {
  private final Set<E> set;

  public void clear() {
    set.clear();
  }

  public boolean contains(Object o) {
    return set.contains(o);
  }

  public boolean isEmpty() {
    return set.isEmpty();
  }

  public int size() {
    return set.size();
  }

  ... repeated for every method in the Set interface.
}
```

OK what did we just see. We took our one class using inheritance and turned it into two classes without using inheritance but using composition. What did this gain us? It helps us have more robust code. We have isolated ourselves from changes in the individual concrete classes, there is no chance of something changing out from under us because we control the whole interface, etc. We also got some more flexibility. We now take in a `Set` of any type (not just `HashSet`) and can operate on any of them. We can even add the instrumentation after the `Set` has been initialized by some other piece of code. 

The way we are using the wrapper class above is called the _Decorator_ pattern. We are taking an already existing object and "decorating" it with additional behavior while still allowing it to be used as the original object.

So nothing is without it's downsides, what are our downsides here? Well the main one should be pretty obvious. We took a pretty small class using inheritance and ended up with two classes and a lot more mind numbing code where we just duplicating an interface as we forward on calls. While this is a good chunk of code it's not hard code to write. This is such a solid pattern that languages such as Kotlin build syntactic sugar around making this pattern easier to code up without so much code. You can also reuse these forwarding classes after you have written them. I have also always wondered if you could use Java proxies to generate these forwarding classes at runtime. Make that an exercise for the reader.

Inheritance truly does have a place. When you can truly say that `WidgetB` `is-a` `WidgetA` then an inheritance relationship can be appropriate. If `WidgetB` instead just needs to have the behavior of `WidgetA` then composition is likely what you are after. Honestly, if you can get away with composition it's likely the safer bet. There is a lot of robustness and power that comes when you use this pattern and I hope you can recognize when this pattern could be useful to you as your continue along your development efforts. 