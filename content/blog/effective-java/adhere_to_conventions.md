---
title: Effective Java! Adhere to Generally Accepted Naming Conventions
description: A dive into chapter 68 of Effective Java
date: 2021-07-18
hero_image: https://miro.medium.com/v2/resize:fit:720/0*Lpe_ADkuzL_xao8Z
tags:
  - java
  - effective java review
  - design
  - architecture
---

Java has been around for a long time. In its long history certain conventions have been created. An official set of conventions, reasonably called _The Java Language Specification_, stands as the official language conventions. These conventions cover both appearance and grammatical conventions. 

The first item to cover is that of the package structure. Packages form a hierarchical organization of components separated by periods. Components are written in lowercase letters and rarely digits. Packages should begin with the organization's domain name with the components reversed (ex: `com.google`, `org.apache`, etc.) Two exceptions to this are the `java` and `javax` packages. Package components should be kept short with abbreviations being encouraged. Each component should consist of a single word or abbreviation. The immediate children in the hierarchy of a package after the reversed domain name are sub-packages. Single or multiple levels of sub-packages can subdivide an application into reasonable parts. For almost all applications this is preferred.  

Class, interface, enum, and annotation type names should consist of one or more words with the first letter being capitalized such as String or BigInteger. Common abbreviations are accepted but non-standard abbreviations should be avoided. There is not a prescribed standard on whether acronyms should be all uppercase in type names or whether only the first letter of the acronym should be uppercase. I prefer the first character being uppercase convention as I think this makes it easier to distinguish different words in the type name.

Method and field names follow the same conventions as classes except that the first character is lowercase by convention. The only exception to this is "constant fields" (those that are `static final`). These field names should be uppercase with underscores separating words (ex: NEGATIVE_INFINITY).

Local variables follow much of the same rules as field names but with some relaxing of the rules. Since the scope of the variables is smaller, we don't need to be so strict with the rules. For example, the variable `i` is an acceptable local variable in a `for` loop as it's well understood and a common pattern.

Type parameter names usually consist of a single letter. The five most common are `T` for an arbitrary type, `E` for the element type of a collection, `K` and `V` for the key and value types for a map, and `X` for exceptions. The return type of a function is usually `R`. Sequences of arbitrary types can be `T`, `U`, `V` or `T1`, `T2`, `T3`.

Grammatical naming conventions are less prevalent and more controversial. Instantiable classes are usually named  with a singular noun or noun phrase such as `Thread`, `PriorityQueue`, `ProcessManager`. Non-instantiable utility classes are often named as plural nouns such as `Collections` or `Files`. Interfaces can be named the same way as classes or as adjectives ending in `-able` or `-ible` such as `Runnable`, `Iterable`, or `Accessible`. Annotations cover the gambit of purposes and thus their names can cover various patterns.

Methods that perform actions are generally named with a verb or verb phrase such as `append` or `drawImage`. Methods that return `boolean`s  have names that start with `is` and occasionally `has` such as `isDigit`, `isProbablePrime`, or `hasSiblings`. When a method returns an attribute of an object it can be named a noun, noun phrase, or verb phrase. Examples of this would be `size`, `hashCode`, or `getTime`. The third type has a particularlly strong contingent of developers behind it. The reason for this is; historically, this form took its roots from the largely obsolete `Java Beans` specification. Even though that particular specification is largely dead, there are still several tools that support this pattern and even expect it. Some method types are treated in a specific way. An example of this would be methods that convert the type of an object often are written as to_Type_ such as `toString` or `toArray`. Methods that take data and provide a different view of that data can also be listed as as_Type_ such as `asList`. Finally, static factory methods often build off the words `from`, `of`, `valueOf`, `instance`, `getInstance`, etc.

While following these conventions won't make your code execute any better, it will make it easier for other Java developers to maintain your code. This increased maintainability will allow your code to have a lower cost of maintenance and allow more time to focus on adding in new features. 