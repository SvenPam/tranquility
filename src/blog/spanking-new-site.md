---
title: "Spanking New Site"
description: "Site Overhaul, come see what's new!"
date: 2014-01-20T17:04:00
topic: Site
tags: []
---

So recently, I totally hauled ass on the site as I am sure you’re astute enough to notice having seen the older site. The reasons for this came in three parts; firstly, from the outset I hated the original design. I keep telling people I am no designer, but I think there is some passion for it somewhere inside me. I had intended the old design to be a “.NET style”, yet it only achieved being dreary and dull. Furthermore, since developing for Android and playing with a few other techs, I don’t want to get too tied down with just .NET.

The second reason, is for my Rich Internet Apps assignment. They want an application that demonstrates the use of jQuery mobile and responsive design, with an MVC and MVVM server side. I am leaving the MVVM part for a Windows Store App, but the site is now running on a Razor .NET MVC framework, making full use of EF6. This was really fun to do – I had no idea how much easier it is to maintain. Sure it took some getting used to, but considering the bad habits I picked up doing SQL through strings, LinQ is a lot better; as is abstracting the data layer.

Which leads me on to the final reason for change: new technology. After seeing all these neat techs in use in my Rich Int lab sessions, I really wanted to employ their use realistically. So here we are.

Welcome to my new site.

### So what’s New?

Good question! As you can see, the colour scheme has changed; and the whole site looks a lot brighter.

As I mentioned before, the server end is all new and shiny and you see the effects of that through the URLs. You’ll see the use of `{controller}/{action}/{id}` throughout the site.

I have an entirely new [About](/home/about) page, again to reflect the clean look of the site; plus the previous one was an awful block of text. I didn’t feel it incited a lot of thought about my persona. It has this nifty little custom scroll, which if you check the JS is nothing too special. It’s a dirty hack at best, and I will be revisiting it when I have the time.

You’ll also notice a new footer on desktop and tablet. Again, this was to clean the look of the site, and provide a means for navigation when you get to the bottom of the page. On my TODO list, is to get that data added to the panel in mobile.

I still have a few bits and pieces to touch up, but that will all come in due time.

If you have any thoughts, or you spot a bug/typo leave a comment! Oh… did I mention I switched to Disqus? The UI and social network integration made for a much better way for comments than the Facebook plugin.

That’s all folks!
