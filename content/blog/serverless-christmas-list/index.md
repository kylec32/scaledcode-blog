---json
{
  "title": "A Serverless Christmas List",
  "description": "Experience building an (almost) completely serverless application and lessons learned.",
  "date": "2017-12-05",
  "tags": [
    "serverless",
    "side-project"
  ]
}
---

A technology that I have been extremely intrigued with lately is [serverless](https://en.wikipedia.org/wiki/Serverless_computing).  With the architecture team at work severless technology has come up a few times particularly [AWS Lambda](https://aws.amazon.com/lambda/). The idea intrigued us and we wanted to leverage it at some point but weren't sure when we would be available. Well it wasn't too long after that, that we had the opportunity to leverage it on a very isolated integration that a different department was looking to implement. It was a pretty simple data migration type of use-case but worked well in the situation we were using it. After implementing this solution severless just intrigued me more and more. 

I love working on side projects but I often get disinterested and don't complete them. I wanted a project that I could real ly sink my teeth in that I would finish by having a deadline. That's when the idea came to me. Every year my family trades names leading up to Christmas and we buy presents for each other. Usually we will just post gift ideas to a Google Doc and call it good. The problem that we have experienced in years past, particularly juggling my family and the in-laws, is that duplicate presents get purchased. Gift registries help counteract this problem however the problem for me is that the gift requester can see what is purchased and therefore all the surprise is gone. So this seemed like a simple enough [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) type application that I could try out some new technologies on. 

So I set out to create the application. I initially wanted to develop the front end as a [Elm](http://elm-lang.org/) frontend as the [Elm architecture](https://guide.elm-lang.org/architecture/) intrigues me; however, due to the time constraints I decide to use a technology that I was more familiar with Angular. Turns out that there is a library called [NgRx](https://github.com/ngrx/store) that implements the [Flux](https://facebook.github.io/flux/) architecture which ripped off the Elm architecture so I still got experience with what I was after. The database was hosted as a [MySQL RDS](http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_MySQL.html) instance in AWS (the only truly non-severless component although that will be possible in the [future](https://aws.amazon.com/rds/aurora/serverless/)). Finally, all the business logic was hosted in Lambda using the [Serverless](https://serverless.com/)  framework. This was an awesome experience where I learned a lot and had a lot of fun building the product. 

Lessonss Learned: 
* Even though the Lambda function were developed in NodeJS which is one of the runtimes with the fastest startup time you can tell when you are hitting the application cold. 
* [API Gateway](https://aws.amazon.com/api-gateway/) is a pain in the rear to debug.
* [JWT](https://jwt.io/) is a simple and cool way to handle authentication in a stateless manner.

The code isn't extremely clean however please feel free to look at the code and hopefully you can learn something from what I have learned:

* [Frontend](https://github.com/kylec32/christmas-list-frontend)
* [Backend](https://github.com/kylec32/christmas-list-backend)