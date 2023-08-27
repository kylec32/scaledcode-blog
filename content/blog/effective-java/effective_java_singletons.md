---
title: Effective Java! Singletons!
description: A dive into chapter three of Effective Java
date: 2019-10-01
tags:
  - java
  - effective java review
  - design
  - architecture
---

Time for chapter three of our Effective Java review. Today's is a fairly simple one. Today we are talking about the singleton pattern. The singleton pattern is quite well known and basically comes down to an object that only allows instantiation once. 

So what benefits does a singleton give us? 
- Expensive objects can be avoided being generated multiple times.
- If there is a reason we shouldn't have an unbounded amount of objects we can own instance control. 

What about some cons:
- They are extremely hard to test (having your singleton implement an interface can help this some)
- They basically serve as global state that can be complex and cause bugs. 

So a singleton is definitely not without it's costs but let's say we have determined that we do need a singleton, what are our options of implementing the pattern? Well Effective Java goes through three methods all including hiding the constructor of the object in one way or another.

*Option 1: public constant field*

The first option that is described is quite simple. The first step is to create a private constructor. After that you simply create a public static final field that instantiates the object to be used. Let's look at an example: 

```java
public class CEO {
  public static final INSTANCE = new CEO();
  private CEO() { }
  public void fire(Employee slacker) { ... }
}
```

So in this example we want to make sure that we don't end up with more than one CEO and so we make a singleton out of class. Then when a user wants to gain access to the CEO they simple call `CEO.INSTANCE`. This method is definitely very easy to write and very easy to use. The downsides are that users can get around the single instance protection by using some reflection skills. It also doesn't give as much control over instance creation and going back on the singleton choice. 

*Option 2: `getInstance` factory method*

The second option is what I am most familiar with. This method is built around having a static factory `getInstance` [factory method](https://dev.to/kylec32/effective-java-tuesday-let-s-consider-static-factory-methods-170p) method that provides the single instance of the class. Example time:

```java

public class CEO {
  private static final INSTANCE = new CEO();
  private CEO() { }
  public static CEO getInstance() {
    return INSTANCE;
  }
  public void fire(Employee slacker) { ... }
}
```

So what benefits do we get here? Well for one it's very recognizable as a singleton so the user can easily see what they are interacting with. It also allows us more control over our instance creation. For example we can delay instantiation of the object until it's first needed.

```java
public CEO {
  private static final INSTANCE;
  public static synchronized CEO getInstance() {
     if(INSTANCE == null) {
        INSTANCE = new CEO();
     }
     return INSTANCE;
  }
}
```
With a pattern like this you need to be careful about race conditions though. It is of note that this pattern is still susceptible to reflection attacks. Effective Java also goes into how to handle serialization as it relates to singletons and is not extremely straightforward. I've never had to deal with that so I won't tackle it here but if you need to go look it up. 

*Option 3: Single Element Enum*

The final option is to create a single element enum. This was not an option that I had ever seen and it does still feel a little unnatural to me. So let's look at an example:

```java
public enum CEO {
  INSTANCE;

  public void fire(Employee slacker) { ... }
}
```

So what does this give us? Well it is simple to write. Probably the least code of the three options. It also is very safe. It doesn't leave the option for reflection attacks. It also handles the serialization complexities that I skipped above. It does make it so you can't extend from a class but you can still implement interfaces. Effective Java pitches that this is the option that most people should take. Given that I have never personally seen someone use this method it's quite interesting to me that it is pitched as the option most should take. 

How about you? Have you ever seen this method used? 