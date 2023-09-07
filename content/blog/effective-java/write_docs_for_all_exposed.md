---
title: Effective Java! Write Doc Comments For All Exposed APIs
description: A dive into chapter 56 of Effective Java
date: 2021-01-18
tags:
  - java
  - effective java review
  - design
  - architecture
---

The final chapter of this section of _Effective Java_ brings us to everyone's favorite topic, documentation. The particular type of documentation that this chapter focuses is about JavaDocs. As has been discussed before in this series, _Effective Java_ seems to largely target writers of Java libraries. Nowhere is this focus seen as much seen as in this chapter. While I still think it can be good information to learn for your "average" Java developer, its applicability may not be as high as other chapters in this book.  

As the applicability of this chapter seems lower to me I think I'll just cover the highlights and encourage those interested in finding out more into diving into the book to learn the details there. 

* JavaDocs should be focused on the contract of methods, what should be given, preconditions to those variables, what will be returned, what happens during errors, and side effects. 
* No two members of constructors in a class should share the same JavaDoc
* JavaDoc are often rendered into HTML, this can be used to your advantage to allow better formatting or can end up causing bugs when accidentally running into that parsing when you weren't expecting. 
* Testing JavaDoc often comes to just taking a look at it and making sure it looks correct.

There is a lot of power and ability to document your code through the JavaDoc tool. If you go to the trouble of writing this documentation, and you should if the primary purpose of your code is to be consumed by other Java developers, take the time to do it right. This means making it useful, documenting completely, hosting the JavaDoc somewhere accessible, etc. A halfway done job of documentation is likely worse than none at all. Also it can be of note that maybe JavaDoc is not the most useful type of documentation for your particular code, only you will know that as your look at how it will be used.

 

