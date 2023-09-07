---
title: Effective Java! Prefer for-each loops to traditional for loops
description: A dive into chapter 58 of Effective Java
date: 2021-02-24
tags:
  - java
  - effective java review
  - design
  - architecture
---

A core part of many programs is iterating over groups of items. Java provides us many mechanisms for performing this iteration. We have options like `while` loops, `for` loops, `Stream`s, `for-each` loops, etc. Different mechanisms are better suited to different usages. This particular chapter is encouraging us to prefer `for-each` loops over the more traditional loops. Before we get into what `for-each` loops can provide for us let's look at some example of the alternatives.

One example of looping over a `Collection` would be:
```java
for(Iterator<Element> iterator = collection.getIteator(); iterator.hasNext();) {
  Element element = iterator.next();
  // Do something with element
}
```

or with an array

```java
for(int i=0; i<array.length; i++) {
  Element element = array[i];
  // Do something with element.
}
```

The above definitely works but there are a number of details in order for the iteration to work. This leads to clutter as well potential for mistakes. 

Let's look at an example with a bug and see if you can spot it:

```java
enum Suit {CLUB, DIAMOND, HEART, SPADE }
enum Rank { ACE, DEUCE, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING }

static Collection<Suit> suits = Arrays.asList(Suit.values());
static Collection<Rank> ranks = Arrays.asList(Rank.values());

List<Card> deck = new ArrayList<>();
for (Iterator<Suit> i = suits.iterator(); i.hasNext(); )
  for (Iterator<Rank> j = ranks.iterator(); j.hasNext(); )
    deck.add(new Card(i.next(), j.next());
```

The bug above ends up being rather subtle. The problem is that we should be calling `next()` on `i` outside the inner loop as we are currently iterating through that collection too quickly and skipping elements. This will likely lead to a `NoSuchElementException` but in rather unfortunate cases where the outside collection is a multiple of the inside we would get no errors but the code wouldn't be doing what we want. 

Now let's look at changing the above to use a for-each loop:
```java
enum Suit {CLUB, DIAMOND, HEART, SPADE }
enum Rank { ACE, DEUCE, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, JACK, QUEEN, KING }

static Collection<Suit> suits = Arrays.asList(Suit.values());
static Collection<Rank> ranks = Arrays.asList(Rank.values());

List<Card> deck = new ArrayList<>();
for (Suit suit : suits)
  for (Rank rank : ranks )
    deck.add(new Card(rank, suit);
```

The above ends up being much cleaner as well as much less error prone. 

All this being said, lets consider times when we can't use for-each loops:
* *Destructive Filtering* - If you will be changing the collection as you iterate through it you will need to use a raw iterator. 
* *Transforming* If you need to replace some or all the values you can also not use a for-each loop.
* *Parallel Iteration* If we need to traverse multiple collections at the same time we will need more control than a foreach loop can give us. 

Although there are a number of situations where we can't use for-each loops these are usually the exception and our "run of the mill loop" is a great opportunity for the use of a for-each loop. Because of the advantages, being, readability, safety, and flexibility it is encouraged to use for-each loops whenever possible. 
