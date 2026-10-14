// Compares the built static pages with the live HTML snapshots. Run
// `npm run build` first.
import { test } from "node:test";
import assert from "node:assert/strict";
import { load, normalise } from "./lib/html.mjs";

const SNAPSHOTS = "docs/baseline/live/pages";

// Deliberate differences from the live pages, applied to the snapshot before
// comparing. `text` edits apply to the text of <main>, `hrefs` to link targets.
const PAGES = [
  {
    name: "Home",
    built: "_site/index.html",
    snapshot: `${SNAPSHOTS}/index.html`,
    heroImage: "/media/1058/mountains.jpg",
    spacer: false,
  },
  {
    name: "About",
    built: "_site/about/index.html",
    snapshot: `${SNAPSHOTS}/about.html`,
    heroImage: "/media/1052/5.jpg",
    spacer: true,
    text: [["stackoverflow.com/cv/spammenter", "ste-pam.com/cv"]],
    hrefs: [["//stackoverflow.com/cv/spammenter", "/cv"]],
  },
  {
    name: "Contact",
    built: "_site/contact/index.html",
    snapshot: `${SNAPSHOTS}/contact.html`,
    heroImage: "/media/1055/4.jpg",
    spacer: false,
    hrefs: [["//twiter.com/svenpam", "//twitter.com/svenpam"]],
  },
  {
    name: "Not Found",
    built: "_site/not-found/index.html",
    snapshot: `${SNAPSHOTS}/not-found.html`,
    heroImage: null,
    spacer: false,
  },
];

const hrefs = ($) => $("main a[href]").map((_, el) => $(el).attr("href")).get();

for (const page of PAGES) {
  const built = load(page.built);
  const live = load(page.snapshot);

  test(`${page.name}: main text matches the live page`, () => {
    let expected = normalise(live("main").text());
    for (const [from, to] of page.text ?? []) {
      assert.ok(expected.includes(from), `snapshot should contain "${from}"`);
      expected = expected.replaceAll(from, to);
    }
    assert.equal(normalise(built("main").text()), expected);
  });

  test(`${page.name}: links in main match the live page`, () => {
    const expected = hrefs(live).map((href) => {
      const edit = (page.hrefs ?? []).find(([from]) => from === href);
      return edit ? edit[1] : href;
    });
    for (const [from] of page.hrefs ?? []) {
      assert.ok(hrefs(live).includes(from), `snapshot should link to "${from}"`);
    }
    assert.deepEqual(hrefs(built), expected);
  });

  test(`${page.name}: title, description and hero match the live page`, () => {
    assert.equal(built("title").text(), live("title").text());
    assert.equal(
      built('meta[name="description"]').attr("content"),
      live('meta[name="description"]').attr("content"),
    );
    assert.equal(built("section.hero").attr("class"), live("section.hero").attr("class"));
    assert.equal(
      normalise(built(".hero__title").text()),
      normalise(live(".hero__title").text()),
    );
    assert.equal(built(".hero__subtitle").length, live(".hero__subtitle").length);
    assert.equal(
      normalise(built(".hero__subtitle").text()),
      normalise(live(".hero__subtitle").text()),
    );
  });

  test(`${page.name}: leading spacer ${page.spacer ? "present" : "absent"}`, () => {
    const first = built(".sections").children().first();
    const isSpacer =
      first.prop("tagName") === "DIV" &&
      first.attr("class") === undefined &&
      first.html().trim() === "";
    assert.equal(isSpacer, page.spacer);
  });

  test(`${page.name}: hero background ${page.heroImage ? "uses the page image" : "is the default"}`, () => {
    const css = built("head style")
      .map((_, el) => built(el).text())
      .get()
      .join("\n");
    const urls = [...css.matchAll(/background-image:\s*url\(\s*(['"]?)(.*?)\1\s*\)/g)].map(
      (m) => m[2],
    );
    if (page.heroImage) {
      assert.deepEqual(urls, [page.heroImage]);
    } else {
      assert.deepEqual(urls, []);
    }
  });
}
