import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

export default async function (eleventyConfig) {
  // Non-template folders, published by passthrough copy instead.
  eleventyConfig.ignores.add("src/styles/**");
  eleventyConfig.ignores.add("src/assets/**");
  eleventyConfig.ignores.add("src/media/**");
  eleventyConfig.ignores.add("src/old/**");
  eleventyConfig.ignores.add("src/static/**");

  // Auto-load every config/*.js module in alphabetical order.
  const dir = path.resolve("config");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".js")).sort();
  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    await mod.default(eleventyConfig);
  }
  eleventyConfig.setQuietMode(true);
}

export const config = {
  dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  templateFormats: ["njk", "md", "11ty.js"],
  markdownTemplateEngine: false, // article bodies may contain {{ }} in code samples
  htmlTemplateEngine: "njk",
};
