// Normalises a minified stylesheet into a comparable map so two builds of the
// same SCSS can be checked for equivalence. Each rule here hides a known,
// harmless output difference between Sass compilers or minifier versions.
import postcss from "postcss";

const VENDOR_PSEUDO = /::?-(webkit|moz|ms|o)-/i;
const VENDOR_PROP = /^-(webkit|ms|moz|o)-/i;

function normaliseValue(value) {
  return value
    // Escaped em dash and no-break space (used in blockquote footers).
    .replace(/\\2014\s?/gi, "—")
    .replace(/\\0*a0\s?/gi, " ")
    // url("x") and url('x') become url(x).
    .replace(/url\(\s*(["'])(.*?)\1\s*\)/gi, "url($2)")
    .replace(/'/g, '"')
    // Round decimals to 3 places, drop trailing zeros and the leading 0.
    .replace(/-?\d*\.\d+/g, (n) => {
      let s = String(Math.round(parseFloat(n) * 1000) / 1000);
      if (s === "-0") s = "0";
      return s.replace(/^(-?)0\./, "$1.");
    })
    .replace(/#[0-9a-f]{3,8}\b/gi, (h) => h.toLowerCase())
    .replace(/\s*,\s*/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function normaliseSelector(sel) {
  return sel
    .replace(/\s+/g, " ")
    .replace(/\s*([>+~])\s*/g, "$1")
    .replace(/:nth-child\(\s*even\s*\)/gi, ":nth-child(2n)")
    .replace(/:nth-last-child\(\s*1\s*\)/gi, ":last-child")
    .replace(/\*::?(before|after)\b/gi, "::$1")
    .replace(/(^|[^:]):(before|after)\b/gi, "$1::$2")
    .replace(/'/g, '"')
    .trim();
}

function normaliseParams(params) {
  return params
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\(\s*/g, "(")
    .replace(/\s*\)/g, ")")
    .trim()
    .toLowerCase();
}

function contextOf(node) {
  const parts = [];
  for (let p = node.parent; p && p.type !== "root"; p = p.parent) {
    if (p.type === "atrule") parts.unshift(`@${p.name.toLowerCase()} ${normaliseParams(p.params)}`.trim());
  }
  return parts.join(" ");
}

function declsOf(container) {
  const out = [];
  for (const child of container.nodes ?? []) {
    if (child.type !== "decl") continue;
    if (VENDOR_PROP.test(child.prop)) continue;
    out.push(`${child.prop.toLowerCase()}:${normaliseValue(child.value)}${child.important ? " !important" : ""}`);
  }
  return out;
}

function add(map, key, decls) {
  if (!map.has(key)) map.set(key, new Set());
  const set = map.get(key);
  for (const d of decls) set.add(d);
}

/**
 * Parse a stylesheet into Map<"<at-rule context>|<selector>", Set<declaration>>.
 */
export function normalise(cssText) {
  const root = postcss.parse(cssText);
  const map = new Map();

  root.walkAtRules((at) => {
    // Vendor-prefixed at-rules (e.g. @-webkit-keyframes) duplicate the standard one.
    if (/^-(webkit|moz|ms|o)-/i.test(at.name)) {
      at.remove();
      return;
    }
    if (at.name.toLowerCase() === "charset") {
      at.remove();
      return;
    }
    // At-rules holding declarations directly, such as @font-face.
    const decls = declsOf(at);
    if (decls.length) {
      const ctx = [contextOf(at), `@${at.name.toLowerCase()} ${normaliseParams(at.params)}`.trim()]
        .filter(Boolean)
        .join(" ");
      add(map, `${ctx}|`, decls);
    }
  });

  root.walkRules((rule) => {
    const ctx = contextOf(rule);
    const decls = declsOf(rule);
    for (const raw of rule.selectors) {
      if (VENDOR_PSEUDO.test(raw)) continue;
      const sel = normaliseSelector(raw);
      add(map, `${ctx}|${sel}`, decls);
    }
  });

  return map;
}

/**
 * Compare two stylesheets (CSS text or maps from normalise).
 * Returns arrays of keys only in a, only in b, and in both with different declarations.
 */
export function diff(a, b) {
  const ma = typeof a === "string" ? normalise(a) : a;
  const mb = typeof b === "string" ? normalise(b) : b;
  const onlyA = [];
  const onlyB = [];
  const changed = [];
  for (const [key, da] of ma) {
    const db = mb.get(key);
    if (!db) {
      onlyA.push(key);
      continue;
    }
    if (da.size !== db.size || [...da].some((d) => !db.has(d))) changed.push(key);
  }
  for (const key of mb.keys()) if (!ma.has(key)) onlyB.push(key);
  return { onlyA, onlyB, changed };
}
