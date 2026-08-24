/**
 * build.js — turns the markdown in content/ into the finished website in site/
 *
 * Run it with:  npm run build
 * Preview with: npm start   (then open http://localhost:8080)
 *
 * There is no theme, no framework and no magic. Everything this site does
 * happens in this one file. Read it top to bottom and you'll know the lot.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

// --- Settings -------------------------------------------------------------

const SITE = {
  title: "Jill Metcalfe",
  description: "Writing about building things, automation, and Notion.",
  url: "https://jillmetcalfe.com",
  author: "Jill Metcalfe",
};

// The navigation bar, in order. Pages you haven't written yet are skipped.
const NAV = [
  { label: "About", href: "/about/" },
  { label: "Blog", href: "/blog/" },
  { label: "Bookshelf", href: "/bookshelf/" },
  { label: "Now", href: "/now/" },
  { label: "Projects", href: "/projects/" },
];

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "site");

marked.setOptions({ gfm: true, breaks: false });

// --- Small helpers --------------------------------------------------------

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const slugify = (s = "") =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";

/** "2026-02-18" -> "18 February 2026" */
function formatDate(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(String(value).length === 10 ? value + "T00:00:00Z" : value);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function toDate(value) {
  if (!value) return new Date(0);
  const d = value instanceof Date ? value : new Date(String(value).length === 10 ? value + "T00:00:00Z" : value);
  return isNaN(d) ? new Date(0) : d;
}

/** First ~40 words of the body, for list pages and meta descriptions. */
function excerpt(markdown, words = 40) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const parts = text.split(" ").filter(Boolean);
  return parts.length > words ? parts.slice(0, words).join(" ") + "…" : parts.join(" ");
}

/** Wide tables get their own scroll container so the page never scrolls sideways. */
function renderMarkdown(md) {
  return marked.parse(md).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, "</table></div>");
}

// --- Reading content ------------------------------------------------------

/** Reads every .md file in content/<dir> and returns them as objects. */
function readCollection(dir) {
  const full = path.join(CONTENT, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf-8");
      const { data, content } = matter(raw);
      return { ...data, body: content, slug: data.slug || slugify(data.title) || file.replace(/\.md$/, ""), file };
    });
}

function readPage(name) {
  const file = path.join(CONTENT, "pages", `${name}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return { ...data, body: content };
}

// --- Writing output -------------------------------------------------------

const TEMPLATE = fs.readFileSync(path.join(ROOT, "templates", "base.html"), "utf-8");

/**
 * Wraps a chunk of HTML in the site shell and writes it to site/<urlPath>/index.html
 * (or site/index.html for the homepage).
 */
function writePage({ urlPath, title, description, content, ogtype = "website" }) {
  const nav = NAV.map((item) => {
    const current = item.href === urlPath ? ' aria-current="page"' : "";
    return `<a href="${item.href}"${current}>${item.label}</a>`;
  }).join("\n        ");

  const fullTitle = urlPath === "/" ? SITE.title : `${title} · ${SITE.title}`;

  const html = TEMPLATE.replace(/\{\{title\}\}/g, escapeHtml(fullTitle))
    .replace(/\{\{sitetitle\}\}/g, escapeHtml(SITE.title))
    .replace(/\{\{description\}\}/g, escapeHtml(description || SITE.description))
    .replace(/\{\{canonical\}\}/g, SITE.url + urlPath)
    .replace(/\{\{ogtype\}\}/g, ogtype)
    .replace(/\{\{year\}\}/g, new Date().getFullYear())
    .replace(/\{\{nav\}\}/g, nav)
    .replace(/\{\{content\}\}/g, content);

  const dest = urlPath === "/" ? path.join(OUT, "index.html") : path.join(OUT, urlPath, "index.html");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, "utf-8");
  return dest;
}

// --- Page builders --------------------------------------------------------

function postCard(post) {
  return `      <li>
        <a class="card" href="/blog/${post.slug}/">
          <span class="meta">${formatDate(post.date)}</span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(excerpt(post.body, 28))}</p>
        </a>
      </li>`;
}

function postRow(post) {
  const tags = (post.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
  return `      <li>
        <span class="meta">${formatDate(post.date)}</span>
        <h2><a href="/blog/${post.slug}/">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(excerpt(post.body))}</p>
        ${tags}
      </li>`;
}

function buildHome(posts) {
  const home = readPage("home");
  const intro = home ? renderMarkdown(home.body) : `<p class="lead">${escapeHtml(SITE.description)}</p>`;
  const recent = posts.slice(0, 5);

  const list = recent.length
    ? `      <h2>Recent writing</h2>
      <ul class="post-list">
${recent.map(postCard).join("\n")}
      </ul>
      <p><a href="/blog/">All posts &rarr;</a></p>`
    : "";

  writePage({
    urlPath: "/",
    title: SITE.title,
    description: SITE.description,
    content: `      <div class="prose">
${intro}
      </div>
${list}`,
  });
}

function buildBlogIndex(posts) {
  const list = posts.length
    ? `      <ul class="post-list">
${posts.map(postRow).join("\n")}
      </ul>`
    : `      <p class="lead">Nothing published yet. Soon.</p>`;

  writePage({
    urlPath: "/blog/",
    title: "Blog",
    description: `Everything ${SITE.author} has written.`,
    content: `      <div class="page-header">
        <h1>Blog</h1>
      </div>
${list}`,
  });
}

function buildPosts(posts) {
  posts.forEach((post) => {
    const tags = (post.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
    writePage({
      urlPath: `/blog/${post.slug}/`,
      title: post.title,
      description: excerpt(post.body, 30),
      ogtype: "article",
      content: `      <article>
        <div class="page-header">
          <h1>${escapeHtml(post.title)}</h1>
          <span class="meta"><time datetime="${toDate(post.date).toISOString()}">${formatDate(post.date)}</time></span>
          ${tags ? `<p class="meta">${tags}</p>` : ""}
        </div>
        <div class="prose">
${renderMarkdown(post.body)}
        </div>
      </article>
      <hr>
      <p><a href="/blog/">&larr; All posts</a></p>`,
    });
  });
}

const BOOK_GROUPS = [
  { status: "Reading", heading: "Currently reading" },
  { status: "Finished", heading: "Finished" },
  { status: "Queued", heading: "Up next" },
  { status: "DNF", heading: "Put down unfinished" },
];

function buildBookshelf(books) {
  const intro = readPage("bookshelf");

  const groups = BOOK_GROUPS.map(({ status, heading }) => {
    const inGroup = books
      .filter((b) => b.status === status)
      .sort((a, b) => toDate(b.finished || b.started) - toDate(a.finished || a.started));
    if (!inGroup.length) return "";

    const items = inGroup
      .map((book) => {
        const stars = book.stars ? ` <span class="stars">${"★".repeat(Number(book.stars))}</span>` : "";
        const author = book.author ? ` <span class="book-author">by ${escapeHtml(book.author)}</span>` : "";
        return `          <li><a class="book-title" href="/bookshelf/${book.slug}/">${escapeHtml(book.title)}</a>${author}${stars}</li>`;
      })
      .join("\n");

    return `      <section class="book-group">
        <h2>${heading}</h2>
        <ul class="book-list">
${items}
        </ul>
      </section>`;
  })
    .filter(Boolean)
    .join("\n");

  writePage({
    urlPath: "/bookshelf/",
    title: "Bookshelf",
    description: "What I'm reading, have read, and plan to read.",
    content: `      <div class="page-header">
        <h1>Bookshelf</h1>
      </div>
${intro ? `      <div class="prose">\n${renderMarkdown(intro.body)}\n      </div>\n` : ""}${groups || `      <p class="lead">No books on the shelf yet.</p>`}`,
  });

  books.forEach((book) => {
    const bits = [];
    if (book.author) bits.push(`by ${escapeHtml(book.author)}`);
    if (book.status) bits.push(escapeHtml(book.status));
    if (book.started) bits.push(`started ${formatDate(book.started)}`);
    if (book.finished) bits.push(`finished ${formatDate(book.finished)}`);
    const stars = book.stars ? `<p class="stars">${"★".repeat(Number(book.stars))}</p>` : "";

    writePage({
      urlPath: `/bookshelf/${book.slug}/`,
      title: book.title,
      description: `${book.title}${book.author ? ` by ${book.author}` : ""} — notes and thoughts.`,
      ogtype: "article",
      content: `      <article>
        <div class="page-header">
          <h1>${escapeHtml(book.title)}</h1>
          <span class="meta">${bits.join(" · ")}</span>
          ${stars}
        </div>
        <div class="prose">
${renderMarkdown(book.body)}
        </div>
      </article>
      <hr>
      <p><a href="/bookshelf/">&larr; Back to the bookshelf</a></p>`,
    });
  });
}

/** about / now / projects — plain pages driven by content/pages/<name>.md */
function buildStandalonePages() {
  const built = [];
  ["about", "now", "projects"].forEach((name) => {
    const page = readPage(name);
    if (!page) return;
    const updated = page.updated ? `<span class="meta">Last updated ${formatDate(page.updated)}</span>` : "";
    writePage({
      urlPath: `/${name}/`,
      title: page.title || name.charAt(0).toUpperCase() + name.slice(1),
      description: excerpt(page.body, 30),
      content: `      <div class="page-header">
        <h1>${escapeHtml(page.title || name)}</h1>
        ${updated}
      </div>
      <div class="prose">
${renderMarkdown(page.body)}
      </div>`,
    });
    built.push(name);
  });
  return built;
}

function buildFeed(posts) {
  const updated = posts.length ? toDate(posts[0].date).toISOString() : new Date().toISOString();
  const entries = posts
    .slice(0, 20)
    .map(
      (post) => `  <entry>
    <title>${escapeHtml(post.title)}</title>
    <link href="${SITE.url}/blog/${post.slug}/"/>
    <id>${SITE.url}/blog/${post.slug}/</id>
    <updated>${toDate(post.date).toISOString()}</updated>
    <summary>${escapeHtml(excerpt(post.body, 60))}</summary>
  </entry>`
    )
    .join("\n");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeHtml(SITE.title)}</title>
  <subtitle>${escapeHtml(SITE.description)}</subtitle>
  <link href="${SITE.url}/feed.xml" rel="self"/>
  <link href="${SITE.url}/"/>
  <id>${SITE.url}/</id>
  <updated>${updated}</updated>
  <author><name>${escapeHtml(SITE.author)}</name></author>
${entries}
</feed>
`;
  fs.writeFileSync(path.join(OUT, "feed.xml"), feed, "utf-8");
}

function buildExtras(posts, books, pages) {
  // Sitemap
  const urls = ["/", "/blog/", "/bookshelf/"]
    .concat(pages.map((p) => `/${p}/`))
    .concat(posts.map((p) => `/blog/${p.slug}/`))
    .concat(books.map((b) => `/bookshelf/${b.slug}/`));

  const sitemap = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc></url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(OUT, "sitemap.xml"), sitemap, "utf-8");

  fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`, "utf-8");

  // Tells GitHub Pages "these files are already built, don't run Jekyll on them"
  fs.writeFileSync(path.join(OUT, ".nojekyll"), "", "utf-8");

  // The custom domain
  const cname = path.join(ROOT, "CNAME");
  if (fs.existsSync(cname)) fs.copyFileSync(cname, path.join(OUT, "CNAME"));

  // The stylesheet, and anything in assets/
  fs.copyFileSync(path.join(ROOT, "style.css"), path.join(OUT, "style.css"));
  const assets = path.join(ROOT, "assets");
  if (fs.existsSync(assets)) fs.cpSync(assets, path.join(OUT, "assets"), { recursive: true });
}

// --- Go -------------------------------------------------------------------

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const posts = readCollection("posts")
    .filter((p) => p.draft !== true)
    .sort((a, b) => toDate(b.date) - toDate(a.date));

  const books = readCollection("books");

  buildHome(posts);
  buildBlogIndex(posts);
  buildPosts(posts);
  buildBookshelf(books);
  const pages = buildStandalonePages();
  buildFeed(posts);
  buildExtras(posts, books, pages);

  console.log(`Built ${posts.length} post(s), ${books.length} book(s), ${pages.length} page(s) into site/`);
}

build();
