---
title: Effective Java! Obey the equals contract
description: A dive into chapter seven of Effective Java
date: 2020-01-20
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we are starting a new chapter. This new chapter covers methods common to all objects. And what are methods that are common to all objects? Well since every object eventually inherits from `Object` it would be methods on that object. The method we have a pleasure to talk about today is the `equals` method.

The equals method seems simple to override but it is actually easy to get ourselves into trouble with it as Effective Java details. So why must we override the `equals` method? Well actually we don't have to. If your class fulfills any of the following requirement there is no need to override the `equals` method:
* Each instance of a class is inherently unique. `Thread` for example doesn't make sense to have two instances be equals.
* If there is no desire for two objects of the type to be compared. This does seem risky in that if others are consuming your class you can't know for sure if they will ever want to compare two instances of the class.
* The superclass implements an `equals` method that is appropriate for the class. Examples of this are the implementation of `equals` in `AbstractList` thus none needed in `ArrayList`.
* If the class is private or package-private and you can be sure that equals will never be called on the class.
* If the class uses instance control. This is something like the singleton model we talked about in a previous item or enums where there is only a single instance. In these cases logical equality is the same as instance equality. 

So we have gone over times that we can avoid overriding the `equals` function. But what must we do if we do need to overwrite this function. Well we must meet the contract of the function. To meet this function's contract we must meet the four properties for non-null objects:

* _Reflexive_: An object should be equal to itself (`x.equals(x) = true`)

* _Symmetric_: If `x.equals(y) = true`, then `y.equals(x)` must equal true as well. (And if the former returns false, the latter should as well)

* _Transitive_: As an extension of the symmetric property. If `x.equals(y) = true` and `y.equals(z) = true` then `x.equals(z)` must equal true. 

* _Consistent_: Multiple invocations of `x.equals(y)` should consistently return the same result. Thus there shouldn't be any side effects of the execution.

* The final item, less so a property, is that for any non null `x`. `x.equals(null)` should equal false.

The above properties can appear pretty daunting and very mathematical when you first read them and they should be taken seriously. That being said it is fairly straightforward once you learn about them. 

_Reflexive_ - This first property is quite straightforward. Objects should be equal to themselves. This is usually quite easy to accomplish especially given not overriding the `equals` function we do get this property for free.

_Symmetry_ - The next property is more meaty. This one says that if `x` says it is equals to `y`, `y` should also say it's equal to `x`. Let's look at an example of class that does not meet this property.

```
public final class CaseInsensitiveString {
  private final String value;

  public CaseInsensitiveString(String value) {
    this.value = Objects.requireNonNull(value);
  }

  @Override
  public boolean equals(Object o) {
    if (o instanceof CaseInsensitiveString) {
      return value.equalsIgnoreCase((CaseInsensitiveString)o);
    } else if (o instanceof String) {
      // This breaks symmetry.
      return value.equalsIgnoreCase(o);
    }
    return false;
  }
}
```
In the above class we see that if a `String` is passed into the `CaseInsentiveString` object in order to check equality we check against a case-less string. However if a string was compared with a case-less string it would take into account the case of the string. Thus since `caseInsensitiveString.equals(string) is not necessarily equals to string.equals(caseInsensitiveString)`. So how would we fix the above implementation? By simplifying it: 

```
@Override
public boolean equals(Object o) {
  return o instanceof CaseInsensitiveString &&
    ((CaseInsensitiveString)o).value.equalsIgnoreCase(o);
}
```

_Transitive_ This is where things get really fun. The transitive property says that if `a.equals(b)` and `b.equals(c)` then it should mean that `a.equals(c)`. So let's see at an example of how this property can be broken. Consider the following class:

```
public class Animal {
  private final int numberOfLegs;

  public Animal(int numberOfLegs) {
    this.numberOfLegs = numberOfLegs;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Animal)) {
      return false;
    }

    return ((Animal)o).numberOfLegs == numberOfLegs;
  }
}
```

So as you can see we have a very simple (and super contrived) example class to hold animals where apparently the way we determine if two animals are the same are if they have the same number of legs. Now let's extend this class:

```
public class Dog extends Animal {
  private final String breed;

  public Dog(String breed, int numberOfLegs) {
    super(numberOfLegs);
    this.breed = breed;
  }
}
```

Okay, so we added one value to this class on top of what `Animal` already had. How should we write the equals function? Let's look at one attempt:

```
@Override
public boolean equals(Object o) {
  if(!(o instanceof Dog)) {
    return false;
  }

  Dog dog = (Dog) o;

  return super.equals(dog) && breed.equals(dog.breed);
}
```

So unsurprisingly we are asserting that one dog is equal to another if it has the same amount of legs and is the same breed. Seems simple enough, but do you see what property we may have broken? We actually broke symmetry. Let's see how. Consider the following two object.

```
Animal animal = new Animal(4);
Dog pitbull = new Dog("Pitbull", 4);
```
So if we have had `animal.equals(pitbull)` it would return `true` however if we flipped it and executed `pitbull.equals(animal)` it would return `false`. Whoops. Maybe if we made the equals function a little smarter we can fix this.

```
@Override
public boolean equals(Object o) {
  if(!(o instanceof Animal)) {
    return false;
  }

  if(!(o instanceof Dog)) {
    return o.equals(this)
  }

  Dog dog = (Dog) o;

  return super.equals(dog) && breed.equals(dog.breed);
}
```
Great! We fixed our symmetry problem but how did we do with our transitive property? 

```
Dog pitbull = new Dog("Pitbull", 4);
Animal animal = new Animal(4);
Dog basset = new Dog("Basset", 4);
```

In this case `pitbull.equals(animal)` would equal `true` and `animal.equals(basset)` equals true but `pitbull.equals(basset)` does not equal `true`. Uh oh. So what to do? How do we fix this? Well it turns out *this problem is not really fixable*. That's right. What we have just witnessed here is a fundamental problem with these equivalence relationships in object-oriented languages. One suggested way to fix this issue that is sometimes suggested is to simply use `getClass()` instead of the `instanceof` checks. This has the effect of only allowing equivalence if the implementing classes are of the same type. This however does violate the Liskov Substitution Principle and breaks some concepts of object-oriented design. The Liskov Substitution Principle simply states that an object of a subtype type should be able to replace any existence of one of it's parent's types. The method that _Effective Java_ pitches is to favor composition over inheritance which is a tip later in the book. The high level synopsis of this technique is, instead of inheriting the type, you simple hold an instance of that type allowing better control of how the different pieces of data can be used and then we don't get into trouble with the Liskov substitution principle.

_Consistency_: This bring us to consistency. This one basically comes down to not relying on unreliable resources. So don't use random number generators as part of your equality check. 

_Non-nullality_: This last one is pretty easy. If someone passes in `null` to an `equals` function, just return `false` and don't throw a `NullPointerException`.

Finally let's go over some steps for a high quality `equals` implementation according to Effective Java.

* Use the `==` operator to check if the objects are the same reference. This is a nice performance optimization.
* Use the `instanceof` operator to make sure you were given an object of the correct type and also to handle the `Non-nullality` requirement.
* Cast your object to the correct type.
* For each "significant" field of the class check the equality. For primitive outside of `float` and `Double` (which you should use `Float.compare` and `Double.compare()` respectively) check equality with `==`. For reference types use recursive `equals()` calls. To avoid NullPointerExceptions consider using `Objects.equals` to make these comparisons. Other things to think about are if you can compare cheaper fields before the more expensive fields. 
* Always override `hashCode` if you override `equals`.
* Don't try to be too clever
* Make sure you are meeting the override correctly. It's `public boolean equals(Object o)` not `public boolean equals(MyType o)`. This is one of the reason using the `@Override` annotation is useful. 

Wow that was a lot more work than you may have initially considered, it definitely was for me. So is it worth it? Well once you violate the `equals` contract there is no knowing how other objects will act when dealing with objects of your class. This is especially visible when using your class within collections. 

So is there an easy button? There kind of is. As has been talked about before, Lombok is a great tool for Java development and getting rid of boilerplate. Lombok has a great annotation `@EqualsAndHashCode`. I would highly suggest using it rather than writing it yourself. IDEs also often have tools built in that help generate these methods. All this auto-generation is great but I do still think it's important to know what makes a good equals function, plus it helps you become a better developer and understand more fully how the magic gets made.

So what are your experiences with the `equals` method? Any horror stories? Any weird bugs? Let us know in the comments. 