// One-off: screenshots the live site for every page and viewport in
// config.json, with the normalising CSS applied, into docs/baseline/visual/.
//
//   node tests/visual/capture-baseline.mjs [origin]
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BASELINE_DIR, launchBrowser, screenshot, shots } from "./shared.mjs";

const origin = process.argv[2] || "https://ste-pam.com";

mkdirSync(BASELINE_DIR, { recursive: true });
const browser = await launchBrowser();
try {
  for (const shot of shots()) {
    const png = await screenshot(browser, new URL(shot.path, origin).href, shot.size);
    const file = path.join(BASELINE_DIR, `${shot.name}.png`);
    writeFileSync(file, png);
    console.log(`captured ${file}`);
  }
} finally {
  await browser.close();
}
