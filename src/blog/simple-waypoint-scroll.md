---
title: "Simple Waypoint Scroll"
description: "Simple Way Point Scroll (SWPS) is my very first JavaScript plugin."
date: 2014-04-27T21:47:48
topic: Interesting
tags: []
---

It's Sunday no less, and a lazy one! Instead of twiddling my thumbs and pestering my family/rabbit I decided to fix my darn about page.

## Problem

I attempted a while ago to get auto-scrolling to work on the about page. It really ended in tears, I had to back out of a dark tunnel and bodge some truly awful code together that worked only in a specific thirty pixel screen range. It really _was_ that bad, and **super hacky**.

So I decided to euthanise that horror code and put in something a little more... elegant.

## Solution

I have seen a few plugins around the net that provide similar functionality, but nothing was light enough or simple enough to just do what I wanted. So far I have managed to avoid any custom plugins for the site - the exception of course to jQuery and JQM. I managed to get some code working, that works really well, and it's based not on the scroll event, but the _mousewheel_ event. This subtle difference meant not having to use a timer to prevent additional scroll 'clicks'.

Assigning a listener it is then possible to work out an up or down scroll event, making it entirely possible to add in the scroll to code. Below is the scroll to next function I used: 

```js
var offset = prevWaypnt.data("offset");
if (offset == undefined) {
  offset = 0;
}
$('html,body').animate({
  scrollTop: prevWaypnt.offset().top - offset
}, 1000);
nxtWaypnt = prevWaypnt.next();
prevWaypnt = prevWaypnt.prev();
```

You'll notice the use of 'offset' which is picked up from a custom attribute in the waypoint element. This means that HTML5 can be used to set the offset, so say you want the page to be scrolled half way up - `data-offset` can be set to a number.

## Plugin

Having learnt the majority of what I know from the coding community, I wanted to give something back. Deciding this bit of code was unique enough to suffice, I put it on GitHub. I'm amazed by this process, it totally changes your mindset. Because you're making it public - and what's more, work to be used by peers - I found myself critically reviewing code. Several changes were made just from issues highlighted when producing some tutorials, and I love it.

You can find it [here](https://github.com/SvenPam/Simple-Waypoint-Scroll).

## Issues

A few problems specific to the site have cropped up and again, it was sadly to do with jQM prefetching and caching pages. Fortunately I have managed to resolve the problem with

```js
$.mobile.ajaxEnabled = false;
```

This essentially disables AJAX navigation for all links on a page.

Finally, I've discovered the SWPS user scroll disable does not work on Firefox. This is due to Mozilla (the only browser) not supporting `document.onMousewheel` which is a shame. I'm sure to come up with a workaround though, I believe it lies with `DOMMouseScroll`.
