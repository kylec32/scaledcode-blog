---
title: Microservices Patterns by Chris Richardson Book Review
description: Review of Chris Richardson's "Microservice Patterns" book. Who it is for and what you can learn from it.
date: 2022-02-28
hero_image: ./microservices_patterns_review_hero.jpg
tags:
  - java
  - microservices
  - architecture
  - design patterns
  - book review
---

I recently had the pleasure of reading Chris Richardson's ["Microservice Patterns"](https://www.amazon.com/Microservices-Patterns-examples-Chris-Richardson/dp/1617294543?_encoding=UTF8&sr=8-5&linkId=a1c3de7d3926d5ad031a943f81c00131&language=en_US&ref_=as_li_ss_tl) book. Even though this book is now around three years old I still find it very applicable which can't be said for many books in the technical arena, especially one focused on actionable insights. I think it is a worthwhile read for any developer starting their journey into the microservices arena. Let's dive into some of the details.

## Overview

This book covers various topics about the implementation of the microservices architecture. In doing this somewhat follows the story CTO (Mary) of a fictional company called *Food to Go Inc (FTGO)* and their journey from a monolith architecture to microservices. At a high level it covers the following topics:

* Why you might want to use a microservice architecture rather than a monolithic one.
* Application decomposition strategies.
* Interprocess communication in microservices.
* Managing transactions in microservices.
* Domain-driven design as it applies to microservices.
* Event sourcing in microservices.
* Query patterns in microservices.
* Testing strategies for microservices.
* Productionizing microservices.
* Deploying microservices.
* Refactoring from monolith to microservice.

These topics span the range from pre-development activities to operating microservice applications. While it is most useful from the perspective of a technologist starting with a monolith and transitioning to a microservice it still could be a useful resource for those starting from scratch directly into microservices.

Now let's look at some of the good points and some of the misses from my perspective with this book.

## Good Points

This book does a great job of giving someone a quick overview of some of the high-level concepts they should be considering when using microservices. It doesn't get overly stuck in the weeds of specific technologies and focuses quite a bit on patterns versus specific technologies (with a few notable exceptions mentioned below). This is one of the reasons why it stands the test of time better than it might have otherwise when written about such a fast-moving part of the industry. Patterns move and change much slower than technologies. The book is also largely unopinionated on what technologies should be used. It offers various options with their pros and cons. While at times the author's opinion of which direction is preferred is made clear I do appreciate that multiple options are presented.

## Improvement Points

As for things that can be improved I have a couple of thoughts, some of these are not criticisms of the book but more highlighting what the book won't help you with (and doesn't set out to cover). First, this is a fairly high-level book. You won't be able to get deep into the details of implementation details after reading this book. It can give you ideas on what overarching things you should be focused on and where to start your search for additional information. The other main issue I had was the usage of the Eventuate framework that the author developed. This book felt a little bit like an advertisement for the framework and I think the usage of the framework negatively affected the learning from the book. This framework hides a large amount of the implementation details about core algorithms and patterns that the author was discussing. By hiding these details behind the framework I think the reader, unfortunately, misses out on a lot of great learning that they could have received by seeing the nitty-gritty details. While I think it's great that he is trying to improve the development experience with asynchronous messaging I don't think using that in the book was the right idea.

## Conclusion

Overall I would call this book a worthwhile read for those new the microservices architecture, especially those looking forward to a monolith to microservices migration. For seasoned veterans of microservices, a read of this book likely won't be as beneficial although if you have access to the book the chapter and section headings could serve as a quick checklist of sorts that various core pieces of your architecture are being addressed. Chris has invested a lot of time and effort in striving to improve the ecosystem for microservice developers. Between this book, his [website](https://microservices.io/), and his work on [Eventuate](https://eventuate.io/) I appreciate what he has done.
