---
title: Mitigating SQL Injection in The Non-Standard Ways
description: A look into some of the less talked about SQL injection mitigation strategies that can be utilized in an application.
date: 2022-08-10
hero_image: ./sql-inject-hero.webp
tags:
  - security
  - SQL Injection
  - SQL
  - Data Store
  - Secure Coding
---

[SQL injection](https://owasp.org/www-community/attacks/SQL_Injection) is an extremely critical security vulnerability. There is good reason that [injection](https://owasp.org/Top10/A03_2021-Injection/) has had a prominent location in the [OWASP Top 10](https://owasp.org/www-project-top-ten/) since its inception. Often the sophistication needed to successfully perform a SQL injection is low but the damage can be extremely high. This is a very concerning combination, we would at least hope that the most damaging of attacks would take a lot of sophisticated effort but often in this case it is not. Thankfully there is a well-understood way to avoid these issues and that is to use parameterized queries.

This well-known solution is both a blessing and a curse. Having a readily available answer is great because it can become the way things are done without much additional thought. The downside is that some legacy applications were built without these protections in place and may have core parts of their applications built in such a way that requires "on purpose" SQL injection. When modern maintainers of the software try to plug the holes where these injection points are found they are faced with quite a quandary. They may not be able to move to parameterized queries without a major rewrite but there is little written on mitigating these issues without parameterized queries. Searching for answers on how to mitigate SQL injection leads to many people responding to the inquirer in hostile tones saying they are making mistakes and must move to parameterized queries. While the root of this response is correct, parameterized queries do prevent so many of these injection issues, sticking only to this response is often unhelpful. I have done this search myself before and I have longed for someone to take on the discussion of mitigating SQL injection issues without using parameterized queries. So let's consider some ideas.

*Disclaimer:*
*These ideas and solutions are only mitigation strategies and are designed to decrease the blast radius of these issues. If parameterized queries are not something you can do right away get it scheduled. Slice a usage or two of SQL injection out and work on it bit-by-bit. Make sure all new development can utilize these mechanisms. Don't let these issues exist forever and get too comfortable with these mitigation strategies. Even if your application solely uses parameterized queries these additional mitigations can be useful.* 

## Root Safety Mechanism

The core of all methods of providing safety is related to controlling and limiting what is available. This is all parametrized queries are doing, only permitting parameters to be passed to a prepared query. Even outside of parameterized queries this same method of limiting the exposed abilities to the bare minimum is helpful. Before you can apply any of these methods though you must gain an understanding of what your application does. What kind of queries can be legitimately run, on what tables, using what SQL features? After you have completed that investigation you are ready to start fortifying your application. Let's consider some of the methods.

### Limiting the Capabilities of the Database User

This is always a good idea. Take stock of what your application must do and then only give the application's database user those abilities. Thus, if you don't make use of stored procedures, don't give the database user the ability to execute stored procedures. If only some tables need to be accessed, limit access to just those tables. You are also not just limited to the use of only one database user for an application. If there is only one part of your application that uses dynamic queries maybe you make use of a special database user that has extremely limited capabilities to add a level of protection.

### Disallow Multiple Queries Per Query

One of the capabilities that an attacker using SQL injection will use is ending the current query being executed and starting a new query where they can do whatever they want. So if the original query was `'SELECT title from blogs where id =' + userInput` and the value injected is `1; DROP TABLE blogs` we end up with `SELECT title from blogs where id = 1; DROP TABLES blogs`. There are a couple of ways to prevent this. For one we could disallow the statement separator but that could cause issues as there may be a legitimate semicolon found in an input that is properly escaped and thus not a real issue. There may also be the ability in your database or in your database client to disallow multiple statements per call.

### Escape All User Input

As should always be our standard operating procedure, all user input should be escaped, especially user input that gets passed to the database. No input should be considered safe until it has had the proper escaping performed on it.

### Create and Verify Against a List of Allowed Values

There are parts of queries that are not parameterizable, for example, table names and order by queries. If you must expose the ability to pass these values in then a practice that can be used is to make a list of all acceptable values and make sure the user-provided value is within that allowed list.

### Reject SQL Keywords That Don't Need to Be Utilized

You will often read that having a disallow list to prevent SQL injection is not a good method but I think it has its place. While the criticisms are true that it is error-prone and has a high maintenance burden, it still can provide some value as an additional barrier. If the word `DELETE` or `TRUNCATE` or even `UNION` is never expected to be seen in an input value then there shouldn't be any harm in disallowing it.

### Don't Expose Exception Details to End Users

Not exposing exception details to end users is always a good idea but particularly as it pertains to SQL injection. If an attacker can see the types of exceptions being thrown this can give them additional information to guide their attacks more efficiently. While SQL injection is still very possible without getting error details, we want to make it as hard as possible for the attacker.

### Utilize Methods for Reducing the Size of Result Sets

While the usefulness of this particular control is low and likely means that many other controls have already failed, limiting your result sets with SQL controls such as `LIMIT` or `TOP` can lower the effects and risk of mass data disclosure. This also can just be useful to do in general to make sure your query doesn't return more data than can be usefully handled by your application.

---

Hopefully these methods prove useful in your development. While it makes sense that parameterized queries are what is immediately thought of when mitigating SQL injection vulnerabilities, understanding these additional mitigation strategies allows us to utilize a defense-in-depth approach. As we utilize multiple of these strategies in an application we end up with a much more robust application.
