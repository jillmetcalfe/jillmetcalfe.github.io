/**
 * sync.js — keeps content/ in step with Notion.
 *
 * Two jobs, in order:
 *   1. Anything marked "Ready to publish", or "Scheduled" and now due, is
 *      written into content/ as markdown and flipped to "Published" in Notion.
 *   2. Anything set to "Unpublished", or deleted from Notion altogether, is
 *      removed from content/. Nothing else takes a page down. Statuses like
 *      "Draft" or "Editing" mean "I'm working on this", which is just as true
 *      of edits to a page that's already live as it is of something brand new.
 *
 * Run it with: npm run sync
 * Needs two environment variables: NOTION_API_KEY and NOTION_DATABASE_ID.
 *
 * The Page property in Notion decides where each entry lands:
 *   Blog            -> content/posts/<slug>.md     shows at /blog/<slug>/
 *   Bookshelf       -> content/books/<slug>.md     shows at /bookshelf/<slug>/
 *   Bookshelf intro -> content/pages/bookshelf.md  the words above the book list
 *   About           -> content/pages/about.md      shows at /about/
 *   Now             -> content/pages/now.md        shows at /now/
 *   Projects        -> content/pages/projects.md   shows at /projects/
 *   Home            -> content/pages/home.md       the intro on the front page
 */

const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const matter = require("gray-matter");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const databaseId = process.env.NOTION_DATABASE_ID;

const CONTENT = path.join(__dirname, "content");

// Which Page values are one-of-a-kind pages rather than lists of entries.
const SINGLE_PAGES = {
  About: "about",
  Now: "now",
  Projects: "projects",
  Home: "home",
  // The words at the top of /bookshelf/, above the list of books. Separate from
  // "Bookshelf", which is what an individual book uses.
  "Bookshelf intro": "bookshelf",
};

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
  //
  // The two Scheduled branches are spelled out separately rather than as one
  // branch with an inner or/. Notion's API only allows filters to nest two deep,
  // and or -> and -> or is three.
  const scheduled = { property: "Status", status: { equals: "Scheduled" } };
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        { property: "Status", status: { equals: "Ready to publish" } },
        { and: [scheduled, { property: "Date", date: { on_or_before: now } }] },
        { and: [scheduled, { property: "Date", date: { is_empty: true } }] },
      ],
    },
  });

  const entries = response.results;
  console.log(`Found ${entries.length}.`);

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

  // Anything that is no longer published in Notion comes off the site.
  await removeUnpublished(synced.map((s) => s.pageId.replace(/-/g, "")));
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

  const file = path.join(dir, `${filename}.md`);

  // If this entry was published before under a different title — or as a
  // different kind of page — its old file is still sitting there. Remove it.
  removeStaleCopies(file, notionId);

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

/**
 * Read the notion_id out of a markdown file's frontmatter.
 *
 * Returns null for files that don't have one. Those are the hand-written pages
 * that predate the Notion sync, and nothing here is ever allowed to delete them.
 */
function readNotionId(file) {
  try {
    const { data } = matter(fs.readFileSync(file, "utf-8"));
    return data.notion_id ? String(data.notion_id).replace(/-/g, "") : null;
  } catch {
    return null;
  }
}

/**
 * Remove any other file that came from this same Notion page.
 *
 * Looks across every content folder, not just the one we're about to write to.
 * A page that changes its Page property — a blog post that becomes a book, say —
 * lands in a different folder, and its old file would otherwise sit there
 * forever, showing up on the site twice.
 */
function removeStaleCopies(keepPath, notionId) {
  for (const file of allContentFiles()) {
    if (file === keepPath) continue;
    if (readNotionId(file) === notionId) {
      fs.unlinkSync(file);
      console.log(`  removed old copy ${path.relative(__dirname, file)}`);
    }
  }
}

/** Every markdown file under content/, whichever folder it lives in. */
function allContentFiles() {
  const files = [];
  for (const sub of ["posts", "books", "pages"]) {
    const dir = path.join(CONTENT, sub);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (name.endsWith(".md")) files.push(path.join(dir, name));
    }
  }
  return files;
}

/**
 * Take down anything that has been pulled from the site.
 *
 * Exactly two things unpublish a page: setting its Status to "Unpublished", and
 * deleting the Notion page outright — a deleted page stops coming back from
 * Notion at all, so nothing here can see it any more.
 *
 * Every other Status leaves a live page exactly where it is. That is the whole
 * point: "Draft", "Editing" and anything else you invent all mean "I'm working
 * on this", which happens just as often to a page that's already live as to a
 * new one. The site keeps showing the last version that was synced until the
 * entry is marked Ready to publish again.
 *
 * Because this asks "is it Unpublished?" rather than "is it on the approved
 * list?",
 * you can add a new Status in Notion whenever you want a new label without
 * touching this file. Anything it doesn't recognise is left alone.
 *
 * Two things are never touched:
 *   - files with no notion_id — those are hand-written and predate the sync
 *   - anything published in this very run, in case Notion hasn't caught up yet
 */
async function removeUnpublished(justSynced) {
  const justSyncedIds = new Set(justSynced);
  const known = new Set(); // every entry Notion still knows about
  const pulled = new Set(); // the ones set to "Unpublished"

  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    for (const page of res.results) {
      const id = page.id.replace(/-/g, "");
      known.add(id);
      if (getStatus(page) === "Unpublished") pulled.add(id);
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  // A database that comes back completely empty is almost certainly a failed or
  // half-finished query rather than the truth. Deleting every post on the
  // strength of that would be a bad trade, so don't.
  if (known.size === 0) {
    console.warn("Notion returned no entries at all — not removing anything.");
    return;
  }

  let removed = 0;
  for (const file of allContentFiles()) {
    const id = readNotionId(file);
    if (!id) continue; // hand-written, never ours to delete
    if (justSyncedIds.has(id)) continue; // published moments ago
    if (known.has(id) && !pulled.has(id)) continue; // in Notion, not pulled
    fs.unlinkSync(file);
    console.log(`Unpublished: removed ${path.relative(__dirname, file)}`);
    removed++;
  }

  console.log(
    removed === 0
      ? "Nothing to unpublish."
      : `Unpublished ${removed} entry/entries.`,
  );
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

function getStatus(page) {
  const prop = page.properties.Status;
  return (prop && prop.status && prop.status.name) || null;
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
