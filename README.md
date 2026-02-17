# How This Site Works — A Guide for Future Jill

This is a reference for when you come back after time away and need a reminder of how everything fits together.

---

## The big picture

Your site (jillmetcalfe.github.io) is a Jekyll site hosted on GitHub Pages. You write content in Notion; it automatically publishes to your site. You don't need to touch any code to publish.

---

## Publishing a blog post

1. Write your post in the Notion database
2. Set the **Status** to `Ready to publish`
3. Set a **Date** if you want it to appear on a specific day (or leave it blank to publish immediately)
4. Wait up to 30 minutes — the sync runs on a schedule

The sync will automatically change the status to `Published` in Notion once it's done.

**To publish immediately:** You can trigger the sync manually — see below.

---

## Page types

The **Page** property in Notion controls where your content goes:

| Page value | Where it ends up |
|---|---|
| Blog | A blog post at `/blog/` |
| Bookshelf | A book entry at `/bookshelf/` |
| About | Overwrites your About page |
| (blank or anything else) | Treated as a blog post |

---

## Scheduling a post for a future date

Set the **Date** field to a future date and time. The sync runs every 30 minutes and will only publish it once that time has passed.

---

## Triggering a sync manually

Go to your GitHub repo → **Actions** tab → **Notion Sync** → **Run workflow**. This runs the sync immediately rather than waiting for the next 30-minute check.

---

## Keeping content in Notion without publishing it

Wrap anything in a **toggle** and it will be ignored during sync — the toggle and everything inside it is silently skipped.

Use this for:
- Section headings you want to keep for future use but aren't using right now
- Draft ideas that aren't ready
- Private notes to yourself
- Alternative versions of content

This works on any page type (blog posts, About, Now page, etc.).

---

## How the automation works (the plumbing)

When you change a page's status in Notion, a webhook fires → Notion sends it to **Make.com** → Make.com triggers a **GitHub Action** → the Action runs `scripts/notion-sync.js`, which pulls your content and converts it to Markdown files in the repo → GitHub Pages rebuilds the site automatically.

The sync also runs on a 30-minute schedule as a backup (useful for scheduled posts).

---

## Make.com and the personal access token (PAT)

Make.com needs a GitHub Personal Access Token to trigger the GitHub Action. **This token expires periodically.** If posts stop publishing instantly but still work on the 30-minute schedule, the PAT has probably expired.

To fix it:
1. Go to GitHub → Settings → Developer Settings → Personal access tokens → Generate a new token
2. Update the token in Make.com (in the GitHub connection settings for the scenario)

---

## Key files and where things live

| File/folder | What it does |
|---|---|
| `scripts/notion-sync.js` | The script that pulls from Notion and writes Markdown files |
| `.github/workflows/notion-sync.yml` | The GitHub Action that runs the script |
| `_posts/` | Blog post files (auto-generated, don't edit manually) |
| `_books/` | Bookshelf entries (auto-generated) |
| `about.md` | About page (auto-generated) |
| `_config.yml` | Site-wide settings (title, description, etc.) |
| `_sass/` | Styling |
| `WISHLIST.md` | Future ideas |
| `CHANGELOG.md` | What's changed and when |

---

## If something seems broken

- **Posts not publishing?** Check the Actions tab on GitHub — it shows logs for every sync run. Look for red ✗ marks.
- **Instant publish not working but scheduled works?** The Make.com PAT has probably expired (see above).
- **A post published with wrong content?** Check that the Notion page's Status was `Ready to publish` (not a draft) at sync time.
