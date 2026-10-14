// Unit tests for the live-to-Markdown converter library.
import { test } from "node:test";
import assert from "node:assert/strict";
import matter from "gray-matter";
import * as cheerio from "cheerio";
import markdownIt from "markdown-it";
import { rewriteUrl, rewriteSrcset } from "../scripts/lib/convert/urls.mjs";
import { parseLiveDate, serialiseFrontMatter, extractFrontMatter } from "../scripts/lib/convert/front-matter.mjs";
import { preprocessBody, toMarkdown } from "../scripts/lib/convert/body.mjs";

const OLD = new Map([
  ["thai.jpg", "thai.jpg"],
  ["class1.jpg", "Class1.jpg"],
  ["miruscreen2.png", "miruscreen2.png"],
  ["page-speed-screen.jpg", "page-speed-screen.jpg"],
]);

const render = (md) => markdownIt({ html: true }).render(md);

test("rewrites the site's own origin to a path", () => {
  for (const u of ["https://ste-pam.com/blog/x", "http://ste-pam.com/blog/x", "//ste-pam.com/blog/x"]) {
    assert.equal(rewriteUrl(u, OLD).url, "/blog/x", u);
  }
  assert.equal(rewriteUrl("https://ste-pam.com", OLD).url, "/");
});

test("maps /Areas/ste_pam/Uploads to /old", () => {
  assert.equal(rewriteUrl("/Areas/ste_pam/Uploads/thai.jpg", OLD).url, "/old/thai.jpg");
  assert.equal(rewriteUrl("https://ste-pam.com/Areas/ste_pam/Uploads/thai.jpg", OLD).url, "/old/thai.jpg");
});

test("maps /res and /Content/img to the matching /old file, ignoring case", () => {
  assert.deepEqual(rewriteUrl("https://ste-pam.com/res/class1.jpg", OLD), { url: "/old/Class1.jpg" });
  assert.deepEqual(rewriteUrl("/Content/img/page-speed-screen.jpg", OLD), { url: "/old/page-speed-screen.jpg" });
  assert.deepEqual(rewriteUrl("/res/MiruScreen1.jpg", OLD), { url: "/old/MiruSccreen1.jpg" });
});

test("leaves unmatched /res and /Content/img paths with a warning", () => {
  const res = rewriteUrl("https://ste-pam.com/res/hull.jpg", OLD);
  assert.equal(res.url, "/res/hull.jpg");
  assert.match(res.warning, /hull\.jpg/);
  const content = rewriteUrl("https://ste-pam.com/Content/img/walking2.jpg", OLD);
  assert.equal(content.url, "/Content/img/walking2.jpg");
  assert.ok(content.warning);
});

test("drops the query from /media paths", () => {
  assert.equal(rewriteUrl("/media/1061/atomic-design-process.png?width=1020&mode=max", OLD).url, "/media/1061/atomic-design-process.png");
  assert.equal(rewriteUrl("/media/1065/a.jpg", OLD).url, "/media/1065/a.jpg");
});

test("leaves external URLs alone", () => {
  for (const u of ["https://codepen.io/anon/pen/KrXPKE", "//twitter.com/svenpam", "mailto:a@b.c", "https://www.ste-pam.community/x"]) {
    assert.equal(rewriteUrl(u, OLD).url, u);
  }
});

test("rewrites every srcset candidate", () => {
  const { value } = rewriteSrcset("/media/1/a.png?width=286 322w, /media/1/a.png?width=540&mode=max 576w", OLD);
  assert.equal(value, "/media/1/a.png 322w, /media/1/a.png 576w");
});

test("parses the live date format as written", () => {
  assert.equal(parseLiveDate("23/04/2017 15:46:11"), "2017-04-23T15:46:11");
  assert.throws(() => parseLiveDate("2017-04-23"));
});

test("front matter round-trips through gray-matter, emoji included", () => {
  const fm = {
    title: 'Life\'s "better" with BEM',
    description: "Get strong \u{1F4AA}: with: colons",
    date: "2018-11-05T10:00:00",
    topic: "Guide",
    tags: ["front-end", "svg"],
    theme: "dark",
  };
  const text = serialiseFrontMatter(fm);
  assert.equal(
    text.split("\n").map((l) => l.split(":")[0]).join(","),
    "---,title,description,date,topic,tags,theme,---",
  );
  const { data } = matter(`${text}\n\nbody\n`);
  assert.equal(data.title, fm.title);
  assert.equal(data.description, fm.description);
  assert.deepEqual(data.tags, fm.tags);
  assert.equal(data.theme, "dark");
  assert.ok(data.date instanceof Date);
  assert.equal(data.date.toISOString(), "2018-11-05T10:00:00.000Z");
});

test("omits an empty theme", () => {
  const text = serialiseFrontMatter({ title: "T", description: "", date: "2017-01-01T00:00:00", topic: "None", tags: [] });
  assert.doesNotMatch(text, /theme/);
  assert.match(text, /^tags: \[\]$/m);
});

test("extracts header fields from a live article", () => {
  const $ = cheerio.load(`
    <section class="hero hero--dark"></section>
    <article class="section"><header>
      <h1 class="lead"><a class="h2" href="/blog/x">A &amp; B</a></h1>
      <p class="text-center">Guide</p>
      <p class="text-muted">
        Strong &#128170;  text
      </p>
      <div class="section__meta"><span> <span class="tag">svg</span> <span class="tag"></span></span>
      <time datetime="19/11/2018 15:32:58">19-Nov-18</time></div>
    </header></article>`);
  assert.deepEqual(extractFrontMatter($), {
    title: "A & B",
    description: "Strong \u{1F4AA} text",
    date: "2018-11-19T15:32:58",
    topic: "Guide",
    tags: ["svg"],
    theme: "dark",
  });
});

test("spacer paragraphs survive conversion", () => {
  const md = toMarkdown("<p>One</p>\n<p> </p>\n<p> </p>\n<p>Two</p>");
  assert.equal(md, "One\n\n<p>&nbsp;</p>\n\n<p>&nbsp;</p>\n\nTwo");
  assert.equal((render(md).match(/<p>&nbsp;<\/p>/g) ?? []).length, 2);
});

test("embeds and styled markup are kept as raw HTML", () => {
  const html =
    '<p class="codepen" data-slug-hash="RqxgvL"> </p>\n<p>\n<script async="" src="https://static.codepen.io/assets/embed/ei.js"></script>\n</p>\n' +
    '<p style="text-align: center;"><img src="/old/thai.jpg" alt="" width="705" /></p>';
  const out = render(toMarkdown(html));
  const $ = cheerio.load(out, null, false);
  assert.equal($("p.codepen").length, 1);
  assert.equal($("p > script[src]").length, 1);
  assert.equal($('p[style] > img[width="705"]').length, 1);
});

test("text that looks like Markdown or HTML stays text", () => {
  const out = render(toMarkdown("<p>1.</p><p>Use &lt;div&gt; &amp; *stars*</p>"));
  const $ = cheerio.load(out, null, false);
  assert.equal($("ol").length, 0);
  assert.equal($.text().replace(/\s+/g, " ").trim(), "1. Use <div> & *stars*");
});

test("lazy image holders keep only the bare data-src", () => {
  const $ = cheerio.load(
    `<div class="article section__content"><div class="row"><div class="col-12 col-md-12">
      <div class="article__img-holder" style="padding-bottom: 75%;">
        <img class="lazyload" sizes="auto" data-udi="umb://media/1"
          data-src="/media/1061/a.png?width=1020&amp;mode=max"
          data-srcset="/media/1061/a.png?width=286 322w" />
      </div></div></div></div>`,
  );
  const { html, media } = preprocessBody($, OLD);
  const img = cheerio.load(html, null, false)("img");
  assert.equal(img.attr("data-src"), "/media/1061/a.png");
  assert.equal(img.attr("data-srcset"), undefined);
  assert.equal(img.attr("sizes"), undefined);
  assert.equal(img.attr("data-udi"), undefined);
  assert.deepEqual(media, ["/media/1061/a.png"]);
});
