---
title: "Dynamic Serving and Performance"
description: "At work I have been working on dynamic serving and performance and have produced some great results, in this article I talk about the work I have been doing."
date: 2017-04-23T15:41:08
topic: Guide
tags: []
---

Early this year we began the process of optimising our sites for mobile devices. That's not to say we weren't already mobile but there is a difference between **responsive** and **dedicated** pages for mobile devices.

In 2013 we began the process of migrating from Web Forms to MVC, whilst totally redesigning all our sites to be responsive. This goal was achieved late last year and already, we reap benefits of having an easily changeable code base and loosely coupled components. Responsive sites serve all our customers, and given that analytics reports nearly a third of our traffic now comes from mobile, and a quarter on tablet this decision has proven invaluable. Some of our sites have **over** 60% of traffic on mobile devices.

Responsive is great, but has its drawbacks. Every client is served the same data; if it's too much for a small viewport, styles are used to hide it. Our small web pages look great, but what's the hit on performance? Mobile devices are that: **mobile**. As developers we should, therefore presume a client does not have solid fast connection; but could in fact have sketchy 3G or worse. In coalition with Marketing we pondered the thought and decided to go fully mobile. What we actually opted for is something called _dynamic serving_.

> Dynamic serving is a setup where the server responds with different HTML (and CSS) on the same URL depending on the user agent requesting the page. - [Google](https://developers.google.com/webmasters/mobile-sites/mobile-seo/configurations/dynamic-serving)

Dedicated mobile pages can be problematic as it's difficult to reliably determine a device type on the server as browsers can lie about their true identity. Fortunately, already having a responsive site means devices that fall through mobile detection will not be hindered. This should be an important consideration to take before going mobile.

## How Did We Do It?

Starting from the top, we worked down. At Swansway we use a base controller to handle all requests before any other action is executed. Here I set logic to make the application "device aware". One rule we laid out before this began was: a customer must still be able to access the responsive site. It is here the application checks for the presence of a cookie, to see if the client has requested our desktop site. As we are dynamically serving pages, it's imperative to set HTTP headers that reflect this, lest search engines accuse our sites of cloaking. Finally, to do all this I created a function which will return the correct view and [HTTP Vary header](https://developers.google.com/webmasters/mobile-sites/mobile-seo/configurations/dynamic-serving) should it be required.

Moving onto the _views_: I created a new set of layouts, which look the same as our responsive sites. Behind the scenes, all desktop-only components have been stripped out - as have resources used only on desktop.

<p><img src="/old/sg-mob.png" alt="" width="607"></p>

This laid the foundations for the rest of the site, I have since totally redesigned three of our core pages specifically for mobile. One of my main objectives was optimising _above-the-fold content_. The term is used to describe content which appears in the viewport before any scrolling occurs. Google has said it's important and can/will penalise you for bad implementation. The concept is that for the best user experience (UX), content which can be seen first, must load the fastest.

Where possible, I have tried to load textual data before images. The theory being that the perceived experience of the site is faster as a client isn't waiting for an image to load. With the pages being specific to mobile I have also been able to build components specific to mobile UX: toolbars, button groups, card carousels. This has enabled more content onto the screen and reduced vertical height.

<p style="text-align: center;"><img src="https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAANEAAAAJDcyYTY0ZDI1LTQyODMtNDA4Zi1iOTgxLWUxOTgxMjE4YjZjNw.png" alt="" width="273"></p>

On the search page, I heavily modified our JavaScript to load in content into the page, saving a full round trip to the server. Nearly all the functionality of our desktop site has been retained, and placed into clear, touch friendly button groups.

A summary of each vehicle is provided, the information given is enough to give a good overview, but not so much that the user is overwhelmed or space of other vehicles is sacrificed.

On the info page, textual information is prioritised - the image gallery is loaded further down the page. The look and feel is similar to the search page so users are familiar with controls and actions. In the gif (right), you can see the carousel cards in action.

<p>&nbsp;</p>

## Performance

Over the last few months, we have really driven focus on the results of Google Page Speed Insights, and have been marking the impact of changes against previous scores. We figured this an important metric for a great experience on mobile (and Desktop).

My manager, Dave has been working on optimising the site as a whole and has built a lazy-load plugin, allowing us to load images below the fold after page ready. This has a drastic effect on performance, as the page is ready so much sooner. We've replaced many images on the site with the HTML5 picture element, allowing the browser to choose the image for the viewport size. This means small devices are not loading weighty images. To support legacy browsers, another plugin Dave wrote replaces picture elements with an image best suited to that viewport. We plan that in the future we may also take screen DPI into account, but support is not widespread just yet.

<p>&nbsp;</p>

We have managed to pull sites out of the red and into the yellow, and we're now working with vendors to get external scripts and styles minified which we're hoping will get us into the green. Sadly, we have to use Modernizer to ensure legacy browser support at the cost of a "render blocking script".  We're also working on optimal browser caching. Overall we have seen speed of our sites double because of this work on optimisation.

<p style="text-align: center;"><img src="https://media.licdn.com/mpr/mpr/AAEAAQAAAAAAAAOOAAAAJGFmMmFiMmY1LWE4ODYtNGUwOS05NWJhLTBjOWUwNjQ5MzhhYw.png" alt="" width="700"></p>

<p>&nbsp;</p>

I believe Swansway is paving the way for optimised mobile, we are one of the few groups dynamically serving web pages to clients. We'd welcome any feedback, so please check our sites out! For the full experience this article discusses, try it on your phone.

 [www.swanswaygarages.com](http://www.swanswaygarages.com) is the best place to start - it leads to all our brands.

<p>&nbsp;</p>
