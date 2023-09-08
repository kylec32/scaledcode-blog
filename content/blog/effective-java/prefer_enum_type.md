---
title: Effective Java! For Instance Control, Prefer Enum types to readResolve
description: A dive into chapter 89 of Effective Java
date: 2022-02-16
tags:
  - java
  - effective java review
  - design
  - architecture
---

In a previous section, we discussed different ways to make singleton objects in Java. One of the methods we discussed followed the following pattern:

```java
public class Elvis {
  public static final Elvis INSTANCE = new Elvis();
  private Elvis() { ... }

  public void leaveTheBuilding() { ... }
}
```

By making the constructor `private` we prevent unexpected creations of the `Elvis` object. The problem with this pattern is that if you add `implements Serializable` to the class we open ourselves up for bypassing the private constructor. As has been mentioned in previous chapters, serialization effectively introduces a new, system-provided, constructor. 

The built-in functionality to handle this issue and to take back some control of the instances produced by a class is the `readResolve` function. This function allows the substitution of another instance in place of the one created by `readObject`. If your class defines a `readResolve` function with the proper signature it will be invoked after the `readObject` function. The reference returned by this method will then be returned in place of the newly created object. In common usage, no reference to the newly created object is retained and thus it can be garbage collected. 

Using this functionality to sure up our above `Elvis` class could end up looking something like the following:

```java
private Object readResolve() {
  return INSTANCE;
}
```

This ends up being pretty straightforward in this case, rather than do anything with the newly created object we simply return our one true `Elvis` instance. Since no data from the serialization is used we can, and should declare all instance fields as `transient`. If you have instance fields that are object reference types then you must declare them `transient` to avoid a possible attack where an attacker could get a hold of the deserialized object before it is garbage collected and thus can keep it around resulting in your singleton no longer being a singleton. 

The particular steps of this attack aren't strictly necessary to understand. Interested readers are encouraged to read the source material. Suffice to say it is possible by creating a "stealer" class that causes a circular dependency with the deserialized object and thus avoiding garbage collection can be made. While not a likely attack, it is better to be safe than sorry. 

While declaring all fields as `transient` is one method of avoiding this issue, there are other ways to accomplish it as well. Another pattern from our previous singleton chapter used a single-element enum type to facilitate the singleton. This puts much of the singleton safety semantics on the JVM to perform and releases you from that burden. Our example as an enum type would be:

```java
public enum Elvis {
  INSTANCE;

  private String[] favoriteSongs = { "Hound Dog", "Heartbreak Hotel" }
  public void printFavorites() {
    System.out.println(Arrays.toString(favoriteSongs));
  }
}
```

`readResolve` still may be necessary even with the above pattern when the instances of a class are not known at compile time.

Another thing to note when using the `readResolve` function is the visibility of the method. If your class is `final` then `readResolve` should be `private`. If your class is non-final you have more options. If you make it `private` it will not do any instance control for subclasses. If it is package-private it will only apply to subclasses that live in the same package. Finally, if you make it `protected` or `public` and a subclass doesn't override it any deserialization of the class will create an instance of the super class, not the subclass, which will likely cause a `ClassCastException`.

In summary, the use of enum type singletons should be preferred whenever possible when trying to enforce instance control on a serializable class. If it is not possible to use the enum pattern then careful consideration needs to be taken when writing the class's `readResolve` method. You should make sure that all the class's instance fields are either primitive or marked transient to protect against potential attacks against your instance control mechanism.  