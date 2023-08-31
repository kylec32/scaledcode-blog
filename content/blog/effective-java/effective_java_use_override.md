---
title: Effective Java! Consistently Use the Override Annotation
description: A dive into chapter 40 of Effective Java
date: 2020-08-31
tags:
  - java
  - effective java review
  - design
  - architecture
---

In our previous chapter we discussed creating annotations which was a lot of fun but not something that a lot of developers will find themselves doing on a day-to-day basis. Today we discuss something that you will interact with much more often. That is the `@Override` annotation. This annotation is quite simple but will help avoid some bugs and push detection of some of our defects to compile-time versus later in the process. To illustrate the point let us consider the following example:

```java
public class Bigram {
  private final char first;
  private final char second;

  public Bigram(char first, char second) {
    this.first = first;
    this.second = second;
  }

  public boolean equals(Bigram b) {
    return b.first == first && b.second == second;
  }

  public hashcode() {
    return 31 * first + second;
  }

  public static void main(String[] args) {
    Set<Bigram> s = new HashSet<>();
    for (int i = 0; i < 10; i++) {
      for (char ch = 'a'; ch <= 'z'; ch++) {
        s.add(new Bigram(ch, ch));
      }
    }
    System.out.println(s.size());
  }
}
```

This code loops through the lowercase alphabet and adds two of the same character as `Bigram` to a set. It repeats this operation ten times. Seeing as it's doing the same thing over and over and putting the results in the set and duplicates can't be put into a set you would likely expect the size to be 26 but it actually ends up with 260 elements. Can you spot why the duplicates were allowed to be inserted? The author of this code surely intended to override the base class `Object`'s `equals` function but unfortunately messed up the signature. This is because the author ended up overriding the `equals` function not overriding it. To override it the function needs to take an `Object` not a `Bigram`. 

This is where the `@Override` annotation can come in use. If the author of the code would have put this annotation on the method at compile time the compiler would have thrown an error saying there wasn't a method to override.

During the initial compilation is where you do get most of the benefit of the `@Override` annotation; however, it still can be of use beyond that. Your IDE can also use this information to add information to your code and help you develop in a safe manner. Finally, it can be used as a matter of communication with future developers of what methods are being overriden and which ones are not. 

In summary, when we override a function we should always annotate it with the `@Override` annotation. This will give you better safety and documentation of the classes you write. 
 
