# Project: jillmetcalfe.com

## About the user
- Jill is not a coder — always explain terminal commands, git operations, and technical concepts in plain language
- Don't assume familiarity with programming jargon
- When suggesting commands, explain what each part does

## What this is
A static website built by two small Node scripts. **There is no framework, no theme,
and no static site generator.** Jekyll was removed on 2026-08-24 — do not reintroduce it,
or Ruby, or a CSS framework.

- Content is written in Notion and synced down as markdown
- Hosted on GitHub Pages at jillmetcalfe.com
- Git remote: https://github.com/jillmetcalfe/jillmetcalfe.github.io.git
- Deployed by `.github/workflows/publish.yml` using GitHub Pages' "GitHub Actions" source

## Key files
- `content/` — the actual writing (posts, books, pages). Synced from Notion; safe to hand-edit
- `build.js` — markdown → HTML. The whole site generator, ~200 lines
- `sync.js` — Notion → `content/`
- `serve.js` — local preview server (`npm start`)
- `style.css` — all styling, hand-written, no preprocessor
- `templates/base.html` — the HTML shell every page uses
- `DESIGN.md` — the design system. **Read this before changing anything visual**
- `site/` — build output. Gitignored. Never edit directly

## Design rules
`DESIGN.md` is authoritative. The short version:
- Reading column capped at 680px. Never wider
- Fraunces for headings, IBM Plex Sans for body, IBM Plex Mono for code
- Cool cream paper `#F5F2EE`, ink `#222120`, one accent (Petrol `#156269`) at a time
- Never pure black or pure white. Shadows tinted with ink, never `rgba(0,0,0,…)`
- Spacing only from the 8px scale (the `--s-*` variables)
- No sidebars, popups, social widgets, or anything competing with the words

If a change contradicts DESIGN.md, update DESIGN.md first and say why.

## Notion database
- Data source: `30a62276-53ba-80f8-843d-000bf634e88f`
- Database ID (for the API): `30a6227653ba80a58e08c6d6d4184a0e`
- `Page` select routes content: About, Blog, Bookshelf, Bookshelf intro, Now, Projects, Home
  - `Bookshelf` is an individual book; `Bookshelf intro` is the wording above the book list.
    There should only ever be one `Bookshelf intro` entry
  - **Adding a new `Page` value: deploy the `sync.js` change before marking anything in
    Notion ready.** A value `sync.js` doesn't recognise falls through to the blog-post
    branch and gets published as a post.
- `Status` gates publishing, and two values mean "publish this":
  - `Ready to publish` — goes out on the next run, whatever `Date` says
  - `Scheduled` — held back until `Date` has passed, then goes out
  Both are flipped to `Published` once synced. `Date` is the date shown on the post;
  it only gates publishing for `Scheduled` entries.
- **Unpublishing:** `Hold` is the only status that takes a page down. Move an entry to
  `Hold` — or delete the Notion page — and `sync.js` removes its markdown file on the
  next run.
  - **No other status unpublishes.** `removeUnpublished` asks "is this entry on `Hold`,
    or gone from Notion?" — not "is it on an approved list". So any status Jill invents
    is safe by default, and adding one needs no code change. Don't "fix" this by
    switching back to a keep-list.
  - `Draft` means "not up yet"; `Editing` means "up, and I'm reworking it". Both leave
    a live page alone — the site shows the last-synced version until the entry is
    marked `Ready to publish` again. `Editing` exists so Jill can still tell at a glance
    which entries are live while she works on them.
  - Two things are never removed: files with no `notion_id` (hand-written, predate the
    sync) and anything published in that same run. If Notion returns no entries at all,
    the sync assumes a bad query and deletes nothing.
- The Notion automation fires on `Ready to publish` only. That's deliberate — firing on
  `Scheduled` would trigger a build with nothing to publish. Scheduled entries are picked
  up by the half-hourly run in `publish.yml`, which is why that schedule must stay.
- Toggle blocks are stripped during sync — that's how Jill keeps private notes in a page

## Conventions
- Keep `build.js` readable by a non-programmer: comments explain *why*, plain names, no clever tricks
- Prefer deleting code over adding options
- Update `CHANGELOG.md` in plain language when something user-visible changes
