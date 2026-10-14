// Checks the built layouts in _site. Run `npm run build` first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";

const SITE = "_site";
const read = (file) => readFileSync(path.join(SITE, file), "utf8");
const load = (file) => cheerio.load(read(file));

// Every article in src/blog, oldest first, so expectations follow the content.
const articlesAsc = readdirSync("src/blog")
  .filter((f) => f.endsWith(".md"))
  .map((f) => {
    const { data } = matter(readFileSync(path.join("src/blog", f), "utf8"));
    return { url: `/blog/${f.slice(0, -3)}`, title: data.title, date: data.date };
  })
  .sort((a, b) => a.date - b.date);

function allHtml(dir = SITE) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return allHtml(p);
    return d.name.endsWith(".html") ? [p] : [];
  });
}

test("article: nav has five items and no Work link", () => {
  const $ = load("blog/sass-loops/index.html");
  assert.equal($("nav#siteNav").length, 1);
  assert.equal($("nav#siteNav li.list__item").length, 5);
  assert.equal($('a[href="/work"]').length, 0);
});

test("article: leading spacer is the first child of .sections", () => {
  const $ = load("blog/sass-loops/index.html");
  const first = $(".sections").children().first();
  assert.equal(first.prop("tagName"), "DIV");
  assert.equal(first.html().trim(), "");
  assert.equal(first.attr("class"), undefined);
});

test("article: header card", () => {
  const $ = load("blog/sass-loops/index.html");
  const link = $("article.section header .lead a.h2");
  assert.equal(link.text(), "SASS Loops");
  assert.equal(link.attr("href"), "/blog/sass-loops");
  const time = $('time[datetime="2017-04-23T15:46:11Z"]');
  assert.equal(time.length, 1);
  assert.equal(time.text(), "23-Apr-17");
});

test("article: old article alert", () => {
  const $ = load("blog/sass-loops/index.html");
  assert.equal($(".alert.alert--old").length, 1);
});

test("article: pager links to the adjacent articles", () => {
  const $ = load("blog/sass-loops/index.html");
  const i = articlesAsc.findIndex((a) => a.url === "/blog/sass-loops");
  const older = articlesAsc[i - 1];
  const newer = articlesAsc[i + 1];
  assert.ok(older || newer, "sass-loops needs at least one neighbour");
  const olderLink = $(".pager a").filter((_, a) => $(a).text().includes("Older"));
  const newerLink = $(".pager a").filter((_, a) => $(a).text().includes("Newer"));
  assert.equal(olderLink.attr("href"), older?.url);
  assert.equal(newerLink.attr("href"), newer?.url);
});

test("article: no comments or analytics", () => {
  const html = read("blog/sass-loops/index.html");
  const $ = cheerio.load(html);
  assert.equal($("#disqus_thread").length, 0);
  assert.equal($("#comments").length, 0);
  assert.ok(!html.includes("google-analytics"));
});

test("article: title, canonical and og:image", () => {
  const $ = load("blog/sass-loops/index.html");
  assert.equal($("title").text(), "SASS Loops | Stephen Pammenter");
  assert.equal($('link[rel="canonical"]').attr("href"), "https://ste-pam.com/blog/sass-loops");
  assert.equal($('meta[property="og:image"]').attr("content"), "https://ste-pam.com/og/blog/sass-loops.png");
  assert.equal($('meta[name="twitter:image"]').attr("content"), "https://ste-pam.com/og/blog/sass-loops.png");
  assert.match(read("blog/sass-loops/index.html"), /<head>\s*<meta charset="utf-8" \/>/);
});

test("article: no Instagram script unless the body embeds Instagram", () => {
  assert.ok(!read("blog/sass-loops/index.html").includes("platform.instagram.com"));
});

test("article theme: hero modifier and Blog title", () => {
  const $ = load("blog/authentication-through-azure/index.html");
  assert.equal($("section.hero").attr("class"), "hero hero--dark");
  assert.equal($("section.hero .hero__title").text(), "Blog");
});

test("blog list: every article, newest first, no pager", () => {
  const $ = load("blog/index.html");
  const items = $("article.media");
  assert.equal(items.length, articlesAsc.length);
  assert.ok(items.length >= 2);
  const hrefs = items.map((_, el) => $(el).find("a.media__link").attr("href")).get();
  assert.deepEqual(hrefs, [...articlesAsc].reverse().map((a) => a.url));
  assert.equal($(".pagination").length, 0);
  assert.equal($(".sections").children().first().prop("tagName"), "SECTION");
});

test("sitemap: leading spacer and articles oldest first", () => {
  const $ = load("sitemap/index.html");
  const first = $(".sections").children().first();
  assert.equal(first.prop("tagName"), "DIV");
  assert.equal(first.html().trim(), "");
  const blogLi = $(".section__content > ul > li").filter((_, li) => $(li).children("a").attr("href") === "/blog");
  const hrefs = blogLi.find("ul a").map((_, a) => $(a).attr("href")).get();
  assert.deepEqual(hrefs, articlesAsc.map((a) => a.url));
});

test("footer: links, credit and copyright year", () => {
  const $ = load("blog/sass-loops/index.html");
  const footer = $("footer.section--footer");
  assert.equal(footer.find('a[href="/cv"]').length, 1);
  assert.equal(footer.find('a[href="https://stackoverflow.com/users/2818648/ste-pammenter"]').length >= 1, true);
  assert.match(footer.text(), /Built with Eleventy/);
  assert.match(footer.text(), new RegExp(`2012 - ${new Date().getUTCFullYear()}`));
});

test("internal links have no trailing slash", () => {
  for (const file of allHtml()) {
    const $ = cheerio.load(readFileSync(file, "utf8"));
    $("a[href]").each((_, a) => {
      const href = $(a).attr("href");
      if (href.startsWith("/") && !href.startsWith("//") && href !== "/") {
        assert.ok(!href.split(/[?#]/)[0].endsWith("/"), `${file}: ${href}`);
      }
    });
  }
});
