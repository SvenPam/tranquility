---
title: "Site 3.0"
description: "The server side gets a face lift!"
date: 2017-04-23T15:39:30
topic: Site
tags: []
---

Over the last few months I have been working on a couple of personal projects. It's always a great feeling starting a new project, I'm sure any developer would agree. Initially, I was asked to build a site for a close family friend's local church. This really set a snow-ball in motion that prompted another serverside overhaul.

## Church Site

### Bootstrap

The church site is still a work in progress, but it allowed me to get to grips with a new framework. I chose Bootstrap as it looked like a great, simple framework to use and of course a lot of sites use it. I have used a few different frameworks in the past, but I have really enjoyed using Bootstrap. Firstly, since starting work at Swansway I have learnt how to use the LESS pre-processor so I have really been able to admire the work that has gone into variables and mixins. Furthermore we have recently been dissecting the framework to help re-design our dealership sites to support a mobile-first design. Being able to discuss the techniques used by the Bootstrap team with our designer has provided a much deeper insight.

### CMS

The CMS I use for this site is a little lacklustre, so I had to do an overhaul to make it a lot more user friendly, as I will soon not be the only person to use it. The church site has to incorporate several more object types; events, notices and pages in addition to blog articles. It also meant I had to address some of the outstanding SEO issues – namely that of canonical URLs, which used to use IDs only. I’ve also extended the site security to accommodate multiple roles, granting the ability to manage peers as an admin and giving only access to contribute as a contributor. This allows me to almost totally abstract site management to managers at the church.

### Design

One interesting problem I overlooked was the design and UX of the site. I’m not a full designer, predominantly I am a developer but I’m sure every design 101 book would state you need to address your target audience. In the case of the church site, we would be looking at users who are likely less adept to using the modern web. It has been rather difficult to design a clear and usable interface, but a fun challenge none the less.

## Tower to Tower

My friends and I decided we would take on another endurance challenge for charity, this year in the form of cycling from Blackpool Tower to the Eiffel Tower. I thought I would take the opportunity to build a site to promote the event. Again, this presented another great opportunity to try something new, it was also the project that pushed the main site overhaul.

<p style="text-align: center;"><img src="/a/dist/img/t2t.png" alt="" width="800"></p>

### Skeleton CSS

Another framework! Skeleton CSS is the self-proclaimed dead simple, responsive boilerplate. Not so much a framework I suppose, but similar. As light as Skeleton is, I found the syntax to be really odd and the grid system to be rather rigid.

Frustratingly, the grid system requires that each row be explicitly wrapped. This may well be great with static content, however not so great when it comes to dynamic content. It can make looping content difficult and borderline impossible to make responsive.

The default design though, is beautiful and the Raleway font makes an excellent choice. It also really highlights the sheer amount you get at the get-go with other frameworks like JQM and Bootstrap.

## Overhaul

So with three sites almost ready to go, why pay for three servers to host? At work we run all of our sites from one application. As far as all our customers are concerned, they are looking at a site unique to the dealership and I wanted to replicate a similar experience.

To do most of the legwork, I created a base controller. This is a common technique I discovered at work and one I have seen frequently spoken of online. The base controller can be used to extend controller functionality allowing to handle domain names to set data and views accordingly.

This has subsequently led one MVC application to handle this site, T2T and the soon to be church site. All in a day’s work eh?
