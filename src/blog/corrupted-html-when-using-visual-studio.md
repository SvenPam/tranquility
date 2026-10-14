---
title: "Corrupted HTML when using Visual Studio"
description: "The solution to HTML being corrupted into broken Unicode when being passed down to the client."
date: 2017-04-23T15:36:50
topic: Guide
tags: []
---

Ever had this problem?

<p><img style="height: 435px; width: 947px;" src="/res/corrupted-html.png" alt="" width="100%"></p>

I just did, and it’s horrible! When I initially saw it, it was in such a niche part of our CMS that it looked more like a bug with our code rather than anything else. We spent a formidable amount of time as a **team** to try and solve the problem, yet everything from the Razor view to the data in SQL looked totally fine. The issue was prevalent in all browsers, and what made everything more bizarre was reverting to previous versions didn’t fix it, nor could it be replicated on other machines.

It has to be something wrong with my machine, right? So we begin disabling all my browser extensions, and Visual Studio plugins… nothing. Perhaps it is IIS that is doing the deed? We reinstalled IIS express – nothing. We switched to local IIS and still, nothing! By this point it had fast approached home time and we weren’t getting anywhere.

<p>&nbsp;</p>

So this morning I came to work, with gloom in my heart at the thought of having to tackle this problem all over. Sat at my desk, logged in, then did another quick google: “corrupted html visual studio”, I typed. Lo! A [Stack Overflow Question](http://stackoverflow.com/questions/20697329/visual-studio-2013-produces-garbled-corrupted-wrong-encoded-html)!

> Uncheck _Enable Browser Link_ and reload the web page (rebuild shouldn't be necessary).

User _esker_ exclaimed, so I tried it. Checked out the page again and a miracle! It works! Sometimes I question my sanity as a developer when stuff like this occurs, but then you sleep on it and the problems all go away. Hope this might help you poor stranger!
