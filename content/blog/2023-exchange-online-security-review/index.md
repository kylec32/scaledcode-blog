---json
{
  "title": "Microsoft Gets A Firm Reprimand From the Cyber Safety Review Board",
  "description": "A review of the CSRB report on Microsoft's summer 2023 Exchange intrusion.",
  "date": "2024-04-15",
  "hero_image": "./lost_key.jpg",
  "tags": [
    "Culture",
    "software development",
    "security",
    "Postmortem",
    "Regulation"
  ],
  "draft":false
}

---

On March 20, 2024, the Cyber Safety Review Board (CSRB) published its findings about the summer 2023 Microsoft Exchange Online intrusion by Storm-0558. The CSRB is a relatively new organization that, to this point, has produced two major reports on specific security incidents. [The first](https://www.cisa.gov/sites/default/files/publications/CSRB-Report-on-Log4-July-11-2022_508.pdf) was published in July 2022 and covered the vulnerability known as Log4Shell. The second review was this one about the Microsoft event. The CSRB is fashioned after the National Transportation Safety Board (NTSB) and is set to [meet](https://www.justsecurity.org/76154/the-new-cyber-executive-order-is-a-good-start-but-needs-a-supercharge-from-congress/) in cases of significant cyber security incidents.

[The review](https://www.cisa.gov/sites/default/files/2024-04/CSRB_Review_of_the_Summer_2023_MEO_Intrusion_Final_508c.pdf) of the Microsoft Exchange online intrusion is enlightening, shocking at times, concerning, and informative. It is extremely useful to read such a report from the board as they were given deep access to interviews all related to this event. Technologists would be wise to review the findings in this report, and, as the CISO I know was known to say, "Don't let a good security event go wasted."

## Timeline

_May 15, 2023 (or before):_ Storm-0558 gains access to Microsoft Exchange Online. This May 15 date is based on the earliest the access logs were available as they were only kept for 30 days and earlier logs had already been deleted. Once gaining access, the threat actor accessed various high-value, targeted email mailboxes.

_June 15–19, 2023:_ The United States State Department detects anomalous activity on June 15 based on log analysis, notifies Microsoft on June 16, and, with the help of Microsoft, determines which accounts have been accessed. Additional mailboxes are being accessed while this is going on.
June 15–26, 2023: Microsoft, the State Department, FBI, and CISA conduct an investigation into impact. Additional victims are identified and notified. The United States Commerce Department is identified as a victim.

_June 24, 2023:_ The attack vector is closed.

_July 4, 2023, and beyond:_ Further victim notification and additional investigations are performed.

## Particularly Interesting Points
There is a lot of interesting data throughout this review, I will review only some specifically interesting points below.

### Logs

The intrusion was initially found by analysis of log files by a Microsoft customer (the United States State Department). They had paid for enhanced logging and used these logs as part of their "Big Yellow Taxi" report that analyzed a log called "MailItemsAccessed" only available to customers that had paid for this additional logging. This became a problem later in the investigation because some affected customers had not paid for this additional logging. Thus, even though it was turned on for them during this event, it could only show additional accesses and not what had been accessed in the past. This highlights the truth that you can't log something in the past if you add the logging today. This is obvious but shows the importance of determining what needs to be logged while balancing that with not logging so much that you can't get any signal through the noise. This was another item mentioned, even if this log was available to all the affected customers, due to the sheer volume of the log, many smaller organizations wouldn't be able to analyze it with any intelligence. Even so, one of the board's recommendations was to make these types of security logs available to all customers, security shouldn't be an add-on.


### Detection

As noted in the timeline, we don't truly know the start of this event as Microsoft's logs only went back 30 days and thus, all that could be determined, is that the threat actors were there 30 days prior to the detection by the State Department. Storm-0558 accomplished this intrusion by gaining access to an old root signing key to Microsoft's infrastructure. To this day Microsoft still doesn't how they accessed that key. There were early theories that they may have accessed it from a heap dump from a previous breech however there still is no actual evidence that such a heap dump ever existed. The report does include this comment though about the initial investigation into how the key could have been obtained:

> Microsoft developed 46 hypotheses to investigate, including some scenarios as wide-ranging as the adversary possessing a theoretical quantum computing capability to break public-key cryptography or an insider who stole the key during its creation…Microsoft says that its investigation into these hypotheses remains ongoing.

Particularly the "quantum computing" theory I find interesting as it indicates how much they were/are grasping at straws of what it could be. Knowing how access is being performed in your system and particularly where and how your "crown jewel" security keys are being accessed should be of top priority.

### Credential Rotation

The root credentials that Storm-0558 gained access to, and was able to leverage to facilitate the minting of its own credentials was from 2016 (it was intended to be retired in 2021 but was delayed due to "unforeseen challenges"). It was only 7 years later that this token was used in the attack (2 years after its scheduled retirement). The rotation of these types of credentials initially started off manual but was automated in the _enterprise_ side of Microsoft's identity systems. This was planned to be performed on the _consumer_ side as well but hadn't been performed by the time of the intrusion. Even the manual rotation process for consumer keys was stopped entirely in 2021 following a major cloud outage linked to a manual rotation. There was also no system for alerting Microsoft teams of the age of active keys in the system which could have been another signal that could have been used to indicate a potential risk.

### Lack of Credential Isolation

As was mentioned above, the key that Storm-0558 had access to was a _consumer_ signing key and thus shouldn't have been able to sign tokens in the _enterprise_ environment like experienced in this intrusion. This appears to have been possible due to a flaw in the token validation logic used. This flaw was introduced by "Microsoft's efforts to address customer requests for a common OpenID Connect (OIDC) endpoint service that listed active signing keys for both enterprise and consumer identity systems." Following this change, Microsoft failed to update its SDKs used internally and by its partners to differentiate consumer and enterprise keys from the common endpoint. This highlights the need to consider the security implications of all your changes and in addition to thinking about use cases also think about "abuse cases" (or in this case, areas that are error-prone to handle correctly).

### Understanding Your Customers/What Kind of Targets They Are

Seeing as this is an analysis performed in the name of a government body, and seeing as the initial discovery was done by a government organization, the report highlights the risk to national security an intrusion like this could cause. When building systems it is important to consider what kind of customers you have and what kind of attacks they will invite. If you have high-value targets as customers you should expect much more sophisticated attacks. In the case of a large cloud provider such as Microsoft (as well as AWS, Google, and even Oracle) security has to be of top concern because you will have governments, industry, non-profits, etc. all hosted on your infrastructure. This invites all kinds of attackers. 

### Affected Users Ignoring Notifications

Another interesting finding in the report is the learning from seeing how affected users responded to notifications that they had been targeted in the intrusion. Many methods were used to notify affected users including SMS, nation-state notifications ([NSNs](https://www.microsoft.com/en-us/security/blog/2021/10/25/microsoft-digital-defense-report-shares-new-insights-on-nation-state-attacks/)), emails sent to recovery accounts, and popup messages in authenticator applications. Even after this, many of those notified viewed these messages as spam and disregarded them. This led to the the FBI deciding that they needed to have agents from their field offices directly visit each affected user. This of course is not an option for most companies. Understanding how users will respond when they see your breach notification is important. If they don't recognize what it is and what they need to do, they will not act, and that will make things worse. Hopefully, you won't have a lot of real-life experience with sending out these types of notifications thus it is important to have a plan in place before you need them.

### Issues With Acquired Assets

There are a few brief comments made about a compromised employee laptop in use at a company Microsoft acquired that was allowed onto their corporate network without being deemed safe. It is unclear if this compromised laptop was part of the breach but it does highlight a risk that companies should be careful of. When you acquire a company you acquire with it all of its risk as well, you don't want to extend that risk by just blindly bringing that risk into your company's assets and allowing it to spread.

### Communication/Transparency With Customers

An issue that the board takes with Microsoft's handling of the event at various times is the truthfulness and transparency of its reporting. Microsoft did a reasonable job of being transparent. Blog posts with some information were published around a month after the exploit. This gave them time to determine the scope of the breach as well as ensure that their system was  now secure. They also followed this initial blog post with additional posts with additional information. All of this was good, except, some of the information in these later posts was incorrect and known to be incorrect. The board apparently asked Microsoft several times if they were going to correct the information. Only after months of asking did Microsoft finally add an [additional note](https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/). By this point, most people who were going to read that blog post had already read it and there was no reason to go back and check for updates months later. This ends up being a communication miss on Microsoft and their customers deserve better transparency.

### Security Culture

There are a lot of issues with what was found inside Microsoft's security practices detailed in this report. All of these issues can roll up to the overarching issue of a lack of a strong security culture at Microsoft. It is more than just saying the right things, you have to engrain it into how you work. The board even used an excerpt from [an email](https://www.wired.com/2002/01/bill-gates-trustworthy-computing/) Bill Gates sent to every full-time employee in 2002.

> So now, when we face a choice between adding features and resolving security issues, we need to choose security. Our products should emphasize security right out of the box, and we must constantly refine and improve that security as threats evolve. A good example of this is the changes we made in Outlook to avoid e-mail-borne viruses. If we discover a risk that a feature could compromise someone's privacy, that problem gets solved first. If there is any way we can better protect important data and minimize downtime, we should focus on this. These principles should apply at every stage of the development cycle of every kind of software we create, from operating systems and desktop applications to global Web services

The words are nice and words do matter but action matters more. When the rubber meets the road, will you take the invisible-to-customers-security-improvement, or will try to add yet another feature? Features likely make your customers and shareholders happier in the short-term but if you aren't secure and you have a breach, it will bite you in the future with your shareholders and customers.

---

Mistakes will happen. We don't always get things correct. This is why we talk about the [Swiss cheese model](https://en.wikipedia.org/wiki/Swiss_cheese_model) of security. If one control fails, another control can protect us. It is only by having numerous failures in security, born by a lackadaisical attitude towards security was this intrusion possible. If anywhere along the way Microsoft had rotated their key, protected the key better, not allowed a consumer token to be used in the enterprise identity system, etc this event could have been avoided or at the very least, drastically reduced in scope. Hopefully, Microsoft, and all of us, can take the learnings from this event to heart and come out of this with better security, better culture, and better outcomes.

I only covered some of what is contained in the report so I invite you to [read the report](https://www.cisa.gov/sites/default/files/2024-04/CSRB_Review_of_the_Summer_2023_MEO_Intrusion_Final_508c.pdf) in its entirety and see what lessons learned you can find.