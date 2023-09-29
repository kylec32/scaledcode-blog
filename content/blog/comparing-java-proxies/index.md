---json
{
  "title": "Comparing Different Ways to Build Proxies In Java",
  "description": "Comparing performance of various actions using inheritance, ByteBudy, and cglib in Java to create a proxy object.",
  "date": "2022-12-13",
  "hero_image": "./proxies_hero.jpg",
  "tags": [
    "java",
    "design patterns",
    "proxy pattern",
    "performance"
  ]
}
---

One of the commonly used techniques used by popular Java frameworks and libraries is object proxies. Even though it is a popular pattern used in many of the libraries that developers use daily, many developers have never directly built a Java proxy in their own code. While the use case may not come up commonly in everyday code, its usage makes sense in some cases and understanding how the dependencies of our code generally accomplish their tasks is always worth your time.

### What is a proxy?

In this context, a proxy is an object that has access to intercept calls into a particular class. I like to think of it as a layer around an existing object. This doesn't mean that every method or interaction with a proxy will be intercepted but it has the ability. The original method may still be invoked when the proxy is called, the original code may be entirely ignored, or a combination of both.

### Why might I want to use a proxy?

Given the above definition, some use cases may have already come to mind. Maybe you want to surround methods with logging or performance monitoring code. Alternatively, you may desire to implement transactional controls and commit a transaction if a method successfully executes or roll back a transaction if an exception is thrown (this use case may sound familiar if you have ever used the `@Transactional` annotation in the Spring framework). Maybe you want to modify a particular method in a class that doesn't support inheritance. The sky is the limit when it comes to use cases for proxies.

### Ways to accomplish proxying

Depending on what you are wanting to do with your proxy you will have different methods available. This could depend on if you own the code that you would like to wrap, whether it is concrete class or interface that you are creating. Whether there are other capabilities and on-the-fly generation you need to accomplish as well. That is just to name a few.

### Comparing methods

For this post I chose to compare the following:

* Inheritance (least powerful but is simple and can accomplish some of the benefits of proxying)
* One-for-one method delegation. (For each method of the wrapped class, we write an identical method in the proxy and pass the call along (Unless we want to change how it works))
* [Dynamic Proxy](https://www.baeldung.com/java-dynamic-proxies) (built into the JDK)
* ByteBuddy - A code generation and modification library used by Mockito, Jackson, Hibernate, etc.
* [cglib](https://github.com/cglib/cglib) - A now unmaintained code generation library. (Unusable in Java 17) (Used by Spring framework ([which they maintain themselves](https://github.com/spring-projects/spring-framework/tree/main/spring-core/src/main/java/org/springframework/cglib)))

Some of these methods have more capabilities than others but for this test, we focused on a few simple capabilities.

* Running code before and after the wrapped code.
* Replacing part of the implementation of a wrapped method
* Replacing the whole functionality of a method.

In addition to this, I performed the following tests

* The performance of creating an instance of the proxy object.
* Calls to a method in the proxy that isn't edited by the proxy to compare the impact of the proxy even when it isn't doing anything.

Let's dig into each test.

*Proxy Creation*

<div align="center">

| Benchmark                             | Score       | Error      | Units |
|---------------------------------------|-------------|------------|-------|
| InitializationSpeed.byteBuddy         | 0.281       | ±0.003     | ops/ms |
| InitializationSpeed.cglib             | 7158.735    | ±14.760    | ops/ms |
| InitializationSpeed.dynamicProxy      | 54906.036   | ±137.333   | ops/ms |
| InitializationSpeed.inheritanceProxy  | 201756.605  | ±6483.339  | ops/ms |
| InitializationSpeed.oneForOne         | 141938.219  | ±405.756   | ops/ms |

</div>

The creation speed of these different proxy options has quite a large gap. Creating a class with inheritance is the fastest with creating a class that leverages composition over inheritance operating on the same order of magnitude. Dynamic proxies come in the middle of the pack as the fastest, truly dynamic method. The surprising result to me is the ByteBuddy result. Maybe it is an issue with how it is coded but it is drastically slower than the other methods. Of note, ByteBuddy is writing a whole new class and adding it to the class loader which isn't exactly a lightweight process (although cglib does a similar process without the performance issue).

*Calling unrelated methods*

<div align="center">

| Benchmark                             | Score       | Error      | Units |
|---------------------------------------|-------------|------------|-------|
| UnrelatedMethodTest.byteBuddy         | 2857.037    | ±10.480    | ops/ms |
| UnrelatedMethodTest.cglib             | 2236.596    | ±31.475    | ops/ms |
| UnrelatedMethodTest.dynamicProxy      | 2167.294    | ±10.853    | ops/ms |
| UnrelatedMethodTest.inheritanceProxy  | 2833.592    | ±5.717     | ops/ms |
| UnrelatedMethodTest.oneForOne         | 3245.791    | ±10.827    | ops/ms |

</div>

In this test, a method is called on the proxy that doesn't have any special handling. This time all of our methods are on the same order of magnitude. Our non-inherited class is the fastest which is unsurprising. Another interesting data point is that ByteBuddy comes out slightly ahead of the inheritance method I can only guess because it is a "true class" not one that requires [dynamic dispatch](https://en.wikipedia.org/wiki/Dynamic_dispatch).

*Calling a method with a wrapped method*

<div align="center">

| Benchmark                             | Score       | Error      | Units |
|---------------------------------------|-------------|------------|-------|
| SurroundingCallsTest.byteBuddy         | 3987.467    | ±7.130    | ops/ms |
| SurroundingCallsTest.cglib             | 3567.403    | ±15.483    | ops/ms |
| SurroundingCallsTest.dynamicProxy      | 3760.674    | ±31.131    | ops/ms |
| SurroundingCallsTest.inheritanceProxy  | 4028.737    | ±15.962     | ops/ms |
| SurroundingCallsTest.oneForOne         | 4013.130    | ±18.312    | ops/ms |

</div>

Now with wrapped methods again we see all methods on the same order of magnitude of performance. Our more "classic" methods do edge out on performance and ByteBuddy again comes in third which seems to be a common story.

*Calling a method with an edited implementation.*

<div align="center">

| Benchmark                             | Score       | Error      | Units |
|---------------------------------------|-------------|------------|-------|
| EditedCallsTest.byteBuddy         | 1166.783    | ±46.693    | ops/ms |
| EditedCallsTest.cglib             | 1114.962    | ±38.014    | ops/ms |
| EditedCallsTest.dynamicProxy      | 1225.499    | ±37.439    | ops/ms |
| EditedCallsTest.inheritanceProxy  | 1299.378    | ±19.568     | ops/ms |
| EditedCallsTest.oneForOne         | 1305.832    | ±4.319    | ops/ms |

</div>

In this test, we replace part of the implementation and then defer the rest to the proxied class implementation. The results largely follow the previous results other than the dynamic proxy does step up its performance here.

<div align="center">

| Benchmark                             | Score       | Error      | Units |
|---------------------------------------|-------------|------------|-------|
| FullReplacement.byteBuddy         | 293955.382    | ±674.993    | ops/ms |
| FullReplacement.cglib             | 64039.112    | ±291.037    | ops/ms |
| FullReplacement.dynamicProxy      | 62943.089    | ±769.907    | ops/ms |
| FullReplacement.inheritanceProxy  | 321920.716    | ±1210.949     | ops/ms |
| FullReplacement.oneForOne         | 347187.859    | ±4885.895    | ops/ms |

</div>

Finally, we have the replacement of the whole implementation of a method with a static value. By itself, the return of a static value is very quick so this test highlights differences in function call time. Unsurprisingly the one-for-one and inheritance methods are the quickest but ByteBuddy is not far behind and has great performance. This really shows the power of ByteBuddy's bytecode generation.

There are many ways to accomplish the task of creating a proxy for an object. Some of the libraries above are overkill for what we are trying to accomplish but it is interesting to consider them. I honestly expected there to be greater differences between the options. I suspected that the creation of the proxy would be faster with the Dynamic proxy but it would be slower when executing. I suspected that the reflection required with Dynamic proxy would greatly negatively affect its execution time. This just goes to show that testing performance is the only true way to be sure of what solution is most performant.

Diving into these libraries and patterns there is still much to learn but this quick intro into the performance (and lack thereof) of different proxy implementations can hopefully help you in the future. Also knowing what tools there are that can be leveraged to solve a particular issue is helpful as well.

The code for the tests performed can be found here:

[https://github.com/kylec32/javaproxytests](https://github.com/kylec32/javaproxytests)

