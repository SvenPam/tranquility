// Rewrites URLs found in live article bodies to the paths the static site
// serves the same files from.
import { readdirSync } from "node:fs";

const OWN_ORIGIN = /^(?:https?:)?\/\/(?:www\.)?ste-pam\.com(?=[/?#]|$)/i;

/** Files that were renamed when they moved to `/old/` (lower-case key). */
const RENAMED = new Map([["miruscreen1.jpg", "MiruSccreen1.jpg"]]);

/** Maps lower-case file names in a directory to their real names. */
export function fileIndex(dir) {
  const index = new Map();
  for (const f of readdirSync(dir)) index.set(f.toLowerCase(), f);
  return index;
}

function decodeName(name) {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/**
 * Rewrites one URL. `oldFiles` maps the lower-case name of every file under
 * `src/old` to its real name. Returns `{ url, warning }`; `warning` is set
 * when a legacy file has no counterpart in `src/old`.
 */
export function rewriteUrl(raw, oldFiles) {
  if (typeof raw !== "string") return { url: raw };
  let url = raw.trim();
  if (OWN_ORIGIN.test(url)) {
    url = url.replace(OWN_ORIGIN, "") || "/";
  } else if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) {
    // Another host, or a non-HTTP scheme such as mailto: left as it is.
    return { url };
  }

  const uploads = url.match(/^\/Areas\/ste_pam\/Uploads\/(.+)$/i);
  if (uploads) return { url: `/old/${uploads[1]}` };

  const legacy = url.match(/^\/(?:res|Content\/img)\/([^/?#]+)(?:[?#].*)?$/i);
  if (legacy) {
    const key = decodeName(legacy[1]).toLowerCase();
    const real = RENAMED.get(key) ?? oldFiles.get(key);
    if (real) return { url: `/old/${encodeURI(real)}` };
    return { url, warning: `no file in src/old for ${url}` };
  }

  const media = url.match(/^(\/media\/\d+\/[^?#]+)[?#]/i);
  if (media) return { url: media[1] };

  return { url };
}

/** Rewrites every candidate URL of a `srcset` value. */
export function rewriteSrcset(value, oldFiles) {
  const warnings = [];
  const out = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [u, ...rest] = part.split(/\s+/);
      const r = rewriteUrl(u, oldFiles);
      if (r.warning) warnings.push(r.warning);
      return [r.url, ...rest].join(" ");
    })
    .join(", ");
  return { value: out, warnings };
}
