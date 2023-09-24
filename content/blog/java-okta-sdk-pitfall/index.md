---
title: Pitfall When Using Java Okta SDK JWT Verifier
description: Quick explanation of a issue with the use of the Okta JWT verification code in Java and how to avoid it.
date: 2022-03-21
hero_image: ./okta-sdk-pitfall.jpg
tags:
  - okta
  - java
  - performance
  - design patterns
  - Oauth2
---

In today's quick post I would like to cover a pitfall that I have seen several developers fall into when using the Okta Java SDK when verifying JWT signatures. I have found it interesting that two independent teams working on integrating with Okta via Oauth2 have run into this same problem when verifying JWTs.

When you receive a JWT from a client you need to verify its signature before you can trust any of its data. As you may know, the content of a JWT is just base 64 encoded data and any client could just change that content to whatever they want. What prevents them from doing this is the signature at the end of the token. This token can be generated in a several different ways but a popular method is with public/private key cryptography. This is useful in that anyone can use a public key to verify the authenticity of a JWT without the ability to use that same key to generate a signed JWT of their own (this would be possible with a symmetric key).

While conceptually this is fairly simple the mechanics of how this works with Oauth2 is a bit of a pain. Thankfully the Okta Java SDK provides an interface `AccessTokenVerifier` that, once you have an instance of it, you can verify the authenticity of a token and retrieve its data. A convenient way of creating an instance of an `AccessTokenVerifier` is via the `JwtVerifiers` builder class. This code allows you to provide all the necessary parameters to create the verifier and then you can grab the instance. The code may look something like this:

```java
AccessTokenVerifier jwtVerifier = JwtVerifiers.accessTokenVerifierBuilder()
                                            .setIssuer(System.getenv(OKTA_ISSUER_KEY))
                                            .setAudience(System.getenv(OKTA_AUDIENCE))
                                            .build();
```

The code I was seeing duplicated by two different teams looked like this:

```java
Jwt jwt = JwtVerifiers.accessTokenVerifierBuilder()
                        .setIssuer(System.getenv(OKTA_ISSUER_KEY))
                        .setAudience(System.getenv(OKTA_AUDIENCE))
                        .build()
                        .decode(token);
```

This code looks innocent enough but inside it lurks a major performance problem, particularly under load.

One potential idea is that we are regenerating a class on each verification (likely every request). This is indeed wasteful and will have some impact on the garbage collector but the problem is much bigger than that. To understand the reason for this we need to look back at one of the comments made above. Okta uses asymmetric keys for its JWTs and thus for the application to verify the token it receives it must retrieve the public key for the token. This key can be retrieved from a well-known server path on the authorization server. No problems yet. This is one of the helpful things this library does for us is retrieve this public key and do the verification. The problem is that going to the network to retrieve this key is very expensive, thankfully this library also can assist with that. This is because the `AccessTokenVerifier` has a cache within it to cache this key as well as it can recognize when it needs to retrieve a new version of the key. You may be seeing the problem at this point, we are recreating the `AccessTokenVerifier` on every request thus that cache is useless. This means that on each request we need to make an HTTP request to the authorization server to retrieve the public key, as you can imagine this is extremely slow. By simply creating the `AccessTokenVerifier` once and using it for the life of the application we can save ourselves at minimum tens of milliseconds per request and more likely, as it was in our case, hundreds of milliseconds.

So how could this issue be avoided? One potential is to better understand the library that was being used. In the documentation it does mention that it caches the public keys for you, this is great, however, it doesn't explain what must be done for that cache to work. Potentially this is a place where the documentation could be improved. Another way this could be recognized is by understanding how the JWT was to be verified by understanding the protocol. By understanding the protocol and asking how it is fulfilling that protocol we may have been able to come to this conclusion faster. Finally, testing and profiling your application. Both of the times that I discovered this issue it was via an observability tool. There would all of a sudden be an HTTP call early in the processing of a request that would delay everything else. After fixing this issue we saw greatly improved performance and much more stable processing.

Hopefully this little tidbit helps you avoid the same issue that we experienced as well as help come up with some ideas of how to avoid similar issues in the future.