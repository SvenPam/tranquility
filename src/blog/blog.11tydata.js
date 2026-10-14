export default {
  layout: "layouts/article.njk",
  permalink: (data) => `/blog/${data.page.fileSlug}/`,
  heroTitle: "Blog",
  leadingSpacer: true,
};
