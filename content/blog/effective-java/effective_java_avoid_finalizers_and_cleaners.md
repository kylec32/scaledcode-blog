---
title: Effective Java! Avoid Finalizers and Cleaners!
description: A dive into chapter seven of Effective Java
date: 2019-11-05
tags:
  - java
  - effective java review
  - design
  - architecture
---

Here we are at the eighth chapter of Effective Java and it's another more niche topic. Today we are talking about finalizers and cleaners. Huh? What are those? The author of Effective Java just kind of jumps into why not to use them and doesn't really explain what they are there for (maybe because he doesn't want to entice you to use them). Anyway, I figured it would be good to actually start with what they are before we dig into why we shouldn't use them because when I first read about them I had never heard of or used them. 

The two concepts basically do the same thing but in two different ways. Finalizers are the elder of the two options and is a core part of the Java language. It is a method on the class `Object` that can be overridden. So what does it do. Simply a finalizer is a method that gets called right before a object is removed by the garbage collector. This function can be used for many purposes including bringing the object back to life (why? 🤷) but most commonly used to clean up resources for an object. Cleaners are more or less the same type of thing (but not part of the class `Object`) but for a post Java 9 world where finalizers were deprecated and help overcome some of the shortcomings. They however still should be avoided. 

OK, now that we know what they do and how they can be useful let's ruin it by saying all the reasons we shouldn't use them. 

_The Time When the Finalizer Is Indeterminate_
Because we don't have control over when the garbage collector runs we also cannot be sure when the finalizer will run. Because of this we shouldn't count on it cleaning up finite resources like file handles for us as it may not be able to do it in time. While we likely will get some consistency of behavior if we test on the same JVM we deploy on but there will still be plenty of variability. If we deploy on different JVMs this becomes even more wide open to different behaviors. We also run the risk of the finalizer thread being run at a lower priority than the rest of the threads in the system and thus no being able to keep up with the creation of objects.

_The Finalizer May Never Be Called_
So what is worse than not being able to determine when the finalizer will run is realizing that the finalizer may never run. That's right, according to the specification a finalizer may never be called. This should make it apparent that these should not be used to clean up persistent state. There are methods that can increase your odds of the finalizer being called (`System.gc` and `System.runFinalization`) but these still don't guarantee the finalizer will be called. 

_Exceptions Thrown In A Finalizer Are Ignored_
Of note, cleaners don't have this problem but whenever we have an exception that is simply swallowed and stopping the garbage collection is something we want to avoid.

_Finalizers Come With a Severe Performance Cost_
Because finalizers and cleaners get in the way of efficient garbage collection algorithms it can slow thing down by quite a bit. In the author's experiment he saw a 50x decrease in performance when using a finalizer. Everyone loves good performance so this is not something we want.

OK, so we have gone over all the horrible things about them. When could these still be useful. First, because they are deprecated, there really is no need for finalizers in modern Java applications. So that leaves cleaners, when should we use them? Effective Java brings up two potential use cases. One was to act as a safety net for regular clean up. While it shouldn't be the main way of cleaning up items it can serve as a safety net for when developers forget to manually manage their resources. The second use case would be using it when we have native components that our Java code is managing. Of course the garbage collector can't manage these native components and therefore we do have to manage it more ourselves.

Finally, we have gone over what not to do, what should we do instead? The need to clean up resources is a real one that still needs to be accounted for. The solution is quite simple. Simply have your class implement `AutoCloseable` and implement the `close` method to clean up the resources we may have created in the life of the object. This puts management in our hands. We will be talking more about this next week in our next episode.

So there we have it. Finalizers and cleaners. Have you ever used these? Have you had any luck? Share in the comments.  

