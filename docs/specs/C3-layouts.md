# C3: Layouts and partials

Wave 3 · Depends on: C1 · Size: L

## Goal

Port the site chrome and the article, blog list and HTML sitemap templates from the live HTML to Nunjucks so the output markup matches live, minus the agreed removals. Add the filters and collections every other template relies on. Seed two real articles so the article layout can be tested before C10 converts the rest.

## Read first

- `docs/specs/README.md`, especially 3.2 (URLs), 3.4 (front matter), 3.5 (section striping) and 3.6 (filters)
- Live snapshots: `docs/baseline/live/pages/index.html`, `blog.html`, `sitemap.html`, `blog/sass-loops.html`, `blog/authentication-through-azure.html`
- Old Razor logic (reference only), on branch `archive/umbraco`: `Tranquility.CMS/Views/Master.cshtml`, `_Page.cshtml`, `Partials/_Article.cshtml`, `Partials/_Meta.cshtml`, `Partials/_Footer.cshtml`, `Partials/_ArticleSummary.cshtml`. View with `git show origin/archive/umbraco:Tranquility.CMS/Views/Master.cshtml`.

## Owns

`src/_includes/**` (replaces C1's `base.njk` stub), `config/filters.js`, `config/collections.js`, `src/blog.njk`, `src/sitemap.njk`, `src/blog/blog.11tydata.js`, `src/blog/sass-loops.md`, `src/blog/authentication-through-azure.md` (seed; C10 overwrites both), `tests/filters.test.mjs`, `tests/layouts.test.mjs`.

## Deliberate differences from live

Everything else must match the live markup (class names, nesting, element order, text).

| # | Live | New |
| --- | --- | --- |
| 1 | Nav has a "Work" item | Removed |
| 2 | Footer "Site" list has `/work` | Removed |
| 3 | Footer Stack Overflow link `//stackoverflow.com/cv/spammenter` | `site.links.stackoverflow` |
| 4 | Footer "More > CV" links to SO CV | `/cv` |
| 5 | "Built with Umbraco" | `Built with Eleventy, see <a href="...">Source</a>.` |
| 6 | Google Analytics script | Removed |
| 7 | Disqus comments block (`<div id="comments">...`) | Removed |
| 8 | `<time datetime="24/07/2019 15:22:06">` | `<time datetime="2019-07-24T15:22:06Z">` |
| 9 | Blog list paged (`?page=N`) with a pager | Single list of every article, no pager |
| 10 | Copyright year from server clock | Build year |
| 11 | `<meta charset>` after `<title>` | `<meta charset>` first |
| 12 | `og:image`/`twitter:image` relative crop URL or empty | Absolute URL of the generated card (C6 writes the file) |
| 13 | Instagram embed script on every article | Only on articles whose body contains `instagram-media` |

## Steps

### 1. Filters and global data: `config/filters.js`

```js
import { readFileSync } from "node:fs";
const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const pad = (n) => String(n).padStart(2, "0");
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export const cleanUrl = (url) => (!url || url === "/" ? "/" : url.replace(/\/+$/, ""));
export const absoluteUrl = (url) => (/^https?:\/\//.test(url) ? url : site.url + cleanUrl(url));
export const dateShort = (d) => `${pad(d.getUTCDate())}-${MONTHS[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(2)}`;
export const dateLong = (d) => `${pad(d.getUTCDate())}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
export const dateIso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
export const isOld = (d, now = Date.now()) => now - d.getTime() > YEAR_MS;
export const ogImagePath = (url) => (cleanUrl(url) === "/" ? "/og/index.png" : `/og${cleanUrl(url)}.png`);

export default function (eleventyConfig) {
  Object.entries({ cleanUrl, absoluteUrl, dateShort, dateLong, dateIso, isOld, ogImagePath })
    .forEach(([name, fn]) => eleventyConfig.addFilter(name, fn));
  eleventyConfig.addGlobalData("build", { year: new Date().getUTCFullYear() });
}
```

Dates in front matter have no timezone and are treated as UTC everywhere. Never format with local time.

### 2. Collections: `config/collections.js`

```js
const GLOB = "./src/blog/*.md";
export default function (eleventyConfig) {
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob(GLOB).sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("articlesAsc", (api) =>
    api.getFilteredByGlob(GLOB).sort((a, b) => a.date - b.date));
}
```

### 3. Directory data: `src/blog/blog.11tydata.js`

```js
export default {
  layout: "layouts/article.njk",
  permalink: (data) => `/blog/${data.page.fileSlug}/`,
  heroTitle: "Blog",
  leadingSpacer: true,
};
```

### 4. Layout chain

`base.njk` > `page.njk` > `article.njk`. Eleventy layouts don't share Nunjucks blocks, so the hero `<style>` is emitted from `base.njk` using page data.

Keep the live indentation roughly as it is; whitespace differences are fine, structure and order are not.

#### `src/_includes/layouts/base.njk`

```njk
<!DOCTYPE html>
<html lang="en-gb">
<head>
{% include "partials/meta.njk" %}
    <link href="/a/dist/css/ste-pam.min.css" rel="stylesheet" />
{% if heroImage %}{% heroStyle heroImage, heroFocus %}{% endif %}
    <script>
        window.lazyLoadOptions = {
            elements_selector: ".lazyload",
            class_loaded: "lazyloaded",
            class_loading: "lazyloading"
        };
    </script>
    <script async src="https://cdn.jsdelivr.net/npm/vanilla-lazyload@10.19.0/dist/lazyload.min.js"></script>
</head>
<body>
{% include "partials/nav.njk" %}
    <main>
{{ content | safe }}
    </main>
{% include "partials/footer.njk" %}
    <script>
        document.getElementById('mobileMenu').addEventListener('click', function (ev) {
            document.getElementById('mobileMenu').style.display = "none";
            document.getElementById('siteNav').classList.add('active');
            document.body.className += 'menu-open';
            return false;
        }, false);

        document.getElementById('closeMobMenu').addEventListener('click', function (ev) {
            document.getElementById('mobileMenu').style.display = "";
            document.getElementById('siteNav').classList.remove('active');
            document.body.className = '';
            return false;
        }, false);
    </script>
</body>
</html>
```

The menu script is copied from live as is (including `className += 'menu-open'` without a leading space); don't "fix" it, as the CSS may rely on it.

#### `src/_includes/partials/meta.njk`

```njk
{%- set pageTitle = site.name if title == site.name else (title + " | " + site.name) -%}
{%- set canonical = page.url | absoluteUrl -%}
{%- set ogImageUrl = (ogImage or (page.url | ogImagePath)) | absoluteUrl -%}
<meta charset="utf-8" />
<title>{{ pageTitle }}</title>
<meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16">
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="{{ site.themeColor }}">

<meta name="description" content="{{ description }}">
<link href="{{ canonical }}" rel="canonical">

<meta property="og:title" content="{{ pageTitle }}" />
<meta property="og:locale" content="{{ site.locale }}">
<meta property="og:description" content="{{ description }}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{{ canonical }}" />
<meta property="og:image" content="{{ ogImageUrl }}" />
<meta property="og:site_name" content="{{ site.name }}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="{{ site.twitter }}" />
<meta name="twitter:creator" content="{{ site.twitter }}" />
<meta name="twitter:image" content="{{ ogImageUrl }}" />
```

#### `src/_includes/partials/nav.njk`

Copy `<nav id="siteNav" class="site-nav">...</nav>` from `docs/baseline/live/pages/index.html` exactly, minus the `<li>` containing the `#code` icon and `/work` link (5 items remain: Back, Home, About, Blog, Contact).

#### `src/_includes/partials/footer.njk`

Copy `<footer class="section section--footer footer hidden-print">...</footer>` from the live home snapshot, then apply differences 2 to 5 and 10:

- Site list: Home (`/`), About Me (`/about`), Blog (`/blog`), Site Map (`/sitemap`).
- Social: Twitter `{{ site.links.twitter }}`, LinkedIn `{{ site.links.linkedin }}`, Stack Overflow `{{ site.links.stackoverflow }}`, Github `{{ site.links.github }}`, keeping the `social__*` classes.
- More: `<li><a href="/cv">CV</a></li>`, Contact.
- Keep "Based In / Liverpool, UK", the Stack Overflow flair image and the LinkedIn badge exactly.
- Copyright: `Copyright  &copy; 2012 - {{ build.year }} {{ site.name }}` (two spaces after "Copyright", as live).
- Credit: `<small>Built with Eleventy, see <a href="{{ site.links.source }}">Source</a>.</small>`

#### `src/_includes/layouts/page.njk`

```njk
---
layout: layouts/base.njk
---
<section class="hero hero--{{ theme or '' }}">
    <div class="container">
            <h1 class="hero__title">{{ heroTitle or altTitle or title }}</h1>
{%- if subtitle and not heroTitle %}
                <h3 class="hero__subtitle">{{ subtitle }}</h3>
{%- endif %}
    </div>
</section>
<div class="sections">
{%- if leadingSpacer %}
<div></div>
{%- endif %}
{{ content | safe }}
</div>
```

`hero hero--` with an empty theme is intentional: it's what live renders.

#### `src/_includes/partials/old-alert.njk`

Copy the `<div class="alert alert--old">...</div>` block from `docs/baseline/live/pages/blog/sass-loops.html` exactly.

#### `src/_includes/layouts/article.njk`

```njk
---
layout: layouts/page.njk
---
{%- set older = collections.articlesAsc | getPreviousCollectionItem(page) -%}
{%- set newer = collections.articlesAsc | getNextCollectionItem(page) -%}
<article class="section">
    <header class="section__facts section__facts--container">
        <div class="section__fact section__fact--lift">
            <h1 class="lead"><a class="h2" href="{{ page.url | cleanUrl }}">{{ title }}</a></h1>
            <p class="text-center">{{ topic }}</p>
            <p class="text-muted">
                {{ description }}
            </p>
            <div class="section__meta">
                <span>{{ site.author }} <span class="text-muted">//</span> <a href="//twitter.com/svenpam">@SvenPam</a> <span class="text-muted">//</span>
                    {%- for tag in tags %} <span class="tag">{{ tag }}</span>{% endfor %}
                    </span><time datetime="{{ page.date | dateIso }}">{{ page.date | dateShort }}</time>
            </div>
        </div>
    </header>
    <div class="article section__content">
{%- if (updated or page.date) | isOld %}
{% include "partials/old-alert.njk" %}
{%- endif %}
                    <div class="row">
                    <div class="col-12 col-md-12">
{{ content | safe }}
                    </div>
            </div>
    </div>
    <footer class="section__content">
        <nav>
            <ul class="pager">
{%- if older %}
                    <li><a href="{{ older.url | cleanUrl }}"><span>&larr;</span> Older</a></li>
{%- endif %}
{%- if newer %}
                    <li><a href="{{ newer.url | cleanUrl }}">Newer <span>&rarr;</span></a></li>
{%- endif %}
            </ul>
        </nav>
    </footer>
</article>
{%- if "instagram-media" in content %}
<script async="" defer="" src="//platform.instagram.com/en_US/embeds.js"></script>
{%- endif %}
```

Note: Eleventy adds `tags` values as collection names. That's harmless; don't rename the field.

#### `src/_includes/partials/article-summary.njk`

Expects a variable `article` (a collection item):

```njk
<article class="media">
    <div class="media_body">
        <h4 class="media__heading"><a class="media__link" href="{{ article.url | cleanUrl }}">{{ article.data.title }}</a></h4>
        <time class="text-muted" datetime="{{ article.date | dateIso }}">{{ article.date | dateShort }}</time>
        <p>{{ article.data.description }}</p>
    </div>
</article>
```

### 5. Blog list: `src/blog.njk`

```njk
---
title: Blog
description: ""
layout: layouts/page.njk
heroImage: /media/1054/2.jpg
heroFocus: { x: 0.49166666666666664, y: 0.34615384615384615 }
permalink: /blog/
---
<section class="section">
    <div class="section__content">
            <ul class="list list--unstyled">
{%- for article in collections.articles %}
                    <li>
{% include "partials/article-summary.njk" %}
                    </li>
{%- endfor %}
            </ul>
    </div>
</section>
```

(Focal point values come from the live crop URL `center=0.346...,0.491...`, which ImageProcessor reads as `y,x`.)

### 6. HTML sitemap: `src/sitemap.njk`

Matches `docs/baseline/live/pages/sitemap.html`: About, Blog (with every article oldest first), Contact, Sitemap. Home and Not Found aren't listed (as live).

```njk
---
title: Sitemap
description: ""
layout: layouts/page.njk
leadingSpacer: true
heroImage: /media/1056/6.jpg
permalink: /sitemap/
---
<section class="section">
    <div class="section__content">
        <ul>
                <li>
                    <a href="/about">About</a>
                </li>
                <li>
                    <a href="/blog">Blog</a>
                        <ul>
{%- for a in collections.articlesAsc %}
                                <li><a  href="{{ a.url | cleanUrl }}">{{ a.data.title }}</a></li>
{%- endfor %}
                        </ul>
                </li>
                <li>
                    <a href="/contact">Contact</a>
                </li>
                <li>
                    <a href="/sitemap">Sitemap</a>
                </li>
        </ul>
    </div>
</section>
```

### 7. Seed articles

Create two articles so the layout can be exercised. Build them from the live snapshots by hand:

| File | Front matter (from the snapshot's header card) | Body |
| --- | --- | --- |
| `src/blog/sass-loops.md` | `title: SASS Loops`, `description: Putting SASS loops to good use.`, `date: 2017-04-23T15:46:11`, `topic: Guide`, `tags: []` | The inner HTML of `.article .row > .col-12` from `docs/baseline/live/pages/blog/sass-loops.html`, pasted as raw HTML |
| `src/blog/authentication-through-azure.md` | `title: Authentication Through Azure`, `description: Protect a serverless application with Azure AD and gain access via a SPA.`, `date: 2019-07-24T15:22:06`, `topic: Guide`, `theme: dark`, `tags: []` | Same approach |

Raw HTML in Markdown is fine here (Markdown passes block HTML through). C10 will replace these files with converted Markdown. Leave any broken image paths in the body as they are on live.

### 8. Tests

`tests/filters.test.mjs` (import the named exports from `config/filters.js`):

| Input | Expected |
| --- | --- |
| `cleanUrl("/")`, `cleanUrl("/about/")`, `cleanUrl("/blog/x/")` | `/`, `/about`, `/blog/x` |
| `absoluteUrl("/")`, `absoluteUrl("/about/")`, `absoluteUrl("https://x.y/z")` | `https://ste-pam.com/`, `https://ste-pam.com/about`, unchanged |
| `dateShort(new Date("2019-07-24T15:22:06Z"))` | `24-Jul-19` |
| `dateLong(new Date("2019-07-24T15:22:06Z"))` | `24-Jul-2019` |
| `dateIso(new Date("2019-07-24T15:22:06Z"))` | `2019-07-24T15:22:06Z` |
| `isOld(new Date("2019-07-24T00:00:00Z"))` | `true` |
| `isOld(new Date(Date.now() - 1000))` | `false` |
| `ogImagePath("/")`, `ogImagePath("/blog/sass-loops/")` | `/og/index.png`, `/og/blog/sass-loops.png` |

`tests/layouts.test.mjs` (uses `cheerio` on built `_site` files; run after `npm run build`):

- `blog/sass-loops/index.html`: has `nav#siteNav` with exactly 5 `li.list__item`; no `/work` link anywhere; `.sections > div:first-child` is an empty `div`; `article.section header .lead a.h2` text is `SASS Loops` with `href="/blog/sass-loops"`; `time[datetime="2017-04-23T15:46:11Z"]` text `23-Apr-17`; `.alert.alert--old` present; pager has an "Older" or "Newer" link pointing at the other seed article; no `#disqus_thread`; no `google-analytics` string; `<title>` is `SASS Loops | Stephen Pammenter`; canonical is `https://ste-pam.com/blog/sass-loops`; `og:image` is `https://ste-pam.com/og/blog/sass-loops.png`.
- `blog/authentication-through-azure/index.html`: `section.hero` has classes `hero hero--dark`; hero title `Blog`.
- `blog/index.html`: lists 2 `article.media` items, newest first; no `.pagination`; `.sections > section:first-child` (no leading spacer).
- `sitemap/index.html`: leading spacer present; the Blog `ul` lists both seed articles, oldest first.
- Footer on any page: links `/cv`, `https://stackoverflow.com/users/2818648/ste-pammenter`; text `Built with Eleventy`; copyright contains the current year.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `npm run build` succeeds; `tests/filters.test.mjs` and `tests/layouts.test.mjs` pass. |
| AC2 | For `blog/sass-loops/index.html`, the markup of `nav#siteNav`, `section.hero`, `article.section > header` and `footer.section--footer` matches the live snapshot structurally (same tags, classes, nesting, text) except for the listed deliberate differences. Check by diffing a normalised DOM dump (tag + class + text per node) of both files; include the diff in the report. |
| AC3 | No page in `_site` contains `analytics.js`, `UA-45636226`, `disqus`, `/work"` or `Built with Umbraco`. |
| AC4 | All internal `href`s produced by the templates have no trailing slash (except `/`). |
| AC5 | The section striping rule (README 3.5) holds: spacer on articles and sitemap, none on the blog list. |
| AC6 | Dates render identically regardless of the machine's timezone (`TZ=America/Los_Angeles npm run build` gives the same `time` elements as `TZ=UTC`). |
| AC7 | The heroStyle shortcode is invoked only when `heroImage` is set (seed articles have none). |

## Verify

```bash
npm run build && node --test tests/filters.test.mjs tests/layouts.test.mjs
TZ=America/Los_Angeles npm run build && grep -o '<time[^>]*>[^<]*' _site/blog/sass-loops/index.html
grep -rlE 'analytics.js|disqus|Built with Umbraco|href="/work"' _site || echo "AC3 ok"
```
