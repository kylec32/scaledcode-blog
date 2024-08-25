---json
{
  "title": "When NTP Interactions Go Wrong",
  "description": "A walkthrough of an issue with interactions with NTP that lead to vastly incorrect dates",
  "date": "2024-07-10",
  "hero_image": "./ConfusedClock.png",
  "tags": [
    "software development",
    "time",
    "Postmortem",
    "debugging"
  ]
}

---

In the complex software development environment that we are in there are countless layers of abstraction that we build upon. This is part of what enables development to be so productive in this day and age. Most of the time this is helpful. For the average developer to not have to worry about CPU registers, page size, TCP routes, etc allows focusing on what makes the software you build different and useful. This is a good thing. That said, when abstractions we build upon don't meet the expectations that we have it can have significant impacts. One such expectation that we often expect to be there is having an accurate clock on the machine. While we shouldn't expect all clocks within a distributed system to have identical clocks (although some modern advancements are making [this closer to a reality](https://aws.amazon.com/blogs/compute/its-about-time-microsecond-accurate-clocks-on-amazon-ec2-instances/)) we do expect the clocks on our machines to be reasonably accurate. This is thanks to protocols such as NTP (Network Time Protocol) which is one of the earlier protocols in computing. 

### How NTP Works

NTP has gone through many revisions throughout its life with its initial revision documented in [1985](https://datatracker.ietf.org/doc/html/rfc958) and its revision at the time of writing of [version 4](https://datatracker.ietf.org/doc/html/rfc5905) published in 2010. The work in NTP has not stopped either. Discussions have happened referring to version 5 and other time synchronization protocols also exist today. On top of that, there is also SNTP (Simple Network Time Protocol) which simplifies the protocol by making a stateless version that is compatible with NTP servers. No matter the version of NTP the core concepts are the same so let's cover them at a high level.

NTP (as well as SNTP which is more what is the focus of this article) operates over UDP with the server listening on port 123. Because it utilizes UDP it doesn't handle retry or retransmissions automatically nor does it need to. NTP is largely a stateless protocol on the client side (and is completely stateless when using SNTP) and the servers need no state about the clients other than what is sent in the request. NTP timestamps are 64-bit fixed point numbers in seconds since 1/1/1900 0:00:00 UTC. The integer part is the first 32 bits and the fractional part is the latter 32 bits. The lower-order fractional bits give an increment of 0.2 nanoseconds. When a timestamp is not available like right after startup all the bits are marked as 0 to indicate it is an invalid timestamp. In addition to the timestamp data bits, there are a couple of other data fields used in the protocol.

_Leap Indicator_

This is a two-bit field indicating whether there is an impending additional second or removal of a second to compensate for the mismatch between clocks and the earth's rotation. The indicator can have the following values:

* `0` = No Warning
* `1` = Last minute of the day has 61 seconds
* `2` = Last minute of the day has 59 seconds
* `3` = Clock is unsynchronized (the time should not be used)

_Version Number_

A 3-bit integer to indicate the NTP version in use, currently the modern standard is version 4.

_Mode_

A 3-bit integer to indicate the mode of NTP that it is running in. The following modes are defined.

* `0` - Reserved
* `1` - Symmetric Active
* `2` - Symmetric Passive
* `3` - Client
* `4` - Server
* `5` - Broadcast
* `6` - NTP control message
* `7` - Reserved for private use.

_Stratum_ 

An 8-bit integer indicates how many layers down from a primary time source the responding server is. The following defined stratum exists in the specification.

 * `0` - Unspecified or Invalid
 * `1` - Primary server (e.g equipped with GPS or atomic clock)
 * `2-15` - Secondary server
 * `16` - Unsynchronized
 * `17-255` - Reserved

 _Poll_

 An 8-bit signed integer representing the maximum interval between successive messages in log2 seconds.

 _Precision_

 An 8-bit signed integer representing the precision of the clock in log2 seconds. For instance, a value of -18 corresponds to a precision of about one millisecond.

 _Reference ID_

 A 32-bit code detailing the particular server, reference clock, or `kiss code` depending on the state of the stratum field in the packet. For a stratum value of 0, this value is the `kiss code` for the packet, these will be discussed further below. For stratum values of 1, this is a four-octet, left-justified, zero-padded ASCII string assigned to the reference clock. IANA maintains the official list of what values are valid here but any value that starts with an `X` is reserved for unregistered experimentation. For stratum 2 and above (secondary servers and clients) this value is the reference identifier of the server which it received its information from.

 _Reference Timestamp_

 The time when the system clock was last set or corrected, in NTP timestamp format.

 _Origin Timestamp_

 Time at the client when the request departed the server, in NTP timestamp format.

 _Receive Timestamp_

 Time at the server when the request arrived from the client, in NTP timestamp format.

 _Transmit Timestamp_
 
 Time at the server when the response was sent to the client, in NTP timestamp format.

_Note_

There is no `Destination Timestamp` field in the header as that is calculated and stored in the client upon receipt of the packet at the earliest available moment.

### Kiss-o'-Death Packets

When the _Stratum_ field is 0 that indicates an error condition and the _Reference ID_ field is used to convey the reason for the kiss-o'-death (KoD) packet, these values are called `kiss codes`. These different kiss codes can provide useful information to an intelligent client so they can take the appropriate response. The codes are encoded in four-character ASCII strings that are left justified. There are various kiss codes and a full list of them can be found in the specification but some particularly useful kiss codes are the following:

* `DENY` and `RSTR` - Indicate the client must disconnect from that server and stop sending packets to it.
* `RATE` - Indicates the client must immediately reduce its polling interval and continue to reduce the interval as the client receives more and more `RATE` kiss codes.
* If the kiss code starts with an `X` that means the kiss code is experimental and must be ignored if not recognized.

### Walkthrough

{% image "https://www.plantuml.com/plantuml/png/hP6zRiCm38HtFWMHlKD-9Wz5WEv5q6JCGjXiGy2Y3UhYv--FKLL6WmvjDv8wwhkJzXaIkAQUBYgT1Z-U3do8eTMSYKO9M6kZE7ZrVlBGcpfMB9aTuznzLnqr9erFrTmHIGkR15fjbehlxh-a3GzXB-OCIveXQMmOwxE7jcgJLkEp8yHpCbH3yW7AlJwZuQCwMC2dTOKlbahrIpnZyuE3jqikQFXfNki-R6oMp9B_xqni5zGIV4kTteXUoFzkuxPwL__Auabsj5Vlhgb_1G00", "Sequence Diagram of Simple NTP Interactions" %}

The above diagram shows a simple example of the flow of data in the protocol, as you can see, not all fields are populated off the bat, instead, throughout the process it is filling in more and more information until at the end it has all the data it needs to calculate. The four timestamps collected are then used to compute the offset of the client from the server. Then to get the offset from there we can calculate using the following formula:

`Offset = 1/2 * ((T2-T1) + (T3-T4))`

This formula and the size of the data elements mean that the client must have an initial time set within 34 of the time server for this algorithm to work.

The roundtrip delay can also be calculated using the following formula:

`delay = (T4 - T1) - (T3 - T2)`

### The Incident

That was a lot of background to cover this incident but, even without worrying about this incident, it can be useful to know the basics of how NTP works. The software in question is a fork of a project created in the early 2000's which had a built-in NTP client implementation. The default time server that was used was `pool.ntp.org` which is a large, global virtual cluster of time servers that are open to the public. Having a NTP client built into an application like this in 2024 is odd as we have great time synchronization systems built into our operating systems at this point. Since it had never been a problem no one worried too much about it. It "just worked" so why worry about it? This was not correct and we should have used our understanding of "every line of code is a liability" here instead. 

#### The NTP Client

The NTP client that was written was the simplest SNTP client you could write. It ignored much of the specification and simply took the happy path workflow and implemented that. As often is the case, the happy path was the most common case and we went years if not over a decade with this code with no one detecting any issues with its non-happy path processing or noticing if/when it hit one of those non-happy path cases.

#### The Non-Happy Path

One part of the specification not implemented was considering the value of the `stratum` when receiving a response. As noted above a `stratum` value of `0` indicates that the response should be discarded and the `Reference ID` field should be considered for more information. What the implementation would do instead is simply process the returned values as if they had been a valid response. 

#### The Incident Begins

The details of what broke are not of importance but suffice it to say many metrics within the application started to report wild things. We quickly whittled down the problem to an invalid date being returned when we asked for the current time in the application. Instead of reporting the correct time it would report a time shortly after `1/1/1900`. This was a problem and we quickly became suspect of this custom NTP implementation but we weren't sure what the actual problem was. We reviewed the code carefully but couldn't see a problem with the implementation (we did not know much about the NTP protocol so we were unaware of all of the missing cases that should have been handled). 

We initially thought that `pool.ntp.org` may have been hacked as navigating to it in our web browsers would occasionally return a Rick Roll. This quickly was determined to not be the case by checking in various developer communities and seeing this was not a common issue plus realizing that NTP ran over port 123 and used UDP versus port 80/443 and TCP that was used when we were using our browsers.

Still confused about what could be happening, and especially confused that we were so neatly being reset to `1/1/1900` we were rather confused. We did determine that if the NTP server was inaccessible the code would fall back to using the server's time. We took over responding to DNS requests for pool.ntp.org and responded with an unroutable IP address. This stopped the immediate bleeding.

While handling the immediate problems one member of the team extracted the custom NTP client code from the project and modified it to continuously poll different NTP servers that were routable behind `pool.ntp.org` (remember this is a virtual cluster where anyone can host a server) so there were over 4,500 different servers that could be responding. Then looking at the results he would output any that gave confusing values with huge offsets. 

Hours after starting this process of exhaustively testing each possible backend server we started to get responses with huge offsets being reported. But why? We then repeatedly queried that exact server with a command line NTP client (sntp -d ip_address) to gain more information and this is what we saw:

```
sntp: Exchange failed: Kiss of death
sntp_exchange {
        result: 8 (Kiss of death)
        header: 24 (li:0 vn:4 mode:4)
       stratum: 00 (0)
          poll: 00 (1)
     precision: 00 (1.000000e+00)
         delay: 0000.0000 (0.000000000)
    dispersion: 0000.0000 (0.000000000)
           ref: 52415445 ("RATE")
         t_ref: 00000000.00000000 (0.000000000)
            t1: EA2D80EB.81305964 (3928850667.504643999)
            t2: 00000000.00000000 (0.000000000)
            t3: 00000000.00000000 (0.000000000)
            t4: EA2D80EB.9211A975 (3928850667.570581999)
        offset: FFFFFFFF15D27F14.765EFE9380000000 (-3928850667.537612915)
         delay: 0000000000000000.10E1501100000000 (0.065938000)
          mean: 0000000000000000.0000000000000000 (0.000000000)
         error: 0000000000000000.0000000000000000 (0.000000000)
          addr: ip address
}
```

Seeing this information we now learned about Kiss of Death packets. Sure enough, as detailed above, the `stratum` was 0, the `ref` (Reference ID) was `RATE`, and t2 and t3 were not given values which upon further research we learned is yet an additional way to communicate to clients that the packet should not be trusted.

Because the `stratum` and `Reference ID` fields were never considered it simply used the `t2` and `t3` like they were valid which had the effect of basically taking the system time back to the beginning of the NTP timestamp space (as NTP timestamps start at 1/1/1900).

With this knowledge in hand, we had an understanding of what the problem was and how to fix it (and that our temporary fix would indeed prevent the issue from happening). We removed the NTP client implementation from the project and made it always use the system time. With this change, we simplified our code and made it more robust so it was a win-win even though it was painful to get there. 

#### Why did this start happening all of a sudden?

We did find a small amount of evidence that supported that this issue had occurred in very isolated cases in the past but when the incident came up it was happening all over so the reasonable question was asked, why now? Unfortunately, we don't know the answer. Potentially there was a new group of servers brought online to pool.ntp.org that couldn't handle the load they were given and so they started responding with RATE limit errors. Maybe some new or existing time servers decided to chaos test everyone that used them to make sure everyone's client implementation could handle the legitimate non-happy path responses (we couldn't). We still weren't sure but we did learn that it wasn't just our group that was affected but there later were more and more reports of this issue happening with this open source project. I am proud of the team I worked with and that we were able to detect, diagnose, and recover from the issue before many in the community had even found out it was a problem and we were able to offer a warning as well as a suggested way forward to the community at large.

### Lessons learned

It is easy to take advantage of the products and technologies you build your solutions on top of. That is OK most of the time, if we had to reimplement the whole stack from top to bottom each time we took on a project we would never get anywhere. Even so, understanding [how the system works](https://blog.scaledcode.com/blog/mechanical-sympathy-in-software-dev/) and where it can break is always worth its time in my opinion. We re-learned that every line of code is a liability. If you don't think some code is providing value, remove it, at best it was causing no benefit and no issues but at worst it is providing no positive impact but was providing a negative impact. This incident was also a great exercise of the various debugging techniques we have available to us not all issues can be debugged using the same technique so having several methods at your disposal is extremely helpful.

### Additional Resources

To further test this issue I wrote an extremely simple NTP server that always responds with a rate limit response. The code for that NTP server is hosted [here.](https://github.com/kylec32/RateLimitedNtp)
