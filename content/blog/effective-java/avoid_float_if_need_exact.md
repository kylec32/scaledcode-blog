---
title: Effective Java! Avoid Float and Double If Exact Answers Are Required
description: A dive into chapter 60 of Effective Java
date: 2021-03-22
tags:
  - java
  - effective java review
  - design
  - architecture
---

This chapter dives into a fun computer science based topic. When we have a need to represent numbers that include a decimal point we will often reach for either a `float` or a `double`. These primitive types facilitate the representations of _approximate_ floating point values over various magnitudes. A key part of the previous sentence is that it's an approximation. We must not use `float`s or `double`s when we need exact answers, especially when dealing with numbers.

Let's briefly go over why this is the case. The goal of floating point types is to allow the representation of any number with any number of digits before or after the decimal point. Unfortunately 
 we aren't able to represent any number but the goal is still there. With a float we have 32 bits to use to represent all of this. In order to accomplish this Java implements the IEEE 754 standard. This lays out the bits as follows. 1 bit for sign, 8 bits for the exponent, and 23 bits of mantissa. The way all these bits are used together is as follows for example for the number 1.23. The first bit being the sign denotes if the number is positive or negative. Next we will skip to the mantissa. Here we would represent the number `123`. Finally our exponent portion will be used to represent 10^-2. Putting the sign of positive together with 123 * 10^-2. This format can indeed represent exact values depending on the value. An interesting result of this data format is that a float's maximum representable value and minimum values (
~+/-3.4 × 10^38) are actually higher than an int (~+/-2.1 × 10^9) even though they both only use 32 bits. Floats give up accuracy for that ability. Something else to note is that as you get further from zero the accuracy drops due to the limitations of the data format.

The book has various examples of how the approximations that come with floating point arithmetic can cause problems but what we are really interested in is what to do instead when needing to deal with exact numbers. There are mainly two different paths you can follow. The first is to use an `int` or `long` and handle the decimal yourself. An example where this can work well is in a simple calculation where you are dealing with money and adding and subtracting from it. This can work pretty well in these simple cases. It also calculates very fast. Another option is to use `BigDecimal`. This type provides a lot of power at the cost of speed as well as some additional difficulty with interacting with the type versus the convenience of an `int`, `long`, or other primitive type. 

Floating point types definitely have their place, they also have places they shouldn't be used. One of those places they shouldn't be used is when exact values need to be represented. 