---
title: Effective Java! Avoid Excessive Synchronization
description: A dive into chapter 79 of Effective Java
date: 2021-11-07
hero_image: https://miro.medium.com/v2/resize:fit:720/0*f7PBmo0Ey1vWCTuW
tags:
  - java
  - effective java review
  - design
  - architecture
---

Whereas the last item discussed in _Effective Java_ covered the cases where we need to use synchronization, this chapter covers the concern with excessive synchronization. Whereas the lack of synchronization can lead to liveness issues and safety issues, excessive synchronization can lead to reduced performance, deadlock, and nondeterminism. 

An important rule to follow is to always keep control over your `synchronized` blocks. What this means is to not cede control to external code while within a `synchronized` block. This passing of control can come from calling methods that are meant for overriding or calling a function provided by the client. The reason is that we do not have control of what is happening during these blocks and there could be things that could lead to severe issues with our programs.

Let's consider an example of a `Set` that provides a notification to a client when items are added to the `Set`. This is a simplified, incomplete implementation but it is full-featured enough to be instructive.

```java
public class Observable<E> extends ForwardingSet<E> {
  public ObservableSet(Set<E> set) {
    super(set);
  }

  private final List<SetObservable<E>> observers = new ArrayList<>();

  public void addObserver(SetObserver<E> observer) {
    synchronized(observers) {
      observers.add(observer);
    }
  }

  public boolean removeObserver(SetObserver<E> observer) {
    synchronized(observers) {
      return observers.remove(observer);
    }
  }

  private void notifyElementAdded(E element) {
    synchronized(observers) {
      for (SetObserver<E> observer : observers) {
        observer.added(this, element);
      }
    }
  }

  @Override 
  public boolean add(E element) {
    boolean added = super.add(element);
    if (added) {
      notifyElementAdded(element);
    }
    return added;
  }

  @Override 
  public boolean addAll(Collection<? extends E> c) {
    boolean result = false;
    for (E element : c) {
      result |= add(element);
    }
    return result;
  }
}
```

It's not a super small amount of code but the concept of the class being that a client can subscribe to changes to the set by providing an observer. Let's take a quick look at the `SetObserver` interface.

```java
@FunctionalInterface
public interface SetObserver<E> {
  void added(ObservableSet<E> set, E element);
}
```

By providing something like:

```java
set.addObserver((s, e) -> System.out.println(e));
```

we can output all elements added to a set. This works fine. Let's look at something a little more advanced. Let's look at an attempt to have an observer that outputs each element and then removes itself as an observer. 

```java
set.addObserver(new SetObserver<>() {
  public void added(ObservableSet<Integer> s, Integer e) {
    System.out.println(e);
    if (e == 23) {
      s.removeObserver(this);
    }
  }
});
```

Imagine adding elements 1 to 100 to this set. We would probably imagine it would output 1 - 23 and then remove itself as an observer. What actually happens is we have 1 - 23 output and then a `ConcurrentModificationException` is thrown. The reason this happens is that our `Set` code is looping over the observers at this point and then we request that the observer get pulled out. Even though the `synchronized` block protects the observers collection from being changed it doesn't prevent it from being looped over. 

Let's look at a different application that illustrates a different issue you may run into. Let's take an example where, for whatever reason, the observer decides to use a background thread to attempt to remove itself from the observer list, maybe incorrectly thinking it may help to try to get around the `ConcurrentModificationException` issue.

```java
set.addObserver(new SetObserver<>() {
  public void added(ObservableSet<Integer> s, Integer e) {
    System.out.println(e);
    if (e == 23) {
      ExecutorService executor = Executors.newSingleThreadExecutor();
      try {
        executor.submit(() -> s.removeObserver(this)).get();
      } catch (Exception e) {
        throw new AssertionError(e);
      } finally {
        executor.shutdown();
      }
    }
  }
});
```
This program is overly complex for what it is attempting to do and needlessly uses threading. So what might happen in the case of this program? When we attempt to run this program we end up in a deadlock. This is because when the background thread calls `removeObserver` it waits at the `synchronized` block for its turn to execute while the `synchronized` block is being held waiting for the `added` method above to finish. While this example is a made-up instance of this issue these things can happen in production code if you are not careful.

One interesting thing to take a quick look at is why was the first example allowed through the `synchronized` block while the second one waited at the `synchronized` block? The reason for this is is that `synchronized` locks are _reentrant_. This means that if a particular thread obtains the lock it is allowed to enter any other critical section protected by the same lock. Reentrant locks make multithreaded programming simpler but can lead to liveness and safety issues.

So what is the alternative to ceding control of program execution while in a `synchronized` block? Simply put, minimize your synchronized sections. This will have benefits not only in safety but in performance as well. So let's take a look at our function with a minimized critical section.

```java
private void notifyElementAdded(E element) {
  List<SetObserver<E>> snapshot = null;
  synchronized(observers) {
    snapshot = new ArrayList<>(observers);
  }
  for (SetObserver<E> observer : snapshot) {
    observer.added(this, element);
  }
}
```

What this code does is make a copy of our observer list and then operate on that snapshot. That keeps the synchronized block extremely short, doesn't pass control of execution to external methods in the synchronized block, and leads to a much safer program.

There is an even easier way to fix this. Certain datatypes are specifically designed to be used in concurrent scenarios. One of these collections is the `CopyOnWriteArrayList`. This `List` implementation is exactly what it says it will be. On each write, this implementation makes a complete copy of its contents. Because the internal data is never modified it is safe to use in a multi-threaded environment. The trade-off this makes is writes are expensive while reads and iterations are extremely fast with no synchronization. In the wrong circumstances this would be a horrible choice, but in other cases, like our observers case, this can be a great choice because we write very few times and are constantly iterating over the contents and reading. Let's look at what our class would look like with this change.

```java
private final List<SetObserver<E>> observers = new CopyOnWriteArrayList<>();

public void addObserver(SetObserver<E> observer) {
  observers.add(observer);
}

public boolean removeObserver(SetObserver<E> observer) {
  observers.remove(observer);
}

private void notifyElementAdded(E element) {
  for (SetObserver<E> observer : observers) {
    observer.added(this, element);
  }
}
```

This code is much easier to reason about and much simpler while still being thread-safe.

The final topic of discussion related to this topic is the decision we are presented with when building a mutable class. The two choices we have when it comes to thread safety are to require synchronization to be provided outside of the class or to add thread-safety internally to the class. Internal synchronization should only be used if you can achieve much higher concurrency by doing it. Nothing comes without a cost. Many early Java core classes errored on the side of internal synchronization and thus pay a synchronization cost even when used in a single-threaded use case. To get around this many modern alternatives have been built to replace the original thread-safe implementations. Examples of this are `StringBuilder` in place of `StringBuffer`, `HashMap` instead of `Hashtable`, and `ThreadLocalRandom` instead of `Random`. When in doubt follow the guidance these more recent classes suggest, do not synchronize within your class and document your class as not being thread-safe.

If your class does make sense to synchronize then you will be journeying down a more complicated road. Writing performant and safe thread-safe code can be difficult. The patterns and practices to facilitate it are beyond the scope of this blog post but there are many great resources out there to learn from.

Putting it all together, do not call provided functions from within a critical section. By doing so you are opening your code up to deadlocks and data corruption. Keep your critical sections small. Using thread-safe data types can be a useful method of adding thread safety to your code. When building a class with mutability consider if it should provide synchronization. 