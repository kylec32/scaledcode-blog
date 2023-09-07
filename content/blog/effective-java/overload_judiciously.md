---
title: Effective Java! Use Overloading Judiciously
description: A dive into chapter 52 of Effective Java
date: 2020-11-23
tags:
  - java
  - effective java review
  - design
  - architecture
---

In order to introduce our chapter topic today let's look at some code that is trying to determine what type a parameter is:

```java
public class CollectionClassifier {
  public static String classify(Set<?> ser) {
    return "Set";
  }

  public static String classify(List<?> list) {
    return "List";
  }

  public static String classify(Collection<?> collection) {
    return "Unknown Collection";
  }

  public static void main(String[] args) {
    Collection<?>[] collections = {
      new HashSet<String>(),
      new ArrayList<String>(),
      new HashMap<String, String>().values()
    };

    for (Collection collection : collections) {
      String.out.println(classify(collection));
    }
  }
}
```

Looking at this code you would think that it would output "Set, List, Unknown Collection" but actually when it executes it outputs "Unknown Collection, Unknown Collection, Unknown Collection". Why is this? This is because the algorithm for selecting an overloaded function is a compile time decision. The compile time type is `Collection` therefore the function that outputs "Unknown Collection" is called for all types even though there may have been, what we perceive, as better functions to call based on the runtime types. This can be confusing as this goes against what happens with overridden functions. When we are calling overridden functions the most specific runtime implementation is chosen. Thus selection of overloaded methods is static and overridden functions are dynamic. This mismatch can lead to a lot of confusion. 

So in light of this how should we treat this information. The simplest policy to follow is to not to overload methods with other methods that could be confused with others. Let's consider some ways we can accomplish this. 

The easiest way to accomplish this is not to have two overloaded methods have the same number of parameters. This makes it very difficult if not impossible to confuse two methods. 

Another solid method is not to overload the methods at all and instead create different, specific methods. For example, instead of having a bunch of different `write` methods that take different types we could have a `writeLong`, `writeString`, `writeInt`, etc. This also can lend itself to having a number of read methods that match such as `readLong`, `readString`, `readInt`, etc. 

Finally if we can't have a different number of parameters per overloaded method we should at least make their methods entirely incompatible. What this means is that there is no reasonable way to convert from one parameter type to another. One overloaded method taking an int and another taking an array of Strings. By doing this we can greatly reduce the potential of confusion. 

As with all of our code a major goal should be to simplify the use of the code. By avoiding overly complicated uses of overloading we can accomplish this task. 

