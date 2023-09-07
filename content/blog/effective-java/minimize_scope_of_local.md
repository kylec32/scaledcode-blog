---
title: Effective Java! Minimize The Scope of Local Variables
description: A dive into chapter 57 of Effective Java
date: 2021-02-10
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter begins a new section of the book that focuses on general programming. This particular chapter focuses on a pretty basic concept, minimizing local variable scope. The benefits we get by following this include improved readability, better maintainability, and reduced chance of bugs. 

One of the tips that we can follow that can help us is to make sure we initialize local variables when we declare them. This can be useful for a number of reasons. For one we reduce our chances of null pointer exceptions as we are initializing the variable off the bat. There is also the benefit in that we need to wait far enough into the method until we have enough information to initialize. This being said there are situations where we won't be able to initialize our variables when we declare them. For example, when we are using a `try-catch` and the variable is used after the catch we need to declare it before the variable is initialized in the `try`. That being said, we work to initialize the variables when we declare them when possible. 

Another topic that comes up is preferring `for` loops to `while` loops. The reasoning for this being that for loops come with their own location for variable initialization that has a tight scope that is scoped just to the loop. An example of how while loops can cause issues is as follows:

```java
Iterator<Element> i = c.iterator();
while(i.hasNext()) {
  doSomething(i.next());
}

Iterator<Element> i2 = c2.iterator();
while(i.hasNext()) {
  doSomethingElse(i2.next());
}
```

The problem with the above is that it is wrong and doesn't do what was intended but does compile and doesn't even have a runtime exception. Compare this to the for loop version:

```java
for(Iterator<Element> i = c.iterator; i.hasNext();) {
  Element e = i.next();
  // Do something with e and i
}

for(Iterator<Element> i2 = c2.iterator(); i.hasNext();){
  Element e2 = i2.next();
  // Do something with e2 and i2
}
```

The above won't even compile because `i` has been scoped down to just what it needs. The above can even be improved even more by reusing the variable names (since they are in different scope) and even better, if you aren't using the iterator directly you could use a foreach loop. 

The final tip for keeping scope small is to keep the whole function small. If your whole function is small then your local variables have to have a small scope. 

