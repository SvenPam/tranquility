import { buildCss } from "../scripts/build-css.mjs";

export default function (eleventyConfig) {
  let build;
  const run = (outDir) => (build ??= buildCss({ outDir }));

  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.on("eleventy.before", async ({ directories }) => {
    build = null;
    await run(directories?.output ?? "_site");
  });
  // Templates link the stylesheet as ste-pam.min.css?v={{ cssVersion }}.
  eleventyConfig.addGlobalData("cssVersion", async () => (await run(eleventyConfig.directories?.output ?? "_site")).version);
}
