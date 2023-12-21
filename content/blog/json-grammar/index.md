---json
{
  "title": "JSON Grammar",
  "description": "A JSON grammar exists and some of the things are shocking",
  "date": "2017-07-16",
  "tags": [
    "json",
    "Computer Science",
    "programming language"
  ]
}
---

Back when I was in college I had the opportunity to take an programming languages class. It was interesting to learn of the histor of a lot of the languages we know and love and try using a few lanuages with different prommaning models (logic programming, functional, etc). As part of the class we talked about how programming languages syntax can be described and documented. As part of this we talked about programming language [grammars](https://en.wikipedia.org/wiki/Syntax_(programming_languages)#Syntax_definition). We had to parse a bunch by hand and although I found it extremely intersting, I didn't think that I would ever need to use this information. Although I am often learning new languages you don't really see language syntax described in a grammar often. 

The other day I was helping a coworker work a bug he had received from our QA department where one of his endpoints didn't react correctly when sent some JSON. The particular JSON being sent was simply a string with quotations: `"My Value"` and his code wasn't expecting he quotation marks. This definitely wasn't the JSON I am used to seeing. Where is the key? Where are the `{`'s? It occurred to me that I was thinking about JSON objects but we were still interested in what was allowed in the JSON spec and a quick google of "JSON" led us to [JSON.org's](http://www.json.org/) website. Lo and behold we were presented with a grammar. So in our case if you look on the grammar and you can that the value can be a string, looking a little further down you can see that a string has quotation marks. Its pretty cool to see when you can bring the knowledge you learned in college to you everyday work life.