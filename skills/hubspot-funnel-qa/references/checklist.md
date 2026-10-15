<!--
  checklist.md -- the full QA run for hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-15
  Lives:   skills/hubspot-funnel-qa/references/
  What:    Every check in the skill as one runnable list, worst damage first, with the
           defect number from defects.md that explains each one.
  Why:     An interrupted run should still have covered the expensive things, and a
           rotation ("flip") is only done when nothing points at the old pages.
-->

# The funnel QA checklist

Work top to bottom; the order is roughly worst-damage-first. Numbers in brackets are
entries in [defects.md](defects.md).

## A. Gather before touching anything

- [ ] Event **topic and date** from the calendar, not from a doc title; weekday checked
- [ ] **Spec doc** (and which version the build team has)
- [ ] **Brand guide**, **naming standards**, **pixel plan**: whichever the work touches
- [ ] **Product checklist**, if prices or payment links are involved
- [ ] **Edits tracker** rows, if any
- [ ] **Destination map**: every URL ads may point at for the incoming topic, written
      before a flip [34]
- [ ] **Page list from HubSpot**, filtered by funnel, not a handed-over list [11]

Missing an input? Narrow the work and say so in the report.

## B. Every page, at both widths

**Structure**
- [ ] Visible-text diff at 1440px vs 375px; every difference explained [1]
- [ ] Nothing exists on one side only [2]
- [ ] Computed colours match across the two sets [3]

**Actions**
- [ ] Every `a` and `button`: none with no `href`, `href="#"`, or a relative `?...`
      href [9]
- [ ] Every destination resolved to the right page [9]
- [ ] Any dead button: should this block exist on this step? [22]
- [ ] CTA pop-ups checked on the CTA's targeting screen, not by measuring the
      iframe [10]

**Money** (full pass in [stripe.md](stripe.md))
- [ ] Every payment link opened in a browser, both hosts; product and price read off
      Stripe [8] [38]
- [ ] No `test_` link and no test banner on a published page [38]
- [ ] Order pages with **no** payment link flagged [7]
- [ ] Page purpose, form name and Stripe product name the same ticket and tier [37]
- [ ] Order pages listed from HubSpot across all domains, audited as one table [39]
- [ ] After-payment redirect goes to this funnel's confirmation page
- [ ] Order bump optional, never forced [8]
- [ ] Listed values sum to the stated total [16]; one product list per page [6]

**Copy**
- [ ] Word for word against the spec doc, casing included [21]
- [ ] No source funnel vocabulary [4]; no dead seasonal framing [14]
- [ ] One product name everywhere [15]
- [ ] Hero belongs to this step [5]
- [ ] "Missing" copy confirmed absent from **raw HTML** [23]

**Images**
- [ ] Every `<img>` listed at both widths [26]
- [ ] Campaign artwork and `og:image` **opened and read** [26]

**Identity**
- [ ] Title customer-facing, not the builder step name [13]; unique in the funnel [12]
- [ ] Meta description set [17]
- [ ] `noindex` on confirmation, replay and order pages, this domain only [18]
- [ ] Slug and step title match the naming standards [12]

**Brand**
- [ ] Palette checked by computed style, not by searching source [24]

## C. Funnel-wide

- [ ] Whole funnel on one subdomain [20]
- [ ] Outgoing topic's landing page redirects instead of taking registrations [34]
- [ ] No stale clones on odd slugs [11]; no two pages sharing an internal name [12]
- [ ] Replaced pages retired the same day [30]
- [ ] The page the clone came from checked too [4]

## D. The submission chain [32]

- [ ] Form GUID on the page resolved to its **name** [27]
- [ ] That exact name in the workflow's enrolment trigger
- [ ] That exact name as a **branch value** (open the branch details; the canvas
      truncates)
- [ ] The branch's create-record action writes the same property and tag as its
      siblings
- [ ] The value it writes exists as a **dropdown option** with a conventional internal
      name, on every property carrying the list [33]
- [ ] Enrolment history: which branch did a real run take? `None met` is the tell
- [ ] The watch link reaches the live event, tested [34]
- [ ] Every confirmation page carries the live-redirect script once, with a future
      start time, on every subdomain [40]

## E. Tracking

- [ ] Pixels and the GTM container present on a **loaded** page, every page [19] [20]
- [ ] Lead / CompleteRegistration on the opt-in confirmation only
- [ ] Purchase from one place only: the server-side payment workflow, or the
      post-payment page with the right value and a real transaction id [25]
- [ ] No pasted `gtag('event','conversion')` snippets where GTM runs conversions [19]
- [ ] UTM hidden fields on registration and order forms

## F. Ad destinations (after a flip)

Don't ask whether ads were paused. Read where they point.

- [ ] Every active Meta campaign, ad set and ad, and the link each creative carries,
      checked against the destination map
- [ ] Google final URLs on active ads and keywords checked against the map; check
      Google even when Meta is clean
- [ ] None of the three failure shapes [34]: old topic still live; right topic, wrong
      page (purchase campaigns on the free page); right page, dead campaign
- [ ] Policy [35]: no guaranteed-return or scheduled-payment wording, no income framed
      as covering a named bill, disclaimer beside the testimonials; any rejection
      traced to the page the ads actually use; flagged spec-doc copy taken to its
      author; no ads left rejected

## G. Re-check and report

- [ ] Read past the cache: `fetch(url, {cache:'reload'})` plus a random parameter [28]
- [ ] Updated time in the page listing checked before calling any fix outstanding [28]
- [ ] How many pages carried the defect, not just this one [29]
- [ ] Title, meta and share image re-read after any edit [31]
- [ ] Editor-preview disagreements confirmed on the live URL [36]

Then report in the format in [SKILL.md](../SKILL.md): grouped by page, open items
first, one task per line, the full URL in every task, decisions at the top, and a
*verified correct, do not redo* section holding only what you measured.
