---json
{
  "title": "Programmer’s Writer Block: Make It Work, Make It Right, Make It Fast",
  "description": "A dive into the developer mantra of Make it work, make it right, make it fast. What it means and the affect it can have our your process.",
  "date": "2022-09-25",
  "hero_image": "./writer_block_hero.jpg",
  "tags": [
    "Programming",
    "Development Mantras",
    "Software Engineering",
    "software development"
  ]
}
---

Designing software is often a daunting task. We often confront problems that we may not initially know how to solve. Staring at a blank IDE with no clue where to start can lead to a programmer's version of writer's block. Similar to what is suggested to get over writer's block, simply writing something down and starting the process can be a great way to overcome this obstacle. This relates to a common mantra in the software industry ["Make it Work, Make it Right, Make it Fast"](https://wiki.c2.com/?MakeItWorkMakeItRightMakeItFast) attributed to Kent Beck. One of my early mentors shared this mantra with me and it still is often quoted in my mind as I work today. Pair programming with this mentor he would even occasionally vocalize what step in this process we were in. "OK, so let's just make it work for this case", "Now that we got that working let's refactor it and make it more maintainable", "Now that our code is clean, is there something that we can do to make this faster", etc.

## Make it Work

You may write the most beautiful, well-structured program in the world but if it does not accomplish a useful task it is of no use. The idea of "Make it work" is meant to lower the standard we hold ourselves to at the beginning of our development process. We will raise this standard before we call ourselves complete but having this lower standard initially gives us freedom. To relate this to writing an essay in school, this is like turning off the spell checker and all distractions as we write our first draft. Undoubtedly there will be many spelling errors, grammar issues, citation issues, etc. We should not worry about this at this point though, the goal of this first step is simply to get a working skeleton down. In development, this might be testing out a new API you think may be useful or coding a solution to a specific slice of the problem. Maybe these experiments fail but even so, it gives you more information to build from.

I have seen different ideas pertaining to whether someone should write tests during this step. Some feel like the tests get in the way of writing something that works as they still are unsure what they are building. Others see the tests as a way to document what a working solution will do. There is logic to both solutions, choose what makes sense to your situation and the goal of the "make it work" you are doing. If you are writing a POC trying out a new API it may make sense not to write tests as all of your code could be seen as a test. On the other hand, if the unknowns are not quite as substantial and you are simply slotting something new into an existing solution, starting with at least some tests may make a lot of sense.

However you get there, make it work proves your ideas and verifies that a solution is possible and you are barking up the right tree. This is not software that you would ship to a production environment but you are on the path. With a technically working solution, you are ready to move on to the next step.

## Make it Right

In our previous step, we potentially made a mess with our code. In our essay analogy, you now have an essay with run-on sentences, spelling issues, and various other problems. Now we start to correct those issues. In our development practices, now is the time we verify our edge cases, we clean the code, extract duplicate code, and perform all the other general code cleanup. If we started with at least some level of testing in the "Make it Work" process we are even better equipped for the refactoring in this step.

This is not an optional step. While we technically have some level of working software when we complete the previous step, it is not enough. Our standards should be higher. We can not be sure that all the cases are covered. The current maintainability of the software is also very suspect until we complete this step.

## Make it Fast

It is at this point that we hit our first optional step. Working software should always be our primary goal. With the completion of the previous step, we have arrived at that point. It is at this step that we can go above and beyond. With the label "Make it fast" this step may be seen as only performance improvements. That can be part of it. However I like to think of the scope of this step as polishing. Maybe the polish is making the execution of the software faster. Maybe it is going above and beyond on some documentation for the feature. Some have offered that instead of "Make it fast" this step should be called "Make it better". I think this is a useful twist on the original phrase.

---

The above process is not the only way to develop software; however, especially if you are having a hard time getting started, it can be a useful method to try. The above process also does not have a specified amount of time allotted to each step. In extreme cases, you may spend a significant amount of time in one step; at other times, the whole process may take mere seconds and you will be onto your next iteration through the process. When given the choice, always choose to have smaller iterations. Another noteworthy point is that it is possible to get stuck in the make it right and make it fast (or better) steps. We can get stuck in chasing the "perfect" solution which results in the wasteful process of [gold-plating](https://en.wikipedia.org/wiki/Gold_plating_(project_management)). We will never achieve perfect software as we will continue changing and improving our code therefore we need to know when to call it good enough. I have often found working with someone else and discussing how far to take something a useful method for determining how deep we should go.

While by no means a new idea in the industry, make it work, make it right, make it fast (better) is a useful principle. It helps focus on getting started but also not leaving behind half-baked solutions. It allows for going above and beyond but leaves the discretion of the developer as the final decider. For these reasons, it is a helpful mantra to keep in mind.