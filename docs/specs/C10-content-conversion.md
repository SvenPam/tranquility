# C10: Content conversion

Wave 5 · Depends on: C3, C4, C9, and an **owner action** · Size: L

## Goal

Convert every blog article on the live site (58) from rendered HTML into Markdown files with front matter in `src/blog/`, so the new site reproduces each article's text, images, links and embeds. Fix the agreed broken references (D11) on the way.

## Owner prerequisite (blocking)

13 articles exist in Umbraco but render the Not Found page because no template is assigned. Before this chunk runs, the owner must, in the Umbraco back office, open each of these, set **Properties > Template > Blog Article**, and **Save and publish**:

```
c-60-features                         coast-to-coast-pately-bridge
coast-to-coast-success                corrupted-html-when-using-visual-studio
decorator-pattern                     dynamic-serving-and-performance
mvc5-authentication                   posting-to-a-facebook-page-via-server-c
share-linkedin-company-update-using-c site-30
site-redesign-the-rekoning            string-to-enum-net-40plus
web-config-transform
```

Step 1 checks this. If any still returns Not Found, **stop and report** which ones, unless you've been told to proceed without them (then pass `--allow-missing` and list them in the report).

## Read first

- `docs/specs/README.md` (3.4 article front matter)
- `tests/articles-parity.test.mjs` and `tests/lib/html.mjs` (C9): the parity rules your output must pass
- Three snapshots with tricky content: `docs/baseline/live/pages/blog/lifes-better-with-bem.html` (CodePen embeds), `thai-lime-ginger-and-prawn-stir-fry.html` (Instagram embed), `atomic-design-and-patternlab.html` (lazy-loaded image holders)

## Owns

`scripts/convert-live.mjs`, `scripts/lib/convert/**`, `src/blog/*.md` (all of them, including overwriting C3's two seeds), new files in `src/media/`, new files and manifest updates in `docs/baseline/live/`, `docs/migration-report.md`, `tests/convert.test.mjs`.

## What's in the articles (from Phase 1)

- Every article body is a single `div.row > div.col-12.col-md-12` inside `.article.section__content`.
- Elements used: `p`, `h2`-`h4`, `ul`/`ol`, `a`, `img` (29), `blockquote` (6, one Instagram), `pre` (3, two with `class="prettyprint"` and no `code` child), `code` (7), `figure` (2), `iframe` (3: YouTube, Strava, t2t.bike), `script` (Gists, CodePen), `p.codepen` (5).
- Three articles use the Grid "media" editor's lazy image holder: `<div class="article__img-holder" style="padding-bottom: 75%;"><img class="lazyload" data-src="/media/...?width=1020&mode=max" data-srcset="..." sizes="auto" ...></div>`.
- Some `img`s have `style`, `width` or `title` attributes; some sit inside `p` with inline `style`.
- Some paragraphs are empty spacers: `<p> </p>` or `<p>&nbsp;</p>`.
- Image and link URLs come in many forms: `/media/...`, `https://ste-pam.com/res/...`, `/Areas/ste_pam/Uploads/...`, `https://ste-pam.com/Content/img/...`, `/umbraco/nothing.jpg`, and external hosts.

## Steps

### 1. Fetch and snapshot (`--source live`, the default)

- Article list: every `url` under `/blog/` in `docs/baseline/live/manifest.json` (58).
- For each, `GET https://ste-pam.com{url}`. It must return 200 and its `<title>` must not start with `Not Found`.
- If there's no snapshot yet (the 13), save the HTML to `docs/baseline/live/pages/blog/{slug}.html` and update that manifest entry to `{ "status": 200, "file": "pages/blog/{slug}.html" }` (remove the `note`). Don't overwrite the 45 existing snapshots unless `--refresh` is passed; they're the parity reference.
- `--source baseline` skips the network and converts from snapshots only.

### 2. Extract front matter (`cheerio`)

| Field | Selector / rule |
| --- | --- |
| `title` | `article.section header .lead a` text |
| `description` | `header p.text-muted` text, whitespace collapsed (entities decoded, so `&#128170;` becomes 💪) |
| `topic` | `header p.text-center` text; must be one of the topic enum values |
| `date` | `header time[datetime]`, format `dd/MM/yyyy HH:mm:ss`, written as `YYYY-MM-DDTHH:mm:ss` (treat as UTC) |
| `tags` | `header .section__meta .tag` texts, empties dropped |
| `theme` | from `section.hero` class `hero--(\w*)`; write `theme: dark` only when non-empty |
| `heroImage` / `heroFocus` | only if the page has a hero `<style>` with a `/media/` URL: path without query; focus from `center=Y,X` (note the order) or default for `anchor=center`. Not expected on articles |

Write front matter by hand, not with a YAML library, so the output is stable: strings via `JSON.stringify` (valid YAML), dates unquoted, `tags` as a flow list (`tags: ["front-end", "svg"]`), keys in the order `title, description, date, topic, tags, theme`.

### 3. Pre-process the body DOM

Take `.article.section__content > .row > .col-12` (error if there isn't exactly one). Then:

a) **URL rewriting** on `href`, `src`, `data-src`, `srcset`, `data-srcset`:

| Pattern | Becomes |
| --- | --- |
| `https://ste-pam.com/x`, `http://ste-pam.com/x`, `//ste-pam.com/x` | `/x` |
| `/Areas/ste_pam/Uploads/{f}` | `/old/{f}` |
| `/res/{f}` or `/Content/img/{f}` | `/old/{match}` if `src/old` has a case-insensitive match, or the alias `MiruScreen1.jpg` to `MiruSccreen1.jpg`; otherwise leave as `/res/{f}` and record a warning |
| `/media/{id}/{f}?...` | `/media/{id}/{f}` (query dropped) |
| anything external | unchanged |

b) **Lazy image holders** (`div.article__img-holder`): keep the holder and its `img` as raw HTML (the CSS sizes the placeholder), but set `data-src` to the rewritten bare path and remove `data-srcset` and `sizes`.

c) Remove `data-udi` attributes.

d) Collect every `/media/...` path. Any not already in `src/media/` is downloaded from `https://ste-pam.com` (bare path) into `src/media/`.

### 4. Convert with Turndown

```js
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const td = new TurndownService({
  headingStyle: "atx", codeBlockStyle: "fenced", fence: "```",
  bulletListMarker: "-", emDelimiter: "_", strongDelimiter: "**", linkStyle: "inlined",
});
td.use(gfm);

// Keep as raw HTML anything Markdown can't express faithfully.
td.keep((node) =>
  ["IFRAME", "SCRIPT", "FIGURE", "TABLE"].includes(node.nodeName) ||
  (node.nodeName === "BLOCKQUOTE" && node.classList.contains("instagram-media")) ||
  node.classList?.contains("codepen") ||
  node.classList?.contains("article__img-holder") ||
  (node.nodeName === "PRE" && node.firstChild?.nodeName !== "CODE") ||
  (node.nodeName === "IMG" && [...node.attributes].some((a) => !["src", "alt"].includes(a.name))) ||
  node.hasAttribute?.("style"));

// Preserve empty spacer paragraphs.
td.addRule("spacer", {
  filter: (n) => n.nodeName === "P" && n.textContent.replace(/ /g, " ").trim() === "" && !n.querySelector("img,iframe"),
  replacement: () => "\n\n<p>&nbsp;</p>\n\n",
});
```

Drop `TABLE` from the keep list if the gfm table output passes parity; keep it otherwise. Tune rules until parity passes (step 6), but **the rendered text must not change**.

Per-article fallback: if an article can't pass parity as Markdown after reasonable effort, write its body as raw HTML (the pre-processed DOM) and mark it `raw-html` in the report. Aim for zero fallbacks; more than 5 is a sign the rules need work.

### 5. Write files

`src/blog/{slug}.md` = front matter + blank line + body + trailing newline. Overwrite C3's seed files. The slug is the last URL segment, unchanged.

### 6. Check and iterate

```bash
npm run build
node --test --test-name-pattern="\[content\]" "tests/**/*.test.mjs"
```

All `[content]` tests must pass. Then `npm test` in full: routing checks may skip if C7 isn't merged on this branch, but nothing may fail.

### 7. Migration report: `docs/migration-report.md`

- Summary: articles converted, Markdown vs raw-HTML counts, media files added, references fixed, references still broken.
- One table row per article: slug, title, date, topic, word count, images, embeds, mode, warnings.
- A section listing the 13 restored articles and confirming each has a snapshot and passes parity.
- A section listing unresolved references (these match `tests/known-broken.json`; if you find a new one, list it and don't edit C9's file; report it instead).

### 8. Tests: `tests/convert.test.mjs`

Unit tests for the converter library (`scripts/lib/convert/`): URL rewrite table (each row of step 3a), date parsing (`23/04/2017 15:46:11` to `2017-04-23T15:46:11`), front matter serialisation (an emoji description round-trips through `gray-matter`), and spacer paragraphs surviving conversion.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `src/blog/` contains 58 `.md` files (or 45 + those confirmed with `--allow-missing`), one per manifest article URL, and `npm run validate` passes. |
| AC2 | All `[content]` tests pass; the full `npm test` has no failures. |
| AC3 | `node scripts/convert-live.mjs --source baseline` run twice produces no `git diff` the second time (deterministic). |
| AC4 | `grep -rn "ste-pam.com" src/blog` returns nothing; no `/Areas/ste_pam/Uploads/` paths remain; no `data-udi` attributes remain. |
| AC5 | `npm run test:visual` passes for `article` and `article-embeds` at both viewports. |
| AC6 | `docs/migration-report.md` exists with the sections in step 7, and its counts match the files. |
| AC7 | Manual spot check (attach screenshots of new and live): `lifes-better-with-bem` (CodePen blocks present), `thai-lime-ginger-and-prawn-stir-fry` (Instagram embed script loaded), `atomic-design-and-patternlab` (image holders render with images), and one of the 13 restored articles. |
| AC8 | Every new media file referenced by an article exists in `src/media/` and `_site/media/`. |

## Verify

```bash
node scripts/convert-live.mjs            # or --source baseline
npm run build && npm test
node scripts/convert-live.mjs --source baseline && git status --porcelain src/blog   # empty
ls src/blog/*.md | wc -l
grep -rln "ste-pam.com\|data-udi\|Areas/ste_pam" src/blog || echo "AC4 ok"
```
