// Local dev server: build, watch src/ and config/, serve _site.
// Replaces `eleventy --serve`, whose watcher needs chokidar 3 (removed by the
// audit override in package.json). Node built-ins only. No live reload.
import { spawn } from "node:child_process";
import { watch, existsSync, statSync, createReadStream } from "node:fs";
import http from "node:http";
import path from "node:path";

const ROOT = path.resolve("_site");
const PORT = Number(process.env.PORT) || 8080;
const WATCH_DIRS = ["src", "config"];

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
};

// ---- build queue ----
let building = false;
let pending = false;

function build() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  pending = false;
  const started = Date.now();
  const child = spawn("npx", ["@11ty/eleventy"], { stdio: "inherit", shell: process.platform === "win32" });
  child.on("exit", (code) => {
    building = false;
    startWatchers();
    const ms = Date.now() - started;
    if (code === 0) console.log(`[dev] built in ${ms} ms`);
    else console.error(`[dev] build failed (exit ${code})`);
    if (pending) build();
  });
}

// ---- watcher ----
let timer = null;
function schedule(dir, file) {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`[dev] change: ${path.join(dir, file ?? "")}`);
    build();
  }, 200);
}

// On Linux, a file replaced by rename (sed -i, many editors' atomic save)
// drops out of a recursive fs.watch, so later writes to it are missed, and Node
// reports the replacing save as a plain "change". Re-create the watchers after
// every build so replaced files are picked up again.
let watchers = [];
function startWatchers() {
  for (const w of watchers) w.close();
  watchers = WATCH_DIRS.filter((dir) => existsSync(dir)).map((dir) =>
    watch(dir, { recursive: true }, (_event, file) => schedule(dir, file)));
}
startWatchers();

// ---- server ----
function resolveFile(urlPath) {
  let p;
  try {
    p = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const candidates = p.endsWith("/")
    ? [path.join(p, "index.html")]
    : [p, path.join(p, "index.html")];
  for (const c of candidates) {
    const full = path.join(ROOT, c);
    if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
    if (existsSync(full) && statSync(full).isFile()) return full;
  }
  return null;
}

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const urlPath = new URL(req.url, "http://localhost").pathname;
    const file = resolveFile(urlPath);
    if (file) return send(res, 200, file);
    const notFound = path.join(ROOT, "not-found", "index.html");
    if (existsSync(notFound)) return send(res, 404, notFound);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  })
  .listen(PORT, () => console.log(`[dev] serving _site on http://localhost:${PORT}`));

build();
