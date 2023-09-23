---
title: Cracking a Password Via a Side Channel
description: Explanation of how to build a website to help solve Wordle puzzles by analyzing how the game works.
date: 2022-01-31
hero_image: ./password_side_channel.jpg
tags:
  - software development
  - security
  - side channel attacks
  - java
  - passwords
---

There are many ways an attacker of a system can look to gain access to an account. Unfortunately, in the battle between the person attacking a system and the person charged with protecting it the requirements are not even. While the attacker only needs to find one way in to be successful, the protector must not miss anything. Even though this doesn't feel fair it is the way of the world. Many of the times when we talk security we are discussing a direct attack of a system. Whether that is breaking through cryptography (or exploiting where there is none), social engineering, SQL injection, cross-site scripting, etc. the attack is pretty dead-on into the system. There is another kind of attack that can be performed that I have been learning about recently and that is a side-channel attack.

So what is a side-channel attack? According to Wikipedia article:

> In computer security, a side-channel attack is any attack based on information gained from the implementation of a computer system, rather than weaknesses in the implemented algorithm itself (e.g. cryptanalysis and software bugs).

While not the clearest definition it starts to get us along the path. These types of attacks don't attack the system directly and instead use their implementation against them. Some examples are cache attacks where an attacker is trying to derive information about a system based on if something is in a cache or not, power monitoring attacks where the attacker is monitoring power usage and deriving information based on that, or a timing attack where an attacker (possibly with some understanding of the implementation of an algorithm) can make determinations of particular data by timing how long it takes to process. Let's consider some real-world cases.

A personal example to start. To monitor my own home's power usage I have a software-defined radio that listens to the [ERT](https://en.wikipedia.org/wiki/Encoder_receiver_transmitter) messages output by my electric meter from my power company. These messages are output without any authentication (although from my understanding they do include a signature so you couldn't just publish your own messages). This is extremely useful for my home automation but I also could eavesdrop on all my neighbors' energy usage using this same method. While I don't know exactly which energy meter is for each neighbor I could potentially figure that out. Using this information I could figure out when they were home or other interesting educated guesses about their lifestyles. I don't do this but it fits directly into the power monitoring attack above, while not a cyber attack it could affect the security of a home.

What started my thinking about this was watching a great video by [Colm MacCárthaigh](https://shufflesharding.com/about) on his [Twitch/Youtube](https://www.youtube.com/watch?v=x6XoEheZC74) account where he discusses side channels. As part of that video, he shows a timing-based attack based on a naïve implementation of a password checker. I had heard that the particular algorithm that he used should be avoided when doing password checking but it was interesting to see how it could be shown. His used Rust to do his example. It didn't get the correct password every time but it did get close often and it was apparent that it would work before too long. Having more experience with Java myself, I decided I would try implementing the same idea in Java. Doing it in Java I was interested to see if the JVM would get in the way of having fine enough control to find the answer.

Let's start by looking at the naïve implementation of the password check:

```java

private static boolean verifyPassword(String realPassword, String providedPassword) {
    if (realPassword.length() != providedPassword.length()) {
        return false;
    }

    for (int i = 0; i < realPassword.length(); i++) {
        if (realPassword.charAt(i) != providedPassword.charAt(i)) {
            return false;
        }
    }

    return true;
}
```

This is a fairly efficient algorithm in that it bails out as soon as it determines that the passwords don’t match. While a developer may not choose this implementation exactly and instead to use the `equals` method instead, it should be noted that the `equals` method of `String` is implemented almost identically to the above algorithm. The developer of such a function likely would feel like they are being intelligent about their implementation but it is exactly this optimization that will get us in trouble. This reminds me of a comment I heard in a security talk once where the speaker shared that we always are talking about and focusing on the use cases of our code but we must also consider the abuse cases of our code. The way we will crack this code is exactly one of these abuse cases.

Now for the cracking code (heavily borrowed from Colm’s Rust implementation (at least at the pseudo-code level)) we will write a time-based side-channel attack. For the details of how all this is implemented, you can look at the repo linked at the bottom of this article.

The first step is to determine the size of the password. To do this we will come up with a password of every length we would like to test and time how long it takes to fail over many iterations (1001 iterations was a fairly good sample size in my experience). The time measurements are going to be extremely small so we want to use `System.nanoTime()` in Java to do the measurements.

Knowing the size now we will look for the password. This part was implemented via a recursive function that in pseudo-code would look like the following:

```
Pass in the real password to pass to the tester, currently guessed part of the password,
 how many remaining characters to guess, and how long the password is believed to be.
If there are no remaining characters return.
Create a long array the size of all legal characters for a password.
For each letter in the legal character set:
  Create a password to test that starts with the prefix passed in, then the letter that 
    we are checking if it's next, and then pad the password with 'a' up to the length of 
    the password (to avoid the password length check from blocking us gaining 
    more information)
  Create an array to keep our temporary results for the character (10001 worked reasonably 
    well in my tests). 
 
  For the size of the temporary results array:
    Start a timer
    Run the password check
    Store the elapsed time in the temporary results array.
  
  Sort the temporary results
  Find the median timing and store it as the timed result for the letter we are testing.
Find the character that had the longest median time and append it to our currently known 
  password prefix.
Recursively call the function with the new prefix and one less remaining character.
```

## Results
Finding the size of the password this code did very well at. Probably 90+% of the time it guessed the right length of the password. Getting the actual password has been a more interesting journey.

`System.nanoTime()` has low granularity on my laptop for some reason. Even doing nothing but storing the current nano time in a loop would end up with results of 300 ticks between iterations sometimes. Another interesting thing is that all tick counts ended in `00`. To try to take some of the JVM irregularity out of the mix I compiled the code to machine code via [GraalVM](https://www.graalvm.org/). Even with this change I still had issues with nano time on my machine.

Moving to a different server I was able to start getting granularity down to the specific tick. Why my laptop was unable to give me that granularity is still a mystery to me. Having good granularity was going to be critical to the success of this solution so all further testing was performed on this server. At this point, things were working reasonably well along the same lines as the accuracy as Colm’s Rust solution. To make it a bit more accurate and stable compiling to a native executable with GraalVM took it to the next level.

## How to Fix

The proposed fix by Colm is to use bitwise operations that turn this checking into a constant time operation (of course a person that works on cryptography would use bitwise operations). The new code looks like:

```java

private static boolean verifyPassword(String realPassword, String providedPassword) {
    if (realPassword.length() != providedPassword.length()) {
        return false;
    }

    int result = 0;
    for (int i = 0; i < realPassword.length(); i++) {
        result |= realPassword.charAt(i) ^ providedPassword.charAt(i);
    }

    return result == 0;
}
```

The difference here is that we know are doing an XOR between the characters. Let’s look at the truth table of XOR to remind ourselves how it works:

{% image "./xor_table.webp", "XOR explanation table" %}

Basically, it will return true if something is not the same. Combined with the bitwise OR with its “stickiness” property of once it is flipped it stays flipped we have a mechanism for detecting if there is a difference.

This is fine and works great but I wanted to try to make the code more readable by changing the equality check for something like:

```javascript
mismatch = (realPassword.charAt(i) != providedPassword.charAt(i)) || mismatch;
```

This appears to at least mostly get around the side-channel attack (I was unable to detect a way to still use timing as an attack). We don’t exit early and we do roughly equivalent work each iteration. A potential gotcha with this is if you put the `mismatch ||` at the start the JVM will short circuit and skip the character check after mismatching which would be close to as bad as the original. The overall goal of all of these methods is to make a success or failure take constant time to avoid giving the user any additional information about what is happening.

I will be the first to admit that this is a contrived example. Many password checks are performed over a network which would introduce a lot more noise into the signal. We also shouldn’t be storing passwords in plain text. There are many reasons why this isn’t a real world example but I do believe it shows the power of a side channel attack.

## Takeaways
* There are many indirect ways an attacker can gain insight into your system.
* Don’t think about just use cases but also abuse cases of your code.
* Even a managed language can perform these timing attacks.
* To avoid time-based side-channel attacks make your processing take constant time.
* Making code take constant time doesn’t mean it has to be unreadable.

## Additional Resources
* [Colm’s Video](https://www.youtube.com/watch?v=x6XoEheZC74)
* [Implementation Repo](https://github.com/kylec32/passwordsidechannelexample)