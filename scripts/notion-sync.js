const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });
const databaseId = process.env.NOTION_DATABASE_ID;

async function main() {
  console.log("Querying Notion database for posts ready to publish...");

  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Find posts with Status = "Ready to publish" and Date <= today (or no date)
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Status",
          status: { equals: "Ready to publish" },
        },
        {
          or: [
            {
              property: "Date",
              date: { on_or_before: now },
            },
            {
              property: "Date",
              date: { is_empty: true },
            },
          ],
        },
      ],
    },
  });

  const posts = response.results;
  console.log(`Found ${posts.length} post(s) to sync.`);

  if (posts.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  const synced = [];

  for (const page of posts) {
    try {
      const result = await syncPost(page, now);
      synced.push(result);
    } catch (err) {
      console.error(`Failed to sync page ${page.id}: ${err.message}`);
    }
  }

  // Update status and publication date for all successfully synced posts
  const publishedAt = new Date().toISOString();
  for (const { pageId, title, hadDate } of synced) {
    try {
      const properties = {
        Status: { status: { name: "Published" } },
        "Last Updated": { date: { start: publishedAt } },
      };
      if (!hadDate) {
        properties.Date = { date: { start: publishedAt } };
      }
      await notion.pages.update({ page_id: pageId, properties });
      console.log(`Marked "${title}" as Published in Notion.`);
    } catch (err) {
      console.error(`Failed to update status for "${title}": ${err.message}`);
    }
  }

  console.log(`\nDone! Synced ${synced.length} post(s).`);
}

async function syncPost(page, fallbackDate) {
  // Extract properties
  const title = getTitle(page);
  const hadDate = !!getDate(page);
  const date = getDate(page) || fallbackDate;
  const tags = getTags(page);
  const pageType = getPage(page);

  console.log(`Syncing: "${title}" (${pageType}, ${date})`);

  // Convert Notion page to Markdown
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const mdResult = n2m.toMarkdownString(mdBlocks);
  const rawMarkdown = typeof mdResult === "string" ? mdResult : mdResult.parent;
  let markdown = rawMarkdown || "";

  // Build frontmatter based on page type
  let frontmatter;
  if (pageType === "Bookshelf") {
    const author = getSelect(page, "Author");
    const bookStatus = getSelect(page, "Book Status");
    const stars = getSelect(page, "Stars");
    const started = getDateProp(page, "Started");
    const finished = getDateProp(page, "Finished");
    frontmatter = buildBookFrontmatter({ title, author, bookStatus, stars, started, finished, tags });

    // If no page content, generate a summary for the body
    if (!markdown.trim()) {
      markdown = buildBookBody({ title, author, bookStatus, started, finished });
    }
  } else {
    frontmatter = buildFrontmatter({ title, date, tags });
  }

  // Build the full file content
  const fileContent = `---\n${frontmatter}---\n\n${markdown}\n`;

  // Determine output path based on Page property (use page ID for stable filenames)
  const pageId = page.id.replace(/-/g, "");
  const outputPath = getOutputPath(pageType, date, pageId);

  // Write the file
  const fullPath = path.join(__dirname, "..", outputPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, fileContent, "utf-8");
  console.log(`Wrote: ${outputPath}`);

  return { pageId: page.id, title, outputPath, hadDate };
}

// --- Property extractors ---

function getTitle(page) {
  const titleProp = page.properties.Title || page.properties.Name;
  if (!titleProp || !titleProp.title) return "Untitled";
  return titleProp.title.map((t) => t.plain_text).join("");
}

function getDate(page) {
  const dateProp = page.properties.Date;
  if (!dateProp || !dateProp.date || !dateProp.date.start) return null;
  return dateProp.date.start; // YYYY-MM-DD
}

function getTags(page) {
  const tagsProp = page.properties.Tags;
  if (!tagsProp || !tagsProp.multi_select) return [];
  return tagsProp.multi_select.map((t) => t.name);
}

function getPage(page) {
  const pageProp = page.properties.Page;
  if (!pageProp || !pageProp.select) return "Blog";
  return pageProp.select.name || "Blog";
}

function getSelect(page, propName) {
  const prop = page.properties[propName];
  if (!prop || !prop.select) return null;
  return prop.select.name || null;
}

function getDateProp(page, propName) {
  const prop = page.properties[propName];
  if (!prop || !prop.date || !prop.date.start) return null;
  return prop.date.start;
}

// --- Helpers ---

function buildBookBody({ title, author, bookStatus, started, finished }) {
  const lines = [];
  if (author) lines.push(`**by ${author}**`);
  lines.push("");
  if (bookStatus) lines.push(`**Status:** ${bookStatus}\n`);
  if (started) lines.push(`**Started:** ${formatDate(started)}`);
  if (finished) lines.push(`**Finished:** ${formatDate(finished)}`);
  return lines.join("\n");
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function buildBookFrontmatter({ title, author, bookStatus, stars, started, finished, tags }) {
  let fm = `layout: page\n`;
  fm += `title: "${title.replace(/"/g, '\\"')}"\n`;
  if (author) fm += `author: "${author}"\n`;
  if (tags.length > 0) fm += `categories: [${tags.join(", ")}]\n`;
  if (bookStatus) fm += `status: "${bookStatus}"\n`;
  if (started) fm += `started: "${started}"\n`;
  if (finished) fm += `finished: "${finished}"\n`;
  if (stars) fm += `stars: ${stars}\n`;
  return fm;
}

function buildFrontmatter({ title, date, tags }) {
  let fm = `layout: post\n`;
  fm += `title: "${title.replace(/"/g, '\\"')}"\n`;
  fm += `date: ${date}\n`;
  if (tags.length > 0) {
    fm += `tags: [${tags.join(", ")}]\n`;
  }
  return fm;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getOutputPath(pageType, date, slug) {
  switch (pageType) {
    case "Blog":
      return `_posts/${date}-${slug}.md`;
    case "Bookshelf":
      return `_books/${slug}.md`;
    default:
      return `_posts/${date}-${slug}.md`;
  }
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
