import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";

const font = (w) => readFile(`node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-${w}-normal.woff`);
let assets;
async function load() {
  assets ??= {
    fonts: [
      { name: "JetBrains Mono", data: await font(400), weight: 400, style: "normal" },
      { name: "JetBrains Mono", data: await font(700), weight: 700, style: "normal" },
    ],
    bg: `data:image/jpeg;base64,${(await readFile("src/assets/img/generic/2-100.jpg")).toString("base64")}`,
  };
  return assets;
}

// The bundled font has no emoji, so drop them rather than render empty boxes.
const clean = (s = "") => s.replace(/\p{Extended_Pictographic}️?|‍/gu, "").replace(/\s+/g, " ").trim();
const esc = (s = "") => clean(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Bump when the design changes, to invalidate cached cards.
export const CARD_VERSION = 1;

// Long titles step down a size so they still fit on two lines.
const titleSize = (title) => (clean(title).length > 50 ? 38 : 44);

export async function renderCard({ title, description = "", tags = [], date = "" }) {
  const { fonts, bg } = await load();
  const item = "display:flex;flex-shrink:0;white-space:nowrap";
  const sep = `<span style="${item};color:#868E96;margin:0 10px">//</span>`;
  const pills = tags.map((t) =>
    `<span style="${item};background:#FF5E5B;color:#DEE2E6;border-radius:10px;padding:2px 8px;font-size:16px;margin:4px 8px 4px 0">#${esc(t)}</span>`).join("");
  const markup = html(`
    <div style="display:flex;width:1200px;height:630px;align-items:center;justify-content:center;
                background-image:url(${bg});background-size:1200px 630px;font-family:'JetBrains Mono';color:#fff">
      <div style="display:flex;flex-direction:column;width:840px;padding:30px;background:#343a40;
                  box-shadow:4px 4px 0 0 #292d32;text-align:center;align-items:center">
        <div style="display:block;font-size:${titleSize(title)}px;font-weight:700;line-height:1.2;line-clamp:3">${esc(title)}</div>
        ${clean(description) ? `<div style="display:block;margin-top:20px;font-size:26px;color:#868E96;line-height:1.35;line-clamp:3">${esc(description)}</div>` : ""}
        <div style="display:flex;width:100%;justify-content:space-between;align-items:center;margin-top:30px;font-size:20px">
          <div style="display:flex;flex-wrap:wrap;align-items:center;text-align:left">
            <span style="${item}">Ste Pammenter</span>${sep}<span style="${item};color:#29b8b9">@SvenPam</span>${tags.length ? `${sep}${pills}` : ""}
          </div>
          ${date ? `<div style="${item};margin-left:20px">${esc(date)}</div>` : ""}
        </div>
      </div>
    </div>`);
  const svg = await satori(markup, { width: 1200, height: 630, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
}
