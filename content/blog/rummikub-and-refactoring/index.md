---json
{
  "title": "Rummikub and Refactoring",
  "description": "Recently when discussing refactoring at work I was reminded of an experience of playing a board game with my family. That game was Rummikub.",
  "date": "2017-08-20",
  "hero_image": "./rummikub_tiles.jpg",
  "tags": [
    "refactoring",
    "games"
  ]
}
---

During a recent discussion at work about refactoring I was reminded of a game I have played with my family on numerous occasions. The game in question is [Rummikub](https://en.wikipedia.org/wiki/Rummikub). For those that haven't played this game before the general idea as explained by Wikipedia is as follows: 

>There are 104 number tiles in the game (valued 1 to 13 in four different colors, two copies of each) and two jokers. Players have 14 or 16 tiles initially and take turns putting down tiles from their racks into sets (groups or runs) of at least three, drawing a tile if they cannot play. [...] An important feature of the game is that players can work with the tiles that have already been played.

The last sentence of that explanation is what I want to focus on. What I have seen happen more often than I would like to admit is someone has a grand vision of how they can get rid of a large number of their tiles if they reorganize a number of the already laid down groups of sets and runs. Well as you might imagine people may think that they can do one of these great reorganizations when they can't, well now they have messed everything up and no one knows what the previous board looked like. This can lead to emotions running high. 

So what does this have to do with refactoring? Well you may have guessed if you have ever tried to do a big refactor and paint yourself in a corner you know exactly how it feels to not know where you started (thankfully version control allows us to get back to the original mess with our code which you can't with Rummikub). Two books that I am reading right now hit on this a lot. The first one I'm reading (and the one that triggered the discussion at work) is [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882), particularly the "Successive Refinement" chapter. In this chapter Uncle Bob walks the reader through a "successive refinement" or successive refactor of a particular piece of code. He makes sure to note that he is making small changes, retesting, and then moving on to the next change. The other book that I (just started) reading is [Refactoring](https://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672/ref=sr_1_1?s=books&ie=UTF8&qid=1503239824&sr=1-1&keywords=refactoring) by Martin Fowler and others. Even just being one chapter in, this topic has been the one topic hit extremely consistently, making small changes when refactoring. I would highly suggest reading these two books or having them as a reference that can be referred to while working. They have some general rules and guidelines that can be applied to whatever environment you are working in with whatever language. 

I think sometimes when working with particularly bad code we have the desire to dive in and fix it all at once. While this may work if you are lucky, odds are you are setting yourself up for failure. By small and simple things are great things brought to pass. So a challenge to the reader, as well for myself, is two fold:

1. When in any particular piece of code, refactor it in some small way.
2. If you want to do a big refactor, really question if that is the way to do it (and make sure you have good tests.)