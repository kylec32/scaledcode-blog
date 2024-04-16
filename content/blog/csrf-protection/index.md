---json
{
  "title": "Modern Methods for Cross Site Request Forgery (CSRF) Protection",
  "description": "A dive into different methods to protect against cross site request forgery (CSRF). Including custom headers, signed double-submit cookies, and cookie settings.",
  "date": "2024-02-16",
  "hero_image": "./confusedBrowser.png",
  "tags": [
    "CSRF",
    "Browsers",
    "security",
    "Web Development"
  ]
}
---

Security is a constant battle in modern development. While there are always new exploits and things to protect against, we must not forget about the exploits and the security concerns that we have needed to protect against for years. This is why even after all of these years we still have SQL injection in the [OWASP top 10.](https://owasp.org/www-project-top-ten/) Recently I have had the opportunity to once again dig into the concerns and mitigation methods for Cross Site Request Forgery (CSRF).

## What is Cross Site Request Forgery (CSRF)?

Before we can protect against an attack, and to better understand why the mitigations work, we need to understand what CSRF is. CSRF (sometimes written XSRF and pronounced _sea-surf_) is a type of exploit where an attacker uses the fact that a user is logged into another site to make malicious requests on their behalf without the user's knowledge. These attacks can be facilitated via many methods whether it be a malicious image tag, a hijacked form post, a `fetch` request, etc. Any way an attacker can get a user's browser to make a request can likely be utilized. 

Because browsers will send cookies (including session cookies) along with requests to the sites that created them, an attacker can abuse that functionality to effectively make authenticated requests masquerading as the currently logged-in user from a different site. By knowing the structure of requests that can be made to make interesting changes (such as transferring money, deleting data, etc) an attacker can put these two things together and perform their exploit.

CSRF attacks can be tricky to protect against since the requests look like they are coming from a legitimate user. Thus we need to come up with mechanisms and techniques to determine when the request is coming from an expected location and when it is not. 

## Mitigation Methods

### Synchronizer Token

This is the most classic protection against CSRF attempts. This pattern requires you to add a secret, unique value embedded in each request. This value is provided often as a hidden `form` field when the form is provided from the backend. The token can be generated per request or session but per session is usually a better plan as it can improve usability where per-request tokens may run into issues with having a working back button and other usability issues. When the client makes the request the server must verify the validity of the token. If the token is not valid the request should be rejected. Because this unguessable token is required on all protected endpoints, an attacker has no way of knowing what to send thus protecting from the attack.

### Cookie-to-Header/Naive Double-Submit Pattern/Signed Double-Submit Pattern

With systems that heavily use JavaScript, there is another pattern that can be useful. This pattern allows you to add CSRF protection without having state on the server. When the user initially visits the site a token is set in a cookie such as:

```
Set-Cookie: __Host-csrf-token=18XNjC4b8KVok4uw5RftR38Wgp2BFwql; Path=/; SameSite=Lax; Secure
```

> Sidenote: The above uses [cookie prefixes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes) which can add further protections. You can read more about them in the link. While all major browsers support these protections in their latest versions, these protections should still be seen as additional protections, not the only protections that you use.

Then, at the time of the request, JavaScript is used to pull the value from the cookie and provided as a custom header:

```
X-CSRF-Token: 18XNjC4b8KVok4uw5RftR38Wgp2BFwql
```

The server then validates that the token and the cookie match. Security is based on the assumption that a third-party website cannot read the token from the cookie as well as set custom headers on requests. For example, JavaScript in a random file or email will be unable to read this value. Even though the cookie is automatically sent on requests, the request is not considered valid without the header being sent as well. 

This pattern can be taken to the next step by using a signed value as the token. For example, by using the session ID, adding a random number, and then running it through an [HMAC](https://en.wikipedia.org/wiki/HMAC), we can use the resulting value as the token with a suffix of the random number. 

```
X-CSRF-Token: <HMAC of the session ID and random number>_<random number>
```

The random number facilitates different tokens even if the session ID is the same. This additional signing step protects against some of the [shortcomings](https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf) of the basic double-submit patterns.


### Custom Request Header

A method that doesn't require any token is the custom request header pattern. This pattern simply requires an arbitrary key value to be sent with each request that needs to be protected. This header's name can be anything that doesn't conflict with an existing header. For example, it could look something like the following: 

```
X-YOURSITE-CSRF-PROTECTION=1
```

Then, when receiving the request, the server checks for the existence of the header. If it does not exist, the request is rejected. This method doesn't work for protecting `<form>` posts which will need to use one of the alternative methods discussed elsewhere in this post. This pattern has the benefit of requiring minimal changes and requiring no server state. 

So why does this protection work? This whole protection is based on trusting the browser's [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy). The same-origin policy restricts adding custom headers to Javascript and only within its own origin. Thus, because Javascript can't add custom request headers for cross-origin requests, the protection works.

### Requiring Additional User Interactions

While the other mitigation techniques don't require any additional user interaction, this technique uses user interaction as the mitigation technique. If a particular action in your application is considered a large, dangerous action, forcing additional user interaction can be a reasonable protection (these types of actions may be things such as changing a password, sending a money transfer, or deleting data). This additional user interaction can take various forms, it could be requiring the user enter their password again, solving a CAPTCHA, providing a one-time token sent to an email, etc. Requiring this additional user interaction forces additional steps to be performed even by legitimate users. However, if the actions are rare enough, users usually accept these additional hurdles without being too bothered.

_These next two mitigations are not protections in of themselves but instead are steps that can be taken as part of your [defense-in-depth](https://www.comptia.org/blog/what-is-defense-in-depth) strategy_

### SameSite Cookie Attribute

The `SameSite` cookie attribute is like any cookie attribute such as `HttpOnly`, `Secure`, `Domain`, etc that provides additional restrictions on a cookie. This attribute can be not specified (where it will be treated as `Lax` on modern browsers), `None`, `Lax`, or `Strict`. This attribute helps control when cookies are sent to a site in cross-origin situations. 

The `Strict` setting is (unsurprisingly) the most strict. This setting prevents the browser from sending cookies in any cross-site situations. This obviously is very safe in that you won't have any risk of cookies being passed when coming from a domain that didn't set them. The downside to this value is that there may be legitimate situations where you want those cookies passed. For example, if your product sends an email with a deep link into the application to some authenticated page, clicking the link won't send the cookies and thus the user won't be able to view the page. One idea that can be used is to step two different cookies, one to cover modifying actions within the application which has a `SameSite` value of `Strict`, and another cookie that covers read-only situations that is set with a `SameSite` value of `Lax`. This pattern gets pretty close to just setting `Lax` as the value, just with more setup and a little more control of what is considered a read-only action and what is not.

The `Lax` setting is a more relaxed version of `Strict`. It also is the modern default if a cookie doesn't provide a different value for the `SameSite` attribute. The `Lax` setting aims to strike a balance of usability and security. `Lax` will have the cookies sent with assumed "safe" methods while blocking cookies from being sent with unsafe methods. Safe methods are defined in [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-4.2.1) as `HEAD`, `GET`, `OPTIONS`, and `TRACE`. That isn't to say that a CSRF attack couldn't come via a request using one of these methods, but these methods are expected to be read-only type actions. 

The `None` setting sends the cookies in all cases and requires the cookie to be marked as a `Secure` cookie. If at all possible, avoid using this value as it doesn't offer any protections. 

This protection counts on the browser implementing `SameSite` cookies correctly, while all modern browsers do implement this cookie attribute it should not be considered as your only protection.

### Using Headers to Verify Origin

This mitigation takes advantage of the fact that certain headers can't be [overwritten](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name). This pattern first determines where the request is coming from by checking for the `Origin` header and if that isn't set then it checks the `Referer` header. By looking at those two values it aims to determine where the request is coming from, at this point it determines where the request is going (this is often configured in the application to know its URL). It then verifies that where the request is coming from and where it is going are the same domain. If neither the `Origin` or `Referer` headers are set, you need to determine whether you want to block the request or let it through. Of course, blocking the request is the most secure solution but realize that there are legitimate use cases where these headers will not be passed (largely stemming from privacy concerns) and you could be blocking legitimate users. 

## Conclusion

Thankfully, there are many methods we can take to prevent CSRF exploits in our applications. Which method you should use should be determined for each application, taking into consideration its requirements as well as its architecture.