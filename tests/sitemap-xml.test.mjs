// Checks the generated /sitemap.xml and /robots.txt (run `npm run build` first).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { SITE } from "./lib/site.mjs";

const ORIGIN = "https://ste-pam.com";
const SITEMAP = path.join(SITE, "sitemap.xml");
const ROBOTS = path.join(SITE, "robots.txt");
const xml = existsSync(SITEMAP) ? readFileSync(SITEMAP, "utf8") : "";

/**
 * Minimal well-formedness check: an XML declaration first, every element
 * closed in order, a single root, no stray text outside it and no bare `&`.
 */
function checkWellFormed(text) {
  assert.match(text, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, "missing XML declaration");
  const body = text.replace(/^<\?xml[^?]*\?>/, "");
  assert.doesNotMatch(body, /&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);)/i, "unescaped &");
  const stack = [];
  let roots = 0;
  const tag = /<(\/?)([A-Za-z_][\w.:-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>/g;
  let last = 0;
  let m;
  while ((m = tag.exec(body))) {
    const between = body.slice(last, m.index);
    assert.ok(!between.includes("<") && !between.includes(">"), `malformed markup near: ${between.trim().slice(0, 60)}`);
    if (stack.length === 0) assert.equal(between.trim(), "", "text outside the root element");
    last = tag.lastIndex;
    const [, closing, name, , selfClosing] = m;
    if (closing) {
      assert.equal(stack.pop(), name, `unexpected </${name}>`);
    } else if (!selfClosing) {
      if (stack.length === 0) roots += 1;
      stack.push(name);
    }
  }
  assert.equal(body.slice(last).trim(), "", "content after the root element");
  assert.deepEqual(stack, [], "unclosed elements");
  assert.equal(roots, 1, "expected exactly one root element");
}

const locs = () => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const articleSlugs = () =>
  readdirSync(path.join(SITE, "blog"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

test("sitemap.xml is built and well-formed", () => {
  assert.ok(xml, `${SITEMAP} is missing or empty`);
  checkWellFormed(xml);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
});

test("sitemap.xml lists the static pages", () => {
  const all = locs();
  for (const p of ["/", "/about", "/blog", "/contact", "/sitemap"]) {
    assert.ok(all.includes(ORIGIN + p), `missing ${ORIGIN + p}`);
  }
});

test("sitemap.xml has one entry with lastmod per article", () => {
  const all = locs();
  const slugs = articleSlugs();
  assert.ok(slugs.length > 0, "no articles in the build");
  for (const slug of slugs) {
    const loc = `${ORIGIN}/blog/${slug}`;
    assert.equal(all.filter((l) => l === loc).length, 1, `${loc} should appear once`);
    const entry = new RegExp(`<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z</lastmod>`);
    assert.match(xml, entry, `${loc} has no lastmod`);
  }
  const articleLocs = all.filter((l) => l.startsWith(`${ORIGIN}/blog/`));
  assert.equal(articleLocs.length, slugs.length, "unexpected /blog/ entries");
});

test("sitemap.xml has no not-found page, duplicates or trailing slashes", () => {
  const all = locs();
  assert.ok(!all.some((l) => l.includes("not-found")), "not-found is listed");
  assert.equal(new Set(all).size, all.length, "duplicate entries");
  const slashed = all.filter((l) => l !== `${ORIGIN}/` && l.endsWith("/"));
  assert.deepEqual(slashed, [], "entries with a trailing slash");
  assert.ok(all.every((l) => l.startsWith(`${ORIGIN}/`)), "entries outside the site origin");
});

test("robots.txt points at the XML sitemap", () => {
  assert.ok(existsSync(ROBOTS), `${ROBOTS} is missing`);
  const text = readFileSync(ROBOTS, "utf8");
  assert.match(text, /^Sitemap: https:\/\/ste-pam\.com\/sitemap\.xml$/m);
  assert.match(text, /^User-agent: \*$/m);
});
