# config/

Each `*.js` file here is an Eleventy plugin module (`export default function (eleventyConfig) {}`, may be async). `eleventy.config.js` loads them all in alphabetical order.

| Module | Concern |
| --- | --- |
| `assets.js` | Passthrough copy for static assets |
| `css.js` | SCSS build inside Eleventy hooks |
| `filters.js` | `cleanUrl`, `absoluteUrl`, date filters, `isOld`, `ogImagePath`, `build.year` |
| `collections.js` | `articles`, `articlesAsc` |
| `hero.js` | `heroStyle` async shortcode; emits the original hero image as the background |
| `og.js` | OG image generation in `eleventy.after` |
| `swa.js` | `staticwebapp.config.json` in `eleventy.after` |
