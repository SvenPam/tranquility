# C2: Styles and static assets

Wave 3 · Depends on: C1 · Size: M

## Goal

Compile the existing SCSS to `/a/dist/css/ste-pam.min.css` so it is **equivalent to the live stylesheet**, and publish theme images, the sprite, legacy files and favicons at their current public paths.

## Read first

- `docs/specs/README.md`
- `docs/phase-1-discovery.md` section 3.5 (styles)
- `docs/baseline/live/ste-pam.min.css` (the live stylesheet; the target)

## Owns

`config/assets.js`, `config/css.js`, `scripts/build-css.mjs`, `scripts/lib/css-normalise.mjs`, `tests/css-parity.test.mjs`, `tests/assets.test.mjs`. Edits allowed in `src/styles/**` **only** as listed in step 1.

## Background

- The SCSS imports Bootstrap partials via `../../../../node_modules/bootstrap/scss/...`, a path that only worked inside the old project layout.
- Bootstrap must stay at `4.0.0-beta.2` (already pinned by C1).
- Commit `a1e1c82` (Feb 2023) changed `_section.scss` but was **never deployed** because the old pipeline was broken. It also introduced a bug: a missing comma turned `&:nth-child(odd):not(&--footer)` into a descendant selector, which breaks the light/dark section striping. The live CSS was built from the version before that commit. We restore it.
- Phase 1 measured the result of this exact pipeline. After the normalisation in step 4, it differs from live by **zero** rules.

## Steps

### 1. SCSS edits (the only ones allowed)

a) Rewrite Bootstrap imports in every `src/styles/**/*.scss`:

```bash
grep -rl "node_modules/bootstrap" src/styles | xargs sed -i "s#\.\./\.\./\.\./\.\./node_modules/bootstrap/#bootstrap/#g"
```

Result, e.g. `@import 'bootstrap/scss/reboot';`. Commented-out imports change too; that's fine.

b) Restore the pre-2023 striping rule in `src/styles/06-components/_section.scss`:

```diff
-    &:nth-child(odd):not(&--footer)
-    &--dark {
+    &:nth-child(odd):not(&--footer) {
```

No other SCSS changes.

### 2. `scripts/build-css.mjs`

```js
import * as sass from "sass";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import CleanCSS from "clean-css";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Browser list copied from the old gulpfile so prefixes match the live CSS.
const BROWSERS = ["Chrome >= 35", "Firefox >= 38", "Edge >= 12", "Explorer >= 10",
  "iOS >= 8", "Safari >= 8", "Android 2.3", "Android >= 4", "Opera >= 12"];

export async function buildCss({ outDir = "_site" } = {}) {
  const compiled = sass.compile("src/styles/ste-pam.scss", {
    loadPaths: ["node_modules"],
    style: "expanded",
    logger: sass.Logger.silent,          // Bootstrap 4 beta triggers many deprecation warnings
  });
  const prefixed = await postcss([autoprefixer({ overrideBrowserslist: BROWSERS })])
    .process(compiled.css, { from: undefined });
  const min = new CleanCSS({ level: 1 }).minify(prefixed.css);
  if (min.errors.length) throw new Error(min.errors.join("\n"));
  const outFile = path.join(outDir, "a/dist/css/ste-pam.min.css");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, min.styles);
  return outFile;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(await buildCss());
}
```

### 3. Eleventy modules

`config/css.js`:

```js
import { buildCss } from "../scripts/build-css.mjs";

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.on("eleventy.before", async ({ directories }) => {
    await buildCss({ outDir: directories?.output ?? "_site" });
  });
}
```

`config/assets.js`:

```js
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "a/dist/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/sprites": "a/dist/sprites" });
  eleventyConfig.addPassthroughCopy({ "src/old": "old" });
  eleventyConfig.addPassthroughCopy({ "src/static/*": "/" });
}
```

Check `npm run serve` reloads when an SCSS file changes. If passthrough copy is skipped in serve mode (Eleventy's emulated passthrough), that's fine as long as the dev server serves the files.

### 4. Normaliser and parity test

`scripts/lib/css-normalise.mjs` parses a minified stylesheet into a map of `"<at-rule context>|<selector>"` to a set of declarations, applying these rules (each one covers a known, harmless difference between Dart Sass 1.77 and the node-sass build that produced live):

| Rule | Example |
| --- | --- |
| Split selector lists; one entry per selector | `a,b{}` gives `a` and `b` |
| `:nth-child(even)` to `:nth-child(2n)` | |
| `:nth-last-child(1)` to `:last-child` | |
| `*::before` / `*::after` / `*:before` / `*:after` to `::before` / `::after` | |
| Drop selectors containing a vendor pseudo (`::-webkit-`, `:-ms-`, `::-moz-`, `::-ms-`) | placeholder variants |
| Drop vendor-prefixed declarations (`-webkit-`, `-ms-`, `-moz-`, `-o-`) | |
| Round decimals to 3 places, strip trailing zeros and leading `0` | `41.6666666667%` and `41.66667%` both give `41.667%` |
| `url("x")` to `url(x)`; single quotes to double | |
| Lower-case hex colours | |
| Decode `\2014 \00A0` to the literal characters | blockquote footer |
| Ignore comments and `@charset` | |

Export `normalise(cssText)` and `diff(a, b)` returning `{ onlyA, onlyB, changed }` (arrays of keys; `changed` lists keys whose declaration sets differ).

`tests/css-parity.test.mjs`: builds nothing; reads `_site/a/dist/css/ste-pam.min.css` and `docs/baseline/live/ste-pam.min.css`, runs `diff`, and asserts all three arrays are empty. On failure, print the first 20 entries of each.

### 5. Asset test

`tests/assets.test.mjs` asserts these exist in `_site`:

- `a/dist/css/ste-pam.min.css`
- `a/dist/img/generic/2.jpg`, `a/dist/img/generic/2-100.jpg`, `a/dist/img/js-logo.svg`, `a/dist/img/social/twitter.svg`
- `a/dist/sprites/sprite.svg`
- `old/thai.jpg`, `old/Stephen Pammenter - CV.pdf`, `old/MiruSccreen1.jpg`
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-384x384.png`, `mstile-150x150.png`, `manifest.json`, `browserconfig.xml`

and that every file under `src/assets/img` has a byte-identical copy under `_site/a/dist/img`.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `npm run build` produces `_site/a/dist/css/ste-pam.min.css`, minified (no newlines between rules), between 55 KB and 65 KB. |
| AC2 | `tests/css-parity.test.mjs` passes: zero `onlyA`, `onlyB` and `changed` entries against the live stylesheet. |
| AC3 | The only SCSS changes versus the C0 commit are the import rewrites and the `_section.scss` fix (`git diff <C0 commit> -- src/styles` shows nothing else). |
| AC4 | The built CSS contains `.section:nth-child(odd):not(.section--footer){background-color:#e9ecef}` and does **not** contain `.section--footer) .section--dark`. |
| AC5 | `tests/assets.test.mjs` passes. |
| AC6 | `node scripts/build-css.mjs` works standalone and prints the output path. |
| AC7 | Building twice in a row gives a byte-identical CSS file. |
| AC8 | Build output shows no Sass deprecation warnings. |

## Verify

```bash
npm run build && npm run test:core
node scripts/build-css.mjs
wc -c _site/a/dist/css/ste-pam.min.css
grep -c 'section--footer) .section--dark' _site/a/dist/css/ste-pam.min.css   # 0
```
