import * as sass from "sass";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import CleanCSS from "clean-css";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Browser list copied from the old gulpfile so prefixes match the live CSS.
const BROWSERS = ["Chrome >= 35", "Firefox >= 38", "Edge >= 12", "Explorer >= 10",
  "iOS >= 8", "Safari >= 8", "Android 2.3", "Android >= 4", "Opera >= 12"];

export async function buildCss({ outDir = "_site" } = {}) {
  const compiled = sass.compile("src/styles/ste-pam.scss", {
    loadPaths: ["node_modules"],
    style: "expanded",
    logger: sass.Logger.silent,          // Bootstrap 4 beta triggers many deprecation warnings
  });
  const prefixed = await postcss([autoprefixer({ overrideBrowserslist: BROWSERS })])
    .process(compiled.css, { from: undefined });
  const min = new CleanCSS({ level: 1 }).minify(prefixed.css);
  if (min.errors.length) throw new Error(min.errors.join("\n"));
  const outFile = path.join(outDir, "a/dist/css/ste-pam.min.css");
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, min.styles);
  // Content hash, appended to the stylesheet URL so each change busts browser and CDN caches.
  const version = createHash("sha256").update(min.styles).digest("hex").slice(0, 10);
  return { file: outFile, version };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log((await buildCss()).file);
}
