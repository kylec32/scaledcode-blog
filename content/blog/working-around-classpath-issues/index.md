---json
{
  "title": "Working Around Classpath Issues",
  "description": "Working in a legacy codebase can lead difficulty with conflicts on the classpath. This article details a solution taken to get around this issue.",
  "date": "2018-01-03",
  "tags": [
    "architecture",
    "java"
  ]
}
---

### Legacy Systems

Part of the reason that I believe that side projects are so enjoyable is the ability to open the an editor and start from nothing. There is no baggage, no technical debt, and everything is possible. However, that is not the world that most of us live in. Most developers I would assume at least to some extent supports a legacy system. That may mean that that the system you are supporting is a month old or maybe 40 years old. This is the case with the software we develop at my work. Our product is a monolith ColdFusion application that has supported the company through the last 15+ years. In the last about two years my company has made the decision to move off the dying technology of ColdFusion in favor of Java (one large reason is that ColdFusion runs on the JVM allowing for easier interoperation between the two worlds). There have definitely been some growing pains as we become a Java organization but overall it has been a great experience. As stated the ColdFusion server runs on top of the JVM which has made many things much easier to migrate, we can migrate our code to Java and still allow ColdFusion to make calls into it. The fact that they both run on the JVM also has created some interesting issues, it is about one of those particular issues that this blog post is about. 

### Starting On the Path of Java

One of the first things we needed to do when we started moving to Java was have a way to access the database. Previously we had had some good experiences with ORM and therefore we started testing out different ORM libraries. Unsurprisingly we ended up choosing to use [Hibernate](http://hibernate.org/) as our database access library (we have since started to move to [Spring Data](https://projects.spring.io/spring-data-jpa/) which sits on top of Hibernate). Hibernate is a great library that implements the JPA standard and we were able to write our code in such a way that it almost exclusively depended on [JPA](http://www.oracle.com/technetwork/java/javaee/tech/persistence-jsp-140049.html) and not Hibernate specific interfaces. Testing our first library in isolation everything worked wonderfully so we went excitedly to integrate this new library into our ColdFusion monolith. Restarted the site and were met with.....a big error. On the bright side the error was fairly clear.

### Working Around the Issue

So what had happened? Well the error we were seeing was a ColdFusion error saying that there was an issue pulling a ColdFusion ORM entity from the database. On one of our services we extensively use ColdFusion's flavor of ORM to access the database. But how did Hibernate break ColdFusions ORM? Well it turns out that our ColdFusion engine's ORM is really just a wrapper for Hibernate under the hood. So great! That means it should work even better right? Well not quite. The ColdFusion's version of Hibernate it depended on was version 3.5 (released in 2010) and the version we were using in our Java project was version 5.0 (released in 2015). Unsurprisingly these were not compatible. So what to do? 

### Found Solution

When we first came against this issue we considered a few options. The one that our lead architect came up with that we felt good about was that we had already turned off ColdFusion ORM on the service that we wanted to use Java on so we decided to create a sibling classloader for that service and put all of our hibernate things in it. This worked great and we moved on with life. 

### Results of Solution 1

Well about two years later we looked back and we look at the consequences of our decision. Overall it had worked fairly well. However we did pay a cost. The biggest of this was that if we wanted to reuse a library across multiple services (including ones that used ColdFusion ORM) you had to use JDBC to access the database. This was much less efficient for developer productivity and didn't allow our developers to use some of the tools that help speed up development.

### Problem Revisited

Recently as we were preparing for a feature that is coming up in the next three months and seeing that it would need to span services and need database access and not wanting to have to fall back to JDBC we decided we needed to fix this issue once and for all. So we went back to the whiteboard and started brainstorming solutions, here are some of the ideas we came up with. 
1. Upgrade the ColdFusion's hibernate version to 5. 
2. Use a new classloader that would load Hibernate 5+ utilizing libraries that would segment them from the Hibernate 3 utilizing ColdFusion.
3. Fork Hibernate 5 and change all the packages so that they didn't overwrite Hibernate 3's packages
4. We had coded against JPA, not Hibernate, in our Java code. Utilize this idea and switch to a different JPA provider.
5. And more. 

### Attempt to Solve the Problem

As we talked through the options we decided that we liked option 1 the most so we set out to upgrade our ColdFusion engine (Lucee) to use Hibernate 5. Seeing as it is an open source project and we already had a fork of it with some of our own changes that they wouldn't take upstream. So we set out to update Lucee to use Hibernate 5. Well to make a long story short, a week or two later we still hadn't succeeded. We went from getting compile errors, to Lucee errors, to Hibernate internal API errors. At this point we were so deep in unsupported territory that it was pretty discouraging. We learned about Hibernate deprecating APIs but instead of removing the function from the class they just deleted the content of the function. Very annoying to debug. Then once we started getting exceptions in internal APIs of course there was no documentation to reference and it turns out that that the way Lucee was utilizing Hibernate was a bit of a hack. Eventually we decided to cut our losses and move on. 

### Regrouping and Attacking

A few weeks later we decided to lock ourselves in a room and spend a whole day focussed on this problem and nothing else. This time we decided to split up and have two teams trying to implement two different ways to double our chances of finding a solution. We decided to try option 2 and a version of option 3 from above. Instead of forking Hibernate 5 I had the thought that why not fork hibernate 3.5 that Lucee uses since that was never going to get updated anyway. So we set off on our race. I helped head up the option of forking Hibernate and about 6 hours later with a few shortcuts taken we had a working product and proved that the option was viable. A little more rework and another forked library later the solution was ready for production. 

### The Solution Explained

Basically the changes were fairly simple. First we forked Hibernate at the 3.5.5 tag matching the release Lucee was already dependent on. We then renamed all the packages that were `org.hibernate` to `org.luceehibernate` in the hibernate-core project (the only part of Hibernate that Lucee is dependent on). We then changed Lucee to now be dependent on the new jar which included the `org.luceehibernate` package. At this point we would get a separate error that was that [Hazelcast](https://hazelcast.com/), our second-level cache couldn't find `org.hibernate.CacheProvider`. This made sense but was a little unfortunate since it led to us forking Hazelcast as well. After forking, having it depend on our new version of Hibernate everything worked awesome. 

### Thinking Outside the Box

As I reflect back on the work that we did on this issue I'm proud of what was accomplished. At first glance it seems like a bit of a hacky solution but when you consider that the version of Hibernate that Lucee was dependent on wasn't updated in years it felt fairly good. There were a lot of fun whiteboard sessions of trying to come up with different solutions and everyone supported each other's ideas and was willing to help try the different solutions. 


### Changes

[Changes to Lucee](https://github.com/MasterControlInc/Lucee4)

[Changes to Hibernate](https://github.com/MasterControlInc/hibernate-orm/tree/mc-master)

[Changes to Hazelcast](https://github.com/MasterControlInc/hazelcast)