/**
 * check-links.js — makes sure every internal link on the site actually goes somewhere.
 *
 * Run it with: npm run check   (or it runs by itself when you publish)
 *
 * It only looks at links within your own site. Links out to other websites aren't
 * checked — those can break at any time and there's nothing this could do about it.
 */

const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "site");

if (!fs.existsSync(OUT)) {
  console.error("No site/ folder. Run `npm run build` first.");
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (full.endsWith(".html")) pages.push(full);
  }
})(OUT);

const broken = [];

for (const page of pages) {
  const html = fs.readFileSync(page, "utf-8");
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
    const url = match[1];
    const target = url.endsWith("/") ? path.join(OUT, url, "index.html") : path.join(OUT, url);
    if (!fs.existsSync(target)) {
      broken.push({ url, page: path.relative(OUT, page) });
    }
  }
}

if (broken.length) {
  console.error(`\n${broken.length} broken link(s):\n`);
  for (const { url, page } of broken) console.error(`  ${url}  (linked from ${page})`);
  console.error("");
  process.exit(1);
}

console.log(`All internal links resolve (${pages.length} pages checked).`);
