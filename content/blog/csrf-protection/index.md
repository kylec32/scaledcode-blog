---json
{
  "title": "Modern Methods for Cross Site Request Forgery (CSRF)",
  "description": "A dive into different methods to protect against cross site request forgery (CSRF). Including custom headers, signed double-submit cookies, and cookie settings.",
  "date": "2023-12-17",
  "hero_image": "./confusedBrowser.jpg",
  "tags": [
    "CSRF",
    "Browsers",
    "security",
    "Web Development"
  ],
  "draft":true
}
---

Security is a constant battle in modern development. While there are always new exploits and things to protect against, we must not forget about the exploits and the security concerns that we needed to protect against for years. This is why even after all of these years we still have SQL in the [OWASP top 10.](https://owasp.org/www-project-top-ten/) Recently I have had the opportunity to once again dig into the concerns and mitigation methods for Cross Site Request Forgery (CSRF).

## What is Cross Site Request Forgery (CSRF)?

Before we can protect against the attack and to better understand why the mitigations work we need to understand what CSRF is. CSRF (sometime written XSRF, pronounced _sea-surf_) is a type of exploit where an attacker uses the fact that a user is logged into another site to make malicious requests on their behalf without the user's knowledge. These attacks can be facilitated via many methods whether it be a malicous image tag, a hijacked form post, `fetch` request, etc. Basically any way an attacker can get a user's browser to make a request to a server can likely be utlized. 

Because browsers will send cookies (including session cookies) along with requests to the sites that sent them whenever contacting that domain, an attacker can abuse that functionality to effectively make authenticated requests masquerading as the currently logged in user. By knowing requests that can be made to make required changes (such as transfering money, deleting data, etc) an attacker can put these two things together an perform their exploits.

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

This pattern can be taken to the next step by using a signed value as the token. For example by using the session ID and adding on top of it a random number and then running it through an HMAC and using that as the token with a prefix of the random number. The random number allows different tokens even if the session ID is the same. These additional protections protect against some of the short comings of the basic double submit patterns.


### Double Submit Cookie

