import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const OUT = "_site";

const REQUIRED = [
  "a/dist/css/ste-pam.min.css",
  "a/dist/img/generic/2.jpg",
  "a/dist/img/generic/2-100.jpg",
  "a/dist/img/js-logo.svg",
  "a/dist/img/social/twitter.svg",
  "a/dist/sprites/sprite.svg",
  "old/thai.jpg",
  "old/Stephen Pammenter - CV.pdf",
  "old/MiruSccreen1.jpg",
  "favicon.ico",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "apple-touch-icon.png",
  "android-chrome-192x192.png",
  "android-chrome-384x384.png",
  "mstile-150x150.png",
  "manifest.json",
  "browserconfig.xml",
];

for (const file of REQUIRED) {
  test(`publishes /${file}`, () => {
    assert.ok(existsSync(path.join(OUT, file)), `${OUT}/${file} is missing`);
  });
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

test("every theme image is copied byte for byte to /a/dist/img", () => {
  const srcDir = "src/assets/img";
  const files = walk(srcDir);
  assert.ok(files.length > 0, `${srcDir} is empty`);
  for (const file of files) {
    const rel = path.relative(srcDir, file);
    const copy = path.join(OUT, "a/dist/img", rel);
    assert.ok(existsSync(copy), `${copy} is missing`);
    assert.ok(readFileSync(file).equals(readFileSync(copy)), `${copy} differs from ${file}`);
  }
});
