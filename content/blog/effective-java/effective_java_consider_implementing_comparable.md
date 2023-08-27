---
title: Effective Java! Consider Implementing Comparable
description: A dive into chapter fourteen of Effective Java
date: 2020-02-25
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we come to the final chapter of this section about methods common to all objects. Unlike the rest of the methods talked about in this section this method is actually not a method on the class `Object`. That being said this method does affect the default operations in various other classes thus it is important to understand. The method we are talking about today is `compareTo` and it's related interface, `Comparable`.

So what is the purpose of the `Comparable` interface? It has a purpose in line with `Object`'s `equals` however its purpose is to do order comparisons as well as equality comparisons. When you implement `Comparable` you are indicating that there is a natural order to your instances and offers a way to organize them in that way. Once you implement the interface, sorting an array of them is as simple as `Arrays.sort(myArray)`.

Given that the natural order can be determined this makes it trivial to keep a sorted collection, search through values, or find maximum and minimum values. For example filling a `TreeSet` (which uses the `compareTo` method to sort its internal data structure) with `String` objects (which implement `Comparable`) you end up with an alphabetized list of values. The `Comparable` interface provides a lot of value, this is likely why practically all of Java's built in value types implement this interface. If the value class that you are writing has a natural ordering it can be a good idea to implement this interface as well.

Let's go over the interface and the contract. The `Comparable` interface looks something like the following:

```java
public interface Comparable<T> {
  int compareTo(T t);
}
```
This is makes for a fairly straightforward interface. One method that takes in the generic type and returns an integer. So let's go over the contract for the `compareTo` method:
* The `compareTo` method should return a negative number, zero, or positive number as the object is less than, equal to, or greater than the provided object. 
* Throw a `ClassCastException` if the provided object type is not compatible to be compared with the object.

The next few items take advantage of the `signum` mathematical function, denoted as `sign()` below. Simply put, this method returns a -1 for negative numbers, 0 for 0, and 1 for positive numbers.

* For all `x` and `y`, `sgn(x.compareTo(y)) == -sgn(y.compareTo(x))`
* Related to the above, `x.compareTo(y)` should only throw an exception if `y.compareTo(x)` also throws an exception.
* Same as the `equals` function, `compareTo` should be transitive. Therefore, if `x.compareTo(y) > 0 && y.compareTo(z) > 0` then `x.compareTo(z) > 0`. This should also work with `<` and `==`

The comparison between `compareTo` and `equals` has been brought up before in this post and `compareTo` does return `0` when items are `equal` so should it be that when `equals` returns `true` should `compareTo` always return `0`? The question comes down to, does object equality equate to natural ordering? Often it is the case that these are one in the same and can be surprising when they aren't the same. 

Let's see an example of where this can be surprising. The `BigDecimal` class implements comparable in a way that is different than it's `equals` implementation. So given a `HashSet` (which takes advantage of the `equals` method) with two items `new BigDecimal("1.0")` and `new BigDecimal("1.00")`. The `HashSet` will end up with two entries in it. Compare this to putting those same two items into a `TreeSet` (which uses the `compareTo` method) and we would end up with only one item in the collection. Doesn't quite pass the principle of last surprise does it? Thus, even though it's not required, it is strongly suggested that when two objects return `true` to `equals` that those same two objects end up returning `0` from `compareTo`. At the very least, if this suggestion is not followed, it should be well documented that it doesn't follow this expectation.

So how does one go about writing a `compareTo` method. It's not too dissimilar from writing an `equals` method. 
1. Determine the order of significance of the fields of the class.
2. Compare the fields by either recursively calling `compareTo` methods for reference types or use one of the built in `BoxedTime.compare()` methods such as `Double.compare()`. 
3. Once you find a field that is unequal return the value for that field (or if there are no differences return `0`).

Let's look at an example:

```java
public int compareTo(PhoneNumber pn) {
  int result = Short.compare(areaCode, pn.areaCode);
  if (result == 0) {
    result = Short.compare(prefix, pn.prefix);
    if (result == 0) {
      result = Short.compare(lineNumber, pn.lineNumber);
    }
  }
  return result;
}
```
Not super complex however you can see how this could get pretty deep indentation. Java 8 provides an alternative that can end up much cleaner.
```java
private static final Comparator<PhoneNumber> COMPARATOR = 
  comparingInt((PhoneNumber pn) -> pn.areaCode)
    .thenComparingInt(pn -> pn.prefix)
    .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
  return COMPARATOR.compare(this, pn);
}
```
As you can see this will be much simpler and cleaner. No matter how many items we are comparing it won't get any deeper. The trade-off being a little bit of performance. 

Something that you will occasionally see that may look like a good idea at the time is taking advantage of the fact that the difference between two values is negative. Thus subtracting one from the other can lead to meeting the contract. The trouble with this is you can deal with integer overflow and other such problems. It's best to take the slight performance hit of using the comparing methods.

Unfortunately, with this method I don't know of a tool like `Lombok` that can generate the `compareTo` method for us. That being the case we do need to handle the creation of this method ourselves. Summing this chapter up, when you are creating a value type with a natural order you should consider implementing the `Comparable` interface. This allows your value type to be easily sorted, searched, and used in comparison-based collections. 

