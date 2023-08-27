---
title: Effective Java! Override clone judiciously
description: A dive into chapter twelve of Effective Java
date: 2020-02-17
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we are talking about the `Cloneable` interface and it related `clone` function. Honestly I haven't interacted any with this method in the past and after learning about it I'm not sure I really want to, it seems quite error prone. So let's dive in and understand this method so that we can make intelligent decisions about whether to use this method or not.

So what is the `Cloneable` interface. It is a _mixin interface_ that signals to users of the class that a certain action can be performed on the class. The extremely weird thing about this particular mixin is that, rather than requiring the implementation of a particular function, it merely acts as a flag that allows the implementing class to call a method on the parent class. What this means is that a user of the class that implements `Cloneable` can't necessarily always call the `clone` method on that class without resorting to reflection and even then that might not work. All this being said, this is a part of the `Object` class so it pays to understand it and know how to implement the method as well as what the alternatives are. This chapter of _Effective Java_ goes through that.

So what is the contract of `Cloneable`? As we learned above it doesn't include any methods but instead acts as a flag to the protected `clone` method in the `Object` class. If a class calls the `clone` on `Object` and that class implements `Cloneable`, `Object`'s implementation of `clone` will return a field-by-field copy of the object. If the class does not implement `Cloneable`, a `CloneNotSupportedException` is thrown. If this use of a interface feels weird that is good, this is not a behavior you should try to mimic in your own classes. The general (although weak) contract is as follows:
* The implementing class should create a public `clone` class that calls into the `super.clone()` method.
* `(x.clone() != x) == true` simply, clone should return a new object and not just return the current object.
* `(x.clone().getClass() == x.getClass() == true` this is not an absolute requirement but is expected.
* `x.clone.equals(x) == true` Again this is not an absolute requirement but does decrease the surprise of how it would work.

One could think that you could just skip calling the `super.clone()` method in your own `clone` method and simply call into a constructor to create the new object but this could cause problems for a class that extends your class and calls into `super.clone()` as it will return an object of the wrong class. As mentioned above, this doesn't actually break the contract but goes against convention.

So let's dive a little deeper into how this works and how you should implement it. The first step of implementing the `clone` method is to call `super.clone()` which will return a fully functioning replica of the calling class. If your class contains only primitives or references to immutable objects this may be all you need to do. Let's see an example:

```java
@Override
public Address clone() {
  try {
    return (Address) super.clone();
  } catch (CloneNotSupportedException impossible) {
    // This will never happen.
    throw new AssertionException();
  }
}
```
Let's go over some of the interesting things here. Because `Object`'s `clone` method's return type is `Object` we want to cast it to the type of our class. This is fine because Java allows _covariant_ types. Simply put, it allows us to use a subclass of the required class in the place of the parent type. This cast will always succeed and allows the client code to skip the type cast. The next interesting thing here is the `try-catch`. The Object method's signature includes that it throws a `CloneNoteSupportedException`. In the case where a class implements the `Cloneable` interface this exception will never be thrown, this is an example of a poor use of a checked exception and should have been a `RuntimeException`.

So let's look at an example where the class is a little more complex with non-primitive fields. 
```java
public class Stack {
  private Object[] elements;
  private int size;
  private static final int DEFAULT_INITIAL_SIZE = 16;

  public Stack() {
    elements = new Object[DEFAULT_INITIAL_SIZE];
  }

  public void push(Object o) {
    ensureCapacity();
    elements[size++] = o
  }

  public Object pop() {
    if (size == 0) {
      throw new StackEmptyException();
    }

    Object result = elements[--size];
    elements[size] = null;
    return result;
  }

  private ensureCapacity() {
    if (elements.length == size) {
      elements = Arrays.copyOf(elements, 2 * size + 1);
    }
  }
}
```
So if we want to make this `Stack` class implement `Cloneable` and tried to mimic what we did with the `Address` class? We would end up with a replica class with a copied `size` field but an `Object` array that is shared between the two instances. This will lead to many issues so we need to take this a little farther. Think of the `clone` method as a type of constructor that must protect the original object. So let's see a working `clone` method for this `Stack` class:

```java
@Override
public class Stack clone() {
  try {
    // this gets us a replica with copied size field
    Stack copy = (Stack) super.clone();
    copy.elements = elements.clone();
    return copy;
  } catch (CloneNotSupportedException impossible) {
    throw new AssertionError();
  }
}
```
Now we are effectively cloning our `Stack` class. This recursive call in our `clone` method can solve a lot of problems with the clone method but not all. There are times that you will need to take this further and make deep copies of elements. There are many ways to accomplish this and we won't go over all of them here but it is something to be aware of. 

Other things to think about:
* Because `clone` methods are similar to constructors they shouldn't call overridable methods. 
* Even though `Object`'s `clone` method throws `CloneNotSupportedException`, your overrides should not. 
* When designing a class for inheritance you have two choices. Implement the `clone` method with the same signature as `Object`'s, giving the implementing class the freedom to choose to implement `Cloneable` or not. The other option is to implement `clone` and simply throw `CloneNotSupportedException` which will block cloning.
* If your class needs to be thread safe remember your `clone` implementation also needs to be synchronized. `Object`'s `clone` method is not synchronized.

So is it worth it to implement this? Likely not. There are much easier ways to get this accomplished. Often a copy constructor or copy factory can get the job done in a much more straightforward way. So in our `Address` case it could look like:
```java
public class Address(Address originalAddress) { ... }
```
or 
```java
public static Address newInstance(Address originalAddress) { ... }
```
So what are some benefits of using one of these methods over implementing `Cloneable`:
* They doesn't rely on error prone, non-obvious behavior of the field-for-field copying.
* They don't require following of non-obvious and undocumented contracts.
* Doesn't conflict with the use of final fields
* Doesn't have us deal with unnecessary checked exceptions.
* They allow parameters of types that are interfaces that the class implements. This is what we see done with collections in the standard library.

So long story short, you likely shouldn't implement the `Cloneable` interface. Instead reach for one of the other patterns we have such as copy constructors or copy factories. By using these methods you should have a much better experience and have a less buggy code base. 