---
title: "POST Multiple Images to C# Server"
description: "Winning the good fight against POSTing multiple images via jQuery AJAX to a C# Server."
date: 2017-04-23T15:45:17
topic: Guide
tags: []
---

Today I had to work with multiple images in a HTTP POST, which all got rather complicated. Originally, I was using jQuery to serialize a form and wing it off to the server for me. It saved me doing a full page POST from a form, and meant I could add a customer message to a conversation via widget.

Enter, images – multiple images. So jQuery trips up when it comes to forms with the enctype = "multipart/form-data" attribute. It won’t serialize, your image(s) at all, meaning they just aren’t sent in the request.

Long story short, here is the solution (I haven’t tested this):

## Form Data

I make use of the HTML5 [Form Data](https://developer.mozilla.org/en-US/docs/Web/API/FormData) object; this is [not supported in older browsers](http://caniuse.com/#feat=xhr2). The best fallback would be to check is typeof FormData === "undefined" and just do a normal form POST – you can’t use multiple file uploads anyway. FormData simply creates a valid XMLHttpRequest of key value pairs the server can read.

<p>&nbsp;</p>

## AJAX Options

The other important bit is the properties set in the AJAX call. Setting contentType:  false means jQuery will not wrongly set HTTP content type header. Setting processData: false means the FormData object will not be processed wrongly into a string.

<p>&nbsp;</p>

## C#

The rest is up to you, the type of object sent in is [HttpPostedFileBase](https://msdn.microsoft.com/en-us/library/system.web.httppostedfilebase%28v=vs.110%29.aspx?f=255&MSPPError=-2147217396), which you can just take a list of and do with as you please.
