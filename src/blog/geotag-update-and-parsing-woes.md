---
title: "Geotag Update and Parsing Woes!"
description: "Get Geotagging with Miru!"
date: 2014-02-26T19:34:01
topic: Project
tags: []
---

A wild pump appears! You have Miru in your hands, and so far it’s been working out great – but it looks like someone missed this pump, what next?

### Geotagging

Fear not! Because this week I implemented the Geotagging function for Miru and it’s looking great:

<p><img style="width: 100%;" src="/old/miruscreen5.png" alt="Geotagging dialogue."></p>

With a tap here, and some typing there you can now start mapping your plant. Currently – with the scope of the project we’re only storing this on the device and there is no way to add full data. Let me explain this decision; realistically not everywhere has a [GIS](https://en.wikipedia.org/wiki/Geographic_information_system) – certainly not with our main client, SABIC. So the plan is to let operators and maintenance teams get out on the plant and _bosh_ in some geo data. As long as we have functional locations, the instrument/asset data can be hooked up to our lat long later.

### Data Transfer

This has proven to be a little trickier than I had intended. I had planned that I could whip out an XML parser to serialise then deserialise device data. Alas! T’was not the case.

_The problem?_ Miru stores all instruments in one place – a static collection of Instruments… only with our instruments being all different things, it becomes a collection of different objects. This is where various parsers fall flat on their rear sides.

**What have I done so far?**

I started with XML, but as it turns out there isn’t much native support in Java. Furthermore, the libraries that extend XML parsing functions are huge and are way beyond the needs of Miru. Using them would mean bloating the app out – not good for scalability.

I tried using the `XMLPullParser` as [suggested by Google](https://developer.android.com/training/basics/network-ops/xml.html), but I was unsuccessful.

Next I tried using JSON, in many ways it would actually be better than XML; it’s more modern, less verbose and lightweight by comparison. There was a great quote to XML in this [SO question](http://stackoverflow.com/questions/3536893/what-are-the-pros-and-cons-of-xml-and-json), but I digress. Again, I met many more of the same problems I found with XML; although I was able to actually parse the collection into JSON.

I have yet to put more effort into this, so it’s not the end of the world, watch this space!
