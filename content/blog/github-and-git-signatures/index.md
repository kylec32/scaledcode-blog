---json
{
  "title": "The Confusing Case of Git Signatures on GitHub",
  "description": "An explanation of some of the things GitHub does to smooth out the sharp edges of commit signing and one of the gotcha's with their process.",
  "date": "2025-03-07",
  "hero_image": "./github.jpg",
  "tags": [
    "software development",
    "git",
    "Github"
  ]
}

---

Git has supported signing for [some time](https://lwn.net/Articles/478791/) (version 1.7.9 released in 2012). As git's own documentation says, [git is cryptographically secure but not foolproof](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work). By cryptographically secure it means that every commit has a hash value and all future values are built on top of previous values. This makes tampering with the history of a repository extremely difficult without detection. By not foolproof it refers to the identity part of git which, by default, is very trusting. When you set up git you provide it with your name and email address and there is nothing stopping you from putting someone else's name and email address in. To solve this second problem git signing was added. 

### Why is git signing still not that popular

Signing of commits, while it has been available for over 10 years, is still not that prevalent. Why would that be? The issues come down to two reasons:

1. Added complexity
2. Limited Value

Managing cryptographic keys and making sure they are in the right place at the right time, rotating them, and revoking them are all complicated. While there are processes to help this it is still additional work. On top of this, many don't see any/minimal value in signing commits in git. This is because there are already other methods to verify or compensate for git not having built-in support for asserting ownership. Things like private repositories, SSH authentication, code reviews, etc can compensate for this lack of cryptographic signatures..

### GitHub's Attempt at Simplifying Commit Signature and What It Misses

To many people git and GitHub are probably the same thing but, as this example will highlight, there are differences and some places where you think you are just using a git concept but have unknowingly slipped into a GitHub concept.

One of the complex parts of git signing is that you need to have all the public keys of those that you will be working with if you are going to verify the signatures. This is a place where GitHub is well positioned and does well. By having everyone you are working with upload their signing keys to their GitHub account we can count on GitHub to keep track of all the public keys. One strange piece that is missing here is that GitHub publicly shares people's SSH _authentication_ keys and GPG keys (for example [SSH keys](https://github.com/kylec32.keys) and [GPG keys](https://github.com/kylec32.gpg)), as far as I can tell, they don't share user's SSH signing key public keys. I'm not sure why this is because it would be helpful. Nevertheless, this is a useful piece of the pie.

In addition, you can set up settings in your organization that enforces that all commits are signed before entering one of your repos. Since GitHub knows everyone's signing keys it can verify them. This is again great and helps with enforcement.

Finally, GitHub provides easy access in the interface to know if a commit is signed and additional metadata about that signature via its "Verified" tag.

{% image "./commitExample.png", "Example commit with 'Verified' tag." %}

The final thing that GitHub does to help ease the burden of using signed commits is totally ignoring them after reading them once. Wait, what? That's right, in order to fix additional pains with signing, GitHub ignores the cryptographic signature after its initial check. They call this a "persistent commit verification record". After receiving the commit and verifying its authenticity using the signing key it then creates a _separate_ record to sit alongside the commit that is immutable. This immutable verification record remains valid within a repository's _network_ (which includes its branches and forks) (this will become important in a moment). The pain this can resolve is that things can happen to a signing key between the time that the commit is ingested and it is being viewed later. A signing key can be revoked, expire, etc. This can take a once-valid signature and make it no longer valid. But since GitHub actually only cares about the immutable verification record that was minted at commit ingestion time this doesn't matter. Generally, I think this is a good behavior and one most people would agree with. If I trusted that signature on day 1 I likely want to trust it on day 10,000.

As noted above, if that commit is pushed to a different branch or to a fork that is within the same _repository network_ the very same verification record will be used. This saves GitHub some verification work. But what about if you take that commit outside of the repository's network?

On a project that I work on we have many repositories that share a common ancestor repository. All the shared configuration and build processes are put in that parent repository and then merged into the children as needed. Of note, there is no actual lineage that GitHub knows about between these repositories. Thus you can probably already see the issue.

We have run into various issues where all of a sudden, during one of these parent-to-child merges, GitHub says that the signature is not valid on a previous commit. This has led to much confusion. We can go to the GitHub interface for the problematic commit and see that it is listed as "Verified" which we see as "Signature is valid" but it isn't allowed into a different repository. The source of all this confusion is due to it not actually meaning "Signature _is_ valid" though, it means "Signature _was_ valid". Since we are now outside of the original repository's network GitHub must now verify the signature from scratch. Then if any of the above-mentioned things have happened to the original signing key (expiration, expiry, etc) the commit will now be blocked because it can't be verified.

### Did GitHub Do Something Wrong Here?

GitHub hasn't done anything wrong here. While the end result ends up being confusing, partially because of their interface, it does solve more problems than it creates. Add on top of this that it solves common case problems very well and this more niche use case gets left behind. It seems that GitHub wants to encourage signed commits. Slapping "Unverified" on every commit that didn't come in with a signature is one way they are somewhat shaming those who don't use commit signing. They have done work to soften the sharp edges of the process and that is great. However in that softening they have somewhat sneakily taken something that existed in just the git arena, and that people already had a mental model of, and GitHub-ified it which leads to the previous mental model running into issues.

### What should you do instead?

If you don't need commit signing that still is going to be your easiest route. There is less configuration, fewer sharp edges, and less that can go wrong. If you must/want to use git signing and using GitHub understand how GitHub sees verification and make sure you are following what they expect of you. Largely this will mean staying within the same repository network for items that will share commits. There also could be an argument for avoiding removing "unused" signing keys although you will need to do your own due diligence on the security/integrity impacts of that.

Hopefully, the existence of this article can help you avoid the confusion I ran into and spun my wheels on when I first ran into this. I would also like to highlight [GitHub's documentation about commit verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification#persistent-commit-signature-verification) as it is well-written and fully explains all of this. The trouble is knowing that this behaves differently than you may expect and that this documentation exists.