---
title: Effective Java! Consider Serialization Proxies Instead of Serialized Instances
description: A dive into chapter 90 of Effective Java
date: 2022-02-21
tags:
  - java
  - effective java review
  - design
  - architecture
---

Throughout all the recent items as we have discussed Java serialization, we have been discussing many of the challenges that come along with it. While on the surface it looks simple to implement, in reality, it is far from it. Due to the effectively hidden constructor provided by the serialization framework `Serializable` code is open to many potential issues that need to be protected against. Thankfully there is a pattern, called the _serialization proxy pattern_ that can help us sidestep many of these issues.

One of the best parts of the serialization proxy pattern is that it is rather straightforward, especially compared to some of the alternatives.  The first step is creating a private static nested class that holds all the necessary information to create your target object, this is your serialization proxy. This class will have a single constructor of the type of the enclosing class. This constructor simply copies the data from the parameter into its internal state, with no need for consistency checks or defensive copies. Now the serialization proxy and enclosing class need to add `implements Serializable` to their class signature. Let's look at an example of the serialization proxy that we would write for the `Period` class we have been discussing in recent items.

```java
private static class SerializationProxy implements Serializable {
  private final Date start;
  private final Date end;

  SerializationProxy(Period period) {
    this.start = period.start;
    this.end = period.end;
  }

  // Any number will do here.
  private static final long serialVersionUID = 1234567890L
}
```

Our next step is to add a `writeReplace` method to the enclosing class. This method will look exactly like this in every implementation (assuming you call your private static serialization proxy `SerializationProxy`)

```java
private Object writeReplace() {
  return new SerializationProxy(this);
}
```

When this method is on a class and it is serialized it causes the serialization system to return a `SerializationProxy` instance instead of an instance of the enclosing class. With this code in place that means that the serialization system will never create an instance of the enclosing class. To make sure no one tries to craft one maliciously we can add the following. (Again this code could be copied verbatim in a class implementing this pattern)

```java
private void readObject(ObjectInputStream stream) throws InvalidObjectException {
  throw new InvalidObjectException("Proxy required");
}
```

The final step in the pattern is to provide a `readResolve` method in the `SerializationProxy` class that returns a logically equivalent instance of the enclosing class. The way it does this is by using only the enclosing class's public API. The benefit this provides is that it doesn't need to do anything special to protect the creation, all the protections can live within the enclosing class which it would already have to protect itself from "regular" API consumers. This is the benefit of this pattern, it doesn't use any "magic" constructors or capabilities, it simply forces the serialization framework to use the regular language primitives. In our example the `readResolve` function would be:

```java
private Object readResolve() {
  return new Period(start, end);
}
```

Additional benefits this pattern provides to us above and beyond what the previously discussed patterns do is that the member variables in `Period` can once again be `final` which they always wanted to be to enforce immutability. The other huge benefit is the pattern is simple. A good proportion of it is simply copying and pasting the same code. That is to say, the effort you put in versus the benefit you get out with this pattern is great. The final additional benefit would be that the `readObject` method can return a different type of object than the originally serialized instance was. This benefit is taken advantage of by the `EnumSet` class in the core of the language. `EnumSet` uses the serialization proxy pattern to make for safer serialization and to allow for it to use the most efficient implementation (`RegularEnumSet` or `JumboEnumSet`) depending on how many types are in a particular enum.

There is always a cost to whatever we do though so what are the costs here? First, it is not usable with classes that are built to be extended. It is also not compatible with classes that can have circular references in their object graphs. Finally, it comes at a computational cost with measurements in the 14% slower range for using this pattern. All this being said, this pattern can be extremely useful to know. By taking some simple actions and accepting some potentially minimal drawbacks we can have far safer code. 

With the end of this item, we have reached the end of the book _Effective Java_. There is a lot of insight that can be gleaned from this book and practicing its guidance. I know that I have learned a lot from the book about some lesser-known features of the language and some of the sharp edges I can watch out for in my day-to-day work. I hope you have gleaned some benefits too. I would like to do some more reviews like this in the future so be sure to subscribe for updates.  