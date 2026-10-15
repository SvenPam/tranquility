// Page hero: a terminal prompt over a contour map. The map is an inline SVG
// filter the browser draws itself, so the hero costs no image download.
//
// Each page gets its own terrain from a seed hashed from its URL, so the map
// stays the same from build to build. `heroSeed` front matter pins a seed.

// FNV-1a, folded into the range feTurbulence handles well.
export function heroSeed(url = "/") {
  let h = 0x811c9dc5;
  for (const c of url) h = Math.imul(h ^ c.codePointAt(0), 0x01000193) >>> 0;
  return h % 10000;
}

// The command shown before the title. `prompt` front matter overrides it.
export function heroPrompt(url = "/") {
  if (url === "/") return "whoami";
  if (url === "/blog/") return "ls blog/";
  const post = /^\/blog\/([^/]+)\/$/.exec(url);
  if (post) return `cat blog/${post[1]}.md`;
  return `cd ~${url.replace(/\/$/, "")}`;
}

// Fractal noise, cut into alternating height bands, then outlined: contour lines.
export function heroTerrain(seed) {
  return [
    `<svg class="hero__terrain" aria-hidden="true" focusable="false">`,
    `<filter id="terrain" x="0" y="0" width="100%" height="100%">`,
    `<feTurbulence type="fractalNoise" baseFrequency="0.0035 0.006" numOctaves="3" seed="${Number(seed) || 0}"/>`,
    `<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.6 0 0 0 -0.3"/>`,
    `<feComponentTransfer result="bands"><feFuncA type="discrete" tableValues="0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1"/></feComponentTransfer>`,
    `<feMorphology in="bands" operator="erode" radius="1" result="inner"/>`,
    `<feComposite in="bands" in2="inner" operator="out" result="lines"/>`,
    `<feFlood flood-color="#29B8B9" flood-opacity=".5"/>`,
    `<feComposite in2="lines" operator="in"/>`,
    `</filter>`,
    `<rect width="100%" height="100%" filter="url(#terrain)"/>`,
    `</svg>`,
  ].join("");
}

export default function (eleventyConfig) {
  eleventyConfig.addFilter("heroSeed", heroSeed);
  eleventyConfig.addFilter("heroPrompt", heroPrompt);
  eleventyConfig.addShortcode("heroTerrain", heroTerrain);
}
