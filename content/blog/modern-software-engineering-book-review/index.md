---
title: Modern Software Engineering by Dave Farley Book Review
description: A review of Dave Farley's Modern Software Engineering Build Better Software Faster.
date: 2022-06-27
hero_image: ./modern-engineering-hero.jpg
tags:
  - book review
  - Education
  - software development
  - Software Engineering
---

A couple of coworkers and I recently decided to read [Modern Software Engineering by Dave Farley](https://www.amazon.com/Modern-Software-Engineering-Better-Faster-ebook/dp/B09GG6XKS4) as part of a book club we run at work. This book comes to us from one of the pioneers of continuous delivery, the man that literally [wrote the book on it](https://www.amazon.com/Continuous-Delivery-Deployment-Automation-Addison-Wesley-ebook/dp/B003YMNVC0). This book is fairly high-level but spurred some solid conversations among my colleagues that we found helpful.

## Overview

The book is broken into four main parts. First, we start by discussing what is engineering and particularly software engineering. We then move into covering the first main focus that Dave suggests a modern software engineer needs to have, optimizing for learning. He follows this with the second focus being optimizing for managing complexity. We then close out the book by discussing tools to help support the previous two items. Let's dig into each of these items in a little more detail.

### What is Software Engineering?

The core of what Dave argues is that software engineering is taking a scientific approach to software development. By applying the scientific method to how we design and build systems we can find efficient and economic solutions to the practical problems that we face. By being prescriptive in the the framework and the model that we use to build software we can have more repeatable results. Dave also digs into the need to change how we think about software from concerns of "production engineering" where the construction of the deliverable is the expensive part of the process (such as building a bridge which is undoubtedly expensive) to what is true of software where "design engineering" is the expensive part. In software, the actual building of the deliverable is expected to be simple, and practically free, just run a build task. It is the design part that takes time and has complexity. Going back to the bridge example, it would be the costs of designing a first-of-its-kind bridge that is what mimics software engineering rather than the pouring of concrete that is the expensive part. We have a benefit in software where we can largely ignore those production constraints. Occasionally when asked what my job title, "software architect", means I have responded with something along the lines of, "It is kind of like a building architect, except I don't have to obey the laws of physics". While this doesn't help someone fully understand what I do it usually brings a smile and a furtherance of the conversation. It reminds me of one of my favorite quotes from Fred Brooks from [The Mythical Man Month](https://www.amazon.com/Mythical-Man-Month-Anniversary-Software-Engineering-ebook-dp-B00B8USS14/dp/B00B8USS14).

> *The programmer, like the poet, works only slightly removed from pure thought-stuff. He builds his castles in the air, from air, creating by exertion of the imagination. Few media of creation are so flexible, so easy to polish and rework, so readily capable of realizing grand conceptual structures …*

### Optimize for Learning

The idea behind this part is very important. Any person that has spent any time in this industry knows that there is a constant need for learning and growing or you end up with career stasis and death. This section is further broken down into sub-parts, these are working iteratively, feedback, incrementalism, empiricism, and experimental. This section is quite large but it all boils down to applying the scientific method to your learning. By learning through small, incremental experiments and using the results from those experiments to learn and make your next hypothesis you can optimize your learning.

### Optimize for Managing Complexity

Outside of the simplest of throwaway systems, all software is going to have complexity. Whether this comes directly from the domain of our solution, inherent complexity, which is unavoidable, or the complexity we introduce through our choice of solutions, accidental complexity, which should be minimized, complexity is always there. This section again doesn't put forth any earth-shaking hypothesis. It simply argues to follow best practices for system design. This can be seen in the subtopics: modularity, cohesion, separation of concerns, information hiding and abstraction, and managing coupling. To pitch different solutions and directions of how to address these design challenges, the author goes high-level on some other very broad topics such as TDD, microservices, DRY, human systems, etc. Each of these has its own books on its own so there is only so much that can be covered here but it can serve as a reasonable introduction to these concepts and an invitation to learn more.

### Tools to Support Engineering In Software

In this final section, Dave refers back to the previous sections and gives some specific tools and thoughts on how to achieve this scientific, engineering-oriented approach to software development. These ideas include TDD again (Dave Farley is an extremely big TDD fan), continuous delivery (again, he wrote a book on this so it comes as no surprise that he values this highly), and controlling the human and organization sides of the process of the production of software systems.

## Overall Thoughts

I think this is likely a good book for a newer software engineer or a more senior software engineer to serve as a study guide for further research. While I didn't find anything groundbreaking here it was a solid collection of concepts that are indeed very important to the modern software engineer.

#### Pros
* Overall it was largely a fast, entertaining read.
* Dave Farley comes with the experience and the examples to back up what he is saying.
* The book provides solid pointers to the source research behind the book's content and where you can learn more.

#### Cons
* At times the book seems very problem-focused rather than solution-focused. For example, various "bad" examples of code will be presented with no "good" example to compare against.
* Dave is very strong in some of his beliefs. Some of them I believe he holds as absolutely necessary for success like TDD but others like how JSON is the worst data transfer format ever invented are strange, dwelled on for way too long, provide nothing of value, and leave the reader potentially put off.
