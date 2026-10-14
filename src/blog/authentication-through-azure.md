---
title: "Authentication Through Azure"
description: "Protect a serverless application with Azure AD and gain access via a SPA."
date: 2019-07-24T15:22:06
topic: Guide
tags: []
theme: dark
---

If you didn't know, I started a new job this year with [Frontier Labs](https://frontierlabs.co.uk) in Liverpool. With a new job comes new challenges, and the past six months has presented an enviable opportunity to tinker and develop Frontier's first design-driven data product [Stratum](https://straumlab.io). It has really been the developer dream of simply working without deadlines to explore the technologies, processes, and architecture that fits my technical vision - a position I haven't been in before.

One such learning has been authentication. Coming from a mostly public-facing web background into the world of single-page applications and many users has been one of my first real challenges. I want to share that with you.

This article is going to focus on authenticating Azure functions for consumption by a SPA, but I would like to touch on an alternative I have also used. This alternative is more fitting if you're creating an application where you want users to register, and you want to store their details in your own infrastructure. If you are considering this, take a look at [Identity Server](http://docs.identityserver.io/en/latest/) with the [OIDC client library](https://www.npmjs.com/package/oidc-client). I didn't find it easy to set up and use, but I succeeded in the end. It's key to remember this is a server tool for managing OAuth2, you're responsible for how you go about using it. In many ways, it provides too many solutions, and it can be quite easy to misunderstand as it is so broad. If it helps you; I used the code flow for auth - I expected a popup sign-in screen, but you can't do it with the more secure code flow. It has to be a page redirect! That's the only lesson I want to share here - on to Azure.

## Microsoft identity platform (formerly Azure Active Directory for developers)

Our next product requires us to work with an Enterprise organisation who are using Active Directory. If you are planning the same, or you simply need to authenticate an app for your own organisation; read on. If you want to create accounts specific to your app, this likely isn't the route you want to take.

### Azure Authenticate

In Azure, a common sight is this button in web or function blades:

![Azure Authenticate button in web apps](/media/1065/azure-authenticate-button.jpg)

I always saw it, didn't think much to it. Turns out, instead of writing a load of code, spinning up an authentication service and trying to join it all together (at cost to you) - Microsoft has empowered Azure AD to really help you with this. You can read loads about it [here](https://docs.microsoft.com/en-gb/azure/active-directory/develop/about-microsoft-identity-platform) and from there; find resources to guide and help you build your own setup.

### In Short

If you want to protect an Azure function, and call it from your SPA: here's what I did. Firstly, make sure you have an Azure function set up. You'll also need Azure AD already set up, you may also need to speak with your IT department...

1.  Register a new application with Azure AD. [This guide](https://docs.microsoft.com/en-gb/azure/active-directory/develop/scenario-protected-web-api-app-registration) was handy.
    1.  You want to add the URLs your client app will redirect to after a user signs in
    2.  Check the boxes for access tokens and ID tokens
    3.  Expose your API - you'll need your app ID for this. Mine looks a bit like this:![Example expose API settings taken from Azure](/media/1066/azure-expose-api.jpg)
2.  Authenticate your Azure function. Go to the function, click "Authentication"
    1.  Switch on
    2.  (Optional) Set the action to take when not authenticated to Azure AD
    3.  Configure Azure Active Directory
    4.  Select "Express" > select the app you created before
    5.  **Gotcha:** You're going to need your Application ID URI which you can find in the expose API blade of your application (like in screenshot above). Go to advanced settings, you should see this has already been filled in. You need to paste your API URI in the "Allowed Token Audiences" section. Like so:   
        ![](/umbraco/nothing.jpg)![Allowed token audiences example screenshot](/media/1067/azure-functon-ad-settings.jpg)
    6.  Save
3.  Set up your client with Microsoft's [MSAL client library](https://github.com/AzureAD/microsoft-authentication-library-for-js)
    1.  **Gotcha:** If you're using a framework like Vue.js, you might find after a user is logged in, the pop-up gets stuck, or after a redirect, nothing happens. You might see [this issue](https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/174) for it on GitHub. For me, it was Vue router. Azure AD tries to route back with an ID token, but it's not actually a query string but a full-blown URL, ie. `/id_token=...` Make sure you have a catch-all route, with an instance of MSAL on that view!
    2.  **Gotcha:** When you set your scope, this must be the Application ID URI we used before:   
        ![](/media/1068/example-scope-silent-token-code.jpg) You can find the full scope in your expose API section in the application in Azure AD.
    3.  I stored my token in session storage as can be seen above. When you make your call to your API, you'll need to get that, and set an "Authorization" header with a "Bearer {your JWT token}".

<p>&nbsp;</p>

All the above steps can be pieced together from the guides I have linked to. Mostly, I want to highlight the parts I got stuck on. Fingers crossed, you won't see a 401 when you call your API. Azure AD is a superb approach if you're wanting to provide single sign-on to your clients. Especially if (to my assumption) you consider another Azure AD organisation can just loop into your organisation's AD and use your registered app but still manage their own users. 

This is a whole world away from the pain I had with IdentityServer, and the whole thing is free. I'm not 100% sure how secure this is, as IdentityServer docs [suggest the implicit flow is bad](http://docs.identityserver.io/en/latest/topics/grant_types.html#implicit) and you should use the code flow. Microsoft docs [argue for pure SPA setups](https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-oauth2-implicit-grant-flow), implicit is fine. My knowledge of security is enough to get by, but you should do your own research into the two.
