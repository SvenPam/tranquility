import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/** Snapshot of the live site, captured before the move to static hosting. */
export const BASELINE_DIR = "docs/baseline/live";

let cached;

/** The parsed `manifest.json`. */
export function manifest() {
  cached ??= JSON.parse(readFileSync(path.join(BASELINE_DIR, "manifest.json"), "utf8"));
  return cached;
}

/** Every page entry in the manifest. */
export function pages() {
  return manifest().pages;
}

/** Every `/blog/{slug}` URL in the manifest, whether or not live rendered it. */
export function blogUrls() {
  return pages()
    .map((p) => p.url)
    .filter((u) => u.startsWith("/blog/"));
}

/** Article entries (under `/blog/`) that have a captured HTML snapshot. */
export function articles() {
  return pages().filter((p) => p.url.startsWith("/blog/") && p.file);
}

/** Absolute-ish path of a manifest entry's snapshot file. */
export function snapshotPath(entry) {
  return path.join(BASELINE_DIR, entry.file);
}

let oldFiles;
function oldFileIndex() {
  if (!oldFiles) {
    oldFiles = new Map();
    for (const f of readdirSync("src/old")) oldFiles.set(f.toLowerCase(), f);
  }
  return oldFiles;
}

/** Files on live that were renamed when they moved to `/old/`. */
const RENAMED = new Map([["miruscreen1.jpg", "MiruSccreen1.jpg"]]);

/**
 * Maps a path referenced by a live page to the path the new site is expected
 * to use for the same file:
 *
 * - the site's own origin and any query string are dropped;
 * - `/Areas/ste_pam/Uploads/x` becomes `/old/x`;
 * - `/res/x` and `/Content/img/x` become `/old/x` when `src/old` holds a
 *   file of that name (case-insensitive), using the file's real name.
 *
 * Anything else is returned unchanged (apart from the origin and query).
 */
export function mapLegacyPath(ref) {
  if (typeof ref !== "string") return ref;
  let u = ref.trim().replace(/^(?:https?:)?\/\/(?:www\.)?ste-pam\.com(?=[/?#]|$)/i, "");
  if (u === "") u = "/";
  const hashIndex = u.indexOf("#");
  const hash = hashIndex >= 0 ? u.slice(hashIndex) : "";
  u = (hashIndex >= 0 ? u.slice(0, hashIndex) : u).replace(/\?.*$/, "");

  const uploads = u.match(/^\/Areas\/ste_pam\/Uploads\/(.+)$/i);
  if (uploads) return `/old/${uploads[1]}${hash}`;

  const legacy = u.match(/^\/(?:res|Content\/img)\/([^/]+)$/i);
  if (legacy) {
    let name = legacy[1];
    try {
      name = decodeURIComponent(name);
    } catch {
      /* keep the raw name */
    }
    const key = name.toLowerCase();
    const real = RENAMED.get(key) ?? oldFileIndex().get(key);
    if (real) return `/old/${encodeURI(real)}${hash}`;
  }
  return u + hash;
}
