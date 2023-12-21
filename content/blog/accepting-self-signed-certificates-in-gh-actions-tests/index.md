---json
{
  "title": "Accepting Self-Signed Certificates in Github Actions with Java",
  "description": "When you find yourself in a situation where you need to accept self-signed certificates in your Java test runs how do you accomplish this in the safest manner",
  "date": "2023-12-17",
  "hero_image": "./space.jpg",
  "tags": [
    "Continuous Integration",
    "Github",
    "security"
  ],
  "draft":true
}
---

It wasn't that long ago when there were major pushes towards getting the all of the internet [using HTTPS](https://en.wikipedia.org/wiki/HTTPS_Everywhere). Thankfully at this point not supporting HTTPS is the exception and not the rule. This is great for all users of the internet and accomplishing this feat is thanks to many people and organizations such as [Let's Encrypt](https://letsencrypt.org/) that has made it possible. Although getting public-facing websites using TLS has gotten vastly easier that doesn't make all TLS usage easy. Behind our public services there are many private services that historically would be sitting inside the [DMZ](https://www.fortinet.com/resources/cyberglossary/what-is-dmz) where we would just trust all traffic. In modern systems we often choose to not trust any networks and thus would use TLS even inside of these private parts of our networks. Many of these wonderful tools are not built to support these internal services. This can often leave us using self-signed certificates. By nature of the certificate being self 