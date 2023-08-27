---
title: Effective Java! Prefer Interfaces to Abstract Classes
description: A dive into chapter nineteen of Effective Java
date: 2020-04-11
tags:
  - java
  - effective java review
  - design
  - architecture
  - interfaces
---

One of the super powers of object-oriented programming is the ability for multiple implementations of the same type. This can allow cleaner code that allows powerful uses. Java provides two main mechanisms in order to accomplish this `interfaces` and `abstract` classes. The main difference between the two is that in order to extend an abstract class, an implementing class must become a subclass of that abstract class. In order to implement an interface, an implementing class merely has to meet the general contract of the class. 

What is so nice about interfaces:
* Interfaces can be added after the fact. 
  * Whereas a class hierarchy is a fairly heavyweight and rigid thing to change after the fact, an interface can be quite simple to add and doesn't change the semantics of the existing class. 
* Interfaces allow for mix-in like behavior.
  * A `mix-in` is an added behavior in addition to a class's main purpose. For example, `Comparable` is an example of a mix-in. While it defines that the object has certain behavior, it doesn't take away from the root type of the object.
* Interfaces allow shared behavior without relying on hierarchies
  * Classes force us to use extension in order to add in behavior. This requires us to build a a hierarchy to enable this. While organizing our classes via a hierarchy can be appropriate and helpful, a lot of times it it is not the most effective way of expressing this. 

_Effective Java_ then goes into an interesting pattern where we can get the bests of both interfaces and abstract classes. The idea is to push all pieces of the implementation as far as we can down the implementation hierarchy while still providing the users of the code helpers to assist them along their way. There are many things that you can put directly into the interface such as method signatures and default methods. However, there are some thing we will not be able to provide in our interface. For example, member variables or non-public static  members. So what do we do in these situations? We have just gone over how we should be preferring interfaces but we may feel, especially is the interface is fairly involved or complicated (think the `List` interface), that we should provide a starting location for implementers to start from or that there are shared functions that every implementation will want or need that don't fit into the allowed elements of an interface. 

This is where _skeletal implementations_ are a helpful construct. A _skeletal implementation_ gives us the best of both worlds. In practice its simply an abstract class that implements an interface and then implements the nonprimitive methods of an interface. By doing this we can take most of the work out of implementing an interface. You can often recognize these _skeletal implementations_ in the wild because they often follow the same naming convention, `Abstract<Interface>` where `<Interface>` is the name of the interface that the class is providing the skeletal interface for. For example, `AbstractCollection`, `AbstractSet`, etc. When this pattern is done correctly it can make it trivial to implement an interface. For example let's see how to implement a `List` with the help of the `AbstractList` _skeletal implementation_.
```java
static List<Integer> intArrayAsList(int[] array) {
  return new AbstractList<Integer> {
    @Override
    public Integer get(int i) {
      return array[i];
    }

    @Override
    public Integer set(int i) {
      int oldValue = array[i];
      array[i] = i;
      return oldValue;
    }

    @Override
    public int size() {
      return array.length;
    }
  };
}
```
That's it, a full implementation of a `List` in those three short overwritten functions. This is pretty amazing when you think of everything that `List` does for us. The beauty of this is that no one is forced to use the _skeletal implementation_, if someone wants to start from scratch and implement the interface they are free to, the thing people are dependent on is the interface, not the _skeletal implementation_. Finally, as we learned in our previous chapter's review we should make sure to document these _skeletal implementations_ well as they are very much implemented for inheritance. 

In summary, interfaces are usually the way to define a shared type and when you create a nontrivial interface you should consider creating a _skeletal implementation_ of that interface to help the creators of the future classes along. 
 