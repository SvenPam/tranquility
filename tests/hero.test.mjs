import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import { heroStyle } from "../config/hero.js";

const SITE = "_site";

test("heroStyle: returns empty string without a source", async () => {
  assert.equal(await heroStyle(""), "");
  assert.equal(await heroStyle(undefined), "");
});

test("heroStyle: emits a single rule with the original image", async () => {
  const css = await heroStyle("/media/1058/mountains.jpg", undefined, SITE);
  assert.equal(
    css,
    "<style>\n    .hero { background-image: url('/media/1058/mountains.jpg'); }\n</style>",
  );
});

test("heroStyle: focus does not change the output", async () => {
  const plain = await heroStyle("/media/1052/5.jpg");
  const focused = await heroStyle("/media/1052/5.jpg", { x: 0.535, y: 0.63313609467455623 });
  assert.equal(focused, plain);
  assert.equal([...plain.matchAll(/background-image/g)].length, 1);
  assert.doesNotMatch(plain, /@media/);
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
