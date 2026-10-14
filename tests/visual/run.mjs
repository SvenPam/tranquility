// Visual diff: serves _site locally, screenshots each page and viewport with
// the normalising CSS, and compares them with docs/baseline/visual/.
// Writes actual and diff images to test-results/visual/ and exits 1 when any
// page differs by more than its allowed mismatch ratio.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import pngjs from "pngjs";
import { SITE, resolveFile } from "../lib/site.mjs";
import { BASELINE_DIR, CONFIG, launchBrowser, screenshot, shots } from "./shared.mjs";

const { PNG } = pngjs;
const OUT_DIR = "test-results/visual";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function serve(req, res) {
  const urlPath = new URL(req.url, "http://localhost").pathname;
  let file = resolveFile(urlPath);
  let status = 200;
  if (!file) {
    status = 404;
    file = resolveFile("/not-found");
  }
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const type = TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  res.writeHead(status, { "content-type": type });
  res.end(readFileSync(file));
}

function compare(name, actualBuf) {
  const baselineFile = path.join(BASELINE_DIR, `${name}.png`);
  writeFileSync(path.join(OUT_DIR, `${name}-actual.png`), actualBuf);
  if (!existsSync(baselineFile)) return { ratio: 1, note: "no baseline" };

  const expected = PNG.sync.read(readFileSync(baselineFile));
  const actual = PNG.sync.read(actualBuf);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    return {
      ratio: 1,
      note: `size ${actual.width}x${actual.height} vs baseline ${expected.width}x${expected.height}`,
    };
  }
  const { width, height } = expected;
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(expected.data, actual.data, diff.data, width, height, { threshold: 0.1 });
  writeFileSync(path.join(OUT_DIR, `${name}-diff.png`), PNG.sync.write(diff));
  return { ratio: mismatched / (width * height), note: "" };
}

if (!existsSync(path.join(SITE, "index.html"))) {
  console.error(`${SITE}/index.html is missing; run npm run build first`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const server = createServer(serve);
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const results = [];
const browser = await launchBrowser();
try {
  for (const shot of shots()) {
    const png = await screenshot(browser, new URL(shot.path, origin).href, shot.size);
    const { ratio, note } = compare(shot.name, png);
    const max = CONFIG.perPage[shot.page] ?? CONFIG.perPage[shot.name] ?? CONFIG.maxMismatch;
    results.push({ name: shot.name, ratio, max, pass: ratio <= max, note });
  }
} finally {
  await browser.close();
  server.close();
}

const width = Math.max(...results.map((r) => r.name.length));
console.log(`${"page".padEnd(width)}  mismatch  max     result`);
for (const r of results) {
  const pct = `${(r.ratio * 100).toFixed(2)}%`.padStart(8);
  const max = `${(r.max * 100).toFixed(2)}%`.padStart(6);
  console.log(`${r.name.padEnd(width)}  ${pct}  ${max}  ${r.pass ? "pass" : "FAIL"}${r.note ? `  (${r.note})` : ""}`);
}
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} within tolerance; images in ${OUT_DIR}/`);
process.exit(failed.length ? 1 : 0);
