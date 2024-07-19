---json
{
  "title": "When NTP Interactions Go Wrong",
  "description": "A walkthrough of an issue with interactions with NTP that lead to vastly incorrect dates",
  "date": "2024-07-10",
  "hero_image": "./ConfusedClock.png",
  "tags": [
    "software development",
    "time",
    "Postmortem"
  ],
  "draft":true
}

---

In the complex software development environment that we are in there are countless layers of abstraction that we build upon. This is part of what enables development to be so productive in this day and age. This most often is useful. For the average developer to not have to worry about CPU registers, page size, TCP routes, etc allows focusing on what makes the software you are building different and useful. This is a good thing. That said, when abstractions we build upon don't meet the expectations that we have it can have significant impacts. One such expectation that we often just expect to be there is having an accurate clock on the machine. While we shouldn't expect all clocks within a distributed system to have identical clocks (although some modern advancements are making [this closer to a reality](https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/)) we do expect the clocks on our machines to be reasonably accurate. This is thanks to protocols such as NTP (Network Time Protocol) which is one of the earlier protocols in computing. 

### How NTP Works

NTP has gone through many revisions with its initial revision documented in [1985](https://datatracker.ietf.org/doc/html/rfc958) with the latest published revision at time of writing of [version 4](https://datatracker.ietf.org/doc/html/rfc5905) published in 2010. The work in NTP has not stopped either. Discussions have happened talking about a version 5 and other time synchronization protocols also exist today. On top of that there is also SNTP (Simple Network Time Protocol) which simplies the protocol by making a stateless version that is compatible with NTP servers. No matter the version of NTP the core concepts are the same so lets cover them at a high level.