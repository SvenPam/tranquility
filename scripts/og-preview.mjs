// Renders sample Open Graph cards to test-results/og/ for a visual check.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderCard } from "./lib/og-card.mjs";

const OUT = "test-results/og";
const samples = {
  "short-title-tags": {
    title: "Life's better with BEM",
    description: "Utilising the BEM style methodology for clean architecture an maintainability gains \u{1F4AA}",
    tags: ["front-end", "methodology"],
    date: "20-Nov-2018",
  },
  "long-title-no-tags": {
    title: "Final Year Project - Miru awarded preliminary First Class Honours",
    description:
      "After three years of study and a final year spent building Miru, the project has been awarded a preliminary First Class Honours. Here is a look back at how it came together, what went well and what I would do differently next time around.",
    tags: [],
    date: "24-Jul-2019",
  },
  "page-no-date": { title: "Contact", description: "", tags: [], date: "" },
};

await mkdir(OUT, { recursive: true });
for (const [name, data] of Object.entries(samples)) {
  const file = path.join(OUT, `${name}.png`);
  await writeFile(file, await renderCard(data));
  console.log(file);
}
