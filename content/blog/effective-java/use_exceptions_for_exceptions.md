---
title: Effective Java! Use Exceptions for Only Exceptional Circumstances
description: A dive into chapter 69 of Effective Java
date: 2021-07-27
hero_image: https://miro.medium.com/v2/resize:fit:720/0*J7v943-XP2mbi1Gh
tags:
  - java
  - effective java review
  - design
  - architecture
---

At some point in your coding career you may be unlucky enough to encounter code that looks somewhat like the following:

```java
try {
  int i = 0;
  while (true) {
    items[i++].process();
  }
} catch (ArrayIndexOutOfBoundsException ignored) {
}
```

Likely what this code is doing doesn't immediately jump out at you, especially compared to a similar function that performs the same function written like this:

```java
for (Item item : items) {
  item.process();
}
```

Not only is the first function more code, it is harder to grok and actually less performant. The unfortunate thing is that apparently some developers that write code like the first example are in search of performance improvements incorrectly thinking that since the bounds check is going to happen anyway they would be duplicating executed code by including a bounds check (the bounds check is implicit in the for-each example above). This is wrong for a few reasons:

* Exceptions are not as optimized to the level that boolean checks are in the JVM.
* The compiler can't safely perform some of its optimizations if your code is in a try-catch block.
* The redundant checks that the programmer is seeing are common enough that JVM optimizations have been built in order to remove the redundancy.

A principle that I think that can be understood here is that of, especially in a managed runtime like the JVM, the more you follow the way a programming language was designed to be used, the more likely you are to get performance benefits off the bat as well as in the future as the language and compiler developers optimize and improve the common workflows. 

All this being the case, exceptions should be reserved for, as their name suggests, exceptional circumstances. If there are cases where a particular function needs its state to be in a particular state before it is called, you should provide a mechanism for the developer using your function to determine if it's in that correct state. One example of this that we have in the core libraries is the `Iterator`'s `next` function. If that function is called when there is no next item, a `NoSuchElement` exception is thrown. In order to avoid forcing developers to have to use exception-based development, the API designers also created the `hasNext` function. This allows a user of the API to determine if the `next` function call is expected to be successful before calling. This method definitely can work well in practice.

Another method that can be employed, and one that has the added benefit of being usable in cases where concurrent access is possible, is that of designated return values or `Optional<>` return types. With a designated return type a special value (-1, `null`, an empty collection, etc) is designated as a special value that will be returned if the object is not in the correct state. This is a less explicit indicator to the user of the API than an exception or an `Optional` so I would likely not use it anymore given that `Optional` is available. The `Optional` option is similar in that the special value `Optional.empty` can mark the object as not being the correct state. In this case, however, it is much more explicit when there is a value or not and the `Optional` APIs allow the simpler handling of both the valid state and the empty state. As stated above, both of these "designated value" options have the benefit of being usable in a concurrent access situation which wouldn't be appropriate for the `hasIterator` example style above because the state could change between calling the `hasIterator` function and calling `next`.

The final question that a developer has to ask themselves is what constitutes exceptional? While to me, the above example does not feel exceptional at all there are other cases where things can become not as cut and dry. For example, I have worked with developers that don't believe exceptions should be used for business validation concerns. For example, they would never write code that upon receiving an invalid value, let's say a duplicate name when that is not allowed, would throw a custom `DuplicateNameException`. I have met other developers that would prefer that approach. There are definitely benefits to both sides on this one and you will likely need to determine on which side your application will fall. 

Exceptions are for exceptional cases (whatever that means to you). As you follow this guidance your code will end up being more performant, easier to maintain, and much closer to what the language designers intended which may mean it gets free improvements as the underlying engine progresses. 