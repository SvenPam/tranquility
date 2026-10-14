---
title: "Life's better with BEM"
description: "Utilising the BEM style methodology for clean architecture and maintainability gains 💪"
date: 2018-11-20T17:48:18
topic: Guide
tags: []
---

I plan to write a bit of a series of methodologies and processes I use with styles. The first methodology is the Block Element Modifier (BEM) style methodology. Before I get onto that, I want to be upfront and say there are _many_ methodologies out there. BEM is _my team's_ favourite and it works for _us_. I'll list a load of other methodologies towards the end if you're interested in comparing them.

## What is BEM?

BEM is a naming convention for your styles. There isn't any more to it than that in terms of what you need to do, but it should get you to think more about how you write your styles. From this thinking, you will naturally find your CSS becomes cleaner and easier to maintain. BEM can be used with CSS, SASS, LESS - anything, so don't limit your dreams!

The premise for BEM is that your pages should be made up of independent components. Each piece of UI should work in isolation to any other. Examples of UI blocks might be:

-   buttons
-   cards
-   headers
-   lists

I always say CSS is easy to learn and hard to master. This is why: it's easy for me to list them components because I am not there with you now to see what you're trying to categorise and I find this is the **root of all styling problems**. Just knowing what is its own independent component. So a good exercise before using BEM is looking around sites just trying your best to identify bits of shared UI - it will carry you miles.

<p>&nbsp;</p>

## Really though, what is BEM?

Got your UI components in mind? Cool. Let's use a simple example.

<p class="codepen" data-height="352" data-theme-id="dark" data-slug-hash="RqxgvL" data-default-tab="html,result" data-user="svenpam" data-pen-title="BEM Example">&nbsp;</p>

<p>
<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

I've knocked up some markup for a simple product. Little by little, we'll work through the example bit by bit.

<p>&nbsp;</p>

### Blocks

The obvious choice here is `.product`, but that isn't the only one. We can also create one for the button. I've done this on purpose, because

<blockquote>[A block] Encapsulates a standalone entity that is meaningful on its own</blockquote>

A button isn't specific to the product, we _could_ have a button anywhere on our website. We can quite happily put blocks inside other blocks _but_ blocks cannot have any dependency on another block. A good rule of thumb, if tomorrow you deleted that block, nothing else would change! So with our two blocks in mind, I'm going to add them to our styles. I'll use SASS here because I'm going to show something cool later. 😎

<p class="codepen" data-height="352" data-theme-id="dark" data-slug-hash="YRYxpe" data-default-tab="html" data-user="svenpam" data-pen-title="BEM Example (with blocks)">&nbsp;</p>

<p>
<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

Some examples of blocks might be:

-   buttons
-   lists
-   cards
-   header
-   footer

Now that we have identified our standalone components, it's time to get them sleeves rolled up.

<p>&nbsp;</p>

### Elements

The bulk of your styles will invariably end up as elements, which are dependent on blocks.

<blockquote>[Elements are] Parts of a block and have no standalone meaning.</blockquote>

An element is defined by two underscores after the block name. So for our product title, we could have `.product__title` which denotes this title element is part of the `.product` block. As the buttons in the example don't have anything to them, we'll keep them as a block. So now we add the elements to our product block.

<p class="codepen" data-height="573" data-theme-id="dark" data-slug-hash="mQpMxz" data-default-tab="html" data-user="svenpam" data-pen-title="BEM Example (with blocks &amp; elements)">&nbsp;</p>

<p>
<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

Here you can see a little SASS trick that works so well with BEM. I'll touch on that later.

Examples of elements could be anything, just as long as it pertains to its own block.

<p>&nbsp;</p>

### Modifiers

Blocks and elements build our baselines. Everything should look relatively ok with just blocks and elements. Sometimes though, we need to take other things into account like element state, or themes. A good example would be: how would you show a price was discounted? We would break DRY principles if we wrote how a price looked all over again. Modifiers are just the thing for this situation.

<blockquote>[Modifiers are] Flags on blocks or elements. Use them to change appearance, behavior or state.</blockquote>

Note here, that they can be used on both blocks and elements. We can define a modifier by two dashes, so say we want a discount variant of our price we might write `.product__price--discount`. Here we're saying we have created a variant of the price element which is an element of the product block. Here the true power of BEM comes to life, with three simple names we can clearly show the purpose of a component.

In the next stages, I will add a discount to the price and update the buttons to be different colours.

<p class="codepen" data-height="265" data-theme-id="dark" data-slug-hash="aQELvY" data-default-tab="html,result" data-user="svenpam" data-pen-title="BEM Example (with blocks &amp; elements &amp; modifiers)">&nbsp;</p>

<p>
<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

Notice I still keep the block or element name associated with a modifier. This is crucial, because if you don't do it - what are you actually modifying?

Some examples of when you use modifiers would be:

-   button themes - i.e. bootstraps danger, success, warning etc.
-   transition states - open, closed, faded etc.
-   general states - active, inactive etc.

<p>&nbsp;</p>

## Full Example

I've added in some styles to give this example more character. It's still the same HTML from the first step, just with classes.

<p class="codepen" data-height="656" data-theme-id="dark" data-slug-hash="yQpzab" data-default-tab="css,result" data-user="svenpam" data-pen-title="BEM Example - Full">&nbsp;</p>

<p>
<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>
</p>

<p>&nbsp;</p>

## Benefits

BEM is really powerful, especially when it's used with the SASS tools. I've written a fully flexible version of BEM here, which demonstrates the combination. Should a name change, we only have to update HTML and one place in the SASS.

<script src="https://gist.github.com/SvenPam/84c0c47d4cc93541a21dfa22f5dfd3ed.js"></script>

We get the readability benefits of nesting, but none of the specificity problems. The output CSS is flat.

I always put **one block per file**. This further goes to help with the flexibility of turning features on and off at the removal or addition of an import. This also feeds back into what I said earlier with blocks. They should be so standalone, you can delete a file without affecting any other CSS.

In a work environment, we're able to place people on code they have never seen before and they hit the ground running with BEM - which is a huge benefit in itself. There is no more search through lines and lines of CSS to find something, you simply use the HTML as a reference.

BEM is easy to use, but it relies heavily on knowing what components are stand alone and what is not. The other criticisms I've heard of BEM have been searchability. Especially when you nest things with SASS. I'd personally feel this isn't a problem, but I'll let the _dear reader_ form your own opinions.

<p>&nbsp;</p>

## Further Reading

This is my take on BEM and SASS, before you plough into rearchitecting your styles it's best to get familiar with identifying UI components that are stand alone. This comes with practice. Here's more information:

-   [Official BEM Site](http://getbem.com)
-   [More BEM docs](https://en.bem.info/)

BEM isn't the only methodology out there, some methodologies work better for certain project types. Here are some more you can check out:

-   [OOCSS](https://www.keycdn.com/blog/oocss)
-   [SMACSS](https://smacss.com/)
-   [SuitCSS](https://suitcss.github.io/)

I would love to hear thoughts from anyone working with BEM and the others.

<p>&nbsp;</p>
