// Critical CSS: inlines the rules each page uses into its <head> and loads the
// full stylesheet without blocking the first paint. Runs on the built HTML,
// after css.js has written the stylesheet.
import Beasties from "beasties";

export default function (eleventyConfig) {
  let beasties;
  eleventyConfig.addTransform("critical-css", async function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    beasties ??= new Beasties({
      path: eleventyConfig.directories?.output ?? "_site",
      preload: "media",       // media="print" swapped to "all" on load, with a <noscript> fallback
      pruneSource: false,     // the full stylesheet is shared and cached across pages
      reduceInlineStyles: false,
      keyframes: "none",      // the cursor blink can wait for the full stylesheet
      logLevel: "warn",
    });
    // Beasties leaves its working marker on <html>.
    return (await beasties.process(content)).replace(" data-beasties-container", "");
  });
}
