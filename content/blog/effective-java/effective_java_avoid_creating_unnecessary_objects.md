---
title: Effective Java! Avoid Creating Unnecessary Objects!
description: A dive into chapter six of Effective Java
date: 2019-10-22
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we are onto our sixth item from Effective Java. This one's title particularly makes me smile. Avoid creating unnecessary objects. What's more uncontroversial than saying, "Don't do things you don't need to do." We are all looking for shortcuts of how to get a job done more quickly so this one we automatically get for free right? Well not quite, there is actually a little bit more to be said here than, "Be lazy." So let's get started. 

So why would someone do something that they don't need to do? Well we will go over some of the ways this can happen throughout this post but I would sum up most of these cases simply as the following, ignorance and lack of attention. This is understandable. Sometimes we just don't realize the damage we may be doing or we do know to avoid something but may not realize we are doing that thing. 

Let's start off with the first example from the book:
```
String title = new String("Effective Java");
```
So what does this do? Well it does exactly what it looks like it will do, it creates a new String for each time it is called. But that's not what we actually want to do. This simply creates more objects for the garbage collector to clean up without any benefit. Compare that to the more efficient way to accomplish this which also turns out to be cleaner:
```
String title = "Effective Java";
```
In this case no extra objects will be created no matter how many times this line is run. Also because of [String interning](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.10.5) if this same static string shows up multiple times in the JVM it will only be allocated once which is a fun memory saving tip.

So why would someone do the first example? Good question. My guess would be simply not knowing that it has a negative effect. 

So what are some ways that we can help avoid creating unnecessary objects. Well it's no wonder that the book starts with talking about [static factory methods](https://dev.to/kylec32/effective-java-tuesday-let-s-consider-static-factory-methods-170p) as it comes up as a solution again. As mentioned in that article, by using a static factory method we can make the determination if we want to create a new object or not whereas with a constructor we are forced to create a new object every time. An example of this can be seen with the `Boolean` object:
```
Boolean trueBoolean = new Boolean("true");
// vs
Boolean falseBoolean = Boolean.parseValue("false");
```
Let's look at another example of a place where developers sometimes get themselves into issues with creating unnecessary objects. This time it's boxed types. Let's look at the example from the book:
```
private static long sum() {
  Long sum = 0L;
  for (int i = 0; i< Integer.MAX_VALUE; i++) {
    sum += i; 
  }
  return sum;
}
```
The one capital `L` makes this code much less efficient where we are boxing and unboxing values over and over, creating more and more objects for not reason. Those that I work with know that I'm not a huge fan of boxed types. I see people accidentally using them for no good reason and they can have subtle effects that people don't realize.

So in these previous examples we have seen creating unnecessary small objects. While this should still be avoided it would take looping over this mistake many times before it actually started to affect our performance. What are some other times that we should particularly be concerned about creating unnecessary objects? Well even if we only create a few unnecessary objects if we are creating expensive objects unnecessarily it can make a difference so we need to be particularly careful with these expensive objects. The most common example of this is database connection pools. I won't personally go into this as I think the logic is simple to follow however I did want to mention it as something to take care of. 

So there you have it, don't create objects for no good reason. This doesn't mean there aren't good reasons. Later in the book we will discuss defensive copying and keeping the code clear is worth a few extra object creations if it comes to that. 

So the core lesson I'm trying to share with this post is to be careful with your allocations. Realize what your code is doing and that should help improve the performance of your application.
