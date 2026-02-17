const { Client } = require("@notionhq/client");
const { notionToMarkdown } = require("@tryfabric/martian");
const fs = require("fs");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
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

  // Update status to "Published" for all successfully synced posts
  for (const { pageId, title } of synced) {
    try {
      await notion.pages.update({
        page_id: pageId,
        properties: {
          Status: { status: { name: "Published" } },
        },
      });
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
  const date = getDate(page) || fallbackDate;
  const tags = getTags(page);
  const pageType = getPage(page);

  console.log(`Syncing: "${title}" (${date})`);

  // Fetch all blocks (the page content)
  const blocks = await fetchAllBlocks(page.id);

  // Convert Notion blocks to Markdown
  const markdown = notionToMarkdown(blocks);

  // Build frontmatter
  const frontmatter = buildFrontmatter({ title, date, tags });

  // Build the full file content
  const fileContent = `---\n${frontmatter}---\n\n${markdown}\n`;

  // Determine output path based on Page property
  const slug = slugify(title);
  const outputPath = getOutputPath(pageType, date, slug);

  // Write the file
  const fullPath = path.join(__dirname, "..", outputPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, fileContent, "utf-8");
  console.log(`Wrote: ${outputPath}`);

  return { pageId: page.id, title, outputPath };
}

async function fetchAllBlocks(pageId) {
  const blocks = [];
  let cursor;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
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

// --- Helpers ---

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
