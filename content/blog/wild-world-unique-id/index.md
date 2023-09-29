---
title: The Wild World of Unique Identifiers (UUID, ULID, etc)
description: A whirlwind tour of different identifier generation algorithms and the benefits and downsides to them.
date: 2021-08-18
hero_image: ./wild-world-unique.jpg
tags:
  - identifier
  - software development
  - algorithms
  - architecture
---

Every once in a while as a developer you find yourself stepping, and falling, into a much deeper rabbit hole than you would expect. I recently had one of these experiences as I have dug into the world of unique identifiers. It is this rabbit hole that I would like to take you down for a bit as well. Unique identifiers are everywhere in our code and our data storage and through better understanding what they are and the trade-offs between them we can make more educated decisions in our day-to-day work.

### Where we began:

Historically a lot of software has used incrementing numbers to represent the identifier of a particular piece of data. They can be auto-generated by many data stores, they are easy to reason about, are efficient to store and sort, are naturally time ordered, and can be easy to say (ex: “Hey Marsha, can you take a look at record 3162?”). It is for many of these reasons that the industry used these identifiers for so long.

That being said, there are also downsides to using incrementing numbers as identifiers especially as we start working in “web-scale” applications. Due to the sequential nature of data you often aren’t able to generate these identifiers concurrently. You could use techniques like skipping so many values for each generation and having different starting points for each generator or starting at different numbers but these all have various shortcomings as well versus a system that could generate identifiers without any coordination. If you separate the work of ID generation to another system that system could become a single point of failure and/or slow down the performance of your application as you need to make round trips between the requesting application and the ID generation system.

Incrementing IDs also can lead to data leakage in that you now have easily guessable identifiers in URLs or other locations that people can exploit to test out your defenses. They can also divulge the size of your dataset. For example, if I sign up for an account with a website and the profile page’s URL ends with `user/515` I can make the educated guess that there are 515 accounts on the service. The less information you can give an adversary the better. I have actually stumbled upon production systems that were easily exploitable via lacking authorization and using incrementable identifiers. This particular system included personal information about employees of another company and thankfully after disclosing this vulnerability to the company they were able to patch the issue. That is not to say if you were using a non-guessable identifier you don’t need authorization checks but it does add another layer to get through.

### UUIDs to the rescue?

For all the above reasons many different applications needed to find another way to generate unique identifiers while allowing data hiding and scalability. Enter [RFC 4122](https://www.ietf.org/rfc/rfc4122.txt) UUIDs. UUID are identifiers backed by a 128-bit value typically expressed as a 32 hexadecimal characters generated via random or time-based means. They look something like: `93f9a654-7467-46de-9964-f30a66104dd9`.These identifiers have numerous benefits:

* Many different processes can generate identifiers concurrently without coordination with an extremely low chance of collisions.
* They are less guessable than sequential IDs.
* They don’t give you a sense of the size of the dataset.
* They are still reasonably small when compared to a 32 random character identifier. They are also much easier for a database engine to compare than 32 characters of text.

Given the definition of a UUID as a 128-bit number generated via time and randomness-based methods you may think there could be many ways of going about this and you would be correct. There are several official versions of UUID:

* Type 1 — ID is based on the generating host’s MAC address and a timestamp. Reasonable choice for concurrent generation but falls flat on the low guessability spectrum.
* Type 2 — The often ignored version as there isn’t a formal definition of it in the RFC and thus is ignored by many UUID tools but there is a definition provided by the [DCE 1.1 Authentication and Security Services specification](https://pubs.opengroup.org/onlinepubs/9696989899/chap5.htm#tagcjh_08_02_01_01). It uses a host’s MAC address, timestamp, a “local domain” number, and “integer identifier meaningful within the specified local domain”
* Type 3 — Generated via an MD5 hash of a provided input data. This allows the generation of the same UUID based on the same input.
* Type 4 — Entirely random data is used to generate the bits of the changing part of the UUID
* Type 5 — Like type 3 it is based on an input value but in this case it is SHA-1 hashed which is a better hashing algorithm for this use case than MD5 so it should be preferred over Type 3.

Basically any modern language has built-in functionality to generate one or multiple of these types of UUIDs or there are readily available libraries to facilitate their generation. We also have first-class support for UUID in many database platforms.

There are downsides to UUIDs though. Although they are reasonably small they still take up much more space than many other identifiers. Their random nature also makes them particularly troublesome for relational databases to handle as, especially if they are used in a clustered index, they can force the reordering in its internal data structures to put in new entries. In general this lack of built-in sortability based on time becomes the root of a lot of issues. In a lot of circumstances you may not already have another piece of data to sort based on and you are forced to add one because your identifier can’t also facilitate the process even though it feels like it could.

### A World Beyond UUIDs

For the reasons above and many others, UUIDs aren’t a one-size-meets-all solution. Thus, unsurprisingly, many other implementations of identifier generation have been created and there is an [IETF RFC](https://datatracker.ietf.org/doc/html/draft-peabody-dispatch-new-uuid-format#ref-LexicalUUID) that details that a UUID version more appropriate to be used as a database key with an ordering component should be decided upon (update: they have a [draft specification](https://blog.scaledcode.com/blog/analyzing-new-unique-id/)). As part of this RFC, it refers to a number of existing implementations as prior art. Let’s consider a few of them:

### _ULID ([reference](https://github.com/ulid/spec))_

Unique Lexicographically IDentifiers ([ULID](https://github.com/ulid/spec)) are one such attempt at solving some of the above UUID issues. They are made up of two components, a Unix millisecond-level timestamp and a random portion put together like below.

```
01AN4Z07BY      79KA1307SR9X4MV3

|----------|    |----------------|
 Timestamp          Randomness
   48bits             80bits
```

Benefits:

* Lexicographical (Alphabetical) sorting.
* Commonly encoded in 26 characters vs the 36 characters of UUID
* Monotonic sort order. (The code handles the case of multiple generations per millisecond and making sure they sort in that particular order)
* Being 128 bits they are compatible with UUIDs 128 bits.


Downsides:

* They are required to be compared case insensitively. This could be a potential gotcha for implementing developers.
* They still weigh in at 128 bits making them no smaller than UUIDs.

### _[Snowflake](https://blog.twitter.com/engineering/en_us/a/2010/announcing-snowflake) (Twitter’s now [defunct](https://github.com/twitter-archive/snowflake) solution)_

Although it’s no longer supported I think it’s intriguing to look at Twitter’s Snowflake service that they historically used for the generation of tweet IDs. Twitter seemed to be a trend setter with this solution as you will see below a lot of other solutions built on top of the ideas of Snowflake. Snowflake worked as a Thrift service that used Zookeeper to facilitate a cluster of services that could be used for quickly retrieving new identifiers.

Benefits:

* The identifiers were 64 bits, half the size of UUIDs, allowing for more efficient storage.
* Fairly strong ordering guarantees.
* Distributed in a way that allows survival of losing a node.

Downsides:

* It introduces the complexity of monitoring and maintaining a Zookeeper cluster which if a particular company didn’t already have could be a large burden.
* You also need to maintain a cluster of identifier generation services (the actual Snowflake servers)
* The complexity and requirements of a distributed system are now part of your identitifer generation solution with cross cluster communication and other complexities.

Although no longer supported, you can see the original code [here](https://github.com/twitter-archive/snowflake/tree/snowflake-2010).

### _Flickr’s Ticket Server ([blog post](https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/))_

This is much more of a pattern than a particular tool or library. The basic idea of the ticket server is to have a service that is backed by a database that has an auto incrementing column maintained by the database engine that gets meted out to requesters. Now you can focus exclusively on optimizing this very specific use case and put off much of the heavy lifting to the database engine. In Flickr’s case, they load-balanced between two different service instances, one that did odd numbers and one that did even numbers to allow some resilience and load balancing.

Benefits:

* You can set how big you want your identifier to be. (In Flickr’s blog post they set it to 20 bits)
* There are minimal moving parts.
* It allows for some resilience if you break up the keyspace.

Downsides:

* If you want to add more backing services it could be difficult as you need to change them all together so they don’t clash.
* Strong ordering is only guarenteed only within a single keyspace so if you split it in half like Flickr did you can end up with half your key space quite divered from the other half of your keyspace.
* This is still the maintenance overhead of maintaining the ticket servers and DBs. Although less than something like Snowflake it is more than a lot of the other solutions that will be discussed.

### _LexicalUUID (Part of [Cassie](https://github.com/twitter-archive/cassie) from Twitter)_

Twitter has put a lot of thought and work into unique ID generation as we see another reference to Twitter’s tooling here in this list. This time as part of its client library for Cassandra. Unlike Snowflake, these are 128 bits like traditional UUIDs. The most significant 64 bits are a timestamp retrieved from Cassie’s built-in internal clock implementation and the least significant 64 bits are based on the worker ID.

Benefits:

* It does not seem to require any additional infrastructure like Snowflake.
* 128 bits makes it compatible with other UUID implementations.
* Gives you a strong time ordering guarantee within the same worker and weak ordering guarantees across works.

Downsides:

* Just as many bits as UUID
* Not strict ordering guarantees.
* Seems tightly coupled with the Cassie library.

### _Flake ([reference](https://web.archive.org/web/20150425090303/http://www.boundary.com/blog/2012/01/flake-a-decentralized-k-ordered-unique-id-generator-in-erlang/))_

Another defunct tool/company but always something new to learn from these tools. As the name suggests this particular implementation takes its origins from Twitter’s Snowflake discussed above. It however makes some changes. It moves back up to 128 bits and with that trade-off it can avoid any coordination between nodes. The results are still roughly time ordered. It is formatted as follows: 64 bit Unix timestamp, 48-bit worker ID (based on MAC address), and 16-bit sequence. It was also implemented in Erlang so that’s another fun piece of information.

Benefits:

* No coordination is needed between generation nodes.
* 128 bit compatible with UUID
* Roughly time ordered.

Downsides:

* Predictable by design (very much built like a UUIDv1 but done so that it can be roughly time sorted)
* Still 128 bits.
* Not exactly time ordered.

### _Instagram’s ShardingID ([blog post](https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c))_

To make sense of Instagram’s system you have to understand somewhat how they shard their databases. They have created thousands of “logical” shards of their data that each represents part of their data. These logical shards end up being schema’s in their databases so they could have from 1 — # of shards physical database engines behind their data to split between. It’s a fairly simple concept but a powerful one I would say. Instagram wanted to optimize for simplicity so they wanted to stay away from bringing in new tools and services to support. What they ended up with was a 64-bit identifier. The first 41 bits represent a timestamp in milliseconds (which gives them 41 years of IDs because they use a custom epoch), 13 bits as the logical shard id, and the final 10 bits serve as a sequence number for the value within the millisecond. They then wrote a custom PL/PGSQL function that generates these values within their database.

Benefits:

* No coordination is needed between servers.
* Uses existing infrastructure
* 64-bit identifier.
* Extremely simple to use.

Downsides:

* Strongly relies on their logical sharding system.
* 41 years doesn’t seem like a whole lot of time to be acceptable.

### _KSUID ([reference](https://github.com/segmentio/ksuid))_

Another generally sortable unique identifier generation tool. It uses 160 bits. A 32-bit timestamp and then 128 bits of random-based payload. It uses a modified epoch for its timestamp, giving it over 100 years of life. The text representation is 27 characters with the bits being encoded with base62 which makes it also generically time sortable via its string representation as well.

Benefits:

* Coordination free
* Long life

Downsides:

* At 160 bits it’s larger than UUID’s 128

### _ElasticFlake ([reference](https://github.com/ppearcy/elasticflake))_

This library is an extraction of the identifier generation code from ElasticSearch. It ends up being 120 bits with 48 bits of timestamp, a 48 bit MAC address, and 24 bits for a sequence at the end.

Benefits:

* Slightly smaller than UUID
* Battle-hardened inside of ElasticSearch.

Downsides:

* MAC addresses give predictability to identifiers.

### _Flake IDGen ([reference](https://github.com/T-PWK/flake-idgen))_

This identifier generation method brings in the concept of data centers as part of the identifier. The only reason I would think you would want this would be to be able to determine where an identifier was generated although I’m not sure why that would be useful. This can be useful internally but also perpetuate one of the downsides of some of the UUID versions in that they expose information. These are generated as 64-bit identifiers with a 42-bit timestamp, a 5-bit datacenter identifier, a 5-bit worker identifier, and a 12 bit counter.

Benefits:

* Only 64 bits.
* Allows tracking back to which data center generated an identifier.

Downsides:

* Less room for workers and sequence counts.
* Exposes more information than a lot of the other methods.

### _Sonyflake ([reference](https://github.com/sony/sonyflake))_
Next, we get Sony’s take on Twitter’s Snowflake pattern. This time we have 63 bits which is intriguing. Another interesting piece to this one is that the timestamp is scoped down to 10-millisecond buckets rather than down to the millisecond like most of the other systems discussed here. This gives it a longer life (174 years). The bit layout is as follows: 39 bits of timestamp, 8 bits for sequence numbers, 16 bits as a worker ID.

Benefits:

* Quite small.
* Coordination free.
* Long life (174 years)
* Can handle more workers than Snowflake.

Downsides:

* Timestamp can only be scoped to 10-millisecond buckets.
* Fewer identifiers can be generated in a particular 10 millisecond period due to smaller sequence.

### _OrderedUUID ([reference](https://itnext.io/laravel-the-mysterious-ordered-uuid-29e7500b4f8))_

We now look at Laravel’s OrderedUUID. This one takes the unique goal of wanting to look and act like a UUIDv4 that just so happens to have time-based higher-order bits. This being the goal its String representation looks exactly like a UUIDv4 and it includes the version and variant identifiers required by the UUID specification. The way it is built however is different. The first 48 bits are the timestamp, it has 72 bits of randomness, and then the UUIDv4 required pieces take up the remaining 8 bits.

Benefits:

* No coordination is needed.
* Identical to UUIDs, thus support is not needed for a new scheme for consumers of the IDs.

Downsides:

* Still 128 bits.
* Being so identical to UUIDv4 I think it could be easy to mix up and not be able to tell what you were looking at.
* Exposes generation time if that is a concern (it does not expose a sequence though)

### _COMBGUID ([reference](https://github.com/richardtallent/RT.Comb))_

These identifiers come from the SQL Server world. Presented with the problems of clustered indexes as well as the shortcomings of `newsequentialid` with not having true ordering, this identifier was born. This identifier devotes 76 bits to randomness and 48 bits to the timestamp, the last 4 bits are for the UUID identifier.

Benefits:

* Generally ordered IDs.
* Looks like and validates like a UUID

Downsides

* Timestamp goes down to the 1/300th of a second which isn’t millisecond precision that others provide.

### _pushID ([reference](https://firebase.googleblog.com/2015/02/the-2120-ways-to-ensure-unique_68.html))_

This one comes to us courtesy of Google, specifically Firebase. These IDs are used to allow extremely concurrent interactions with a data structure by many remote clients. These identifiers are generated client-side and are 120 bits. The first 48 bits represent a millisecond precision timestamp and the following 72 bits are random bits. They also can handle generation within the same millisecond by simply incrementing the random bits. With clients creating the timestamps I think the ordering guarantees in this system are probably weaker than environments where the timestamp generation is more tightly controlled but it is still likely generally in the right direction.

Benefits:

* Only 120 bits.

Downsides:

* Client-side generation of this particular implementation brings its own troubles.

### _ObjectId ([reference](https://docs.mongodb.com/manual/reference/method/ObjectId/))_

Now we have an identifier generation from MongoDB. This one weighs in at 96 bits. We have 32 bits of timestamp, 40 bits of randomness, and 24 bits of an incrementing value initialized to a random value. All of this is represented in a 24 character hexadecimal string.

Benefits:

* 96 bits is smaller than many options.

Downsides:

* On the lower side of random bits.

### _xid ([reference](https://github.com/rs/xid))_

This claims to be an iteration on Mongo’s ObjectId discussed above and simply changes the encoding scheme to String to instead use Base32 hex to take the string representation from 24 to 20 characters long. That being said, it does describe its bit structure differently than ObjectId does. Its bits are laid out as follows: 32-bit timestamp, 24-bit machine identifier, 16-bit process id, and 24-bits as an incrementing value starting at a random value.

Benefits:

* Smaller string representation than ObjectId and smaller than most.
* 96 bits is smaller than many options
* Claims to be bit compatible with ObjectId

Downsides:

* No randomness thus it is very predictable.

### _cuid ([reference](https://github.com/ericelliott/cuid))_
This identifier generation process seems to be focused on the text representation along with order. It comes out with a 25 character identifier with the following structure. Always starts with the character `c`, eight characters of timestamp, a four-digit counter that rolls over, four characters for a client fingerprint, and 8 characters of randomness.

Benefits:

* Seems to have first-class support for generation via client-side Javascript.
* Less focus on the actual bits makes it a little easier to reason about.

Downsides:

* Seems to be more of a wild west of what all the pieces mean and how they are encoded. (ex: How do you create a client fingerprint, etc)

---

### So which one do we choose?

There are a ton of options to choose from. Some are extremely different in their implementations and some are only different in the slightest of ways. What is clear is you need to know what you are optimizing for in your environment before choosing a identifier generation algorithm. Are you looking for the absolute smallest space-taking identifier possible? Are you trying to use the same tools you are already using or are you open to bringing in new tools? How many identifiers will be generated in a second? How in order should they attempt to be? All important questions and the answers will be different for each environment. I love how much sharing of ideas there is in the world and how we can learn from all of these uses cases and we all can build on the shoulders of those that went before us.

I hope the above whirlwind tour of different identifier generation algorithms was useful. The is much more to dig into with each method but this should give you a taste of what is out there and different ways people are solving this common problem.