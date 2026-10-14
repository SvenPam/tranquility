import { statSync } from "node:fs";
import path from "node:path";

/** Build output directory, relative to the repository root. */
export const SITE = "_site";

function isFile(p) {
  try {
    return statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * Returns the file inside `root` that Static Web Apps would serve for a
 * clean URL path, or null when nothing matches.
 *
 *   /                          -> index.html
 *   /about                     -> about/index.html
 *   /about/                    -> about/index.html
 *   /a/dist/css/ste-pam.min.css -> a/dist/css/ste-pam.min.css
 *   /old/Stephen%20Pammenter%20-%20CV.pdf -> old/Stephen Pammenter - CV.pdf
 *
 * Query strings and fragments are ignored. Paths that try to escape the
 * root are rejected.
 */
export function resolveFile(urlPath, root = SITE) {
  if (typeof urlPath !== "string" || !urlPath.startsWith("/")) return null;
  let p = urlPath.replace(/[?#].*$/, "");
  try {
    p = decodeURIComponent(p);
  } catch {
    return null;
  }

  const base = path.resolve(root);
  const target = path.resolve(base, "." + p);
  if (target !== base && !target.startsWith(base + path.sep)) return null;

  const candidates = p.endsWith("/")
    ? [path.join(target, "index.html")]
    : [target, path.join(target, "index.html")];

  for (const c of candidates) {
    if (isFile(c)) return c;
  }
  return null;
}
