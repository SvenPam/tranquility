export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "a/dist/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/sprites": "a/dist/sprites" });
  eleventyConfig.addPassthroughCopy({ "src/old": "old" });
  eleventyConfig.addPassthroughCopy({ "src/static/*": "/" });
}
