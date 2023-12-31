---json
{
  "title": "The Next.js Conf Picture That Blew People's Minds",
  "description": "Seeing a SQL statement in a React component has caught the internet's attention in both good and bad ways. Let's discuss the different camps people have ended up in.",
  "date": "2023-10-28",
  "tags": [
    "frontend",
    "Backend",
    "software development",
    "Reaction"
  ]
}
---

{% image "./croppedNexjsConf.png", "A picture of the slide from Next.js Conf that caught the internet on fire." %}

The image above has taken over the software development internet by storm over the last day. Particularly on Twitter/X, it seems to be about all people are talking about. Just twelve lines of code on a slide and you would have thought it was the craziest thing anyone had ever seen. So why are people freaking out?

The reactions seem to fall into three different groups. Those who think this is the best thing they have ever seen. Those who think people who want this are horrible developers and are coding in an extremely insecure manner. And those undecided people straddling the middle. I will say right off the bat, I don't have a strong understanding of how this pattern is working under the hood but I have researched it some and looked at what the true experts in this are saying. Let's take a look at each stance.


## Those That Think This is the Greatest Thing Ever

There is definitely a group that gets very excited about this setup. This is a great sign for those developing these features, they seem to have a pulse on what these developers want and they are providing those abilities. This is what we want from language, tool, and framework developers. There are definitely things to like about this.

You can build an end-to-end feature all within one context with extremely low friction. People were excited when [isomorphic JavaScript](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) came on the scene where they could use one language for both frontend and backend concerns. This pattern takes that same root desire and pushes it further along the continuum. This pattern blurs the lines of when you are doing frontend or backend work and turns it just into "work". That is what users care about, what the product does, not what the backend and frontend specifically do. 


## Those That Think This is a Horrible Idea

Next, we have those who think this is a horrible idea and question the developers who would want this. The first immediate response I see is people mentioning something along the lines of "Wow, that's some easy SQL injection". Honestly, this initial reaction is probably a good thing, it means that people have SQL injection at the top of their minds and are looking out for it. As an industry, this is not a bad thing. There is also the common, related response of, "I love giving my customers the ability to rewrite my SQL on the client." This concern has a lot of the same root worries. Both of these thoughts are fueled by misunderstandings.

The first is the `sql` identifier alone with the template syntax (`${slug}` from the picture) leads to a parameterized query, exactly what you would be pitching for on the backend. Even if that is the case the concern of "but I can change it on the client" still stands. That is where the other misunderstanding comes from. The `use server` identifier apparently ensures that the code stays on the backend, and, if you believe [Dan Abramov](https://twitter.com/dan_abramov/status/1717648341234778376) (and [he knows a thing or two about React](https://golden.com/wiki/Dan_Abramov-99B8RJM)), all of the code is running on the server, not the client. A large part of this misunderstanding I think comes from expectations, React components we are used to running on the client and so when we see them we expect that to be where they are. This is understandable.

The third most common thing I hear as an opinion is "Didn't we do this with PHP and we decided this was a bad idea?" This opinion seems to be the least misinformed. Indeed this pattern is mixing DB logic with template logic and thus has a lot of similarities. That said, more than encouraging you to write your DB queries in your templates, I believe the example is more succinctly communicating that you can interact with the frontend and backend all in one place. No one is stopping you from extracting the DB query into some business processing service with error handling and invariant checking.

Unfortunately, I think a lot of people in this group are just fishing for an easy immediate reaction. In doing this they aren't doing their research and unintentionally misjudging something that they literally have one picture's context about. Alternatively, they are intentionally knowing that their judgment is not based on reality and still further perpetuating the misinformation. Both are not great states to be in.


## Those That Are Stradling Both Sides

Now we have the final group, unsurprisingly this is the middle ground. Honestly, anyone not wanting to make a misinformed comment would be wise to put themselves in this group about things they don't know a lot about. These are the consultants and other people who respond to everything with "It depends" and they are correct, often it does depend. However, if the conversation simply ends there you are no better off. We need to understand what it depends on. Thankfully, some people have attempted to dig into what it depends on.

The most common comment I have seen on what it depends on is juggling speed of development with maintainability. Comments like, "This is going to be a game changer for solo developers and a disaster for large teams." The argument is that the ease of development will help those small teams but large teams with many cooks in the kitchen will run into issues with so easily mixing concerns. This is the PHP argument above. Time will tell if this dividing line is being drawn at the correct location or if there is a dividing line at all.


## My Take

I have worked in systems before that easily allow the mixing of concerns. The main product at my current job is written in ColdFusion which labels itself as a "rapid web-development platform" and honestly it is not wrong, you can rapidly build a web application using it. Decades ago the business saw a market opportunity and raced to be first in the market to fill that need, the rapidness with which they were able to build the solution honestly probably led to the strong position it holds in its industry today. Along with this rapid development, it also allowed poor design decisions to be made, this later slowed development to the point that it was difficult to make changes in the ball of mud which was left. There is danger in removing constraints. 

Rich Hickey famously describes in his talk "[Simple Made Easy](https://www.infoq.com/presentations/Simple-Made-Easy/)" that if you look at the industry as a whole it is actually interesting that many of the "advances" we have made are not in making new things possible but instead in constraining what we allow ourselves to do thus facilitating progress. Examples include removing gotos in structured programming and functional programming removing side effects. What we see in the picture at the top of this article seems like a step in the opposite direction. It is a step in allowing more, not less. Maybe we should take that as this is a mistake and that it will only lead to sadness and woe. Maybe this is us, as an industry, taking a course correction. Perhaps we pushed too far into the separation of concerns and the adding of constraints. Only time will tell.

I would likely put myself in the third group above. I see the allure of what this is trying to accomplish, this will surely help a lot of people. I also imagine it also will be a land mine for others who will forget the principles that have protected us in times gone by.

What is your opinion? Will this capability have primarily a positive impact or a negative one? How can we avoid falling into the pitfalls it might present? Also, how can we not fall into the pitfall of automatically writing something off but instead taking whatever learnings we can from something?