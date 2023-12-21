---json
{
  "title": "The Flexibility of Open Source",
  "description": "The options that are opened up when a developer has access to the source code really are endless.",
  "date": "2017-07-09",
  "tags": [
    "Culture",
    "open source"
  ]
}
---

Since my introduction to development I have always known that open source software existed. I always thought it was a cool idea and of have used countless open source applications in my life. At the very least, basically everyone on earth is somehow positively affected by open source software as the world runs on many basic building blocks that are open source software. 

## Hacktoberfest

Even though I have been a huge consumer of open source software, the idea of contributing has always scared me. Personally, I thought it was best to leave it to the "experts." My first experience "contributing" to open source was last October during [Hacktoberfest](https://hacktoberfest.digitalocean.com/). Being the nerd that I am, I saw that if I completed the challenge I would get a free shirt and I'm always a sucker for free shirts so I decided to get over my fears and go for it. Going into the challenge I was hoping to make a change in a library that I had used before; however, this ended up not being the case. I ended up helping some random people on the internet with their own personal product but it was still a great experience. It taught me that the internet actually has nice people that genuinely are appreciative of helpful people. It also served it's purpose and getting my feet wet with making contributions to an open source project and helped me realize it wasn't that big of deal. I worked on a React project as well as a Groovy on Grails project both of which were libraries that I had never worked with and as you would expect, I made some mistakes which the project maintainers patiently helped me work through. I look forward to participating again this year and hope to work on more and more projects. 

## Bitbucket Jenkins plugin

After the Hacktoberfest experience I left my open source contributions to rest. However, recently I have had the opportunity to start back up in fun way. The first of which was with the [Bitbucket branch source plugin](https://wiki.jenkins.io/display/JENKINS/Bitbucket+Branch+Source+Plugin). At my work we use bitbucket as our source control management (SCM) system and Jenkins for our continuous integration. As we have worked with these two products together we realized that the plugin did not support the use case that we wanted to use; that is, waiting until a pull request has been approved before kicking off a build. There had already been an [issue](https://issues.jenkins-ci.org/browse/JENKINS-40958) opened for this back in January and it didn't seem to be getting any traction so I decided to give it a try. It turns out the change was pretty easy and just like that we were enabled to use the use case that we wanted. How cool is that! Not possible without having access to the code.

## Tech Radar

The second example is very recent. As with many developers, my coworkers and I have found great value in the [ThoughtWorks Tech Radar](https://www.thoughtworks.com/radar). We wanted to implement our own tech radar that reflected the technologies that we used and thankfully ThoughtWorks hosts a version of the radar that you can customize. Much like the bitbucket plugin, this project got us 95% there; however, there were a few small features missing that we would have liked. In the end we chalked it up to, "Well at least we don't have to develop it ourselves," and moved on. That was until someone noticed that the radar linked to a github project, indeed this project was again an open source project. At this point you can assume the process. We were able to add the ability to hide specific blips as well as be able to have multiple versions of the radar in [one screen](https://github.com/kylec32/build-your-own-radar/commit/31bd082c25c20968e55bd8e56426147fedc50f92). 

In both of these cases adding the features we needed by reimplementing the project would have been extremely cost prohibitive. We would also have to entirely maintain the projects and would have to become experts in everything to accomplish, obviously this is not possible. The open source model made it possible to make these small changes and we reaped great benefits from this.

## The downside to open source contributions

There is a small downside to contributions to open source that needs to be kept in mind. If you make a change that is too specific to your use case, maybe the project maintainer doesn't want to take the project in that particular direction, or what have you, there is definitely a chance that you pull request won't be accepted. At this point instead of just being able to use the library, you now become your own maintainer. Granted you can still take upstream changes, however you now need to take a more active role in you open source use. 

## Get contributing

I know am still very early in my open source contribution lifespan. That being said I have learned, and been excited, by the power of open source. So if there is a change in a library you want to make or want to give back, give it a try. What's the worst that can happen? You learn something new? 