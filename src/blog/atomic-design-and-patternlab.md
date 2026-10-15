---
title: "Atomic Design and Patternlab"
description: "Break down development and design walls with Patternlab and Atomic Design"
date: 2018-11-19T15:32:58
topic: Guide
tags: []
---

So I've spoken about [how to use BEM](/blog/lifes-better-with-bem "Life's better with BEM") and combining that with the [ITCSS methodology](/blog/inverted-triangle-css-itcss "Inverted Triangle CSS (ITCSS)") to give you an architecture of clean, maintainable styles. You can take them both and now work with your design to development team process.

In 2015 I went to the annual [UpFront conference](https://upfrontconf.com/) in Manchester, one guest speaker was [Brad Frost](https://twitter.com/brad_frost). It was a really good conference, if you're a front-end developer or even a designer, it's well worth going. Brad introduced this concept of Atomic Design, a design methodology where you design the small pieces of UX first (atoms) and piece them together until you get to a full page. To support this concept, he also introduced the idea of putting Atomic Design into a style guide powered by Patternlab.

## Atomic Design

I won't spend too much on this because I'm far more developer than a designer and I am very likely going to butcher this process...

When designers come to designing a website, I've seen a few different approaches. Each unique, with their own respective pros and cons. With Atomic Design, you design the little bits first, group them together and make gradually bigger bits. For example, you might start with a text box atom and a button atom. Put the two together, and you have a search molecule. Put a search molecule and a navigation molecule together and you might get a header organism. Put a load of organisms together, and you end up with a template. It sounds simple, but being strict in practice is hard.

<figure>    <div class="article__img-holder" style="padding-bottom: 75%;">
        <img width="1024" height="768" src="/media/1061/atomic-design-process.png">
    </div>
        <figcaption>Atomic Design by Brad Frost</figcaption>
</figure>

What this process brings to the table is loosely coupled UI elements. It makes design easier (I assume) and it makes handing designs over to developers really easy. At _The Lead Agency_ we combine this with [Zeplin](https://zeplin.io/). Our designers create a style guide in a PSD or whatever software they work with and upload it to Zeplin. This gives us developers all the colours, margins, fonts, sizes - you name it - to work with. Having these little pieces, also means we can really concentrate on the quality of each little component and isolate styles at a micro level.

If you want to read more about Atomic Design, Brad wrote a [book you can read for free](http://atomicdesign.bradfrost.com/table-of-contents/).

## Patternlab

Flash forward to 2017 and we're seeing big problems with our design to development team process. Frequently we were seeing out of date designs, or there was a wait to get a PSD converted to something we could use. We were about to commence a redesign of a core site, and it was suggested we adopt atomic design as a trial. When I originally went to the conference, Patternlab was built only in PHP. This was an issue for us, as we're all full-stack .NET - we've never touched PHP! However, in 2017 there was a node version of Patternlab available.

Patternlab is built entirely around the atomic design process. It's a super quick way to spin up prototypes and helps to retain a clean maintainable code structure. What we discovered as we adopted it was, developers were wholly able to focus on the quality of the front-end code. Once the style guide was updated, the devs working on Umbraco simply had to copy paste the HTML over and convert it to Razor, allowing them to focus on the back-end.

If you're interested in seeing a demo of what we've tried to do with Patternlab and Atomic design, you can check out our style guides here:

-   [Car Keys](http://styles.carkeys.co.uk/) (Car news)
-   [Landing Pages](http://styles.uk-tla.com)
-   [Instant Compare](https://styles.instantcompare.co.uk/) (Property Valuation)

It's really important you read the documentation on the Patternlab site because it's very easy to dive into. However, there are some really powerful features that you might miss. Always bear in mind that Patternlab _really helps_ with DRY. So be sure to check out:

-   Pseudo Patterns
-   Style Modifiers

#### Getting Set Up

Patternlab takes a bit of getting used to because you can go overboard very quickly. I would suggest before starting you read up on two things:

1.  [Patternlab docs](https://patternlab.io/docs/index.html)
2.  [Mustache.js](https://mustache.github.io/mustache.5.html)

The docs are really good, I've added the mustache.js one in there because if you haven't seen this before, it's simply a new concept to understand. I won't go into more detail than the docs - they show you how to set everything up and it's going to be far more up to date than this article will ever be!

#### Gotchas

Data precedence is an important part of PatternLab. At the lowest level, data comes from `_data/data.json`. Every pattern can then override values by using `patternName.json`, where the highest level wins.

Avoid listItems - whilst it is a neat part of PatternLab, I found it buggy and it doesn't appear to follow the same data precedence as the rest of the data. It's easier to control lists via an array in JSON.

## Cons

I've found PatternLab was unbelievable for enabling a laser-like focus on front-end performance. As times have changed, we've begun running into issues that we're still trying to solve. This is mostly around how PatternLab doesn't like SPAs or using JS frameworks very much. Mostly I've found this is due to their respective build tools conflicting with PatternLab's. For example, we moved over to Vue.js at the beginning of the year, and it took a lot of work to get Webpack setup to work with PatternLab Node.

It gets much worse when you combine multiple themes and try and jam them into your build. I know it's a unique case, but it happens. Further to this, we tried to move from Webpack to the Vue CLI, and this still remains a task in the backlog. So if you're wanting to move to build tools beyond Gulp I would be wary with adopting Patternlab - this doesn't mean you shouldn't take a look at Atomic Design!
