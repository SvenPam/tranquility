// Front matter validator. Checks src/blog/*.md against the article schema
// and src/*.njk / src/*.md pages against the page schema.
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { article, page } from "./lib/schema.mjs";

const SRC = "src";
const BLOG = path.join(SRC, "blog");

const errors = [];

function formatIssues(file, issues) {
  for (const issue of issues) {
    const field = issue.path.length ? issue.path.join(".") : "(root)";
    errors.push(`${file}: ${field}: ${issue.message}`);
  }
}

async function load(file) {
  const raw = await readFile(file, "utf8");
  try {
    return matter(raw);
  } catch (err) {
    errors.push(`${file}: (front matter): ${err.message.split("\n")[0]}`);
    return null;
  }
}

// Articles
let articleCount = 0;
const slugs = new Map();
if (existsSync(BLOG)) {
  const files = (await readdir(BLOG)).filter((f) => f.endsWith(".md")).sort();
  for (const name of files) {
    const file = path.join(BLOG, name).split(path.sep).join("/");
    articleCount++;

    const slug = name.slice(0, -".md".length).toLowerCase();
    if (slugs.has(slug)) {
      errors.push(`${file}: slug: duplicates ${slugs.get(slug)} (slugs are compared ignoring case)`);
    } else {
      slugs.set(slug, file);
    }

    const parsed = await load(file);
    if (!parsed) continue;
    const result = article.safeParse(parsed.data);
    if (!result.success) formatIssues(file, result.error.issues);
  }
}

// Pages
let pageCount = 0;
const pageFiles = (await readdir(SRC, { withFileTypes: true }))
  .filter((d) => d.isFile())
  .map((d) => d.name)
  .filter((f) => (f.endsWith(".njk") || f.endsWith(".md")) && !f.endsWith(".xml.njk") && !f.endsWith(".txt.njk"))
  .sort();
for (const name of pageFiles) {
  const file = path.join(SRC, name).split(path.sep).join("/");
  const parsed = await load(file);
  if (!parsed || !parsed.matter || parsed.data.title === undefined) continue;
  pageCount++;
  const result = page.safeParse(parsed.data);
  if (!result.success) formatIssues(file, result.error.issues);
}

if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} front matter error(s)`);
  process.exit(1);
}

console.log(`validated ${articleCount} articles, ${pageCount} pages`);
