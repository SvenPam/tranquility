# C4: Media and hero crops

Wave 3 · Depends on: C1 · Size: M

> **Revised during implementation (2026-10-14):** the live site's ImageProcessor no longer crops. Every hero request, whatever the query string, returns the original image, so visitors see the uncropped photo scaled by the CSS. To keep the design identical, `heroStyle` now emits a single `.hero { background-image: url('<original /media path>'); }` rule and no crops are generated. The crop maths below is kept for the record only. `heroFocus` stays valid in front matter but is ignored.

## Goal

1. Bring the 13 Umbraco media files into the repo at their current URLs (`/media/{id}/{file}`).
2. Replace ImageProcessor's on-the-fly hero crops with build-time crops, emitted as the same per-page `<style>` block the live site uses.

## Read first

- `docs/specs/README.md` (3.4 front matter `heroImage`/`heroFocus`, 3.6 `heroStyle`)
- `docs/baseline/live/pages/index.html` and `about.html`: look at the `<style>` block in `<head>`

## Owns

`config/hero.js` (replaces C1's stub), `scripts/lib/crop.mjs`, `scripts/fetch-media.mjs`, `src/media/**`, `tests/hero.test.mjs`.

## Background

Live hero markup (home page), generated per page by `_Page.cshtml`:

```html
<style>
    .hero {
 background-image: url('/media/1058/mountains.jpg?anchor=center&amp;mode=crop&amp;width=320&amp;height=411');
    }
    @media (min-width: 540px)  { .hero { background-image: url('...&width=540&height=385'); } }
    @media (min-width: 720px)  { .hero { background-image: url('...&width=720&height=370'); } }
    @media (min-width: 960px)  { .hero { background-image: url('...&width=960&height=389'); } }
    @media (min-width: 1140px) { .hero { background-image: url('...&width=1920&height=489'); } }
</style>
```

ImageProcessor `mode=crop` scales the image to cover the target box, then crops around a centre point (`anchor=center` means 0.5, 0.5; `center=Y,X` gives a focal point as fractions from top and left), clamped to the image edges. We reproduce that with `sharp`.

Pages that set a hero image today:

| Page | `heroImage` | `heroFocus` |
| --- | --- | --- |
| Home | `/media/1058/mountains.jpg` | default (0.5, 0.5) |
| About | `/media/1052/5.jpg` | `{ x: 0.535, y: 0.63313609467455623 }` |
| Blog | `/media/1054/2.jpg` | `{ x: 0.49166666666666664, y: 0.34615384615384615 }` |
| Contact | `/media/1055/4.jpg` | default |
| Sitemap | `/media/1056/6.jpg` | default |

Articles and Not Found have no hero image and fall back to the CSS default (`/a/dist/img/generic/2.jpg`).

## Steps

### 1. Fetch media: `scripts/fetch-media.mjs`

One-off script (kept for reproducibility). Downloads these files from `https://ste-pam.com` into `src/media/` with the same relative path, skipping files that already exist, and fails loudly on any non-200:

```
/media/1052/5.jpg
/media/1054/2.jpg
/media/1055/4.jpg
/media/1056/6.jpg
/media/1058/mountains.jpg
/media/1059/chrome-network-requests.jpg
/media/1060/icon-files.jpg
/media/1061/atomic-design-process.png
/media/1064/itcss-triangle.png
/media/1065/azure-authenticate-button.jpg
/media/1066/azure-expose-api.jpg
/media/1067/azure-functon-ad-settings.jpg
/media/1068/example-scope-silent-token-code.jpg
```

Request the bare path (no query string) so you get the original file. Run it once and commit the downloaded files. Print each file's size and the image dimensions (via `sharp().metadata()`).

C10 may add more media files to `src/media/` if converted articles reference them.

### 2. Crop maths: `scripts/lib/crop.mjs`

```js
import sharp from "sharp";

// Returns the source rectangle for a cover-crop of (w x h) centred on focus,
// clamped to the image bounds. Matches ImageProcessor mode=crop.
export function cropBox(srcW, srcH, w, h, focus = { x: 0.5, y: 0.5 }) {
  const scale = Math.max(w / srcW, h / srcH);
  const cropW = Math.min(srcW, Math.round(w / scale));
  const cropH = Math.min(srcH, Math.round(h / scale));
  const left = Math.round(Math.min(Math.max(focus.x * srcW - cropW / 2, 0), srcW - cropW));
  const top = Math.round(Math.min(Math.max(focus.y * srcH - cropH / 2, 0), srcH - cropH));
  return { left, top, width: cropW, height: cropH };
}

export async function cropTo(srcPath, outPath, w, h, focus) {
  const img = sharp(srcPath);
  const { width, height } = await img.metadata();
  await img.extract(cropBox(width, height, w, h, focus))
    .resize(w, h)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath);
}
```

If the source is smaller than the target, `resize` upscales (same as ImageProcessor).

### 3. Shortcode: `config/hero.js`

Replaces the stub from C1.

```js
import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { cropTo } from "../scripts/lib/crop.mjs";

// Breakpoints and crop sizes from the Umbraco "Image Cropper" data type.
const CROPS = [
  { minWidth: 0,    w: 320,  h: 411 },  // Hero - XS
  { minWidth: 540,  w: 540,  h: 385 },  // Hero - S
  { minWidth: 720,  w: 720,  h: 370 },  // Hero - M
  { minWidth: 960,  w: 960,  h: 389 },  // Hero - L
  { minWidth: 1140, w: 1920, h: 489 },  // Hero - XL
];
const CACHE = ".cache/hero";

const exists = (p) => access(p).then(() => true, () => false);

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });

  eleventyConfig.addNunjucksAsyncShortcode("heroStyle", async function (src, focus) {
    if (!src) return "";
    const f = { x: focus?.x ?? 0.5, y: focus?.y ?? 0.5 };
    const srcFile = path.join("src", src);
    const base = path.basename(src, path.extname(src));
    const outDir = eleventyConfig.directories?.output ?? "_site";
    const urls = [];
    for (const c of CROPS) {
      const key = createHash("sha1").update(`${src}|${c.w}x${c.h}|${f.x},${f.y}`).digest("hex").slice(0, 10);
      const name = `${base}-${c.w}x${c.h}-${key}.jpg`;
      const cached = path.join(CACHE, name);
      if (!(await exists(cached))) {
        await mkdir(CACHE, { recursive: true });
        await cropTo(srcFile, cached, c.w, c.h, f);
      }
      const out = path.join(outDir, "a/dist/hero", name);
      await mkdir(path.dirname(out), { recursive: true });
      await copyFile(cached, out);
      urls.push({ ...c, url: `/a/dist/hero/${name}` });
    }
    const [xs, ...rest] = urls;
    return [
      "<style>",
      `    .hero { background-image: url('${xs.url}'); }`,
      ...rest.map((c) => `    @media (min-width: ${c.minWidth}px) { .hero { background-image: url('${c.url}'); } }`),
      "</style>",
    ].join("\n");
  });
}
```

Notes:
- Also export the shortcode function as a named export, `export async function heroStyle(src, focus, outDir = "_site")`, and register that same function, so tests can call it directly.
- Crops are cached in `.cache/hero` (git-ignored) keyed by source, size and focus, so rebuilds are fast. The pipeline can cache that folder (C8).
- If `eleventyConfig.directories` isn't available in this Eleventy version, read the output dir from the `eleventy.before` event and keep it in a module variable.
- The `.hero` rule order must stay smallest to largest so later media queries win.

### 4. Tests: `tests/hero.test.mjs`

- Unit-test `cropBox`:
  - `cropBox(2000, 1000, 320, 411)` (default focus) returns a box with aspect ratio 320:411 within 1px, centred horizontally, full height.
  - `cropBox(2000, 1000, 1920, 489, { x: 0.5, y: 0 })` returns `top: 0`.
  - `cropBox(2000, 1000, 1920, 489, { x: 0.5, y: 1 })` returns `top + height === 1000`.
  - `cropBox(2000, 1000, 320, 411, { x: 0, y: 0.5 })` returns `left: 0`; with `x: 1`, `left + width === 2000`.
- Call the shortcode function directly for `/media/1058/mountains.jpg` and assert it returns a `<style>` block with exactly 5 `background-image` URLs and media queries at 540, 720, 960 and 1140; and that each referenced file exists in `_site/a/dist/hero/` with the exact pixel size (check with `sharp().metadata()`).
- Assert the shortcode returns `""` for an empty `src`.
- Assert every file in `src/media` is copied byte-identical to `_site/media`.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | All 13 media files exist under `src/media/{id}/{file}`, are committed, and are valid images (sharp reads them). |
| AC2 | `_site/media/...` contains byte-identical copies. |
| AC3 | `tests/hero.test.mjs` passes. |
| AC4 | For the About page focus (`x: 0.535, y: 0.633`) on `/media/1052/5.jpg`, the 960x389 crop is visually the same region as the live ImageProcessor crop. Check by downloading `https://ste-pam.com/media/1052/5.jpg?center=0.63313609467455623,0.535&mode=crop&width=960&height=389` to `/tmp` and comparing with `pixelmatch` (threshold 0.1): fewer than 5% of pixels differ. Repeat for home `mountains.jpg` at 1920x489. Record the percentages in the report. |
| AC5 | A second `npm run build` doesn't re-run sharp crops (cache hit). Show timing or a log line. |
| AC6 | Nothing writes outside `_site/` and `.cache/` during the build. |

## Verify

```bash
node scripts/fetch-media.mjs
npm run build && node --test tests/hero.test.mjs
ls _site/a/dist/hero | wc -l
```

(Until C3 and C5 are merged no page sets `heroImage`, so `_site/a/dist/hero` may be empty after a normal build; the test calls the shortcode directly.)
