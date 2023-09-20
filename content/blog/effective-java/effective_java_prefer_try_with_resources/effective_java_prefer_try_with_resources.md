---
title: Effective Java! Prefer try-with-resources
description: A dive into chapter seven of Effective Java
date: 2019-11-12
hero_image: ./try-with-resource.jpg
tags:
  - java
  - effective java review
  - design
  - architecture
---

Today we have a topic right in line with what we talked about last week. Last week the topic was on finalizers and cleaners. One of the common uses for these is to clean up resources. In this blog post we will go into a little more detail of the better way we hinted at at the end of the previous post. 

There are many resources that for one reason or another need to be manually closed after use. This often is accomplished by using a `close` method on the object. We of course don't want to leak resources or leave items in a half handled state. This being the case we may consider putting the close method in a `finally` block. For example:
```
static List<Object> getDbValues() {
  EntityManager em = getEntityManager();
  try {
    return em.createNativeQuery("SELECT * FROM myTable").getResultsList();
  } finally {
    em.close();
  }
}
```

This will work just fine, it doesn't even look that bad. It does get more confusing and error prone as we add more resources. 

```
static List<Object> getDbValues() {
  OutputStream output = getOutputStream();
  InputStream input = getInputstream();
  try {
    try {
      // do work
    } finally {
      input.close();
    }
  } finally {
    output.close();
  }
}
```

This is starting to get more gross and hard to follow. Did I even do it right? I'm not convinced. It can be easy to mess up. The author even admits that he had this pattern messed up in one of his books for years and no one realized. Even with the correct code there are subtleties with error handling that are not handled as well as they could. Exceptions can override each other and we could lose valuable information in the stack traces that occur. You could write code to handle this but it's complex and ugly thus no one wrote it that way. 

So in Java 7 we got our better answer, try-with-resources. With this construct any class that implements `AutoCloseable` can have it's closing handled by Java. Thus are above example looks like:
```
try(InputStream input = new FileInputStream("file");
    OutputStream output = new FileOutputStream("other")) {
            // do work
}
```

This is much simpler. It also handles a lot more than we were handling in our previous example. This is not actually how the code stays. The above code gets transformed by the compiler into a much more verbose result. Let's take a look:

```
InputStream input = new FileInputStream("file");
Throwable var2 = null;

try {
    OutputStream output = new FileOutputStream("other");
    Throwable var4 = null;

    try {
        //do work
    } catch (Throwable var27) {
        var4 = var27;
        throw var27;
    } finally {
        if (output != null) {
            if (var4 != null) {
                try {
                    output.close();
                } catch (Throwable var26) {
                    var4.addSuppressed(var26);
                }
            } else {
                output.close();
            }
        }

    }
} catch (Throwable var29) {
    var2 = var29;
    throw var29;
} finally {
    if (input != null) {
        if (var2 != null) {
            try {
                input.close();
            } catch (Throwable var25) {
                var2.addSuppressed(var25);
            }
        } else {
            input.close();
        }
    }

}
```

Whoa! That got pretty intense. But if you parse through it you can see that it is doing the work we were hoping while handling exceptions much more completely. 

Final thought. In a [previous post](https://dev.to/kylec32/effective-java-tuesday-the-builder-pattern-2k5f) I mentioned the tool [Lombok](https://projectlombok.org/). I very much think this is a good tool. Inside the bag of tricks of Lombok there is an annotation `@Cleanup`. It looks like it will do something very similar to the above. So what makes these two different. While it is correct that they do similar things they do have a slight different. The main difference is that `@Cleanup` simply writes the try-finally combinations like we did above but doesn't do any magic handling the exception handling. So while `@Cleanup` does give us the safety of a finally block we do lose the specialized exception handling. 

So there you have it. Use try-with-resources. It's easier, it's cleaner, is safer, this is truly a place where I don't see a lot of downsides. 