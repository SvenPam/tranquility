import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync("src/_data/site.json", "utf8"));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// Public URLs never end in a slash, apart from the root.
export const cleanUrl = (url) => (!url || url === "/" ? "/" : url.replace(/\/+$/, ""));
export const absoluteUrl = (url) => (/^https?:\/\//.test(url) ? url : site.url + cleanUrl(url));

// Front matter dates carry no timezone and are treated as UTC, so always format in UTC.
export const dateShort = (d) => `${pad(d.getUTCDate())}-${MONTHS[d.getUTCMonth()]}-${String(d.getUTCFullYear()).slice(2)}`;
export const dateLong = (d) => `${pad(d.getUTCDate())}-${MONTHS[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
export const dateIso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
export const isOld = (d, now = Date.now()) => now - d.getTime() > YEAR_MS;

// Path of the generated social card for a page URL.
export const ogImagePath = (url) => (cleanUrl(url) === "/" ? "/og/index.png" : `/og${cleanUrl(url)}.png`);

export default function (eleventyConfig) {
  Object.entries({ cleanUrl, absoluteUrl, dateShort, dateLong, dateIso, isOld, ogImagePath })
    .forEach(([name, fn]) => eleventyConfig.addFilter(name, fn));
  eleventyConfig.addGlobalData("build", { year: new Date().getUTCFullYear() });
}
