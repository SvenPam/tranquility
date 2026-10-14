import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import * as cheerio from "cheerio";
import { cardFromHtml } from "../config/og.js";
import { renderCard } from "../scripts/lib/og-card.mjs";

const SITE = "_site";
const ORIGIN = "https://ste-pam.com";

async function assertCard(file) {
  assert.ok(existsSync(file), `missing ${file}`);
  const meta = await sharp(file).metadata();
  assert.equal(meta.format, "png", `${file} is not a PNG`);
  assert.equal(meta.width, 1200, `${file} width`);
  assert.equal(meta.height, 630, `${file} height`);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => path.join(e.parentPath ?? e.path, e.name));
}

test("cardFromHtml reads title, tags and date from an article", () => {
  const live = readFileSync("docs/baseline/live/pages/blog/lifes-better-with-bem.html", "utf8");
  const $ = cheerio.load(live);
  $('meta[property="og:image"]').attr("content", `${ORIGIN}/og/blog/lifes-better-with-bem.png`);
  const card = cardFromHtml($.html());
  assert.ok(card);
  assert.equal(card.ogPath, "/og/blog/lifes-better-with-bem.png");
  assert.equal(card.title, "Life's better with BEM");
  assert.deepEqual(card.tags, []);
  assert.equal(card.date, "20-Nov-2018");
});

test("cardFromHtml reads tags and an ISO date from rendered article markup", () => {
  const page = `<html><head>
    <meta property="og:title" content="Some article | Stephen Pammenter" />
    <meta property="og:description" content="A description" />
    <meta property="og:image" content="${ORIGIN}/og/blog/some-article.png" />
  </head><body><article class="section"><header>
    <h1 class="lead"><a class="h2" href="/blog/some-article">Some article</a></h1>
    <div class="section__meta"><span>Ste Pammenter // <span class="tag">front-end</span> <span class="tag">methodology</span></span>
    <time datetime="2019-07-24T15:22:06Z">24-Jul-19</time></div>
  </header></article></body></html>`;
  assert.deepEqual(cardFromHtml(page), {
    ogPath: "/og/blog/some-article.png",
    title: "Some article",
    description: "A description",
    tags: ["front-end", "methodology"],
    date: "24-Jul-2019",
  });
});

test("cardFromHtml uses og:title without the site suffix on non-articles", () => {
  const page = `<meta property="og:title" content="Blog | Stephen Pammenter" />
    <meta property="og:description" content="" />
    <meta property="og:image" content="${ORIGIN}/og/blog.png" />`;
  const card = cardFromHtml(page);
  assert.equal(card.title, "Blog");
  assert.equal(card.description, "");
  assert.deepEqual(card.tags, []);
  assert.equal(card.date, "");
});

test("cardFromHtml returns null for an og:image outside /og/", () => {
  assert.equal(cardFromHtml(`<meta property="og:image" content="${ORIGIN}/media/1234/cover.jpg" />`), null);
  assert.equal(cardFromHtml(`<meta property="og:image" content="https://example.com/og/x.png" />`), null);
  assert.equal(cardFromHtml(`<p>no meta</p>`), null);
});

test("renderCard returns a 1200x630 PNG", async () => {
  const png = await renderCard({
    title: "Life's better with BEM",
    description: "Utilising the BEM style methodology",
    tags: ["front-end", "methodology"],
    date: "20-Nov-2018",
  });
  const meta = await sharp(png).metadata();
  assert.equal(meta.format, "png");
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
});

test("every built page has its generated OG card", async () => {
  assert.ok(existsSync(SITE), "run `npm run build` first");
  const covered = new Set();
  for (const file of htmlFiles(SITE)) {
    const og = cheerio.load(readFileSync(file, "utf8"))('meta[property="og:image"]').attr("content") ?? "";
    if (!og.startsWith(`${ORIGIN}/og/`)) continue;
    const ogPath = og.slice(ORIGIN.length);
    await assertCard(path.join(SITE, ogPath));
    covered.add(ogPath);
  }
  for (const required of ["/og/index.png", "/og/blog/sass-loops.png"]) {
    assert.ok(covered.has(required), `${required} not generated`);
  }
});

test("the Not Found page has its OG card", { skip: !existsSync("src/not-found.njk") && "no Not Found page in src" }, async () => {
  await assertCard(path.join(SITE, "og/not-found.png"));
});
