---
title: "Inverted Triangle CSS (ITCSS)"
description: "Improving maintainability of styles through the application of Inverted Triangle CSS."
date: 2018-11-19T16:30:44
topic: Guide
tags: ["methodology", "itcss", "process", "front-end"]
---

Yesterday I wrote about the [BEM methodology](/blog/lifes-better-with-bem "Life's better with BEM") as part of a small series on design to dev processes. I want to further expand on the processes I use and write about Inverted Triangle CSS or ITCSS. ITCSS is entirely _opinionated,_ there is no right or wrong. It's simply a tool which will help make your styles easier to maintain.

<p>&nbsp;</p>

## A Note on Specificity

CSS is easy to learn but very hard to master. One of the main reasons for this is a misunderstanding of specificity. Specificity is a fundamental principle to Cascading Style Sheets. See how I used the full name for CSS there? It was intentional. That's because specificity plays right into this cascading principle. I won't go into the details of specificity here, but if you aren't sure on what specificity is, I strongly advise reading the following: 

-   [CSS Tricks on](https://css-tricks.com/specifics-on-css-specificity/) specificity
-   [MDN on specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity)

It's an important principle because **high specificity indicates poor maintainability in your styles**. It doesn't mean you're bad at writing code, there are plenty of reasons that it can happen. I'm sure, however, at some point in your career you've had to fight specificity. Did you have to write an ID you beat that other class? Did you really sin and use an `!important` to really nuke that other style overriding yours? I did once upon a time, so don't feel bad.

If you want to measure your code maintainability, a useful tool is a [specificity graph generator](https://jonassebastianohlsson.com/specificity-graph/). A spiky graph is bad, one which is flat or curves upwards is good. This, of course, isn't the only measure and you shouldn't obsess over it. I hope by introducing you to ITCSS, it will really help make your styles more maintainable.

<p>&nbsp;</p>

## So what is ITCSS?

Harry Roberts coined the concept in 2015 and it hasn't changed much since. It's a pretty simple concept, and really just boils down to the directory structure, there is no mad tech involved.

The basic concept is that your styles should be put into layers. It doesn't matter how many files are in each layer, the only thing that matters is the files are referenced in order the layers are. You can use ITCSS with any file types, in the below example I have used SASS. The examples are what I generally place in each layer.

<p>&nbsp;</p>

<div class="article__img-holder" style="padding-bottom: 52.375%;">
        <img width="800" height="419" class="lazyload " data-src="/media/1064/itcss-triangle.png">
    </div>

These layers can be defined as follows:

1.  Settings - Global variables, colour values, font-sizes etc. I.e Bootstrap \_variables.scss
2.  Tools - Mixins and functions
3.  Generic - box sizing, resets etc.
4.  Base - HTML Tags
5.  Objects: Cosmetic-free design patterns. I.e Grid systems, cards, media etc.
6.  Components - UI components
7.  Trumps - Utilities, theming and overrides

As your project becomes more mature, you will find yourself working mostly in the components directory.

<p>&nbsp;</p>

## Why ITCSS?

Once you have the project setup, anyone can follow it. That's the beauty of ITCSS.

It allows you to deal with files and imports, instead of code. Having it in place means you can deal with specific much easier. Ultimately

<ul id="_uHEuMrzpufDduC">
<li id="_WEkrYwJUZYHiGn">Encourages natural specificity flow - less fighting in the specificity wars</li>
<li id="_lbxu47l5ni4O1O">Quite similar to inheritance, take a base object and extend</li>
<li id="_AupCaaNdBCn7lM">Much more maintainable</li>
</ul>

## Further Reading

-   By far the best resource I found is this [article on ITCSS by XFIVE](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
-   [How I applied ITCSS to this site](https://github.com/SvenPam/tranquility/tree/master/Tranquility.CMS/a/src/styles)
-   [Harry Roberts' Talk](https://speakerdeck.com/dafed/managing-css-projects-with-itcss)

<p>&nbsp;</p>
