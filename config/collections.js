const GLOB = "./src/blog/*.md";

export default function (eleventyConfig) {
  eleventyConfig.addCollection("articles", (api) =>
    api.getFilteredByGlob(GLOB).sort((a, b) => b.date - a.date));
  eleventyConfig.addCollection("articlesAsc", (api) =>
    api.getFilteredByGlob(GLOB).sort((a, b) => a.date - b.date));
}
