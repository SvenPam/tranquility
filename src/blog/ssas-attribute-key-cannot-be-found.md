---
title: "SSAS - Attribute Key Cannot be Found"
description: "This is how I fixed \"The attribute key cannot be found when processing: Table X\" error in Visual Studio 2012 Microsoft Business Intelligence."
date: 2014-04-24T20:36:51
topic: Guide
tags: []
---

This week I have been fervently working away at three assessments that are due tomorrow. My Advanced Databases module this semester has been all about the hot topic of Big Data Analytics and Data Mining. Here is a little problem I came across when using Microsoft Business Intelligence in Visual Studio 2012.

## Context

This problem will be in regards to the Adventure Works 2012 Data Warehouse as this is the data this assignment has been based on. One of the things I have been working on has been hierarchies in the Product dimension, this is where I first came across the deployment error.

## Problem

If you’re familiar with SSAS in Visual Studio you may come across the infamous:

<div style="background: #eee; color: #212529; border: 1px solid #ccc; padding: 5px 10px;">Internal error: The operation terminated unsuccessfully.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>

 and

<div style="background: #eee; color: #212529; border: 1px solid #ccc; padding: 5px 10px;">Server: The current operation was cancelled because another operation in the transaction failed.</div>

Errors. It is not very much help at all, the debug manager is only telling you what you already know. The trick here is to keep an eye on warnings, and lo and behold in this instance one specific warning led me in to a Crime Noir style solution hunt:

<div style="background: #eee; color: #212529; border: 1px solid #ccc; padding: 5px 10px;">Errors in the OLAP storage engine: The attribute key cannot be found when processing: Table: 'dbo_DimProduct', Column: 'EnglishProductName', Value: ' Adjustable Race'. The attribute is 'English Product Name'. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</div>

The first thing I did was hit Google, and try to find an answer. Sadly the closest I got to a solution was a comprehensive article by [Todd McDermid](http://toddmcdermid.blogspot.co.uk/2009/01/ssas-quick-reference-attribute-key.html), this was the weapon in the mystery I was to solve.

Taking a look at the actual warning shows the problem lay with the Product Name, and that value was the very first one in the Product table. I deduced this meant that nothing could get past this first value, and processing of the dimension was breaking immediately.

So remember that weapon? Well Todd mentions that the dimensions should be processed prior to the cube structure.

## Solution

The solution (for me) was to right click the Product dimension and select “Process”, you can then play with the process settings, click “Change Settings…” in the bottom right.

1.  Go to the “Dimension key errors” tab, check the “Use custom error configuration”.
2.  Then for all the “Specific Error conditions” drop-down lists, select “Ignore Error”.
3.  Process the dimension, then deploy the project and voila! It works.

I will add, this was done in an **academic environment**, using sample data. <ins>I do not understand why this worked nor if there are any repercussions</ins>. So follow the above steps at your **own risk**, and try Todd’s solutions first, before the above – he seemed to know a lot more than I!
