---
name: hubspot-funnel-qa
description: >-
  Build, fix, self-check and audit HubSpot marketing funnel pages (landing pages, order
  pages, confirmation pages, replay and watch pages) against a spec doc, naming
  standards, a pixel plan and a brand guide, then report a page-by-page punch list a
  build team can paste straight into a task tracker. Use whenever the user asks to
  check, review, QA, audit or "go through" funnel pages; asks whether pages match the
  spec; asks about dead buttons, wrong Stripe links, order bumps, missing pixels,
  desktop-vs-mobile differences, wrong dates or years, page titles, meta descriptions
  or share images; pastes a list of funnel URLs and asks what's wrong; is building,
  cloning or flipping a funnel; or wants a page checked before handing it back. Reach
  for it even when the change sounds small, because most recurring defects come from
  small edits applied to only one of the two module sets these pages ship.
---

<!--
  SKILL.md -- hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-15
  Lives:   ~/.claude/skills/hubspot-funnel-qa/SKILL.md (user level) or
           <project>/.claude/skills/hubspot-funnel-qa/SKILL.md
  What:    One method for building, self-checking and auditing HubSpot funnel pages,
           merged from two working skills (an auditor's and a builder's).
  Why:     Funnel pages drift from the spec, and from each other, in a small number of
           very repeatable ways. Most of them came from cloning. Every rule here is a
           defect that shipped, or a wrong finding that had to be withdrawn.
-->

# HubSpot funnel QA

Marketing funnels built in HubSpot drift from their spec in a few very repeatable
ways. This skill is the method for finding that drift, avoiding it while building, and
reporting it so someone can act without re-deriving your work.

Two facts explain most of what goes wrong:

1. **Almost every page is cloned from a page in another funnel.** A clone arrives
   carrying another campaign's copy, another product's name, another class's date, and
   a second full set of modules you can't see at the width you're working at. Nothing
   warns you. The page looks finished. The job is not only "make the change asked for";
   it's "leave no trace of the page this was cloned from".
2. **An audit's value collapses if findings are wrong.** A false blocker sends the
   build team chasing a closed item and costs their trust in the whole document.
   Several rules below exist only because something was inferred where checking was
   cheap.

## 1. Gather the standard before looking at a page

This skill holds the method, not your standards. Ask for the documents the task
touches, **in one message**:

| Document | Needed when | Why it can't be guessed |
|---|---|---|
| **The spec doc** for this funnel | Any copy, layout, offer or page-structure work | The only source of approved copy. Watch for a v1 and a v2: v2 often carries only the changes, so v1 still holds things like the date line. Check which version the build team actually received. |
| **Brand guide** | Any colour, font or imagery judgement | "Looks on brand" is not a check; the palette is a short list of exact values. |
| **Naming standards** | Slugs, step titles, page titles, indexing | Versioned, and parts go stale. |
| **Pixel / tracking plan** | Any pixel or conversion work | Carries the ids and event names. |
| **Product checklist** | Anything with a price or a payment link | Maps payment link ids to product and price. |
| **Edits tracker** | Re-checks, or applying a flagged row | Rows are defects already seen live. |
| **The event date** | Any dated page | Never infer it from a doc's title. Get it explicitly, then check the weekday against a real calendar; docs have shipped a Friday that was a Saturday. |

Also gather:
- **The page list from HubSpot itself** (Content > Landing pages, filtered by the
  funnel), not a list of URLs someone handed you. Funnels contain live pages nobody
  remembers: stale clones on odd slugs, still published, still carrying last
  campaign's copy.
- **Where conversions are built.** If the site loads Google Ads through a Google Tag
  Manager container, conversions are GTM tags, not `gtag()` snippets pasted into pages.
  Ask for the container id before conversion work.
- **Which page to clone from.** There is rarely a clean source. Assume the source is
  wrong until checked, and budget a full pass over the new funnel, not only the parts
  you edited.

**If a document isn't supplied, say so and narrow the work.** Audit for the defect
classes you can judge without a standard (dead buttons, stale dates, drift between
pages, clone residue) and state plainly what wasn't graded. Never infer a standard from
an older page; older pages are where the defects came from.

## 2. Crawl fast, verify carefully

Open one browser tab on the funnel's origin and run
[`scripts/crawl.js`](scripts/crawl.js) in the console. Same-origin `fetch()` pulls
every page in one pass and returns titles, meta, share images, dead buttons, payment
links, test links, form ids, dates, stale years, foreign vocabulary and spec-phrase
coverage. Edit its config block for your funnel first.

Three things are **invisible to fetched HTML**, and each has produced a wrong finding:

- **Tracking pixels.** HubSpot injects them at runtime. A raw-HTML scan shows no
  tracking on a fully instrumented funnel. Check `typeof fbq`, `typeof ttq` and the GTM
  container on a **loaded** page.
- **Stripe Checkout.** Payment pages render client-side; fetching a payment link
  returns an empty shell. Load the link in a browser to see product, price and any
  order bump.
- **Anything behind a trigger.** Collapsed accordions, step-2 checkout panels and CTA
  pop-ups are in the DOM before they're visible. Absence from `innerText` is not
  absence from the page: search the raw HTML before calling copy missing.

Before trusting any measurement, confirm the viewport: `innerWidth` non-zero and
landscape. A portrait or zero-width window breaks layout, scrolling and screenshots.

## 3. What to check, worst damage first

[`references/checklist.md`](references/checklist.md) is the full run as one list. In
short:

- **Can a visitor complete the action?** Enumerate every `a` and `button`. Flag no
  `href`, `href="#"`, or a relative `?...` href that reloads the page. HubSpot labels
  unwired buttons `aria-label="Link not set, button inactive"`, but the relative-href
  case carries no label. Then **resolve every destination**: a button pointing at a
  404 or the wrong product passes a presence check and still loses the sale. Before
  wiring a dead button, ask whether the block belongs on this step at all.
- **Does it charge the right thing?** Every page with a payment link gets the Stripe
  pass in [`references/stripe.md`](references/stripe.md): which link the order module
  really uses, whether a choice on the form changes anything, test or live, product and
  price, and **where Stripe sends the buyer after paying**. Order bumps are optional
  add-ons, not forced prices.
- **Does it read as this funnel's page?** Search for the source funnel's vocabulary,
  the previous product name and dead seasonal framing ("New Year", "Start 2025"). A
  keyword search for one phrase misses the others; read the page.
- **Does it work on a phone?** Pages often ship two module sets in one DOM, one per
  breakpoint, and an edit lands on one. Diff the **visible** text at 1440px against
  375px (the diff is at the bottom of [`scripts/crawl.js`](scripts/crawl.js)). Say
  which side is correct; sometimes it's mobile.
- **Dates.** Every date string on every page against the agreed date, including
  weekday and year.
- **Images.** Open the campaign artwork and the `og:image` and read the headline. A
  flyer for the previous class is the same defect as the previous class title in the
  copy, and every text check passes it.
- **Titles, descriptions, share images, indexing.** The internal builder step name
  must not be the public `<title>`. Titles unique across the funnel. Empty meta
  descriptions and missing `og:image` make every shared link render as bare text.
  Confirmation, replay and order pages are `noindex`, scoped to that domain only.
- **Tracking.** Base pixels on every step; Lead / CompleteRegistration on the opt-in
  confirmation only. If Purchase goes server-side from the payment (a CAPI workflow),
  its absence on the confirmation page is correct, and adding one double-counts.
- **Does the submission become a record?** Form, workflow trigger, branch,
  create-record action and dropdown option each match on a **name string**. A
  mismatch anywhere drops the data while every step reports success.
- **Copy against the doc**, word for word including casing. Where a page already
  matches exactly, say so and mark it *do not change*.
- **Brand.** Measure computed colours on a loaded page; searching source for a hex
  value misses the same colour written as `rgb()`.
- **Ad platforms review the landing page.** Guaranteed-return or scheduled-payment
  wording on a page paid traffic lands on can stop the spend. If the flagged copy came
  from the spec doc, take it to the author with the policy text; don't quietly rewrite
  it and don't leave ads rejected.

[`references/defects.md`](references/defects.md) is the catalogue behind every check:
what each defect looks like, what it really is, and how to avoid it. Read it before
building or reporting.

## 4. Report page by page

The audience is a build team working through pages one at a time, and a manager
skimming for what's at risk.

- **Group every finding under its page.** Nobody should jump between sections to fix
  one page.
- **Open items first within each page:** Blocker, Fix, Pixel, Naming, then Ask, with
  finished items (grey "Done" chip) at the bottom. Each page header counts "N open ·
  N done".
- **One task per line.** Don't nest sub-items; they get pasted into a tracker as
  separate tasks.
- **The complete URL in every task**, page and payment links alike, never a bare slug:
  several subdomains are usually in play and each task has to stand alone. Every URL is
  a clickable link, and the report opens with a "Pages in this funnel" list.
- **State cross-cutting items once** at the top (date standard, share images,
  indexing) rather than on every page.
- **Severity:** Blocker (breaks a customer action) · Fix · Copy · Naming · Pixel · Ask
  (needs a human decision first). Attribute owners when known.
- **A "verified correct, do not redo" section**, holding only what you actually
  measured. It's how the document earns trust.
- **Decisions separate from tasks**, at the top: anything that blocks the build until
  someone rules on it.

[`assets/report-template.html`](assets/report-template.html) is a working layout with
the severity chips styled. Publish it as a page, or offer a Word copy for comments.

## 5. Re-audits

Funnels get fixed while you're looking at them.

- Re-crawl from scratch, past the cache: `fetch(url, {cache: 'reload'})` plus a random
  query parameter. A plain cache-buster has returned stale HTML a minute after publish.
- Before calling a fix outstanding, check the page's **updated** time in HubSpot's page
  listing. It's authoritative and immune to caching.
- Report what closed since last time, by name. That's what the team most wants to see.
- **Watch for regressions**: a page that was right and now isn't. Re-check title, meta
  and share image after any edit; they're the fields most easily clobbered.
- When you find a defect, ask **how many pages have it** before fixing any. Fix the
  set, and the clone source, or the next clone brings it back.
- Correct your own earlier findings out loud when the evidence changes.

## Never

- Never submit a live form or complete a purchase to see what's behind it. Use the
  order module's test mode or ask for a 100%-off code.
- Never change a payment link, publish a page or change domain settings without an
  explicit yes for that change.
- Never report a visual defect from the editor preview or an in-app browser pane alone;
  confirm it on the live URL at a real viewport.
