# Changelog

All notable changes to the jillmetcalfe.com site, described in plain language.

---

## 2026-08-24 (rebuild)
- **The top navigation bar now stays put when you scroll.** It was also made much
  shorter as part of this — a bar that's always on screen is rented space, so the
  generous gap that used to sit above the site title now sits below the bar instead.
  The page looks the same standing still, but the sticky bar costs ~60px rather than ~110px
- **Links are magenta now, not petrol.** The old petrol accent was only 2.3:1 apart
  from the body text in lightness, so links read as "slightly off-black" rather than
  as a colour. Magenta (`#B509AC`) is about as dark but far more saturated, so it
  separates by hue instead of by brightness. Dark mode gets cyan (`#2698BA`) for the
  same reason in reverse. Both values come from al-folio, the theme the old site used.
  **Provisional** — the magenta reads too hot against the cream and is still being
  worked out; see WISHLIST.md
- **Removed Jekyll entirely.** The site is now built by one small script (`build.js`)
  instead of a static site generator. No more Ruby, no Gemfile, no `_config.yml`,
  no `_layouts`/`_includes`/`_sass`, no Bootstrap, no theme. Four npm packages total.
  Prompted by michaeldeank.com/page/how-i-built-this — Jekyll was carrying its weight
  for maybe 200 lines of work
- **Applied DESIGN.md.** The site now looks the way DESIGN.md always said it should:
  cool cream paper, Fraunces headings, IBM Plex Sans body text, a single Petrol accent,
  and a 680px reading column. Bootstrap and Roboto are gone. All styling is in one
  hand-written `style.css` you can read top to bottom
- **Now and Projects now sync from Notion** like About already did, and the homepage
  intro does too. Everything is written in one place now
- Blog posts get readable web addresses (`/blog/john-is-cool/`) instead of the long
  Notion ID they used to use
- Local preview no longer needs Ruby — `npm start` builds the site and opens it at
  localhost:8080
- Added a sitemap and robots.txt; kept the RSS feed
- Renamed the project folder from `jillmetcalfe dot com` to `jillmetcalfe-website`
  so terminal commands don't need quote marks around the path

## 2026-08-24
- Fixed the site address in `_config.yml` — it said `jillmetcalfe.github.io` but the
  site actually lives at `jillmetcalfe.com`. This mattered because the RSS feed and
  the Impressum link in the footer were built from that address, so both were
  pointing subscribers and search engines at the wrong domain
- Moved the project into `~/Developer/Claude Code/Jill/` as part of tidying all
  Claude Code projects into one place. A stale duplicate copy of this repo was also
  removed from the home folder, so there is now exactly one working copy

## 2026-02-18 (continued)
- Added README.md — plain-language guide covering how publishing works, page types, scheduling, toggles, Make.com PAT renewal, and troubleshooting
- Toggle blocks in Notion are now excluded from published content — use them to store drafts, unused headings, or private notes

## 2026-02-18
- Added bookshelf sync — books from Notion now sync to the site with author, status, stars, and dates
- Added About page sync from Notion, with a subtle "Last updated" date at the top
- Updated bookshelf page to use new statuses: Reading, Finished, Queued, DNF
- Empty book pages now auto-generate a summary body (author, status, dates)
- Filenames now based on Notion page ID instead of title, so renaming a post doesn't create duplicates
- Sync now stamps "Last Updated" and "Date" (if empty) in Notion on publish
- Added time-aware scheduled publishing — you can set a specific time, not just a date
- Fixed race condition where the sync workflow could fail to push

## 2026-02-17
- Added Notion CMS integration — blog posts written in Notion with status "Ready to publish" are automatically synced to the site via GitHub Actions. Publishing happens on a 30-minute schedule, and also instantly via a Notion webhook that triggers a Make.com scenario, which then triggers the GitHub Action. Can also be run manually from the Actions tab.
- Added scroll progress bar — the nav border fills with theme color as you scroll down the page
- Made nav bar sticky — it now stays at the top of the screen when you scroll
- Added active page highlighting in the nav bar (current page shows in theme color)
- Swapped dark mode toggle icons to show the action (sun = click for light, moon = click for dark)
- Fixed dark mode toggle — the icon library link was broken (package was renamed), so the button was invisible. Updated to the correct package and pinned the version.
- Applied weightier font (400) to all content pages, not just the home page
- Set up CHANGELOG.md and WISHLIST.md for project tracking
