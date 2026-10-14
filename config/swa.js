// Writes staticwebapp.config.json for Azure Static Web Apps after each build:
// trailing-slash handling, legacy redirects, the custom 404 and cache headers.
//
// Static Web Apps can't substitute wildcard captures into redirect targets, so
// legacy prefix redirects are expanded into one route per article or file that
// actually exists in the build output.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export async function buildSwaConfig(outDir = "_site") {
  const manual = JSON.parse(await readFile("src/_data/redirects.json", "utf8"));
  const slugs = (await readdir(path.join(outDir, "blog"), { withFileTypes: true }).catch(() => []))
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  const oldFiles = (await readdir("src/old")).sort();
  const enc = (f) => f.split("/").map(encodeURIComponent).join("/");
  const lower = new Map(oldFiles.map((f) => [f.toLowerCase(), f]));
  const aliasTarget = (f) => manual.oldAliases[f] ?? lower.get(f.toLowerCase());

  const routes = [
    ...manual.routes,
    // /blog/article/{slug} -> /blog/{slug} (old URL scheme)
    ...slugs.map((s) => ({ route: `/blog/article/${s}`, redirect: `/blog/${s}`, statusCode: 301 })),
    // /Areas/ste_pam/Uploads/{file} -> /old/{file} (old upload folder)
    ...oldFiles.map((f) => ({ route: `/Areas/ste_pam/Uploads/${enc(f)}`, redirect: `/old/${enc(f)}`, statusCode: 301 })),
    // /res/{file} -> /old/{file} where a matching file exists (fixes long-broken article images)
    ...[...new Set([...oldFiles, ...Object.keys(manual.oldAliases)])]
      .filter(aliasTarget)
      .map((f) => ({ route: `/res/${enc(f)}`, redirect: `/old/${enc(aliasTarget(f))}`, statusCode: 301 })),
    { route: "/a/dist/*", headers: { "cache-control": "public, max-age=604800" } },
    { route: "/media/*", headers: { "cache-control": "public, max-age=2592000" } },
    { route: "/old/*", headers: { "cache-control": "public, max-age=2592000" } },
    { route: "/og/*", headers: { "cache-control": "public, max-age=86400" } },
  ];

  const config = {
    trailingSlash: "never",
    routes,
    responseOverrides: {
      "404": { rewrite: "/not-found/index.html", statusCode: 404 },
    },
    globalHeaders: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    mimeTypes: { ".webmanifest": "application/manifest+json" },
  };
  const json = JSON.stringify(config, null, 2);
  await writeFile(path.join(outDir, "staticwebapp.config.json"), json);
  return config;
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", async ({ directories }) => {
    await buildSwaConfig(directories?.output ?? "_site");
  });
}
