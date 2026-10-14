import { readFileSync } from "node:fs";
import { chromium } from "playwright";

export const CONFIG = JSON.parse(readFileSync(new URL("./config.json", import.meta.url), "utf8"));

/** Hides animations, network-dependent content and the retired Work nav item. */
export const NORMALISE_CSS = readFileSync(new URL("./normalise.css", import.meta.url), "utf8");

export const BASELINE_DIR = "docs/baseline/visual";
export const SETTLE_MS = 500;

/** Every page and viewport pair, named `{page}-{viewport}`. */
export function shots() {
  const out = [];
  for (const [page, path] of Object.entries(CONFIG.pages)) {
    for (const [viewport, size] of Object.entries(CONFIG.viewports)) {
      out.push({ name: `${page}-${viewport}`, page, path, viewport, size });
    }
  }
  return out;
}

/** Launches Chromium, honouring PLAYWRIGHT_CHROMIUM_PATH when it is set. */
export function launchBrowser() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath });
}

/**
 * Opens `url` at the given viewport, applies the normalising CSS, waits for
 * the page to settle and returns a viewport-only PNG buffer.
 */
export async function screenshot(browser, url, size) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1 });
  const page = await context.newPage();
  try {
    try {
      await page.goto(url, { waitUntil: "load", timeout: 60_000 });
    } catch (err) {
      // Slow or blocked third-party requests can hold up `load`; the content
      // they would add is hidden by the normalising CSS anyway.
      if (!/Timeout/i.test(String(err))) throw err;
    }
    await page.addStyleTag({ content: NORMALISE_CSS });
    await page.waitForTimeout(SETTLE_MS);
    return await page.screenshot({ fullPage: false });
  } finally {
    await context.close();
  }
}
