# Proofread report, batch B

Articles `getting-the-most-out-of-fonts` to `site-30` (20 articles). Every text change below is also recorded in `docs/proofread/{slug}.json`, which the parity tests check against the live site.

## 1. Title changes

None. No article title in this batch had a typo.

One description changed (not a title): `lifes-better-with-bem`, see below.

## 2. Per article

### getting-the-most-out-of-fonts

| Before | After | Kind |
| --- | --- | --- |
| all the code you need, a will correctly load fonts | all the code you need, and will correctly load fonts | typo |
| only going to in your language | only going to be in your language | typo |
| Here some tricks to help | Here are some tricks to help | typo |

Code: no code blocks (the samples are Gist embeds, left untouched). Inline code added for `font-face`, `@font-face`, `url()` and `local()`.

### google-maps-api-authorization-error-getting-round-it

| Before | After | Kind |
| --- | --- | --- |
| the certificate finger print, SHA1 | the certificate fingerprint, SHA1 | spelling |
| you will need double check that | you will need to double check that | typo |
| your project.propeties has the following line | your project.properties has the following line | spelling |
| if it dosen’t it could | if it doesn’t it could | spelling |

Code: the numbered raw HTML layout (`dvNumber` / `item` divs) is kept. The three-line ProGuard rule in step 8 used to be three `<span class="code">` elements joined by `<br>`. It is now one `<pre><code class="language-text">` block with the inner line indented four spaces. It is written as HTML rather than a Markdown fence because it sits inside a raw HTML `<div>`, where Markdown is not parsed. The output markup is the same as a fenced block. File names and paths in the text are wrapped in `<code>` (`keytool.exe`, `debug.keystore`, the keystore path, `project.properties`, `proguard-project.txt`, the samples path).

### hello-world

| Before | After | Kind |
| --- | --- | --- |
| more out of intrigue then wanting | more out of intrigue than wanting | grammar |

Code: none.

### implementation-of-miru

| Before | After | Kind |
| --- | --- | --- |
| last week’s set back with | last week’s setback with | spelling |
| this week has gone considerable better | this week has gone considerably better | grammar |
| has been done to a real focus on work | has been due to a real focus on work | typo |
| I have also began to prepare | I have also begun to prepare | grammar |

Code: none.

### inverted-triangle-css-itcss

| Before | After | Kind |
| --- | --- | --- |
| write an ID you beat that other class? | write an ID to beat that other class? | typo |
| you can deal with specific much easier | you can deal with specificity much easier | typo |

Code: no blocks. Inline code added for `_variables.scss`.

### just-giving-api-and-t2t-redesign

| Before | After | Kind |
| --- | --- | --- |
| flags and optimize the original | flags and optimise the original | spelling |
| The obvious implications of this where sometimes | The obvious implications of this were sometimes | grammar |
| so pages would be server as quickly | so pages would be served as quickly | typo |

Code: none.

### lets-get-coding

| Before | After | Kind |
| --- | --- | --- |
| set up to be rather instusive on development | set up to be rather intrusive on development | spelling |
| This where I ran into problems | This is where I ran into problems | typo |
| To test this, obtained the google API demo | To test this, I obtained the google API demo | typo |
| how I ended setting it all up | how I ended up setting it all up | typo |

Code: none.

### lifes-better-with-bem

Description:

| Before | After | Kind |
| --- | --- | --- |
| clean architecture an maintainability gains | clean architecture and maintainability gains | grammar |

Body:

| Before | After | Kind |
| --- | --- | --- |
| Before I get onto the that, | Before I get onto that, | typo |
| BEM is my teams' favourite | BEM is my team's favourite | punctuation |
| what you're trying to categorize and | what you're trying to categorise and | spelling |
| Here you can a little SASS trick | Here you can see a little SASS trick | typo |
| Modifiers just the thing for this situation. | Modifiers are just the thing for this situation. | typo |
| the true power of BEM comes to live, | the true power of BEM comes to life, | typo |
| we can clear show the purpose | we can clearly show the purpose | grammar |
| just will classes. | just with classes. | typo |
| The other criticisms I've heard of BEM has been searchability. | The other criticisms I've heard of BEM have been searchability. | grammar |
| I would love to hear thought from anyone | I would love to hear thoughts from anyone | typo |

Code: none in the article itself (CodePen and Gist embeds left untouched). The quoted BEM definition keeps its American "behavior" because it is a quotation.

### mvc5-authentication

| Before | After | Kind |
| --- | --- | --- |
| the downsides to such help is a lack of documentation | the downsides to such help are a lack of documentation | grammar |
| will conduct is spirity magic | will conduct its spirity magic | typo |
| point your app way from the local database | point your app away from the local database | typo |
| inside you app data folder | inside your app data folder | typo |
| scripted to you database | scripted to your database | typo |
| Your quite likely to want | You're quite likely to want | grammar |
| the changes you make make to your models | the changes you make to your models | typo |
| bashed into you package manager | bashed into your package manager | typo |
| Customizing Authentication (heading) | Customising Authentication | spelling |
| go into to much depth | go into too much depth | spelling |
| settings that makes customization dead easy | settings that make customisation dead easy | grammar |

Code: eight inline-styled grey `<div>` boxes became four fenced blocks:
- 1 `xml`: the connection string.
- 2 `csharp`: the `RegisterViewModel` class, which was split over three boxes and is now one block, and the `Register` action.
- 1 `powershell`: the three migration commands, which were in three boxes.

Indentation made with non-breaking spaces is replaced by four spaces per level. The bold on `UserName = model.UserName` in the old box is lost because fenced code has no bold; the text is unchanged. Inline code added for `AccountViewModel.cs`, `RegisterViewModel` and `IdentityConfig.cs`.

### mvp-complete

| Before | After | Kind |
| --- | --- | --- |
| through the use the route interface | through the use of the route interface | typo |

Code: none.

### mvp-nearly-complete

| Before | After | Kind |
| --- | --- | --- |
| and a uses is also able to filter | and a user is also able to filter | typo |

Code: none.

### new-job, other-work, research

Read in full; nothing needed changing (see section 3 for one note on new-job).

### post-multiple-images-to-c-server

| Before | After | Kind |
| --- | --- | --- |
| I was using jQuery to serialize a form | I was using jQuery to serialise a form | spelling |
| It won’t serialize, your image(s) | It won’t serialise your image(s) | punctuation |
| would be to check is typeof FormData | would be to check if typeof FormData | typo |

Code: no blocks. Inline code added for `enctype = "multipart/form-data"`, `typeof FormData === "undefined"`, `contentType: false` and `processData: false`.

### posting-to-a-facebook-page-via-server-c

| Before | After | Kind |
| --- | --- | --- |
| how the tokens works, using | how the tokens work, using | grammar |
| The next step is add it to your MVC application. | The next step is to add it to your MVC application. | typo |
| Here is my Facebook functions below | Here are my Facebook functions below | grammar |
| the function to post to Facebook: 1 2 3 ... 45 private static bool PostToFacebook | the function to post to Facebook: private static bool PostToFacebook | code |
| it has exprired. (code comment) | it has expired. | code |
| An extended token last for 60 days | An extended token lasts for 60 days | grammar |
| The function to do this: 1 2 3 ... 28 private static void | The function to do this: private static void | code |
| a SSL/TSL exception (code comment) | a SSL/TLS exception | code |

Code: each function was a highlighted table, with a line-number column next to the code, which was full of coloured `<span>`s. Both are now fenced `csharp` blocks. On the live site the line breaks had been lost, so each function showed as one long line. Line breaks and four-space indentation are restored from the original spacing. The restored blocks have exactly 45 and 28 lines, matching the old line-number columns. Those columns (the numbers 1 to 45 and 1 to 28) are removed, which is why they appear as `code` entries. Inline code added for `manage_pages`, `publish_actions`, `me/accounts`, `access_token`, `Install-Package Facebook -Pre` and `FacebookSetExtendedAccessToken()`.

### sass-loops

| Before | After | Kind |
| --- | --- | --- |
| Firstly lets stick with what we know | Firstly let's stick with what we know | punctuation |
| have been a round for a while | have been around for a while | typo |
| they are a prefect fit here | they are a perfect fit here | spelling |
| We can do this programatically. | We can do this programmatically. | spelling |
| SASS call these the fancy name | SASS calls these the fancy name | grammar |

Code: no blocks. Inline code added for `:nth`, the `.class-1{...}` and `li:nth(1){...}` examples, `darken`, `lighten` and `demo.scss`. All changes are below the first screen, so the `article-embeds` visual snapshot (first screen only) is not affected.

### share-linkedin-company-update-using-c

| Before | After | Kind |
| --- | --- | --- |
| so in the mean time I am working on LinkedIn | so in the meantime I am working on LinkedIn | spelling |
| after they have grant the application permissions | after they have granted the application permissions | grammar |
| the C# code I used below: 1 2 3 ... 42 private static bool ShareLinkedInUpdate | the C# code I used below: private static bool ShareLinkedInUpdate | code |
| allows you to serialize objects into JSON | allows you to serialise objects into JSON | spelling |

Code: one highlighted table became a fenced `csharp` block. Line breaks and four-space indentation are restored (42 lines, matching the old line-number column), and the line numbers are removed. Inline code added for `rw_company_admin`, `rw_nus`, `requestURL` and `System.Web.Script`.

### simple-waypoint-scroll

| Before | After | Kind |
| --- | --- | --- |
| that works really well, and it based not on the scroll event | that works really well, and it's based not on the scroll event | grammar |
| Several changes when made just from issues | Several changes were made just from issues | typo |
| does not work on FIrefox. | does not work on Firefox. | typo |

Code: two `<pre class="prettyprint">` blocks became fenced `js` blocks. The first had lost its line breaks on the live site; they are restored with two-space indentation. An empty `<pre>` holding only a non-breaking space at the end of the article is removed (it had no text). Inline code added for `data-offset`, `document.onMousewheel` and `DOMMouseScroll`.

### site-30

| Before | After | Kind |
| --- | --- | --- |
| Intially, I was asked to build a site | Initially, I was asked to build a site | spelling |

Image: `/Areas/t2t2015/Uploads/t2t.png` to `/a/dist/img/t2t.png` (the file exists at `src/assets/img/t2t.png`).

Code: none.

## 3. Not changed, owner to decide

- **Plural apostrophes:** `Google API’s` (google-maps description and body), `SVG’s` and `CTA’s` (just-giving), `IDE’s` (lets-get-coding), `REST API’s` (share-linkedin). Common informal usage, and "Google API’s" names an SDK package, so they are left.
- **getting-the-most-out-of-fonts:** "to attempt to less then impact" is probably "to lessen the impact", but that needs two words changed. "opting to TTF fonts" probably means "opting for".
- **google-maps:** "you will find meta-tag with a value" is missing "a". The quotation marks around the `cd` command in step 3 don't match, but they are part of the command as typed. The title keeps "Authorization" because it is the error name.
- **inverted-triangle-css-itcss:** "I.e" (twice) is missing its second full stop. "Ultimately" is followed by a list with no colon. "have the project setup" would usually be "set up".
- **just-giving:** "The action simply makes uses the JustGiving API" could be "makes use of" or "uses". The link to `/blog/article/site-3-0` is a known broken link but not on the approved fix list.
- **lets-get-coding:** the link to `/blog/article/12` is a known broken link (it probably should point at the google-maps guide) and is not on the approved fix list.
- **lifes-better-with-bem:** "list them components" and "get them sleeves rolled up" read as the author's voice. "bootstraps danger, success, warning" would normally be "Bootstrap's". "There is no more search through lines" could be "searching".
- **mvc5-authentication:** "when creating a new ASP.NET in Visual Studio" is missing a noun (probably "project"). "By running the building your app again" is garbled and could be fixed several ways. The `Register` snippet is incomplete (unbalanced braces) on the live site too; left, because fixing it would change the code.
- **mvp-complete:** "the main is deciding" and "for data to put in" are each missing a word ("one", "be").
- **mvp-nearly-complete:** "currently have a meeting planned" drops the "I"; it reads as informal note style.
- **new-job:** "I am looking to the refreshing change" probably means "looking forward to".
- **share-linkedin:** the two OAuth URLs stay as plain text with bold placeholders, because the next sentence says "Replace the bold values" and code formatting would drop the bold. "Next we grant the application to act" is missing "permission".
- **simple-waypoint-scroll:** "Having learnt ... from the coding community, and wanted to give something back" is missing "I". "work around" (noun) would usually be "workaround". The GitHub link `http://github/svenpam/Simple-Waypoint-Scroll` is missing `.com`, but this pass does not change links.
- **site-30:** "for close family friend's local church" is missing "a". "none the less", "snow-ball", "serverside" and the description's "face lift" are older spellings, left as written.
- **Non-breaking spaces:** many articles contain stray non-breaking spaces left by the old editor. They show as normal spaces; only the ones inside edited text were replaced.

`tests/known-broken.json` (not edited): the entry `/Areas/t2t2015/Uploads/t2t.png` is no longer used and can be removed.

## 4. Counts

Articles in batch: 20. Articles touched: 17 (no changes in `new-job`, `other-work`, `research`).

| Kind | Count |
| --- | --- |
| typo | 30 |
| grammar | 16 |
| spelling | 15 |
| punctuation | 3 |
| code | 5 |
| title | 0 |
| images | 1 |
| links | 0 |
| **Total** | **70** |

Of the 69 text changes, 1 is in a description and 68 are in article bodies. The 5 `code` entries are 3 removed line-number columns and 2 typo fixes in code comments.

Changes that don't alter the visible text, so are not in the JSON files:
- 9 fenced blocks added: 5 `csharp`, 2 `js`, 1 `xml`, 1 `powershell`.
- 1 HTML `<pre><code class="language-text">` block in google-maps.
- 1 empty `<pre>` removed.
- Inline code added in 9 articles.
