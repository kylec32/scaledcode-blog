---json
{
  "title": "Modern Methods for Cross Site Request Forgery (CSRF)",
  "description": "A dive into different methods to protect against cross site request forgery (CSRF). Including custom headers, signed double-submit cookies, and cookie settings.",
  "date": "2023-12-17",
  "hero_image": "./confusedBrowser.png",
  "tags": [
    "CSRF",
    "Browsers",
    "security",
    "Web Development"
  ],
  "draft":true
}
---

Security is a constant battle in modern development. While there are always new exploits and things to protect against, we must not forget about the exploits and the security concerns that we have needed to protect against for years. This is why even after all of these years we still have SQL in the [OWASP top 10.](https://owasp.org/www-project-top-ten/) Recently I have had the opportunity to once again dig into the concerns and mitigation methods for Cross Site Request Forgery (CSRF).

## What is Cross Site Request Forgery (CSRF)?

Before we can protect against the attack and to better understand why the mitigations work we need to understand what CSRF is. CSRF (sometimes written XSRF, pronounced _sea-surf_) is a type of exploit where an attacker uses the fact that a user is logged into another site to make malicious requests on their behalf without the user's knowledge. These attacks can be facilitated via many methods whether it be a malicious image tag, a hijacked form post, a `fetch` request, etc. Any way an attacker can get a user's browser to make a request to a server can likely be utilized. 

Because browsers will send cookies (including session cookies) along with requests to the sites that sent them whenever contacting that domain, an attacker can abuse that functionality to effectively make authenticated requests masquerading as the currently logged-in user. By knowing requests that can be made to make required changes (such as transfering money, deleting data, etc) an attacker can put these two things together an perform their exploits.

CSRF attacks can be tricky to protect against since the request looks like it is coming from a legitimate user. Thus we need to come up with other mechanisms to determine when the request is coming from an expected location and when it is not. 

## Mitigation Methods

### Synchonizer Token

This is the most classic protection against CSRF attacks. This pattern has you adding a secret, unique value embedded in each request. This value is provided in the form when it is provided from the backend. The token can be generated per request or per session but per session is usually a better idea as it can help usability where per-request can run into issues with having a working back button and other usability issues. When the client makes the request the server must verify the validity of the token. If the token is not valid the request should be rejected. Because this unguessable token is required on all protected endpoints, an attakcer has no way knowing what to send thus protecting from the attack.

### Cookie-to-Header/Naive Double-Submit Pattern

With systems that heavily use JavaScript there is another pattern that can be useful. This pattern allows you to add protection without having state on the server. When the user initially visits the site a token is set in a cookie such as:

```
Set-Cookie: __Host-csrf-token=18XNjC4b8KVok4uw5RftR38Wgp2BFwql; Path=/; SameSite=Lax; Secure
```

> Sidenote: The above uses [cookie prefixes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#cookie_prefixes) which can add further protections. Read more at the link. While all major browsers support these protections in their latest versiosn these protections should still be seen as additional protections, not the only protections that you use.

Then, at time of request, JavaScript is used to pull the value from the cookie and provided as a custom header:

```
X-CSRF-Token: 18XNjC4b8KVok4uw5RftR38Wgp2BFwql
```

The server then validates that the token and the cookie match. Security is based on the assumption that a third-party website cannot read the token from the cookie as well as set custom headers on requests. JavaScript in a random file or email will be unable to read this value. Even though the cookie is automatically sent on requests it is not enough without the header being sent as well. 

This pattern can be taken to the next step by using a signed value as the token. For example by using the session ID and adding on top of it a random number and then running it through an HMAC and using that as the token with a prefix of the random number. The random number allows different tokens even if the session ID is the same. These additional protections protect against some of the [short comings](https://owasp.org/www-chapter-london/assets/slides/David_Johansson-Double_Defeat_of_Double-Submit_Cookie.pdf) of the basic double submit patterns.


### Custom Request Header

A method that doesn't require any token is the custom request header pattern. This pattern simply requires an arbitrary key-value be sent with each request that needs to be protected that doesn't conflict with existing header. This could look like the following: 

```
X-YOURSITE-CSRF-PROTECTION=1
```

Then when receiving the request the server checks for the existence of the header. This method doesn't work for protecting `<form>` posts which will need to use an alternative method like those above. This pattern does have the benefit of requiring minimal changes and no server state required. 

So why does this protection work? This whole protection is based on trusting the browsers [same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy). The same-origin policy restricts adding custom headers to only be added via Javascript and only within its own origin. Thus, because Javascript can't add custom request headers for cross-origin requests the protection works.

### Requiring Additional User Interactions

While the other mitigation techniques don't require any additional user interaction this technique uses user interaction as the mitigation technique. If a particular action in your application is a large, dangerous action forcing additional user interaction can be a reasonable protection. This additional user interaction can take various forms, it could be providing the password again, solving a CAPTCHA, providing a one-time token sent to an email, etc.

### SameSite Cookie Attribute

The `SameSite` cookie attribute is like any cookie attribute such as `HttpOnly`, `Secure`, `Domain`, etc that provides additional restrictions on the cookies. This attribute can either not be specified (where it will be treated as `Lax` on modern browsers), `None`, `Lax`, and `Strict`. This attribute helps control when cookies are sent. 

The `Strict` setting is (unsurprisingly) the most strict. This setting has the browser not send cookies in any cross-site situations. This obviously is very safe in that you won't have any risk of cookies from being passed. The downside to this value is that there may be legitimate situations where you want those cookies passed. For example if your product sends an email with a deep link into the application to some authenticated page, clicking the link won't send the cookies and thus the user won't be able to view the page.

The `Lax` setting is a more relaxed version of `Strict`. It also is the modern default if a cookie doesn't provide a different value. The aim of the `Lax` setting is trying to strike a balance of usability and security. `Lax` will have the cookies sent with assumed "safe" methods while blocking cookeis from being sent with unsafe methods. Safe methods are defined in [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231#section-4.2.1) as `HEAD`, `GET`, `OPTIONS`, and `TRACE`. That isn't to say that a CSRF attack couldn't come via a request using one of these methods, but these methods are expected to be read-only type actions. 

The `None` setting sends the cookeis in all cases and requires the cookie is marked as a `Secure` cookie. If at all possible, avoid using this value as it doesn't offer any protections. 

This protection counts on the browser implementing `SameSite` cookies correctly, while all modern browsers do implement this it is not taking the protections into your own hands.

### Using Headers to Verify Origin

This mitigation takes advantage of the fact that there are certain headers that can't be [overwritten](https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name). This mitigation first determines the where the request is coming from by first checking for the `Origin` header and if that isn't set then it refers to the `Referer` header. Then determine where the request is going. It then aims to verify that where the request is coming from and where it is going are the same. If neither of these headers are set you need to determine whether you want to block the request or let it through. Of course blocking the request is the more secure solution at the risk of hurting usability and potentially blocking legitimate requests. 
