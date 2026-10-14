import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveFile } from "./site.mjs";

let root;

function touch(rel) {
  const file = path.join(root, rel);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, "x");
  return file;
}

before(() => {
  root = mkdtempSync(path.join(tmpdir(), "resolve-file-"));
  touch("index.html");
  touch("about/index.html");
  touch("a/dist/css/ste-pam.min.css");
  touch("old/Stephen Pammenter - CV.pdf");
});

after(() => {
  rmSync(root, { recursive: true, force: true });
});

test("resolveFile: / serves index.html", () => {
  assert.equal(resolveFile("/", root), path.join(root, "index.html"));
});

test("resolveFile: /about serves about/index.html", () => {
  assert.equal(resolveFile("/about", root), path.join(root, "about/index.html"));
});

test("resolveFile: /about/ serves about/index.html", () => {
  assert.equal(resolveFile("/about/", root), path.join(root, "about/index.html"));
});

test("resolveFile: a stylesheet resolves to itself", () => {
  assert.equal(
    resolveFile("/a/dist/css/ste-pam.min.css", root),
    path.join(root, "a/dist/css/ste-pam.min.css"),
  );
});

test("resolveFile: percent-encoded names are decoded", () => {
  assert.equal(
    resolveFile("/old/Stephen%20Pammenter%20-%20CV.pdf", root),
    path.join(root, "old/Stephen Pammenter - CV.pdf"),
  );
});

test("resolveFile: query and fragment are ignored", () => {
  assert.equal(resolveFile("/about?x=1#top", root), path.join(root, "about/index.html"));
});

test("resolveFile: a missing path gives null", () => {
  assert.equal(resolveFile("/this-does-not-exist", root), null);
  assert.equal(resolveFile("/a/dist/css/missing.css", root), null);
});

test("resolveFile: paths outside the root give null", () => {
  assert.equal(resolveFile("/../../etc/passwd", root), null);
  assert.equal(resolveFile("/%2e%2e/%2e%2e/etc/passwd", root), null);
});
