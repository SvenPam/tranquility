import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";

/** Parses an HTML file with cheerio. */
export function load(file) {
  return cheerio.load(readFileSync(file, "utf8"));
}

/** Collapses whitespace, turns NBSP into a space and trims. */
export function normalise(s) {
  return String(s ?? "")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Text of every element matching `sel`, joined and normalised. */
export function text($, sel) {
  return normalise(
    $(sel)
      .map((_, el) => $(el).text())
      .get()
      .join(" "),
  );
}

const URL_ATTRS = ["href", "src", "data-src", "xlink:href"];
const SRCSET_ATTRS = ["srcset", "data-srcset"];
const OWN_ORIGIN = /^(?:https?:)?\/\/(?:www\.)?ste-pam\.com(?=[/?#]|$)/i;

/**
 * Normalises a URL reference to a site-internal path, or returns null when it
 * points elsewhere. Strips the site's own origin, drops query and fragment.
 */
export function toInternalPath(raw) {
  if (typeof raw !== "string") return null;
  let u = raw.trim();
  if (!u) return null;
  u = u.replace(OWN_ORIGIN, "");
  if (u === "") u = "/";
  u = u.replace(/[?#].*$/, "");
  if (!u.startsWith("/") || u.startsWith("//")) return null;
  return u;
}

function srcsetUrls(value) {
  return value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

/**
 * Every internal path referenced by the document: href, src, data-src,
 * srcset, data-srcset, xlink:href and url(...) inside <style> blocks.
 * Returned in document order, without duplicates.
 */
export function internalRefs($) {
  const raw = [];
  $("*").each((_, el) => {
    const attribs = el.attribs || {};
    for (const name of URL_ATTRS) {
      if (attribs[name] != null) raw.push(attribs[name]);
    }
    for (const name of SRCSET_ATTRS) {
      if (attribs[name] != null) raw.push(...srcsetUrls(attribs[name]));
    }
  });
  $("style").each((_, el) => {
    const css = $(el).text();
    for (const m of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) raw.push(m[2]);
  });

  const out = [];
  const seen = new Set();
  for (const r of raw) {
    const p = toInternalPath(r);
    if (p && !seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}
