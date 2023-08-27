---
title: Effective Java! Limit Source Files to a Single Top-Level Class
description: A dive into chapter 25 of Effective Java
date: 2020-05-19
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we tackle a topic similar to the topic from last week where we considered nested classes. This time we consider multiple top-level classes in a single source file. The difference between what we are considering today and what we considered last week is that these classes are at the same level as the "base class". You may not even know that you can have multiple top level classes in a source file (you can only have one top level `public` class in a source file) and, per this chapter, that's OK because you shouldn't be using this ability.

Let's consider the benefits we get from having multiple top level classes in a file. We don't need to create as many files. It could be used a way to group related classes together. We don't pay extra for additional files so we should be good skipping that benefit and we can use packages to group related files. 

So let's look a little more concretely into what problems not following this advice can cause. One that the book doesn't mention is that this is an unexpected ability to take advantage of, because of this, it can be confusing to future developers working in your project when they are looking for where a specific class is defined. On top of this the main benefit that the book mentions is that you can run into cases where you have two classes defining the same class and which instance gets selected depends on how the code was compiled. This is demonstrated in the book by going through different orders of parameters you could pass to the Java compiler on the command line. Now I don't know about you, but I usually am not compiling code on the command line, I'm usually using my IDE so not only does the order affect how the code will execute but we, most of the time, don't have visibilty into the order or parameters passed to the compiler. 

To sum it up, having multiple classes defined at the top level in a single source file provides us basically no value but does bring with it predictability and maintainability troubles and thus should be avoided. 