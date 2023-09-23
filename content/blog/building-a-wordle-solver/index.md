---
title: Building a Wordle Solver
description: Explanation of how to build a website to help solve Wordle puzzles by analyzing how the game works.
date: 2022-01-23
hero_image: ./wordle_title.webp
tags:
  - software development
  - frontend
  - wordle
  - interview practice
---

Don't care about the how and just want to use it? Try it here: [https://wordle-cheater.netlify.app](https://wordle-cheater.netlify.app)

The game [Wordle](https://www.nytimes.com/games/wordle/index.html) has taken the internet by storm. Its simple rules and ability to share and compete with friends (all while not having the privacy losing trappings of many social games) leads to a winning combination. In our lives that can sometimes be a bit chaotic I feel like this simple game where we compete guessing words without (at least from what I can see) any alternative agenda is extremely refreshing. I'm not the only one that thinks this as well. Looking at the [Google trends](https://trends.google.com/trends/explore?date=today%205-y&geo=US&q=wordle) for the word "wordle" shows its explosive growth over the last few weeks.

{% image "./wordle_google_trends.png", "Wordle's explosive growth over the last few weeks." %}

## The Rules

For those that haven't participated in the game yet, it is worth going over the basic concept of the game. The goal of the game is the guess the secret word (the "wordle") within 6 guesses. The secret word is always five characters and each guess you make is also a five-character word. After each guess, you are told which letters in your guess are the correct character in the correct location of the word, is a character that is in the word but currently in the wrong location, or a character that is not in the word (these are signified by the colors green, yellow, and grey respectively). Each guessed word you use must also be a known legitimate word to the game. Each day you are only able to do one puzzle which contributes to the addictiveness to me but also avoids the trap of spending all your time playing the game. The simple semantics of the game are not new, it has very similar gameplay to the game [Mastermind](https://mastermindgame.org/) or the game show [Lingo](https://www.imdb.com/title/tt0329871/). That said, it doesn't have to be original to be fun.

I've been playing daily for a few weeks now and have been having a fun time but I decided it might be fun to come up with a simple website that could help you come up with guesses. While this takes much of the fun out of the game, it did lead to a fun few hours of coding and solving an interview-style problem.

## Background Information

Being such a simple game much (if not all) of it is driven directly from the frontend code. The critical information we can get from this frontend code is how words are chosen. There are two-word lists in use by the game. The first list is a list of about 2,315 words that the day's answer can be chosen from. The second list of about 10,657 is an additional list of words that are legal to guess (in addition to words from the possible answer list) but aren't possible answers for the puzzle.

## The Environment

Wordle being an online game it made sense to make this tool also work online. I have done some Angular programming in the past but have heard good things about Vue.js so I decided to give it a try. I decided not to go too crazy with separating the components as this was an extremely basic user interface and I mainly wanted to focus on processing code, not the interface code.

## Phase 1

For phase 1 of this application, I decided to make it so you could put in your known parts of the word (matching characters, characters in the word but an unknown spot, and characters that aren't in the solution word) and the application could produce a list of possible answers from the possible answer list that matched that criteria.
For the known characters we will have the user provide what they know by putting characters in the location they belong and "?" for characters they don't know. This seemed like a reasonable place to use a regular expression so that is where we decided to go.

```javascript
//pull in an array of each potential answer word
import possibleAnswers from './possible-answers.json'
//...
/*
Called with each keydown event in the known character location input box, the known existing characters input box, or known non-existing characters input box. 
*/
processOptions: function () {
  // If there is no information in the current known input box, skip
  if (this.current.length === 0) {
    return
  }
  // First we want to normalize to lowercase list our words list is
  // and replace all '?' characters with '.' which is the single 
  // character wildcard in regular expressions
  let regularExpressionString = 
               '^' + this.current.toLowerCase().replaceAll('?', '.')
  // If the user doesn't put in '?' for the remaining characters
  regularExpressionString += '.*'
  let regularExpression = new RegExp(regularExpressionString)
  // Filter down to just the possible words
  this.possibleWords = possibleAnswers.filter((value) => {
    // Does it match our known information?
    if (regularExpression.test(value)) {
      // Does in include the characters we know exist?
      if (this.includesCharacters(this.knownLetters.toLowerCase(), value)) {
        /*
          Filter down to words that don't include characters we know 
          don't exist or if we don't have any unknown letters.
        */
        return this.notIncludedLetters.length === 0 || this.doNotIncludesCharacters(this.notIncludedLetters.toLowerCase(), value)
      }
    }
    return false
  })
},
includesCharacters: function (charactersToInclude, targetValue) {
  let tempNeededCharacters = charactersToInclude.split('')
  let returnValue = true
  tempNeededCharacters.forEach((character) => {
    if (targetValue.indexOf(character) < 0) {
      returnValue = false
    }
  })
  return returnValue
},
doNotIncludesCharacters: function (charactersToNotInclude, targetValue) {
  let tempNeededCharacters = charactersToNotInclude.split('')
  let returnValue = true
  
  tempNeededCharacters.forEach((character) => {
    if (targetValue.indexOf(character) >= 0) {
      returnValue = false
    }
  })
return returnValue
}
...
```

High level the process we follow is we parse the known characters into a regular expression, we then test all possible answers against that regular expression. We then further filter this list down to only words that include words with characters we know the answer has. Finally, we filter out words that include characters that we know shouldn't be in the answer.

This does a great job of giving us our options. Potentially it could be useful to limit this list before rendering it to the screen as you can end up with many hundreds of potential answers and this can extremely slow down the website.

This phase alone can be very helpful and can help when finishing off a hard set of clues. That said, I wanted to take it further.

## Phase 2
The next phase I wanted to accomplish is that, although phase 1 could help you finish off, without good data it can only take you so far. The next step I wanted to accomplish was to suggest words that could be guessed that could help filter down the available remaining words down. Let's cover high-level how we will accomplish this.

First, we will take the possible answer list and remove all words that include letters we know are in the answer as well as letters that we know are not in the answer. Since our goal is to discover what letters are in the answer we want to focus on new letters that we don't know if they are in the answer or not.

Our next step will be to gather a count of how often each character in the potential, filtered list shows up.

Following this, we rank each character and give them a score. The way we will accomplish this is by sorting the characters from most to least used and then assigning scores from 26–1. The remaining words may not include all 26 characters but that will just mean that we don't have characters scored from 26 to 1 but that is fine.

To prepare for the next step we take the list of possible guesses (a combination of the possible answers and allowed lists). The possible guess list we can generate ahead of time and store or at least generate on page load.

At this point, we loop through the list prepared in the previous step and for each word generate a score for it. This score is based on the summation of the scores assigned to each character in the step above. For example, if we had scores such as: a = 26, b = 25, d = 24, and t = 23 and the words "bad" and "tad" existed in our potential answer list they would end up with the following scores: bad = 75 (26 + 25 + 24), tad = 72 (23 + 25 + 24).

Finally, we sort all the words from highest score to lowest and then take the top 10 and present those to the user. There is no need to show many words because the farther you go into the list the worse the guess is.

## The Code

That's several steps but let's take a look at the code.

```javascript
calculateGoodLetterWords: function () {
  /*
    remove words from the available answer words that include 
    letters we know about.
  */
  let wordsWithoutCharactersWeKnow = 
    this.filterOutWordsWithKnownAndUnknownLetters(possibleAnswers)
  // Gather a count of each character in available answer words
  let characterMap = {}
  wordsWithoutCharactersWeKnow.forEach((value) => {
    value.split('').forEach((character) => {
      characterMap[character] = (characterMap[character] | 0) + 1
    })
  })
  // Sort the characters in order of use.
  let characterMapArray = []
  for (const character in characterMap) {
    characterMapArray.push({character: character,
                            value: characterMap[character]})
  }
  let sortedCharacterMapArray = characterMapArray.sort((a, b) => {
    return b.value - a.value
  })
  /*
    Assign a score to each character based on how many times it 
    appears in the available word list
  */
  let currentScore = 26
  let scoredCharacterMap = {}
  for (let index in sortedCharacterMapArray) {
    scoredCharacterMap[sortedCharacterMapArray[index].character] = currentScore
  currentScore--
  }
  /*
    Remove words from the possible guess list that includes letters we 
    know about.
  */
  let guessesWithoutCharactersWeKnow = 
    this.filterOutWordsWithKnownAndUnknownLetters(
                                               this.possibleGuesses)
  // Score each available word based on its character usage.
  let scoredWordList = guessesWithoutCharactersWeKnow.map((value) => 
    {
      let score = 0
      let seenLetters = ''
      value.split('').forEach((character) => {
        // Don't double count scores for duplicate letters.
        if (seenLetters.indexOf(character) < 0) {
          seenLetters += character
          score += scoredCharacterMap[character]
        }
   })
  
   return {word: value, score: score}
  })
  // Order words by score and return the top 10.
  let orderedScoredWordList = scoredWordList.sort((a, b) => {
    return b.score - a.score
  }).map((value) => value.word)
  .slice(0, 10)
  
  this.goodLetterGuesses = orderedScoredWordList
},
filterOutWordsWithKnownAndUnknownLetters: function (words) {
  return words.filter((value) => {
    return 
      this.doNotIncludesCharacters(
              this.notIncludedLetters.toLowerCase(), value) &&
     this.doNotIncludesCharacters(this.knownLetters.toLowerCase(), value) &&
     this.doNotIncludesCharacters(this.current.toLowerCase(), value)
    })
  }
}
```

Putting all this together we have a solid utility for solving Wordle puzzles. Using these two pieces of functionality you can solve any Wordle within a few turns. It is quite fascinating to see how it solves the puzzles because it is not looking for where each character goes as much as trying to figure out which characters are in the answer and that limits the options down to a guessable number of options.

## What is It Missing
The biggest piece of functionality that I think this is missing is that it doesn't take into account places we know a character doesn't exist. Although it takes into account that we know there is an "S" in the word (for example) it doesn't take into account where we know that character doesn't show up. This said, I don't think it would help a whole lot and the user interface could be tricky to make clear to a user how to input this information.

## Summary

Although this isn't a complex of website, it was fun to build. It was enjoyable to dig into how the game was designed and consider the semantics of how to limit the problem set down. All in all, I would consider it time well spent. It takes a lot of the fun out of the game to use the website but the design of the solution was where the fun was. This is likely not the most optimized way to solve this problem either, if you have other ideas of how to make it better feel free to open a PR on the source code here.

## Prior Art

I am not the first person to do an analysis of how Wordle works and the breakdown of letters that are most advantageous. Some other great work can be found in the following links:

* [Wordle: Revised mathematical analysis of the first guess](https://bernoff.com/blog/wordle-revised-mathematical-analysis-of-the-first-guess)
* [wordle-analysis](https://github.com/gabeclasson/wordle-analysis)
* [Wordle Strategies Analysis](https://virtu.is/wordle-strategies-analysis-part-i/)