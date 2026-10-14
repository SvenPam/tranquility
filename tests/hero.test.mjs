import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { cropBox } from "../scripts/lib/crop.mjs";
import { heroStyle } from "../config/hero.js";

const SITE = "_site";

test("cropBox: default focus keeps aspect, full height, centred", () => {
  const b = cropBox(2000, 1000, 320, 411);
  assert.equal(b.top, 0);
  assert.equal(b.height, 1000);
  assert.ok(Math.abs(b.width - (1000 * 320) / 411) <= 1, `width ${b.width}`);
  assert.ok(Math.abs(b.left + b.width / 2 - 1000) <= 1, `left ${b.left}`);
});

test("cropBox: focus y=0 pins to top", () => {
  assert.equal(cropBox(2000, 1000, 1920, 489, { x: 0.5, y: 0 }).top, 0);
});

test("cropBox: focus y=1 pins to bottom", () => {
  const b = cropBox(2000, 1000, 1920, 489, { x: 0.5, y: 1 });
  assert.equal(b.top + b.height, 1000);
});

test("cropBox: focus x=0 and x=1 pin to the sides", () => {
  assert.equal(cropBox(2000, 1000, 320, 411, { x: 0, y: 0.5 }).left, 0);
  const b = cropBox(2000, 1000, 320, 411, { x: 1, y: 0.5 });
  assert.equal(b.left + b.width, 2000);
});

test("heroStyle: returns empty string without a source", async () => {
  assert.equal(await heroStyle(""), "");
  assert.equal(await heroStyle(undefined), "");
});

test("heroStyle: emits five crops at the right sizes", async () => {
  const css = await heroStyle("/media/1058/mountains.jpg", undefined, SITE);
  assert.match(css, /^<style>/);
  assert.match(css, /<\/style>$/);
  const urls = [...css.matchAll(/background-image: url\('([^']+)'\)/g)].map((m) => m[1]);
  assert.equal(urls.length, 5);
  const queries = [...css.matchAll(/@media \(min-width: (\d+)px\)/g)].map((m) => Number(m[1]));
  assert.deepEqual(queries, [540, 720, 960, 1140]);
  const sizes = [[320, 411], [540, 385], [720, 370], [960, 389], [1920, 489]];
  for (const [i, url] of urls.entries()) {
    assert.ok(url.startsWith("/a/dist/hero/"), url);
    const file = path.join(SITE, url);
    const { width, height } = await sharp(file).metadata();
    assert.deepEqual([width, height], sizes[i], url);
  }
});

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

test("media files are copied byte-identical to _site/media", async () => {
  const files = await walk("src/media");
  assert.ok(files.length >= 13, `found ${files.length} media files`);
  for (const src of files) {
    const rel = path.relative("src/media", src);
    const dest = path.join(SITE, "media", rel);
    await access(dest);
    assert.ok((await readFile(src)).equals(await readFile(dest)), rel);
  }
});
