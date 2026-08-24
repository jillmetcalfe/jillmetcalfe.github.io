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
- `Page` select routes content: About, Blog, Bookshelf, Now, Projects, Home
- `Status` gates publishing: only `Ready to publish` is synced, then flipped to `Published`
- Toggle blocks are stripped during sync — that's how Jill keeps private notes in a page

## Conventions
- Keep `build.js` readable by a non-programmer: comments explain *why*, plain names, no clever tricks
- Prefer deleting code over adding options
- Update `CHANGELOG.md` in plain language when something user-visible changes
