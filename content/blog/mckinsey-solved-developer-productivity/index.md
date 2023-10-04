---json
{
  "title": "McKinsey Has Solved Developer Productivity Measurement",
  "description": "A critical view of a recent McKinsey article about measuring developer productivity.",
  "date": "2023-08-23",
  "hero_image": "./developer-productivity-hero.jpg",
  "tags": [
    "Software Engineering",
    "software development",
    "Culture",
    "Productivity"
  ]
}
---

Recently MicKinsey came out with an article titled "[Yes, you can measure software developer productivity](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/yes-you-can-measure-software-developer-productivity)". After so much research by so many in software development including some of the biggest players such as Google, Meta, Microsoft, etc. McKinsey has come in and solved it for us. I of course am kidding. This piece is, unsurprisingly, just a marketing fluff piece aiming to drum up consultant engagements for them. Trying to get business is of course their right but to me, the hubris of this article is just too much. That said, there are things we can learn from their article.

### The Good

Although there are some fundamental problems with this article there are some good things. The main good thing is its reference to the DORA and SPACE metrics. These are not items that have come out of McKinsey. DORA (DevOps Research and Assessment) is a legitimate research organization that performs real science. Out of this research came the book "[Accelerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339)" by Dr. Nicole Forsgren, Jez Humble, Gene Kim. Out of that research came the idea of tracking the following metrics.

* _Deployment frequency:_ How often your team is successfully deploying code to production?
* _Lead time for changes:_ How much time does it take for committed code to reach production?
* _Change failure rate:_ What percentage of changes to code result in deployment failures or bugs requiring patches, rollbacks, or other hands-on fixes?
* _Time to restore service:_ How long does it take to restore normal services in the event of incidents that impair users?

The article rightfully calls out that these metrics are useful and should be respected. The same can be said about the SPACE framework which takes a big-picture approach to developer productivity. The dimensions of SPACE are:

**S**atisfaction and wellbeing

**P**erformance

**A**ctivity

**C**ommunication and Collaboration

**E**fficiency and Flow

These dimensions can then be applied to different levels of the organization: individual, team, and system. I'm just glossing over the details of these two because they rightfully both have many articles written solely about them.

The McKinsey article also references these dimensions of research and includes a table of how these metrics apply at the same levels that SPACE calls out. So while I respect that they recognize the benefit of this research it seems like they are trying to give themselves legitimacy by connecting themselves to it. This article is clearly written with business executives in mind as the target audience (they are the ones that sign the checks to hire the consultants so it makes sense). Business executives likely would not be already familiar with these metrics so introducing them in a piece like this is beneficial.

### The Bad

As referenced in the previous section I worry that most of the substance of this article comes from DORA and SPACE and McKinsey is adding extremely little to the conversation. They add a "Developer Velocity Index", "Contribution Analysis", "Talent Capability Score", and "Inner/Outer loop" metrics. The Developer Velocity Index which "measures an enterprise's technology, working practices, and organizational enablement and benchmarks them against peers." So pretty much hand-waving a made-up number about how well your organization performs. This seems to be the whole point of measurement so why they don't go into details about this is beyond me and likely means there is little substance. The "Contribution Analysis" is described as "Assessing contributions by individuals to a team's backlog ([…] and normalizing data using a proprietary algorithm to account for nuances)" again an imprecise metric hiding behind the word "proprietary". The "Talent Capability Score" which "is a summary of the individual knowledge, skills, and abilities of a specific organization". Put simply it appears to be a way of putting each developer on a map where their skills can be plotted to determine if more training is necessary. Finally, we have the "Inner/Outer Loop" which divides a developer's work into an "inner loop" (the things they "should" be doing) and the "outer loop" (the things that "get in the way").

There is nothing wrong with standing on the shoulders of those who came before you and adding a little more value on top, in fact, this is encouraged. This is how our civilization has progressed. The problem I see with the above additions is they either provide no additional value because they are overly broad (e.g. You will be more successful if your developers are the perfect skill level) or actively harmful such as the "Inner/Outer Loop". Let's dig a bit more into that one as that is where I saw the most unfortunate advice.

As described above the inner/outer loop idea separates things that provide value: build, code, test, from those that don't provide value: meetings, deployment, integration, security, and compliance. Looking at those "valueless" activities I was left scratching my head, really, security is not valuable? Unit testing is valuable but not integration testing? Meetings seem to be the one probably most would agree on but further in the article we read something that makes me question the types of meetings they are against (as well as illustrates what McKinsey thinks developers should be doing all the time).

They describe one company that found out "that its most talented developers were spending excessive time on noncoding activities such as design sessions or managing interdependencies across teams." If these are the meetings they are referring to I would have to disagree. Time spent on design is time spent on knowing how to build the software, and how to solve the business problem. With this though, McKinsey shows that all they want developers to do is literally write code. From a 50,000 feet view that could make sense but it shows a lack of understanding of what modern software development actually entails. For example, I had the opportunity to work on a particularly tricky data processing feature and an excellent developer and I spent probably two days sitting at a whiteboard hashing out ideas, going over failure conditions, and challenging our assumptions. During this time almost no lines of code were written. Our product manager and scrum master were getting a little nervous but trusted the process (thank you!) After finishing our design it came down to committing it to code. This process took maybe a few hours to get an initial version that, because of our extensive design, required very few changes before going to production. Taking this article's point of view those two days were wasted and I should have just been coding that whole time like I was in those last few hours. Honestly, if I could code with the effectiveness of those few hours all the time then, yes, I would get an incredible amount done but that is not how it works. Without those two days of prep and design work, it would have taken much longer to fumble along to a solution and would likely have been worse quality.

### So What To Do?

It is all well and good to point out concerns with others but that only helps us understand what not to do, not what we should be doing. Truthfully I don't have the answer either. I do agree that DORA metrics and the SPACE framework are useful tools. However, where the rubber meets the road I believe truly measuring an individual or a team's productivity is a lot of squishiness. It is more qualitative than quantitative. There are some like Martin Fowler that [don't believe you can measure productivity](https://www.martinfowler.com/bliki/CannotMeasureProductivity.html). A lot of it comes down to measuring and understanding how things are going at the [team](https://charity.wtf/2020/07/07/questionable-advice-can-engineering-productivity-be-measured/) [level](https://blog.pragmaticengineer.com/can-you-measure-developer-productivity/). Don't throw the baby out with the bathwater. Understand where the value comes from (a code change) and why it is valuable (all the support processes around it). If you overly focus on the "where" and optimize for improving that, without supporting the "why", you will end up moving fast in random directions, not the direction you need to go.

### How About You?

What has been successful in your work in measuring the productivity of an individual, team, and/or system? Share it below, hearing and understanding these experiences from the trenches of real work is where the value is in my opinion.
