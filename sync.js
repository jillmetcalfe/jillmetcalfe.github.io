/**
 * sync.js — pulls everything marked "Ready to publish" out of Notion and
 * writes it into content/ as markdown files.
 *
 * Run it with: npm run sync
 * Needs two environment variables: NOTION_API_KEY and NOTION_DATABASE_ID.
 *
 * The Page property in Notion decides where each entry lands:
 *   Blog      -> content/posts/<slug>.md      shows at /blog/<slug>/
 *   Bookshelf -> content/books/<slug>.md      shows at /bookshelf/<slug>/
 *   About     -> content/pages/about.md       shows at /about/
 *   Now       -> content/pages/now.md         shows at /now/
 *   Projects  -> content/pages/projects.md    shows at /projects/
 *   Home      -> content/pages/home.md        the intro on the front page
 */

const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const databaseId = process.env.NOTION_DATABASE_ID;

const CONTENT = path.join(__dirname, "content");

// Which Page values are one-of-a-kind pages rather than lists of entries.
const SINGLE_PAGES = { About: "about", Now: "now", Projects: "projects", Home: "home" };

async function main() {
  if (!process.env.NOTION_API_KEY || !databaseId) {
    throw new Error("Set NOTION_API_KEY and NOTION_DATABASE_ID before running this.");
  }

  const now = new Date().toISOString();
  const today = now.split("T")[0];

  console.log("Looking for entries marked 'Ready to publish' or due 'Scheduled'…");

  // Two ways an entry can be due:
  //
  //   "Ready to publish"  — go out now, whatever the Date says. The Date is just
  //                         the date shown on the post.
  //   "Scheduled"         — wait until the Date has passed, then go out. Picked up
  //                         by the half-hourly run in publish.yml, not by the
  //                         Notion automation (which only fires on "Ready to
  //                         publish", so scheduling something doesn't kick off a
  //                         build that has nothing to do).
  //
  // A "Scheduled" entry with no Date at all has nothing to wait for, so it goes
  // out on the next run.
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        { property: "Status", status: { equals: "Ready to publish" } },
        {
          and: [
            { property: "Status", status: { equals: "Scheduled" } },
            {
              or: [
                { property: "Date", date: { on_or_before: now } },
                { property: "Date", date: { is_empty: true } },
              ],
            },
          ],
        },
      ],
    },
  });

  const entries = response.results;
  console.log(`Found ${entries.length}.`);
  if (entries.length === 0) return;

  const synced = [];
  for (const page of entries) {
    try {
      synced.push(await syncEntry(page, today));
    } catch (err) {
      console.error(`Could not sync ${page.id}: ${err.message}`);
    }
  }

  // Mark everything that made it as Published, and stamp the time.
  const publishedAt = new Date().toISOString();
  for (const { pageId, title, hadDate } of synced) {
    try {
      const properties = {
        Status: { status: { name: "Published" } },
        "Last Updated": { date: { start: publishedAt } },
      };
      if (!hadDate) properties.Date = { date: { start: publishedAt } };
      await notion.pages.update({ page_id: pageId, properties });
      console.log(`Marked "${title}" as Published in Notion.`);
    } catch (err) {
      console.error(`Could not update status for "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone. Synced ${synced.length} entry/entries.`);
}

async function syncEntry(page, fallbackDate) {
  const title = getTitle(page);
  const hadDate = !!getDate(page);
  const date = getDate(page) || fallbackDate;
  const tags = getTags(page);
  const pageType = getPageType(page);
  const notionId = page.id.replace(/-/g, "");

  console.log(`Syncing "${title}" (${pageType})`);

  const blocks = await n2m.pageToMarkdown(page.id);
  const result = n2m.toMarkdownString(dropToggles(blocks));
  const body = (typeof result === "string" ? result : result.parent) || "";

  const fields = { title, notion_id: notionId };
  let dir;
  let filename;

  if (pageType === "Bookshelf") {
    dir = path.join(CONTENT, "books");
    filename = slugify(title);
    fields.slug = filename;
    addIf(fields, "author", getSelect(page, "Author"));
    addIf(fields, "status", getSelect(page, "Book Status"));
    addIf(fields, "stars", getSelect(page, "Stars"));
    addIf(fields, "started", getDateProp(page, "Started"));
    addIf(fields, "finished", getDateProp(page, "Finished"));
    if (tags.length) fields.tags = tags;
  } else if (SINGLE_PAGES[pageType]) {
    dir = path.join(CONTENT, "pages");
    filename = SINGLE_PAGES[pageType];
    fields.updated = date.split("T")[0];
  } else {
    dir = path.join(CONTENT, "posts");
    filename = slugify(title);
    fields.slug = filename;
    fields.date = date;
    if (tags.length) fields.tags = tags;
  }

  // If this entry was published before under a different title, its old file
  // is still sitting there. Find it by the Notion id and remove it.
  removeStaleCopies(dir, notionId, `${filename}.md`);

  const file = path.join(dir, `${filename}.md`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `---\n${toYaml(fields)}---\n\n${body.trim()}\n`, "utf-8");
  console.log(`  wrote ${path.relative(__dirname, file)}`);

  return { pageId: page.id, title, hadDate };
}

// --- Content filters ------------------------------------------------------

/** Anything inside a toggle in Notion is treated as private and never published. */
function dropToggles(blocks) {
  return blocks
    .filter((block) => block.type !== "toggle")
    .map((block) => ({ ...block, children: dropToggles(block.children || []) }));
}

function removeStaleCopies(dir, notionId, keepFilename) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".md") || file === keepFilename) continue;
    const contents = fs.readFileSync(path.join(dir, file), "utf-8");
    if (contents.includes(`notion_id: ${notionId}`)) {
      fs.unlinkSync(path.join(dir, file));
      console.log(`  removed old copy ${file}`);
    }
  }
}

// --- Reading Notion properties -------------------------------------------

function getTitle(page) {
  const prop = page.properties.Title || page.properties.Name;
  if (!prop || !prop.title) return "Untitled";
  return prop.title.map((t) => t.plain_text).join("");
}

function getDate(page) {
  const prop = page.properties.Date;
  return prop && prop.date && prop.date.start ? prop.date.start : null;
}

function getTags(page) {
  const prop = page.properties.Tags;
  return prop && prop.multi_select ? prop.multi_select.map((t) => t.name) : [];
}

function getPageType(page) {
  const prop = page.properties.Page;
  return (prop && prop.select && prop.select.name) || "Blog";
}

function getSelect(page, name) {
  const prop = page.properties[name];
  return (prop && prop.select && prop.select.name) || null;
}

function getDateProp(page, name) {
  const prop = page.properties[name];
  return prop && prop.date && prop.date.start ? prop.date.start : null;
}

// --- Writing frontmatter --------------------------------------------------

function addIf(obj, key, value) {
  if (value !== null && value !== undefined && value !== "") obj[key] = value;
}

function toYaml(fields) {
  return Object.entries(fields)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: [${value.map(quote).join(", ")}]\n`;
      return `${key}: ${quote(value)}\n`;
    })
    .join("");
}

function quote(value) {
  const s = String(value);
  return /^[A-Za-z0-9][A-Za-z0-9 .\-_:+]*$/.test(s) && !/^\d{4}-\d{2}-\d{2}/.test(s)
    ? `"${s}"`
    : `"${s.replace(/"/g, '\\"')}"`;
}

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

main().catch((err) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
