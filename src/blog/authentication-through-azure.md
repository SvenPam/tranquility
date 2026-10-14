---
title: Authentication Through Azure
description: Protect a serverless application with Azure AD and gain access via a SPA.
date: 2019-07-24T15:22:06
topic: Guide
theme: dark
tags: []
---
<p>If you didn't know, I started a new job this year with <a href="https://frontierlabs.co.uk">Frontier Labs</a> in Liverpool. With a new job comes new challenges, and the past six months has presented an enviable opportunity to tinker and develop Frontier's first design-driven data product <a href="https://straumlab.io">Stratum</a>. It has really been the developer dream of simply working without deadlines to explore the technologies, processes, and architecture that fits my technical vision - a position I haven't been in before.</p>
<p>One such learning has been authentication. Coming from a mostly public-facing web background into the world of single-page applications and many users has been one of my first real challenges. I want to share that with you.</p>
<p>This article is going to focus on authenticating Azure functions for consumption by a SPA, but I would like to touch on an alternative I have also used. This alternative is more fitting if you're creating an application where you want users to register, and you want to store their details in your own infrastructure. If you are considering this, take a look at <a href="http://docs.identityserver.io/en/latest/">Identity Server</a> with the <a href="https://www.npmjs.com/package/oidc-client">OIDC client library</a>. I didn't find it easy to set up and use, but I succeeded in the end. It's key to remember this is a server tool for managing OAuth2, you're responsible for how you go about using it. In many ways, it provides too many solutions, and it can be quite easy to misunderstand as it is so broad. If it helps you; I used the code flow for auth - I expected a popup sign-in screen, but you can't do it with the more secure code flow. It has to be a page redirect! That's the only lesson I want to share here - on to Azure.</p>
<h2>Microsoft identity platform (formerly Azure Active Directory for developers)</h2>
<p>Our next product requires us to work with an Enterprise organization who are using Active Directory. If you are planning the same, or you simply need to authenticate an app for your own organization; read on. if you want to create accounts specific to your app, this likely isn't the route you want to take.</p>
<h3>Azure Authenticate</h3>
<p>In Azure, a common sight is this button in web or function blades:</p>
<p><img src="/media/1065/azure-authenticate-button.jpg" alt="Azure Authenticate button in web apps" data-udi="umb://media/3641a73df08d49329ca4f90bec2e97ba" /></p>
<p>I always saw it, didn't think much to it. Turns out, instead of writing a load of code, spinning up an authentication service and trying to join it all together (at cost to you) - Microsoft has empowered Azure AD to really help you with this. You can read loads about it <a href="https://docs.microsoft.com/en-gb/azure/active-directory/develop/about-microsoft-identity-platform">here</a> and from there; find resources to guide and help you build your own setup.</p>
<h3>In Short</h3>
<p>If you want to protect an Azure function, and call it from your SPA: here's what I did. Firstly, make sure you have an Azure function set up. You'll also need Azure AD already set up, you may also need to speak with your IT department...</p>
<ol>
<li>Register a new application with Azure AD. <a href="https://docs.microsoft.com/en-gb/azure/active-directory/develop/scenario-protected-web-api-app-registration">This guide</a> was handy.
<ol>
<li>You want to add the URLs your client app will redirect to after a user signs in</li>
<li>Check the boxes for access tokens and ID tokens</li>
<li>Expose your API - you'll need your app ID for this. Mine looks a bit like this:<img src="/media/1066/azure-expose-api.jpg" alt="Example expose API settings taken from Azure" data-udi="umb://media/bb84abbc586f44a9a34434384743d128" /></li>
</ol>
</li>
<li>Authenticate your Azure function. Go to the function, click "Authentication"
<ol>
<li>Switch on</li>
<li>(Optional) Set the action to take when not authenticated to Azure AD</li>
<li>Configure Azure Active Directory</li>
<li>Select "Express" &gt; select the app you created before</li>
<li><strong>Gotcha: </strong>You're going to need your Application ID URI which you can find in in the expose API blade of your application (like in screenshot above). Go to advanced settings, you should see this has already been filled in. You need to paste your API URI in the "Allowed Token Audiences" section. Like so: <br /><img src="/umbraco/nothing.jpg" alt="" data-udi="umb://media/af1da55a9d3b4a9fbfec5d065f558e9e" /><img src="/media/1067/azure-functon-ad-settings.jpg" alt="Allowed token audiences example screenshot" data-udi="umb://media/af1da55a9d3b4a9fbfec5d065f558e9e" /></li>
<li>Save</li>
</ol>
</li>
<li>Set up your client with Microsoft's <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js">MSAL client library</a>
<ol>
<li><strong>Gotcha: </strong>If you're using framework like Vue.js, you might find after a user is logged in, the pop-up get's stuck, or after a redirect, nothing happens. You might see <a href="https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/174">this issue</a> for it on Github. For me, it was Vue router. Azure AD tries to route back with an ID token, but it's not actually a query string but a full-blown URL, ie. <code>/id_token=...</code> Make sure you have a catch-all route, with an instance of MSAL on that view!</li>
<li><strong>Gotcha:</strong> When you set your scope, this must be the Application ID URI we used before: <br /><img src="/media/1068/example-scope-silent-token-code.jpg" alt="" data-udi="umb://media/80b2685c64804641bd20aaea1cbaf720" /> You can find the full scope in your expose API section in the application in Azure AD.</li>
<li>I stored my token in session storage as can be seen above. When you make your call to your API, you'll need to get that, and set an "Authorization" header with a "Bearer {your JWT token}".</li>
</ol>
</li>
</ol>
<p> </p>
<p>All the above steps can be pieced together from the guides I have linked to. Mostly, I want to highlight the parts I got stuck on. Fingers crossed, you won't see a 401 when you call your API. Azure AD is a superb approach if you're wanting to provide single sign-on to your clients. Especially if (to my assumption) you consider another Azure AD organization can just loop into your organization's AD and use your registered app but still manage their own users. </p>
<p>This is a whole world away from the pain I had with IdentityServer, and the whole thing is free. I'm not 100% how secure this is, as IdentityServer docs <a href="http://docs.identityserver.io/en/latest/topics/grant_types.html#implicit" data-anchor="#implicit">suggest the implicit flow is bad</a> and you should use the code flow. Microsoft docs <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/v1-oauth2-implicit-grant-flow">argue for pure SPA setups</a>, implicit is fine. My knowledge of security is enough to get by, but you should do your own research into the two.</p>
