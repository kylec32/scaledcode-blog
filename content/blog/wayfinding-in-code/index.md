---
title: Applying Wayfinding to Your Code Structure
description: Applying the process of wayfinding to development of code.
date: 2022-05-02
hero_image: ./wayfinding-hero.jpg
tags:
  - wayfinding
  - Clean Code
  - Software Engineering
  - architecture
---

Several years ago I heard a man (I believe he was an airport architect) describe one of his job requirements as understanding *wayfinding*. Wayfinding is [defined](https://en.wikipedia.org/wiki/Wayfinding) as encompassing "all of the ways in which people (and animals) orient themselves in physical space and navigate from place to place". In more modern usage, and the architect above's usage, it has been extended to refer to the user experience of orienting and choosing a path within a manmade environment. One of the things this architect had to take into account was how to enable people to quickly and accurately orient themselves within the airport he was helping to build to facilitate them getting from where they were to where they needed to go. You can imagine the challenge this could be in such a large space full of many people, potentially speaking many languages, often sleep-deprived, and in a hurry. Ways that this may be accomplished in an airport may be the use of signage, symbols, maps, and even colors and I've seen references to using certain shapes of roof tiles to encourage people to move in a specific direction. I find the concept of wayfinding fascinating. Using tools both obviously meant for orientation like maps as well as non-obvious tools like colors and floorplans to influence how people move through a system seems like a modern-day Jedi mind trick.

As I considered more about wayfinding the parallels to proper code design were apparent. While those modifying code aren't navigating through physical spaces, and instead are navigating through "[pure thought stuff](https://en.wikipedia.org/wiki/The_Mythical_Man-Month)", the lessons and processes from wayfinding are still applicable. By applying the same principles from this physical discipline we can leverage the learning that has gone into wayfinding for our benefit and to improve our code. The wayfinding process breaks down into the following steps: orientation, route decision, route monitoring, and destination recognition. Let's apply this process to the process of making a code change in an existing codebase.

A first step when entering any new codebase or an existing codebase is that we need to figure out where we are and where we need to make changes. When orienting yourself in a physical environment you will often use objects and landmarks nearby. In code as well we can look at the code around where we are at to get an understanding of where we are and where we might need to make our change.

Next, we need to make our plan of how we are going to make our change. Using the landmarks we have we chart our course of where we will need to make changes. Maybe we will come up with multiple options but we will need to weigh them against each other and choose one. This doesn't mean we may not need to change course later but we can only choose one course at a time.

Once we have chosen our route through the code and have started along that path that doesn't mean it will take us where we wanted or needed to go. As we go down the path we monitor to make sure we are getting where we are trying to. If we notice that we are off course we can change the route we are taking.

The final step is to recognize that we have reached our destination. This of course means that we need to know what our destination looks like. When we have reached this point we have made it through the process. Often when developing a solution we will repeat this whole cycle many, many times even in one coding session. Recognizing these steps in the process can help us know where we are currently in the process so we can look forward to the next step and be ready to recognize it as well as gain the benefit from it that we are after.

There are many lessons still to be learned from wayfinding that we can apply. Think about what you are using to find your way through code. How does it apply to wayfinding? How do you orient your way in the physical world? How can we apply that to code? What signs or feedback in your code environment do you wish you had to orient yourself? Using this information prepares the path for the next person, who knows, it could be you. I love finding connections between our development work and that of other disciplines. There is so much knowledge and research that has been done in so many different areas that we can all benefit from and this is just one more that we can use to our advantage.