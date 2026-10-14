import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const INDEX = "_site/index.html";

test("build writes _site/index.html", () => {
  assert.ok(existsSync(INDEX), `${INDEX} is missing; run npm run build first`);
});

test("index.html declares en-gb", () => {
  assert.match(readFileSync(INDEX, "utf8"), /<html lang="en-gb">/);
});
