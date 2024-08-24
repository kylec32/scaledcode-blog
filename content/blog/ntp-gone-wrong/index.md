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

NTP (as well as SNTP which is actually more what is the focus on the article) operates over UDP with the server listening on port 123. Being UDP is doesn't handle retry or retransmissions automatically neither does it need to. NTP is largely a stateless protocol on the client side (and is completely stateless when using SNTP) and the servers need no state about the clients other than what is sent in the request. NTP timestamps are represented as 64 bit fixed point number in seconds since 1/1/1900 0:00:00 UTC. The integer part is the first 32 bits and the fractional part is the latter 32 bits. The lower-order fractional bits give an increment of 0.2 nanoseconds. When a timestamp is not available like right after startup all the bits are marked as 0 to indicate it is an invalid timestamp. In addition to the timestamp data bits there are a couple other data fields used in the protocol.

_Leap Indicator_

This is a two-bit field indicating whether there is an impending additional second or removal of a second to compensate for the a mismatch with clocks and the earth's rotation. The indicator can have the following values:

* `0` = No Warning
* `1` = Last minute of the day has 61 seconds
* `2` = Last minute of the day has 59 seconds
* `3` = Clock is unsynchronized (the time should not be used)

_Version Number_

A 3-bit integer indicating the NTP version in use, currently the modern standard is version 4.

_Mode_

A 3-bit integer indicating the mode of NTP that it is running in. The following modes are defined.

* `0` - Reserved
* `1` - Symmetric Active
* `2` - Symmetric Passive
* `3` - Client
* `4` - Server
* `5` - Broadcast
* `6` - NTP control message
* `7` - Reserved for private use.

_Stratum_ 

An 8-bit integer indicating how many layers down from a primary time source the responding server is. The following defined stratums exist in the specification.

 * `0` - Unspecified or Invalid
 * `1` - Primary server (e.g equipped with GPS or atomic clock)
 * `2-15` - Secondary server
 * `16` - Unsynchronized
 * `17-255` - Reserved

 _Poll_

 An 8-bit signed integer representing the maximum interval between successive messages in log2 seconds.

 _Precision_

 An 8-bit singed integrer representing the precision of the clock in log2 seconds. For instance, a value of -18 corresponds to a precision of about one milliseond.

 _Reference ID_

 A 32-bit code identifying the particular server, refence clock, or `kiss-code` depending on the state of the stratum field in the packet. For stratum value of 0 this value is the `kiss code` for the packet, these will be discussed further. For stratum values of 1 this is a four-octect, left-justified, zero-padded ASCII string assigned to the refence clock. IANA maintains the official list of what values are valid here but any value that starts with an `X` is reserved for unregistered experimentation. For stratum 2 and above (secondary servers and clients) this value is the refence identifier of the server which it received its information from.

 _Reference Timestamp_

 Time when the system clock was last set or corrected, in NTP timestamp format.

 _Origin Timestamp_

 Time at the client when the request departed the server, in NTP timestamp format.

 _Receive Timestamp_

 Time at the server when the request arrived from the client, in NTP timestamp format.

 _Transmit Timestamp_ Time at the server when the response left for the client, in NTP timestamp format.

_Note_

There is no `Destination Timestamp` field in the header as that is calculated and stored in the client upon receipt of the packet at the earliest available moment.

### Kiss-o'-Death Packets

When the _Stratum_ field is 0 that indicates and error condition and in this case the _Reference ID_ field is used to convey the reason for the the kiss-o'-death (KoD) packet and these values are called `kiss codes`. These different kiss code can provide useful information to intelligent client so they can take the appropriate response. The codes are encoded in four-character ASCII strings that are left justified. There are various kiss codes and a full list of them can be found in the specification but somf of particular use are the following:

* `DENY` and `RSTR` - Indicate the client must disconnect from that server and stop sending packets to it.
* `RATE` - Indicated the client must immediately reduce its polling interval and continue to reduce as it receives more and more `RATE` kiss codes.
* If the kiss code starts with an `X` that means the kiss code is experimental and must be ignored if not recognized.

### Walkthrough

{% image "https://www.plantuml.com/plantuml/png/hP6zRiCm38HtFWMHlKD-9Wz5WEv5q6JCGjXiGy2Y3UhYv--FKLL6WmvjDv8wwhkJzXaIkAQUBYgT1Z-U3do8eTMSYKO9M6kZE7ZrVlBGcpfMB9aTuznzLnqr9erFrTmHIGkR15fjbehlxh-a3GzXB-OCIveXQMmOwxE7jcgJLkEp8yHpCbH3yW7AlJwZuQCwMC2dTOKlbahrIpnZyuE3jqikQFXfNki-R6oMp9B_xqni5zGIV4kTteXUoFzkuxPwL__Auabsj5Vlhgb_1G00", "Sequence Diagram of Simple NTP Interactions" %}



