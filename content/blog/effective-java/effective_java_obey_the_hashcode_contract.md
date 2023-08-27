---
title: Effective Java! Obey the hashcode contract
description: A dive into chapter ten of Effective Java
date: 2020-01-28
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today's topic goes right in line with last week's. This week we are talking about the `hashCode` function. Just like the `equals` function we talked about last week this method also has a contract that should be followed albeit a simpler one. As is the signature, taking no parameters and return an integer. So lets get to the contract:
* Given no changes to an object the value returned from the function should remain the same.
* If two objects are effectively equals their hashcodes must be the same. 
* (This one is more of a non-requirement) Given two objects that are effectively unequal they _need not_ have different hash code values.

So as you can see the contract of `hashcode` is very tied into equality. The requirement that gets broken the most is the second requirement. If you don't implement a hash code function two effectively equivalent objects will likely not have the same value returned by the function. So let's look at an example:
```
Map<Address, String> addressBook = new HashMap<>();
addressBook.put(new Address("123","Foggy Lane" "Made Up City", "USA"), "James");
addressBook.get(new Address("123","Foggy Lane" "Made Up City", "USA"));
```
Given the above example the expectation would be that line three would return "James" however, if the hash code function is not written properly, it will instead return `null`.

So let's write the simplest hashcode function that is legal:
```
@Override
public int hashCode() {
  return 42;
}
```
Yes, that is a totally valid hashcode function per the contract. It always returns the same thing if called multiple times on the same object, it returns the same value for functionally equivalent objects, and it's OK that it returns the same hashcode for two objects that are not functionally equivalent. However, even though it meets the contract, not having some variety to the values returned is a horrible idea and can lead to a great decrease in performance. For example, the above hashcode function would effectively turn a HashMap into a linked list as far as performance goes.

There must be a better way, and there is. _Effective Java_ gives us a recipe we can follow to create a solid hashcode function. 
1. Declare an `int` named `result` and initialize it to the value of the first significant field of the object (reminder of what "significant field" means is a field that takes part in the decision if two objects are equivalent) as computed in step 2.
2. For every remaining significant field, do the following
  * Compute an `int` hash code for the field
    * If the field is a primitive, compute it with it's boxed version's `hashCode` function. Ex: `Double.hashCode(value)`
    * If the field is an object reference, call into that object's `hashCode` function. For null use the value `0`
    * If its an array, treat each significant element as a separate field or use `Arrays.hashCode` if they are all significant.
  * Combine the hash code you just calculated with the result as follows: `result = 31 * result + newFieldHashcode`
3. Return `result`

If you correctly follow the above algorithm you should have a solid hash code calculated. Nice elements of this algorithm are that the order of operations matters and thus leading to a better distribution. Multiplying by 31 is nice because it's an odd prime. The odd helps with integer overflows and the prime part is just because primes are cool. In all reality it sound simply like it has become a standard. So let's see our new `Address` hashCode function. 
```
@Override
public int hashCode() {
  int result = streetAddress.hashCode();
  result = 31 * result + road.hashCode();
  result = 31 * result + country.hashCode();
  return result;
}
```
Fairly simple, but effective. Are there simpler ways to write these functions? Sure. One example is using `Objects.hashCode(significantField1, significationField2, ...)`. This is nice in that it's a one line `hashCode` function. The downside of this is that is has worse performance than our previous example. But really the best in my opinion is to use something like Lombok. Lombok enables this via it's `@EqualsAndHashCode` annotation. This is great of the maintainers of Lombok to force the generation of `equals` and `hashCode` together. 

Finally let's just go over some things to keep in mind with `hashcode`:
* Always override `hashcode` when you override `equals`
* Include all values being used in the `equals` as part of the calculation of `hashcode`.
* Don't share outside the function how the hash code is calculated, it unnecessarily can tie you to a sub-par implementation.

