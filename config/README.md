# config/

Each `*.js` file here is an Eleventy plugin module (`export default function (eleventyConfig) {}`, may be async). `eleventy.config.js` loads them all in alphabetical order.

| Module | Concern |
| --- | --- |
| `assets.js` | Passthrough copy for static assets and `src/media` |
| `critical-css.js` | Beasties transform: inlines each page's critical CSS, loads the stylesheet without blocking |
| `css.js` | SCSS build inside Eleventy hooks |
| `filters.js` | `cleanUrl`, `absoluteUrl`, date filters, `isOld`, `ogImagePath`, `build.year` |
| `collections.js` | `articles`, `articlesAsc` |
| `hero.js` | `heroTerrain` shortcode and `heroSeed`/`heroPrompt` filters: terminal prompt over a seeded contour map |
| `images.js` | Transform: wraps local JPEG/PNG `<img>` in `<picture>` with a cached WebP copy, adds native lazy loading |
| `og.js` | OG image generation in `eleventy.after` |
| `swa.js` | `staticwebapp.config.json` in `eleventy.after` |
