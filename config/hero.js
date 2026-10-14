// No-op until hero crops are implemented. Returns no <style> block.
export default function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("heroStyle", async () => "");
}
