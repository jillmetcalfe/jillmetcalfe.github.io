# DESIGN.md

> A plain-text design system for a text-first personal site & blog.
> Cool, crafted, and human — with the quiet technical credibility of well-made software.
> This is the source of truth for how the site looks. `style.css` implements it.
> Change this file first, then change `style.css` to match.

**Site:** `jillmetcalfe.com` — Jill Metcalfe
**Type:** Personal website + writing/blog. Reading comes first; everything else gets out of the way.

---

## 1. Visual Theme & Atmosphere

**Mood:** Cool cream paper, quiet confidence, editorial calm. It should feel like a beautifully typeset essay you want to sit with — not a dashboard, not a product page.

**Philosophy:** The writing is the interface. Design exists to make long-form reading feel effortless and considered. Every choice favours legibility, generous breathing room, and a single point of colour (the accent) over visual busyness.

**Density:** Low. Generous whitespace, one calm column of text, nothing competing for attention.

**Personality in three words:** Crafted. Human. Lucid.

**The one thing to remember:** A cool cream page, serif headlines with character, and a single saturated accent (magenta in light, cyan in dark) doing all the colour work. If a design choice doesn't serve the reading or that identity, cut it.

---

## 2. Color Palette & Roles

A neutral, cool-paper foundation with **one** accent at a time. The accent is rare on purpose — it marks links, the primary action, and key emphasis, and nothing else.

**The accent changes with the theme: magenta in light, cyan in dark.** This is a
deliberate departure from the all-cool palette below, and the reasoning matters more
than the hue. On cream paper, a *dark* accent like Petrol (`#156269`) sits at roughly
the same lightness as the ink (`#222120`) — only 2.3:1 apart. A link then separates
from body text by almost nothing, and reads as "slightly off-black" rather than as a
colour. A saturated accent separates by **hue** instead of by brightness, which is
what makes a link legible as a link at a glance. Dark mode has the opposite problem
and the opposite fix: there the paper is dark, so the accent goes light and cool.

Both values are taken from [al-folio](https://alshedivat.github.io/al-folio/), the
theme this site's earlier version was based on.

| Theme | Tint (call-out bg) | Base (links / button) | Dark (hover / emphasis) | Contrast of base |
| --- | --- | --- | --- | --- |
| **Light** *(magenta)* | `#F2DCF0` | `#B509AC` | `#8A0784` | 5.2:1 on Paper |
| **Dark** *(cyan)* | `#16323B` | `#2698BA` | `#7BCFE8` | 5.2:1 on dark Paper |

Note that in dark mode the "dark" slot goes *lighter*, not darker — hover should always
move away from the background, and in dark mode that means up.

### Base — light theme (the canonical identity)

| Semantic name | Hex | Role |
| --- | --- | --- |
| Paper | `#F5F2EE` | Page background. Cool cream — the signature surface. |
| Surface | `#FBFAF6` | Cards, raised blocks. A touch lighter than paper. |
| Ink | `#222120` | Primary text. A near-neutral charcoal — never pure `#000`. |
| Ink-soft | `#56544F` | Secondary text, metadata, captions. |
| Ink-faint | `#8C8983` | Timestamps, footnotes, disabled states. |
| Line | `#E0DCD4` | Hairline borders, dividers, rules. |
| Code-bg | `#ECE8E0` | Inline code and code-block background. |

### Accent — the cool palette

Each accent carries **three** values that work as a set: a light **tint** (call-out backgrounds), a mid **base** (links, the primary button, the left bar), and a **dark** (button hover/active, deep emphasis).

**These six cool accents are the back pocket**, kept for reference and for anyone
wanting a quieter site than the magenta above. Petrol was the original default. If you
switch to one of these, remember the lightness problem: on cream paper they all read as
dark rather than coloured, which is exactly the issue magenta was brought in to solve.
Use one accent per page/view; never mix two on the same screen.

| Accent | Tint (call-out bg) | Base (links / button) | Dark (hover / emphasis) |
| --- | --- | --- | --- |
| **Petrol** *(default)* | `#CFE4E4` | `#156269` | `#0E4348` |
| Cool mauve | `#DED5E6` | `#655777` | `#473C58` |
| Green | `#D3E3D2` | `#357046` | `#224D30` |
| Blue | `#D2E0EE` | `#2E5E8C` | `#1E4366` |
| Cool grey | `#DCDCDF` | `#595F67` | `#3B4147` |
| Cool greyish pink | `#E6D5D8` | `#7E5862` | `#5A3C44` |

**Implementation tip:** expose the active accent as three CSS variables so swapping (or theming a section) is a one-place change:
```css
:root{
  --accent-tint:#F2DCF0;   /* call-out backgrounds, text selection */
  --accent:#B509AC;        /* links, primary button, left bar */
  --accent-dark:#8A0784;   /* button hover/active, deep emphasis */
}
```

### Optional dark theme

| Semantic name | Hex | Role |
| --- | --- | --- |
| Paper | `#1B1A18` | Page background. Warm-neutral charcoal, not black. |
| Surface | `#242320` | Cards, raised blocks. |
| Ink | `#ECE7DD` | Primary text. Off-white. |
| Ink-soft | `#A6A29A` | Secondary text. |
| Line | `#37352F` | Borders, dividers. |
| Accent (cyan) | `#2698BA` | Cool and light, for contrast on dark. Hover goes lighter still: `#7BCFE8`. |

**Rules:**
- One accent colour per page/view. No second "brand colour" on the same screen.
  (Light and dark using different hues is not "two accents" — a reader only ever sees one.)
- Text is never pure black or pure white — always the Ink / Paper tones.
- The accent base must always pass contrast as a link on Paper; the accent dark must carry cream button text.
- **An accent must separate from the ink by hue, not only by lightness.** If a candidate
  accent is within about 2.5:1 of the ink colour and low in saturation, links will
  disappear into the text. Check before adopting one.

---

## 3. Typography Rules

The pairing is the heart of the brand: a characterful serif for display, a clean humanist sans for reading, and a matching mono for code. (Brief rationale: Fraunces is a warm "old-style" serif that builds in deliberate, hand-drawn imperfection; IBM Plex Sans was designed around the balance of "man and machine," so it reads humane yet technical. Together they say *crafted, but built by someone who knows software.*)

**Font families**
- **Display / headings:** `Fraunces` (serif). Warm, literary, with optical-size personality. Use weights 400–600.
- **Body / UI:** `IBM Plex Sans` (sans-serif). Highly readable, humanist, quietly technical.
- **Code:** `IBM Plex Mono` (monospace). For inline code and code blocks.

All three are free and open source via Google Fonts.

**Load (HTML `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Hierarchy**

| Element | Font | Size (desktop) | Weight | Line height | Notes |
| --- | --- | --- | --- | --- | --- |
| H1 / Post title | Fraunces | 48px (3rem) | 500 | 1.1 | Letter-spacing -0.01em. |
| H2 / Section | Fraunces | 32px (2rem) | 500 | 1.2 | |
| H3 / Subsection | Fraunces | 24px (1.5rem) | 500 | 1.3 | |
| Body | IBM Plex Sans | 19px (1.1875rem) | 400 | 1.7 | The reading size — comfortable, slightly large. |
| Lead / intro | IBM Plex Sans | 22px (1.375rem) | 400 | 1.6 | Optional opening paragraph, in Ink-soft. |
| Small / meta | IBM Plex Sans | 15px (0.9375rem) | 500 | 1.5 | Dates, tags, captions. In Ink-soft. |
| Blockquote | Fraunces (italic) | 22px | 400 | 1.5 | Italic, with an accent left bar. |
| Code | IBM Plex Mono | 16px | 400 | 1.6 | |

**Rules:**
- Body line length: **62–72 characters** maximum. Non-negotiable for reading comfort.
- Headings are serif; everything functional (body, nav, buttons, meta) is sans.
- Don't bold body text for emphasis — use italics or the accent sparingly.

---

## 4. Component Stylings

**Links (in prose)**
- Default: Accent base, with a 1px Accent-tint underline offset 3px.
- Hover: Accent dark, underline becomes solid.
- Visited: same as default (it's a personal site, not a wiki).

**Primary button**
- Background: **Accent base.** Text: Paper (`#F5F2EE`). Padding: 12px 22px. Radius: 8px. Font: IBM Plex Sans 500.
- Hover: Background **Accent dark**, subtle lift (translateY -1px).
- Focus: 2px Accent outline, 2px offset.

**Soft button (optional secondary)**
- Background: Accent tint. Text: Accent dark. Border: 1px Accent base. Radius: 8px.
- For lighter, lower-emphasis actions where a filled button would be too loud.

**Card (e.g. a post in a list)**
- Background: Surface. Border: 1px Line. Radius: 12px. Padding: 24px.
- Title in Fraunces, meta in Ink-soft small, excerpt in body.
- Hover: border warms toward Accent-tint, very soft shadow appears (see §6).

**Input / textarea**
- Background: Surface. Border: 1px Line. Radius: 8px. Padding: 10px 14px.
- Focus: border Accent base, 3px Accent-tint focus ring.

**Navigation**
- Plain text links in IBM Plex Sans 500, Ink colour, generous spacing. No boxes, no background.
- Current page: Accent base, or a 2px Accent underline.
- **Sticky.** The bar stays pinned to the top of the window while you scroll, on Paper
  background with the hairline Line border beneath it. No shadow, no blur, no shrink
  animation — it stays flat and calm, like everything else.
- Because it is always on screen it must stay *short*: tight vertical padding, and the
  generous whitespace that would otherwise sit above the title moves below the bar,
  to the top of the content. A sticky bar is rented space; pay as little as possible.

**Blockquote / call-out**
- 3px Accent base left bar, Accent-tint background, Fraunces italic text, comfortable padding.

**Inline code**
- Code-bg background, IBM Plex Mono, 2px 6px padding, 4px radius.

**Code block**
- Code-bg background, 1px Line border, 12–16px radius, 20px padding, horizontal scroll on overflow.

**Tags / categories**
- Small IBM Plex Sans 500, Ink-soft, optional thin Line border pill. Keep the accent rare.

---

## 5. Layout Principles

**Reading column:** Max width **680px** for prose. This is the spine of the whole site.

**Page shell:** Content centred, comfortable side gutters (min 24px on mobile, more on desktop). Wide elements (hero, full-bleed images) may extend wider, but text never does.

**Spacing scale (8px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Use these and only these.

**Vertical rhythm:**
- Paragraph spacing: 24px.
- Space above an H2: 48px. Above an H3: 32px.
- Section breaks use a short Line rule or a centred ornament, not a heavy divider.

**Whitespace philosophy:** When unsure, add more space, not more stuff. The margins are part of the design.

**Homepage:** Brief intro (who you are, in your voice) + a clean list of recent posts. Resist widgets, sidebars, and counters.

---

## 6. Depth & Elevation

Mostly flat. Depth is implied with **hairline borders and soft, low-opacity shadows** — never hard or pure-black ones.

| Level | Use | Treatment |
| --- | --- | --- |
| 0 — Flat | Page, prose | No shadow. Paper background only. |
| 1 — Resting | Cards, code wells | 1px Line border, optional `0 1px 2px rgba(34,33,32,0.04)`. |
| 2 — Hover | Card hover | `0 6px 20px rgba(34,33,32,0.08)`, border warms to Accent-tint. |
| 3 — Floating | Menus, dialogs (rare) | `0 12px 32px rgba(34,33,32,0.12)`. |

**Rule:** Shadows are tinted with the Ink colour at low opacity, never `rgba(0,0,0,...)`.

---

## 7. Do's and Don'ts

**Do**
- Keep the prose column narrow and the line-height generous.
- Use the accent like seasoning — links, one button, the occasional emphasis.
- Let headings carry the personality (that's Fraunces' job).
- Use the cool, near-neutral tones everywhere, including shadows and "black" text.
- Leave generous, intentional whitespace.

**Don't**
- Don't show two accents on the same page/view (varying by section is fine).
- Don't use pure `#000000` or pure `#FFFFFF` anywhere.
- Don't widen the reading column past ~72 characters.
- Don't bold body text to emphasise — use italics or the accent.
- Don't add sidebars, popups, social-share clutter, or anything that competes with the words.
- Don't use generic system-default fonts; the Fraunces + Plex pairing IS the brand.

---

## 8. Responsive Behavior

**Approach:** Mobile-first, single column always (there is no second column to collapse — that's the point).

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640–1024px
- Desktop: > 1024px

**Scaling:**
- H1 scales from 32px (mobile) → 48px (desktop).
- Body stays 18–19px everywhere; never shrink reading text below 18px.
- Side gutters grow with viewport; the 680px reading cap stays fixed.

**Touch:** All tappable targets at least 44×44px. Nav links get extra vertical padding on mobile.

---

## 9. Agent Prompt Guide

**Quick colour reference:**
`Paper #F5F2EE` · `Surface #FBFAF6` · `Ink #222120` · `Ink-soft #56544F` · `Line #E0DCD4`
Light accent: base `#B509AC` · tint `#F2DCF0` · dark `#8A0784`
Dark accent: base `#2698BA` · tint `#16323B` · dark `#7BCFE8`

**Back-pocket cool accents (quieter, all dark on cream):** Petrol `#156269` · Mauve `#655777` · Green `#357046` · Blue `#2E5E8C` · Cool grey `#595F67` · Cool greyish pink `#7E5862`

**Fonts:** Fraunces (headings) · IBM Plex Sans (body) · IBM Plex Mono (code)

**Buttons:** primary = accent base background, Paper text, hover → accent dark.

**Ready-to-use prompts:**

> *"Using DESIGN.md, build the homepage: a short personal intro in my voice, then a list of recent blog posts as cards. Reading column max 680px, cool cream background, Petrol accent."*

> *"Using DESIGN.md, build a blog post template: Fraunces title, sans body at 19px with 1.7 line-height, Petrol links, base-colour buttons that darken on hover, styled blockquotes and code blocks. One narrow column."*

> *"Using DESIGN.md, set up the global CSS variables (base + the three accent variables) and base typography first, then we'll build pages on top."*

> *"Using DESIGN.md, make the Reading section use the Green accent instead of Petrol, keeping everything else identical."*

**Reminder for the agent:** This is a reading-first personal site. Favour whitespace and legibility over features. One accent per view, base for buttons, dark for hover. Text is never pure black; the background is cool cream.
