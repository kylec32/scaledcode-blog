---
title: Effective Java! Don't Ignore Exceptions
description: A dive into chapter 77 of Effective Java
date: 2021-10-26
hero_image: https://miro.medium.com/v2/resize:fit/0*fpmo4S6WFfrmUmnc
tags:
  - java
  - effective java review
  - design
  - architecture
---

Something that likely feels obvious but can be tempting is ignoring exceptions. This is often a major red flag. It is extremely easy to ignore exceptions, you simply surround your exception throwing code with a `try` and empty `catch` block. 

Exceptions are thrown when exceptional circumstances are experienced so by ignoring exceptions we are opening ourselves up for problems. _Effective Java_ likens exceptions to fire alarms, you may get away with ignoring them or you may be seriously harmed. 

So why would someone want to ignore an exception? An example might be to ignore an exception when closing a `FileInputStream`. If you haven't changed the state of the file thus there is no recovery and your application already has read what it needs to, there is no need to stop execution on the exception thrown when closed. Even so, there may be a good reason to log the exception so that you can at least track the occurrences and still account for them out of band. The purpose of this chapter is not to say that ignoring exceptions is always bad, just that it is always of concern and should be given appropriate scrutiny.

Another thing to consider is if an exception is often ignored it may be a sign that the exception is being thrown inappropriately. An example I have interacted with is Spring Data's delete methods. When a record that is requested to be deleted isn't found, it throws an `EmptyResultDataAccessException`. This doesn't feel appropriate as it simply means the repository is already in the state I requested. I could check if the record exists before deleting but that simply adds unnecessary computation (as well as still being open to a race condition where the record gets deleted between checking its existence and deletion) when my goal is often just to make sure a particular record doesn't exist. In this case, I will often catch the `EmptyResultDataAccessException` and leave a comment in the catch block to the effect that, "It is OK the record didn't exist".

No matter the reason, if after careful consideration it is decided that ignoring a particular exception is appropriate, you should add a comment to the empty `catch` block explaining why the exception is being ignored. This helps future developers (including yourself) know that careful consideration was put into not doing anything with a particular exception and the reasoning why.

No matter what the exception is, every exception deserves careful consideration before simply ignoring it. By ignoring exceptions we continue in the face of errors and allow our application to continue without any recovery after an exception. This can lead to failing at some future time without information about what the true root cause is. By proper handling of our exceptions, even if that is just commenting why an exception is ignored after considering its effects, we are left with better, safer code.  