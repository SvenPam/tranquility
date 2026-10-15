// Content images: wraps every local JPEG or PNG <img> in a <picture> with a
// WebP copy, and adds native lazy loading. The original stays as the fallback
// and keeps its URL. WebP copies are cached in .cache/webp between builds.
import sharp from "sharp";
import { createHash } from "node:crypto";
import { access, copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const CACHE = ".cache/webp";
const MAX_WIDTH = 1600; // twice the article column
const QUALITY = 75;

// Published URL prefix -> source folder (see the passthroughs in assets.js).
const SOURCES = [
  ["/a/dist/img/", "src/assets/img/"],
  ["/media/", "src/media/"],
  ["/old/", "src/old/"],
];

const exists = (p) => access(p).then(() => true, () => false);
const attr = (tag, name) => new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag)?.[1];

export function sourceFor(url) {
  if (!/\.(jpe?g|png)$/i.test(url)) return null;
  for (const [prefix, dir] of SOURCES) {
    if (url.startsWith(prefix)) return dir + decodeURI(url.slice(prefix.length));
  }
  return null;
}

// Returns { webpUrl, width, height } or null when the WebP isn't smaller.
async function toWebp(url, file, outDir) {
  const input = await readFile(file);
  const key = createHash("sha256").update(input).update(`${MAX_WIDTH}:${QUALITY}`).digest("hex").slice(0, 16);
  const cached = path.join(CACHE, `${key}.webp`);
  const meta = await sharp(input).metadata();
  if (!(await exists(cached))) {
    await mkdir(CACHE, { recursive: true });
    await sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(cached);
  }
  const { size } = await stat(cached);
  if (size >= input.length) return null;
  const webpUrl = url.replace(/\.(jpe?g|png)$/i, ".webp");
  const dest = path.join(outDir, decodeURI(webpUrl));
  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(cached, dest);
  return { webpUrl, width: meta.width, height: meta.height };
}

export async function optimiseImages(html, outDir, memo = new Map()) {
  const tags = [...new Set(html.match(/<img\b[^>]*>/gi) ?? [])];
  for (const tag of tags) {
    let img = tag.replace(/\s*\/?>$/, "");
    if (!attr(img, "loading")) img += ' loading="lazy"';
    if (!attr(img, "decoding")) img += ' decoding="async"';

    const src = attr(tag, "src");
    const file = src && sourceFor(src);
    let out = `${img}>`;
    if (file && (await exists(file))) {
      if (!memo.has(file)) memo.set(file, toWebp(src, file, outDir));
      const webp = await memo.get(file);
      if (webp) {
        // Reserve the image's space before it loads, unless the markup already sizes it.
        const w = attr(tag, "width");
        if (!attr(tag, "height") && !attr(tag, "style")) {
          if (w === undefined) img += ` width="${webp.width}" height="${webp.height}"`;
          else if (/^\d+$/.test(w)) img += ` height="${Math.round((w * webp.height) / webp.width)}"`;
        }
        out = `<picture><source srcset="${webp.webpUrl}" type="image/webp">${img}></picture>`;
      }
    }
    html = html.split(tag).join(out);
  }
  return html;
}

export default function (eleventyConfig) {
  const memo = new Map();
  eleventyConfig.on("eleventy.before", () => memo.clear());
  eleventyConfig.addTransform("images", async function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return optimiseImages(content, eleventyConfig.directories?.output ?? "_site", memo);
  });
}
