---
title: Effective Java! Prefer Alternatives To Java Serialization
description: A dive into chapter 85 of Effective Java
date: 2022-01-04
tags:
  - java
  - effective java review
  - design
  - architecture
---

Java's built-in serialization has been part of the language since 1997, just two years after its inception. Even from the beginning of its life as part of the language it has been known to be risky. While the goal was well-intended, that of distributing objects with little effort, in hindsight it is largely agreed that it was not worth the costs in correctness, performance, security, and maintenance.

There are countless examples throughout the history of the Java language where Java's built-in serialization has caused issues. One such example was a ransomware attack on the San Francisco Metropolitan Transit Agency Municipal Railway that shut down the entire fare collection system for two days in 2016. 

A core problem with Java serialization is that it aims to be so broad that it makes the attack surface extremely large. Object graphs are deserialized by the `readObject` method on the `ObjectInputStream` class. This effectively serves as a magic constructor that can instantiate an object of basically any type as long as it implements the `Serializable` interface.

There are basically no classes that aren't part of the serialization attack surface. JVM classes, third-party classes, and the classes from the application itself are all possible targets. Even if your code doesn't use Java serialization explicitly it may still be using serialization under the hood. This is because there are major parts of the Java platform such as RMI (Remote Method Invocation), JMX (Java Management Extension), and JMS (Java Messaging System) that are built on top of the serialization that Java offers. Deserialization of untrusted sources via these systems can lead to remote code execution, denial-of-service attacks, and other issues. 

Attackers and security researchers alike are always in search of new classes that they can exploit via serialization. Many times it is via the chaining of these exploits that the actual exploit is performed. That is exactly what happened with the railway system mentioned above. 

Even without these chains of exploits we can run into serialization issues with even basic looking code. Attackers will often look for ways they can provide a small amount of code and get a disporportiate amount of computation performed in search of a denial-of-service attack. This is often refered to as a _deserialization bomb_.  Let us look at one example:

```java
static byte[] bomb() {
  Set<Object> root = new HashSet<>();
  Set<Object> s1 = root;
  Set<Object> s2 = new HashSet<>();
  for (int i=0; i<100; i++) {
    Set<Object> t1 = new HashSet<>();
    Set<Object> t2 = new HashSet<>();
    t1.add("foo");
    s1.add(t1);
    s1.add(t2);
    s2.add(t1);
    s2.add(t2);
    s1 = t1;
    s2 = t2;
  }

  return serialize(root);
}
```

This code creates an object graph of 201 `HashSet` instances each with 3 or fewer object references. The whole graph only takes up 5,744 bytes but is impossible to deserialize. This is because deserializing a `HashSet` requires computing the hash codes of all of its elements. The two elements of the root `HashSet` themselves have two more hash sets all the way down the 100 levels. This causes the `hashCode` function to be called 2^100 times. The extra frustrating part of this is that, other than the code not completing, there is no indication of a problem.

So I think we have sufficiently demonstrated that Java's built-in serialization has many pitfalls. What are we to do?  The best way to solve this problem is to avoid it entirely. There is no good reason to use Java serialization in any new code you write today. Instead, you should use some other form of data transfer. These systems have the bonus of being cross-platform. These representations have the benefit of being much simpler and having a much smaller scope than Java serialization. This allows it to be much safer as they are usually focused solely on data. Some examples of these formats are JSON, Protocol Buffers (Protobuf), and Avro. While Protocol Buffers and Avro also can facilitate schema verification as well as have extensions for remote procedure call systems (RPC) they are still much simpler than Java serialization is when it comes to simply transfering state. 

If you however are working on a legacy system that is already using serialization there are still some things you can do to mitigate your risks. First would be to only deserialize trusted data. The official secure coding guidelines for Java say "Deserialization of untrusted data is inherently dangerous and should be avoided" in large, bold, red letters. This is the only guideline given such extreme focus thus we shouldn't ignore it. Another tool you can use is the `java.io.ObjectInputFilter` class added in Java 9 (and also backported). This allows more control over what types of objects can and can't be deserialized in our system. You can choose to accept only certain types (an allowed list) or not accept certain types (a disallow list). If at all possible you should use a allow list as this gives the most control over what is accepted. A disallow list, while still useful, only can protect you from known issues, not the new ones just being discovered.

There is still a lot of Java code that uses serialization in use today. That being the case we should understand the complexities and issues it can introduce. We should also use whatever tools we have available to limit our exposure to these issues and the blast radius that they have. In general, if you can avoid Java serialization, avoid it. In new systems don't introduce Java serialization at all. Use modern data interchange formats instead to transfer data across systems. 