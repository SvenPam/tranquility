---
title: "Just Giving API and T2T Redesign"
description: "Talking about my creative process for redesigning T2T and about how great JustGiving dev support is!"
date: 2017-04-23T15:44:38
topic: Site
tags: []
---

We’re cycling to raise money for Mind this year, so it was also a good time to redesign the _T2T.bike_ site I made last year. So last year’s build was done on Skeleton.css, which I spoke about in this [article](/blog/site-30), but now I have firmly grounded myself with Bootstrap it seemed better to use that. To save some time, I used this site as a foundation.

## Design

It’s always fun to start a new project – if not a little daunting. I didn’t really know what I wanted at first, so built everything up from picking a font and a colour palette. That’s really where the whole sort of _hero_ theme came from. I saw the [Bangers](https://www.google.com/fonts/specimen/Bangers) theme, and thought yes! That is the font for our cycle!

Everything really took off from there, and it’s all been built on to that. I loved last year’s hero video and wanted to carry that across to the new site, with a jazzed up texture overlay. I roped in my designer colleague to help me with some flat graphics and I have expanded my knowledge of SVGs to build some flags and optimise the original _.eps_ files of the graphics sent to me.

<div class="browser-mockup">
<div class="iframe-container"><iframe id="t2t" src="//t2t.bike"></iframe></div>
</div>

I really like how it came out, and it’s a really good template for any generic charity site. All the CTAs I feel are well placed, and swap out some fonts and colours and the site is totally different. Fresh!

## Development

### Email Subscriptions

The project wasn’t just design either, it has required a little extra development work. I’ve added email subscription to the site and integrated it with the existing email notification system. This took away the convoluted steps of registering a formal account, and made things a lot easier. Of course this also included adding actions to manage unsubscriptions.

### JustGiving API

To get the donation meter on the front page I had to make some changes as well. Last year I really struggled to get the donations from _JustGiving_ directly, and resorted to using a third party API to pull down the information through JavaScript, client side. The obvious implications of this were sometimes the API I used failed; and, as the scripts to do this ran on page ready there was always going to be a delay in getting what should have been real-time data. Unfortunately, the API I used went down at some point between now and then, so I had to start from scratch. However, it looks like _JustGiving_ have been on the ball in that time, and they’ve built a full on API and SDK for an array of platforms including .NET. You can find their work on [GitHub](https://github.com/JustGiving/JustGiving.Api.Sdk), which is really cool of them to open source.

I wanted to have the data on my server, so pages would be served as quickly as possible, and it looks like the API may still be in beta – sometimes the server times out. To get round this, I have every visitor update a JSON file for the next visitor. Sounds a bit weird right? Thought so.

#### Here’s What I Did

I installed the SDK and built an action in a controller. The action simply makes use of the _JustGiving_ API to get the latest charity info. It then writes this as JSON to a file on the server, and then returns the latest amount raised. The full process that occurs when someone visits the home page is:

1.  Read values from the file on the server and write them to set them in the home page view model.
2.  Render the view with these values.
3.  On page ready, fire off a GET request to the action I spoke about.
4.  The action updates all values in the JSON file, returns the latest amount.
5.  The client then updates the value on the page.

By doing this, everyone gets the information real-time. Anyone without JavaScript will still get a stale value. Win win.
