---
name: hubspot-page-port
description: >-
  Port, migrate or redesign a marketing page into HubSpot so it matches its source,
  then prove it matches. Use whenever the user asks to port, migrate, move or copy a
  page from GoHighLevel, ClickFunnels, WordPress or another builder into HubSpot, to
  rebuild or redesign an existing page, or asks why a ported page "doesn't look
  right", "isn't the same", or is missing a background, a font or formatting. Covers
  capturing the source page's look (backgrounds, fonts, accent words, bold phrases,
  capitalisation, layout), building the page by script, and a side-by-side compare
  that must come back clean before the page is called done. Pair it with
  hubspot-funnel-qa for the full QA pass.
---

<!--
  SKILL.md -- hubspot-page-port
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-18
  Lives:   ~/.claude/skills/hubspot-page-port/SKILL.md (user level) or
           <project>/.claude/skills/hubspot-page-port/SKILL.md
  What:    How to port a page into HubSpot without losing its look, and a browser
           script that compares the new page with the source block by block.
  Why:     A GoHighLevel sales page was ported with every word intact and went live
           with no background images, plain text where the source had serif accent
           words and bold phrases, re-capitalised headings and a hero that looked
           nothing like the original. A copy check passed it. The compare here doesn't.
-->

# Port a page into HubSpot without losing its look

A port is a copy of a page's **look**, not only its words. It's done when the compare
in step 5 reports no differences, or every remaining difference is listed for the
owner as a deliberate change.

## 1. Capture the source

1. Open the source page at **1440x900**, and later at 375x812. Screenshot every section
   at both widths. These screenshots are the target.
2. Run [`scripts/port-compare.js`](scripts/port-compare.js) on the source (step 5). It
   saves every visible text block with its formatting, font and section background.
3. List the **background images**. Builders like GoHighLevel put them in inline
   `background: url(...)` styles. They're often 1920x1080 transparent PNGs (glows,
   rings) on top of a background colour, so record the colour under each one too.
4. List the **fonts**. Accent words are often a `<u>` or `<em>` styled as a second font
   (for example a green serif italic). Read the computed `font-family` of the accent
   spans, not the HTML tags.
5. Copy the copy **with its formatting**: keep `<strong>`, `<em>`, accent spans and line
   breaks from the source's visible HTML. Never build from a plain-text extract. Keep
   the source's capitalisation, and fix typos only with the owner's agreement.
6. Only visible text counts. Source HTML often carries hidden mobile copies and leftover
   sections from the page it was cloned from.

## 2. Move the assets

- Put images and backgrounds in HubSpot File Manager instead of hotlinking the old
  platform's CDN, which disappears with the old account. A HubSpot private-app token
  usually can't upload files, so upload through File Manager in the browser. Search
  first: HubSpot flags duplicates on upload, and an earlier upload may already be there
  under another name.
- Load webfonts from Google Fonts with a `<link>` in the page's Head HTML.

## 3. Build

- Build the page from a script that writes the page JSON and PATCHes the draft
  (`PATCH /cms/v3/pages/landing-pages/{id}/draft`). Say in the hand-off that edits made
  in the HubSpot editor are lost on the next run.
- Write the copy as rich-text HTML so formatting survives. Wrap cards and accent words
  in your own classes and style them in Head HTML.
- Create top-level rows and their `rowMetaData` together (hubspot-funnel-qa defect 43).
- **HubSpot drops a section's `backgroundColor` when `backgroundImage` is set.** For a
  transparent overlay on a colour, also set the colour by a section class
  (`rowMetaData[i].cssClass = "dnd-section my-cream"`) with
  `background-color: ... !important`.
- Text colour follows the background (defect 44). Style by section class, never by row
  number.
- Head HTML goes through HubL: `{#` opens a comment and blanks the page. Scan for `{#`,
  `{{` and `{%` before every save.

## 4. Ship the standard parts

Review click-to-enlarge (`hubspot-funnel-qa/assets/review-lightbox.html`), a share
image, a customer-facing title and meta description, working checkout links, and a
desktop and phone check.

## 5. Prove it matches

[`scripts/port-compare.js`](scripts/port-compare.js), in **one** browser tab at 1440px:

1. Open the source page and run the script. It answers `source saved: N text blocks`.
2. Navigate **the same tab** to the new page (preview or live). If the port also changes
   the year, set `window.PORT_YEAR = ['2026','2027']`. Run the script again.
3. For every source text block it lists missing copy, capitalisation changes, lost or
   added bold / italic / accent words, font, size, weight, colour and alignment changes,
   and different section backgrounds. It also lists copy found only on the new page and
   the background images each page uses.

The snapshot travels in `window.name`, which survives navigation between subdomains of
one site. When the two pages are on different sites, run
[`scripts/page-snapshot.js`](scripts/page-snapshot.js) on each, save both outputs as
JSON, and run `python scripts/port_diff.py source.json new.json`.

Run it again at 375px. Fix every difference or list it as deliberate. Some differences
are cosmetic: `left` vs `start` alignment, or a colour on a wrapper that a child span
overrides. Confirm those on a screenshot. Then compare the screenshots of both pages
side by side, because the script can't see image crops, spacing or how a photo sits in
a hero.

## 6. Hand back

Report the source URL, the new URL (preview and live), the compare result, any
placeholders still waiting on artwork, and anything not yet published.
