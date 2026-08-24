# How This Site Works — A Guide for Future Jill

A reference for when you come back after time away.

---

## The one-paragraph version

You write in Notion. Every 30 minutes a robot checks Notion for anything marked
**Ready to publish**, saves it into this folder as plain text, turns that text into
web pages, and puts them on jillmetcalfe.com. You never have to touch code to publish.

---

## Publishing something

1. Write it in the Notion database (**jillmetcalfe.com**)
2. Set **Page** to say where it goes (see the table below)
3. Set **Status** to `Ready to publish`
4. Wait up to 30 minutes

Notion flips the Status to `Published` by itself once it's done.

**To publish right now instead of waiting:** GitHub repo → **Actions** tab → **Publish** → **Run workflow**.

**To schedule for later:** set the **Date** field to a future date and time. It will
sit and wait until that moment passes.

### Where each Page value ends up

| Page | Lands at | Notes |
|---|---|---|
| Blog | `/blog/your-title/` | Also appears in the blog list and the RSS feed |
| Bookshelf | `/bookshelf/the-book/` | Grouped on `/bookshelf/` by Book Status |
| About | `/about/` | Replaces the whole page |
| Now | `/now/` | Replaces the whole page |
| Projects | `/projects/` | Replaces the whole page |
| Home | `/` | The intro paragraph on the front page |
| *(blank)* | treated as Blog | |

### Keeping something in Notion without publishing it

Put it inside a **toggle**. Toggles are skipped entirely — the arrow and everything
under it. Use them for draft sections, private notes, and headings you're not ready
to use yet. Works on every page type.

---

## Looking at the site before it goes live

Open Terminal, then:

```
cd ~/Developer/Claude\ Code/Jill/jillmetcalfe-website
npm start
```

Then open **http://localhost:8080** in your browser. Press **Ctrl-C** in Terminal to stop it.

What those commands mean:
- `cd` — "change directory", i.e. go to this folder
- `npm start` — builds the site and starts a little web server on your own computer

If it complains about missing packages, run `npm install` once first.

---

## What every file does

| File / folder | What it is |
|---|---|
| `content/` | Your writing, as plain text. Comes from Notion. **This is the site.** |
| `content/posts/` | Blog posts |
| `content/books/` | Bookshelf entries |
| `content/pages/` | About, Now, Projects, Home, and the Bookshelf intro |
| `build.js` | Turns `content/` into finished web pages. ~200 lines, readable top to bottom |
| `sync.js` | Fetches from Notion and writes into `content/` |
| `serve.js` | The little local web server for previewing |
| `style.css` | Every design decision on the site. One file, no framework |
| `DESIGN.md` | *Why* the design looks like it does. Change this first, then `style.css` |
| `templates/base.html` | The wrapper every page sits inside — header, footer, fonts |
| `site/` | The built website. Thrown away and rebuilt every time. Never edit by hand |
| `CNAME` | Tells GitHub the site lives at jillmetcalfe.com |
| `check-links.js` | Catches links pointing at pages that don't exist. Runs on every publish |
| `.github/workflows/publish.yml` | The robot: sync, build, check, publish |

---

## The commands

| Command | What it does |
|---|---|
| `npm start` | Build the site and preview it at localhost:8080 |
| `npm run build` | Just rebuild `site/` from `content/` |
| `npm run sync` | Just pull the latest from Notion (needs the API key set locally) |
| `npm run check` | Rebuild, then confirm no link on the site points at a missing page |
| `npm install` | Install the four packages this needs. Run once, or after an update |

---

## Changing how the site looks

Everything visual is in **`style.css`**. It's organised in numbered sections with
comments. The most useful bit is right at the top:

```css
--accent-tint: #F2DCF0;   /* pale background for quotes and call-outs */
--accent:      #B509AC;   /* links and buttons */
--accent-dark: #8A0784;   /* what they turn when you hover */
```

Change those three lines and the entire site changes colour. Dark mode has its own
set further down the file (cyan). `DESIGN.md` §2 lists six quieter alternatives that
are known to work — petrol, mauve, green, blue, cool grey, cool greyish pink — with
the contrast numbers for each.

---

## When something goes wrong

**Nothing published after 30 minutes.** Go to the repo's **Actions** tab and look at
the most recent **Publish** run. A red X means it failed — click in to see why.
The usual cause is the Notion API key having expired.

**The site is live but looks unstyled.** The stylesheet didn't get copied. Run
`npm run build` locally and check `site/style.css` exists.

**A post published with the wrong web address.** The address comes from the title.
If you rename a post in Notion and republish it, the old address stops working and a
new one appears — `sync.js` cleans up the old file automatically, but anyone who
linked to the old address will hit a 404.

**Everything is broken and you want to start over.** Nothing in `site/` matters —
delete the whole folder and run `npm run build`. Your writing lives in `content/`
and in Notion, so it can't be lost this way.

---

## The two secrets

Stored in GitHub under **Settings → Secrets and variables → Actions**:

- `NOTION_API_KEY` — the Notion integration token
- `NOTION_DATABASE_ID` — `30a6227653ba80a58e08c6d6d4184a0e`

The Notion token expires periodically. When it does, publishing silently stops —
regenerate it at notion.so/my-integrations and update the secret.
