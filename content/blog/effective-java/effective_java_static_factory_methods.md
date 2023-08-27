---
title: Effective Java! Let's Consider Static Factory Methods
description: A dive into chapter one of Effective Java
date: 2019-09-17
tags:
  - java
  - effective java review
  - design
  - architecture
---

Recently I have been reading through the ever popular [Effective Java](https://www.amazon.com/Effective-Java-Joshua-Bloch/dp/0134685997/ref=sr_1_1) by Joshua Bloch (Addison-Wesley 2018). Hopefully if you are a Java developer this isn't the first time you have heard of this book. Perhaps you are like me and the first time you saw it you thought, "That's probably old and out of date." Indeed, the first edition was released in the early 2000's. However after hearing many glowing recommendations I decided I should give is a try. Needless to say I was pleasantly surprised. Alas, it's unsurprising, good design doesn't really go out of style (We still talk about the [Gang of Four](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612/ref=sr_1_2) don't we?)

With all of this in mind, why this series? Honestly, selfishly, the number one reason is for myself. I am a firm believer in the best way to learn something is to teach it. Even so I do have a love for good design and would love to share that love and hopefully help others learn something new and put it into practice. This being said I decided I would try to take some of the principles of the book and share a new one each week. Trying to put low pressure on myself but also give myself a cadence to post on.

Finally, is this series a replacement for the book? Not at all, I still highly suggest you pick up the book. Hopefully this can serve as a companion to the book and give you a different viewpoint on the topics shared therein.

Without further ado, let's begin.

*Chapter One: Static Factories vs. Constructors*

One of the first things you learn to do when you start doing object-oriented programming (OOP) is how to create objects. It wouldn't be much use to have all these objects if you couldn't create them. The way we usually learn to create objects is via constructors. Constructors are fairly simple and straightforward so this does make sense and can serve us well. Another option that we have that the author suggests that many programmers don't reach for when maybe they should is the static factory method. So what is a static factory method? Simply put a static factory method is a static method that returns and instance of the class. So what does this look like:

```java
LocalDateTime date = new LocalDateTime(Instant.now());
```

vs

```java
LocalDateTime date = LocalDateTime.ofInstant(Instant.now());
```

Definitely not a vast difference between the two. So what benefits does the factory method provides. 


*Factory Methods Can Have Names*

When I first started developing software I don't think I understood the power of good naming. Constructors don't have the ability to be named. Because they can't have varying names you also can't have two constructors that do different things that take the same parameters in the same order. So for example if we wanted to add to the LocalDateTime class to have a constructor that takes an Instant and produces a LocalDateTime that is a random time before the provided Instant let's say, how could we accomplish this with constructors? Change it to something like?

```java
LocalDateTime dateTime = new LocalDatetime(Instant.now(), shouldBeBefore);
```

Absolutely not. But with a factory method we could write the following:

```java
LocalDateTime datetime = LocalDatetime.randomTimeBeforeInstant(Instant.now());
```

Much cleaner.

Another trick that programmers will use is changing the order of the parameters, this may not quite be as gross as the above example but it's going to be extremely difficult for future developers to know which does what. Thus not a great win for maintainability.

*Factory Methods Are Not Required to Create New Object Every Time*

Constructors by their nature are required to create a new object each time they are called. This is not so with methods. Think of the singleton pattern, a pattern that most are familiar with. In fact a pattern that makes use of the static factory method! The very purpose of the `getInstance` method in a singleton pattern is not to create multiple instances. There are other options as well. Returning cached values or enums. 

*Factory Methods May Return An Object of Any Subtype of the Methods Return Type*

This is a nice capability to have. Being able to separate this requirement from the interface gives us options. This also gives you the opportunity to return different subtypes based on the parameters passed to the function. So not only can we return subtypes but dynamically select subtypes to return at runtime. Further expanding on this we can even return instances of classes that didn't exist when the factory method was written. Again, this leads to more options. Good design is often all about leaving options open. 


So what are some downsides to factory methods:

*They Affect Our Ability to Use Inheritance*

If all that you provide the users of your class with are factory methods and no public constructors there is no possibility of using inheritance with that class. This can also be viewed as a benefit (final classes do this already). Just another time to consider composition over inheritance. This is something that we must keep in mind when using this method. 

*They Can Be Harder to Find in the Public API*

Because constructors are special they jump out of documentation and classes. So how can we reduce this risk? One solid way is following the conventions for naming of factory methods. Some of these are *from*, *of*, *getInstance*, 


*Kyle's Take:*

I think this is a solid tool for the tool belt. While I still have a hard time using this as my base case of what I do every time, I am trying to remember to keep this in mind. Another fun part about patterns is that after a few years in development you find yourself stumbling upon these patterns and using them without realizing. This pattern is no different. I have had places in my development lifetime before that I have used Singletons as well as more general static factory methods. It is always reassuring to hear something that you did is an actual pattern that others have used.

How about you? Have you used this pattern before? How has it worked for you?