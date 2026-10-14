---
title: "Site Update 3"
description: "Site using MVC5 ASP.NET authentication and implementation of an email notification system."
date: 2014-04-03T12:26:16
topic: Site
tags: []
---

Hey folks!

I have been spring cleaning the server side over the last few days, and you may have noticed some changes go live on the site this week. 

## CRUD and WebAPI

Initially I was creating blog posts by an editor and good old fashioned HTML, this then had to be parsed through a line break removal system then inserted into SQL. Quite laborious indeed! I just never had time to fix it up, and it didn't matter too much. Since this weekend though, that has all changed.

### Introducing CRUD

[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) in the world of HTTP makes use of the request types available, and that's pretty much what I have done with the site's blog controller. As an admin, I can now create, update and delete articles; which is extremely helpful - especially when integrated with the JavaScript HTML editor [CKEditor](http://ckeditor.com/).

### WebAPI

The changes to this only affect the in-dev Windows Store App version of the site I am creating; simply amended to reflect the changes made with CRUD.

<p>&nbsp;</p>

## Authentication

This is extremely crude at the moment, but should lay some foundations for future extension. It was mainly added as a way to secure the above CRUD functions, but I figured it would be quite a neat way to store some email addresses, so you can get a notification when I update my blog.

I am going to post some more in-depth detail regarding this as there isn't much up-to-date stuff on the web. In short, the system is built on the [MVC Identity](https://www.asp.net/identity/overview/getting-started/introduction-to-aspnet-identity) and [OWIN](http://owin.org/) (and OAuth) frameworks. The OWIN part is implemented but not used; I figured the only appropriate place for external authentication would be for comments - but DISQUS does the job well enough.

<p>&nbsp;</p>

## Notification

This was pretty sweet to work on. If you [register](/account/register) with my site, you will receive an email with a summary of the new blog. I based it on the HTML template I built a year ago for SABIC - making some minor style and optimisation tweaks. What I like so much about what I did, was making use of a view model to generate the email. So feel free to register an account, I am sure at some point I will be adding some features that will apply specifically to authenticated users.

<p>&nbsp;</p>

## General

I've also fixed some of the bugs I have found on the mobile and tablet versions of the site. The biggest gripe I had was the horrid blue glow that stuck on focused buttons - which on mobile IE happens just from scrolling.
