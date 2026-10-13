# config/

Each `*.js` file here is an Eleventy plugin module (`export default function (eleventyConfig) {}`, may be async). `eleventy.config.js` loads them all in alphabetical order.

| Module | Owner | Concern |
| --- | --- | --- |
| `assets.js` | C2 | Passthrough copy for static assets |
| `css.js` | C2 | SCSS build inside Eleventy hooks |
| `filters.js` | C3 | `cleanUrl`, `absoluteUrl`, date filters, `isOld`, `ogImagePath`, `build.year` |
| `collections.js` | C3 | `articles`, `articlesAsc` |
| `hero.js` | C4 (stub from C1) | `heroStyle` async shortcode and hero crops |
| `og.js` | C6 | OG image generation in `eleventy.after` |
| `swa.js` | C7 | `staticwebapp.config.json` in `eleventy.after` |
