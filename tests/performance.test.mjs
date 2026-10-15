// Checks the built pages load images and CSS efficiently. Run `npm run build` first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { sourceFor } from "../config/images.js";

const SITE = "_site";
const load = (file) => cheerio.load(readFileSync(path.join(SITE, file), "utf8"));

function allHtml(dir = SITE) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return allHtml(p);
    return d.name.endsWith(".html") ? [p] : [];
  });
}

test("sourceFor: maps published image URLs to source files", () => {
  assert.equal(sourceFor("/old/thai.jpg"), "src/old/thai.jpg");
  assert.equal(sourceFor("/media/1059/chrome-network-requests.jpg"), "src/media/1059/chrome-network-requests.jpg");
  assert.equal(sourceFor("/a/dist/img/t2t.png"), "src/assets/img/t2t.png");
  assert.equal(sourceFor("/old/Stephen%20Pammenter%20-%20CV.jpg"), "src/old/Stephen Pammenter - CV.jpg");
  assert.equal(sourceFor("/old/DiamondProblem.svg"), null);
  assert.equal(sourceFor("https://example.com/a.jpg"), null);
});

test("images: every <img> lazy loads and decodes async", () => {
  for (const file of allHtml()) {
    const $ = cheerio.load(readFileSync(file, "utf8"));
    $("img").each((_, img) => {
      assert.equal($(img).attr("loading"), "lazy", `${file}: ${$(img).attr("src")}`);
      assert.equal($(img).attr("decoding"), "async", `${file}: ${$(img).attr("src")}`);
    });
  }
});

test("images: no lazyload script or data-src left", () => {
  for (const file of allHtml()) {
    const html = readFileSync(file, "utf8");
    assert.ok(!html.includes("vanilla-lazyload"), file);
    assert.ok(!/<img[^>]*data-src=/.test(html), file);
  }
});

test("images: local photos get a published WebP source and keep the original as fallback", () => {
  const $ = load("blog/thai-lime-ginger-and-prawn-stir-fry/index.html");
  const pictures = $("picture");
  assert.ok(pictures.length >= 2);
  pictures.each((_, el) => {
    const webp = $(el).find('source[type="image/webp"]').attr("srcset");
    const img = $(el).find("img").attr("src");
    assert.match(webp, /\.webp$/);
    assert.ok(existsSync(path.join(SITE, decodeURI(webp))), webp);
    assert.ok(existsSync(path.join(SITE, decodeURI(img))), img);
  });
  const prep = $('img[src="/old/thai-prep.jpg"]');
  assert.equal(prep.attr("width"), "609");
  assert.match(prep.attr("height"), /^\d+$/);
});

test("critical CSS: inlined in <head>, full stylesheet loads without blocking", () => {
  for (const file of ["index.html", "blog/sass-loops/index.html"]) {
    const $ = load(file);
    assert.ok($("head > style").text().includes(".hero{"), file);
    const link = $('head > link[href^="/a/dist/css/ste-pam.min.css"]');
    assert.equal(link.attr("media"), "print", file);
    assert.equal(link.attr("onload"), "this.media='all'", file);
    assert.match($("head noscript").html(), /ste-pam\.min\.css/, file);
    assert.equal($("html").attr("data-beasties-container"), undefined, file);
  }
});
