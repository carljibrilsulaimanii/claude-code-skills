<!--
  editing-pages.md -- fixing a HubSpot page safely, for hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-12
  Lives:   skills/hubspot-funnel-qa/references/
  What:    Where edits go, how to read and save Head HTML through the CMS API, and the
           five ways a save has broken a live page.
  Why:     QA on a funnel usually turns into fixing it. Each rule here comes from a fix
           on a busy sales page that broke something else, or nearly did.
-->

# Fixing a page safely

## Where the edits go

- **Copy and module fields:** through the CMS pages API or a HubSpot connector that can
  set module fields. Read the module's current fields first and send back the whole
  group (for example every pricing card), changing only what you mean to.
- **Layout fixes:** CSS appended to the page's Head HTML, one labelled block per fix:
  `<!-- NAME (date): what it fixes and why -->` followed by `<style>`. Never rewrite the
  build team's blocks; add after them.
- **Reading and saving Head HTML:** `GET` and `PATCH
  /cms/v3/pages/landing-pages/<id>/draft`. From a signed-in browser session on
  app.hubspot.com the internal path `/api/cms/v3/pages/landing-pages/<id>/draft?portalId=<portal>`
  works when the `hubspotapi-csrf` cookie is sent as the `X-HubSpot-CSRF-hubspotapi`
  header.
- **Test before saving:** inject the CSS into the draft preview in a browser, measure it
  at 375px and 1440px, and only then save it.

## Five ways a save has broken the page

**1. A failed read wipes the Head HTML.** A GET sent without the CSRF header came back
401 with no `headHtml`. The read-append-PATCH then saved only the new block over the
whole Head HTML, deleting the build team's styles and every earlier fix. The fix was
restoring from `GET .../revisions?limit=25` (25 is the maximum), then
`.../revisions/<id>` and its `object.headHtml`.
Rule: send the header on the GET, check the response is OK, and stop if the base is
shorter than you expect.

**2. `{#` blanks the page.** Head HTML runs through HubL, and `{#` opens a HubL
comment. The rule `@media (max-width:767px){#hs_cos_wrapper_x{...}}` swallowed
everything after it, the page body included, and the preview rendered empty.
Rule: put a space after `{` before an id selector, and scan for `{#`, `{{` and `{%`
before every PATCH.

**3. Inserting a row moves the build team's styles.** Drag-and-drop themes often style
rows by number (`.row-number-10`, `.dnd_area-row-22-padding`), and rows are numbered in
DOM order. CSS `order` can move a section up the screen while it stays later in the
DOM, so a row inserted visually below the tickets still shifted them: two new rows
moved every ticket rule by two, and the premium-tier row fell out of the layout.
Rules:
- Before an insert, remove or move, record what every `row-number-` and `dnd_area-row-`
  selector matches in the preview: count and first text.
- After the change, compare, and fix anything that moved.
- Anchor a fix to the module itself, not to a row number:
  `.row-fluid-wrapper:has(> .row-fluid > .dnd-module > #hs_cos_wrapper_<module id>)`.
- Write all new CSS against module wrapper ids, cell-id prefixes
  (`[class*="cell_<id>-"]`) or section ids, never row numbers.

**4. Desktop and mobile are separate modules.** Sections often exist twice, once per
breakpoint, with unrelated ids. A fix hooked to one copy does nothing on the other screen
size. Find the visible copy at each width, or hook the section by its heading text at
runtime.

**5. The editor can publish a stale copy.** When API publishing isn't available for a
domain, pages go out through the editor's Update button, and the editor has published
versions missing recent API edits. After any publish, re-check the live page with a
throwaway query string.

## Draft or live: check before you say

Before writing "draft only" or "not published" in anything that goes to the team, fetch
the live page and the preview with `?v=<timestamp>` and compare a distinctive string
from each change. A page published mid-fix was once reported as "not live yet".

## Hidden or deleted

When someone says a section "should be there, hidden", search the draft's
`layoutSections` for it. If it isn't there, page through the revisions and find the last
one that had it. That revision gives the exact module type, settings and position to
rebuild from.

## Stay inside the request

Fix what was asked or decided. Something you noticed yourself, like a heading style that
doesn't match, goes to the user as a suggestion, not into the team's to-do list as if
someone asked for it. Something a meeting only said to "consider" is a question, not a
task.
