---
title: "SASS Loops"
description: "Putting SASS loops to good use."
date: 2017-04-23T15:46:11
topic: Guide
tags: []
---

As always, another interesting problem that I solved at work. Our lead designer often comes over to discuss solutions to some really interesting front-end style problems. I don't know how he finds them, but I love helping to solve them! Today:

> How can I style a list so it's in a gradient of colours?

The boring solution would be to create a class for each li and write in each colour - boring! We're in the industrious modern age of CSS pre-processors!

### CSS3 

Firstly let's stick with what we know, CSS3, `:nth` selectors have been around for a while and they are a perfect fit here. Already we're not going to have to write `.class-1{...} .class-2{...} .class-3{...}` in our HTML we can forget this would ever be a thing, we just have to worry about our CSS, so we can instead do `li:nth(1){...} li:nth(2){...} li:nth(3){...}`.

Still, we're lazy programmers, no one wants to do that.

## The SASS Way

We can do this programmatically. Firstly, we can change colours in sass with `darken` or `lighten`, that's pretty useful to know, because we're making a gradient through automation.

Secondly, SASS has some nifty functions we would typically find outside of markup languages like loops. SASS calls these the fancy name of 'control directives', and means you can do all sorts of things like if, for, while and each - you can read all about them [on their site](http://thesassway.com/intermediate/if-for-each-while).

We want a loop here.

## All Together Now

In `demo.scss` below, you can see how the above have been combined to create a gradient coloured list, for 1 to 5 children.

You can see the code in action in this [CodePen](https://codepen.io/anon/pen/KrXPKE).

