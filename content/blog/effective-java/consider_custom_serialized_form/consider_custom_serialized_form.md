---
title: Effective Java! Consider Using a Custom Serialized Form
description: A dive into chapter 87 of Effective Java
date: 2022-01-21
hero_image: ./custom-serial-form.jpg
tags:
  - java
  - effective java review
  - design
  - architecture
---

As discussed in our previous post, the serialized form of an object is part of its API. This means that it is something that we should respect for some time going forward and that if we break it, we will be causing an unnecessary burden to the users of our code. This being the case, we should take great care in determining what structure the serialized version of our classes take. That is what this post focuses on. 

A particular object can be thought of in two different ways, that of its _physical_ representation and that of its _logical_ representation. The physical representation of an object is that of the members and pieces of its internal structure, this is what acts as the state of a particular object. The logical representation of an object serves as a representation of an object conceptually, as a human would think of it. Rather than focussing on the nuts and bolts of how it is put together, it is focussed on the meaningful components. This may not make total sense right now but with a few examples, I think it can be a beneficial model to use. 

The default serialized form of an object, that is the serialized version of a regular object used within the program and not the serialized version of an object specifically created for serialization, is likely an appropriate serialization to use if the physical and logical representation of an object is identical. For example, the following class's physical and logical representation are the same:

```java
public class Name implements Serializable {
  /**
  * Family Name. Must be non-null.
  * @serial 
  */
  private final String familyName;

  /**
  * Given Name. Must be non-null.
  * @serial 
  */
  private final String givenName;

  /**
  * Middle Name. May be null.
  * @serial 
  */
  private final String middleName;

  // rest omitted.
}
```

Logically speaking a name is made up of these components and since the object physically represents them the same way this class could be serialized as-is. You will notice that even though the above members are `private` they still include a JavaDoc comment. This is because they are part of the serialized form of the class and therefore are part of the API. We put the `@serial` tag to tell JavaDoc to include this on the special page of the documentation for serialization.

Even when the default serialized form is appropriate for a particular class we still may need to implement the `readObject` method to protect invariants like the non-nullability of `firstName` and `lastName` above. This will be discussed further in future posts. 

Now let's look at a class where the logical and the physical representations do not match. This class serves as a container for `String` objects (let's ignore that using a collection of type `String` would be far superior to this for a moment)

```java
public final class StringList implements Serializable {
  private int size = 0;
  private Entry head = null;

  private static class Entry implements Serializable {
    String data;
    Entry next;
    Entry previous;
  }

  // Remainder omitted.
}
```

From the logical side, this class represents a collection of strings. From the physical side, this class is a doubly-linked list of entries. These two don't match. Since the default serialized form mirrors the physical form of an object it will end up representing each item individually and all connections both backward and forwards. 

Using the default serialized form when the physical and logical representation of an object don't match can lead to a couple of issues:

* _It ties your class's exported API to the current implementation of the class._ This greatly reduces the extensibility of your class. 
* _It consumes unnecessary space in its serialized form._ In our above example, this would be the unnecessary links between each entry.
* _It consumes unnecessary time when serializing and deserializing._ 
* _It can cause stack overflows._ Because of the recursive traversal of the objects in the graph when serializing this can lead to stack overflows. Serializing our above `StringList` having an instance with between 1,000 and 1,800 elements led to a `StackOverflowException`. The size wasn't even consistent when the error was thrown due to internal differences in the runtime executions. 

Let's consider a reasonable serialized form for our `StringList` example. All we need is maybe an integer detailing the size of the list and then the entries themselves. This would much closer match our logical model of what this class does. Here is what that may look like now with `readObject` and `writeObject` implemented to create our custom serialized form. 

```java
public final class StringList implements Serializable {
  private transient int size = 0;
  private transient Entry head = null;

  // No longer serializable.
  private static class Entry {
    String data;
    Entry next;
    Entry previous;
  }

  public void add(String newString) {
    // Omitted.
  }

  /**
  * Serialize this {@code StringList} instance.
  * 
  * @serailData The size of the list is emitted ({@code int}), followed by all of its elements (each is a {@code String}).
  private void writeObject(ObjectOutputStream outputStream) throws IOException {
    outputStream.defaultWriteObject();
    outputStream.writeInt(size);
  
    for (Entry entry = head; entry != null; entry = entry.next) {
      outputStream.writeObject(e.data);
    }
  }

  private void readObject(ObjectInputStream inputStream) throws IOException, ClassNotFoundException {
    inputStream.defaultReadObject();
    int numElements = inputStream.readInt();

    for (int i=0; i < numElements; i++) {
      add((String) inputStream.readObject());
    }
  }

  // Remainder omitted.
}
```

This is undoubtedly more code, but it is worth the cost. The first thing that both `readObject` and `writeObject` do is invoke their `defaultRead/WriteObject` method. Even though all the fields of this class are marked `transient` we still need to invoke these. This will allow adding non-transient fields in a future release and still maintain backward compatibility. If an object is serialized in a new version with non-transient field and then deserialized in an older version where they weren't there they would simply be ignored. If we didn't take this step the serialization would fail with `StreamCorrupttedException`.

Again we see JavaDoc on a private method detailing how the serialization form of this object will take form. The `@serialData` tag marks this as something that should show up on the page for serialization of the documentation. 

Let's consider the performance difference between this new custom serialized form and the old default form. Considering `StringList` instances with an average `String` length of 10 characters the new form takes half as much space when serialized. It is also twice as fast in the tests of it. Finally, there are no longer stack overflows no matter the size of the list.

Even though our `StringList` example is bad it at least is mostly usable with its default serialization. That is not always the case. Consider the case of a hash table. Its physical representation is a sequence of hash buckets containing key-value pairs. The bucket a particular item falls in is a function of its hash. This hash is not, in general, guaranteed to be the same from implementation to implementation. Therefore, not only is it less than ideal, it could be broken by simply serializing and then deserializing an object of that class.

No matter what form you take for your serialized data every field of an object not marked `transient` will be serialized when the `defaultWriteObject` method is invoked. This means that every field that can be marked `transient` should be. This includes derived fields, generated fields, cache value fields, or fields pointing to something specific to that one run (for example a native filehandle). Before a field should be marked as non-transient you should be able to convince yourself it is part of the logical model of the class. Do note that fields marked as `transient` will be initialized to their default value when the class is created via deserialization. 

Another thing to keep in mind is that if you are creating a thread-safe class you should also synchronize the `writeObject` method, even if you aren't using a custom serialized form. This can look something like the following:

```java
private synchronized void writeObject(ObjectOutputStream outputStream) throws IOException {
  outputStream.defaultWriteObject();
}
```

In addition, no matter what form our class takes we should also explicitly set the serial version UID for serializable classes we write. This helps prevent the serial version UID from becoming an invalid source of incompatibility. It has the bonus of providing a small performance benefit as it avoids the process that must happen at runtime where the UID would need to get generated if it wasn't provided.  It doesn't matter what value we set this variable to, just pick any random `long` value. Then when you modify your class in such a way it is no longer compatible simply increment the value. 

In summary, when using Java's built-in serialization consider whether the default serialized form of a class is appropriate. You can determine if it is appropriate by determining if its logical and physical representations are the same. Serialized forms of your class are every bit as much a part of your class's public API as its methods and thus should be given just as much consideration and planning. 
