---
title: "Web Config Transform"
description: "Web Config with Visual Studio configuration environments."
date: 2017-04-23T15:36:18
topic: Guide
tags: []
---

One thing that I don't have much exposure to is application deployment - it is a **huge** part of applications, but with it really only needing to be done once; it's not something that is frequently used. Naturally this means a lack of experience on my part, further compounded by the fact any existing applications that I maintain are already set up. A side project I have been working on has recently highlighted this knowledge gap.

## Web.config Transformation

It's common practice in development to have multiple environments - we do this to avoid totally wrecking stuff when testing or prototyping software. The minimal setup is of course a dev and release environment. This is really useful when you want to "user test" systems with bizarre or unexpected values, you can trash dev data with no consequence to live data preventing "TEST" or "Hello World!" making its way into the wild.

<span style="line-height: 1.6;">What's this got to do with <a href="http://msdn.microsoft.com/en-us/library/dd465326(VS.100).aspx">Web.config transformation</a>? Well... connection strings - in a nutshell. Scott </span> <span style="line-height: 1.6;">H</span>anselman the eponymous face of ASP.net wrote a [great article](http://www.hanselman.com/blog/WebDeploymentMadeAwesomeIfYoureUsingXCopyYoureDoingItWrong.aspx) on the ins and outs of `Web.config` Transformation. What I couldn't do was get it to work, well as it turns out, I was using it wrong. I _had thought_ it was possible to do it with environment configurations in Visual Studio, alas no! Scott actually tells you this in his talk that the transformation only occurs with deployment. 

I did some more digging around to try and find out a little more information on why the default is release and debug (coincidentally the same as default Visual Studio profile name) and here is what I found:

> **web.config** This is the config file which developers should use locally. Ideally you should get this to be standardized. For instance you could use localhost for DB strings, and what not. You should strive for this to work on dev machines without changes.
> 
> **web.debug.config** This is the transform that is applied when you publish your application to the development staging environment. This would make changes to the web.config which are required for the target environment.
> 
> **web.release.config** This is the transform that is applied when you publish your application to the "production" environment. Obviously you'll have to be careful with passwords depending on your application/team.
> 
>     - <a href="http://stackoverflow.com/users/105999/sayed-ibrahim-hashimi">Sayed Ibrahim Hashimi</a>

Sayed really sums it up, and the whole thing instantly makes a lot more sense!
