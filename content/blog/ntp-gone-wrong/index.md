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

In the complex software development environment that we are in there are countless layers of abstraction that we build upon. This is part of what enables development to be so productive in this day and age. This most often is useful. For the average developer to not have to worry about CPU registers, page size, TCP routes, etc allows focusing on what makes the software you are building different and useful. This is a good thing. That said, when abstractions we build upon don't meet the expectations that we have it can have significant impacts. One such expectation that we often just expect to be there is time tracking. 