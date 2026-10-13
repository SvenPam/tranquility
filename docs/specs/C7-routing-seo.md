# C7: Routing and SEO

Wave 5 · Depends on: C5, C9 (runs alongside C10) · Size: S

## Goal

Generate `staticwebapp.config.json` (trailing slashes, legacy redirects, 404 handling, cache headers), an XML sitemap at `/sitemap.xml`, and `robots.txt`.

## Read first

- `docs/specs/README.md` (3.2 URLs)
- `docs/phase-2-plan.md` section 9 (routing table)
- `docs/phase-1-discovery.md` section 4 (URL inventory)

## Owns

`src/_data/redirects.json`, `config/swa.js`, `src/sitemap.xml.njk`, `src/robots.txt.njk`, `tests/swa-config.test.mjs`, `tests/sitemap-xml.test.mjs`.

## Background: Static Web Apps routing constraints

- Routes match on **path only**. Query strings are ignored, so `/blog?page=2` and `/sitemap?xml=true` can't be special-cased. They will serve `/blog` and `/sitemap`; that's accepted.
- Redirect targets **can't use wildcard captures** (no `/blog/article/*` to `/blog/$1`). Legacy prefix redirects must be expanded into one route per known file or slug. They're generated at build time from what's actually in `_site`, so new articles are covered automatically.
- `trailingSlash: "never"` redirects `/about/` to `/about` (301) and should serve `/about` from `about/index.html`. **Verify this with the SWA CLI emulator** (step 5). If it doesn't behave that way, stop and report; don't change other chunks' permalinks.
- The config file has a size limit (keep it under 20 KB).

## Steps

### 1. `src/_data/redirects.json`

Hand-maintained redirects. Generated ones are added by `config/swa.js`.

```json
{
  "routes": [
    { "route": "/cv", "redirect": "https://www.linkedin.com/in/spammenter/", "statusCode": 302 },
    { "route": "/cv/*", "redirect": "https://www.linkedin.com/in/spammenter/", "statusCode": 302 },
    { "route": "/work", "redirect": "/about", "statusCode": 302 }
  ],
  "oldAliases": {
    "MiruScreen1.jpg": "MiruSccreen1.jpg"
  }
}
```

`/cv` and `/work` are **302** (temporary): the owner plans a JSON Resume CV at `/cv` later.

### 2. `config/swa.js`

In `eleventy.after`, write `_site/staticwebapp.config.json`:

```js
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function buildSwaConfig(outDir = "_site") {
  const manual = JSON.parse(await readFile("src/_data/redirects.json", "utf8"));
  const slugs = (await readdir(path.join(outDir, "blog"), { withFileTypes: true }).catch(() => []))
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const oldFiles = (await readdir("src/old")).sort();
  const enc = (f) => f.split("/").map(encodeURIComponent).join("/");
  const lower = new Map(oldFiles.map((f) => [f.toLowerCase(), f]));
  const aliasTarget = (f) => manual.oldAliases[f] ?? lower.get(f.toLowerCase());

  const routes = [
    ...manual.routes,
    // /blog/article/{slug} -> /blog/{slug}  (old URL scheme)
    ...slugs.map((s) => ({ route: `/blog/article/${s}`, redirect: `/blog/${s}`, statusCode: 301 })),
    // /Areas/ste_pam/Uploads/{file} -> /old/{file}  (old upload folder)
    ...oldFiles.map((f) => ({ route: `/Areas/ste_pam/Uploads/${enc(f)}`, redirect: `/old/${enc(f)}`, statusCode: 301 })),
    // /res/{file} -> /old/{file} where a matching file exists (fixes long-broken article images)
    ...[...new Set([...oldFiles, ...Object.keys(manual.oldAliases)])]
      .filter(aliasTarget)
      .map((f) => ({ route: `/res/${enc(f)}`, redirect: `/old/${enc(aliasTarget(f))}`, statusCode: 301 })),
    { route: "/a/dist/*", headers: { "cache-control": "public, max-age=604800" } },
    { route: "/media/*", headers: { "cache-control": "public, max-age=2592000" } },
    { route: "/old/*", headers: { "cache-control": "public, max-age=2592000" } },
    { route: "/og/*", headers: { "cache-control": "public, max-age=86400" } },
  ];

  const config = {
    trailingSlash: "never",
    routes,
    responseOverrides: {
      "404": { rewrite: "/not-found/index.html", statusCode: 404 },
    },
    globalHeaders: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    mimeTypes: { ".webmanifest": "application/manifest+json" },
  };
  const json = JSON.stringify(config, null, 2);
  await writeFile(path.join(outDir, "staticwebapp.config.json"), json);
  return config;
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", async ({ directories }) => {
    await buildSwaConfig(directories?.output ?? "_site");
  });
}
```

Check whether SWA matches routes against the encoded or decoded path for file names with spaces (e.g. `Stephen Pammenter - CV.pdf`) using the emulator; adjust `enc` if needed and say what you found.

### 3. `src/sitemap.xml.njk`

```njk
---
permalink: /sitemap.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{%- for item in collections.all | sort(false, false, "url") %}
{%- if item.outputPath and item.outputPath.endsWith(".html") %}
  <url>
    <loc>{{ item.url | absoluteUrl }}</loc>
{%- if item.data.topic %}
    <lastmod>{{ (item.data.updated or item.date) | dateIso }}</lastmod>
{%- endif %}
  </url>
{%- endif %}
{%- endfor %}
</urlset>
```

Only articles get `lastmod` (page dates would be file timestamps, which aren't meaningful). Not Found is excluded via `eleventyExcludeFromCollections` (C5). Each URL appears once (fixes the old sitemap's duplicates). If Nunjucks won't call `endsWith`, add a tiny filter inside `config/swa.js`.

### 4. `src/robots.txt.njk`

```njk
---
permalink: /robots.txt
eleventyExcludeFromCollections: true
---
User-agent: *
Allow: /

Sitemap: {{ site.url }}/sitemap.xml
```

### 5. Emulator check

```bash
npm run build
npx --yes @azure/static-web-apps-cli@2.0.10 start _site --port 4280 &
# wait for "Azure Static Web Apps emulator started"
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/about         # 200
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/about/        # 301 -> /about
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/blog/sass-loops
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/blog/article/sass-loops  # 301
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/cv             # 302 linkedin
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/work           # 302 /about
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://localhost:4280/res/Class1.jpg # 301 /old/Class1.jpg
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "http://localhost:4280/Areas/ste_pam/Uploads/Stephen%20Pammenter%20-%20CV.pdf"
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4280/nope                           # 404
curl -s http://localhost:4280/nope | grep -c "U2 is still looking"                            # 1
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:4280/blog?page=2"                  # 200
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4280/sitemap.xml                    # 200
TEST_MODE=http BASE_URL=http://localhost:4280 npm run test:remote
```

Put the full output in the report.

### 6. Tests

`tests/swa-config.test.mjs` (after build): the config parses; `trailingSlash` is `never`; the 404 override rewrites to a file that exists in `_site`; every `redirect` target that starts with `/` (and isn't a `/blog/` slug) exists in `_site`; there's a `/blog/article/{slug}` route for every `_site/blog/{slug}/`; no duplicate `route` values; file size under 20 KB.

`tests/sitemap-xml.test.mjs` (after build): `_site/sitemap.xml` is well-formed; contains `https://ste-pam.com/`, `/about`, `/blog`, `/contact`, `/sitemap` and one entry per article; contains no `not-found`, no duplicates, no trailing slashes (except the root); `_site/robots.txt` contains the `Sitemap:` line.

## Acceptance criteria

| ID | Criterion |
| --- | --- |
| AC1 | `_site/staticwebapp.config.json`, `_site/sitemap.xml` and `_site/robots.txt` are produced by `npm run build`. |
| AC2 | `tests/swa-config.test.mjs` and `tests/sitemap-xml.test.mjs` pass. |
| AC3 | The emulator results in step 5 match the expected comments for every line. |
| AC4 | `npm run test:remote` against the emulator passes its non-`[content]` tests. |
| AC5 | Adding a new article and rebuilding adds both its sitemap entry and its `/blog/article/{slug}` redirect with no other change. |

## Verify

```bash
npm run build && node --test tests/swa-config.test.mjs tests/sitemap-xml.test.mjs
wc -c _site/staticwebapp.config.json
```
Plus step 5.
