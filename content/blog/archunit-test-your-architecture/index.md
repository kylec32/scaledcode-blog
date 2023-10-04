---json
{
  "title": "ArchUnit: Testing the Design of Your Library",
  "description": "An overview of the ArchUnit library that allows the testing of the design of your Java code.",
  "date": "2023-01-29",
  "hero_image": "./archunit-hero.jpg",
  "tags": [
    "java",
    "Software Architecture",
    "System Design",
    "Archunit"
  ]
}
---

A common issue that is experienced in software development is the disconnect between how the software is described as working and how it works in reality. This often can be caused by a well-meaning developer coming before you and either misunderstanding how the system works and documenting that misunderstanding as truth or documenting the reality at the time but the documentation has fallen out of sync with the system as the software has evolved. Along those same lines, what is defined as the standards in the system can be disconnected from reality. This may happen even without the developer knowing they are disconnecting the code from the standards. Without something confirming and verifying that the code is working and structured the correct way, we can never be sure without extensive work.

Thankfully, to verify that the software solves the business requirements it is supposed we can develop and lean on automated testing. Via a suite of unit, integration, and end-to-end tests we can codify that the software works in a specific way. If the software evolves in a way that it is no longer compatible with the automated tests passing we either have to decide that the requirements have changed (at which point we need to change the test) or that the code has violated a requirement (at which point we need to change the code). This process is well understood in the industry and, although we can always improve in making our automated tests more efficient and effective, it largely does its job well.

The hole that often ends up existing is not in verifying that the business requirements are met but that the internal structure of services or the overall system architecture meets the requirements set forth. How would you write an automated test for a software architecture? At least as far as a specific library is concerned we have the ArchUnit library. This library does exactly what its name suggests. From its website:

> _ArchUnit is a […] library for checking the architecture of your Java code using any plain Java unit test framework._

### What can it do?

This library allows you to verify different characteristics of your application. Do you want to enforce a layered architecture within your application, it can help you do that. Do you want part of your application to be free from external library dependencies, ArchUnit is there for you. Do you want to make sure there are no cyclic dependencies in your code, this is the library for you. All of this is also directly available from within the test framework you likely already use (JUnit4 or JUnit5 out of the box) or without a test framework at all (if you want to use a different framework or no framework at all).

### What it isn't?

What ArchUnit does it does well however it doesn't claim to do everything. This library will only be useful for asserting a Java library's internal structure. It cannot enforce that the interactions between different services are structured correctly, it cannot verify that the infrastructure is deployed correctly, or anything else outside of the Java library. It also isn't a language-agnostic tool. It expects you to be using Java. While there is a port for [.Net/C#](https://archunitnet.readthedocs.io/en/latest/) you won't be able to use this for all code in your business if you aren't a purely Java business. I would love to see this type of library exist in other languages (if it doesn't already exist).

### How does it work?

ArchUnit analyzes all the Java bytecode available to it and builds the necessary trees and structures to mimic your code so that it can understand, and thus analyze, your code interactions. This allows it to generically interact with any library and assert commonly desirable attributes are followed (no cyclic dependencies, layered architecture, etc.) as well as enabling custom rules to be developed if the behaviors that it comes with out of the box don't fulfill your needs. More on this later.

### The structure of an ArchUnit test:

An arch unit test is made up of a few common parts:

* Target the classes you want to analyze. This can be done with something like `new ClassFileImporter().importPackagesOf(TopLevel.class)` if you are working outside of JUnit. Or using the annotation `AnalyzeClasses` such as `@AnalyzeClasses(packages="com.example.application")` if you are working in JUnit. This gathering of classes can and should only happen once per test class as it can be an expensive, time-consuming process.
* Then the actual tests can be performed using the ArchUnit [DSL](https://en.wikipedia.org/wiki/Domain-specific_language).

### Some Examples

There are some general coding rules that many people want to follow and thus ArchUnit ships with common rules that you can use out of the box with minimal configuration.

_Out-of the- box rules_

```java
@AnalyzeClasses(packages = "com.tngtech.archunit.example.layers")
public class CodingRulesTest {

    @ArchTest
    private final ArchRule no_generic_exceptions = NO_CLASSES_SHOULD_THROW_GENERIC_EXCEPTIONS;
}
```

As simple as the above you can make sure that no one throws any generic exception in your code.

```java
@ArchTest
static final ArchRule no_cycles_by_method_calls_between_slices =
       slices().matching("..(simplecycle).(*)..").namingSlices("$2 of $1").should().beFreeOfCycles();
```

In this example, we see the `slice` API. This takes your code and slices it by package so the above is slicing the code by the packages directly below the `simplecycle` package and asserts that there are no cycles. If instead of the `(*)` we had `(**)` it would look at all sub-packages below `simplecycle`.

_Simple Custom Assertion_

```java
@ArchTest
private final ArchRule loggers_should_be_private_static_final =
        fields().that().haveRawType(Logger.class)
                .should().bePrivate()
                .andShould().beStatic()
                .andShould().beFinal()
                .because("we agreed on this convention");
```

Here we have a non-bundled test that shows how we can utilize the ArchUnit DSL to come up with our own custom tests. In the above, we assert that all fields that have a type of `Logger` should be private, static, and final and we can even include a custom reasoning to add additional context such as references to further documentation or whatever would be useful for someone fixing the issue.

_Naming Assertions_

```java
@ArchTest
static final ArchRule interfaces_should_not_have_names_ending_with_the_word_interface =
            noClasses().that().areInterfaces().should().haveNameMatching(".*Interface");
```

This example shows how we can assert not only the structure of the code but the naming of different classes, fields, and functions to make sure they stay in line with the standards of our system.

_Layered Architecture Enforcement_

There are multiple ways to enforce that the proper layers and separation of concerns are maintained in your library with ArchUnit. The first is more manual and you stay in full control as seen here:

```java
@ArchTest
static final ArchRule persistence_should_not_access_services =
       noClasses().that().resideInAPackage("..persistence..")
                .should().accessClassesThat().resideInAPackage("..service..");

@ArchTest
static final ArchRule services_should_only_be_accessed_by_controllers_or_other_services =
       classes().that().resideInAPackage("..service..")
               .should().onlyBeAccessed().byAnyPackage("..controller..", "..service..");
```

This takes both the stance of enforcing that classes in a package only accesses certain other packages as well as taking it in the opposite direction and enforcing that only certain packages can access a given package.

Since a layered architecture is such a common pattern ArchUnit has specially designed code to make this extremely easy to enforce.

```java
@ArchTest
static final ArchRule layer_dependencies_are_respected_with_exception =
       layeredArchitecture().consideringAllDependencies()
       .layer("Controllers").definedBy("com.tngtech.archunit.example.layers.controller..")
       .layer("Services").definedBy("com.tngtech.archunit.example.layers.service..")
       .layer("Persistence").definedBy("com.tngtech.archunit.example.layers.persistence..")
       .whereLayer("Controllers").mayNotBeAccessedByAnyLayer()
       .whereLayer("Services").mayOnlyBeAccessedByLayers("Controllers")
       .whereLayer("Persistence").mayOnlyBeAccessedByLayers("Services")
       .ignoreDependency(SomeMediator.class, ServiceViolatingLayerRules.class);
```

The above method of enforcing a layered architecture is particularly clean and, as can be seen, it still allows for exceptions because sometimes reality isn't so clean.

_Frozen issues_

Speaking of exceptions you may be getting excited about using this tool in your project but realize that there will be nothing but exceptions from pre-existing issues if you used it. This can be accounted for as well. By surrounding your assertion with `freeze(<assertions here>)`. You can have the test not be enforced on existing code but will be enforced on future code. Also, after a solution has been fixed, the exception will be automatically removed for you to prevent a regression from occurring. There is a good amount to know about this feature so you can read more from the [ArchUnit documentation](https://www.archunit.org/userguide/html/000_Index.html#_freezing_arch_rules).

_Plant UML_

Another fascinating functionality is the ability to use a diagram defined in PlantUML to set up the rules of what can (and does) access what. This is a very interesting way of enforcing that the documented/diagramed structure of your code is always correct and doesn't fall out of sync with the code. I could see many cases where a failure of an ArchUnit test here may not be a mistake in the code but merely a trigger to make sure you update your documentation. Like the freezing capability, there is a lot to know about how to use this and thus check out the documentation for [more details](https://www.archunit.org/userguide/html/000_Index.html#_plantuml_component_diagrams_as_rules).

_Extensibility_

As you can see there is a lot of functionality built into ArchUnit. Even so, you may find yourself running into something that it doesn't do out of the box. The best part of ArchUnit is that it is extremely extensible. They provide all the primitives that they use internally to enforce the architecture. Thus you can figuratively pick up the baton where they left it and build whatever kind of custom logic you want. For example, I was able to build functionality for my organization that enforced that calls to our internal libraries should only be made to methods or classes annotated with a `PublicApi` annotation. Thus signifying that they may be used from outside their owning library. While there is a solid amount of code that provides this functionality it wasn't too big of a deal to write and, after it was written, has been extremely useful in making sure that people were not using functionality that wasn't built for public consumption.

I have only started to scratch the surface of what is possible with ArchUnit. I'm extremely impressed with how well it is built and the extremely pleasant ergonomics of working with the library. It solves its niche of problems extremely well and I believe it is a useful tool to be in the toolbelt of all Java developers, particularly those that work in large teams.

There are many other examples in the official ArchUnit example repo to check out.

[https://github.com/TNG/ArchUnit-Examples](https://github.com/TNG/ArchUnit-Examples)