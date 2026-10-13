# Phase 1: Discovery

Status: **Draft, awaiting your decisions** (see [Decisions needed](#decisions-needed))
Date: 2026-10-13
Scope: ste-pam.com, Umbraco 7 to static site on Azure

---

## 1. Summary

- The repo is an **Umbraco 7.12.4** site (ASP.NET MVC 5, .NET Framework, SQL Server, Azure Blob media). Last real change was March 2023. It cannot be upgraded in place to anything modern; a rewrite is the right call.
- The site-specific surface is small: **8 Razor views, 7 partials, ~700 lines of SCSS** (on top of Bootstrap 4), and 3 server-side behaviours (OG image generation, auto-tweet, XML sitemap). Everything else in the repo is Umbraco back-office boilerplate.
- Almost everything maps cleanly to a static site. The friction points are: **query-string URLs** (`/blog?page=2`, `/sitemap?xml=true`), **on-the-fly image crops** (ImageProcessor), **`/media/...` URLs proxied to Blob Storage**, **Disqus thread IDs tied to Umbraco node IDs**, and a few **render-time values** (relative dates, "Old article" banner, copyright year).
- **I could not reach the live site.** `ste-pam.com` and `www.ste-pam.com` returned DNS `ENOTFOUND` from the public fetcher, and the sandbox egress proxy blocks the domain. The URL inventory below is therefore built from code, not the live sitemap. See [Live site access](#7-live-site-access-blocker).
- Recommended direction: **Astro with Vue components for the templates, hosted on Azure Static Web Apps, media copied into the repo, OG images generated at build time.** Alternatives and tradeoffs are in [section 6](#6-framework-options).

---

## 2. What is in the repo today

### 2.1 Stack

| Item | Value |
| --- | --- |
| CMS | Umbraco 7.12.4 (`packages.config`) |
| Runtime | ASP.NET MVC 5.2.3, .NET Framework 4.x, IIS |
| Database | SQL Server (`umbracoDbDSN`, token-replaced at deploy) |
| Media | `Our.Umbraco.FileSystemProviders.Azure`, container `media` on storage account `stepam` (`config/FileSystemProviders.Live.config`) |
| Imaging | ImageProcessor.Web 4.9 (crops via query string) |
| Schema sync | uSync 3.3 (`uSync/data/**`) |
| DI | Autofac |
| Telemetry | Application Insights 2.8 |
| Front end build | Gulp 4 + node-sass 8 + Bootstrap 4 SCSS, output to `a/dist` (git-ignored) |
| CI/CD | **Not in the repo.** `web.Live.config` uses `#{token}#` syntax, which points to an Azure DevOps "Replace Tokens" release pipeline. Nothing to delete here; the old pipeline lives in Azure DevOps. |

### 2.2 Site-specific code (everything worth reading)

```
Tranquility.CMS/
  Views/
    Master.cshtml            # <html>, nav, footer, GA, mobile menu JS
    _Page.cshtml             # hero section + responsive hero background crops
    Home.cshtml              # hard-coded home content (not CMS driven)
    Blog.cshtml              # article list, 10 per page, ?page=N
    Article.cshtml           # wraps Partials/_Article + Instagram embed script
    Generic.cshtml           # Umbraco Grid content
    Contact.cshtml           # hard-coded links (no form in use)
    Sitemap.cshtml           # HTML sitemap, 2 levels
    Partials/_Article.cshtml, _ArticleSummary.cshtml, _Meta.cshtml,
             _Footer.cshtml, _Pagination.cshtml, _ContactForm.cshtml (unused)
    Partials/Grid/Bootstrap4.cshtml + Editors/*   # Grid to HTML
    MacroPartials/_LatestArticles.cshtml, _ContactForm.cshtml
  Service/CoverImageService.cs   # OG image via hcti.io
  Service/TweetService.cs        # auto-tweet on publish
  EventHandlers/SavingEvent.cs   # calls CoverImageService on every save
  EventHandlers/PublishingEvent.cs # tweets new articles once
  Controllers/SiteMapController.cs # /sitemap?xml=true -> XML sitemap
  Helpers/Pagination.cs, DateTimeExtension.cs
  a/src/styles/**                # ITCSS SCSS (the design)
  a/src/images/**, a/src/sprites/sprite.svg
  old/**                         # legacy PDFs/images served at /old/...
  favicons, manifest.json, browserconfig.xml, robots.txt
  Web.config <rewrite>           # 3 redirect rules
```

### 2.3 Content model (from uSync)

All page types compose `_Page`:

| Property | Type | Notes for migration |
| --- | --- | --- |
| Name | node name | Becomes `title`; also drives the URL slug |
| altTitle | text | Overrides hero title if set |
| subtitle | text | Shown under hero title |
| description | textarea | Meta description fallback, article summary |
| image | Image Cropper | Hero background; crops `OG Image` 1200x630, `Hero - XL` 1920x489, `L` 960x389, `M` 720x370, `S` 540x385, `XS` 320x411 |
| sEO | Epiphany.SeoMetadata | `SEO.Description` overrides description |
| theme | dropdown `Light` / `Dark` | Adds `hero--light` / `hero--dark` |
| coverImageURL | text | hcti.io URL, written by `SavingEvent` |

Document types: `home`, `about`, `blog`, `blogArticle`, `work`, `contact`, `generic`, `sitemap`.

`blogArticle` adds: `content` (Umbraco Grid), `tags` (Umbraco tags), `topic` (None, Project, Personal, Interesting, TIL, Guide, Site, Cooking), `hasBeenTweeted`.

Grid editors in use: Rich text (`rte`), Image (`media`), Macro, Embed, Quote (textstring), Code (textstring). This matters for the Markdown export: RTE becomes Markdown, Image becomes `![]()`, Embed/Macro stay as raw HTML.

### 2.4 Things already broken or stale in the current site

These are worth knowing so we don't faithfully port a bug.

| # | Finding | Where |
| --- | --- | --- |
| B1 | `About.cshtml` and `Work.cshtml` were **deleted from the repo in Feb 2023**, but the `about`/`work` document types and templates still exist. The live server may still have the old view files (Web Deploy often leaves extras), or those pages may be erroring. Live behaviour unknown. | commit `357ff66` |
| B2 | Pagination is buggy: page 2 skips 20 items not 10, and the last page number is never shown. With 10 or fewer articles no pager renders at all. | `Helpers/Pagination.cs` |
| B3 | Google Analytics uses Universal Analytics `UA-45636226-1`. UA stopped processing data in July 2023, so tracking is already dead. | `Master.cshtml` |
| B4 | Footer links to `/#work`; the home page has no `#work` anchor. Home links to `/my-cv`, which is not defined in code (probably a CMS page or redirect). | `_Footer.cshtml`, `Home.cshtml` |
| B5 | `/cv` redirects to `stackoverflow.com/cv/spammenter`. Stack Overflow Jobs/CV was shut down in 2022, so this is a dead redirect. Footer "CV" link is the same. | `Web.config`, `_Footer.cshtml` |
| B6 | Contact page Twitter link is `//twiter.com/svenpam` (typo). | `Contact.cshtml` |
| B7 | Auto-tweet uses TweetSharp against the v1.1 API, which X shut off for free use in 2023. | `TweetService.cs` |
| B8 | Footer says "Built with Umbraco". This will need to change. | `_Footer.cshtml` |
| B9 | `ContactController` and `_ContactForm` exist but the contact page does not use them; `NotificationService` hard-codes `email.Body = "Test"`. Dead code. | `Controllers`, `Service` |

---

## 3. How the main parts of the site render

Built from the Razor views. I could not screenshot the live site (see section 7), so visual parity will be confirmed in Phase 3/4 with screenshot diffs.

### 3.1 Shared layout (`Master.cshtml` + `_Page.cshtml`)

```
<head>  _Meta (title, description, canonical, OG, Twitter card, favicons)
        /a/dist/css/ste-pam.min.css
        per-page <style> for hero background crops (5 breakpoints)
        vanilla-lazyload 10.19 from jsDelivr
<body>
  nav#siteNav.site-nav        off-canvas menu: Back, Home, About, Blog, Work, Contact
  <main>
    section.hero[.hero--light|--dark]
      h1.hero__title          (altTitle || Name), or "Blog" on articles
      h3.hero__subtitle
    div.sections
      ...page body...
  footer.section--footer      3 columns (Site, Social, More/Based In), SO flair, copyright
  <script> GA (UA) + mobile menu toggle (~15 lines)
```

JavaScript on the site in total: the mobile menu toggle, lazy loading of images, Disqus on articles, Instagram embed script on articles. **None of it needs a framework.**

### 3.2 Page types

| Page | URL | Body |
| --- | --- | --- |
| Home | `/` | Hard-coded intro, "years of experience" computed as `now - 2012`, CV link, contact link |
| Blog | `/blog` | `ul.list` of `_ArticleSummary` (title, friendly date, description), newest first, 10 per page via `?page=N` |
| Article | `/blog/{slug}` | Hero title is literally "Blog". Header block: linked title, topic, description, author // @SvenPam // `#tags`, date. "Old Article" warning if `UpdateDate` > 1 year ago. Grid content. Older/Newer pager (by tree order, not date). Disqus comments. |
| Generic | `/{slug}` | Grid content inside `section > .section__content` |
| Contact | `/contact` | Hard-coded "Let's talk" + LinkedIn/Twitter links |
| Sitemap | `/sitemap` | Nested list of root siblings and their children (excludes "Not Found") |
| Sitemap XML | `/sitemap?xml=true` | `X.Web.Sitemap` XML of every visible node |
| About / Work | `/about`, `/work` | Views deleted from repo; live state unknown (B1) |
| 404 | node 1186 "Not Found" | Umbraco content page |

### 3.3 Metadata (`_Meta.cshtml`)

- Title: `"{Name} | {SiteName}"`, or just `{SiteName}` on home.
- Description: `SEO.Description ?? description`.
- Canonical and `og:url`: absolute URL.
- `og:image` / `twitter:image`: `coverImageURL` (hcti.io) if present, else the `OG Image` crop of the hero image.
- `twitter:card = summary_large_image`, site/creator `@SvenPam`.

### 3.4 OG image generation (`CoverImageService`)

On every save in the back office, Umbraco posts an HTML+CSS snippet to **hcti.io** (HTML/CSS to Image API) and stores the returned image URL. The card is 1200x630: background `/a/dist/img/generic/2-100.jpg`, centred dark box `#343a40` with title, description, "Ste Pammenter // @SvenPam // #tags", and date `dd-MMM-yyyy`, in the site's monospace font.

Implications:
- Existing OG images live on **hcti.io**, not on ste-pam.com. They should be downloaded during content export, or regenerated.
- The new generator has to reproduce this card, ideally at build time with no paid API.

### 3.5 Styles

- ITCSS structure, 7 layers, ~700 lines of custom SCSS.
- Pulls in Bootstrap 4 partials (reboot, type, grid, code, forms, buttons, pagination, text utilities, screen readers) via `../../../../node_modules/bootstrap/scss/...` relative paths.
- Uses `@import` and Bootstrap mixins (`media-breakpoint-up`, `make-col`, `make-container`). Modern Dart Sass still compiles `@import` (with deprecation warnings), so the SCSS can move across **as is**, with only the import paths changed.
- Image URLs use `$image-url: '/a/dist/img'` and the sprite is at `/a/dist/sprites/sprite.svg`. Keeping these public paths avoids touching the SCSS and keeps any external hotlinks (the OG card CSS itself references `/a/dist/img/generic/2-100.jpg`).
- Bootstrap version is `^4.0.0`; we should pin the exact 4.x version the live CSS was built from to avoid subtle drift.

---

## 4. URL inventory (from code, to be confirmed against live)

| URL | Source | Static approach |
| --- | --- | --- |
| `/` | Home | `index.html` |
| `/about` | about doc type | Page, if it still exists live (B1) |
| `/blog` | Blog | List page |
| `/blog?page=N` | Pagination | See R1 below |
| `/blog/{slug}` | Articles | One page per Markdown file, slug preserved exactly |
| `/work` | work doc type | Page, if it still exists live (B1) |
| `/contact` | Contact | Page |
| `/sitemap` | Sitemap | Page |
| `/sitemap?xml=true` | SitemapController | See R2 below |
| `/my-cv` | Unknown (CMS) | Need live sitemap |
| Other generic pages | Generic doc type | Need live sitemap |
| `/media/{id}/{file}` | Umbraco media via Blob | See R3 below |
| `/a/dist/css/...`, `/a/dist/img/...`, `/a/dist/sprites/...` | Gulp output | Keep same public paths |
| `/old/*` | Static files | Copy as is |
| `/favicon*.png`, `/apple-touch-icon.png`, `/manifest.json`, `/browserconfig.xml`, `/robots.txt` | Static | Copy as is |
| `/cv*` | 301 to SO CV (dead, B5) | Redirect rule, target to be decided |
| `/blog/article/*` | 301 to `/blog/*` | Redirect rule |
| `/Areas/ste_pam/Uploads/*` | 301 to `/old/*` | Redirect rule |

URL conventions: `umbracoUseDirectoryUrls=true`, `addTrailingSlash=false`. So URLs are extensionless with **no trailing slash**. The host must serve `/about` (not redirect to `/about/`).

---

## 5. Requirement fit and conflicts

| Req | Requirement | Fit | Notes |
| --- | --- | --- | --- |
| 1 | URL structure and content unchanged | Mostly | Path URLs are fine. **Query-string URLs (R1, R2) cannot be reproduced exactly on a static host.** |
| 2 | Style/design unchanged | Yes | SCSS ports as is. Hero crops move from runtime to build time (visually the same). |
| 3 | Hosted in Azure | Yes | Azure Static Web Apps (recommended) or Storage static website + Front Door. |
| 4 | Assets considered | Yes | See R3. |
| 5 | Markdown as source | Yes, with caveats | Grid content becomes Markdown with some raw HTML (embeds, figures, code). Front matter must carry fields the templates need (R5). |
| 6 | OG image generated for new content | Yes | Build-time generation, no external API needed (R6). |
| 7 | New CI, publish on push to main | Yes | GitHub Actions. SWA has a first-party action. |
| S1 | Umbraco no longer used | Yes | App Service, SQL DB and probably App Insights can be decommissioned after cut-over. |
| S2 | Same domain, same design/content/URLs | Yes, with R1/R2 exceptions | |

### Risks and conflicts in detail

**R1. Blog pagination (`/blog?page=N`).** Static hosts route on path only and ignore the query string, so `/blog?page=2` will always serve `/blog`. Given B2 (the pager barely works today) and that you have few articles, options:
- a) **Single `/blog` page listing all articles** (recommended if under ~30 articles). `?page=N` links still land on a valid page.
- b) Path-based pages `/blog/page/2` (new URLs, old query links fall back to page 1).
- c) A few lines of JS that read `?page` and show the right slice (keeps the URL, needs JS).

**R2. XML sitemap at `/sitemap?xml=true`.** Same issue: it would serve the HTML sitemap. Proposal: generate `/sitemap.xml`, reference it from `robots.txt`, and resubmit in Google Search Console. The old query URL was never advertised in `robots.txt`, so impact should be minimal.

**R3. Media under `/media/...`.** Umbraco serves Blob files under `/media/{folderId}/{file}` (`useDefaultRoute=true`), and article HTML will contain those paths. Static Web Apps can redirect to an external host but cannot proxy to it. Options:
- a) **Copy the used media into the repo at the same `/media/...` paths** (recommended; small site, URLs preserved, no Blob dependency, storage account can be deleted).
- b) Keep Blob, put Azure Front Door in front of both SWA and Blob to route `/media/*` (URLs preserved, extra cost, roughly £30/month for Front Door Standard).
- c) Keep Blob and rewrite links to the blob URL at export (URLs change, external hotlinks break).

Hero/grid images currently use ImageProcessor query strings (`?crop=...&width=...`). These are generated by the templates, not authored, so we can replace them with build-time resized files without affecting any public page URL.

**R4. Disqus comments.** Threads are keyed on `disqus_identifier = 'article-{UmbracoNodeId}'` and `disqus_url`. **To keep existing comments, every exported article must keep its Umbraco node ID in front matter**, and the URL must be identical. Easy to do if captured at export, impossible to recover later without the DB.

**R5. Render-time values become build-time values.**
- "Friendly" dates ("Today at...", day name within 6 days) depend on the viewer's current time. Static output would freeze them. Proposal: always render `dd-MMM-yy` (what anyone sees for articles older than a week already).
- "Old Article" banner (`UpdateDate` older than 1 year): compute at build time from an `updated` front-matter date. Since you publish rarely, add a weekly scheduled CI build so it stays accurate. Note `UpdateDate` in Umbraco bumps on every save (the OG hook saves), so the exported value may not reflect real content edits.
- Copyright year and "years of experience": build time, refreshed by the same scheduled build.

**R6. OG images.** Existing ones live on hcti.io and may expire. Plan: download them during export into the repo, and generate new ones at build time for any article without an image. Two ways to generate:
- **Satori + resvg** (HTML-like markup to PNG, pure Node, fast). Needs a bundled TTF font, so the monospace font may differ slightly from the hcti.io render.
- **Playwright screenshot** of an HTML template (pixel-faithful to real CSS, slower, heavier CI).

**R7. Article order for Older/Newer links.** Umbraco uses tree sort order, the blog list uses create date. These are probably the same, but if not, front matter needs an explicit `order`. Proposal: use `date` for both.

**R8. Things I suggest dropping (confirm).**
- Auto-tweet on publish (B7). Replace with nothing, or a manual share.
- Google Analytics UA (B3, already dead). Drop, or replace with GA4 or a privacy-friendly option.
- Application Insights (server telemetry, no server any more).
- Contact form code (B9, unused).
- "Built with Umbraco" footer text (B8) changes to the new stack.

**R9. Third-party embeds.** Stack Overflow flair image, LinkedIn badge from `static.licdn.com`, Instagram embed script, jsDelivr lazyload. All work on a static site, but some may already be broken. Confirm visually in Phase 4.

**R10. 404 page.** Currently the Umbraco "Not Found" node. Port it as a Markdown page served via the host's 404 override, with a real 404 status.

**R11. Apex domain on Azure.** `ste-pam.com` (no www) is the canonical host. Static Web Apps supports apex domains, but needs either Azure DNS (alias record) or a DNS provider with ALIAS/ANAME/CNAME flattening. Need to know who hosts the DNS.

---

## 6. Framework options

All options below produce plain static HTML that can be hosted on Azure Static Web Apps. Scoring is for this site specifically: Markdown-first, near-zero JS, exact URL and design parity.

| | **A. Astro (+ Vue components)** | **B. VitePress** | **C. Nuxt (Content + `nuxt generate`)** | **D. Eleventy (11ty)** |
| --- | --- | --- | --- | --- |
| Vue | Vue SFCs supported as server-rendered components (zero JS unless opted in). Pages/layouts can be `.astro` or Vue. | Vue native. Layouts and theme are Vue SFCs. | Vue native, full app framework. | None. Nunjucks/Liquid/JS templates. |
| Markdown | First class. Content collections with typed front-matter schema (zod). | First class, built for docs. | Nuxt Content module, MD + MDC. Powerful querying. | First class, the core use case. |
| JS shipped | **Zero by default.** | Ships Vue + SPA router on every page. `mpa: true` mode removes it but is marked experimental. | Hydrates a Vue app on every page by default. Can be reduced but takes effort. | **Zero.** |
| Custom design | Write any HTML; no theme to fight. | Default theme must be replaced by a custom theme. Doable, but VitePress is opinionated toward docs layouts. | Any HTML. | Any HTML. |
| URLs | `build.format: 'file'` gives `/about.html`, served as `/about`. Full control over slugs. | `cleanUrls: true`. Slugs from file paths; overriding needs `rewrites`. | Full control via routes. | Full control via `permalink`. |
| Images | Built-in `astro:assets` (sharp) for responsive crops. | Manual (Vite plugin or script). | `@nuxt/image` (works in SSG). | `@11ty/eleventy-img`. |
| SCSS | Native via Vite + `sass`. | Native via Vite + `sass`. | Native via Vite + `sass`. | Plugin or separate `sass` step. |
| OG images | Static endpoint per article (Satori/resvg) at build. | Build hook script. | `nuxt-og-image` module. | Script or plugin. |
| RSS / XML sitemap | Official `@astrojs/rss`, `@astrojs/sitemap`. | Sitemap built in; RSS via plugin. | Modules. | Plugins. |
| Complexity | Low to medium. | Low for docs, medium for a custom site. | **High** for a site this small. | **Lowest.** |
| Longevity risk | Large, active community; stable major versions. | Maintained by Vue core team, docs-focused roadmap. | Large, but more moving parts to upgrade. | Very stable, minimal dependencies. |

### Recommendation

**Option A: Astro, with templates written as Vue single-file components where you want them.**

- Meets "barely use JS" exactly: the output is the same plain HTML the Razor views produce, plus the existing ~15 lines of menu JS.
- You still get to write Vue (layout, header, footer, article components as `.vue` files rendered at build time). You can add a hydrated Vue island later if you ever need interactivity.
- Content collections give a typed schema for front matter, which protects against bad imports when you extract blog posts manually.
- Built-in image pipeline handles the hero crops and media resizing; built-in sitemap/RSS.

**Runner-up: Option D, Eleventy**, if you'd rather drop Vue entirely and keep the toolchain as small as possible. It's the purest "MD to HTML" fit.

**Not recommended:** VitePress (fighting a docs framework to rebuild a bespoke design, and it ships an SPA by default) and Nuxt (far more framework than a handful of static pages needs).

### Hosting options (Azure)

| | **Azure Static Web Apps** (recommended) | Storage static website + Front Door |
| --- | --- | --- |
| Cost | Free tier covers this site (custom domain + managed TLS included) | Storage pennies + Front Door Standard (~£30/month) |
| Deploy | First-party GitHub Action, PR preview environments | Upload via `az storage blob upload-batch` + purge |
| Redirects / 404 | `staticwebapp.config.json` routes, `responseOverrides`, `trailingSlash: "never"` | Front Door rules engine |
| Extensionless URLs | Yes | Needs rewrite rules |
| Apex domain | Yes (Azure DNS alias, or ALIAS/flattening at your DNS provider) | Yes via Front Door |

---

## 7. Live site access (blocker)

I could not inspect the live site from this environment:

- The sandbox egress proxy refuses connections to `ste-pam.com` (organisation network policy).
- The public web fetcher returned **DNS `ENOTFOUND` for both `ste-pam.com` and `www.ste-pam.com`**, and search engines return no indexed pages for the domain.

That second point may mean the domain's DNS has lapsed or the site is down. **Please confirm the site is up and the domain is still registered.** If Umbraco is offline, content extraction will need the database or a backup instead.

To finish discovery properly I need one of:
1. Network access to `ste-pam.com` and `stepam.blob.core.windows.net` allowed in this cloud environment's network policy, or
2. You paste or commit: the HTML of `/sitemap`, the output of `/sitemap?xml=true`, and the rendered HTML of the home page, one article, `/about` and `/work`.

Either lets me confirm the full URL list, generic pages (e.g. `/my-cv`), whether `/about` and `/work` still render (B1), and capture baseline screenshots for visual parity checks.

---

## 8. Decisions needed

Please answer these before I write Phase 2.

| # | Question | My recommendation |
| --- | --- | --- |
| D1 | Framework | **A. Astro + Vue components** |
| D2 | Hosting | **Azure Static Web Apps (Free)** |
| D3 | Media (R3) | **Copy used media into the repo at the same `/media/...` paths**, then retire the storage account |
| D4 | Blog pagination (R1) | **Single `/blog` page** if under ~30 articles. How many articles are there? |
| D5 | XML sitemap (R2) | **Move to `/sitemap.xml`** and add it to `robots.txt` |
| D6 | OG generator (R6) | **Satori + resvg at build time**, existing hcti.io images downloaded and kept |
| D7 | Friendly dates (R5) | **Always `dd-MMM-yy`** |
| D8 | Drop list (R8): auto-tweet, UA analytics, App Insights, contact form code | **Drop all.** Do you want GA4 or another analytics tool added? |
| D9 | `/cv` redirect target (B5) | Point at `/my-cv`, or drop |
| D10 | `/about` and `/work`: keep, and with what content? (B1) | Depends on live check |
| D11 | Fix known content bugs (B4 `/#work`, B6 `twiter.com`) or port exactly? | **Fix** |
| D12 | Archive branch name for the current code | **`archive/umbraco`** created from `master`. OK to create and push it? |
| D13 | Who hosts DNS for ste-pam.com? (R11) | Azure DNS makes the apex domain simplest |
| D14 | Live site access (section 7) | Allow network access, or provide the HTML |

---

## 9. Out of scope for this migration (unless you say otherwise)

- Redesign or CSS refactor (Bootstrap 4 stays; only import paths change).
- New features (search, tags pages, RSS). RSS is cheap to add if you want it.
- Content edits beyond the bug fixes in D11.
