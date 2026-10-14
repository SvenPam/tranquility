import { buildCss } from "../scripts/build-css.mjs";

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.on("eleventy.before", async ({ directories }) => {
    await buildCss({ outDir: directories?.output ?? "_site" });
  });
}
