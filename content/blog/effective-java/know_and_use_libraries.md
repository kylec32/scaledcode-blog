---
title: Effective Java! Know and Use the Libraries
description: A dive into chapter 59 of Effective Java
date: 2021-03-10
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter dives into a problem that many developers will find themselves falling into at one time or another, that is of reinventing the wheel. As developers we often want to get into the details of something rather than learn how to use someone else's code. This being said, by taking this stance, we often are doing ourselves a disservice. 

Let's look at an example. Let's consider the following code. This code's job is to pick a random number up to a given limit:
```java
static Random rnd = new Random();

static int random(int upperLimit) {
  return Math.abs(rnd.nextInt()) % n;
}
```

At first look this code may look reasonable, it seems to do the job and in a terse manner. Even after some quick testing it seems to do the job. What isn't immediately apparent is that this code has a number of issues:

 * The distribution of values is not equal. The way this shows up will depend on whether `n` is a power of two but due to binary arithmetic and number theory the distribution will not be equal.

* On rare occasions (when `rnd.nextInt()` returns `Integer.MIN_VALUE`) the code will try to make the value positive by calling `Math.abs` which in this particular case will still return `Integer.MIN_VALUE`. This can then lead to a negative number being returned which the code is likely not prepared for. This will also be extremely difficult to test. 

So how do we fix these issues? How about we simply use: `Random.nextInt(int)`? While maybe not the interesting answer you were looking for this is almost always the case. The built-in library functions in Java have been written by experts, been used in countless applications, and are well scrutinized. This isn't any insult on your coding skills but simply a fact of the kind of software that is being developed in each case. You receive a couple benefits from this.

* You don't need to even think about how to accomplish the task, simply call the function and move on.

* Likely the performance of these functions will be superior to your own. While it's possible you could write a more performant function for your specific use case the odds that you will come up with a generic solution that is faster than their battle tested version is low. 

* You will also benefit from free improvements as you take upgrades. Even without you doing anything you can see these benefits. 

So why wouldn't someone use these built-in functions? Likely the most common reason for this I would think is lack of familiarity. There is no doubt that the API service of Java is quite large. It would be foolish to think that anyone can fit all of the API space effectively in their brain. That being said there are a few processes you can follow to help you along:

* Gain familiarity with a few core packages: `java.lang`, `java.util`, `java.io`, `java.streams`, etc. 

* Take time to consume the release notes at each Java release. With Java's new quicker release cycle these release notes can be much easier to consume. 

* Hopefully goes without saying but also search the internet for solutions to your problem before inventing your own version. This often can be enough to get you the familiarity with the built-in function.

Even with the large amount of built-in functions in the Java language there will still be things that won't be implemented in the core language. Even so there are some great generic libraries out there that you can still leverage to solve your problems. Libraries like: `Guava`, `Apache Commons`, etc. While you won't quite get all the benefits of built-in functions you will get some of the benefits to a lesser extent. 

While it can be fun to implement a solution from scratch it is rarely the right solution. Before implementing functionality that doesn't feel unique consider looking in the core libraries as well as through a quick internet search to find existing, vetted solutions. 