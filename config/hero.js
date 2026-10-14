// Per-page hero background. The original image is used as is: the stylesheet
// scales it to the viewport width, so no resized copies are needed.
//
// `focus` is accepted so pages can keep their heroFocus front matter, but it
// has no effect on the output.
export async function heroStyle(src, focus, outDir = "_site") {
  if (!src) return "";
  return [
    "<style>",
    `    .hero { background-image: url('${src}'); }`,
    "</style>",
  ].join("\n");
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/media": "media" });

  eleventyConfig.addNunjucksAsyncShortcode("heroStyle", function (src, focus) {
    const outDir = eleventyConfig.directories?.output ?? "_site";
    return heroStyle(src, focus, outDir);
  });
}
