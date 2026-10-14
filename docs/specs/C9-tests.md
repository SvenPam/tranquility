# C9: Baseline and test harness

Wave 3 · Depends on: C1 · Size: M

## Goal

Build the site-wide safety net: URL parity, internal link and asset checking, article content parity, and a local visual diff against the live site. Capture the visual baseline while the live site is still up.

## Read first

- `docs/specs/README.md` (3.2 URLs, 3.7 scripts, tagging of `[content]` tests)
- `docs/baseline/live/manifest.json` and a couple of files in `docs/baseline/live/pages/`
- `docs/phase-2-plan.md` sections 9 (routing) and 11 (verification)

## Owns

`tests/lib/**`, `tests/urls.test.mjs`, `tests/links.test.mjs`, `tests/articles-parity.test.mjs`, `tests/expected-urls.json`, `tests/known-broken.json`, `tests/visual/**`, `docs/baseline/visual/**`.

## Design rules

- Tests read the built `_site/` and the committed baselines. They never fetch from the live site, except `tests/visual/capture-baseline.mjs` (a one-off) and `TEST_MODE=http`.
- Use `node:test` and `node:assert/strict`, plus `cheerio` for HTML. No other test framework.
- Name tests that need the full article set (all 58) with the prefix `[content]`, so `npm run test:core` can skip them before C10.
- **Chunks land in waves.** Tests must degrade gracefully when a later chunk hasn't landed yet:
  - if `_site/staticwebapp.config.json` is missing (C7 not merged), redirect and 404-routing checks call `t.skip("routing config not built yet")`;
  - everything else fails normally.

## Steps

### 1. Shared helpers: `tests/lib/`

- `site.mjs`: `SITE = "_site"`; `resolveFile(urlPath)` returns the file in `_site` that SWA would serve for a clean URL (`/` gives `index.html`; `/about` gives `about/index.html`; `/a/dist/x.css` gives that file; decode `%20`), or `null`.
- `swa.mjs`: loads `_site/staticwebapp.config.json` if present; `matchRoute(path)` returns the first route whose `route` equals the path (case-insensitive) or whose `route` ends in `/*` and prefixes it. Mirrors SWA's first-match order.
- `html.mjs`: `load(file)` (cheerio), `text($, sel)` (text with whitespace collapsed, NBSP to space, trimmed), `internalRefs($)` (every `href`, `src`, `data-src`, `srcset`/`data-srcset` URL, `xlink:href`, and `url(...)` inside `<style>`, normalised: `https://ste-pam.com` and `//ste-pam.com` prefixes stripped, query and hash dropped, only paths starting with a single `/`).
- `baseline.mjs`: loads `docs/baseline/live/manifest.json`; `articles()` returns entries under `/blog/` that have a `file`.

### 2. `tests/expected-urls.json`

```json
{
  "ok": ["/", "/about", "/blog", "/contact", "/sitemap", "/not-found", "/sitemap.xml", "/robots.txt",
         "/a/dist/css/ste-pam.min.css", "/a/dist/sprites/sprite.svg", "/a/dist/img/generic/2.jpg",
         "/media/1058/mountains.jpg", "/old/thai.jpg", "/old/Stephen%20Pammenter%20-%20CV.pdf",
         "/favicon.ico", "/manifest.json", "/browserconfig.xml"],
  "redirects": [
    { "from": "/about/", "to": "/about", "status": 301, "kind": "trailingSlash" },
    { "from": "/blog/article/sass-loops", "to": "/blog/sass-loops", "status": 301 },
    { "from": "/Areas/ste_pam/Uploads/thai.jpg", "to": "/old/thai.jpg", "status": 301 },
    { "from": "/res/Class1.jpg", "to": "/old/Class1.jpg", "status": 301 },
    { "from": "/res/MiruScreen1.jpg", "to": "/old/MiruSccreen1.jpg", "status": 301 },
    { "from": "/cv", "to": "https://www.linkedin.com/in/spammenter/", "status": 302 },
    { "from": "/work", "to": "/about", "status": 302 }
  ],
  "notFound": ["/this-does-not-exist", "/blog/no-such-post"]
}
```

### 3. `tests/urls.test.mjs`

Two modes, selected by `TEST_MODE` (`static` default, or `http` with `BASE_URL`).

| Check | static mode | http mode |
| --- | --- | --- |
| each `ok` URL | `resolveFile` finds a file | `GET` returns 200 |
| `[content]` every `/blog/{slug}` URL in the manifest (58, including the 13 that 404 on live today) | file exists | 200 |
| each redirect | `matchRoute(from)` has `redirect === to` and `statusCode === status`; for `kind: trailingSlash` assert `trailingSlash === "never"` and `resolveFile(to)` exists. Skip if no config | `fetch(..., { redirect: "manual" })` status and `location` (same-origin locations compared as paths) |
| each `notFound` | `resolveFile` is null, and the 404 override rewrites to an existing file containing `U2 is still looking`. Skip override part if no config | status 404 and body contains `U2 is still looking` |

### 4. `tests/links.test.mjs`

For every `_site/**/*.html`, check every `internalRefs` path:

1. `resolveFile(path)` exists, **or**
2. `matchRoute(path)` is a redirect (config present), **or** the config is absent and the path is `/cv` or `/work`, **or**
3. the path is in `tests/known-broken.json`.

Ignore sprite fragments (resolve the file without `#...`). Report every failure as `page -> path`. Also fail if any page links to an internal path with a trailing slash (other than `/`).

`tests/known-broken.json` lists references that already 404 on the live site and have no replacement file:

```json
["/umbraco/nothing.jpg", "/Content/img/walking2.jpg", "/res/tsk-mgr.jpg", "/res/rotterdam.jpg",
 "/res/meinPPE.jpg", "/res/hull.jpg", "/res/holland.jpg", "/res/control-pnl.jpg"]
```

### 5. `tests/articles-parity.test.mjs` (all tests prefixed `[content]`)

For every article in the manifest that has a baseline file, compare the built page with the snapshot:

| Aspect | Rule |
| --- | --- |
| Header | Same title (`header .lead a`), topic (`header p.text-center`), description (`header p.text-muted`), date text (`time`), tag texts |
| Body text | `text(.article .row > .col-12)` equal after normalisation (collapse whitespace; NBSP to space; ignore the Old Article alert, which sits outside `.col-12`) |
| Images | Ordered list of image paths in the body equal, after mapping baseline paths with the D11 rules: `/Areas/ste_pam/Uploads/x` to `/old/x`; `/res/x` to `/old/x` when `src/old` has a case-insensitive match (plus `MiruScreen1.jpg` to `MiruSccreen1.jpg`); query strings dropped |
| Links | Ordered list of `a[href]` in the body equal, after the same mapping and with `https://ste-pam.com` stripped |
| Embeds | Same number of `iframe`, `script[src]`, `.codepen`, `.instagram-media` elements in the body |
| Theme | `section.hero` class identical |

Plus:
- `[content] blog list`: `_site/blog/index.html` lists one `article.media` per manifest blog URL (58), newest first by `time[datetime]`.
- `[content] html sitemap`: `_site/sitemap/index.html` lists 58 article links.

Print a compact per-article diff on failure (first differing 200 characters of text, or the differing list items).

### 6. Visual diff: `tests/visual/`

**Pages and viewports** (`tests/visual/config.json`):

```json
{
  "viewports": { "desktop": { "width": 1366, "height": 900 }, "mobile": { "width": 390, "height": 844 } },
  "pages": {
    "home": "/", "about": "/about", "blog": "/blog", "contact": "/contact", "sitemap": "/sitemap",
    "article": "/blog/authentication-through-azure", "article-embeds": "/blog/sass-loops",
    "404": "/this-does-not-exist"
  },
  "maxMismatch": 0.02,
  "perPage": {}
}
```

**Normalising CSS**, injected into every page before the screenshot (both capture and run), so things that legitimately differ or depend on the network don't count:

```css
*, *::before, *::after { animation: none !important; transition: none !important; }
iframe, img[src^="http"], img[src^="//"], #comments, #disqus_thread { visibility: hidden !important; }
#siteNav li:has(a[href="/work"]) { display: none !important; }
```

Screenshots are viewport-only (not full page), taken after `load` plus 500 ms.

**`tests/visual/capture-baseline.mjs`** (one-off, run now while live is up): screenshots `https://ste-pam.com` for every page and viewport into `docs/baseline/visual/{page}-{viewport}.png`. Commit them. (The PNGs already in `docs/baseline/` from Phase 1 were taken without the normalising CSS; leave them as reference.)

**`tests/visual/run.mjs`** (`npm run test:visual`, after `npm run build`):
1. Starts a small Node `http` server on a free port serving `_site` with `resolveFile`, returning `not-found/index.html` with status 404 for misses.
2. Screenshots the same pages and viewports with the same CSS.
3. Compares with `pixelmatch` (threshold 0.1), writes `test-results/visual/{name}-{diff,actual}.png`, prints a table of mismatch ratios, and exits 1 if any page exceeds `maxMismatch` (or its `perPage` override).

Browser: Playwright Chromium. Use `executablePath` from `PLAYWRIGHT_CHROMIUM_PATH` if set (the cloud environment has Chromium at `/opt/pw-browsers`); otherwise Playwright's default.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `docs/baseline/visual/` holds 16 PNGs (8 pages x 2 viewports) captured from live with the normalising CSS. Spot-check that the Work nav icon is hidden in them. |
| AC2 | On the current branch (only C1 merged), `npm run build && npm test` runs every suite without crashing. Tests fail only for reasons that later chunks fix (missing pages, missing articles); routing checks are skipped with the C7 message. List the failures in the report. |
| AC3 | `TEST_MODE=http BASE_URL=https://ste-pam.com node --test tests/urls.test.mjs` runs against **live** and shows the expected differences only (live has no `/sitemap.xml`, `/cv` goes to SO, `/work` is 200, 13 blog URLs 404, `/about/` is 200). Record the output; this proves the http mode works. |
| AC4 | `tests/lib/site.mjs` `resolveFile` has unit tests for `/`, `/about`, `/about/`, `/a/dist/css/ste-pam.min.css`, `/old/Stephen%20Pammenter%20-%20CV.pdf` and a missing path (in `tests/lib/site.test.mjs`). |
| AC5 | `npm run test:visual` runs end to end against the current build and writes diff images (high mismatch is expected until C2 to C5 land). |
| AC6 | No test writes outside `test-results/` and the OS temp dir. |

## Verify

```bash
npm run build; npm test; echo "exit $?"
TEST_MODE=http BASE_URL=https://ste-pam.com node --test tests/urls.test.mjs
node tests/visual/capture-baseline.mjs && ls docs/baseline/visual | wc -l
npm run test:visual; ls test-results/visual | head
```
