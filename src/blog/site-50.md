---
title: "Personal Site Version 5"
description: "Moving this site from Umbraco to a static Eleventy site in a couple of nights, with Claude."
date: 2026-11-07T09:00:00
topic: Site
tags: []
---

It has been a long time since I last posted anything.

In fact, time has been so lengthy, even my last post on BEM and all that fun stuff from 2019 is largely behind us, and likely irrelevant.

It's 2026 now. The landscape of tech is unrecognisable.

I have much to say on where things have changed. Tech is enjoyable in different ways now, the joy in crafting code feels different. Often it now feels like development has made the same shift as online content has. We have moved from long form content to short. Development in 2026 feels like doom scrolling. There is almost a dopamine feel of progress whenever a prompt comes up for your next move.

## A site with a history

Which is a nice segue into this site. It's had 5 incarnations now. My first blog site was hand rolled in MVC 4. Progressively I built it out further, I tried different designs. It grew into a multi-tenant CMS built on MVC 5. I planned to spin sites up for people on the side. I spent weeks of evenings crafting a BEM styled, pure CSS blog site. Years later I replaced the back-end with Umbraco 7. I've hosted a [church site](https://stpaulswarton.co.uk), two charity bike ride sites for our European cycling expeditions, I started a site for a bakery, and a tourism board.

These moves are demonstrable points of influence exerted from the different points in my career. As I used something in work, I sought to understand it more.

Really, this version is no different.

## Why leave Umbraco

Umbraco is now version 18. I haven't used it for 7 years, and when I left it last, the community felt cultish and self-serving. Things may have changed since those days, but from that perception and my professional view of using it only for a blog; it didn't seem warranted to migrate. The DB content is not standardised. It was costing $80 a month in Azure costs. There was little point in fighting a framework for something that could be replaced with markdown.

So I knew what I wanted to move to. I had toyed once before with using Vuepress. I kept coming back to, why do I need JavaScript? I consider myself backend now. Let's make this easy.

## The prompt

I turned to Claude. 

> I want to port my website over from a quite old version of Umbraco to a modern static site framework.
> 
> My preference would be Vue. That said, I barely use JS on the site now, if it fits a pure MD to HTML tool would be completely adequate.
> 
> The requirements are as follows:
> 1. The URL structure and content must stay the same.
> 2. The style/design must stay the same.
> 3. This must be hosted in Azure
> 4. Assets need to be considered. They are in Azure storage currently. I am open to porting them into the repo if needed.
> 5. Markdown must be the source file. I will separately import dynamic blog content by extracting from Umbraco manually.
> 6. OG image should continue to be generated on new content
> 7. CI/CD pipelines are old and can be removed. New CI can be added. Publishing should ideally be pushing to main
> 
> The site is currently hosted at ste-pam.com. You can see the full sitemap here: https://ste-pam.com/sitemap. There isn't a vast amount of articles that I have published.
> 
> The existing code and directory can be entirely thrown away and started again. My only ask is that we park it on a branch to preserve what once was.
> 
> For this work don't write any implementation. Start with a docs folder, and work through phases.
> - Phase 1: Discovery - learn the existing repo, understand the limits and identify anything at odds with my requirements. Provide a few options for frameworks with tradeoffs listed for me to pick. Explore my site and see how the main parts of my site are rendered. Write this into a markdown file docs/phase-1-discovery.md
> - Phase 2: After I confirm the details for phase 1, Phase 2 should be a high level plan. Define the overall approach. Consider the framework, the structure, the deployment and how we will migrate content, images and other resources. Explain how we will move over CSS. Break this up into chunks of work, with dependencies listed. Each should be sized to suitably scoped agent session 
> Output: docs/phase-2-plan.md
> - Phase 3, Specs. Once the plan is approved, write the specs. This should be the detailed implementation plan for each chunk of work given in the plan. Use code to explain any more complex parts. Each spec must have a success criteria and/or AC. consider a sub agent running each spec with zero context. Add a subagent specifically for implementing these specs. Add another subagent to verify the successful implementation of the spec.
> - Phase 4 - implementation. Use parallel execution subagents to carry out the work given in the specifications.
> 
> Success: I consider this a success when:
> 1. Umbraco is no longer used to support my blog site.
> 2. To all extents and purposes (where pragmatic) the site can be deployed to the same domain with no change to design, content or URL structure.
> 
> You are a BA. First start with Phase 1.

## Discovery, plan, spec

I've based this flow on what I would normally use with [obra/superpowers](https://github.com/obra/superpowers). Only here, I don't have the skills loaded. My general process remains the same: Discovery, Plan, Spec.

From there Claude looked at my site, reviewed. We paired together. I admit there is some fallacy in this, you the human are always correct. "Good spot!", "Great idea!". You feel great. In an industry that is primarily critical, it often feels like fresh air.

## Scope and stack

We first scoped the changes needed. We dropped Disqus (no one comments), GA appears to not be a thing anymore, my work experience page wasn't all that useful.

Claude took my ideas for stacks, and we whittled them down. To using Astro or Eleventy. Having used neither, I reviewed the trade-offs for each. Reflecting again on being in that tech lead role, this is not dissimilar from what I do now. I openly accept that senior developers on my team will know more than me about certain areas. Provided the trade-offs, I can question more or prompt deeper reasoning. Eleventy had the least overhead, so I chose that.

## Tests before code

Before we started any code, we still had to plan. In recent years, there has been a renaissance in test driven development. I, like many of my peers have been moving away from unit tests. The classic test pyramid, while not wrong, emphasised unit tests. Unit tests themselves went awry (I am just as guilty). We obsessed over covering class by class. Services were almost exclusively injected with .NET Core. This led to service mocks. Before we knew it, tests were tightly coupled to implementation detail. Refactoring became twice the work. Safety was lost. So we moved to behavioural tests, I've named these functional tests. We test the boundaries of our system. 

I appreciate, that was a meandering. Where I am going is that, when I collaborate with agents, I use TDD to define the behaviour I want. I ensure the behaviour that exists now, is covered by a test. This is why, along with the shift to functional tests, TDD has become a cornerstone to agentic development. Here I had used a plan, and ensured that tests were written that covered the site. The expectations were therefore codified.

2017 me, did not bother to write tests at all. So I can say nine years has taken me from one extreme to another. This exercise has been a lovely retrospection.

Another really useful thing Claude did here, was take screenshots of pages on my site. I likely would not have done this due to the tedious nature of the work. Claude shines. We had a reference from here on out of what we wanted to achieve.

## Implementation with subagents

Now the plan was set, roughly we knew what was needed at each point. The quality was defined. It was then onto the implementation step. Again, here I am looking to get closer to a final result, because the project/code is modified. I expect Claude to write out the exact steps it will take. It must define the tests to write to prove that step matches. Take care though, this has easily led to a glut of test cases. Using this approach can bloat your tests without real value and while conceptually, seeing the tests up front informs decisions. You are likely without context. I don't know every existing test in the system. Out of context, new tests are good. After implementing though, you see the real bloat.

The implementation plan broke the work up. It is then a case of Claude working through each task. Because things are pretty clear to me at this point, I can trust that Claude gets the output right. I tend to always use subagents here. You can keep the session size smaller, by having an implementation agent carry out the work with contextual instructions. A second verification agent validates the tests, and reviews the code output. It may be a hangover from older models, but I've used this well enough to avoid those hallucinations that came from full sessions. I'll also add, that having session state recorded in plans in the repo goes a huge way to helping here too.

## Content and proofreading

One of the final tasks was migrating content over. Now there is 15 years of content, various migrations, etc. Perfect task for Claude again. Proof reading was included, my goodness, there were grammatical and spelling errors galore. All fixed by Claude.

![An article on the new site: the SASS Loops post under a terminal style hero, with an old article warning](/media/site-50/article-now.png)

*An old article on the new site.*

## The DevOpsy bits

Another step was the *DevOpsy* stuff. It's not an interest of mine. I love it when it works. I have seen some really cool stuff. However, the yml, and the configuration and infrastructure code to get there is not something I enjoy reading or writing. I could defer to the expertise of Claude to plumb everything together based on my desire to host on Azure Static Web Apps. Claude wrote the bicep and the GitHub pipelines. The E2E tests ran throughout the changes. 

## What went wrong

It was not all smooth. Three things stand out.

First, the live site was not the source of truth I thought it was. Thirteen articles were returning 404s, and at least one post, SASS Loops, had quietly lost its code examples. The 404s came from a deleted Umbraco template. I switched those articles to the Article template in the CMS, and Claude converted them afterwards.

Second, a spec was confidently wrong. It assumed the hero images were cropped on the live site, so we planned image processing to match. Checking the real pages showed they were not, so the spec was rewritten and the processing dropped.

Third, the local Azure emulator disagreed with the real thing. It ignores the trailing slash rules and breaks the custom 404 page after the first request, so some routing could only be checked once deployed. That is where the redirect bug turned up. Old file links with spaces in their names returned 404, because Azure matches routes on the decoded path. It was fixed in minutes, with a test so it cannot come back.

## The switchover

The final thing was orchestration of everything, and the switchover. Up to now, I had done everything on my phone (which was awesome by the way). I made changes around work and family. Finding time in the evenings, changing things on the commute. This last bit was manual intervention, as I needed to log into Cloudflare, and do the DNS switching. Claude even spotted a redirect bug as we were going live.

## Where it ended up

So here we are now. V5 is on Eleventy. All the content is in Markdown. I wrote this article in Obsidian, and had Claude push into Git. The CSS is nearly all the same. The HTML too. It's all hosted on Azure Static Web Apps. No database.

![The old Umbraco home page: a photo of Lake District hills behind the name, with the intro text on a pale background](/media/site-50/home-umbraco.png)

*Before: the Umbraco site.*

![The same home page on the static site: a terminal style prompt over a dark contour map, with the same intro text below](/media/site-50/home-now.png)

*After: the static site today.*

- 58 articles, all on their original URLs. 84 URL checks pass against the live domain.
- Around 290 spelling, typo and grammar fixes across 54 articles. Each one is logged, so I could review them and the tests could prove nothing else changed.
- 168 tests stay in the repo. During the migration there were 265, including a comparison of every article against the live site and 16 screenshot comparisons.
- 0 `npm audit` vulnerabilities.
- Hosting went from about $80 a month to the Azure Static Web Apps Free tier, with no database.
- Pushing to `main` builds, tests and deploys, and the site rebuilds itself weekly.


## Was it worth it

I have enjoyed this experience. I used the same process for the church site as well. Both these migrations would have taken weeks of evenings to do. Instead, they both took days, on a standard Claude plan. Furthermore, the original goal to remove the costly Azure infrastructure backing this site is achieved.

I don't have this experience every time. This is a small project. Things were already fairly consistent. I feel this can be where a lot of the AI productivity feels come from. I'll temper this with, do take care. Inconsistent code leads to odd results. In real, long-lived projects you will have different approaches. Different people work on things along many years of timelines. With AI, code is never "good enough". If you push it to review four lines of code, it will find something. Akin to re-compressing a JPEG, reviews can almost get "lossy".

The industry is still finding its feet. So am I. This was great though.
