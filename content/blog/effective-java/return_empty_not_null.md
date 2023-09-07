---
title: Effective Java! Return Empty Collections or Arrays, Not Nulls
description: A dive into chapter 54 of Effective Java
date: 2020-12-12
tags:
  - java
  - effective java review
  - design
  - architecture
---

It is not uncommon to see code like the following:
```java
private final List<Chesse> cheesesInStock = ...

public List<Cheese> getInStockCheeses() {
  return cheesesInStock.isEmpty() ? null : new ArrayList<>(cheesesInStock);
} 
```

A use of method would looks something like:

```java
List<Cheese> cheeses = getInStockCheeses();

if (cheeses != null && cheeses.contains(Cheese.CHEDDAR)) {
  System.out.println("We have cheese in stock");
}
```

While the above code definitely works it requires more of the consumers than we should be requiring. If a consumer of your class doesn't realize they should be handling null they will have a subtle bug that they may not realize for some time because the function may respond with one or more objects in the list most of the time. A better way of handling this is simply returning an empty collection in cases where the source collection is empty. The change to the above code would look something like:

```java
public List<Cheese> getInStockCheeses() {
  return new ArrayList<>(cheesesInStock);
} 
```

An argument one might have against doing the above is the creation of a new collection on every call, even when it's empty. In extremely performance critical applications this could have a negative effect. In cases like this we can make a slight switch that can keep the improved efficiency. 

```java
public List<Cheese> getInStockCheeses() {
  return cheesesInStock.isEmpty() ? Collections.emptyList() : new ArrayList<>(cheesesInStock);
} 
```

The above will return the same empty list every time that it returns it. This does make the code a little more complex so if you aren't in a performance critical application it may not be worth making the above change.

In cases where we are returning an array we apply the same concept of returning the array, empty or not instead of returning null. Thus the code would look something like:

```java
public Cheese[] getInStockCheeses() {
  return cheesesInStock.toArray(new Cheese[0]);
} 
```

Further optimizations to the above would be to allocate the empty cheese array and reuse that same empty array each time. Something to note is that you shouldn't allocate array to the correct size when making this call. Although it may feel like an optimization it actually hurts performance. 

By making this slight change to our code we can make the job of our function callers easier and safer and even our internal code gets an improvement in readability. This is one of the cases where it does feel like we can have it all. 

