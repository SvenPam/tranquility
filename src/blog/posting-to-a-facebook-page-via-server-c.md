---
title: "Posting to a Facebook Page via Server (C#)"
description: "How to post to a Facebook page, as the page using C#."
date: 2017-04-23T15:38:20
topic: Guide
tags: []
---

Recently I have been working on a new project at work, which has been a little bit of a beast. The project is to post messages on behalf of the business as the profile of the business itself. In this article I will discuss the steps I took to create the Facebook module.

## Facebook

Facebook is the more structured of social networks, having an official business profile in the form of a page. Pages abstract function away from a user’s personal profile - this however means more steps are required to successfully send updates.

### Set Up Facebook and Get Keys

First things first, you’re going to need Facebook to be set up and good to go. This requires an account, a business page and a Facebook application. This is mostly self-explanatory, you’ll have to ensure your account is registered as a developer account before creating the Facebook application. The application needs to be a Web application, Facebook walks you through the rest. At the end of the process make sure you have the AppID and SecretID handy.

Getting the correct permissions and tokens is paramount to this working, and the trickiest bit! To get everything you need, head to the [open graph explorer](https://developers.facebook.com/tools/explorer/). If you haven’t used it before, it’s basically an object browser for Facebook, more importantly it will give us the page access token. I found the answer to this on [StackOverflow](http://stackoverflow.com/a/8235011/2818648), and tweaked the answer here to make it a little clearer:

1.  Choose your app from the dropdown menu.
2.  Click "Get Access Token".
3.  Choose the manage\_pages and publish\_actions permissions.
4.  Enter me/accounts into the get field.
5.  This will give you the page ID and the page access token. You might have to add access\_token to the search fields.

Now we have the permission to post, the page token to represent this access and the ID of the page we’re authorised to post to. In testing I noticed some key differences in how the tokens works, using the initial access token results in posting to the page as yourself. Using the page access token means you will post as the page.

### Accessing Facebook Through .NET

The next step is add it to your MVC application. I’ve been adding the API stuff to a library, but doing it through models in the MVC app would be just as easy to do. To skip any hassle dealing with OAuth and the Facebook SDK I have installed the unofficial [Facebook SDK](http://facebooksdk.net/) using nuget. Run Install-Package Facebook -Pre in nuget, and you’ll be well on your way!

I’ve created a class, and added a function to do the post. The code is pretty simple, the variables should be easy to recognise. Here is my Facebook functions below, firstly the function to post to Facebook:

<div style="background: #272822; overflow: auto; width: 100%; border: solid gray; border-width: .1em .1em .1em .8em; padding: .2em .6em; font-size: 12px;">
<table border="0">
<tbody>
<tr>
<td>
<pre style="margin: 0; line-height: 125%;"> 1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28  29  30  31  32  33  34  35  36  37  38  39  40  41  42  43  44  45</pre>
</td>
<td>
<pre style="margin: 0; line-height: 125%;"><span style="color: #66d9ef;">private</span> <span style="color: #66d9ef;">static</span> <span style="color: #66d9ef;">bool</span> <span style="color: #a6e22e;">PostToFacebook</span><span style="color: #f8f8f2;">(SocialDealership</span> <span style="color: #f8f8f2;">dealership,</span> <span style="color: #66d9ef;">string</span> <span style="color: #f8f8f2;">message,</span> <span style="color: #66d9ef;">string</span> <span style="color: #f8f8f2;">url)</span>    <span style="color: #f8f8f2;">{</span>     <span style="color: #66d9ef;">if</span> <span style="color: #f8f8f2;">(dealership.HasFacebookCredentials)</span>     <span style="color: #f8f8f2;">{</span>      <span style="color: #66d9ef;">dynamic</span> <span style="color: #f8f8f2;">messagePost</span> <span style="color: #f8f8f2;">=</span> <span style="color: #66d9ef;">new</span> <span style="color: #f8f8f2;">ExpandoObject();</span>      <span style="color: #f8f8f2;">messagePost.message</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">message;</span>      <span style="color: #f8f8f2;">System.Uri</span> <span style="color: #f8f8f2;">validatedURL;</span>        <span style="color: #75715e;">//Validate the URL, otherwise Facebook will throw an exception.</span>      <span style="color: #66d9ef;">if</span> <span style="color: #f8f8f2;">(!url.IsNullOrEmpty()</span>       <span style="color: #f8f8f2;">&amp;&amp;</span> <span style="color: #f8f8f2;">Uri.TryCreate(url,</span> <span style="color: #f8f8f2;">UriKind.Absolute,</span> <span style="color: #66d9ef;">out</span> <span style="color: #f8f8f2;">validatedURL)</span>       <span style="color: #f8f8f2;">&amp;&amp;</span> <span style="color: #f8f8f2;">validatedURL.Scheme</span> <span style="color: #f8f8f2;">==</span> <span style="color: #f8f8f2;">Uri.UriSchemeHttp)</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #f8f8f2;">messagePost.link</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">validatedURL;</span>      <span style="color: #f8f8f2;">}</span>        <span style="color: #f8f8f2;">FacebookClient</span> <span style="color: #f8f8f2;">app</span> <span style="color: #f8f8f2;">=</span> <span style="color: #66d9ef;">new</span> <span style="color: #f8f8f2;">FacebookClient</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #f8f8f2;">AccessToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAccessToken,</span>       <span style="color: #f8f8f2;">AppId</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppID,</span>       <span style="color: #f8f8f2;">AppSecret</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppSecret</span>      <span style="color: #f8f8f2;">};</span>        <span style="color: #75715e;">//Refreshes the expiry of our access token.</span>      <span style="color: #f8f8f2;">FacebookSetExtendedAccessToken(dealership);</span>        <span style="color: #75715e;">//Make the post.</span>      <span style="color: #66d9ef;">try</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #66d9ef;">var</span> <span style="color: #f8f8f2;">result</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">app.Post(</span><span style="color: #e6db74;">"/"</span> <span style="color: #f8f8f2;">+</span> <span style="color: #f8f8f2;">dealership.FacebookPageID</span> <span style="color: #f8f8f2;">+</span> <span style="color: #e6db74;">"/feed"</span><span style="color: #f8f8f2;">,</span> <span style="color: #f8f8f2;">messagePost);</span>      <span style="color: #f8f8f2;">}</span>      <span style="color: #66d9ef;">catch</span> <span style="color: #f8f8f2;">(FacebookOAuthException</span> <span style="color: #f8f8f2;">ex)</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #75715e;">//Either the AccessKey is wrong or it has exprired.</span>       <span style="color: #66d9ef;">return</span> <span style="color: #66d9ef;">false</span><span style="color: #f8f8f2;">;</span>      <span style="color: #f8f8f2;">}</span>      <span style="color: #66d9ef;">catch</span> <span style="color: #f8f8f2;">(FacebookApiException</span> <span style="color: #f8f8f2;">ex)</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #75715e;">//Usually means a parameter is invalid.</span>       <span style="color: #66d9ef;">return</span> <span style="color: #66d9ef;">false</span><span style="color: #f8f8f2;">;</span>      <span style="color: #f8f8f2;">}</span>      <span style="color: #66d9ef;">return</span> <span style="color: #66d9ef;">true</span><span style="color: #f8f8f2;">;</span>     <span style="color: #f8f8f2;">}</span>     <span style="color: #66d9ef;">return</span> <span style="color: #66d9ef;">false</span><span style="color: #f8f8f2;">;</span>    <span style="color: #f8f8f2;">}</span>  </pre>
</td>
</tr>
</tbody>
</table>
</div>

A call is made to FacebookSetExtendedAccessToken() which will always retrieve a long life token, and set it in the database. By default access tokens last an hour, this is obviously inconvenient when we’re running this in a server application. An extended token last for 60 days, and by calling the function every time a post is made the token will always be refreshed assuming a post is made every 60 days. The function to do this:

<p>&nbsp;</p>

<div style="background: #272822; overflow: auto; width: 100%; border: solid gray; border-width: .1em .1em .1em .8em; padding: .2em .6em; font-size: 12px;">
<table border="0">
<tbody>
<tr>
<td>
<pre style="margin: 0; line-height: 125%;"> 1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23  24  25  26  27  28</pre>
</td>
<td>
<pre style="margin: 0; line-height: 125%;"><span style="color: #66d9ef;">private</span> <span style="color: #66d9ef;">static</span> <span style="color: #66d9ef;">void</span> <span style="color: #a6e22e;">FacebookSetExtendedAccessToken</span><span style="color: #f8f8f2;">(SocialDealership</span> <span style="color: #f8f8f2;">dealership)</span>    <span style="color: #f8f8f2;">{</span>     <span style="color: #f8f8f2;">FacebookClient</span> <span style="color: #f8f8f2;">client</span> <span style="color: #f8f8f2;">=</span> <span style="color: #66d9ef;">new</span> <span style="color: #f8f8f2;">FacebookClient</span>     <span style="color: #f8f8f2;">{</span>      <span style="color: #f8f8f2;">AccessToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAccessToken,</span>      <span style="color: #f8f8f2;">AppId</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppID,</span>      <span style="color: #f8f8f2;">AppSecret</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppSecret</span>     <span style="color: #f8f8f2;">};</span>     <span style="color: #66d9ef;">string</span> <span style="color: #f8f8f2;">extendedToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #e6db74;">""</span><span style="color: #f8f8f2;">;</span>     <span style="color: #66d9ef;">try</span>     <span style="color: #f8f8f2;">{</span>      <span style="color: #66d9ef;">dynamic</span> <span style="color: #f8f8f2;">result</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">client.Get(</span><span style="color: #e6db74;">"/oauth/access_token"</span><span style="color: #f8f8f2;">,</span> <span style="color: #66d9ef;">new</span>      <span style="color: #f8f8f2;">{</span>       <span style="color: #f8f8f2;">grant_type</span> <span style="color: #f8f8f2;">=</span> <span style="color: #e6db74;">"fb_exchange_token"</span><span style="color: #f8f8f2;">,</span>       <span style="color: #f8f8f2;">client_id</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppID,</span>       <span style="color: #f8f8f2;">client_secret</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAppSecret,</span>       <span style="color: #f8f8f2;">fb_exchange_token</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAccessToken</span>      <span style="color: #f8f8f2;">});</span>      <span style="color: #f8f8f2;">extendedToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">result.access_token;</span>     <span style="color: #f8f8f2;">}</span>     <span style="color: #66d9ef;">catch</span> <span style="color: #75715e;">//Sometimes there is a SSL/TSL exception, not sure what the trigger is - might be a dev thing.</span>     <span style="color: #f8f8f2;">{</span>      <span style="color: #f8f8f2;">extendedToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">dealership.FacebookAccessToken;</span>     <span style="color: #f8f8f2;">}</span>       <span style="color: #f8f8f2;">dealership.FacebookAccessToken</span> <span style="color: #f8f8f2;">=</span> <span style="color: #f8f8f2;">extendedToken;</span>     <span style="color: #f8f8f2;">dealership.SetFacebookAccessToken();</span> <span style="color: #75715e;">//Update SQL stored token.</span>    <span style="color: #f8f8f2;">}</span>  </pre>
</td>
</tr>
</tbody>
</table>
</div>

I am aware that the way I have done this isn’t as robust as I would like it to be, with the prevalent issue being expired tokens. Should the token expire, the functions will fail – gracefully I might add. I have kept it this way, as I don’t have the time to research how to get a new token. From the little I have read, it looks like Facebook requires a new user access token – which I am already dubious about.

That’s really it, I will be updating my blog for each network I do, GooglePlus is next!
