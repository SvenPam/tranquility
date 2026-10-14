import { mkdir, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { cropTo } from "../scripts/lib/crop.mjs";

// Breakpoints and crop sizes from the Umbraco "Image Cropper" data type.
const CROPS = [
  { minWidth: 0,    w: 320,  h: 411 },  // Hero - XS
  { minWidth: 540,  w: 540,  h: 385 },  // Hero - S
  { minWidth: 720,  w: 720,  h: 370 },  // Hero - M
  { minWidth: 960,  w: 960,  h: 389 },  // Hero - L
  { minWidth: 1140, w: 1920, h: 489 },  // Hero - XL
];
const CACHE = ".cache/hero";

const exists = (p) => access(p).then(() => true, () => false);

// Crop counts for the current build, reported once the build finishes.
const stats = { cropped: 0, cached: 0 };

// Returns the per-page <style> block that sets the responsive hero background,
// cropping the source image to each breakpoint size around the focal point.
// Crops are cached in .cache/hero and copied into outDir/a/dist/hero.
export async function heroStyle(src, focus, outDir = "_site") {
  if (!src) return "";
  const f = { x: focus?.x ?? 0.5, y: focus?.y ?? 0.5 };
  const srcFile = path.join("src", src);
  const base = path.basename(src, path.extname(src));
  const urls = [];
  for (const c of CROPS) {
    const key = createHash("sha1").update(`${src}|${c.w}x${c.h}|${f.x},${f.y}`).digest("hex").slice(0, 10);
    const name = `${base}-${c.w}x${c.h}-${key}.jpg`;
    const cached = path.join(CACHE, name);
    if (await exists(cached)) {
      stats.cached++;
    } else {
      await mkdir(CACHE, { recursive: true });
      await cropTo(srcFile, cached, c.w, c.h, f);
      stats.cropped++;
    }
    const out = path.join(outDir, "a/dist/hero", name);
    await mkdir(path.dirname(out), { recursive: true });
    await copyFile(cached, out);
    urls.push({ ...c, url: `/a/dist/hero/${name}` });
  }
  // Smallest first so the later, wider media queries win.
  const [xs, ...rest] = urls;
  return [
    "<style>",
    `    .hero { background-image: url('${xs.url}'); }`,
    ...rest.map((c) => `    @media (min-width: ${c.minWidth}px) { .hero { background-image: url('${c.url}'); } }`),
    "</style>",
  ].join("\n");
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });

  eleventyConfig.on("eleventy.before", () => {
    stats.cropped = 0;
    stats.cached = 0;
  });
  eleventyConfig.on("eleventy.after", () => {
    if (stats.cropped || stats.cached) {
      console.log(`[hero] ${stats.cropped} cropped, ${stats.cached} from cache`);
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode("heroStyle", function (src, focus) {
    const outDir = eleventyConfig.directories?.output ?? "_site";
    return heroStyle(src, focus, outDir);
  });
}
