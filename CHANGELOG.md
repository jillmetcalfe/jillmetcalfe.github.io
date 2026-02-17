# Changelog

All notable changes to the jillmetcalfe.github.io site, described in plain language.

---

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
