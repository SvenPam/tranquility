// URL parity: every expected URL resolves, redirects go to the right place and
// unknown URLs get the custom 404.
//
// TEST_MODE=static (default) checks the build output in _site and the generated
// staticwebapp.config.json. TEST_MODE=http with BASE_URL requests a deployed site.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolveFile } from "./lib/site.mjs";
import { config as swaConfig, matchRoute, ROUTING_SKIP } from "./lib/swa.mjs";

const expected = JSON.parse(readFileSync(new URL("./expected-urls.json", import.meta.url), "utf8"));
const blogUrls = () =>
  readdirSync("src/blog")
    .filter((f) => f.endsWith(".md"))
    .map((f) => `/blog/${f.slice(0, -3)}`);
const MODE = process.env.TEST_MODE === "http" ? "http" : "static";
const NOT_FOUND_TEXT = "U2 is still looking";

if (MODE === "http") {
  const BASE_URL = process.env.BASE_URL;
  if (!BASE_URL) throw new Error("TEST_MODE=http needs BASE_URL, e.g. https://ste-pam.com");
  const base = new URL(BASE_URL);

  const get = (p) =>
    fetch(new URL(p, base), { redirect: "manual", signal: AbortSignal.timeout(30_000) });

  // Same-origin URLs compare as path + query; anything else as the full URL.
  const comparable = (u) => {
    const url = new URL(u, base);
    return url.origin === base.origin ? url.pathname + url.search : url.href;
  };

  for (const p of expected.ok) {
    test(`ok ${p} returns 200`, async () => {
      const res = await get(p);
      await res.body?.cancel();
      assert.equal(res.status, 200, `${p} returned ${res.status}`);
    });
  }

  for (const p of blogUrls()) {
    test(`[content] ${p} returns 200`, async () => {
      const res = await get(p);
      await res.body?.cancel();
      assert.equal(res.status, 200, `${p} returned ${res.status}`);
    });
  }

  for (const r of expected.redirects) {
    test(`redirect ${r.from} -> ${r.to} (${r.status})`, async () => {
      const res = await get(r.from);
      await res.body?.cancel();
      assert.equal(res.status, r.status, `${r.from} returned ${res.status}`);
      const location = res.headers.get("location");
      assert.ok(location, `${r.from} has no Location header`);
      assert.equal(comparable(location), comparable(r.to));
    });
  }

  for (const p of expected.notFound) {
    test(`not found ${p} returns the custom 404`, async () => {
      const res = await get(p);
      const body = await res.text();
      assert.equal(res.status, 404, `${p} returned ${res.status}`);
      assert.ok(body.includes(NOT_FOUND_TEXT), `${p} body lacks "${NOT_FOUND_TEXT}"`);
    });
  }
} else {
  for (const p of expected.ok) {
    test(`ok ${p} is built`, () => {
      assert.ok(resolveFile(p), `no file in _site for ${p}`);
    });
  }

  for (const p of blogUrls()) {
    test(`[content] ${p} is built`, () => {
      assert.ok(resolveFile(p), `no file in _site for ${p}`);
    });
  }

  for (const r of expected.redirects) {
    test(`redirect ${r.from} -> ${r.to} (${r.status})`, (t) => {
      if (!swaConfig) return t.skip(ROUTING_SKIP);
      if (r.kind === "trailingSlash") {
        assert.equal(swaConfig.trailingSlash, "never", 'trailingSlash should be "never"');
        assert.ok(resolveFile(r.to), `no file in _site for ${r.to}`);
        return;
      }
      const route = matchRoute(r.from);
      assert.ok(route, `no route matches ${r.from}`);
      assert.equal(route.redirect, r.to, `route ${route.route} redirects elsewhere`);
      assert.equal(route.statusCode, r.status, `route ${route.route} has the wrong status`);
    });
  }

  for (const p of expected.notFound) {
    test(`not found ${p} has no file`, () => {
      assert.equal(resolveFile(p), null, `${p} unexpectedly resolves to a file`);
    });

    test(`not found ${p} is served the custom 404`, (t) => {
      if (!swaConfig) return t.skip(ROUTING_SKIP);
      const route = matchRoute(p);
      assert.ok(!route?.redirect, `${p} is redirected to ${route?.redirect}`);
      const override = swaConfig.responseOverrides?.["404"];
      assert.ok(override?.rewrite, "responseOverrides.404.rewrite is not set");
      assert.equal(override.statusCode ?? 404, 404, "404 override changes the status code");
      const file = resolveFile(override.rewrite);
      assert.ok(file, `404 rewrite target ${override.rewrite} is not built`);
      assert.ok(readFileSync(file, "utf8").includes(NOT_FOUND_TEXT), `404 page lacks "${NOT_FOUND_TEXT}"`);
    });
  }
}
