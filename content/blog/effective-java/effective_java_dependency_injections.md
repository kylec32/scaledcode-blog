---
title: Effective Java! Prefer Dependency Injection!
description: A dive into chapter five of Effective Java
date: 2019-10-16
tags:
  - java
  - effective java review
  - design
  - architecture
---

We have now arrived at item five from Effective Java. The topic of discussion today is about dependency injection. So let's dive into what dependency injection is. Dependency injection serves as a method of dealing with dependencies of an object. There are various ways of dealing with this problem, let's go through them and see what benefits dependency injection gives us. 

One method would be to use a static utility. Let's see what that could look like: 

The first option we are going to look at is a static utility class:

```java
public class DoStuffService {
   private final static Repository repository = ...;

   private DoStuffService() {} // So no one can accidentally instantiate this class.

   public static Object getStuff() {
     return repository.getTopOne();
   }
}
```

another similar option is to use a singleton:

```java
public class DoStuffService {
   private final Repository repository = ...;

   private DoStuffService(...) { }
   public static INSTANCE = new DoStuffService(...);

   public Object getStuff() {
     return repository.getTopOne();
   }
}
```

So what problems do these options cause us? Well both of these options suffer from the same issue. They are inflexible. What happens if you want to change out how the service gets it's data? What if we wanted to write a test where the datastore that the service is using is mocked out? How would we do this? So how can we solve this? Well it's pretty simple, simply pass the dependency into the constructor. This simple change adds a whole lot of flexibility to the code. Now if we wanted to change out the data store at runtime we simply pass in a different repository that meets the correct interface. If we need to write a test we can simply mock out the repository and focus on testing the behavior service. So what would our above example look like:

```java
public class DoStuffService {
   private final Repository repository;

   public DoStuffService(Repository repository) {
      this.repository = repository;
   }

   public Object getStuff() {
     return repository.getTopOne();
   }
}
```

As mentioned in Effective Java a lot of people accidentally end up implementing this pattern without realizing they are doing it. That to me is a sign of a very good pattern. Now if you do this throughout your whole system and if it is a large system this can get a bit unwieldy. This is where dependency injection frameworks such as Spring come in. What these frameworks handle for you is the wiring of all the pieces together. If you are following the pattern above adding one of these frameworks should be fairly easy. 

Something to be aware of though is there are ways that you can use dependency injection frameworks in a way that doesn't use dependency injection (weird right!?). For example look at this option:

```java
public class DoStuffService {
   private final Repository repository;

   @Autowired
   public DoStuffService(Repository repository) {
      this.repository = repository;
   }

   public Object getStuff() {
     return repository.getTopOne();
   }
}
```

vs 

```java
public class DoStuffService {
   @Autowired
   private Repository repository;

   public DoStuffService() {
   }

   public Object getStuff() {
     return repository.getTopOne();
   }
}
```

Spring will allow you to do the second option and will inject the dependency in the member variable. That being said they do discourage the above option and we can see why with the above example and how much flexibility they bring. 

So there you have it, a super quick intro to dependency injection. This is definitely a pattern I use very often and have great success with. How about you? How has this pattern worked for you?
