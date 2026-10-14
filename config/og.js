// Writes a 1200x630 Open Graph card PNG for every rendered HTML page, at the
// path its og:image meta tag points to. Card data is read back from the page's
// own markup so the card always matches what the page says about itself.
import * as cheerio from "cheerio";
import { mkdir, writeFile, copyFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { readFileSync } from "node:fs";
import { renderCard, CARD_VERSION } from "../scripts/lib/og-card.mjs";
import { dateLong } from "./filters.js";

const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const CACHE = ".cache/og";
const exists = (p) => access(p).then(() => true, () => false);

// Accepts ISO timestamps and the "dd/MM/yyyy HH:mm:ss" (UTC) form the old site emitted.
function parseDate(value) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})(?: (\d{2}):(\d{2}):(\d{2}))?$/.exec(value);
  const d = m ? new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0))) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function cardFromHtml(htmlText) {
  const $ = cheerio.load(htmlText);
  const og = $('meta[property="og:image"]').attr("content") ?? "";
  const ogPath = og.startsWith(site.url) ? og.slice(site.url.length) : og;
  if (!ogPath.startsWith("/og/")) return null;
  const header = $("article.section header");
  const time = header.find("time[datetime]").attr("datetime");
  const date = time ? parseDate(time.trim()) : null;
  return {
    ogPath,
    title: header.find(".lead a").text().trim()
      || ($('meta[property="og:title"]').attr("content") ?? "").replace(` | ${site.name}`, ""),
    description: $('meta[property="og:description"]').attr("content") ?? "",
    tags: header.find(".section__meta .tag").map((_, el) => $(el).text().trim()).get().filter(Boolean),
    date: date ? dateLong(date) : "",
  };
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", async ({ results, directories }) => {
    const outDir = directories?.output ?? "_site";
    await mkdir(CACHE, { recursive: true });
    for (const r of results) {
      if (!r.outputPath?.endsWith(".html")) continue;
      const card = cardFromHtml(r.content);
      if (!card) continue;
      const { ogPath, ...data } = card;
      const key = createHash("sha1").update(JSON.stringify({ v: CARD_VERSION, ...data })).digest("hex");
      const cached = path.join(CACHE, `${key}.png`);
      if (!(await exists(cached))) await writeFile(cached, await renderCard(data));
      const out = path.join(outDir, ogPath);
      await mkdir(path.dirname(out), { recursive: true });
      await copyFile(cached, out);
    }
  });
}
