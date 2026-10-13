# C6: OG images

Wave 4 · Depends on: C3 · Size: M

## Goal

Generate a 1200x630 Open Graph card PNG for every HTML page at build time, with no external service, at the path the page's `og:image` meta tag already points to. This replaces the hcti.io service that the old Umbraco save hook called.

## Read first

- `docs/specs/README.md` (3.6: `ogImagePath`, OG PNGs)
- `src/_includes/partials/meta.njk` (C3): `og:image` is `absoluteUrl(ogImage or ogImagePath(page.url))`
- The old generator, for the design: `git show origin/archive/umbraco:Tranquility.CMS/Service/CoverImageService.cs`

## Owns

`config/og.js`, `scripts/lib/og-card.mjs`, `scripts/og-preview.mjs`, `tests/og.test.mjs`.

## Approach

Run in `eleventy.after`. For each HTML result, read the card data **from the rendered HTML** (with `cheerio`). That way the card always matches the page's own meta tags, works for every page type (including Not Found, which is excluded from collections), and needs no coupling to collections.

| Card field | Source in the rendered page |
| --- | --- |
| Output path | `meta[property="og:image"]` content, with `site.url` stripped. **Skip** the page if it doesn't start with `/og/` (an explicit `ogImage` override) |
| Title | Articles: `article.section header .lead a` text. Others: `og:title` with the ` | Stephen Pammenter` suffix removed |
| Description | `meta[property="og:description"]` (may be empty) |
| Tags | `article.section header .section__meta .tag` texts |
| Date | `article.section header time[datetime]`, formatted `dd-MMM-yyyy` (UTC). Absent on non-articles |

## Card design

Recreates `CoverImageService.cs` (HTML/CSS that was sent to hcti.io):

```
1200 x 630, background: /a/dist/img/generic/2-100.jpg stretched to fill (it's a 100x56 image, so it renders deliberately blurred)
  centred box: width 70%, padding 30px, background #343a40, box-shadow 4px 4px 0 0 #292d32, white text, centred
    h1 (bold, ~44px): title
    p  (#868E96, ~26px): description            (omit if empty)
    row, space-between, ~22px:
      left:  "Ste Pammenter // @SvenPam" (@SvenPam in #29b8b9), then " // " and tags as pills if any
             pill: background #FF5E5B, colour #DEE2E6, radius 10px, padding 2px 4px, 80% size, text "#tag"
      right: date "24-Jul-2019"                   (omit if no date)
font: JetBrains Mono 400/700 (bundled via @fontsource; the original used the system monospace stack)
```

Font sizes are a judgement call; aim for a title that fits on two lines at 840px wide. Long titles should wrap, not overflow; clamp descriptions to 3 lines.

## Steps

### 1. `scripts/lib/og-card.mjs`

```js
import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";

const font = (w) => readFile(`node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${w}-normal.woff`);
let assets;
async function load() {
  assets ??= {
    fonts: [
      { name: "JetBrains Mono", data: await font(400), weight: 400, style: "normal" },
      { name: "JetBrains Mono", data: await font(700), weight: 700, style: "normal" },
    ],
    bg: `data:image/jpeg;base64,${(await readFile("src/assets/img/generic/2-100.jpg")).toString("base64")}`,
  };
  return assets;
}

const esc = (s = "") => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export const CARD_VERSION = 1;   // bump when the design changes, to invalidate the cache

export async function renderCard({ title, description = "", tags = [], date = "" }) {
  const { fonts, bg } = await load();
  const pills = tags.map((t) =>
    `<span style="display:flex;background:#FF5E5B;color:#DEE2E6;border-radius:10px;padding:2px 8px;font-size:18px;margin-left:8px">#${esc(t)}</span>`).join("");
  const markup = html(`
    <div style="display:flex;width:1200px;height:630px;align-items:center;justify-content:center;
                background-image:url(${bg});background-size:1200px 630px;font-family:'JetBrains Mono';color:#fff">
      <div style="display:flex;flex-direction:column;width:840px;padding:30px;background:#343a40;
                  box-shadow:4px 4px 0 0 #292d32;text-align:center;align-items:center">
        <div style="display:flex;font-size:44px;font-weight:700;line-height:1.2">${esc(title)}</div>
        ${description ? `<div style="display:flex;margin-top:20px;font-size:26px;color:#868E96;line-height:1.35;max-height:106px;overflow:hidden">${esc(description)}</div>` : ""}
        <div style="display:flex;width:100%;justify-content:space-between;align-items:center;margin-top:30px;font-size:22px">
          <div style="display:flex;align-items:center">Ste Pammenter&nbsp;<span style="color:#868E96">//</span>&nbsp;<span style="color:#29b8b9">@SvenPam</span>${tags.length ? `&nbsp;<span style="color:#868E96">//</span>${pills}` : ""}</div>
          <div style="display:flex">${esc(date)}</div>
        </div>
      </div>
    </div>`);
  const svg = await satori(markup, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
```

Adjust the markup if Satori rejects it (every element with more than one child needs `display:flex`), but keep the design.

### 2. `config/og.js`

```js
import * as cheerio from "cheerio";
import { mkdir, writeFile, copyFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { readFileSync } from "node:fs";
import { renderCard, CARD_VERSION } from "../scripts/lib/og-card.mjs";
import { dateLong } from "./filters.js";

const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const CACHE = ".cache/og";
const exists = (p) => access(p).then(() => true, () => false);

export function cardFromHtml(htmlText) {
  const $ = cheerio.load(htmlText);
  const og = $('meta[property="og:image"]').attr("content") ?? "";
  const ogPath = og.startsWith(site.url) ? og.slice(site.url.length) : og;
  if (!ogPath.startsWith("/og/")) return null;
  const header = $("article.section header");
  const time = header.find("time[datetime]").attr("datetime");
  return {
    ogPath,
    title: header.find(".lead a").text().trim()
      || ($('meta[property="og:title"]').attr("content") ?? "").replace(` | ${site.name}`, ""),
    description: $('meta[property="og:description"]').attr("content") ?? "",
    tags: header.find(".section__meta .tag").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    date: time ? dateLong(new Date(time)) : "",
  };
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", async ({ results, directories }) => {
    const outDir = directories?.output ?? "_site";
    await mkdir(CACHE, { recursive: true });
    for (const r of results) {
      if (!r.outputPath?.endsWith(".html")) continue;
      const card = cardFromHtml(r.content);
      if (!card) continue;
      const { ogPath, ...data } = card;
      const key = createHash("sha1").update(JSON.stringify({ v: CARD_VERSION, ...data })).digest("hex");
      const cached = path.join(CACHE, `${key}.png`);
      if (!(await exists(cached))) await writeFile(cached, await renderCard(data));
      const out = path.join(outDir, ogPath);
      await mkdir(path.dirname(out), { recursive: true });
      await copyFile(cached, out);
    }
  });
}
```

`config/og.js` imports `dateLong` from C3's `config/filters.js` (a named export). The loader runs `og.js` after `filters.js` alphabetically, but the import doesn't depend on order.

### 3. Preview script: `scripts/og-preview.mjs`

`node scripts/og-preview.mjs` renders three sample cards to `test-results/og/` for eyeballing: a short-title article with tags (`Life's better with BEM`, tags `front-end`, `methodology`), a long-title article with no tags (`Final Year Project - Miru awarded preliminary First Class Honours`), and a page with no date or description (`Contact`).

### 4. Tests: `tests/og.test.mjs`

- Unit: `cardFromHtml` on `docs/baseline/live/pages/blog/lifes-better-with-bem.html` after replacing its `og:image` content with `https://ste-pam.com/og/blog/lifes-better-with-bem.png` returns the title `Life's better with BEM`, the expected tags, and date `20-Nov-2018`.
- Unit: `cardFromHtml` returns `null` when `og:image` doesn't start with `/og/`.
- Unit: `renderCard` returns a PNG whose `sharp().metadata()` is 1200x630.
- Integration (after `npm run build`): for every `_site/**/*.html`, read `og:image`; if it's under `https://ste-pam.com/og/`, the file exists in `_site` and is a 1200x630 PNG. At least the home page, a seed article and `not-found` are covered.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `npm run build` writes a PNG for every HTML page whose `og:image` is under `/og/`, including `_site/og/index.png`, `_site/og/not-found.png` and `_site/og/blog/sass-loops.png`. |
| AC2 | `tests/og.test.mjs` passes. |
| AC3 | The three preview cards in `test-results/og/` match the design above: title, description, author line, tag pills, date; nothing clipped or overflowing. Attach them to the report. |
| AC4 | A second build renders no new cards (all cache hits); changing an article's title renders exactly one. |
| AC5 | The build makes no network requests (unplug or set `HTTPS_PROXY=http://127.0.0.1:9` and the build still succeeds). |
| AC6 | Build time added by OG generation for ~60 pages on a cold cache is under 60 seconds. Record the measurement. |

## Verify

```bash
rm -rf .cache/og && time npm run build
node --test tests/og.test.mjs
node scripts/og-preview.mjs && ls test-results/og
find _site/og -name '*.png' | wc -l
```
