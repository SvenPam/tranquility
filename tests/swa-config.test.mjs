// Checks the generated staticwebapp.config.json (run `npm run build` first).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { SITE, resolveFile } from "./lib/site.mjs";
import { buildSwaConfig } from "../config/swa.js";

const FILE = path.join(SITE, "staticwebapp.config.json");
const raw = existsSync(FILE) ? readFileSync(FILE, "utf8") : null;
const config = raw ? JSON.parse(raw) : null;

const builtSlugs = () =>
  readdirSync(path.join(SITE, "blog"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

test("staticwebapp.config.json is built and parses", () => {
  assert.ok(raw, `${FILE} is missing`);
  assert.equal(typeof config, "object");
  assert.ok(Array.isArray(config.routes), "routes is not an array");
});

test("staticwebapp.config.json is under 20 KB", () => {
  const size = statSync(FILE).size;
  assert.ok(size < 20 * 1024, `config is ${size} bytes`);
});

test('trailingSlash is "never"', () => {
  assert.equal(config.trailingSlash, "never");
});

test("the 404 override rewrites to a built page with status 404", () => {
  const override = config.responseOverrides?.["404"];
  assert.ok(override?.rewrite, "responseOverrides.404.rewrite is not set");
  assert.equal(override.statusCode, 404);
  assert.ok(existsSync(path.join(SITE, override.rewrite)), `${override.rewrite} is not in ${SITE}`);
});

test("every local redirect target exists in the build", () => {
  const missing = config.routes
    .filter((r) => typeof r.redirect === "string" && r.redirect.startsWith("/"))
    .filter((r) => !resolveFile(r.redirect))
    .map((r) => `${r.route} -> ${r.redirect}`);
  assert.deepEqual(missing, []);
});

test("every built article has a /blog/article/{slug} redirect", () => {
  const routes = new Map(config.routes.map((r) => [r.route, r]));
  const slugs = builtSlugs();
  assert.ok(slugs.length > 0, "no articles in the build");
  for (const slug of slugs) {
    const r = routes.get(`/blog/article/${slug}`);
    assert.ok(r, `no route for /blog/article/${slug}`);
    assert.equal(r.redirect, `/blog/${slug}`);
    assert.equal(r.statusCode, 301);
  }
});

test("route values are unique (case-insensitive, as Static Web Apps matches)", () => {
  const seen = new Set();
  const dupes = [];
  for (const r of config.routes) {
    const key = r.route.toLowerCase();
    if (seen.has(key)) dupes.push(r.route);
    seen.add(key);
  }
  assert.deepEqual(dupes, []);
});

test("a newly built article gets its legacy redirect without other changes", async () => {
  const out = await mkdtemp(path.join(tmpdir(), "swa-"));
  try {
    for (const slug of [...builtSlugs(), "a-brand-new-article"]) {
      await mkdir(path.join(out, "blog", slug), { recursive: true });
    }
    await buildSwaConfig(out);
    const written = JSON.parse(await readFile(path.join(out, "staticwebapp.config.json"), "utf8"));
    const route = written.routes.find((r) => r.route === "/blog/article/a-brand-new-article");
    assert.deepEqual(route, {
      route: "/blog/article/a-brand-new-article",
      redirect: "/blog/a-brand-new-article",
      statusCode: 301,
    });
    assert.equal(written.routes.length, config.routes.length + 1);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("redirect routes are written decoded, because Azure matches the decoded path", () => {
  const encoded = (config.routes ?? []).filter((r) => /%[0-9a-f]{2}/i.test(r.route)).map((r) => r.route);
  assert.deepEqual(encoded, []);
});
