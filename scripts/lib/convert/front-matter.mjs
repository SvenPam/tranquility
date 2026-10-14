// Reads article metadata from a rendered live page and writes it back out as
// stable, hand-formatted YAML front matter.
import { TOPICS } from "../schema.mjs";

/** Collapses whitespace (including NBSP) and trims. */
export function collapse(s) {
  return String(s ?? "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** `23/04/2017 15:46:11` (UTC) to `2017-04-23T15:46:11`. */
export function parseLiveDate(s) {
  const m = String(s ?? "")
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!m) throw new Error(`unrecognised date: ${JSON.stringify(s)}`);
  const [, dd, mm, yyyy, hh, mi, ss] = m;
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

/** Hero focus from an image processor query: `center=Y,X`, else the middle. */
function focusFromQuery(query) {
  const m = query.match(/center=([\d.]+),([\d.]+)/i);
  if (m) return { x: Number(m[2]), y: Number(m[1]) };
  return { x: 0.5, y: 0.5 };
}

/** Extracts the front matter fields from a cheerio-loaded live article. */
export function extractFrontMatter($) {
  const h = $("article.section header").first();
  const fm = {
    title: collapse(h.find(".lead a").first().text()),
    description: collapse(h.find("p.text-muted").first().text()),
    date: parseLiveDate(h.find("time[datetime]").first().attr("datetime")),
    topic: collapse(h.find("p.text-center").first().text()),
    tags: h
      .find(".section__meta .tag")
      .map((_, el) => collapse($(el).text()))
      .get()
      .filter(Boolean),
  };
  if (!fm.title) throw new Error("no title found");
  if (!TOPICS.includes(fm.topic)) throw new Error(`unknown topic ${JSON.stringify(fm.topic)}`);

  const heroClass = $("section.hero").first().attr("class") ?? "";
  const theme = heroClass.match(/hero--(\w*)/)?.[1] ?? "";
  if (theme) fm.theme = theme;

  $("style").each((_, el) => {
    if (fm.heroImage) return;
    const css = $(el).text();
    if (!/\.hero\b/.test(css)) return;
    const m = css.match(
      /url\(\s*['"]?((?:https?:)?(?:\/\/(?:www\.)?ste-pam\.com)?\/media\/\d+\/[^'")?]+)(\?[^'")]*)?/i,
    );
    if (!m) return;
    fm.heroImage = m[1].replace(/^(?:https?:)?\/\/(?:www\.)?ste-pam\.com/i, "");
    const focus = focusFromQuery(m[2] ?? "");
    if (focus.x !== 0.5 || focus.y !== 0.5) fm.heroFocus = focus;
  });

  return fm;
}

/** Serialises front matter in a fixed key order without a YAML library. */
export function serialiseFrontMatter(fm) {
  const lines = ["---"];
  lines.push(`title: ${JSON.stringify(fm.title)}`);
  lines.push(`description: ${JSON.stringify(fm.description ?? "")}`);
  lines.push(`date: ${fm.date}`);
  lines.push(`topic: ${fm.topic}`);
  lines.push(`tags: [${(fm.tags ?? []).map((t) => JSON.stringify(t)).join(", ")}]`);
  if (fm.theme) lines.push(`theme: ${fm.theme}`);
  if (fm.heroImage) lines.push(`heroImage: ${JSON.stringify(fm.heroImage)}`);
  if (fm.heroFocus) lines.push(`heroFocus: { x: ${fm.heroFocus.x}, y: ${fm.heroFocus.y} }`);
  lines.push("---");
  return lines.join("\n");
}
