# C5: Static pages

Wave 4 · Depends on: C3, C4 · Size: S

## Goal

Port Home, About, Contact and Not Found from the live site, using the live copy (which is newer than anything in the old repo), with the agreed fixes.

## Read first

- `docs/specs/README.md` (3.4 front matter, 3.5 section striping)
- Snapshots: `docs/baseline/live/pages/index.html`, `about.html`, `contact.html`, `not-found.html`
- `src/_includes/layouts/page.njk` (from C3) to see what the layout already renders

## Owns

`src/index.njk` (replaces C1's placeholder), `src/about.njk`, `src/contact.njk`, `src/not-found.njk`, `tests/static-pages.test.mjs`.

## Method

For each page, the template body is the **inner HTML of `div.sections`** from the snapshot, minus the leading `<div></div>` if present (the layout adds it via `leadingSpacer`). Paste it as HTML in the `.njk` body. Don't convert to Markdown: these pages use layout markup (`section`, `row`, `col-*`, `stack`) that Markdown can't express.

Front matter values come from the snapshot's `<title>`, hero, meta description and hero `<style>` crop URL.

## Pages

### Home: `src/index.njk`

```yaml
---
title: Stephen Pammenter
subtitle: .NET Developer
description: "Developer at StaffCircle. Helping deliver software to enable organizations to harness the power of aligning culture & performance management."
layout: layouts/page.njk
heroImage: /media/1058/mountains.jpg
permalink: /
---
```

Body: the single `<section class="section">...</section>` from `index.html`, copied exactly (including the Crezco copy, the certification link and "Get in touch" linking to LinkedIn). Keep the original's unbalanced `</div>` structure only if the browser renders it the same; otherwise balance it and note that in the report.

The meta description is out of date (it mentions StaffCircle) but it's what live serves. Keep it, and list it under follow-ups in your report for the owner to update.

### About: `src/about.njk`

```yaml
---
title: About
description: ""
layout: layouts/page.njk
leadingSpacer: true
heroImage: /media/1052/5.jpg
heroFocus: { x: 0.535, y: 0.63313609467455623 }
permalink: /about/
---
```

Body: both sections from `about.html` (the `section development hidden-print` stacks row and the bio `section`). One change, because Stack Overflow CV no longer exists and `/cv` now redirects to LinkedIn until a CV page exists:

```diff
- <p>You can find my CV at; <a href="//stackoverflow.com/cv/spammenter">stackoverflow.com/cv/spammenter</a></p>
+ <p>You can find my CV at; <a href="/cv">ste-pam.com/cv</a></p>
```

The stack logos use `/a/dist/img/*.svg`; keep those paths.

### Contact: `src/contact.njk`

```yaml
---
title: Contact
description: ""
layout: layouts/page.njk
heroImage: /media/1055/4.jpg
permalink: /contact/
---
```

Body from `contact.html`, with the typo fixed:

```diff
- <li><a href="//twiter.com/svenpam">Twitter</a></li>
+ <li><a href="//twitter.com/svenpam">Twitter</a></li>
```

### Not Found: `src/not-found.njk`

```yaml
---
title: Not Found
description: ""
layout: layouts/page.njk
permalink: /not-found/
eleventyExcludeFromCollections: true
---
```

Body from `not-found.html` (the section with the U2 line and the Spotify iframe), unchanged. No hero image: the CSS default hero shows, as live. C7 serves this page for every unknown URL with status 404.

## Not ported

`/work` is dropped (C7 adds a temporary redirect to `/about`). Don't create a page for it.

## Tests: `tests/static-pages.test.mjs`

Uses `cheerio`. For each of the four pages, compare the built `_site/<page>/index.html` with its snapshot:

1. Extract the text of `main` from both, collapse whitespace, and assert equality **after** applying the documented edits to the snapshot text (About: `stackoverflow.com/cv/spammenter` to `ste-pam.com/cv`; Contact: none, as link text is unchanged).
2. Assert the list of `a[href]` values in `main` matches, after the documented edits (About: SO CV href to `/cv`; Contact: `//twiter.com/svenpam` to `//twitter.com/svenpam`).
3. Assert `<title>`, `meta[name=description]` and `section.hero` class/title/subtitle match the snapshot.
4. Assert the leading spacer: present on About only.
5. Assert the hero `<style>` exists on Home, About, Contact (5 `background-image` URLs) and is absent on Not Found.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `npm run build` succeeds and `npm run validate` passes for the four pages. |
| AC2 | `tests/static-pages.test.mjs` passes. |
| AC3 | `_site/index.html`, `_site/about/index.html`, `_site/contact/index.html`, `_site/not-found/index.html` exist. |
| AC4 | No built page contains `stackoverflow.com/cv` or `twiter.com`. |
| AC5 | Home's `<title>` is exactly `Stephen Pammenter`; About's is `About | Stephen Pammenter`. |
| AC6 | Not Found is not in `collections.all`-driven outputs (it won't appear in C7's `sitemap.xml`). |

## Verify

```bash
npm run build && node --test tests/static-pages.test.mjs tests/layouts.test.mjs
grep -rlE 'stackoverflow.com/cv|twiter.com' _site || echo "AC4 ok"
```
