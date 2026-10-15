---
title: "Site Redesign - The Reckoning"
description: "Write up for the latest iteration of site design, encompassing a lot of what I have learnt over the last few years."
date: 2017-04-23T15:42:16
topic: Site
tags: []
---

So, I finally got around to redesigning my website. It’s been a long time looking like this:

<div class="col-xs-12">
<div class="browser-mockup">
<div class="iframe-container"><iframe id="test" src="/?domain=old.ste-pam.com"></iframe></div>
</div>
</div>

Four years, in fact. A lot has changed between then and now – I’ve graduated, and got a full time job.  In that four years I have learnt so much more about web development, and one area that has really blossomed has been my understanding of front-end design, UX and development. This latest redesign (I hope) captures a lot of what I have learnt.

## Design                                            

Ask me what I thought of web design six years ago. Odds are, I thought it was a load of old tosh _creatives_ spent their time on. Walk a mile in someone else’s shoes and all that… Now I have a real deep appreciation for designers everywhere. In fact, I get a little envious, I wish I could design as well as some of the amazing work you get to see today.

The last redesign of my site was good, certainly better than the very first iteration. A lot of it was taken from other people’s ideas and the theme was very much directed by the jQuery mobile framework I used. In this latest version, I really focused on design consistency, a minimal look and something that I purely designed. Whilst the design is mine, I hope I have encapsulated current web trends of 2015/6.

### Style Architecture

I have entirely re-written the site styles. In doing so, I have utilised my expanded knowledge on style architectures.

Firstly, I’ve used the LESS pre-processor, a skill I have picked up whilst working at Swansway. I know; “LESS? That’s _sooo_ 2010, you should be using SASS!”. It’s what I know, but I promise SASS is one of my goals this year to learn. I love pre-compilers and I often look back and wonder how I ever used _vanilla_ CSS, LESS is so powerful and so clear.

I have harnessed the power of Bootstrap for the site, which makes starting afresh so much easier. Using the LESS sourced version also makes it extremely easy to remove code for unused components, and so the size of Bootstrap on this is greatly reduced.

CSS3 experimentation has been a real fun thing I have done with this update. I understand, that support across browsers is not so wide just yet, but my site isn't for people still on XP. Horses for courses! Here are a couple of neat things I did on the site.

#### Odd Even Pseudo Selectors

The whole site is built around this dark/light theme and it’s all based on this glorious odd even selector.

```less
.section-group {
  ...
  > section:nth-child(odd) {
    background-color: @gray-darker;
    color: #FFF;
    padding-bottom: 20px;
    ...
  }
  > section:nth-child(even) {
    background-color: @gray-lighter;
    ...
  }
  ...
}
```

Easy _peasey_.

#### :after and Data Attributes

For my [CV](/cv), I made use of timelines. To get the dates in I made use of data-attributes and `:after` elements.

```less
.timeline {
  ...
  .epoch {
    ...
    &:before {
      ...
      content: attr(data-year);
    }
    ...
  }
}
```

I know these functions are quite obvious when people say they “know CSS3”, but I’d like to think I have utilised them pretty well.

### Media Queries

I have used these quite liberally across the site and not just in the responsive sense either. I wanted to move to a HTML CV - I work with the web, so why shouldn't it be built with HTML? This presents the problem of printing unnecessary web elements that mean nothing on paper. No worries, just use the `@media print` and Bootstrap’s `hidden-print` then we’re golden! Check it out, click print above my [CV](#cv).

### Images

I love the hero image trend many sites use, I thought I would use it myself. All the pictures across the site are ones I have taken whilst adventuring in the UK. The trick of sliding them behind content was as simple as fixing a div. They are a little contradictory to this next part…

## Performance

I have written about what I have done at Swansway to increase performance, and now I’ve dramatically carried it over to the site. I suppose it’s cheating given that the functionality of this site is relatively simple and consistent, nonetheless the home page – at least – is in the green in page speed insights.

<p style="text-align: center;"><img src="/old/page-speed-screen.jpg" alt="" width="800"></p>

The site is running through Cloudflare, images are optimally sized and I have reduced styles down as much as possible. I’ve taken things to the next level though, and removed jQuery on all but my blog index. For what I was using jQuery for (mobile site nav) it wasn’t worth pulling down jQuery just for that. Lazy loading articles on scroll though, was a good use case.

## Hands Up!

I’m going to admit now however, I hate the desktop site navigation as it is. In hindsight it was a terrible idea, and I just wanted to make use of a pure CSS fixed menu. I’m going to redesign it before long.
