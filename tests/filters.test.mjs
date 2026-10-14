import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanUrl,
  absoluteUrl,
  dateShort,
  dateLong,
  dateIso,
  isOld,
  ogImagePath,
} from "../config/filters.js";

const SAMPLE = new Date("2019-07-24T15:22:06Z");

test("cleanUrl strips trailing slashes except on the root", () => {
  assert.equal(cleanUrl("/"), "/");
  assert.equal(cleanUrl("/about/"), "/about");
  assert.equal(cleanUrl("/blog/x/"), "/blog/x");
});

test("absoluteUrl prefixes the site URL and leaves absolute URLs alone", () => {
  assert.equal(absoluteUrl("/"), "https://ste-pam.com/");
  assert.equal(absoluteUrl("/about/"), "https://ste-pam.com/about");
  assert.equal(absoluteUrl("https://x.y/z"), "https://x.y/z");
});

test("dateShort formats dd-MMM-yy in UTC", () => {
  assert.equal(dateShort(SAMPLE), "24-Jul-19");
});

test("dateLong formats dd-MMM-yyyy in UTC", () => {
  assert.equal(dateLong(SAMPLE), "24-Jul-2019");
});

test("dateIso drops milliseconds", () => {
  assert.equal(dateIso(SAMPLE), "2019-07-24T15:22:06Z");
});

test("isOld is true only for dates more than a year ago", () => {
  assert.equal(isOld(new Date("2019-07-24T00:00:00Z")), true);
  assert.equal(isOld(new Date(Date.now() - 1000)), false);
});

test("ogImagePath maps page URLs to card paths", () => {
  assert.equal(ogImagePath("/"), "/og/index.png");
  assert.equal(ogImagePath("/blog/sass-loops/"), "/og/blog/sass-loops.png");
});
