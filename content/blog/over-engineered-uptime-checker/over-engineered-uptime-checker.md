---
title: How I Built an Overengineered Serverless Uptime Checker
description: Walk through of some of the design decisions around an service uptime tracker on AWS Lambda.
date: 2021-04-24
hero_image: ./overengineered-uptime-checker.avif
tags:
  - serverless
  - software development
  - AWS Lambda
  - architecture
---

Recently I was working on a project where we were working with a third party in order to process different Office files. This third-party had both a production tenant as well as a development tenant as can be common with these types of integrations. The development tenant was much less stable than the production tenant and, at least it felt like, it would go down quite often. At this point it was just a gut feel from our interactions on and off with the service so we wanted to quantify it. As we considered ways we could check whether the service was down or not there was no real way to simply call the service to see if it responded or not because it would go down in a far more complex manner than that, basically it would just stop processing files correctly. All we had left was a spreadsheet that the service provider would update when their services were up or down. They had an automated process behind updating this spreadsheet so this seemed to be the best option.

Below is an example of what this spreadsheet looks like.

{% image "./exampleUptimeSpreadsheet.png", "Example spreadsheet with three columns, application, status, and last updated. There are five rows: excel, powerpoint, validator, word, visio" %}

At this point we needed to consider our options of how to read the data out of the spreadsheet.

Our first stop was looking at [Microsoft Graph](https://docs.microsoft.com/en-us/graph/overview). This seemed like a good bet as it seemed like a way to call into a well documented API and easily get our data out. Unfortunately, it turned out that since we didn’t own the document we were unable to use the Microsoft Graph APIs.

Our next idea was using some type of screen scraping libraries to parse the HTML. The online spreadsheet is also a very Javascript heavy application so that does make screen scraping more difficult with some tools. While this can work very well in some cases we decided that the markup was too complex to go this direction. This doesn’t mean this couldn’t work and someone more experienced with using these types of techniques could have made this work more effectively.

So the APIs weren’t there and the screen scraping seemed overly complex, what were we left with? We decided to come up with a crazy idea. What we ended up with is a different level of screen scraping but it ended up being pretty fun to build.

I have had some fairly good experiences with [puppeteer](https://developers.google.com/web/tools/puppeteer/get-started) which is a Node.js library that allows control of a headless Chrome browser. With headless Chrome we don’t have to worry about not being able to run the Javascript because of course that is what Chrome does well. Our first step was to use puppetter to take a screenshot of the status page. This worked great locally and puppetter makes this extremely easy. Our ultimate goal for this tool was to deploy it to AWS Lambda so that was our next step. The simplicity of scheduling it to run and the hands-off nature of it was very appealing. This caused a problem because puppeteer ships with a native chromium browser to use. When you ship your executable to Lambda it will likely be runing on a different OS than your local machine (unless you are running Amazon Linux 2 locally, if you do, let me know because that is interesting). Thankfully, when you run into these types of issues; espcially if you are using popular tools, is to look out in the community and see if anyone has bundled an AWS Lambda compatible version of your native binary. In this case there were a couple different options of how to handle it. We settled on a dependency called `chrome-aws-lambda` that handled getting the right binary. So the start of our code looked something like:

```javascript
'use strict';
const chromium = require('chrome-aws-lambda');
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
module.exports.gatherdata = async event => {
  const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
  const page = await browser.newPage();
  console.log("Let's go to the page");
  await page.goto(process.env.STATUS_URL);
  console.log("Let's wait for the UI");
  await delay(15000);
  console.log("And now for the screenshot");
  await page.screenshot({path: '/tmp/example.png'});
  await browser.close();
  // ...
}
```

Pretty straightforward, thanks Puppeteer! Also of note is when running in Lambda the only writable disk location you have is the `/tmp/` folder (Up to [500 MB](https://aws.amazon.com/lambda/faqs/), plenty for our needs.)

Our next step was, in order to facilitate debugging, we decided to store the screenshots off to S3. This was nothing fancy but later we did add on top of this a [lifecycle policy](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html) to automtically delete older versions because it can start to add up.

Next we had to figure out how to make sense of this screenshot we had just taken. We looked at a few options but ended up deciding to go with a [Javascript](https://tesseract.projectnaptha.com/) implemention of the [Tesseract OCR project by Google](https://opensource.google/projects/tesseract). The pure Javascript implementation made us feel like it would be easier to get running in Lambda and it wasn’t a very high load we were putting on it so it seemed like a good trade off. We didn’t completely avoid dealing with Lambda-isms here though because at runtime Tesseract downloads language files to parse each language which, with a read-only filesystem, wasn’t going to work. Again the community came to the rescue with [aws-lambda-tesseract](https://www.npmjs.com/package/@shelf/aws-lambda-tesseract). This library took care of that problem for us. So now our code included something along the following:

```javascript
let lines = (await getTextFromImage('/tmp/example.png')).split('\n');
```

It really was that easy to get the text from the image. Can I just take a moment to reflect on what a cool time we are in where this impressive techology has been democratized to the point where you can so simply incorporate this awesome tooling.

The final step was to finish the parsing (normalizing case, removing garbage lines found by the OCR, etc.) At this point we stored the values in DynamoDB. There are definitely other DB engines that are better suited to storing this type of data but we were looking to reduce operational overhead and cost to the extreme so it fit our needs pretty well.

As you dig into using DynamoDB one of the things you learn is that you need to know your query patterns when modelling how data is being put into the system. For this particular use case our two main use cases were, tell me my the most recent status, and retrieve the average uptime percentage over the last N days. This query pattern was a little more difficult of a query pattern to support on DynamoDB but we ended up with a solution that was good enough (definitely not the most efficient though). We also used DynamoDB’s automatic expiration mechanism which was a convienent way to automatically prune our DB to a max size and worked great in tandem with the S3 lifecycle policy.

We wrote a few REST endpoints behind API Gateway to retrieve the data and just left the data as JSON as it was going to be consumed by developers and tools so that worked fine. Also for automatic running we set up CloudWatch Events to trigger ever few minutes so the updating of the data was automatic.

At that point we had all the pieces. We could navigate to the status page and take a screenshot via Pupetteer, store it in S3, analyze it with Tesseract, store the results in DynamoDB, provide it via a REST endpoint via API Gateway, and schedule it via CloudWatch events.

The main app was built in an afternoon and polished off over the next few days between other events. It really accellerates development when you can build on top of powerful tools.

So did it work? Actually yes, it worked quite well. This tool helped the conversations with our third party provider about their availablity, allowed us to determine if the service was up in the middle of the night when our tests would fail and we could determine if the service was up and it was our problem or the service was down and not our problem, and other items. It definitely had its own flakiness but was much more stable than the original status page and provided the basic reporting we needed. The need for this tool didn’t last forever and ended up being a throw-away tool and served us well while it was needed.

What would I change in the future? I think the DynamoDB data model could be optimized. I think deeper analysis of whether “traditional” screen scraping could be used would be a worthwhile effort. Finally an overall refactor of the code is definitely warrented.

Overall this was a fun project, it ended up with working software which is the goal. Putting all the techinology to the side, from start to finish we quickly went from problem to having a solution and that is the main goal. If you want to check it out deeper here is the [repository](https://github.com/kylec32/status-checker).