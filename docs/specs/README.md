# Phase 3: Specs

Status: **Draft for review**. Implementation hasn't started
Date: 2026-10-13
Plan: [phase-2-plan.md](../phase-2-plan.md)

Each spec is written so an agent with **no prior context** can implement it. Read this README first, then the one spec you've been given. Don't read other specs unless your spec says to.

---

## 1. Index

| Spec | Chunk | Wave | Depends on | Owner of |
| --- | --- | --- | --- | --- |
| [C0](C0-clean-slate.md) | Clean slate and asset relocation | 1 | none | `.gitignore`, `.gitattributes`, `README.md`, `src/styles/`, `src/assets/`, `src/old/`, `src/static/` |
| [C1](C1-eleventy-scaffold.md) | Eleventy scaffold | 2 | C0 | `package.json`, `package-lock.json`, `.nvmrc`, `eleventy.config.js`, `config/README.md`, `src/_data/site.json`, `scripts/validate-content.mjs`, `scripts/lib/schema.mjs`, `scripts/dev.mjs`, `tests/smoke.test.mjs`; stubs of `src/index.njk`, `layouts/base.njk` and `config/hero.js` (handed to C5, C3 and C4) |
| [C2](C2-styles-assets.md) | Styles and static assets | 3 | C1 | `config/assets.js`, `config/css.js`, `scripts/build-css.mjs`, `scripts/lib/css-normalise.mjs`, `tests/css-parity.test.mjs`, `tests/assets.test.mjs`; two named edits in `src/styles/` |
| [C3](C3-layouts.md) | Layouts and partials | 3 | C1 | `src/_includes/**`, `config/filters.js`, `config/collections.js`, `src/blog.njk`, `src/sitemap.njk`, `src/blog/blog.11tydata.js`, 2 seed articles |
| [C4](C4-media-hero.md) | Media and hero crops | 3 | C1 | `config/hero.js`, `scripts/lib/crop.mjs`, `src/media/**` |
| [C5](C5-static-pages.md) | Static pages | 4 | C3, C4 | `src/index.njk`, `src/about.njk`, `src/contact.njk`, `src/not-found.njk` |
| [C6](C6-og-images.md) | OG images | 4 | C3 | `config/og.js`, `scripts/lib/og-card.mjs` |
| [C7](C7-routing-seo.md) | Routing and SEO | 5 | C5, C9 | `src/_data/redirects.json`, `config/swa.js`, `src/sitemap.xml.njk`, `src/robots.txt.njk` |
| [C8](C8-infra-pipeline.md) | Infra and pipeline | 3 | C1 | `azure-pipelines.yml`, `infra/**` |
| [C9](C9-tests.md) | Baseline and test harness | 3 | C1 | `tests/lib/**`, `tests/urls.test.mjs`, `tests/links.test.mjs`, `tests/articles-parity.test.mjs`, `tests/expected-urls.json`, `tests/known-broken.json`, `tests/visual/**`, `docs/baseline/visual/**` |
| [C10](C10-content-conversion.md) | Content conversion | 5 | C3, C4, C9 + owner action | `scripts/convert-live.mjs`, `src/blog/*.md`, `docs/migration-report.md`, additions to `docs/baseline/live/` |
| [C11](C11-cutover.md) | Cut-over runbook | 6 | all | `docs/runbook-cutover.md` |

**Tests:** a chunk owns the test files its spec names (e.g. C2 owns `tests/css-parity.test.mjs`). C9 owns the shared harness and the site-wide suites.

**Ownership rule:** only edit files your spec owns, plus files your spec explicitly says to edit. If you need a change in a file you don't own, stop and report it rather than editing it. This is what lets chunks in the same wave run in parallel without merge conflicts.

`package.json` and `package-lock.json` belong to C1, which installs **every** dependency and defines **every** npm script up front. Later chunks must not add dependencies. If one is genuinely missing, report it.

**Dependency audit:** `npm audit` must report **0 vulnerabilities at every severity** at all times. C1 sets `overrides` in `package.json` to achieve this; don't remove them. Every chunk's verifier runs `npm audit` as part of its checks, and the pipeline fails on any finding.

---

## 2. Working rules for every chunk

- **Branch:** work on the branch you're given (normally a per-chunk branch off `claude/umbraco-static-migration-3nb0m7`). Commit when done. Don't push, merge or rebase unless told to.
- **Commits:** conventional style, e.g. `feat(c3): add base, page and article layouts`. One or a few commits per chunk.
- **Node:** 22 LTS (`.nvmrc`). Use `npm ci` once `package-lock.json` exists.
- **No network assumptions in the build.** `npm run build` and `npm test` must work offline after `npm ci`. Only C4, C9 (baseline capture) and C10 fetch from `https://ste-pam.com`.
- **Don't change the design.** No CSS edits apart from the import paths in C2. If markup and CSS disagree, change the markup to match the live HTML.
- **Live HTML is the source of truth** for markup and copy. Snapshots are in `docs/baseline/live/pages/` (index in `docs/baseline/live/manifest.json`). The old Razor views are on branch `archive/umbraco` under `Tranquility.CMS/Views/` if you need to see the logic.
- **No migration bookkeeping in code.** Comments, log lines and file contents outside `docs/` must not mention chunk IDs or the migration process (`// C1`, `// stub: replaced by C4`, `(C7)`, `added in wave 3`). Write comments that explain the code to someone who never saw these specs. When you replace another chunk's stub, remove its stub comment. A temporary stub may say what it is ("No-op until hero crops are implemented") but not which chunk replaces it.
- **Writing style for any user-facing text you add:** British English, no em dashes.
- **Finish by running** the commands in your spec's "Verify" section and pasting their output in your final report.

---

## 3. Shared contracts

These are referenced by several specs. Treat them as fixed.

### 3.1 Directory layout

```
eleventy.config.js        loads every module in config/ (C1)
config/*.js               one Eleventy plugin module per concern
src/                      Eleventy input dir
  _data/                  global data (site.json, redirects.json)
  _includes/layouts/      base.njk, page.njk, article.njk
  _includes/partials/     meta.njk, nav.njk, footer.njk, article-summary.njk, old-alert.njk
  blog/                   one {slug}.md per article + blog.11tydata.js
  styles/                 SCSS (entry: ste-pam.scss)
  assets/img/             -> /a/dist/img/
  assets/sprites/         -> /a/dist/sprites/
  media/                  -> /media/
  old/                    -> /old/
  static/                 -> / (favicons, manifest.json, browserconfig.xml)
scripts/                  build and migration scripts (Node ESM)
tests/                    node:test suites + visual runner
_site/                    build output (git-ignored)
.cache/                   hero crops and OG cards cache (git-ignored)
```

### 3.2 URLs

- Eleventy writes folder-style output: `/about/` becomes `_site/about/index.html`.
- **Public URLs never have a trailing slash** (except `/`). Every link, canonical and sitemap entry is written without it, matching the live site.
- Filter `cleanUrl` (C3) does this: `'/'` stays `'/'`, `'/about/'` becomes `'/about'`.
- Filter `absoluteUrl` (C3): `site.url + cleanUrl(url)`, e.g. `https://ste-pam.com/about`, `https://ste-pam.com/`.
- Static Web Apps is set to `trailingSlash: "never"` (C7).

### 3.3 `src/_data/site.json` (C1)

```json
{
  "name": "Stephen Pammenter",
  "url": "https://ste-pam.com",
  "author": "Ste Pammenter",
  "twitter": "@SvenPam",
  "locale": "en_GB",
  "themeColor": "#0c0c0e",
  "links": {
    "twitter": "//twitter.com/SvenPam",
    "linkedin": "//linkedin.com/in/spammenter",
    "linkedinProfile": "https://www.linkedin.com/in/spammenter/",
    "stackoverflow": "https://stackoverflow.com/users/2818648/ste-pammenter",
    "github": "//github.com/SvenPam",
    "source": "https://github.com/SvenPam/tranquility"
  }
}
```

### 3.4 Front matter

Validated by `scripts/validate-content.mjs` (C1) using the zod schema in `scripts/lib/schema.mjs`.

**Pages** (`src/*.njk`):

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `title` | string | yes | Page name. Used in `<title>`, hero, sitemap |
| `altTitle` | string | no | Overrides the hero `<h1>` only |
| `subtitle` | string | no | `h3.hero__subtitle` |
| `description` | string | no | Meta description (empty string allowed) |
| `heroImage` | string | no | Path under `/media/...`. No value means the CSS default hero |
| `heroFocus` | `{ x: number, y: number }` | no | Focal point, 0 to 1 from left/top. Default `{ x: 0.5, y: 0.5 }` |
| `theme` | `''` \| `'light'` \| `'dark'` | no | Hero modifier class; default `''` renders `hero hero--` exactly like live |
| `leadingSpacer` | boolean | no | Emit an empty `<div></div>` as the first child of `.sections` (see 3.5) |
| `ogImage` | string | no | Override for the generated card |
| `eleventyExcludeFromCollections` | boolean | no | Standard Eleventy |

**Articles** (`src/blog/{slug}.md`): all page fields plus:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `date` | date `YYYY-MM-DDTHH:mm:ss` (UTC) | yes | Publish date and sort key |
| `updated` | date | no | Drives the Old Article banner; defaults to `date` |
| `topic` | `None` \| `Project` \| `Personal` \| `Interesting` \| `TIL` \| `Guide` \| `Site` \| `Cooking` | yes | Shown under the title |
| `tags` | string[] | no | Shown as `#tag`. Default `[]` |

The slug is the filename and equals the live URL segment. Articles get `layout`, `permalink` and `leadingSpacer: true` from `src/blog/blog.11tydata.js` (C3).

### 3.5 Section striping (important)

The CSS alternates section backgrounds with `.section:nth-child(odd|even)` inside `div.sections`. Live pages that start with an empty `<div></div>` inside `.sections` shift the stripe so the first section is dark. That empty div is load-bearing:

| Page | Empty `<div></div>` first? |
| --- | --- |
| Articles, About, Sitemap | **yes** (`leadingSpacer: true`) |
| Home, Blog, Contact, Not Found | no |

### 3.6 Filters, shortcodes, collections

| Name | Kind | Owner | Contract |
| --- | --- | --- | --- |
| `cleanUrl` | filter | C3 | see 3.2 |
| `absoluteUrl` | filter | C3 | see 3.2 |
| `dateShort` | filter | C3 | `24-Jul-19` (UTC, `dd-MMM-yy`, English month) |
| `dateLong` | filter | C3 | `24-Jul-2019` |
| `dateIso` | filter | C3 | `2019-07-24T15:22:06Z` |
| `isOld` | filter | C3 | `true` if `(updated or date)` is more than 365 days before build time |
| `year` | global data `build.year` | C3 | Build year (number) |
| `ogImagePath` | filter | C3 | `'/'` gives `/og/index.png`; `'/blog/x/'` gives `/og/blog/x.png` |
| `articles` | collection | C3 | `src/blog/*.md`, newest first |
| `articlesAsc` | collection | C3 | Same, oldest first (used for Older/Newer and the HTML sitemap) |
| `heroStyle` | async shortcode | C4 | `{% heroStyle heroImage, heroFocus %}` returns the `<style>` block, or `''` |
| OG PNGs | `eleventy.after` | C6 | Writes `_site` + `ogImagePath(url)` for every HTML page |
| `staticwebapp.config.json` | `eleventy.after` | C7 | Written to `_site/` |

### 3.7 npm scripts (defined by C1)

| Script | Does |
| --- | --- |
| `npm run build` | `validate` then `eleventy` (CSS, crops, OG and SWA config run inside Eleventy hooks) |
| `npm run serve` | `scripts/dev.mjs`: build, watch `src/` and `config/`, serve `_site` on port 8080 |
| `npm run audit` | `npm audit`; must report 0 vulnerabilities |
| `npm run validate` | Front matter schema check |
| `npm test` | All `tests/**/*.test.mjs` against `_site` (run `build` first) |
| `npm run test:core` | Same, skipping tests whose name contains `[content]` |
| `npm run test:visual` | Playwright screenshot diff (local only, not in the pipeline) |
| `npm run test:remote` | URL tests over HTTP against `$BASE_URL` |
| `npm run convert` | C10 converter |

Tests tagged `[content]` need the full article set and are expected to fail until C10.

---

## 4. Subagents

Two agents are defined in `.claude/agents/`:

- **`spec-implementer`** implements one spec end to end, runs its Verify section and commits.
- **`spec-verifier`** independently checks one implemented spec against its acceptance criteria, with no implementation context, and returns pass/fail per criterion with evidence. It doesn't fix anything.

Phase 4 runs each wave in parallel: one implementer per chunk (each in its own worktree, branched from the migration branch after the previous wave merged), then one verifier per chunk, then merge.

### Waves and integration checks

| Wave | Chunks | After merging, on the migration branch |
| --- | --- | --- |
| 1 | C0 | `git status` clean; `src/` holds relocated assets |
| 2 | C1 | `npm ci && npm run build && npm test` green |
| 3 | C2, C3, C4, C8, C9 | `npm run build` green. `npm test` runs; expected failures only: missing Home/About/Contact/Not Found pages (C5), missing `/sitemap.xml` and `/robots.txt` (C7), `[content]` tests (C10). Routing checks skip (C7) |
| 4 | C5, C6 | `npm run build && npm run test:core` green apart from routing skips and the missing `/sitemap.xml`, `/robots.txt` (C7) |
| 5 | C7, C10 | `npm run build && npm test` fully green; `npm run test:visual` within tolerance |
| 6 | C11 | Runbook dry run attached |

A chunk's verifier runs the chunk's own Verify section in the chunk's worktree. Suites owned by other chunks that aren't merged yet aren't the chunk's concern; the integration check after the merge catches cross-chunk problems.
