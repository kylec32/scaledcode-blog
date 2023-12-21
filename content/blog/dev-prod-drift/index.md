---json
{
  "title": "Dev, Test, Prod: How Similar is Good Enough",
  "description": "We all know that your development environment should mirror your production environment, but what does that actually mean? How close is close enough?",
  "date": "2018-03-11",
  "tags": [
    "devops"
  ]
}
---

We have all heard that our test environment should mirror our production environment as well our development environment should mirror test. This is at the heart of what devops is all about. This conversations has been bouncing around at work the last few months. Even the business types are clamoring for dev, test, prod mirroring. The problem is that when you push for a definition of what that actually means you get varied answers. 

Let's look at one side of this potential opinion in this. One could argue that the same application being deployed to two different servers. One is on an AWS micro instance and the other is on at 64 core 128 GB RAM SSD drive server on your local network. One has 3 TB of data, the other is an empty database. One having the services deployed across multiple servers the other having all the services on the same machine. You get the point. With a setup like this I would hope nobody would claim that they were mirroring environments but I'm just using it as an extreme example on one side of the scale. 

How about the other side of the scale. Honestly I'm not sure how to take it to the level I want. Literally deployed to the same machines having the same context switches on the CPU. Having the exact same load, exact same data, exact same radiation hitting the machine. Again, trying to take this to a ridiculous level. When you get to a subatomic level good luck trying to mirror two environments. 

So where should you end up? Honestly I think we would all love to be closer to the second groups. Amazingly enough there are companies that get pretty close to this. We have things like [blue-green deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html) and then you have stuff like this: 

{% image "./dev-prod.jpg", "Dev will match prod when you develop in production" %}

Even though this is meant as a joke with things like [feature toggles](https://martinfowler.com/articles/feature-toggles.html) you literally can test in production. Granted this requires a level of maturity that many companies are not at but it is in the realm of possibility. But we still haven't answered the question, how far do we need to take our environments. What I believe is that, rather than try to come up with the correct solution, find the next step. Definitely having an end goal in mind will help you make sure you are working towards where we want to end up. However, often I believe we stall our progress by waiting till we can make a big leap when we could be gaining value by taking bit by bit steps toward our goal. Maybe that means you change from having one bare metal deployment and one virtualized to both being virtualized. Maybe your are deploying all your services to one machine in test but across different servers in production, move one of those to a different servers. Should be easy and you are still a ways from matching production but you are going to gain some feedback from that decision. The other thing that I think is important is making sure that those stakeholders understand that you won't get it all at once. Sell them on the piece by piece transition plan. It's more sustainable and allows the reaping of your efforts as you go. 

So what do you think? How far do you think the mirroring should be taken? 