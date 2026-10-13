# Phase 2: Plan

Status: **Draft, awaiting approval**
Date: 2026-10-13
Inputs: [Phase 1 discovery](phase-1-discovery.md), your answers to its decisions

---

## 1. Decisions recorded

| # | Decision | Outcome |
| --- | --- | --- |
| D1 | Framework | **Eleventy (11ty) 3.x**, Nunjucks templates, Markdown content |
| D2 | Hosting | **Azure Static Web Apps, Free tier** |
| D3 | Content conversion | **Automated from live HTML**, as its own final chunk |
| D4 | 13 broken articles | **Restore.** You assign the template in Umbraco so they render live, then the converter picks them up with the rest (section 8.2) |
| D5 | Blog pagination | **Single `/blog` page** listing every article. Replaces the broken pager |
| D6 | OG images | **Satori + resvg at build time** for every page |
| D7 | XML sitemap | **`/sitemap.xml`** + `robots.txt` entry |
| D8 | Drops | Auto-tweet, GA (UA), App Insights, contact form code: **dropped**. **Disqus also dropped**, along with the GA snippet |
| D9 | `/cv` | **Temporary (302) redirect to LinkedIn.** Footer and About CV links point at `/cv`, so when your JSON Resume CV lands later, only the redirect changes |
| D10 | Media | **Copy into the repo at the same `/media/{id}/{file}` paths** (no answer given, so going with the recommendation) |
| D11 | Content bug fixes | **Fix** (no answer given, so going with the recommendation): `twiter.com` typo, `/#work` footer link, broken `/res/*` images mapped to `/old/*` where the file exists |
| D12 | Archive branch | **Done.** `archive/umbraco` pushed from `master` |
| D13 | DNS | **Cloudflare** |
| D14 | Footer credit | "Built with Eleventy, see Source." (no answer given, so going with the recommendation) |
| Work | `/work` page | **Dropped.** Removed from nav and footer. `/work` gets a temporary redirect to `/about` until the CV exists |
| Copy | Source of truth | **Live site copy**, not the repo |
| CI/CD | Pipeline | **New Azure DevOps YAML pipeline**, deploying on push to `main` |

### Notes on your answers

- **Pagination.** Confirmed: pagination goes. A single `/blog` page lists every article, and old `?page=N` links land on it.
- **`main` vs `master`.** Confirmed: rename the default branch `master` to `main` at cut-over (C11).
- **The Entra problem.** The new pipeline deploys with the Static Web App's **deployment token**, not an Azure service connection, so it doesn't depend on Entra at all. The only identity it needs is ADO's GitHub connection to read the repo.
- **Future JSON Resume CV.** This fits Eleventy well. Either drop the HTML that a JSON Resume theme produces into `src/cv/`, or load `resume.json` as Eleventy global data and render it with your own template. Both are a small follow-up and need no design decisions now. `/cv` is reserved for it.

---

## 2. Approach

```
                 author writes Markdown
                          |
                          v
  GitHub repo (main) --push--> Azure DevOps pipeline (azure-pipelines.yml)
                                 |  npm ci
                                 |  npm run build   (Eleventy + Sass + images + OG cards)
                                 |  npm test        (URL parity, links, schema)
                                 v
                        AzureStaticWebApp@0 task (deployment token)
                                 |
                                 v
                 Azure Static Web App (Free) -- custom domain ste-pam.com
                                 ^
                        Cloudflare DNS (CNAME flattening at apex)
```

- **Eleventy** turns `src/**/*.md` + Nunjucks layouts into the same HTML the Razor views produce today. Output ships **no framework JS**: only the existing mobile menu script and vanilla-lazyload.
- **Templates are ported from the live HTML**, element for element, so the existing CSS keeps matching. Razor logic is translated, not redesigned.
- **CSS** is the existing SCSS compiled by Dart Sass against **Bootstrap `4.0.0-beta.2`**, written to the same public path `/a/dist/css/ste-pam.min.css`.
- **Everything the site needs lives in the repo**: Markdown, media, images, PDFs. The Blob storage account, App Service, SQL DB and App Insights are retired after cut-over.
- **Build-time work** replaces server-time work: hero crops, OG cards, "Old Article" banner, copyright year. A weekly scheduled pipeline run keeps the time-based values fresh.

---

## 3. Target repository layout

```
/
  azure-pipelines.yml            # ADO pipeline: PR validation, main deploy, weekly rebuild
  infra/
    main.bicep                   # Static Web App (Free) definition, deployed once by hand
    README.md                    # how to provision and wire the deployment token
  eleventy.config.js             # collections, filters, shortcodes, passthrough copy
  package.json                   # pinned deps, scripts: build, serve, test
  .nvmrc                         # Node 22 LTS
  src/
    _data/
      site.json                  # name, url, social handles, author
      redirects.json             # single source for redirects (feeds SWA config)
    _includes/
      layouts/
        base.njk                 # <html>, head meta, nav, footer, scripts
        page.njk                 # hero + .sections wrapper
        article.njk              # article header card, old banner, body, older/newer
      partials/
        meta.njk  nav.njk  footer.njk  hero-style.njk  article-summary.njk
    blog/
      blog.11tydata.js           # defaults for all articles (layout, permalink, theme)
      authentication-through-azure.md
      ... one file per article (58)
    index.njk                    # home (live copy)
    about.njk                    # about (live copy)
    contact.md
    blog.njk                     # single list page
    sitemap.njk                  # HTML sitemap
    not-found.md                 # 404 page, also served at /not-found
    sitemap.xml.njk
    robots.txt.njk
    og/
      og.11ty.js                 # one PNG per page via Satori + resvg
    styles/                      # ITCSS SCSS moved as is from Tranquility.CMS/a/src/styles
    assets/
      img/                       # from a/src/images  -> /a/dist/img/
      sprites/sprite.svg         #                    -> /a/dist/sprites/
      fonts/                     # TTF for OG cards only
    media/                       # 13 files at /media/{id}/{file}
    old/                         # legacy PDFs/images -> /old/
    static/                      # favicons, manifest.json, browserconfig.xml
  scripts/
    convert-live.mjs             # C10: live HTML -> Markdown
    build-swa-config.mjs         # writes staticwebapp.config.json from redirects.json
  tests/
    urls.spec.mjs                # URL parity vs docs/baseline/urls.json
    links.spec.mjs               # internal link and asset check on _site
    visual.spec.mjs              # Playwright screenshot diff vs docs/baseline
  docs/
    phase-1-discovery.md  phase-2-plan.md  specs/  baseline/
  .claude/agents/
    spec-implementer.md  spec-verifier.md   # created in Phase 3
```

`Tranquility.CMS/` and `Tranquility.sln` are deleted on the migration branch (preserved on `archive/umbraco`).

---

## 4. Templates and content model

### 4.1 Layout chain

```
base.njk     head (meta.njk), nav.njk, <main>{{ content }}</main>, footer.njk, menu JS
  page.njk   hero-style.njk (<style> crops) + section.hero + div.sections
    article.njk   header card + old banner + grid wrapper + older/newer pager
```

This mirrors `Master.cshtml` > `_Page.cshtml` > `Article.cshtml` so class names and nesting stay identical.

### 4.2 Front matter

Articles (`src/blog/{slug}.md`, slug = filename = current URL segment):

```yaml
---
title: Authentication Through Azure
description: Protect a serverless application with Azure AD and gain access via a SPA.
date: 2019-07-24T15:22:06
topic: Guide            # None | Project | Personal | Interesting | TIL | Guide | Site | Cooking
tags: []                # e.g. [front-end, svg]
updated: 2019-07-24     # optional; drives the "Old Article" banner (defaults to date)
heroImage: /media/1054/2.jpg   # optional; falls back to the CSS default hero
ogImage: /og/blog/authentication-through-azure.png  # optional override; normally generated
---
Markdown body (raw HTML allowed for embeds)
```

Pages use `title`, `altTitle`, `subtitle`, `description`, `heroImage`, `heroFocus` (focal point for crops) and `theme`.

New post workflow: add one `.md` file under `src/blog/`, push to `main`. The pipeline builds it, generates its OG card, and deploys.

### 4.3 Behaviour carried over (and what changes)

| Today (Razor) | Static |
| --- | --- |
| Hero crops via ImageProcessor query strings | `@11ty/eleventy-img` generates 5 sizes at build; `<style>` block emitted per page as today |
| `Friendly()` dates | Always `dd-MMM-yy` (what shows today for every article) |
| `datetime="24/07/2019 15:22:06"` | Valid ISO `datetime` (B10 fixed, invisible change) |
| "Old Article" if updated > 1 year ago | Same rule, evaluated at build. Weekly rebuild keeps it accurate |
| Older/Newer by tree order | By `date` |
| Copyright year | Build year |
| Disqus, GA, Instagram embed script | Disqus and GA removed. Instagram script only on articles that embed Instagram |
| Nav: Back, Home, About, Blog, Work, Contact | Work removed |
| Footer: About, `/#work`, Blog, Sitemap; SO CV link; "Built with Umbraco" | `/#work` removed; CV links to `/cv`; SO profile link; "Built with Eleventy" |

---

## 5. CSS migration

1. Move `Tranquility.CMS/a/src/styles/**` to `src/styles/` unchanged.
2. Replace the `../../../../node_modules/bootstrap/scss/...` imports with package imports resolved via Sass `loadPaths: ['node_modules']` (e.g. `@import 'bootstrap/scss/reboot'`). That's the only source edit.
3. Pin `bootstrap@4.0.0-beta.2` exactly. Compile with Dart Sass (deprecation warnings for `@import` silenced), run autoprefixer with the original browser list, minify with Lightning CSS or clean-css, write to `_site/a/dist/css/ste-pam.min.css`.
4. Keep `$image-url: '/a/dist/img'`, and copy images and the sprite to `/a/dist/img/` and `/a/dist/sprites/`, so neither CSS nor markup changes.
5. **Parity gate:** a test diffs the selector set of the built CSS against a saved copy of the live CSS (`docs/baseline/live.min.css`). Phase 1 measured 8 selectors only in live and 5 only in the rebuild, all prefix or equivalent forms; the gate allows exactly that known set.
6. Visual check: Playwright screenshots of the built site compared to `docs/baseline/*.png`.

No Sass modernisation (`@use`), no Bootstrap upgrade, no restyling in this migration.

---

## 6. Assets and media

| Asset | Source | Destination (URL unchanged) |
| --- | --- | --- |
| 13 media files | Downloaded via `https://ste-pam.com/media/...` | `src/media/{id}/{file}` -> `/media/{id}/{file}` |
| Theme images, sprite | `Tranquility.CMS/a/src/images`, `a/src/sprites` | `/a/dist/img/**`, `/a/dist/sprites/sprite.svg` |
| Legacy files | `Tranquility.CMS/old/**` | `/old/**` |
| Favicons, manifest, browserconfig | `Tranquility.CMS/*` | Site root |
| Article inline images | Converted by C10 | Same `/media/...` or `/old/...` paths |
| OG cards | Generated | `/og/{path}.png` (new URLs, only referenced from meta tags) |

Images are optimised once at copy time (lossless) and not processed again on every build, except hero crops which `eleventy-img` caches.

---

## 7. OG images

- Satori renders a JSX-like tree to SVG, resvg turns it into a 1200x630 PNG. Pure Node, no browser, no API key.
- The card replicates the hcti.io design from `CoverImageService.cs`: background `generic/2-100.jpg`, centred `#343a40` box with offset shadow, title, description, "Ste Pammenter // @SvenPam // #tags", date `dd-MMM-yyyy`.
- Font: a bundled open-licence monospace TTF (JetBrains Mono or Liberation Mono, chosen in spec) since Satori can't use system fonts. Expect a slightly different typeface from the hcti.io render.
- Generated for every article and page. `og:image` and `twitter:image` are emitted as **absolute** URLs (fixes the relative-URL bug).
- Cached by content hash, so unchanged pages don't re-render.

---

## 8. Content migration

### 8.1 Automated conversion (C10, last chunk)

A script crawls the live sitemap and, for each page:

1. Parses the article header card into front matter (title, topic, description, date from the `datetime` attribute, tags, theme, hero image).
2. Takes the body inside `.article > .row > .col-12` and converts it to Markdown with Turndown, keeping raw HTML for iframes, scripts, figures and anything Turndown can't round-trip cleanly.
3. Rewrites `https://ste-pam.com/...` links to relative, `/Areas/ste_pam/Uploads/*` to `/old/*`, and `/res/*` or `/Content/img/*` to `/old/*` where the file exists (D11). Anything still unresolved is listed in a report, not guessed.
4. Downloads any referenced `/media/...` file not already present.
5. Writes `src/blog/{slug}.md` and a `migration-report.md` listing every article, its word count and any warnings.

Static pages (home, about, contact, not-found) are ported by hand in C5 since there are only four and they need template-level markup.

Acceptance: every converted article, rendered by the new site, has the same visible text as live (normalised whitespace) and the same image and link targets, apart from the documented D11 fixes.

### 8.2 Restoring the 13 broken articles (your action, before C10)

The 13 articles exist in Umbraco but have no template. In the back office, for each one: **Properties > Template > Blog Article > Save and publish**. They then render live and C10 converts them with the rest. This needs no deploy, which avoids the pipeline problems. If that doesn't make them render, fall back to copying their content out of the back office by hand into Markdown files.

---

## 9. Routing, redirects and 404

Generated `staticwebapp.config.json`:

| Rule | Behaviour |
| --- | --- |
| `trailingSlash: "never"` | `/about/` 301 to `/about`; `/about` serves `about/index.html` (confirmed in spec C7) |
| `/blog/article/*` | 301 to `/blog/*` |
| `/Areas/ste_pam/Uploads/*` | 301 to `/old/*` |
| `/res/{file}`, `/Content/img/{file}` | 301 to `/old/{file}` for files that exist there |
| `/cv`, `/cv/*` | **302** to `https://www.linkedin.com/in/spammenter/` |
| `/work` | **302** to `/about` |
| `/sitemap?xml=true` | Can't be matched (query string). Serves the HTML sitemap. `/sitemap.xml` is the new home |
| `/blog?page=N` | Serves `/blog`, which lists everything |
| 404 | `responseOverrides.404` serves `/not-found/index.html` with status 404 |
| Headers | Long cache for `/a/dist/*`, `/media/*`, `/old/*`; short for HTML |
| MIME | `.svg`, `.json`, `.xml`, `.pdf` explicit |

Redirect rules live in `src/_data/redirects.json` so the config and the URL tests use one list.

---

## 10. Deployment

### 10.1 Azure

- One resource group with one **Static Web App (Free)**, defined in `infra/main.bicep`.
- **Provisioned once by hand** (`az deployment group create`) from your machine, not by the pipeline. That keeps Entra and service connections out of the pipeline entirely.
- The SWA **deployment token** goes into an ADO secret variable (or variable group) `SWA_DEPLOYMENT_TOKEN`.

### 10.2 Azure DevOps pipeline (`azure-pipelines.yml`)

```yaml
trigger:
  branches: { include: [main] }
pr:
  branches: { include: [main] }
schedules:
  - cron: "0 5 * * 1"            # weekly rebuild: copyright year, Old Article banner
    branches: { include: [main] }
    always: true
pool: { vmImage: ubuntu-latest }
steps:
  - task: UseNode@1
    inputs: { version: 22.x }
  - script: npm ci && npm run build && npm test
  - task: AzureStaticWebApp@0
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    inputs:
      app_location: _site
      skip_app_build: true
      azure_static_web_apps_api_token: $(SWA_DEPLOYMENT_TOKEN)
```

PRs build and test only; `main` builds, tests and deploys. Exact syntax is settled in the C8 spec.

### 10.3 Cut-over (C11)

1. Rename GitHub default branch `master` to `main`, merge the migration branch.
2. Pipeline deploys to the SWA's `*.azurestaticapps.net` URL. Run the URL parity and visual tests against it.
3. In SWA, add custom domain `ste-pam.com` (TXT validation). In Cloudflare, point the apex at the SWA hostname (CNAME, flattened). Set the proxy to DNS-only during validation, then decide whether to keep Cloudflare proxying on.
4. `www.ste-pam.com` is not in use, so no `www` binding is needed.
5. Re-run the parity tests against `https://ste-pam.com`.
6. Submit `/sitemap.xml` in Google Search Console.
7. After a cooling-off period, decommission: App Service, SQL database, storage account `stepam`, App Insights, the old ADO release pipeline, and the hcti.io and Twitter API credentials.

Rollback: until step 7, switch the Cloudflare record back to the App Service.

---

## 11. Verification strategy

Every chunk's spec will carry acceptance criteria. Three automated checks cover the whole migration:

| Check | What it proves |
| --- | --- |
| **URL parity** (`tests/urls.spec.mjs`) | Every URL in `docs/baseline/urls.json` (the 64 sitemap URLs, `/about`, `/contact`, `/sitemap`, `/not-found`, legacy redirects) returns the expected status and location from the built site |
| **Link and asset check** (`tests/links.spec.mjs`) | No internal link, image, stylesheet or sprite reference in `_site` points to a missing file |
| **Visual diff** (`tests/visual.spec.mjs`) | Built pages match `docs/baseline/*.png` within a tolerance at 1366px and 390px, with known exclusions (Work removed, footer credit, embeds) |

The baseline (`urls.json`, `live.min.css`, live HTML snapshots) is captured once in C9 so tests never depend on the old site staying up.

---

## 12. Work chunks

Each chunk is sized for one agent session with no prior context: a clear input, a bounded set of files, and its own acceptance checks. Phase 3 turns each into a spec.

| ID | Chunk | Scope | Depends on | Size |
| --- | --- | --- | --- | --- |
| **C0** | Clean slate | Delete `Tranquility.CMS/`, `Tranquility.sln`, old `.gitignore`/`.gitattributes` rules; new README. (Archive branch already done) | none | S |
| **C1** | Eleventy scaffold | `package.json` with pinned deps, `.nvmrc`, `eleventy.config.js`, `src/` skeleton, `site.json`, passthrough copy, npm scripts, empty base layout, a smoke test | C0 | S |
| **C2** | Styles and static assets | Move SCSS, fix imports, pin Bootstrap beta.2, Sass + autoprefixer + minify to `/a/dist/css/ste-pam.min.css`; copy images, sprite, favicons, `/old`; CSS parity test | C1 | M |
| **C3** | Layouts and partials | `base`, `page`, `article` layouts; meta, nav, footer, hero-style, article-summary partials; `/blog` list, `/sitemap` page; old-article and date filters; collections. Ported from the live HTML in `docs/baseline/html/` | C1 | L |
| **C4** | Media and hero crops | Download the 13 media files; `eleventy-img` shortcode for 5 hero crops with focal points; per-page `<style>` output | C1 | M |
| **C5** | Static pages | Home, About, Contact, Not Found from live copy, with D9/D11 edits (CV links, typo); remove Work from nav/footer | C3, C4 | S |
| **C6** | OG images | Satori + resvg card, font, per-page generation, absolute `og:image`/`twitter:image`, caching | C3 | M |
| **C7** | Routing and SEO | `redirects.json`, `build-swa-config.mjs`, `staticwebapp.config.json` (trailing slash, redirects, 404, headers, MIME), `/sitemap.xml`, `robots.txt` | C1 (finalised after C5) | S |
| **C8** | Infra and pipeline | `infra/main.bicep`, `infra/README.md`, `azure-pipelines.yml`, setup notes for ADO (GitHub connection, secret variable, schedule) | C1 | M |
| **C9** | Baseline and test harness | Capture `docs/baseline/urls.json`, `live.min.css`, HTML snapshots of every page; write URL parity, link check and visual diff tests; wire `npm test` | C1 | M |
| **C10** | Content conversion | `scripts/convert-live.mjs`, convert all articles, download inline media, D11 link fixes, migration report, full test run green | C3, C4, C9 (+ your step in 8.2) | L |
| **C11** | Cut-over runbook | Checklist and commands for branch rename, SWA domain, Cloudflare, Search Console, decommission and rollback. Mostly your actions; the agent prepares and verifies | All | S |

### Dependency graph and parallel waves

```
C0 ──> C1 ──┬──> C2 ─────────────────────────────┐
            ├──> C3 ──┬──> C5 ──> C7 (finalise) ──┤
            │         ├──> C6                     │
            ├──> C4 ──┘                           ├──> C10 ──> C11
            ├──> C8                               │
            └──> C9 ──────────────────────────────┘
```

| Wave | Chunks (run in parallel) |
| --- | --- |
| 1 | C0 |
| 2 | C1 |
| 3 | C2, C3, C4, C8, C9 |
| 4 | C5, C6, C7 |
| 5 | C10 (after your Umbraco template step) |
| 6 | C11 |

C9 captures the live HTML snapshots early, so C3 and C5 can port markup from files in the repo rather than the live site.

---

## 13. Phase 3 and 4 setup

- **Specs**: one file per chunk in `docs/specs/C{n}-{name}.md`, each with context, inputs, exact file list, steps with code for the tricky parts, and acceptance criteria written as checks a verifier can run.
- **Subagents** (`.claude/agents/`):
  - `spec-implementer`: given one spec path, implements it on the migration branch, runs the spec's checks, commits.
  - `spec-verifier`: given one spec path, checks out the result with no implementation context, runs every acceptance criterion, and reports pass/fail per criterion with evidence. Read-only except for test output.
- **Phase 4** runs each wave's chunks in parallel through `spec-implementer`, then `spec-verifier` on each, before starting the next wave.

---

## 14. Risks and open items

| Risk | Mitigation |
| --- | --- |
| Live site goes down before C9 captures the baseline | C9 runs in wave 3; HTML for 53 pages is already saved from Phase 1 and can be committed early if needed |
| Template assignment in Umbraco doesn't fix the 13 articles | Manual copy from the back office into Markdown (section 8.2) |
| Satori font differs from current OG look | Accepted; only 4 hcti.io cards exist today |
| SWA trailing-slash/extensionless behaviour differs from expectations | Verified in C7 with the SWA CLI emulator, and again on the preview URL before DNS switch |
| Cloudflare proxy interferes with SWA domain validation | Use DNS-only during validation (C11) |
| Visual diff noise from third-party embeds and fonts | Mask embed regions; tolerance set per page in C9 |

Open items: none. Pagination removal, the `master` to `main` rename and no `www` host are confirmed.
