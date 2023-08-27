---
title: Effective Java! Don't Leak Object References!
description: A dive into chapter seven of Effective Java
date: 2019-10-29
tags:
  - java
  - effective java review
  - design
  - architecture
---


Today our topic is about memory leaks inside of Java. Wait!? Memory leaks in Java? That's not possible right? Isn't that one of the promises of Java, to have managed memory? When I started learning to code I started with C++ like man people. Let me tell you something, if you don't manage your memory well in C++ you will likely blow your foot off. But anyway we were talking about memory leaks in Java. I think the best way to show this is with an example and I think the example from the book is a great example of it:

```java
public class Stack {
  private Object[] elements;
  private int size = 0;
  private static final int DEFAULT_INITIAL_SIZE = 16;

  public Stack() {
    elements = new Object[DEFAULT_INITIAL_SIZE];
  }

  public void push(Object element) {
    ensureCapacity();
    elements[size++] = element;
  }

  public Object pop() {
    if (size == 0) {
      throw new EmptyStackException();
    }
    return elements[--size];
  }

  private void ensureCapacity() {
    if(elements.length = size) {
       elements = Arrays.copyOf(elements, 2 * size + 1);
    }
  }
}

```

Looks like it would work right? I'll let you in on a secret. This code does actually work fine but it does have a "memory leak". Can you spot it? I for one definitely didn't get it right off the bat. The problem lies in this line here from our `pop` function.:

```java
return elements[--size];
```
So what is wrong with this line? What the code is conceptually doing is returning an object and removing it from the stack. What is actually happening is that the `elements` array still has a reference to the object and won't be able to be garbage collected until that element is overwritten. So if, for example, a bunch of objects were added to the stack and then popped off we would expect the elements to be garbage collected but they will not. 

But is this actually a memory leak? Not in the normal meaning of the word. More correctly they could be titled "obsolete object references." That being said the symptoms and problems it can cause are along the same lines. So how do we fix this issue. Well simply enough we null out the object before returning:

```java
public Object pop() {
  if (size == 0) {
    throw new EmptyStackException();
  }
  Object poppedObject = elements[--size];
  elements[size] = null;
  return poppedObject;
}
```

So am I saying that you should null out all objects after you are done with it? Please no. Having to null out objects is almost always the exception and not the rule. Java is indeed a language with managed memory and it will handle the clean up of our objects as they fall out of scope and lose all references to them. So in what cases do we need to account for the above issue and when do we not? It all comes down to if we are managing our own memory/objects or not. If you manage your memory you need to take it all the way and manage your memory, not just do it halfway. Above we are managing our memory ourselves as we have our array of elements that we are managing as storage.

What are some other places we see this. Caches is another example. We need to be aware of the lifecycle of our data in our caches when we use them as our cache can keep an object from being garbage collected even if nothing else in the system will ever request the object from the cache. One way to account for this is using Java's `WeakReference` class. We do need to be aware that when using this class it is simply a pointer to the object and is counting on an external system having a reference to the object to keep it from being garbage collected while it is still usable. Using WeakReferences and related classes are a more advanced topic and how to intelligently use it is beyond the scope of this blog article. A final location that developers can leave around obsolete objects is when using listeners and other callbacks. I remember this being of particular concern when working with Android in a previous life of mine. This can be accounted for in the same manner as above with the use of `WeakReferences`

The topic of discussion today is a little more niche without a doubt. You will likely not run into this everyday but this is one of the things to keep in mind as we develop our software. Memory leaks are extremely hard to debug and thus we should do all in our power to avoid them. 

