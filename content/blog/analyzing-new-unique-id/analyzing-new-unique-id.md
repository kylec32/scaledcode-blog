---
title: Analyzing New Unique Identifier Formats (UUIDv6, UUIDv7, and UUIDv8)
description: A dive into the new proposed UUID versions. What do they offer and how do they work.
date: 2022-08-03
hero_image: ./analyzing-new-id.jpg
tags:
  - identifier
  - software development
  - algorithms
  - architecture
  - database
  - specification
---

I have [written before](https://blog.scaledcode.com/blog/wild-world-unique-id/) about UUIDs and other unique identifiers. As a reminder UUIDs are 128-bit identifiers that strive for unique identifier generation without requiring the generation to be done in a centralized location. The specification for UUIDs was written in 2005 and is defined in [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122). This specification has served the industry fairly well. Even so there have been many other mechanisms for generating unique identifiers to try to make up for the shortcomings of the original specification. Some of these shortcomings are the following:

* Poor index locality of non-time-based UUIDs (such as v4) due to new IDs not being related to previously generated ids. This leads to negative performance impacts when using many common indexing data structures.
* UUIDv1 use of a 100-nanosecond epoch is a unique and difficult to work with timestamp in many systems.
* To time order ids introspection and parsing are required. (This is related to point 1).
* UUIDv1 makes use of MAC addresses for part of its identifier. This leads to privacy and security concerns as well as, with the advent of virtual machines and containers, uniqueness is no longer guaranteed.
* RFC4122 doesn’t detail the difference in requirements between the generation and storage of UUIDs which often are different.

After reviewing 16 different community ID generation algorithms, the working group created [this draft IETF document](https://www.ietf.org/id/draft-peabody-dispatch-new-uuid-format-04.html). It should be noted this is just a draft document that expires on December 25, 2022. There is a likelihood that there will be differences between the specification at the time of writing this post and what is finally accepted but it is still instructive to review (there have already been a handful of revisions of this document in the month since the draft was initially released).

Four new UUID specifications are defined:

* UUID Version 6 (UUIDv6) — A simple reordering of the bits within a UUIDv1 to allow it to be sorted as an opaque sequence of bytes.
* UUID Version 7 (UUIDv7) — A new time-based UUID bit layout based on the Unix Epoch timestamp already widely used in the industry.
* UUID Version 8 (UUIDv8) — A free-form format whose only requirement is to keep backward compatibility.
* Max UUID — A specialty UUID that acts as the inverse of the Nil UUID put forth in RFC 4122

Let’s go through some details of each of these.

### UUIDv6

The expected use case for UUIDv6 is as a drop-in replacement for UUIDv1 which offers improved DB locality. If you don’t have the requirement to keep compatibility with UUIDv1 the suggestion is to use UUIDv7 instead. The only real difference between UUIDv6 and UUIDv1 is the order of the timestamp bits. Starting with the 60-bit timestamp, the first 48 bits of the timestamp come first in the UUID (the specification splits this between `time_high`, and `time_mid` likely to keep the same terms as RFC 4122). The next 4 bits contain the version (0110 in this case for v6) and then the final 12 bits of the timestamp can be found. This leads to the following difference:

UUIDv1

```
0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                          time_low                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       time_mid                |         time_hi_and_version   |
```

UUIDv6

```
0                   1                   2                   3
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           time_high                           |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           time_mid            |      time_low_and_version     |
```

The rest of the UUID generation is the same as UUIDv1 although there is a comment in the draft specification to encourage the usage of a pseudo-random value in place of the old MAC address behavior specified in the original specification. That said, the [MAC address-based](https://rfc-editor.org/rfc/rfc4122#section-4.1.6) behavior is still allowed.

### UUIDv7

This is the new encouraged UUID method to be used. For its timestamp, instead of using a timestamp as a count of 100-nanosecond intervals since 00:000:00.00 on 15 October 1582, it uses the much more standard Unix epoch as its source which counts the number of milliseconds seconds since midnight 1 Jan 1970 UTC, leap seconds excluded.

Taking this into account the format is pretty straightforward. The first 48 bits are a big-endian unsigned number of milliseconds since the Unix epoch. The next four bits are the version bits (0111), followed by 12 bits of pseudo-random data. Next, we have the two-bit variant and finally another 62 bits of pseudo-random data.

### UUIDv8

I see UUIDv8 as a sibling to UUIDv4. Both UUIDv8 and UUIDv4 only specify that the version and variant bits are in their correct location. The difference is that UUIDv4 specifies that the remaining 122 bits be pseudo-randomly generated. UUIDv8 suggests that the generated value still be time-based however the implementation details of how that generation happens are up to the implementor. This means we have 48 bits of custom implementation, four bits for the version (1000), 12 more bits of custom implementation, two bits for the variant, and finally 62 bits as the implementation sees fit. This leaves a lot open to the implementor but it has enough rules around it that it can coexist in the existing UUID environment.

### Max UUID

The max UUID ID seems to be a bit of an oversight from RFC 4122 as it is simply the inverse of the nil UUID defined therein. Whereas the nil UUID is 128 bits of 0, the max UUID is 128 bits of 1.

---


With the formal definitions out of the way, the specification then moves on to describing items of consideration for implementors of these algorithms. I’ll mention some of the most interesting/important in my opinion.

**Timestamp Reliability**: The timestamps used in these algorithms are very important and so is the fact that they are ever-increasing. If the source of the timestamp can move backward, care needs to be taken to make sure that the values are ever-increasing. Techniques for this are discussed further in the document.

**Timestamp Source**: Gregorian (v1 and v6) and Unix (v7) epochs are called out in the specification. If a different epoch is desired to be used UUIDv8 should be leveraged.

**Timestamp Precision**: UUIDv1 and UUIDv6 specify a timestamp granularity of 100 nanoseconds. UUIDv7 specifies a millisecond precision. If a different precision is required UUIDv8 should be utilized.

**Timestamp Accuracy**: The specification makes no guarantee how close the clock value and the actual time need to be. This enables implementors to account for security concerns, leap seconds, and inaccurate clocks in their own way.

**Timestamp Padding/Truncating**: When padding is required (for example with a 32-bit timestamp that is going to fill the 48-bit spot in a UUIDv7) the most significant (left-most) bits should be padded with zeros. Similarly, if a timestamp is to be truncated (for example a 64-bit timestamp to be used in the 48-bit spot of a UUIDv7) the least significant (right-most) bits are to be truncated.

### Monotonicity

Monotonicity, or the attribute of always increasing, is the backbone of time-based UUID generation. The time-based nature of these UUIDs gives them the general attribute of monotonicity because time keeps moving forward. That said, if for example, more than one UUID must be generated for a particular timestamp (for example within a particular millisecond with UUIDv7) additional logic should be introduced to make sure the UUIDs are ever increasing. There are a few techniques that can be leveraged if multiple IDs need to be generated for a particular timestamp.

**Fixed-length Counter:**

This technique sets aside a fixed number of bits for the express purpose of facilitating a counter of IDs generated within a particular timestamp. The position of the counter bits in the UUID should directly follow the timestamp bits to facilitate correct sorting. How many bits should be allocated to the counter should be determined by how many IDs may be generated during a particular timestamp. The precision of the timestamp should also be considered. For example, the size of the counter would need to be larger with a millisecond precision than with a nanosecond precision timestamp. The specification suggests that a counter should be at least 12 bits but no more than 42 bits long. Having too big of a counter would remove much of the unguessability from the UUID’s generation. The counter should be initialized to a random value on each timestamp tick. A particular concern of this method is overflow if the number of bits allocated to the counter is insufficient. To attempt to avoid rollover issues implementations may consider only randomly initializing a portion of the counter using the right-most bits. For example, with a 23-bit counter only initializing the right-most 22 bits and padding the left with a zero can help ensure there are at least 4,194,304 values available for the counter.

**Monotonic Random:**

Another technique is to use the random bits as a counter. The way this works is to generate a new random for each timestamp tick and then for each UUID generated for a particular tick the random value is incremented. The increment value should be a random integer greater than zero. The increment should be random to allow a level of unguessableness. If guessability is not a concern you may choose to make the increment value one.

**Counter Rollover Handling**

Even after taking the precautions above, counter rollovers are still possible. As such, implementations should detect when they are about to roll over and instead pause UUID generation until the next timestamp tick.

**Monotonicity Verification**

Even outside of rollovers, each generated UUID should be checked that it is greater than the previously generated UUID. If it is not it could be due to clock rollbacks, leap seconds, or counter rollover as discussed above. In such a case the application should take appropriate action to make sure the next generated UUID is greater than the previous one. This may be done by using the previous timestamp and simply incrementing the counter again, freezing until the timestamp catches back up, or another technique that preserves monotonicity.

### Distributed UUID Generation

While the randomness inherent in these UUID generation mechanisms provides a reasonable level of uniqueness between different nodes generating identifiers that will be stored in a central location, there may be a desire to take further action to avoid collisions. One method would be to check each ID with a central repository before use, this works but does negate much of the benefit of using a UUID. Another mechanism may be to assign each node generating IDs a unique identifier. This identifier would be part of the generated ID and thus would act in such a way to provide each node its own bit space. Where this node identifier shows up in the generated ID is up to the implementor however make sure that the generated IDs are still time ordered. Custom UUID generation schemes that use node identifiers as part of their design should leverage UUIDv8. When deciding how much effort should be expended trying to ensure uniqueness consider the implications of a duplicate generated ID. If the effects are low and acceptable it may be reasonable to put minimal to no additional effort into solving distributed UUID generation issues. If the costs and risk are high, then the additional effort in ensuring uniqueness may be well worth the effort and should be taken. As with all software engineering, trade-offs are ever-present.


### Final Thoughts

The specification ends with a few final thoughts. The first is that these UUIDs can provide local uniqueness guarantees. If a wider level of uniqueness guarantees are required, some sort of shared repository of generated UUIDs is required. It then goes on to remind implementors to use cryptographically secure pseudo-random number generators and to make sure they are seeded correctly. This is the root of what enables the “unguessability” of the generated UUIDs. UUIDs should be treated as opaque bytes by their consumers and their consumers should not examine the bits as much as possible. Even so, if UUIDv6 or UUIDv7 is used, consumers should sort UUIDs as opaque bytes. The textual representation of these UUIDs should also be [Lexicographically](https://www.merriam-webster.com/dictionary/lexicographical) sortable. UUIDs generated with this specification are created with big-endian byte order, if a little-endian byte order is required for any reason UUIDv8 should be utilized. When using a UUID as a column in a database, its byte representation should be used, not its textual representation. By using the byte representation you save 40 bytes per UUID. There could be an argument made; however, if the textual representation is to always be used by the consumer of the data it may be worth storing the data in its textual form taking the speed improvement over the space savings. Finally, the specification dives briefly into security concerns with UUIDs. It once again encourages implementors not to use MAC addresses as part of UUIDs but instead use cryptographically secure random numbers. The timestamps embedded in the UUID do give consumers of the UUIDs a small level of information about the generation of the UUID and give it ordering information. If exposing that information is unacceptable UUIDv4 should be utilized.

I find the thought process and methods used in developing these specifications very interesting. A lot of care is taken in trying to get these specifications right from the beginning. I am also intrigued with how small changes to the original specifications can lead to significant changes to the results. Time will tell if additional changes will be made to this specification before it is accepted and how well these new identifier types will take off but I am always a fan of having additional tools in the toolbelt.