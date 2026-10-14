---
title: "Share LinkedIn Company Update using C#"
description: "Discussing the steps required to successfully POST a share request to the LinkedIn REST API through server side C# code."
date: 2017-04-23T15:39:06
topic: Guide
tags: []
---

I am having to wait on access to the pages API for me to continue work with Google+, so in the meantime I am working on LinkedIn.

## LinkedIn

It has taken me a long time to work out how to successfully share to LinkedIn as a company page due to the amount of wrong or out of date information floating around the web and a poor understanding of how OAuth works. Either way, I have arrived at a successful solution; so I’ll explain what I did here.

### Account Preparation

First up, we need to ensure we’re all set up with LinkedIn. Before we begin ensure you have a LinkedIn account and a company page. The next step is to associate your account as a developer account and [register a LinkedIn application](https://www.linkedin.com/secure/developer). Ensure you keep track of the API key and the secret key as we’ll need them later.

Next we’re going to follow steps found in the official LinkedIn documentation found [here](https://developer.linkedin.com/documents/authentication). I will simplify what you need to do here, so it’s your choice to follow the steps laid out there.  The end goal of this step is to retrieve an access token that grants access for us to post on behalf of a user.

A URL redirect isn’t important for server side applications, so simply enter any secure (HTTPS) link to your site – make sure this is set for your application, in this I will use ‘https://example.com’. This URL is used to redirect a user back after they have granted the application permissions. Whilst you’re setting this, ensure the permissions for `rw_company_admin` and `rw_nus` are set.

### Granting Permissions

Next we grant the application to act on behalf of our account, to do this go to:

https://www.linkedin.com/uas/oauth2/authorization?response\_type=code&amp;client\_id=**{API KEY}**&amp;scope=rw\_company\_admin%20rw\_nus&amp;state=**thisisatest**&amp;redirect\_uri=**https://example.com**

Replace the bold values according to your own settings. This will redirect you to the specified URL, it will also append a key we need as a query string. You will find this after “?code=”, copy that and we’ll use it to get the access token. Next up, replace the values with your own settings and go to the below URL:

https://www.linkedin.com/uas/oauth2/accessToken?grant\_type=authorization\_code&amp;code=**{COPIED CODE}**&amp;redirect\_uri=**https://example.com**&amp;client\_id=**{API KEY}**&amp;client\_secret=**{API Secret}**

The return will be a JSON response which contains the access token we need to share updates! Cool, huh?

### C#

Let’s share our first update, I’ll be summarising the steps found in [this LinkedIn guide](https://developer.linkedin.com/creating-company-shares) for this step. Here you will need your company ID. If you’re lucky you should just be able to go to your company page, and pull out the number from the URL. If you’re not so lucky, you might get the company name instead, I’m afraid I don’t know another way to get the page ID. I’ll be using the LinkedIn [test company page](https://www.linkedin.com/company/devtestco) ID for this (2414183). Before working with code for this, I initially played around with [Postman](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en), an extension for Chrome which lets you test REST API’s. However, I’ll just put the C# code I used below:

```csharp
private static bool ShareLinkedInUpdate(SocialDealership dealer, string message, string url)
{
    //ShareLinkedInUpdate Test Company ID: 2414183
    var requestUrl = "https://api.linkedin.com/v1/companies/2414183/shares";

    //Build JSON request.
    var jsonMsg = new
    {
        comment = message,
        content = new Dictionary<string, string>
        {
            { "submitted-url", url}
        },
        visibility = new
        {
            code = "anyone"
        }
    };

    var requestJson = new JavaScriptSerializer().Serialize(jsonMsg);

    var client = new WebClient();
    //Build Header.
    var requestHeaders = new NameValueCollection
    {
        {"Content-Type", "application/json" },
        {"x-li-format", "json" },
        {"Authorization", "Bearer " + dealer.LinkedInAccessToken}, //It is important "Bearer " is included with the access token here.
        {"Host", "api.linkedin.com"}
    };
    client.Headers.Add(requestHeaders);
    try
    {
        //POST request.
        client.UploadString(requestUrl, "POST", requestJson);
    }
    catch
    {
        return false;
    }
    return true;
}
```

It’s important that the `requestURL`, or as LinkedIn calls it – the end point is SSL. If not, you will receive an error which doesn’t seem to be noted in the documentation. You'll also need to make sure you reference `System.Web.Script` which allows you to serialise objects into JSON.

I’ll be performing tests over the course of the week to see how long the token lasts. I have done a little research on the subject, and by following the second step above you receive an access key good for 60 days. What isn’t so clear is how/if the token is refreshed when it is used, similarly to the Facebook access token. Additionally, I’ll be adding better exception handling.
