---
title: "C# 6.0 Features"
description: "We have been upgrading our server to the ASP.NET 5, here are some of the things I have learnt."
date: 2017-04-23T15:42:43
topic: Interesting
tags: []
---

It has been an exciting time at Swansway, over the last few months we have been upgrading our server stack to the latest iteration of ASP.NET.  Here are some of the new features I have been making use of.

## Roselyn

The brand new compiler MS built now means we don't have to build projects anymore! Made a change in compilable code? No worries, just save and refresh the page.

## Easy Publish - wwwroot

<p>&nbsp;</p>

This is a great change in this iteration, and totally separates out stuff we really don't want or need to publish. This root folder literally represents the root directory when the application is running. In previous versions it has always been manic trying only publish files that we want, now we don;t have to worry about that.

<p style="text-align: center;"><img src="/old/wwwroot.jpg" alt="" width="249"></p>

## Project.json

Bye bye XML solution file, that always broke everything in source control, hi project.json and siblings! Now project specific stuff sits completely away from web.config too!

## Auto Property Initializers 

<p>&nbsp;</p>

We can now default properties!

<p>&nbsp;</p>

<pre>   <strong>public</strong> class VehicleWrapViewModel      {          <strong>public</strong> Vehicle Vehicle { get; set; }          <strong>public</strong> bool UsesCarrousel { get; set; } = <strong>false</strong>;      }  </pre>

We can use lambda to make function calls as well!

<p>&nbsp;</p>

<pre>  <strong>public</strong> class Document      {          ...      <strong>public</strong> string ShortTitle =&gt; GetShortTitle();          ...      }  </pre>

<p>&nbsp;</p>

## String Interpolation

We've all used string.Format in the past, or even worse tried the old "I am a " + sizeString + " hat" but now, there is no need and we don't have to play a bizarre crossword. Behold

<pre>  $"images/brands/{Env.CurrentManufacturer.ManufacturerCode}/logo.png"  </pre>

## Null Conditional Operators

Hands down, the best feature yet. It's always been a pain to have to check an object is null before trying to access one of its fields. But, not more!

<p>&nbsp;</p>

<pre>   _keys = keysAccessor?.Value;  </pre>

In this instance, \_keys will be set to null if keysAccessor is null, oppose to a null exception.

<p>&nbsp;</p>

<p>&nbsp;</p>
