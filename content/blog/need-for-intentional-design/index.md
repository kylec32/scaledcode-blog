---json
{
  "title": "The Need For Intentional Design",
  "description": "In the current software development community Agile is kind and agile puts it's weight behind emergent architecture. So is intentional architecture dead?",
  "date": "2017-08-14",
  "tags": [
    "architecture",
    "agile"
  ]
}
---

In the principles of the [agile manifesto](http://agilemanifesto.org/principles.html) it states:

> The best architectures, requirements, and designs 
> emerge from self-organizing teams.

I have heard this principle quoted countless times in the last few years that I have spent in the industry. At the same time I have seen a number systems that leveraged this "best" method of architecting. Needless to say I wasn't impressed and neither were any of the developers working with the code. So where does that put us? I believe in the agile principles, the people behind them have a large amount of industry experience but you can't disagree with the code in front of you. This topic always seems to be in the back of my mind as I work on the [System Architecture](http://www.scaledagileframework.com/system-and-solution-architect-engineering/) team at work and am largely working in a architect role. Is my job just unneeded overhead? What really is my role? I figure a number of these posts will be going over a lot of these things but today's in particular I wanted to talk particularly about upfront design/architecture. 

So how would I answer the question of if upfront design is needed? I would say yes. So that means I don't believe in emergent architecture? Nope. I definitely think that emergent architecture has it's place and it's a very important place, it is in the combination of the two where we find the most success. However with the explosion of the agile I think up front design (or as it's often called intentional design) gets a bad rap.  I am not alone in thinking that some up front design is required. When I was recently taking some training from the [SEI](http://sei.cmu.edu/) (Software Engineer Institute) they called out this agile principle specifically and how they have seen organizations that follow this principle suffer because of it. Even Martin Fowler calls it simply and says ["evolutionary design is a disaster"](https://martinfowler.com/articles/designDead.html).  

So what purpose does upfront design do for a project? Primarily I believe it helps us take a step back before implementing something and seeing how it fits in the whole system. Teams take in stories and their objective is to get these stories (read, business value) and deliver it to customers. It is up to the architects to foresee this issue and help avoid it. The upfront design can take in all the known requirements and apply all the knowledge the architects' have however they will never be perfect. This is partly where evolutionary design comes in. Applying the same principles that were used in the initial design we can change and adapt a design to come up with a tweaked one to achieve the needed goals. Even if the design works great now at some point in the future it will be changed. 

Throughout this article I have been using the term "upfront architecture" and only once mentioned "intentional architecture." I think this second description is even more appropriate. It puts much less emphasis on the time that the design was done and more on the attitude behind it. There is a quote I have heard before that rings true that goes something along the lines of, "Your system has an architecture whether you chose it or not."  Often when we talk about a system being built with emergent design I think it actually it was built with no design. Things fall where they will. Emergent design still fits under the intentional definition I believe. If we can successfully accomplish this inline design and architecture I think we can spend less time with the upfront intentional design. 

A final part of the [Is Design Dead?](https://martinfowler.com/articles/designDead.html) article from Martin Fowler was the idea of irreversibility. Recently I have seen an integration of a third party system into a product that was done quite poorly. This was exacerbated by the fact that reversing the integration was going to be hugely expensive. There was no up front design of this huge integration and worked in a silo for almost a year before big bang integrated into the main system (a subject for another day). The fact that reversibility not designed into the architecture led to a forced bad position and led to having to stick with a poor design. 

There are definite benefits on both sides of the upfront vs emergent design debate and I'm sure I will learn much more as I continue to work in this industry. My request to the reader is that they don't let agile get rid of deliberately choosing an architecture and design to your code. Whether you are a senior architect or junior developer you posses the skill to be careful in your design and a little care now will cause a lot less turmoil later.