// Converts the blog articles of the live site into Markdown files in src/blog.
//
//   node scripts/convert-live.mjs [--source live|baseline] [--refresh] [--allow-missing]
//
// --source live (default) fetches every article listed in the baseline
// manifest. Articles without a snapshot are saved to docs/baseline/live and
// the manifest is updated; existing snapshots are only replaced with
// --refresh. --source baseline converts from the snapshots without touching
// the network. Articles that live still renders as Not Found stop the run
// unless --allow-missing is given, in which case they are skipped and listed.
//
// Behind a proxy, run with NODE_USE_ENV_PROXY=1 so fetch honours HTTPS_PROXY.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import * as cheerio from "cheerio";
import { fileIndex } from "./lib/convert/urls.mjs";
import { extractFrontMatter, serialiseFrontMatter, collapse } from "./lib/convert/front-matter.mjs";
import { preprocessBody, toMarkdown } from "./lib/convert/body.mjs";

const ORIGIN = "https://ste-pam.com";
const BASELINE_DIR = "docs/baseline/live";
const MANIFEST = path.join(BASELINE_DIR, "manifest.json");
const BLOG_DIR = "src/blog";
const MEDIA_ROOT = "src";
const REPORT = "docs/migration-report.md";
const KNOWN_BROKEN = "tests/known-broken.json";
const EMBEDS = "iframe, script[src], .codepen, .instagram-media";

// Articles whose body is written as raw HTML because Markdown could not
// reproduce them faithfully. Empty when every article converts cleanly.
const RAW_HTML = new Set([]);

const { values: args } = parseArgs({
  options: {
    source: { type: "string", default: "live" },
    refresh: { type: "boolean", default: false },
    "allow-missing": { type: "boolean", default: false },
  },
});
if (!["live", "baseline"].includes(args.source)) {
  console.error(`Unknown --source ${args.source}; use live or baseline.`);
  process.exit(2);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const entries = manifest.pages.filter((p) => p.url.startsWith("/blog/"));
const slugOf = (url) => url.split("/").pop();
const oldFiles = fileIndex("src/old");

// 1. Fetch and snapshot.
const missing = [];
let manifestChanged = false;

async function fetchArticle(url) {
  const res = await fetch(ORIGIN + url, { redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  const title = cheerio.load(html)("title").text().trim();
  return { ok: res.status === 200 && !title.startsWith("Not Found"), status: res.status, html };
}

if (args.source === "live") {
  for (const entry of entries) {
    const result = await fetchArticle(entry.url);
    if (!result.ok) {
      console.warn(`not found on live: ${entry.url} (HTTP ${result.status})`);
      if (!entry.file) missing.push(entry.url);
      continue;
    }
    if (entry.file && !args.refresh) continue;
    const file = `pages/blog/${slugOf(entry.url)}.html`;
    mkdirSync(path.join(BASELINE_DIR, "pages/blog"), { recursive: true });
    writeFileSync(path.join(BASELINE_DIR, file), result.html);
    if (entry.status !== 200 || entry.file !== file || "note" in entry) {
      delete entry.note;
      entry.status = 200;
      entry.file = file;
      manifestChanged = true;
    }
    console.log(`snapshot ${entry.url}`);
  }
  if (manifestChanged) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  if (missing.length && !args["allow-missing"]) {
    console.error(`These articles still render Not Found on live:\n  ${missing.join("\n  ")}`);
    console.error("Fix them in Umbraco, or re-run with --allow-missing to skip them.");
    process.exit(1);
  }
} else {
  for (const entry of entries) if (!entry.file) missing.push(entry.url);
  if (missing.length) console.warn(`no snapshot, skipped: ${missing.join(", ")}`);
}

// 2-5. Convert every article that has a snapshot.
async function ensureMedia(p) {
  const dest = path.join(MEDIA_ROOT, p);
  if (existsSync(dest)) return "present";
  if (args.source !== "live") return "missing";
  const res = await fetch(ORIGIN + p);
  if (res.status !== 200) return "missing";
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log(`media ${p}`);
  return "added";
}

const rows = [];
const mediaAdded = [];
let referencesFixed = 0;
const unresolved = new Map(); // path -> slugs

function countLegacyRefs($root) {
  let n = 0;
  $root.find("[src],[href],[data-src]").each((_, el) => {
    for (const name of ["src", "href", "data-src"]) {
      const v = el.attribs[name];
      if (v && /^(?:(?:https?:)?\/\/(?:www\.)?ste-pam\.com)?\/(?:Areas\/ste_pam\/Uploads|res|Content\/img)\//i.test(v)) n++;
    }
  });
  return n;
}

// Pages that render on live, so links to them resolve on the new site.
const livePages = new Set(manifest.pages.filter((p) => p.file).map((p) => p.url.toLowerCase()));

function fileExists(p) {
  let decoded = p;
  try {
    decoded = decodeURI(p);
  } catch {
    /* keep raw */
  }
  return existsSync(path.join("src", decoded));
}

for (const entry of entries.filter((e) => e.file)) {
  const slug = slugOf(entry.url);
  const $ = cheerio.load(readFileSync(path.join(BASELINE_DIR, entry.file), "utf8"));
  const fm = extractFrontMatter($);

  const liveBody = $(".article.section__content > .row > .col-12");
  const words = collapse(liveBody.text()).split(" ").filter(Boolean).length;
  const images = liveBody.find("img").length;
  const embeds = liveBody.find(EMBEDS).length;
  const fixedHere = countLegacyRefs(liveBody);

  const { html, media, warnings } = preprocessBody($, oldFiles);
  referencesFixed += fixedHere - warnings.length;

  for (const p of media) {
    const state = await ensureMedia(p);
    if (state === "added") mediaAdded.push(p);
    if (state === "missing") {
      warnings.push(`media not available: ${p}`);
    }
  }

  // Internal references (pages, images and downloads) the new site can't serve.
  const body$ = cheerio.load(html, null, false);
  body$("img, a[href]").each((_, el) => {
    const ref = el.attribs["data-src"] ?? el.attribs.src ?? el.attribs.href;
    if (!ref || !ref.startsWith("/") || ref.startsWith("//")) return;
    const p = ref.replace(/[?#].*$/, "");
    if (p === "/" || livePages.has(p.toLowerCase()) || fileExists(p)) return;
    if (!unresolved.has(p)) unresolved.set(p, new Set());
    unresolved.get(p).add(slug);
  });

  const mode = RAW_HTML.has(slug) ? "raw-html" : "markdown";
  const bodyOut = mode === "raw-html" ? html.trim() : toMarkdown(html);
  mkdirSync(BLOG_DIR, { recursive: true });
  writeFileSync(path.join(BLOG_DIR, `${slug}.md`), `${serialiseFrontMatter(fm)}\n\n${bodyOut}\n`);

  rows.push({ slug, ...fm, words, images, embeds, mode, warnings, media });
}

const expected = new Set(entries.filter((e) => e.file).map((e) => `${slugOf(e.url)}.md`));
for (const f of readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))) {
  if (!expected.has(f)) console.warn(`src/blog/${f} is not a live article`);
}

// 7. Migration report.
const knownBroken = new Set(JSON.parse(readFileSync(KNOWN_BROKEN, "utf8")));
writeFileSync(REPORT, renderReport());

console.log(
  `converted ${rows.length} articles (${rows.filter((r) => r.mode === "markdown").length} Markdown, ` +
    `${rows.filter((r) => r.mode === "raw-html").length} raw HTML); ${missing.length} missing; ` +
    `${mediaAdded.length} media added`,
);

function cell(s) {
  return String(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderReport() {
  const md = rows.filter((r) => r.mode === "markdown").length;
  const raw = rows.length - md;
  const unresolvedList = [...unresolved.keys()].sort();
  const pending = entries.filter((e) => !e.file).map((e) => e.url);
  const lines = [];
  lines.push("# Migration report");
  lines.push("");
  lines.push("Generated by `npm run convert` (`scripts/convert-live.mjs`). Re-running the converter rewrites this file.");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Articles in the manifest: ${entries.length}`);
  lines.push(`- Articles converted: ${rows.length} (${md} Markdown, ${raw} raw HTML)`);
  lines.push(`- Articles pending (no live snapshot): ${pending.length}`);
  lines.push(`- Media files added to \`src/media/\` by this run: ${mediaAdded.length}`);
  lines.push(`- Media files referenced by articles: ${new Set(rows.flatMap((r) => r.media)).size}`);
  lines.push(`- Legacy references fixed (\`/Areas/ste_pam/Uploads/\`, \`/res/\`, \`/Content/img/\` to \`/old/\`): ${referencesFixed}`);
  lines.push(`- References still broken: ${unresolvedList.length}`);
  lines.push("");
  lines.push("## Articles");
  lines.push("");
  lines.push("| Slug | Title | Date | Topic | Words | Images | Embeds | Mode | Warnings |");
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const r of [...rows].sort((a, b) => a.slug.localeCompare(b.slug))) {
    lines.push(
      `| ${r.slug} | ${cell(r.title)} | ${r.date.slice(0, 10)} | ${r.topic} | ${r.words} | ${r.images} | ${r.embeds} | ${r.mode} | ${cell(r.warnings.join("; ") || "none")} |`,
    );
  }
  lines.push("");
  lines.push("## Restored articles");
  lines.push("");
  lines.push(
    "Thirteen articles exist in Umbraco but render the Not Found page on live because they still use the old Blog Article template.",
  );
  lines.push("");
  if (pending.length) {
    lines.push(
      `${pending.length} are pending owner action; re-run \`npm run convert\` once they render. ` +
        "The converter then saves their snapshots, updates the manifest and writes their Markdown with no code changes.",
    );
    lines.push("");
    lines.push("| URL | Status |");
    lines.push("| --- | --- |");
    for (const u of pending) lines.push(`| ${u} | pending owner action |`);
  } else {
    lines.push("All of them now have a snapshot in `docs/baseline/live/pages/blog/` and are checked by the article parity tests.");
  }
  lines.push("");
  lines.push("## Content notes");
  lines.push("");
  lines.push(
    "- `sass-loops`: live lost the article's code sample (the text says \"In demo.scss below\" and nothing follows). Kept as live has it.",
  );
  lines.push(
    "- `api-support`: links to the old mobile site `m.ste-pam.com`. It is another host, so the link and its text are kept unchanged.",
  );
  lines.push("");
  lines.push("## Unresolved references");
  lines.push("");
  lines.push(
    "Internal links and images in article bodies that point at neither a page nor a file of the new site. " +
      "They are broken on live too and are left as live has them.",
  );
  lines.push("");
  lines.push("| Path | Articles | In `tests/known-broken.json` | Note |");
  lines.push("| --- | --- | --- | --- |");
  for (const p of unresolvedList) {
    const note = "";
    lines.push(
      `| ${p} | ${[...unresolved.get(p)].sort().join(", ")} | ${knownBroken.has(p) ? "yes" : "no (new)"} | ${note} |`,
    );
  }
  lines.push("");
  return lines.join("\n");
}
