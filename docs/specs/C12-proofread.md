# C12: Proofread articles and standardise code samples

Wave 6 · Depends on: C10 (all 58 articles converted) · Size: L, split into 3 parallel batches

## Goal

Proofread every blog article so it reads as the owner wrote it, minus the mistakes: correct spelling, typos, grammar slips and punctuation, and standardise code samples. **Don't change what the article says, how it says it, or its structure.** Every change is logged so the owner can review it and the parity tests can prove nothing else changed.

## Read first

- `docs/specs/README.md` (3.4 front matter)
- `tests/articles-parity.test.mjs`: the header comment explains the approved-edits file format
- Two converted articles to see the Markdown style: `src/blog/sass-loops.md`, `src/blog/c-60-features.md`

## Batches

Run as three parallel chunks. Each batch owns its articles' files only.

| Batch | Articles (by filename, alphabetical) |
| --- | --- |
| **C12a** | `acceptance-to-expotees-and-project-progression` to `geotag-update-and-parsing-woes` (19 articles) |
| **C12b** | `getting-the-most-out-of-fonts` to `site-30` (20 articles) |
| **C12c** | `site-40` to `web-config-transform` (19 articles) |

Each batch also owns `docs/proofread/{slug}.json` for its articles and `docs/proofread/report-{a,b,c}.md`.

## Owns (per batch)

`src/blog/{slug}.md` and `docs/proofread/{slug}.json` for the batch's slugs, and `docs/proofread/report-{batch}.md`.

## Rules

### Prose

| Do | Don't |
| --- | --- |
| Fix misspellings (`programatically` to `programmatically`, `prefect` to `perfect`, `Archieve` to `Archive`) | Rephrase sentences, change tone, tighten wording or "improve" style |
| Fix clear typos (doubled words, missing letters, `a round` to `around` where it's plainly meant) | Change facts, opinions, technical claims or outdated information, even if wrong today |
| Fix grammar slips that are clearly accidental (`an maintainability` to `and maintainability`, subject/verb agreement) | Add or remove sentences, headings, links, images or emoji |
| Fix punctuation that is clearly wrong (missing full stops at paragraph ends, `its`/`it's`, stray spaces before punctuation) | Change the author's informal voice, exclamation marks, slang or humour |
| Use British spelling consistently (`colour`, `optimise`, `licence` as noun) | Change product names, code identifiers, URLs, quoted error messages or titles of external things |
| Fix typos in the article `title` and `description` front matter | Change the filename or URL slug, ever |

When in doubt, leave it and list it in the report under "Not changed, owner to decide".

Titles: fixing a title typo (e.g. `Site Redesign - The Rekoning`) changes only the displayed title, never the URL. List every title change at the top of the batch report so the owner sees them first.

### Code samples

Standardise **presentation only**. The code itself must still do exactly the same thing.

1. **Fenced blocks.** Every multi-line code sample becomes a fenced block with a language tag: ` ```csharp `, ` ```scss `, ` ```css `, ` ```js `, ` ```html `, ` ```xml `, ` ```json `, ` ```sql `, ` ```powershell `, ` ```bash `, ` ```text ` (if unknown). This includes raw `<pre>` / `<pre class="prettyprint">` blocks left by the converter, provided the rendered text is identical (check it).
2. **Indentation.** Tabs to spaces. Four spaces per level for C#, SQL, XML; two for HTML, CSS, SCSS, JS, JSON. Re-indent only leading whitespace.
3. **Trim** leading and trailing blank lines inside the block and trailing spaces on each line.
4. **Inline code.** Wrap identifiers, file names, CLI commands and short snippets in running text in backticks when they're unmistakably code (`web.config`, `Enum.TryParse`, `npm install`). Don't backtick ordinary words.
5. **Don't touch** embedded Gists, CodePen blocks, Instagram, iframes or any other raw-HTML embed.
6. Fixing a typo inside code (e.g. in a comment or a string the article explains) counts as a code change: log it with `kind: "code"`. Don't fix bugs in code.

There is no syntax highlighting on the site and this chunk doesn't add any. Language tags are harmless (`class="language-x"` on the `<code>` element) and future-proof.

### Links

If a link or image in your articles points at a path in `tests/known-broken.json` and the file exists in the repo under another path, fix it and log it under `links` or `images`:

- `/umbraco/res/FYP Progress Review Poster (K0025970).pdf` (decorator-pattern) to `/old/FYP Progress Review Poster (K0025970).pdf`
- `/Areas/t2t2015/Uploads/t2t.png` (site-30) to `/a/dist/img/t2t.png`

Don't edit `tests/known-broken.json` (owned elsewhere); report the entries that are now unused.

## Logging every change: `docs/proofread/{slug}.json`

One file per article you change (omit it if the article needed nothing). Format, exactly as the parity test reads it:

```json
{
  "title": [{ "from": "Site Redesign - The Rekoning", "to": "Site Redesign - The Reckoning", "kind": "spelling" }],
  "description": [],
  "body": [
    { "from": "We can do this programatically.", "to": "We can do this programmatically.", "kind": "spelling" },
    { "from": "an maintainability gains", "to": "and maintainability gains", "kind": "grammar" }
  ],
  "links": [{ "from": "/umbraco/res/FYP Progress Review Poster (K0025970).pdf", "to": "/old/FYP Progress Review Poster (K0025970).pdf" }],
  "images": []
}
```

- `from`/`to` are **rendered text**, not Markdown: what a reader sees, whitespace-collapsed. Use enough surrounding words to make `from` unique within the field.
- `kind` is one of `spelling`, `typo`, `grammar`, `punctuation`, `code`, `title`.
- Whitespace-only and Markdown-only changes (code fences, indentation, backticks) don't change rendered text, so they need no entry, but list them in the report.
- The parity test fails if your Markdown changes rendered text without a matching entry, or if an entry's `from` isn't found in the live text. That's the guarantee that nothing else changed.

## Report: `docs/proofread/report-{batch}.md`

For the owner to review, in British English, no em dashes:

1. **Title changes** (if any): old and new.
2. **Per article:** a short table of every change (`before` / `after` / `kind`), plus one line on code standardisation (e.g. "3 blocks fenced as csharp, re-indented").
3. **Not changed, owner to decide:** anything ambiguous you left alone, with a sentence on why.
4. **Counts:** articles touched, changes by kind.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `npm run build && npm test` passes in full, including every `[content]` parity test for the batch's articles. |
| AC2 | Every rendered text difference from live is in a `docs/proofread/{slug}.json` entry (the parity test proves this). |
| AC3 | No sentence is reworded beyond the corrected word(s); a reviewer reading the before/after table agrees each change is a genuine correction. |
| AC4 | No code block in the batch's articles is left as raw `<pre>` (unless the report explains why), every fenced block has a language tag, and no block contains tab characters. |
| AC5 | Filenames, URLs, front matter keys other than `title`/`description`, dates, topics and tags are unchanged (`git diff` on front matter shows only title/description lines). |
| AC6 | `npm run validate` passes and `npm run test:visual` still passes for `article` and `article-embeds` (or any mismatch is explained by a logged text change). |
| AC7 | The batch report exists with all four sections, and its counts match the JSON files. |

## Verify

```bash
npm run build && npm test
git diff --stat -- src/blog docs/proofread
grep -lP '\t' src/blog/{batch slugs}.md || echo "no tabs"
grep -c '<pre' src/blog/{batch slugs}.md
```
