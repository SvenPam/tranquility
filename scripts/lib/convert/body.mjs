// Turns the body of a rendered live article into Markdown (with raw HTML for
// anything Markdown can't express faithfully).
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { rewriteUrl, rewriteSrcset } from "./urls.mjs";

const BODY = ".article.section__content > .row > .col-12";
const URL_ATTRS = ["href", "src", "data-src"];
const SRCSET_ATTRS = ["srcset", "data-srcset"];
// Marks each element with its document position while Turndown runs.
const INDEX_ATTR = "data-convert-index";

/**
 * Finds the article body in a cheerio-loaded page, rewrites its URLs and
 * tidies it up in place. Returns `{ html, media, warnings }`: the body's
 * inner HTML, every `/media/...` path it references and any warnings.
 */
export function preprocessBody($, oldFiles) {
  const roots = $(BODY);
  if (roots.length !== 1) throw new Error(`expected one article body, found ${roots.length}`);
  const root = roots.first();
  const warnings = [];
  const media = new Set();

  root.find("*").each((_, el) => {
    const attribs = el.attribs ?? {};
    for (const name of URL_ATTRS) {
      if (attribs[name] == null) continue;
      const r = rewriteUrl(attribs[name], oldFiles);
      if (r.warning) warnings.push(r.warning);
      $(el).attr(name, r.url);
      if (/^\/media\/\d+\//.test(r.url)) media.add(r.url);
    }
    for (const name of SRCSET_ATTRS) {
      if (attribs[name] == null) continue;
      const r = rewriteSrcset(attribs[name], oldFiles);
      warnings.push(...r.warnings);
      $(el).attr(name, r.value);
    }
    if (attribs["data-udi"] != null) $(el).removeAttr("data-udi");
  });

  // Lazy image holders: the static site serves the original file, so the
  // responsive candidates and auto sizes are dropped.
  root.find(".article__img-holder img").each((_, el) => {
    $(el).removeAttr("data-srcset").removeAttr("sizes");
  });

  return { html: root.html() ?? "", media: [...media].sort(), warnings: [...new Set(warnings)] };
}

// HTML blocks that CommonMark ends at their closing tag rather than at the
// first blank line, so blank lines inside them are safe.
const CLOSING_TAG_BLOCKS = new Set(["PRE", "SCRIPT", "STYLE", "TEXTAREA"]);

/** Attribute names of a node, ignoring the converter's own bookkeeping. */
function attributeNames(node) {
  return [...(node.attributes ?? [])].map((a) => a.name).filter((n) => n !== INDEX_ATTR);
}

function isSpacer(node) {
  return (
    node.nodeName === "P" &&
    attributeNames(node).length === 0 &&
    node.textContent.replace(/ /g, " ").trim() === "" &&
    !node.querySelector("img,iframe,script")
  );
}

// Untouched HTML of every element of the body being converted, by document
// order. Turndown collapses whitespace in its working copy, so kept elements
// are taken from here instead.
let original = [];

/** Raw HTML for a kept node, safe to embed in Markdown. */
function rawHtml(node) {
  const index = node.getAttribute?.(INDEX_ATTR);
  let html = index != null && original[index] != null ? original[index] : node.outerHTML;
  // A blank line would end a CommonMark HTML block early.
  if (!CLOSING_TAG_BLOCKS.has(node.nodeName)) html = html.replace(/\n[ \t]*(?=\n)/g, "");
  return html;
}

function shouldKeep(node) {
  const name = node.nodeName;
  if (["IFRAME", "SCRIPT", "FIGURE", "TABLE"].includes(name)) return true;
  if (name === "BLOCKQUOTE" && node.classList.contains("instagram-media")) return true;
  if (node.classList?.contains("codepen")) return true;
  if (node.classList?.contains("article__img-holder")) return true;
  if (name === "PRE" && node.firstChild?.nodeName !== "CODE") return true;
  if (name === "IMG" && attributeNames(node).some((a) => !["src", "alt"].includes(a))) return true;
  if (node.hasAttribute?.("style")) return true;
  // Classed wrappers (such as hand-numbered steps) keep their markup.
  if (name === "DIV" && attributeNames(node).length) return true;
  // Inline semantics Markdown has no syntax for.
  if (["SUP", "SUB", "INS", "U"].includes(name)) return true;
  // Markdown always wraps blockquote text in a paragraph.
  if (name === "BLOCKQUOTE" && hasDirectText(node)) return true;
  // Lists with attributes (such as anchor ids on items) or block content
  // inside items don't round-trip (item indentation breaks after item 9).
  if (name === "OL" || name === "UL") {
    if (attributeNames(node).length) return true;
    const items = [...node.childNodes].filter((c) => c.nodeName === "LI");
    if (items.some((li) => attributeNames(li).length)) return true;
    if (node.querySelector("li > p, li > div, li > blockquote, li > pre")) return true;
  }
  if (name === "P") {
    // Paragraphs wrapping embeds stay whole, so the wrapper keeps its spacing.
    if (node.querySelector("iframe,script")) return true;
    // A paragraph holding nothing but raw HTML would lose its <p> wrapper.
    const children = [...node.childNodes].filter((c) => !(c.nodeType === 3 && c.nodeValue.replace(/ /g, " ").trim() === ""));
    if (children.length && children.every((c) => c.nodeType === 1 && shouldKeep(c))) return true;
  }
  return false;
}

function hasDirectText(node) {
  return [...node.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim() !== "");
}

/** Builds the configured Turndown converter. */
export function createConverter() {
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    fence: "```",
    bulletListMarker: "-",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    // Turndown drops blank elements before any rule runs, so spacer
    // paragraphs and empty embed placeholders are handled here.
    blankReplacement: (content, node) => {
      if (isSpacer(node)) return "\n\n<p>&nbsp;</p>\n\n";
      if (shouldKeep(node)) return node.isBlock ? `\n\n${rawHtml(node)}\n\n` : rawHtml(node);
      return node.isBlock ? "\n\n" : "";
    },
  });
  td.use(gfm);
  // A rule rather than td.keep(), so it wins over the built-in rules for
  // blockquotes, paragraphs, images and pre.
  td.addRule("keep", {
    filter: (n) => shouldKeep(n),
    replacement: (content, node) => (node.isBlock ? `\n\n${rawHtml(node)}\n\n` : rawHtml(node)),
  });

  td.addRule("spacer", {
    filter: (n) => isSpacer(n),
    replacement: () => "\n\n<p>&nbsp;</p>\n\n",
  });

  // Text that looks like HTML must stay text once Markdown is rendered.
  const escape = td.escape.bind(td);
  td.escape = (s) =>
    escape(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      // A bare "1." line would otherwise start an empty ordered list.
      .replace(/^(\d+)([.)])(?=\s|$)/gm, "$1\\$2");

  return td;
}

let shared;

/** Converts pre-processed body HTML to Markdown. */
export function toMarkdown(html) {
  shared ??= createConverter();
  const pristine = cheerio.load(html, null, false);
  original = pristine("*")
    .map((_, el) => pristine.html(el))
    .get();
  const tagged = cheerio.load(html, null, false);
  tagged("*").each((i, el) => {
    tagged(el).attr(INDEX_ATTR, String(i));
  });
  try {
    return shared.turndown(tagged.html()).trim();
  } finally {
    original = [];
  }
}
