# Proofreading follow-up changes

Follow-up to the three proofreading reports (`report-a.md`, `report-b.md`, `report-c.md`), approved by the owner. It covers three things:

1. the remaining one-word slips found by reviewers;
2. the items the reports had left for the owner to decide, each fixed with the smallest change that makes the sentence correct;
3. old links that pointed at Umbraco-era paths.

Every rendered-text change is logged in the article's `docs/proofread/{slug}.json`, so the parity tests prove nothing else changed. Links are logged under `links`.

**Counts:** 36 articles touched; 62 text changes (grammar 32, punctuation 11, spelling 10, typo 9) and 5 link fixes. No title changes. Two description changes (coast-to-coast-cancer-research-uk, google-maps-api-authorization-error-getting-round-it).

`tests/known-broken.json`: removed `/blog/article/3052`, `/blog/article/site-3-0`, `/blog/article/12` and `/umbraco/www.resturantasher.nl`, which no page references any more.

## Notes on judgement calls

- **corrupted-html-when-using-visual-studio:** the paragraph tells the story in the past tense ("We reinstalled", "We switched", "it had fast approached"). "It has to be..." and "Perhaps it is IIS" are the author's thoughts at the time, so "begin" became "began".
- **atomic-design-and-patternlab:** live showed literal backticks around an italic *patternName*. It now renders as inline code `patternName.json`, which is how PatternLab names pattern-specific data files. The underscores were Markdown italics, not part of the name.
- **spanking-new-site:** "insighted" became "incited" (same sound, and "incited a lot of thought" fits the sentence).
- **ssas-attribute-key-cannot-be-found:** "I alluded this meant" became "I deduced this meant"; the sentence draws a conclusion from the warning.
- **final-year-project-miru-awarded-preliminary-first-class-honours:** "the success of ExpoTees in my previous article" now links to `/blog/expotees-complete`, the ExpoTees write-up published two days earlier.
- **lets-get-coding:** "a full guide on how I ended up setting it all up here" (the Google Maps API demo on an emulator) now links to the Google Maps API guide.
- **google-maps-api-authorization-error-getting-round-it:** "Google APIs" is also the real name of the Android SDK package, so the plain plural is correct there too.
- **Plural apostrophes** ("API's", "SVG's", "CTA's", "IDE's") became plain plurals. A search of all 58 articles found no others.
- **"Github"** became "GitHub" in all four articles that used it in prose or link text (authentication-through-azure, final-year-project-complete, simple-waypoint-scroll, site-40). URLs were not touched, apart from the broken simple-waypoint-scroll GitHub link listed under links.

## Changes by article

### acceptance-to-expotees-and-project-progression

| Before | After | Kind |
| --- | --- | --- |
| The benefits from this means | The benefit from this means | grammar |

### analysis-complete

| Before | After | Kind |
| --- | --- | --- |
| Show Location of Instruments on 2D | Show location of instruments on 2D | typo |

### api-support

| Before | After | Kind |
| --- | --- | --- |
| data is loaded shown | data is loaded and shown | grammar |

### atomic-design-and-patternlab

| Before | After | Kind |
| --- | --- | --- |
| by using \`patternName.json\`, where (literal backticks, italic name) | by using `patternName.json`, where (inline code) | punctuation |

### authentication-through-azure

| Before | After | Kind |
| --- | --- | --- |
| for it on Github. For me | for it on GitHub. For me | spelling |

### c-60-features

| Before | After | Kind |
| --- | --- | --- |
| null, oppose to a null exception | null, as opposed to a null exception | grammar |
| But, not more! | But, no more! | typo |

### class-design

| Before | After | Kind |
| --- | --- | --- |
| I reading over | I'm reading over | grammar |
| take into consideration of systems | take into consideration systems | grammar |

### coast-to-coast-cancer-research-uk

| Before | After | Kind |
| --- | --- | --- |
| (description) money for cancer research UK | money for Cancer Research UK | spelling |

### coast-to-coast-success

| Before | After | Kind |
| --- | --- | --- |
| Peaking the top of this, and fresh breeze | Peaking the top of this, a fresh breeze | grammar |

### corrupted-html-when-using-visual-studio

| Before | After | Kind |
| --- | --- | --- |
| So we begin disabling | So we began disabling | grammar |

### dynamic-serving-and-performance

| Before | After | Kind |
| --- | --- | --- |
| use Modernizer to | use Modernizr to | spelling |
| As developers we should, therefore presume a client does not have solid fast connection | As developers we should therefore presume a client does not have a solid fast connection | grammar |

### final-year-project-complete

| Before | After | Kind |
| --- | --- | --- |
| some of the things parts that | some of the parts that | typo |
| full source code on Github | full source code on GitHub | spelling |

### final-year-project-miru-awarded-preliminary-first-class-honours

| Before | After | Kind |
| --- | --- | --- |
| link `/blog/article/3052` | `/blog/expotees-complete` | link |

### getting-the-most-out-of-fonts

| Before | After | Kind |
| --- | --- | --- |
| opting to TTF fonts | opting for TTF fonts | grammar |
| to attempt to less then impact. | to attempt to lessen the impact. | spelling |

### google-maps-api-authorization-error-getting-round-it

| Before | After | Kind |
| --- | --- | --- |
| (description) Google API’s! | Google APIs! | punctuation |
| you will find meta-tag with | you will find a meta-tag with | grammar |
| Google API’s. That is | Google APIs. That is | punctuation |

### inverted-triangle-css-itcss

| Before | After | Kind |
| --- | --- | --- |
| I.e Bootstrap | I.e. Bootstrap | punctuation |
| I.e Grid | I.e. Grid | punctuation |
| much easier. Ultimately | much easier. Ultimately: | punctuation |
| have the project setup, anyone | have the project set up, anyone | grammar |

### just-giving-api-and-t2t-redesign

| Before | After | Kind |
| --- | --- | --- |
| simply makes uses the JustGiving API | simply makes use of the JustGiving API | grammar |
| knowledge of SVG’s to | knowledge of SVGs to | punctuation |
| All the CTA’s I feel | All the CTAs I feel | punctuation |
| link `/blog/article/site-3-0` | `/blog/site-30` | link |

### lets-get-coding

| Before | After | Kind |
| --- | --- | --- |
| two IDE’s in my | two IDEs in my | punctuation |
| link `/blog/article/12` | `/blog/google-maps-api-authorization-error-getting-round-it` | link |

### lifes-better-with-bem

| Before | After | Kind |
| --- | --- | --- |
| no more search through | no more searching through | grammar |
| i.e. bootstraps danger | i.e. Bootstrap's danger | punctuation |

### mvc5-authentication

| Before | After | Kind |
| --- | --- | --- |
| a new ASP.NET in Visual Studio | a new ASP.NET project in Visual Studio | grammar |
| By running the building your app again | By running and building your app again | grammar |

### mvp-complete

| Before | After | Kind |
| --- | --- | --- |
| the main is deciding | the main one is deciding | grammar |
| for data to put in. | for data to be put in. | grammar |

### mvp-nearly-complete

| Before | After | Kind |
| --- | --- | --- |
| nearly complete, currently have a meeting | nearly complete, and I currently have a meeting | grammar |

### new-job

| Before | After | Kind |
| --- | --- | --- |
| I am looking to the refreshing change | I am looking forward to the refreshing change | grammar |

### share-linkedin-company-update-using-c

| Before | After | Kind |
| --- | --- | --- |
| grant the application to act | grant the application permission to act | grammar |
| test REST API’s. | test REST APIs. | punctuation |

### simple-waypoint-scroll

| Before | After | Kind |
| --- | --- | --- |
| community, and wanted to give | community, I wanted to give | grammar |
| come up with a work around though | come up with a workaround though | spelling |
| I put it on Github. | I put it on GitHub. | spelling |
| link `http://github/svenpam/Simple-Waypoint-Scroll` | `https://github.com/SvenPam/Simple-Waypoint-Scroll` | link |

### site-30

| Before | After | Kind |
| --- | --- | --- |
| for close family friend's | for a close family friend's | grammar |

### site-40

| Before | After | Kind |
| --- | --- | --- |
| source code on my Github. | source code on my GitHub. | spelling |

### site-update-3

| Before | After | Kind |
| --- | --- | --- |
| isn't much in date stuff | isn't much up-to-date stuff | grammar |

### spanking-new-site

| Before | After | Kind |
| --- | --- | --- |
| habits I picked of doing SQL | habits I picked up doing SQL | typo |
| feel it insighted a lot | feel it incited a lot | spelling |

### spec-refinement

| Before | After | Kind |
| --- | --- | --- |
| high-level feature definement. | high-level feature definition. | spelling |

### speed-up-your-pc

| Before | After | Kind |
| --- | --- | --- |
| simply go back, and add enable it. | simply go back, and enable it. | typo |
| Microsoft named application and | Microsoft named applications and | grammar |
| just deletes necessary files | just deletes unnecessary files | typo |
| then hit run it by hitting | then run it by hitting | typo |
| that may necessarily not make | that may not necessarily make | grammar |

### ssas-attribute-key-cannot-be-found

| Before | After | Kind |
| --- | --- | --- |
| and lo behold in | and lo and behold in | grammar |
| the problem lied with | the problem lay with | grammar |
| I alluded this meant | I deduced this meant | grammar |

### string-to-enum-net-40plus

| Before | After | Kind |
| --- | --- | --- |
| shows to very useful method | shows a very useful method | typo |

### svg-sprite-automation

| Before | After | Kind |
| --- | --- | --- |
| looking through a tube a sheet of images | looking through a tube at a sheet of images | grammar |
| You find more of this out | You can find more of this out | grammar |

### thai-lime-ginger-and-prawn-stir-fry

| Before | After | Kind |
| --- | --- | --- |
| You should be liken to an Octopus | You should be like an Octopus | grammar |

### trip-to-rotterdam

| Before | After | Kind |
| --- | --- | --- |
| changed, and as we stopped a gentle roll | changed, and we stopped a gentle roll | grammar |
| do so much right in, the country | do so much right, the country | typo |
| link `/umbraco/www.resturantasher.nl` | `http://www.resturantasher.nl` | link |


## Left alone, and why

| Article | Text | Why |
| --- | --- | --- |
| authentication-through-azure | Link text "Stratum" pointing at `https://straumlab.io` | Left as instructed. The domain looks like a typo for Stratum's site and may be broken; the owner should check the intended URL. |
| authentication-through-azure | Image `/umbraco/nothing.jpg` | Broken on live too and no replacement file exists. |
| atomic-design-and-patternlab | "get Webpack setup to work" | Reads correctly with "setup" as a noun ("get the Webpack setup to work"). |
| atomic-design-and-patternlab | Patternlab / PatternLab, Atomic Design / atomic design | Product name capitalisation, a naming point. |
| c-60-features | "Auto Property Initializers", `UsesCarrousel` | C# feature name and a code identifier. |
| coast-to-coast-pately-bridge | "throwing us out on time" | Can't tell the intended wording ("out of time", "off schedule", "behind time"). |
| geotag-update-and-parsing-woes | "T'was" | Deliberate voice. |
| lifes-better-with-bem | "list them components", "get them sleeves rolled up" | Deliberate voice. |
| mvc5-authentication | Incomplete `Register` code snippet | Same on live; fixing it would change the code. |
| share-linkedin-company-update-using-c | OAuth URLs as plain text with bold placeholders | Formatting, not a text error; the bold is referred to in the next sentence. |
| site-30 | "none the less", "snow-ball", "serverside", "face lift" | Accepted older spellings, not mistakes. |
| site-40 | "from many learning working professionally with Umbraco" | Can't tell the intended wording ("many years", "my learning", "many learnings"). |
| spec-refinement | "the first meeting with the Sabisu" | Can't tell whether "the" is stray or a noun is missing ("the Sabisu team"). |
| speed-up-your-pc | "CCCleaner" / "CC Cleaner" | Product name (CCleaner), a naming point. |
| speed-up-your-pc | "Defragment and Optimize", "optimize" | Quoted Windows UI labels. |
| the-diamond-problem | "must implement all classes given in the interface" | Factual point ("methods"), not a typo. |
| the-tarantula-hawk | "hairy eight legged insects", "The Tarantula Wasp" | Factual or naming points. |
| trip-to-rotterdam | "We formally woke up" | Could be "finally" or a deliberate joke ("formally" after a night of broken sleep); can't tell. |
| web-config-transform | Quote attribution layout and split `<span>H</span>anselman` | Raw HTML; rendered text is already correct. |
| site-redesign-the-rekoning | Non-breaking spaces after "Design" | Kept so the heading renders as live. |
| several | Stray non-breaking spaces from the old editor | They render as normal spaces; only ones inside edited text were touched. |
| quotations | Quoted error messages, Stack Overflow quotes | Quotations are left as written. |
