// Link and asset check: every internal reference in every built page points
// at a file, a configured redirect or a reference already known to be broken.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { SITE, resolveFile } from "./lib/site.mjs";
import { config as swaConfig, matchRoute } from "./lib/swa.mjs";
import { load, internalRefs } from "./lib/html.mjs";

const knownBroken = new Set(
  JSON.parse(readFileSync(new URL("./known-broken.json", import.meta.url), "utf8")),
);

// Redirect-only paths that are fine to link to before the routing config exists.
const REDIRECT_ONLY = new Set(["/cv", "/work"]);

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out.sort();
}

function pageUrl(file) {
  const rel = path.relative(SITE, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  return "/" + rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
}

function isRedirect(p) {
  if (swaConfig) return Boolean(matchRoute(p)?.redirect);
  return REDIRECT_ONLY.has(p);
}

const pages = existsSync(SITE)
  ? htmlFiles(SITE).map((file) => ({ file, url: pageUrl(file), refs: internalRefs(load(file)) }))
  : [];

test("built site has HTML pages", () => {
  assert.ok(pages.length > 0, `no HTML found in ${SITE}; run npm run build first`);
});

test("every internal reference resolves", () => {
  const failures = [];
  for (const page of pages) {
    for (const ref of page.refs) {
      if (resolveFile(ref)) continue;
      if (isRedirect(ref)) continue;
      if (knownBroken.has(ref)) continue;
      failures.push(`${page.url} -> ${ref}`);
    }
  }
  assert.deepEqual(failures, [], `${failures.length} broken internal reference(s):\n${failures.join("\n")}`);
});

test("no internal reference has a trailing slash", () => {
  const failures = [];
  for (const page of pages) {
    for (const ref of page.refs) {
      if (ref !== "/" && ref.endsWith("/")) failures.push(`${page.url} -> ${ref}`);
    }
  }
  assert.deepEqual(failures, [], `${failures.length} trailing-slash reference(s):\n${failures.join("\n")}`);
});
