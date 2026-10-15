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
3.  Choose the `manage_pages` and `publish_actions` permissions.
4.  Enter `me/accounts` into the get field.
5.  This will give you the page ID and the page access token. You might have to add `access_token` to the search fields.

Now we have the permission to post, the page token to represent this access and the ID of the page we’re authorised to post to. In testing I noticed some key differences in how the tokens work, using the initial access token results in posting to the page as yourself. Using the page access token means you will post as the page.

### Accessing Facebook Through .NET

The next step is to add it to your MVC application. I’ve been adding the API stuff to a library, but doing it through models in the MVC app would be just as easy to do. To skip any hassle dealing with OAuth and the Facebook SDK I have installed the unofficial [Facebook SDK](http://facebooksdk.net/) using nuget. Run `Install-Package Facebook -Pre` in nuget, and you’ll be well on your way!

I’ve created a class, and added a function to do the post. The code is pretty simple, the variables should be easy to recognise. Here are my Facebook functions below, firstly the function to post to Facebook:

```csharp
private static bool PostToFacebook(SocialDealership dealership, string message, string url)
{
    if (dealership.HasFacebookCredentials)
    {
        dynamic messagePost = new ExpandoObject();
        messagePost.message = message;
        System.Uri validatedURL;

        //Validate the URL, otherwise Facebook will throw an exception.
        if (!url.IsNullOrEmpty()
            && Uri.TryCreate(url, UriKind.Absolute, out validatedURL)
            && validatedURL.Scheme == Uri.UriSchemeHttp)
        {
            messagePost.link = validatedURL;
        }

        FacebookClient app = new FacebookClient
        {
            AccessToken = dealership.FacebookAccessToken,
            AppId = dealership.FacebookAppID,
            AppSecret = dealership.FacebookAppSecret
        };

        //Refreshes the expiry of our access token.
        FacebookSetExtendedAccessToken(dealership);

        //Make the post.
        try
        {
            var result = app.Post("/" + dealership.FacebookPageID + "/feed", messagePost);
        }
        catch (FacebookOAuthException ex)
        {
            //Either the AccessKey is wrong or it has expired.
            return false;
        }
        catch (FacebookApiException ex)
        {
            //Usually means a parameter is invalid.
            return false;
        }
        return true;
    }
    return false;
}
```

A call is made to `FacebookSetExtendedAccessToken()` which will always retrieve a long life token, and set it in the database. By default access tokens last an hour, this is obviously inconvenient when we’re running this in a server application. An extended token lasts for 60 days, and by calling the function every time a post is made the token will always be refreshed assuming a post is made every 60 days. The function to do this:

```csharp
private static void FacebookSetExtendedAccessToken(SocialDealership dealership)
{
    FacebookClient client = new FacebookClient
    {
        AccessToken = dealership.FacebookAccessToken,
        AppId = dealership.FacebookAppID,
        AppSecret = dealership.FacebookAppSecret
    };
    string extendedToken = "";
    try
    {
        dynamic result = client.Get("/oauth/access_token", new
        {
            grant_type = "fb_exchange_token",
            client_id = dealership.FacebookAppID,
            client_secret = dealership.FacebookAppSecret,
            fb_exchange_token = dealership.FacebookAccessToken
        });
        extendedToken = result.access_token;
    }
    catch //Sometimes there is a SSL/TLS exception, not sure what the trigger is - might be a dev thing.
    {
        extendedToken = dealership.FacebookAccessToken;
    }

    dealership.FacebookAccessToken = extendedToken;
    dealership.SetFacebookAccessToken(); //Update SQL stored token.
}
```

I am aware that the way I have done this isn’t as robust as I would like it to be, with the prevalent issue being expired tokens. Should the token expire, the functions will fail – gracefully I might add. I have kept it this way, as I don’t have the time to research how to get a new token. From the little I have read, it looks like Facebook requires a new user access token – which I am already dubious about.

That’s really it, I will be updating my blog for each network I do, GooglePlus is next!
