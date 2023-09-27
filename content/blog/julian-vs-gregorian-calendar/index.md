---
title: Understanding The History of Dates and Years Through the Julian and Gregorian Calendars
description: The interesting history of the Julian and Gregorian calendars and how it can affect developers in their work.
date: 2022-09-12
hero_image: ./calendar-hero.jpg
tags:
  - software development
  - time
  - edge cases
---

The natural world has only given us two units of time determined by the cosmos, that is the year and the day. Months, hours, minutes, and seconds are all human inventions that have no basis in the natural world. Days and years are not this way though. A day, of course, is one complete rotation of the earth and a year is one rotation around the sun. The unfortunate part about this is that these two time periods are not actually related and don't fit within each other cleanly. Our current year takes 365 days, 6 hours, 9 minutes, and 10 seconds. We often simplify this to 365 1/4 days.

So what is the problem with ignoring that last 1/4 of a day? It would simplify things if we didn't have to worry about it. The problem comes in the expected relationship between the time of the year and the season. If we didn't account for that additional 1/4 day we would end up changing when seasons happened within a year before too long. The solution also isn't likely to just have a partial day and change days at a time other than midnight. The solution the world has landed on is to create a new whole day every few years. There is, however, no universal system for doing this and it wasn't always the case.

### The History

One of the early "modern" calendars was from the Roman empire where the year had 355 days, substantially less than needed to keep in sync with the seasons. To counteract this every few years a whole new month with 22 to 23 days would be added. There was no specific time this would occur but was determined by the reigning politicians. It never is a good idea to make a potential political advantage or weapon how the seasons are kept in sync. Because of this in 46 BCE Julius Caesar decided to come up with a new calendar (I would assume with the help of others). This calendar would have the nearest whole number of days in each year, 365, and the extra fourth would be accumulated and added every fourth year. This sounds extremely similar to our current calendar with a few slight adjustments as you will see. To get everything back in line the year 46 BCE had 445 days with an additional three months added to that year. This calendar was called the Julian Calendar.

The Julian Calendar served the world fairly well for some time but it did have the slight problem of not taking into account the few minute difference between a real year and the 365 1/4 accounted for in the Julian Calendar. A few-minute difference is not a big deal in that you only drift a day every 128 years but multiply this by a millennium and it starts to add up. This caused problems for the Christian religion in that they had specified their Easter celebration to happen in spring and the spread between actual spring and the holiday was spreading by the 1500s. An interesting point of clarification about years is that there are two ways a year can be measured. A *tropical year* is determined by the change of the seasons and the *sidereal year* is determined by the actual completion of an orbit around the sun. The difference between these two measurements is about 20 minutes. As a world, we have decided that the tropical year is what we are wanting to track.

Taking into account the discrepancy between a tropical year and the Julian calendar year a change was made in the 1500s. This change was driven by Pope Gregory XIII and the details were figured out by an Italian doctor named Aloysius "Luigi" Lilius. This calendar is known as the Gregorian calendar. The idea that was leveraged was to handle leap days more carefully to keep things in sync. The pattern is what we know today. Every four years would be a leap year still unless the year was divisible by 100 and it was not divisible by 400. If the year is divisible by 400 it still counts as a leap year. This serves to remove three leap days every 400 years. This would now bring the average length of a year to 365.2425 days which is very close to the true tropical year length of 365.2422 days. This is mathematically superior to the Julian calendar but politics got in the way of adoption. Because this calendar was set forth by the Catholic church many countries did not adopt it immediately, most notably England and, by extension, its colonies. This caused a drift between countries which was made even worse because, to get things back in line, Pope Gregory decreed that October 4, 1582, would be followed by October 15, 1582. That is the power being pope affords you, being able to make 10 days just disappear.

As time went on and issues with differing calendars were experienced eventually the British Parliament decided to adopt the Gregorian calendar. This happened in 1752 and to catch up Britain decided that September 2, 1752, would be followed by September 14, 1752. Thus we see another jump in the calendar, this time 11 days. Britain was not the last country to make the switch either, Russia didn't make the switch until 1918 and North Korea still doesn't use the Gregorian calendar officially.

Even for all of its benefits, the Gregorian calendar is not perfect and still includes some drift. Every 3,213 years we will drift another day in the year. Unsurprisingly people don't seem too worried about this though.

### How Should Developers Deal With These Calendars

The messiest case when dealing with calendars is having to deal with the conversion between calendars. Thankfully I don't think many have to deal with this issue because most of these conversions happened hundreds of years ago. Even so, depending on the business requirements you are building against, it may be required to do this conversion. To correctly do this conversion you would need to know what country you are dealing with. For example. To an English person, there were 365 days between February 28, 1917, and February 28, 1918. This would not be the case for a Russian. This is ignoring all the other calendaring systems in the world as well, depending on the software you are building you may need to handle multiple of these systems. In the core Java libraries for example there is code for the Gregorian calendar, the Julian calendar, the Japanese Imperial calendar, and the Buddhist calendar.

While dates and the number of days in a year may feel like a constant they are not. Dig into your problem domains and understand how different calendars can affect them. If you need to convert between calendars there are algorithms out there that can assist you. That said you may need to bring additional information such as the location of the reader of the data to produce the correct result. Much as it has become standard to always store dates and times in UTC I would suggest only storing dates in the Gregorian calendar and converting as needed.

Have you ever had to deal with different calendaring systems in your works? What was the use case? I would love to understand more about what led to it. I hope you found the history of the Gregorian calendar useful and that it helped you understand more of how we got here.