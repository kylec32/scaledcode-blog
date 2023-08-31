---
title: Effective Java! Use Stream Judiciously
description: A dive into chapter 45 of Effective Java
date: 2020-10-05
tags:
  - java
  - effective java review
  - design
  - architecture
---


Today we take on the concept of streams. Streams are another great feature added in Java 8 that allows more declarative, concise code. Streams contain two two abstractions: the _stream_ which represents a finite or infinite group of items and the _stream pipeline_ which represents a multistage system of computation.

To put it another way, streams contain a _source_, _processing nodes_, and _terminal operation_. The source can be any number of things such as a collection, file contents, random number generators, and other streams themselves. The processing nodes are any number of processing nodes that can manipulate and act on data before passing it down to the next node. Finally there is the terminal node. This is where the action actually happens. This is where all the processed items meet their final destination. This terminal node may be collecting into a collection or processing each item individually for example. Something to note is that all stream operations (other than the terminal node) are _lazily_ processed. This means that entries will effectively be pulled through each intermediate processing node all the way down to the terminal node. The terminal node will only pull as many items as it needs to. This means that if you don't put a terminal node on a stream pipeline nothing will get processed through it at all. 

Enough talk, let's look at an example, first without the use of streams. This program processes a dictionary of terms and will provide the anagrams in that dictionary of a certain length. 

```java
public class Anagram {
  public static void main(String[] args) throws IOException {
    File dictionary = new File(args[0]);
    int minGroupSize = Integer.parseInt(args[1]);
    Map<String, Set<String>> groups = new HashMap<>();
    try(Scanner s = new Scanner(dictionary)) {
      while(s.hasNext()) {
        String word = s.next();
        groups.computeIfAbsent(alphabetize(word), (unused) -> new TreeSet<>()).add(word);
      }
    }
    for (Set<String> group : groups.values()) {
      if (group.size() >= minGroupSize) {
        System.out.println(group.size() + ":" + group);
      }
    }
  }

  private static String alphabetize(String s) {
    char[] a = s.toCharArray();
    Arrays.sort(a);
    return new String(a);
  }
}
```

This program will work fine. Let's consider the stream version now:

```java
public class Anagrams {
  public static void main(String[] args) throws IOException {
    Path dictionary = Paths.get(args[0]);
    int minGroupSize = Integer.parseInt(args[1]);

    try (Stream<String> words = Files.lines(dictionary)) {
      words.collect(groupingBy(word -> alphabetize(word)))
        .values().stream()
        .filter(group -> group.size() >= minGroupSize)
        .forEach(g -> System.out.println(g.size() + ":" + g));
    }
  }

  // alphabetize method is the same.
}
```

In the above we get some great simplicity benefits with the use of streams. We could have taken it further but at that point we would likely have gone down in readability.  That is the art that you have to learn with streams. Using it to simplify your code and not to make it worse, like all good things it can be taken too far. 

Let's list some other things to keep in mind when working with lambdas and streams. 
* Because there are not explicit types, parameter names to lambdas are even more necessary. 
* To help improve readability extracting helper methods to use in your streams is best practice. 
* Hopefully it goes without saying but only use streams if it improves the code and doesn't make it more unreadable. 

I'm a big fan of streams. They can take some getting used to but once you understand them I'm a big fan. Not only does it make your code more concise but also allows you to focus your code in a more declarative manner of focusing on what you want to accomplish and less on how. 
