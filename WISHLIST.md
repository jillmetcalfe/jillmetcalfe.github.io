# Wishlist

Future ideas and improvements for the site. Items are marked ✅ with a date when completed.

---

- ✅ 2026-02-17 Apply the weightier body font site-wide
- ✅ 2026-02-17 Dark mode toggle button
- ✅ 2026-02-17 Sticky top nav bar (stays visible when you scroll)
- ✅ 2026-02-17 Notion as CMS — Use Notion API + GitHub Actions to auto-publish posts. Approach: create a Notion database for posts, write a script to pull content via the API and convert to Jekyll markdown, run it via a GitHub Action (scheduled or on-demand). Needs: Notion integration/API key, a posts database in Notion, a conversion script, a GitHub Action workflow.
- [ ] **Accent colour isn't right yet.** Magenta `#B509AC` (from al-folio) fixed the
  real problem — petrol was only 2.3:1 from the ink, so links read as off-black — but
  it's too hot against the cream paper. Next thing to try: a deeper, less neon magenta
  (`#9A0793` is 6.7:1 and calmer), or one of the cool accents at a *lighter* value than
  DESIGN.md lists, so it separates from the ink by going lighter instead of more
  saturated. The rule to keep: separate from the ink by hue or lightness, not neither.
  All six alternatives with hexes are in a comment at the top of `style.css`
- ✅ 2026-08-24 Now page via Notion — syncs from Notion like About. (Wayback Machine auto-archiving still to do: `- [ ] Archive the previous Now page to the Wayback Machine before overwriting`)
- ✅ 2026-08-24 Update Ruby for local site testing — no longer needed, Ruby and Jekyll are gone. Preview with `npm start`
