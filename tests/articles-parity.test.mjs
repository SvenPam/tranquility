// Article content parity: each built article matches its live snapshot in
// header, body text, images, links, embeds and hero theme. All tests need the
// full article set, so they are tagged [content].
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveFile } from "./lib/site.mjs";
import { load, text, normalise, toInternalPath } from "./lib/html.mjs";
import { articles, blogUrls, snapshotPath, mapLegacyPath } from "./lib/baseline.mjs";

const BODY = ".article .row > .col-12";
const EMBEDS = "iframe, script[src], .codepen, .instagram-media";

function safeDecode(s) {
  try {
    return decodeURI(s);
  } catch {
    return s;
  }
}

/** Normalises a body URL so live and built references can be compared. */
function comparableUrl(raw) {
  return safeDecode(mapLegacyPath(String(raw ?? "").trim()));
}

function header($) {
  return {
    title: text($, "header .lead a"),
    topic: text($, "header p.text-center"),
    description: text($, "header p.text-muted"),
    date: text($, "header time"),
    tags: $("header .tag")
      .map((_, el) => normalise($(el).text()))
      .get()
      .filter(Boolean),
  };
}

function body($) {
  const root = $(BODY);
  return {
    text: text($, BODY),
    images: root
      .find("img")
      .map((_, el) => comparableUrl($(el).attr("data-src") ?? $(el).attr("src")))
      .get(),
    links: root
      .find("a[href]")
      .map((_, el) => comparableUrl($(el).attr("href")))
      .get(),
    embeds: root.find(EMBEDS).length,
  };
}

/** Short description of where two strings first differ. */
function textDiff(a, b) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const from = Math.max(0, i - 20);
  return (
    `text differs at character ${i}\n` +
    `  live:  ${JSON.stringify(a.slice(from, from + 200))}\n` +
    `  built: ${JSON.stringify(b.slice(from, from + 200))}`
  );
}

/** Short description of how two ordered lists differ. */
function listDiff(name, a, b) {
  const lines = [`${name} differ (live ${a.length}, built ${b.length})`];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) lines.push(`  [${i}] live: ${a[i] ?? "(none)"} | built: ${b[i] ?? "(none)"}`);
  }
  return lines.slice(0, 11).join("\n");
}

for (const entry of articles()) {
  test(`[content] parity ${entry.url}`, () => {
    const builtFile = resolveFile(entry.url);
    assert.ok(builtFile, `no file in _site for ${entry.url}`);

    const live = load(snapshotPath(entry));
    const built = load(builtFile);
    const problems = [];

    const lh = header(live);
    const bh = header(built);
    for (const key of ["title", "topic", "description", "date"]) {
      if (lh[key] !== bh[key]) problems.push(`${key}: live ${JSON.stringify(lh[key])} | built ${JSON.stringify(bh[key])}`);
    }
    if (lh.tags.join("|") !== bh.tags.join("|")) problems.push(listDiff("tags", lh.tags, bh.tags));

    const lb = body(live);
    const bb = body(built);
    if (lb.text !== bb.text) problems.push(textDiff(lb.text, bb.text));
    if (lb.images.join("\n") !== bb.images.join("\n")) problems.push(listDiff("images", lb.images, bb.images));
    if (lb.links.join("\n") !== bb.links.join("\n")) problems.push(listDiff("links", lb.links, bb.links));
    if (lb.embeds !== bb.embeds) problems.push(`embeds: live ${lb.embeds} | built ${bb.embeds}`);

    const lTheme = live("section.hero").attr("class");
    const bTheme = built("section.hero").attr("class");
    if (lTheme !== bTheme) problems.push(`hero class: live ${JSON.stringify(lTheme)} | built ${JSON.stringify(bTheme)}`);

    assert.ok(problems.length === 0, `${entry.url}\n${problems.join("\n")}`);
  });
}

/** Parses either an ISO date or the live site's `dd/MM/yyyy HH:mm:ss`. */
function parseDate(s) {
  const m = String(s ?? "").match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (m) return Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5], +m[6]);
  return Date.parse(s);
}

test("[content] blog list", () => {
  const file = resolveFile("/blog");
  assert.ok(file, "no file in _site for /blog");
  const $ = load(file);
  const items = $("article.media")
    .map((_, el) => ({
      url: toInternalPath($(el).find("a[href]").first().attr("href")),
      date: parseDate($(el).find("time[datetime]").attr("datetime")),
    }))
    .get();

  const expected = blogUrls();
  assert.equal(items.length, expected.length, `blog lists ${items.length} articles, expected ${expected.length}`);
  assert.deepEqual(
    items.map((i) => i.url).sort(),
    [...expected].sort(),
    "blog list links differ from the manifest",
  );
  const bad = items.filter((i) => Number.isNaN(i.date)).map((i) => i.url);
  assert.deepEqual(bad, [], "articles without a parseable time[datetime]");
  for (let i = 1; i < items.length; i++) {
    assert.ok(
      items[i - 1].date >= items[i].date,
      `blog list not newest first: ${items[i - 1].url} before ${items[i].url}`,
    );
  }
});

test("[content] html sitemap", () => {
  const file = resolveFile("/sitemap");
  assert.ok(file, "no file in _site for /sitemap");
  const $ = load(file);
  const links = new Set(
    $("a[href]")
      .map((_, el) => toInternalPath($(el).attr("href")))
      .get()
      .filter((p) => p && p.startsWith("/blog/")),
  );
  const expected = blogUrls();
  assert.equal(links.size, expected.length, `sitemap lists ${links.size} articles, expected ${expected.length}`);
  assert.deepEqual([...links].sort(), [...expected].sort(), "sitemap article links differ from the manifest");
});
