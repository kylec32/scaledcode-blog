---
title: Effective Java! Prefer Annotations to Naming Patterns
description: A dive into chapter 39 of Effective Java
date: 2020-08-25
tags:
  - java
  - effective java review
  - design
  - architecture
---

Historically library creators would use specific naming paterns to signify where functionality should be extended and as a signal for how we would like the library to interact with our code. A great example of this is prior to JUnit 4 in order to signify that a particular method was a test method; it would be prefixed by the word `test`. This method was not without its issues. For example a spelling mistake could lead to silent failures. If you named your method `tsetSuperImportantStuff` JUnit wouldn't throw any errors and happily just ignore your test. If you weren't paying close attention you wouldn't notice either. With this system there is no way to indicate where a particular naming pattern is valid. For example if a user thought if they called their class `TestAllTheThings` it would pick up the whole class there is no way for the library to indicate to the user that this is not how to use this pattern. The final issue we are going to highlight is that there is no simple way to pass parameters to the consumer of the pattern. Imagine trying to pass an expected exception type? Something like `testRunTimeExceptionThrownIsUsefulTest`. Parsing out the exception type would be extremely error prone and leads to tests with not ideal names. 

So what is the alternative? Annotations, that is what we can replace these patterns with. JUnit also decided to do this with the release of version 4. Let's pretend we are making the simplest test runner possible. We would want to start with something to signify what methods should be tested.

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Test {
}
```
We use the `@interface` keyword to signify that we are creating an annotation. Then we annotate our annotation with _meta-annotations_. The first of these `@Retention(RetentionPolicy.RUNTIME)` signifies that this annotation should be readable at runtime. If we didn't add this annotation the annotation would disappear before we could read it at runtime. The second annotation `@Target(ElementType.METHOD)` tells the annotation that it can only be put on a method, not a class or member variable. Let's see what this would look like in practice. 

```java
public class Sample {
  @Test
  public static void m1() { }

  public static void m2() { }

  @Test
  public static void m3() {
    throw new RuntimeException("boom");
  }

  @Test
  public void m4() {
    // invalid usage, not static
  }
}
```

Now let's look at an example of how to process this annotation. 

```java
public class RunTests {
  public static void main(String[] args) throws Exception {
    int tests = 0;
    int passed = 0;
    Class<?> testClass = Class.forName(args[0]);
    for (Method m : testClass.getDeclaredMethods()) {
      if (m.isAnnotationPresent(Test.class)) {
        tests++;
        try {
          m.invoke(null);
          passed++;
        } catch (InvocationTargetException wrappedException) {
          Throwable exception = wrappedException.getCause();
          System.out.println(m + " failed: " + exception);
        } catch (Exception exec) {
          System.out.println("Invalid @Test: " + m);
        }
      }
    }
  }
}
```
Not super straightforward code but high level this code takes in a fully-qualified class path to the test class. It then iterates over the methods of the class and checks which ones have the `@Test` annotation. It then invokes that method and sees if an exception is thrown. If not it iterates the passed count, if so it prints out the cause of the exception. If there is an issue with invoking the test method that is also logged out.

Now let's consider that we want to be able to create a test that has an expected exception. We will want a new annotation to drive this. 

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
  Class<? extends Throwable> value();
}
```
This is very similar to our previous `@Test` annotation but it adds the ability to pass a parameter. In this case the parameter takes a class of a class that extends from `Throwable`. Let's look at an example of it's usage.

```java
@ExceptionTest(ArithmeticException.class)
public static void m1() {
  int i = 1 / 0;
}
```

Now let's look at how we can use this. 

```java
if (m.isAnnotationPresent(ExceptionTest.class)) {
  tests++;
  try {
    m.invoke(null);
    System.out.printf("Test %s failed: no exception%n", m);
  } catch (InvocationTargetException wrappedException) {
    Throwable exception = wrappedException.getCause();
    Class<? extends Throwable> exceptionType = m.getAnnotation(ExceptionTest.class).value();
    if(exceptionType.isInstance(exception)) {
      passed++;
    } else {
      System.out.printf("Test %s failed: expected %s, got %s%n", m, exceptionType.getName, exception);
    }
  } catch (Exception exec) {
    System.out.println("Invalid @Test: " + m);
  }
}
```

This code is very similar to our `@Test` code runner with just some light changes to the logic to behave correctly. We do see the use of `getAnnotation` which allows us to grab the annotation and retrieve the value from it. Let's say we wanted to take this code to the next level and allow any of multiple exception types to be thrown. Our annotation would only require a slight change.
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTest {
  Class<? extends Throwable>[] value();
}
```
Really all we did was add the `[]` to signify that the parameter type is an array. The cool thing about this is that all our existing code would continue to work with this change. This is because Java will create a one element array if we just pass in a value directly like we do above. If we want to pass multiple values into a parameter that takes an array we can do so by putting them inside of `{ }`. Let's look at what our above example would look like:
```java
@ExceptionTest({ArithmeticException.class, NullPointerException.class})
public static void m1() {
  int i = 1 / 0;
}
```
We can also update our processing code to handle the updates pretty simply as well. Basically, inside the catch that we wrote above we would replace it's contents with:
```java
Throwable exception = wrappedException.getCause();
int oldPassed = passed;
Class<? extends Exception>[] exceptionTypes = m.getAnnotation(ExceptionTest.class).value();
for (Class<? extends Exception> exceptionType : exceptionTypes) {
  if (exceptionType.isInstance(exception) {
    passed++;
    break;
  }
}
if (passed == oldPassed) {
  System.out.println("Test %s failed: %s %n", m, exception);
}
```
This works pretty well. However, in Java 8 another option was introduced to allow the ability of multiple values for a particular annotation. Instead of having the annotation take an array. We can put the annotation on the method multiple times. This is only possible with annotations annotated with the `@Repeatable` annotation that points to a container annotation type that simply holds a collection of those annotations. Let's look at this in practice.
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@Repeatable(ExceptionTestContainer.class)
public @interface ExceptionTest {
  Class<? extends Throwable> value();
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface ExceptionTestContainer{
  ExceptionTest[] value();
}
```
And our multiple exception example would change to look like the following:
```java
@ExceptionTest(ArithmeticException.class)
@ExceptionTest(NullPointerException.class)
public static void m1() {
  int i = 1 / 0;
}
```
As you can see the user of the repeated annotation type does not see the container annotation type, that is simply for use by the processing code.  The tricky part of using repeated annotations is that the code that queries the state of the annotations doesn't always respond how you would expect. The `isAnnotationPresent` function will respond with `true` when checking against the collection annotation type when the contained repeatable annotation is used multiple times, however if it is not, it will respond with `false` and will only return `true` if you check against the contained type. Because of this we need to check for both the collection type as well as the single, contained annotation. The relevant part of our processing code would look something like:
```java
if (m.isAnnotationPresent(ExceptionTest.class) || m.isAnnotationPresent(ExceptionTestContainer.class)) {
  tests++;
  try {
    m.invoke(null);
    System.out.println("Test %s failed: no exception%n", m);
  } catch (Throwable wrappedException) {
    Throwable exception = wrappedException.getCause();
    int oldPassed = passed;
    ExceptionTest[] exceptionTests = m.getAnnotationByType(ExceptionTest.class);
    for (ExceptionTest exceptionTest : exceptionTests) {
      if (exceptionTest.value().isInstance(exception)) {
        passed++;
        break;
      }
    }
    if (passed == oldPassed) {
      System.out.println("Test %s failed: %s %n", m, exception);
    }
  }
}
```

Repeatable annotations can add a level of readability to your code but can complicate the annotation processing code you need to write. It's up to you to know which tradeoff is worth it. 

The testing framework we have started to write in this code is very much a toy but it does demonstrate some of the benefits of using annotations vs naming patterns. Anyone that has developed with me knows that I do love to use annotations. I find them powerful and a great way to add behavior and mark classes and methods. You may not find yourself writing a lot of annotations in your code but even if you don't, understanding how they work can help you when you use them in your own code. 