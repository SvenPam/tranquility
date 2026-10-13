# Phase 1: Discovery

Status: **Draft, awaiting your decisions** (see [Decisions needed](#8-decisions-needed))
Date: 2026-10-13
Scope: ste-pam.com, Umbraco 7 to static site on Azure

---

## 1. Summary

- The repo is an **Umbraco 7.12.4** site (ASP.NET MVC 5, .NET Framework, SQL Server, Azure Blob media). It cannot be upgraded in place to anything modern, so a rewrite is the right call.
- Live hosting is **Azure App Service behind Cloudflare** (`ARRAffinity` and `cf-*` response headers). DNS is therefore most likely on Cloudflare.
- **The live site does not match `master`.** The live home page talks about Crezco and .NET 8-10; the repo's `Home.cshtml` still says StaffCircle. `/work` renders using a view that was deleted from the repo in 2023. **The live HTML is the source of truth for content and markup, not the repo.**
- **58 articles exist, but only 45 render.** 13 articles listed in the sitemap return the 404 page (details in [2.5](#25-live-site-findings)).
- The site-specific code is small: 8 Razor views, 7 partials, about 700 lines of SCSS on Bootstrap 4, and 3 server-side behaviours (OG image, auto-tweet, XML sitemap).
- The repo SCSS **rebuilds to the live CSS almost exactly when pinned to Bootstrap `4.0.0-beta.2`**, so the design can be carried over with no visual rework.
- Almost everything maps cleanly to a static site. The friction points are: **query-string URLs** (`/blog?page=N`, `/sitemap?xml=true`), **`/media/...` URLs proxied to Blob Storage**, **Disqus thread IDs tied to Umbraco node IDs**, and the **pagination bug that hides 10 articles**.
- Recommended direction: **Astro with Vue components for the templates, hosted on Azure Static Web Apps, media copied into the repo, OG images generated at build time.** Options and tradeoffs are in [section 6](#6-framework-options).

Baseline screenshots of the live site (desktop 1366px and mobile 390px) are in [`docs/baseline/`](baseline/). These are the visual reference for parity checks in later phases.

---

## 2. What exists today

### 2.1 Stack

| Item | Value |
| --- | --- |
| CMS | Umbraco 7.12.4 (`packages.config`) |
| Runtime | ASP.NET MVC 5.2.3, .NET Framework 4.x, Azure App Service (IIS) |
| Edge | Cloudflare proxy in front of App Service |
| Database | SQL Server (`umbracoDbDSN`, token-replaced at deploy) |
| Media | `Our.Umbraco.FileSystemProviders.Azure`, container `media` on storage account `stepam`, served via the site at `/media/{id}/{file}` |
| Imaging | ImageProcessor.Web 4.9 (crops via query string) |
| Schema sync | uSync 3.3 (`uSync/data/**`) |
| Telemetry | Application Insights 2.8 (still active, `request-context` header present) |
| Front end build | Gulp 4 + node-sass + Bootstrap 4 SCSS, output to `a/dist` (git-ignored) |
| CI/CD | **Not in the repo.** `web.Live.config` uses `#{token}#` syntax, which points to an Azure DevOps release pipeline. Nothing to delete here; it lives in Azure DevOps. |

### 2.2 Site-specific code

```
Tranquility.CMS/
  Views/
    Master.cshtml            # <html>, nav, footer, GA, mobile menu JS
    _Page.cshtml             # hero section + responsive hero background crops
    Home.cshtml              # hard-coded home content (STALE vs live)
    Blog.cshtml              # article list, 10 per page, ?page=N
    Article.cshtml           # wraps Partials/_Article + Instagram embed script
    Generic.cshtml           # Umbraco Grid content (used by Not Found)
    Contact.cshtml           # hard-coded links
    Sitemap.cshtml           # HTML sitemap, 2 levels
    Partials/_Article, _ArticleSummary, _Meta, _Footer, _Pagination,
             _ContactForm (unused)
    Partials/Grid/Bootstrap4.cshtml + Editors/*   # Grid to HTML
    MacroPartials/_LatestArticles, _ContactForm
  Service/CoverImageService.cs     # OG image via hcti.io
  Service/TweetService.cs          # auto-tweet on publish
  EventHandlers/SavingEvent.cs     # calls CoverImageService on every save
  EventHandlers/PublishingEvent.cs # tweets new articles once
  Controllers/SiteMapController.cs # /sitemap?xml=true
  Helpers/Pagination.cs, DateTimeExtension.cs
  a/src/styles/**                  # ITCSS SCSS (the design)
  a/src/images/**, a/src/sprites/sprite.svg
  old/**                           # legacy PDFs/images served at /old/...
  favicons, manifest.json, browserconfig.xml, robots.txt
  Web.config <rewrite>             # 3 redirect rules
```

`About.cshtml` and `Work.cshtml` were deleted in commit `357ff66` (Feb 2023) but both pages still render live, so the server has files the repo doesn't.

### 2.3 Content model (from uSync)

All page types compose `_Page`:

| Property | Type | Notes for migration |
| --- | --- | --- |
| Name | node name | `title`; also drives the URL slug |
| altTitle | text | Overrides hero title if set |
| subtitle | text | Under hero title (home: ".NET Developer") |
| description | textarea | Meta description fallback, article summary |
| image | Image Cropper | Hero background. Crops: `OG Image` 1200x630, `Hero - XL` 1920x489, `L` 960x389, `M` 720x370, `S` 540x385, `XS` 320x411 |
| sEO | Epiphany.SeoMetadata | `SEO.Description` overrides description |
| theme | `Light` / `Dark` | Adds `hero--light` / `hero--dark`. All articles are `dark`; other pages render `hero--` (unset) |
| coverImageURL | text | hcti.io URL, written by `SavingEvent` |

Document types: `home`, `about`, `blog`, `blogArticle`, `work`, `contact`, `generic`, `sitemap`.

`blogArticle` adds `content` (Umbraco Grid), `tags`, `topic` (None, Project, Personal, Interesting, TIL, Guide, Site, Cooking) and `hasBeenTweeted`.

Grid editors: Rich text, Image, Macro, Embed, Quote, Code. In the rendered HTML these become plain HTML inside `div.row > div.col-12.col-md-12`, plus iframes/scripts for embeds.

### 2.4 Defects found in the code

| # | Finding | Where |
| --- | --- | --- |
| B1 | Pagination skips `page * size` instead of `(page - 1) * size`. Page 2 shows articles 21-30, so **articles 11-20 never appear in the blog list**. Page 6 is empty. | `Helpers/Pagination.cs` |
| B2 | Google Analytics uses Universal Analytics `UA-45636226-1`, which stopped processing in July 2023. Tracking is dead. | `Master.cshtml` |
| B3 | Footer links to `/#work`; the home page has no `#work` anchor. | `_Footer.cshtml` |
| B4 | `/cv` 301s to `stackoverflow.com/cv/spammenter`, and the footer "CV" link and About page point there too. Stack Overflow CV was shut down in 2022. | `Web.config`, `_Footer.cshtml` |
| B5 | Contact page Twitter link is `//twiter.com/svenpam` (typo). Still live. | `Contact.cshtml` |
| B6 | Auto-tweet uses TweetSharp on the X v1.1 API, which no longer works for free accounts. | `TweetService.cs` |
| B7 | Footer says "Built with Umbraco". Must change. | `_Footer.cshtml` |
| B8 | Contact form controller/partial/notification service are dead code. | `Controllers`, `Service` |
| B9 | The XML sitemap lists every article twice, and includes the 13 articles that 404. | `SiteMapController.cs` |
| B10 | `<time datetime="24/07/2019 15:22:06">` is not a valid HTML datetime. | `_Article.cshtml` |

### 2.5 Live site findings

Crawled all 64 URLs from `/sitemap?xml=true` plus `/work`, `/contact`, `/sitemap`, `/not-found`, `/blog?page=N` and a random 404.

| # | Finding |
| --- | --- |
| L1 | **13 articles return 404** (the "Not Found" page) despite being in both sitemaps: `c-60-features`, `coast-to-coast-pately-bridge`, `coast-to-coast-success`, `corrupted-html-when-using-visual-studio`, `decorator-pattern`, `dynamic-serving-and-performance`, `mvc5-authentication`, `posting-to-a-facebook-page-via-server-c`, `share-linkedin-company-update-using-c`, `site-30`, `site-redesign-the-rekoning`, `string-to-enum-net-40plus`, `web-config-transform`. Most likely no template assigned in Umbraco. Their content only exists in the Umbraco DB. |
| L2 | **`/work` is not a content node.** It is Umbraco's alternate-template URL: the Home node rendered with the `Work` template. That's why its title, description and canonical are the home page's. It isn't in either sitemap. |
| L3 | **Live home content is newer than the repo** (Crezco, open to opportunities, "Get in touch" goes to LinkedIn). The repo version must not be used as the source. |
| L4 | `/my-cv` (linked from the repo's `Home.cshtml`) returns 404, but the live home page no longer links to it. No impact. |
| L5 | Old articles embed images from `https://ste-pam.com/res/*` and `/Content/img/*`, which **already 404** (e.g. `/res/miruscreen2.png`, `/res/DiamondProblem.svg`). Several of those files exist under `/old/` in the repo, so they could be fixed during migration. `/umbraco/nothing.jpg` is also referenced and 404s. |
| L6 | **Only 13 files are referenced under `/media/`** across the whole site (hero images and a handful of article images). The `/Areas/ste_pam/Uploads/*` to `/old/*` redirect is still used by 4 article images. |
| L7 | **OG images are mostly empty.** 40 of the 53 crawled pages that render have `og:image=""`. 4 articles use hcti.io images, `site-40` has the literal value `test`, and the rest use a hero crop. |
| L8 | Every article shows the "Old Article" banner (none updated in the last year). |
| L9 | All 45 rendering articles have a Disqus ID in the page (`article-1069` to `article-1219`), so these can be captured from HTML without database access. |
| L10 | Both `/about` and `/about/` return 200 (no canonical redirect). `/not-found` returns 200; unknown URLs return 404 with the same content. |
| L11 | Embeds in article bodies: Spotify, CodePen, GitHub Gist, Strava, Instagram, YouTube, JustGiving image. All are third-party iframes/scripts and work on a static site. |
| L12 | Only 3 articles have tags (`front-end`, `svg`, `gulp`, `itcss`, `process`, `methodology`). Topics: Project 16, Guide 12, Personal 6, Site 6, Interesting 2, TIL 2, Cooking 1. |
| L13 | Blob Storage is not directly reachable from this environment, but every media file is downloadable through `https://ste-pam.com/media/...`, which is enough for migration. |

---

## 3. How the main parts render

See [`docs/baseline/`](baseline/) for screenshots: `home`, `about`, `work`, `blog`, `article`, `article-embeds`, `contact`, `sitemap`, `404`, each at `-desktop` and `-mobile`.

### 3.1 Shared layout

```
<head>  _Meta (title, description, canonical, OG, Twitter card, favicons)
        /a/dist/css/ste-pam.min.css
        per-page <style>: hero background-image at 5 breakpoints
          e.g. /media/1058/mountains.jpg?anchor=center&mode=crop&width=320&height=411
        vanilla-lazyload 10.19 from jsDelivr
<body>
  nav#siteNav.site-nav    fixed left icon rail (desktop) / off-canvas (mobile):
                          Back, Home, About, Blog, Work, Contact
  <main>
    section.hero[.hero--dark]
      h1.hero__title      (altTitle || Name), or "Blog" on articles
      h3.hero__subtitle
    div.sections
      ...page body...
  footer.section--footer  Site / Social / More + Based In, SO flair, copyright,
                          floating hamburger button on mobile
  <script> GA (UA) + mobile menu toggle (~15 lines)
```

Visual language: monospace type throughout (`SFMono-Regular, Menlo, Monaco, Consolas...`), teal `#29B8B9` links, light grey `#EEE` page, full-width hero photo with fixed background attachment.

JavaScript in total: mobile menu toggle, lazy loading, Disqus, Instagram embed script, and whatever embeds an article includes. **None of it needs a framework.**

### 3.2 Page types

| Page | URL | Rendering |
| --- | --- | --- |
| Home | `/` | Hero (mountains, ".NET Developer"), "Hello" intro, "Employment" section, "Get in touch" to LinkedIn |
| About | `/about` | Hero (`/media/1052/5.jpg` with focal point), "stacks" logo row (JS, HTML5, CSS3, C#, SQL), bio sections |
| Work | `/work` | Home's hero and meta; portfolio rows with iframe "device mockups" of past projects (Dev Team Handbook, Car Keys Styles, archived sites) |
| Blog | `/blog` | Card list of `_ArticleSummary` (title, `dd-MMM-yy` date, description) with a dotted left border; pager with `?page=N` absolute links |
| Article | `/blog/{slug}` | Hero "Blog" (dark theme). Dark card overlapping the hero: linked title, topic, description, "Ste Pammenter // @SvenPam // #tags", date. Dark body. "Old Article" banner. Grid HTML. Older/Newer pager. Disqus comments. |
| Contact | `/contact` | "Let's talk" + LinkedIn/Twitter links |
| Sitemap | `/sitemap` | Nested list: About, Blog (all 58 articles), Contact, Sitemap |
| 404 | any unknown URL, and `/not-found` | Hero "Not Found" (default background), U2 joke, Spotify iframe |

### 3.3 Metadata

- Title: `"{Name} | Stephen Pammenter"`, or `Stephen Pammenter` on home (and `/work`).
- Description: `SEO.Description ?? description`. Empty on About, Contact, 404.
- Canonical and `og:url`: absolute URL.
- `og:image`: hcti.io URL if set, else the hero `OG Image` crop as a **relative** URL (which social platforms don't resolve properly), else empty.
- `twitter:card = summary_large_image`, site/creator `@SvenPam`.

### 3.4 OG image generation today

On every back-office save, Umbraco posts an HTML+CSS snippet to **hcti.io** and stores the returned URL. Card: 1200x630, background `/a/dist/img/generic/2-100.jpg`, centred dark box `#343a40` with title, description, "Ste Pammenter // @SvenPam // #tags" and date `dd-MMM-yyyy`, monospace font. In practice only 4 articles ended up with one (L7).

### 3.5 Styles

- ITCSS structure, 7 layers, about 700 lines of custom SCSS, importing Bootstrap 4 partials (reboot, type, grid, code, forms, buttons, pagination, text utilities, screen readers) via `../../../../node_modules/bootstrap/scss/...`.
- **Rebuild test:** compiling the repo SCSS with Dart Sass and comparing selectors against the live `ste-pam.min.css`:

  | Bootstrap version | Selectors only in live | Only in rebuild |
  | --- | --- | --- |
  | 4.0.0 (what `package.json` resolves to today) | 47 | 79 |
  | **4.0.0-beta.2** | **8** | **5** |
  | 4.0.0-beta.3 | 26 | 38 |

  With `4.0.0-beta.2` the only differences are vendor-prefixed placeholder selectors (autoprefixer) and equivalent `:nth-child` forms. **The design can be ported by pinning `bootstrap@4.0.0-beta.2` and keeping the SCSS unchanged** except import paths.
- Public asset paths used by markup and CSS: `/a/dist/css/ste-pam.min.css`, `/a/dist/img/**`, `/a/dist/sprites/sprite.svg`. Keeping these paths means no SCSS or markup edits.

---

## 4. URL inventory (live)

| URL | Live status | Static approach |
| --- | --- | --- |
| `/` | 200 | `index.html` |
| `/about` | 200 | Page |
| `/work` | 200 (alt template on Home) | Page at `/work` |
| `/blog` | 200 | List page |
| `/blog?page=N` | 200 | See R1 |
| `/blog/{slug}` x45 | 200 | One Markdown file each, slug preserved exactly |
| `/blog/{slug}` x13 | **404** | Decision D4 |
| `/contact` | 200 | Page |
| `/sitemap` | 200 | Page |
| `/sitemap?xml=true` | 200 XML | See R2 |
| `/not-found` | 200 | 404 page (also served for unknown URLs with status 404) |
| `/media/{id}/{file}` x13 | 200 | See R3 |
| `/a/dist/css/ste-pam.min.css`, `/a/dist/img/**`, `/a/dist/sprites/sprite.svg` | 200 | Same paths |
| `/old/*` | 200 | Copy as is |
| `/favicon*`, `/apple-touch-icon.png`, `/android-chrome-*.png`, `/mstile-150x150.png`, `/manifest.json`, `/browserconfig.xml`, `/robots.txt` | 200 | Copy as is |
| `/cv*` | 301 to SO CV (dead) | Decision D9 |
| `/blog/article/*` | 301 to `/blog/*` | Keep redirect |
| `/Areas/ste_pam/Uploads/*` | 301 to `/old/*` | Keep redirect |
| `/res/*`, `/Content/img/*` | 404 already | Optionally redirect to `/old/*` where the file exists (D11) |

Conventions: extensionless, no trailing slash (`addTrailingSlash=false`). Today `/about/` also returns 200; on the new host it would 301 to `/about`, which is an improvement.

---

## 5. Requirement fit and risks

| Req | Requirement | Fit | Notes |
| --- | --- | --- | --- |
| 1 | URL structure and content unchanged | Mostly | Path URLs are fine. **Query-string URLs (R1, R2) can't be reproduced exactly on a static host.** |
| 2 | Style/design unchanged | Yes | SCSS rebuilds to near-identical CSS with Bootstrap `4.0.0-beta.2`. |
| 3 | Hosted in Azure | Yes | Azure Static Web Apps (recommended). |
| 4 | Assets | Yes | 13 media files plus `/old` and `/a` assets. See R3. |
| 5 | Markdown source | Yes | Article bodies are simple HTML (paragraphs, links, images, code, a few embeds). Converts to Markdown with a little raw HTML for embeds. |
| 6 | OG image for new content | Yes | Build-time generation, no external API (R6). |
| 7 | New CI, publish on push to main | Yes | GitHub Actions with the SWA deploy action. |
| S1 | Umbraco no longer used | Yes | App Service, SQL DB, Blob account and App Insights can be retired after cut-over. |
| S2 | Same domain, design, content, URLs | Yes, with R1/R2 exceptions | |

### Risks and how to handle them

**R1. Blog pagination.** 58 articles at 10 per page. Static hosts ignore query strings, so `/blog?page=2` will serve `/blog`. Because of B1 the current pager is already broken. Options:
- a) **One `/blog` page listing all articles** (recommended). Every old `?page=N` link still lands on a page containing every article. About 58 short cards, comparable to the current sitemap page length.
- b) Path pages `/blog/page/2` etc. (new URLs; old query links fall back to page 1).
- c) A small script that reads `?page` and shows that slice (keeps URLs, needs JS).

**R2. XML sitemap.** `/sitemap?xml=true` would serve the HTML sitemap. Proposal: generate `/sitemap.xml` (deduplicated, real pages only), add it to `robots.txt`, resubmit in Search Console.

**R3. Media.** Static Web Apps can redirect to an external host but can't proxy to it. Options:
- a) **Copy the 13 used files into the repo at the same `/media/{id}/{file}` paths** (recommended). URLs preserved, no Blob dependency, storage account can go.
- b) Keep Blob behind Azure Front Door routing `/media/*` (URLs preserved, roughly £30/month).
- c) Rewrite links to the blob URL (URLs change).

Hero crops (`?anchor=center&mode=crop&width=...`) are generated by templates, not authored. They become pre-generated files at build time with no public URL impact.

**R4. Disqus comments.** Threads are keyed on `disqus_identifier = 'article-{UmbracoNodeId}'` and `disqus_url`. Each article's front matter must keep its node ID. Available from HTML for the 45 live articles (L9); the 13 broken ones need it from Umbraco.

**R5. Render-time values become build-time values.**
- "Friendly" dates: always render `dd-MMM-yy`. All articles are years old, so this matches what is shown today.
- "Old Article" banner: compute from an `updated` front-matter date at build. Shows on every current article (L8).
- Copyright year: build time. A scheduled weekly build keeps year and banner accurate between publishes.

**R6. OG images.** Today only 4 articles have a generated card (L7). Plan: generate a card at build time for **every** article and page that lacks one, emitted as an absolute URL. That's an improvement over today rather than a change. Generators:
- **Satori + resvg** (recommended): JSX/HTML to PNG in Node, fast, no browser. Needs a bundled font file, so the monospace face may differ slightly from the hcti.io render.
- **Playwright screenshot** of an HTML template: pixel-faithful to real CSS, slower, heavier CI.

**R7. Content extraction.** You planned to extract articles from Umbraco by hand. The crawl shows that 45 of the 58 articles can be **converted automatically from the live HTML**: title, topic, description, date and time, tags, Disqus ID and body all sit in predictable markup. That output is exactly what readers see today. Only the 13 articles that 404 need manual extraction from Umbraco, if you want them back. See D3/D4.

**R8. Article order.** Older/Newer uses Umbraco tree order, the list uses create date. Proposal: use `date` for both and spot-check against the live pager links during migration.

**R9. Proposed drops** (D8): auto-tweet (B6), UA analytics (B2), App Insights, contact form code (B8), "Built with Umbraco" text (B7, reworded).

**R10. 404 page.** Port "Not Found" as a page, served by the host's 404 override with a real 404 status. Keep `/not-found` as a URL too.

**R11. Domain and Cloudflare.** The site is behind Cloudflare, so DNS is probably on Cloudflare. Static Web Apps works behind it. Apex domain validation needs a TXT record, or the proxy (orange cloud) switched off briefly during setup. Cloudflare's CNAME flattening handles the apex record.

**R12. Repo/live drift.** Some live views (About, Work, the current Home) aren't in the repo. Templates must be ported **from live HTML**, using the repo only for structure and logic.

---

## 6. Framework options

All options output plain static HTML that runs on Azure Static Web Apps.

| | **A. Astro (+ Vue components)** | **B. VitePress** | **C. Nuxt (Content + `nuxt generate`)** | **D. Eleventy (11ty)** |
| --- | --- | --- | --- | --- |
| Vue | Vue SFCs render on the server to static HTML (no JS unless opted in). Layouts/partials can be `.vue`. | Vue native; theme is Vue SFCs. | Vue native, full app framework. | None (Nunjucks/Liquid/JS templates). |
| Markdown | First class. Content collections with typed front-matter schema (zod). | First class, built for docs. | Nuxt Content, MD + MDC, rich querying. | First class, core use case. |
| JS shipped | **Zero by default.** | Vue + SPA router on every page; `mpa: true` removes it but is experimental. | Hydrated Vue app by default. | **Zero.** |
| Custom design | Any HTML, no theme to fight. | Default theme must be replaced; docs-oriented. | Any HTML. | Any HTML. |
| URLs | Full control. `build.format: 'file'` gives `about.html` served as `/about`. | `cleanUrls`; slugs from file paths, overrides via `rewrites`. | Full control. | Full control via `permalink`. |
| Images | Built-in `astro:assets` (sharp) for hero crops. | Manual. | `@nuxt/image`. | `@11ty/eleventy-img`. |
| SCSS | Native (Vite + `sass`). | Native. | Native. | Separate step or plugin. |
| OG images | Static endpoint per page with Satori at build. | Build hook script. | `nuxt-og-image`. | Script or plugin. |
| Sitemap / RSS | Official integrations. | Sitemap built in, RSS plugin. | Modules. | Plugins. |
| Complexity | Low to medium. | Medium for a bespoke site. | **High** for a site this small. | **Lowest.** |
| Longevity | Large, active; stable majors. | Vue core team; docs focus. | Large, more moving parts. | Very stable, few dependencies. |

### Recommendation

**A. Astro, with templates written as Vue single-file components.**

- Output is the same plain HTML the Razor views produce today, with no framework runtime. That fits "barely use JS" exactly.
- You still write Vue for layout, nav, footer, article card and so on, and can add a hydrated Vue island later if you ever need one.
- Typed content collections catch bad front matter when you add new posts.
- Built-in image pipeline covers the hero crops, and there are official sitemap/RSS integrations.

**Runner-up: D. Eleventy**, if you'd rather drop Vue and keep the toolchain minimal.

**Not recommended:** VitePress (fighting a docs framework to rebuild a bespoke design, SPA by default) and Nuxt (far more framework than this site needs).

### Hosting

| | **Azure Static Web Apps** (recommended) | Storage static website + Front Door |
| --- | --- | --- |
| Cost | Free tier (custom domain + TLS included) | Storage pennies + Front Door ~£30/month |
| Deploy | First-party GitHub Action, PR preview environments | `az storage blob upload-batch` + cache purge |
| Redirects / 404 | `staticwebapp.config.json` routes, `responseOverrides`, `trailingSlash` | Front Door rules engine |
| Extensionless URLs | Yes | Rewrite rules needed |
| Apex domain | Yes (works with Cloudflare flattening) | Yes |

---

## 7. Access notes

- Live site: crawled successfully after you allowed `ste-pam.com`.
- `stepam.blob.core.windows.net` and `hcti.io` are still blocked from this environment. Not needed: media is downloadable via `/media/...` on the site. The 4 hcti.io OG images will be regenerated rather than downloaded (D6).

---

## 8. Decisions needed

| # | Question | My recommendation |
| --- | --- | --- |
| D1 | Framework | **A. Astro + Vue components** |
| D2 | Hosting | **Azure Static Web Apps (Free)** |
| D3 | Content source for the 45 live articles (R7) | **Auto-convert from live HTML to Markdown**, then you review. Your manual Umbraco extraction becomes only for the 13 below. |
| D4 | The 13 articles that 404 today (L1) | Your call: restore (needs manual export from Umbraco, including the node ID) or leave out and keep them 404 |
| D5 | Blog pagination (R1) | **Single `/blog` page** with all articles |
| D6 | OG images (R6) | **Satori at build time for every page**, replacing the 4 hcti.io images too |
| D7 | XML sitemap (R2) | **`/sitemap.xml`** + `robots.txt` entry |
| D8 | Drop list (R9): auto-tweet, UA analytics, App Insights, contact form code | **Drop all.** Want GA4 or a privacy-friendly analytics tool instead? |
| D9 | `/cv` redirect and CV links on footer/About (B4) | Point at your LinkedIn, or remove |
| D10 | Media (R3) | **Copy the 13 files into the repo at the same paths** |
| D11 | Fix known content bugs while porting? (B3 `/#work`, B5 `twiter.com`, L5 broken `/res/` images to `/old/` where the file exists) | **Fix.** Otherwise it's a pixel-exact port, warts included. |
| D12 | Archive branch for the current code | **`archive/umbraco`** from `master`. OK to create and push? |
| D13 | Confirm DNS is on Cloudflare and you can add records there (R11) | Needed for cut-over |
| D14 | Footer "Built with ..." wording (B7) | "Built with Astro, see Source." |

---

## 9. Out of scope (unless you say otherwise)

- Redesign or CSS refactor. Bootstrap 4 beta stays pinned.
- New features (search, tag pages, RSS). RSS is cheap to add.
- Content edits beyond D11.
- Decommissioning the Azure resources (App Service, SQL, Blob, App Insights). This will be listed as a post-cut-over checklist in the plan.
