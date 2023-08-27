---
title: Effective Java! Minimize Mutability
description: A dive into chapter seventeen of Effective Java
date: 2020-03-20
tags:
  - java
  - effective java review
  - design
  - architecture
  - immutability
---

Today's topic is about mutability and the benefits we can get from making our value objects immutable. I think this is a great topic to go over as it's pretty simple and can make many other parts of your application simpler as well. What a wonderful combination!

The concept of an immutable object is simple, it's an object that cannot be modified once it is created. Java's platform libraries have a few example of immutable classes such as `String`, `BigDecimal`, `BigInteger`, and the boxed primitive types. So why would you choose to make something immutable? Isn't removing capabilities a bad thing? Well, as interestingly often turns out to be the case, removing the capability to do something actually can make other things much simpler and safer. Before jumping into what immutability gives us let's talk about how to make a class immutable. 

1. *Don't provide methods for mutating state:* Often called mutators or setters.
2. *Ensure classes can't be extended* Most commonly accomplished by making the class final.
3. *Make all fields final:* Clearly expresses desire that the internal state will not be mutated. Also assists when passing state from one thread to another.
4. *Make all fields private:* You would likely being doing this if you are following other guidance from _Effective Java_ and here we follow this guidance for all the same reasons.
5. *Ensure exclusive access to mutable state:* If your immutable object provides mutable state via an accessor it must protect it's internal state by making defensive copies.

Let's look at an example:

```java
@Getter
public final class ComplexNumber {
  private final double real;
  private final double imaginary;

  public ComplexNumber(double real, double imaginary) {
    this.real = real;
    this.imaginary = imaginary;
  }
  
  public ComplexNumber plus(ComplexNumber other) {
     return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary);
  }

  public ComplexNumber minus(ComplexNumber other) {
     return new ComplexNumber(this.real - other.real, this.imaginary - other.imaginary);
  }

  // ... other methods
}
```

So let's look at some interesting things with this class. First thing you'll notice is that we obey the rules of making it a final class and final member variables. You will also notice the absence of something, that being mutators. Probably the most interesting is with our `plus` and `minus` methods we return a new instance of `ComplexNumber` instead of mutating the existing state. When you first see this functional approach, sometimes it can look strange. We can also see that these methods are named _prepositions_ (`plus`) instead of _verbs_ (`add`). This word choice difference, although not required, can help the user of the class understand that they will be receiving a new object. 

Now let's move onto what benefits we receive when using immutability. 

* *Immutable objects are simple:* Your object can only be in one state. This can greatly simplify dealing with your object.
* *Immutable objects are inherently thread-safe:* There is no way to corrupt the state across threads. Immutable objects are by far the easiest way to accomplish thread-safety. 
* *Immutable objects can be shared freely:* Since the state cannot change there are no concerns with sharing immutable objects. If your object represents a _Widget_ right now it will still represent a _Widget_ in the future as well. This means that we don't need to make defensive copies. This also allows you to cache commonly created objects and just return those every time they are requested (potentially with a static factory). This can speed up the creation of the objects as well as decrease memory pressure. 
* *Not only can you freely share object but internals as well:* This seems more of a niche item but it does seem interesting. Because the state doesn't change you can share the internal state between different objects. The example given in the book is that the `BigInteger` object has a sign bit to signify if it represents a positive or negative number. If you wanted to negate the object all you need to do is create a new `BigInteger` with the sign bit flipped and then reference the rest of the original object's state.

So there are a lot of benefits to immutable objects. What about the downsides and how can we mitigate these downsides.

*Changing anything in an object requires creating a new object:* Creating many new objects just to change a tiny bit of state can be expensive, especially if the objects are large. This can get much worse if there are multiple steps to mutating the state as this will leads to creating many, potentially expensive, objects. 

So how can we mitigate this? If there are common operations that a user may want to do on your object you can handle the multiple step process for them. This works great if you know ahead of time what kind of operations users will want to perform. What if you don't? Another option you have with this is to create a mutable companion class that the user can perform the mutation on that then can can be used to create the immutable class. An example of this would be the `StringBuilder` class and it's ability to efficiently create `String` objects. 

Let's discuss a few last things. 

One alternative to making your class final is to create private constructors and instead depend on static factories to create your immutable objects. This gives you options in the future to subclass the class and also optimize for performance later. 

Another thing to keep in mind is, although above we mentioned that the state cannot change, only the _externally_ facing state cannot change. That means we can cache internally data as long as the values returned are consistent. 

As always I like to mention how _Lombok_ can help us achieve our goals. Immutable objects are no different. _Lombok_ includes a `@Value` annotation that you put on your class that will make your class `final`, create a constructor that takes all of your `private final` member variables, doesn't generate setters, and also generates many of the other boilerplate items for you (`hashCode`, `equals`, `toString`). While just adding this annotation won't magically make your class immutable, it will get you well on your way with taking care of the boilerplate of the class in an immutable compatible manner. 

One final thought is to always create immutable objects unless there is a reason not to or you can't. Even if you can't make your object entirely immutable try to make them as immutable as possible. 


And there you have it. Immutable objects. They do make things simpler and can make our code much easier to use. 