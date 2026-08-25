# How This Site Works — A Guide for Future Jill

A reference for when you come back after time away.

---

## The one-paragraph version

You write in Notion. When you mark something **Ready to publish**, Notion pokes a
small robot, which saves your writing into this folder as plain text, turns that text
into web pages, and puts them on jillmetcalfe.com — about **90 seconds**, start to
finish. A second robot also checks every 30 minutes, to catch anything scheduled for
later. You never have to touch code to publish.

---

## Publishing something

1. Write it in the Notion database (**jillmetcalfe.com**)
2. Set **Page** to say where it goes (see the table below)
3. Set **Status** to `Ready to publish`
4. Wait about 90 seconds

Notion flips the Status to `Published` by itself once it's done.

**To schedule it for later instead:** set **Status** to `Scheduled` and put a future
date and time in the **Date** field. It will sit and wait, and go out within half an
hour of that moment.

`Ready to publish` means *now*, whatever the Date says. `Scheduled` is the one that
waits. The **Date** field is otherwise just the date shown on the post.

**If it hasn't appeared:** GitHub repo → **Actions** tab → **Publish** → **Run
workflow** forces it. You shouldn't need this, but it does no harm.

### Where each Page value ends up

| Page | Lands at | Notes |
|---|---|---|
| Blog | `/blog/your-title/` | Also appears in the blog list and the RSS feed |
| Bookshelf | `/bookshelf/the-book/` | Grouped on `/bookshelf/` by Book Status |
| Bookshelf intro | top of `/bookshelf/` | The words above the list of books. Only ever one |
| About | `/about/` | Replaces the whole page |
| Now | `/now/` | Replaces the whole page |
| Projects | `/projects/` | Replaces the whole page |
| Home | `/` | The intro paragraph on the front page |
| *(blank)* | treated as Blog | |

### Taking something down

Change its **Status** in Notion to anything other than `Published` — `Draft` or
`Hold` both work — and it comes off the site on the next run. Deleting the Notion
page does the same thing.

Put it back to `Published` and it returns. Nothing is lost either way: every version
is in this folder's history.

Two things are never removed automatically: pages you wrote by hand that never came
from Notion, and anything published in that same run.

### Keeping something in Notion without publishing it

Put it inside a **toggle**. Toggles are skipped entirely — the arrow and everything
under it. Use them for draft sections, private notes, and headings you're not ready
to use yet. Works on every page type.

**It must be a plain toggle, not a toggle heading.** A heading that folds looks the
same but is a different kind of block, and it is *not* skipped — everything under it
would be published.

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

**Nothing published after a couple of minutes.** It will still go out within 30
minutes via the scheduled run, so this is never urgent. If it doesn't, go to the
repo's **Actions** tab and open the most recent **Publish** run.

Careful: a failed Notion sync shows as a **yellow warning, not a red X** — that's
deliberate, so a publishing problem can never take the live site down. Open the
"Pull new content from Notion" step and read it. The usual cause is an expired token.

**It publishes on the half hour but never instantly.** The instant path is the
`website-publish` Notion worker. Check it with `ntn workers runs list` from
`~/Developer/Claude Code/Jill/ntn/website-publish`. The usual cause is its GitHub
token having expired.

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

## What actually moves your writing

Two separate things publish this site, and they do different jobs. **Both are needed.**

| | What it does | When |
|---|---|---|
| **The Notion worker** (`website-publish`) | Notion pokes it the moment you set something to `Ready to publish`; it tells GitHub to build now | Instantly |
| **The scheduled run** in `publish.yml` | Checks Notion for anything now due | Every 30 minutes |

The worker is only a shortcut. The scheduled run is what actually publishes
`Scheduled` posts, because nothing pokes anything when a future date quietly arrives.
**Don't delete the schedule on the grounds that the worker made it redundant.**

The worker lives outside this repo, at `~/Developer/Claude Code/Jill/ntn/website-publish`.

---

## The secrets

In **GitHub → Settings → Secrets and variables → Actions**:

- `NOTION_API_KEY` — the Notion integration token
- `NOTION_DATABASE_ID` — `30a6227653ba80a58e08c6d6d4184a0e`

In the **Notion worker** (see it with `ntn workers env list`):

- `GITHUB_TOKEN` — lets the worker ask GitHub to build. Needs *Contents: Read and
  write* on this repo only
- `PUBLISH_WEBHOOK_SECRET` — must match the `X-Publish-Secret` header on the Notion
  automation. Stops strangers who find the URL from triggering builds

**All of these expire, and all of them fail quietly.** Publishing slows down or stops
and nothing shouts about it. If the site stops updating, check the tokens first:
regenerate the Notion one at notion.so/my-integrations, the GitHub one at
github.com/settings/personal-access-tokens.
