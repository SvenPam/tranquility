# C1: Eleventy scaffold

Wave 2 · Depends on: C0 · Size: S

## Goal

Create a working Eleventy 3 project: pinned dependencies (all of them, for every later chunk), npm scripts, a config file that auto-loads per-concern modules from `config/`, global site data, a front matter validator, and a placeholder page so `npm run build` produces output.

## Read first

- `docs/specs/README.md` (all of it; sections 3.3, 3.4 and 3.7 define what you build)

## Owns

`package.json`, `package-lock.json`, `.nvmrc`, `eleventy.config.js`, `config/README.md`, `src/_data/site.json`, `scripts/validate-content.mjs`, `scripts/lib/schema.mjs`, `src/index.njk` (placeholder, replaced by C5), `src/_includes/layouts/base.njk` (stub, replaced by C3), `config/hero.js` (stub, replaced by C4), `tests/smoke.test.mjs`.

## Steps

### 1. `.nvmrc`

```
22
```

### 2. `package.json`

Install with exact versions (`npm i -D -E ...`). These are every dependency the migration needs; later chunks may not add any.

```json
{
  "name": "tranquility",
  "version": "2.0.0",
  "private": true,
  "description": "Source for ste-pam.com",
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": {
    "build": "npm run validate && eleventy",
    "serve": "eleventy --serve",
    "validate": "node scripts/validate-content.mjs",
    "test": "node --test \"tests/**/*.test.mjs\"",
    "test:core": "node --test --test-skip-pattern=\"\\[content\\]\" \"tests/**/*.test.mjs\"",
    "test:visual": "node tests/visual/run.mjs",
    "test:remote": "TEST_MODE=http node --test \"tests/urls.test.mjs\"",
    "convert": "node scripts/convert-live.mjs"
  },
  "devDependencies": {
    "@11ty/eleventy": "3.1.6",
    "@fontsource/jetbrains-mono": "5.3.0",
    "@resvg/resvg-js": "2.6.2",
    "autoprefixer": "10.6.1",
    "bootstrap": "4.0.0-beta.2",
    "cheerio": "1.2.0",
    "clean-css": "5.3.3",
    "gray-matter": "4.0.3",
    "pixelmatch": "8.0.0",
    "playwright": "1.56.1",
    "pngjs": "7.0.0",
    "postcss": "8.5.30",
    "sass": "1.77.8",
    "satori": "0.56.1",
    "satori-html": "0.3.2",
    "sharp": "0.35.5",
    "turndown": "7.2.4",
    "turndown-plugin-gfm": "1.0.2",
    "zod": "4.6.7"
  }
}
```

Notes:
- `bootstrap@4.0.0-beta.2` and `sass@1.77.8` are deliberate: together they rebuild to the live CSS (verified in Phase 3). Never upgrade them.
- `playwright@1.56.1` matches the Chromium preinstalled in the cloud dev environment (`/opt/pw-browsers`). Set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` when installing there.
- If a pinned version fails to install, use the nearest patch release and record it in your report. Don't change major or minor versions.

### 3. `eleventy.config.js`

Auto-loads every `config/*.js` module in alphabetical order. Each module exports `default function (eleventyConfig) {}` and may be async.

```js
import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

export default async function (eleventyConfig) {
  const dir = path.resolve("config");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".js")).sort();
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    await mod.default(eleventyConfig);
  }
  eleventyConfig.setQuietMode(true);
}

export const config = {
  dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  templateFormats: ["njk", "md", "11ty.js"],
  markdownTemplateEngine: false,   // article bodies may contain {{ }} in code samples
  htmlTemplateEngine: "njk",
};
```

`config/` must exist with a `README.md` (one line per module and its owner chunk, copied from `docs/specs/README.md` section 1) so the loader finds the folder before other modules exist.

Exclude non-template folders from processing: add to `eleventy.config.js` before the loop:

```js
eleventyConfig.ignores.add("src/styles/**");
eleventyConfig.ignores.add("src/assets/**");
eleventyConfig.ignores.add("src/media/**");
eleventyConfig.ignores.add("src/old/**");
eleventyConfig.ignores.add("src/static/**");
```

(C2 and C4 add passthrough copy for these folders.)

### 4. `src/_data/site.json`

Exactly the JSON in `docs/specs/README.md` section 3.3.

### 5. Front matter schema and validator

`scripts/lib/schema.mjs`:

```js
import { z } from "zod";

const focus = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) });

export const page = z.object({
  title: z.string().min(1),
  altTitle: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  heroImage: z.string().regex(/^\/media\/\d+\/[^?#]+$/).optional(),
  heroFocus: focus.optional(),
  theme: z.enum(["", "light", "dark"]).optional(),
  leadingSpacer: z.boolean().optional(),
  ogImage: z.string().optional(),
  layout: z.string().optional(),
  permalink: z.union([z.string(), z.literal(false)]).optional(),
  eleventyExcludeFromCollections: z.boolean().optional(),
}).strict();

export const TOPICS = ["None", "Project", "Personal", "Interesting", "TIL", "Guide", "Site", "Cooking"];

export const article = page.extend({
  date: z.date(),
  updated: z.date().optional(),
  topic: z.enum(TOPICS),
  tags: z.array(z.string().min(1)).default([]),
}).strict();
```

`scripts/validate-content.mjs`:
- Reads every `src/blog/*.md` with `gray-matter` and validates `data` against `article`.
- Reads every `src/*.njk` and `src/*.md` that has front matter with a `title`, and validates against `page`. Skip files without front matter and files whose names end in `.xml.njk` or `.txt.njk`.
- Collects every error as `path: field: message`, prints them all, exits 1 if any, otherwise prints `validated N articles, M pages` and exits 0.
- Also fails if two articles share a slug ignoring case.
- If `src/blog/` doesn't exist yet, treat it as zero articles.

### 6. Placeholder layout and page

`src/_includes/layouts/base.njk` (stub, replaced by C3):

```njk
<!DOCTYPE html>
<html lang="en-gb">
<head><meta charset="utf-8"><title>{{ title }} | {{ site.name }}</title></head>
<body><main>{{ content | safe }}</main></body>
</html>
```

`src/index.njk` (placeholder, replaced by C5):

```njk
---
title: Stephen Pammenter
layout: layouts/base.njk
---
<p>Scaffold</p>
```

### 7. `config/hero.js` stub

C3's layouts call the `heroStyle` shortcode, and Nunjucks fails to compile a template that uses an unregistered tag. C3 and C4 run in parallel, so the shortcode is registered here as a no-op and C4 replaces this file with the real implementation:

```js
// Stub: replaced by C4 (hero crops). Returns no <style> block.
export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("heroStyle", async () => "");
}
```

### 8. Smoke test

`tests/smoke.test.mjs`, using `node:test` and `node:assert/strict`: asserts `_site/index.html` exists and contains `<html lang="en-gb">`. (C9 adds the real suites alongside it.)

### 9. Install, build, commit

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
npm run build && npm test
```

Commit `package-lock.json` too. Message: `feat(c1): scaffold Eleventy project`.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `package.json` matches step 2: same scripts, same devDependencies with exact (unprefixed) versions, `"type": "module"`. No `dependencies` block. |
| AC2 | `package-lock.json` is committed and `npm ci` succeeds from a clean checkout. |
| AC3 | `npm run build` exits 0 and writes `_site/index.html`. |
| AC4 | `npm test` exits 0 (smoke test passes). |
| AC5 | Adding a throwaway `config/zz-probe.js` that calls `eleventyConfig.addGlobalData("probe", "ok")` makes `{{ probe }}` render in a page, proving the loader works. Remove the probe before committing. |
| AC6 | `npm run validate` exits 1 and names the file and field when given a `src/blog/x.md` with `topic: Blogging`, and when given one with a missing `date`. Exits 0 when given a valid article. Remove the test files before committing. |
| AC7 | `src/_data/site.json` matches README section 3.3 exactly. |
| AC8 | Nothing under `src/styles`, `src/assets`, `src/old`, `src/static` is copied to `_site` by this chunk. |

## Verify

```bash
rm -rf node_modules _site && npm ci && npm run build && npm test
ls _site
node -e "const p=require('./package.json');console.log(Object.values(p.devDependencies).every(v=>/^\d/.test(v)))"
```
