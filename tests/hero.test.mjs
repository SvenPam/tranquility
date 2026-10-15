import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { heroSeed, heroPrompt, heroTerrain } from "../config/hero.js";

const SITE = "_site";
const load = async (file) => cheerio.load(await readFile(path.join(SITE, file), "utf8"));

test("heroSeed: same URL, same terrain; different URLs differ", () => {
  assert.equal(heroSeed("/blog/sass-loops/"), heroSeed("/blog/sass-loops/"));
  assert.notEqual(heroSeed("/"), heroSeed("/blog/"));
  for (const url of ["/", "/about/", "/blog/sass-loops/"]) {
    const seed = heroSeed(url);
    assert.ok(Number.isInteger(seed) && seed >= 0 && seed < 10000, `${url}: ${seed}`);
  }
});

test("heroPrompt: commands by page", () => {
  assert.equal(heroPrompt("/"), "whoami");
  assert.equal(heroPrompt("/blog/"), "ls blog/");
  assert.equal(heroPrompt("/blog/sass-loops/"), "cat blog/sass-loops.md");
  assert.equal(heroPrompt("/somewhere/"), "cd ~/somewhere");
});

test("heroTerrain: inline SVG filter seeded as given", () => {
  const svg = heroTerrain(1234);
  assert.match(svg, /^<svg class="hero__terrain" aria-hidden="true"/);
  assert.match(svg, /<feTurbulence [^>]*seed="1234"/);
});

test("hero: no photo, seeded terrain and prompt on every page", async () => {
  for (const [file, url, prompt] of [
    ["index.html", "/", "whoami"],
    ["blog/index.html", "/blog/", "ls blog/"],
    ["blog/sass-loops/index.html", "/blog/sass-loops/", "cat blog/sass-loops.md"],
    ["contact/index.html", "/contact/", "./contact.sh"],
  ]) {
    const $ = await load(file);
    assert.equal($("section.hero").length, 1, file);
    assert.equal($("head style").text().includes("background-image:url('/media"), false, file);
    assert.equal($("section.hero [seed]").attr("seed"), String(heroSeed(url)), file);
    assert.equal($("section.hero .hero__prompt").text(), `ste@pam:~$ ${prompt}`, file);
  }
});

test("hero: the cursor blinks on the home page only", async () => {
  assert.ok((await load("index.html"))("section.hero").hasClass("hero--blink"));
  assert.ok(!(await load("blog/sass-loops/index.html"))("section.hero").hasClass("hero--blink"));
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
