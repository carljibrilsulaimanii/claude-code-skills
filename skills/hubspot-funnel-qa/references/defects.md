<!--
  defects.md -- the defect catalogue for hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-15 (updated 2026-11-12: domains, #41-#42)
  Lives:   skills/hubspot-funnel-qa/references/
  What:    Every defect class that shipped on real HubSpot funnels and was caught
           afterwards, as "looks like / really is / avoid it".
  Why:     In almost every case the page looked finished. Knowing the shapes in
           advance is what makes the checks in checklist.md stick.
-->

# The defect catalogue

Each entry is a defect that actually shipped and was caught later. Most share one
cause: **the page was cloned**, and the clone carried another campaign's content,
another product's name, and a second module set you can't see at your working width.
Numbers in brackets in [checklist.md](checklist.md) point here.

## Layout and modules

### 1. The two module sets
**Looks like:** you fixed the date and can see it's fixed.
**Really is:** the page ships two complete module sets in one DOM, one above the
mobile breakpoint and one below. Editing in desktop view changed one. A watch page
read the right date at 1440px and a date twelve days past at 375px, for days after the
"fix".
**Avoid it:** after any content edit, view the page at **both** 1440px and 375px. Every
id exists twice; a selector that matches "the" element matches only one.

### 2. The missing mobile counterpart
**Really is:** sometimes there's no second module at all. A countdown built once, in the
desktop set only, simply didn't exist on phones.
**Avoid it:** diff the *visible text* between the two widths. A spot-check of the element
you already know about catches neither #1 nor #2.

### 3. The two sets styled differently
**Really is:** same words, different computed colour: near-black on desktop, white on
mobile, on a light panel both times.
**Avoid it:** compare computed styles when the sets diverge. Size changes between
breakpoints are usually fine; colour changes almost never are.

### 36. The preview pane is not the page
**Really is:** the editor's preview doesn't run everything the live page does. A
countdown that worked live showed as missing in the editor's mobile preview. In-app
browser panes can also mis-composite when the emulated viewport is bigger than the pane.
**Avoid it:** confirm any visual or behavioural defect on the live URL at a real
viewport.

## Clone residue and copy

### 4. Another funnel's copy
**Looks like:** a finished page with a sensible title.
**Really is:** title and meta were updated, the body wasn't. A replay page for one topic
kept the full script for another.
**Avoid it:** search every cloned page for the source funnel's vocabulary. When you find
it, **audit the source page too**: whatever is stale on the clone is usually stale on
the original, which is the one still taking traffic.

### 5. The other page's hero
**Really is:** an on-brand hero that belongs to a different step: the order page's
upsell headline on the replay sign-in page.
**Avoid it:** ask what job this step does, then read the hero against it.

### 6. Two product lists on one page
**Really is:** the new list near the top and the old campaign's list below the fold,
summing to roughly double the stated total.
**Avoid it:** when values change, update every block that lists them.

### 14. Dead campaign framing
**Really is:** January copy on an autumn page: "Start <year> prepared", "New Year
goals". A search for "New Year" misses "Start <year>".
**Avoid it:** read the page for season and year framing; keep a word list per funnel.

### 15. Product name drift
**Really is:** four names for one product across four pages.
**Avoid it:** take the name from the spec doc and use that exact string everywhere,
including scarcity bars and button labels.

### 16. Values that don't add up
**Really is:** listed item values summing to little over half the "Total Value" beside
the price.
**Avoid it:** add them up. If they don't match, find out which is wrong before
publishing.

### 21. Casing drift
**Really is:** headings in mixed casing across pages, missing spaces, and the same
heading twice on one page in two cases.
**Avoid it:** take casing from the spec doc exactly.

### 23. Hidden is not absent
**Really is:** collapsed accordions, inactive modules and step-2 panels are in the DOM
but not in `innerText`.
**Avoid it:** before reporting copy missing, search the raw HTML for a distinctive
phrase, and say how you checked.

### 26. Nobody checks the images
**Really is:** the page's only campaign flyer was the previous class's, in both module
sets, through several rounds of text-only QA. The filename was a content hash.
**Avoid it:** list every `<img>` at both widths, **open** the campaign artwork and the
`og:image`, and read the headline. A well-named file is weak evidence; a hash filename
is none. Two different crops of the same current flyer are not a defect.

## Buttons and pop-ups

### 9. Buttons with an href that goes nowhere
**Really is:** `href="?referrer=CMS_MODULE_NEWTAB&hsLang=en"`, a relative link that
reloads the page. It carries no "Link not set" label.
**Avoid it:** resolve every destination; an `href` existing is not a check.

### 10. The pop-up that is "broken"
**Really is:** a HubSpot CTA's iframe is 0×0 until its trigger fires. A CTA set to
**button trigger only** fires only when a button carries
`hs-cta-trigger-button hs-cta-trigger-button-<cta-id>`.
**Avoid it:** read the CTA's targeting screen, then check the page's buttons carry the
classes, and that the CTA id on the page matches the one you're looking at.

### 22. "Wire this button" when the block shouldn't exist
**Really is:** a "Register Now" button on the registration *confirmation* page, cloned
in. Wiring it would have competed with the upsell below it.
**Avoid it:** before wiring a dead button, ask whether the block belongs on this step.

## Money

### 7. The payment link that's simply absent
**Really is:** the standalone order page's module had no payment link, while the same
module on another page had the right one. A preview saying "no payment link set" may
also be a draft while the live page is wired.
**Avoid it:** extract payment links per page and account for order pages with none.
Check the live URL.

### 8. The order bump is optional, not forced
**Looks like:** the product sheet lists "w/ Bump" rows at base + bump, so order forms
pointing at the base links look mis-wired.
**Really is:** the bump is an optional "Add to your order" item on the base link. The
sheet's bump price is the maximum total. Swapping in the "w/ Bump" links would
force-charge every buyer. One bad inference here produced three false blockers.
**Avoid it:** load the payment link in a browser and look for the add-on section.

### 25. The hardcoded conversion value
**Really is:** a Purchase event hardcoded to the base price on a page that bump buyers
also reach, so bidding optimises against less revenue than was taken; and with a blank
transaction id, every refresh fires another Purchase.
**Avoid it:** check who lands on the page; add `?session_id={CHECKOUT_SESSION_ID}` to
the Stripe success URL so the event carries a real id. Better: send Purchase
server-side from the payment.

### 37. The ticket form on the wrong ticket's page
**Really is:** a form for a different ticket in the same funnel. Every form shares the
funnel prefix, so a topic-only check passes it. Fixing one of form and link but not the
other brings it back.
**Avoid it:** page purpose, **form name** (resolved from its GUID) and **Stripe
product** must name the same ticket and tier.

### 38. The test link that looks like a checkout
**Really is:** a Stripe test-mode link (`/b/test_...` or `buy.stripe.com/test_...`) or
the module's test toggle left on. It renders exactly like a live checkout and takes no
money. A link pasted as `buy.stripe.com/...` instead of the branded host also slips past
a scan that matches only the branded host.
**Avoid it:** extract links from **both** hosts; any `test_` path or test banner on a
published page is a Blocker unless the pause is deliberate and recorded.

### 39. The order page no spec doc lists
**Really is:** member copies, tier upgrades and duplicates on other subdomains all take
money and appear in no spec. One audit found 31 live order pages.
**Avoid it:** list order pages from HubSpot across every domain and audit them as one
table: URL, form name, Stripe product and price, test flag.

## Naming, titles and metadata

### 11. Stale clones nobody remembers
**Really is:** two more live pages on the domain than anyone's list: a duplicate sign-in
page with the same internal name, and an old watch page with last campaign's copy.
**Avoid it:** enumerate pages from HubSpot's listing, not from handed-over URLs.

### 12. Duplicate names and titles
**Avoid it:** when replacing a page, prefix the old one's internal name `Old` and retire
it once the new one is live. Keep public titles unique.

### 13. The internal step name as the SEO title
**Really is:** "Watch Now" and "Replay Sign In" are builder labels. As `<title>` they're
what the visitor's tab and search engines show.
**Avoid it:** write the title for the person receiving the link ("Join the livestream
here!").

### 17. Missing metadata
**Really is:** empty meta description and no `og:image`: every shared link renders as
bare text.

### 18. noindex on every domain at once
**Really is:** a robots tag added to the site header HTML while the domain selector said
"Default settings for all domains" deindexes every HubSpot-hosted domain in the portal.
**Avoid it:** pick the specific domain first, and check what the default header already
holds: a per-domain header overrides rather than appends, so a header with only your
tag drops the GTM container and anything else from that domain.

### 30. The replacement and the page it replaces
**Really is:** a "NEW" page published on a fresh slug while the old one stayed live:
two pages for one step within three hours. This is how #11 starts.
**Avoid it:** retiring the old page is part of publishing the new one.

## Tracking

### 19. `gtag` is undefined, and that's correct
**Really is:** when Google Ads loads through a GTM container, `gtag/js` loads without
defining the global `gtag` helper. Remarketing works; pasted conversion snippets throw.
**Avoid it:** build conversions as GTM tags fired from a `dataLayer` push.

### 20. A page on the wrong subdomain has no pixels
**Really is:** one page of a funnel on another subdomain, where `fbq` and `ttq` were
undefined.
**Avoid it:** check pixels on every page; keep a funnel on one subdomain.

### 24. String-matching source is not measurement
**Really is:** "the off-brand colour is gone, I searched the source" while it was still
applied as an `rgb()` value one digit different. It went into the "verified correct"
list.
**Avoid it:** measure computed styles on a loaded page.

## Forms and records

### 27. The form is another funnel's form
**Really is:** two pages embedding another topic's form. It submits and creates
contacts, so nobody noticed; every submission since launch was counted against the
other funnel, and any follow-up keyed to that form went to the wrong people.
**Avoid it:** resolve every form GUID to its **name**. Swap the reference on your
pages; never rename the shared form. An open "this looks off" note is not a finding;
close it or hand it over.

### 32. The chain past the page is broken
**Really is:** the form submits and nothing is recorded. The chain is
`form -> workflow trigger -> branch on form name -> create-record action -> dropdown
option`, and each link matches on a name string. In one live workflow reporting
"Success" on every run: the page's form wasn't in the trigger, two branch values were
forms the trigger never enrolled, three trigger forms fell through to `None met`, and
one branch wrote a different tag from its siblings.
**Avoid it:** compare the actual strings at each link. "Success" means the workflow
**ran**; read which branch it took.

### 33. The dropdown option the record lands in
**Really is:** a new option whose **internal name** broke the pattern of its siblings
(and looked truncated). Reports group by internal name.
**Avoid it:** check every property that carries the list, the day the option is added,
while it has no records.

### 40. The confirmation page that never sends anyone to the event
**Really is:** pages that redirect late arrivals to the live stream rely on a head
script with a start time. Missing on one subdomain, or pasted with its `<script>` tags
stripped (the template code still ran and printed nothing), nobody is redirected. A
start time already **in the past** redirects every new registrant to the old stream.
**Avoid it:** check the **served** page with a throwaway query string, on every
subdomain: config set once, script loaded once, start time is the incoming event.

## Re-checks

### 28. The stale read
**Really is:** a fix reported as not done, read from a cached copy a minute after
publish. A `?cb=` cache-buster wasn't enough.
**Avoid it:** `fetch(url, {cache: 'reload'})` plus a random parameter, and check the
**updated** time in HubSpot's page listing before calling anything outstanding. A
timestamp days old on a page someone "edited" is its own finding.

### 29. The fix lands on one of the pages carrying the defect
**Really is:** the same wrong form on two pages; one got fixed; then a third page was
cloned from a source that still had it.
**Avoid it:** ask how many pages have the defect first. Fix the set and the clone
source.

### 31. The fix that introduces a regression
**Really is:** a correct page-specific title replaced by "Watch Now" in an unrelated
edit, now colliding with two other pages.
**Avoid it:** re-check title, meta and share image after any edit.

## Rotating events and ads

### 34. The flip that left the ads behind
**Really is:** the event rotated to the next topic and the ads didn't move: the watch
link not updated, the old landing page still taking registrations, ads running to the
old topic the next morning, and purchase campaigns pointing at the free registration
page (spending normally, selling nothing, read as an audience problem for weeks).
**Avoid it:** write the destination map for the incoming topic **before** the flip,
then read every active ad's destination against it. Pausing a campaign and every ad
pointing somewhere valid are different claims.

### 35. The page the ad platform rejected
**Really is:** the **landing page** failed review (scheduled-payment and
covers-your-bills wording, a disclaimer missing beside the testimonials), so ads
stopped. All the flagged phrases came from the spec doc.
**Avoid it:** trace the rejection to the page the ads actually point at before
rewriting anything; never soften approved copy unilaterally; never leave ads rejected.
Take the phrases, the policy text and an alternative to the doc's author.

## Domains

### 41. The domain moved before its pages
**Looks like:** a planned platform move. The funnel is being rebuilt in HubSpot, the
domain has been pointed at HubSpot, and HubSpot shows the domain connected.
**Really is:** the whole funnel is down. An application-and-deposit funnel's two domains
were switched from another platform to HubSpot between two checks a few hours apart,
with no pages published on them in HubSpot, so every path, the home page included,
returned HubSpot's "Page not found". Nothing alerts anyone: the old funnel still looks
fine on the old platform, the new pages look fine in the editor, and ads, emails and
texts keep sending people into a 404.
**Avoid it:** a move is two changes, DNS and pages, and the order matters: **pages
first**, published on the domain and checked at their real URLs, **then DNS**. Before
repointing, list every path the old platform served (from the platform's own page list,
not old links, because some platforms answer any unknown path with a 200) and confirm
each resolves on the new host. After the switch, run
[`domaincheck.sh`](../scripts/domaincheck.sh) and open every path. A HubSpot 404 on
every path is a **Blocker** on every page of the funnel, reported once at the top.

### 42. The forwarding domain nobody re-checks
**Looks like:** nothing. Vanity and old-campaign domains are set up once and never
appear in a funnel audit, because no page lives on them.
**Really is:** each one forwards to a page that can move. Three shapes, all live at
once:
- **Forwards into a 404:** an old community domain forwarding to a path that no longer
  exists.
- **Forwards into a page that will change:** five event domains forwarding to one sales
  page. Re-slug or unpublish it and all five break, with nothing in the CMS to show it.
- **Parked at the registrar:** a dozen brand-name domains showing the registrar's
  placeholder page, which can carry third-party ads.
**Avoid it:** run the domain sweep on every QA pass that touches a page a domain
forwards to, and after any re-slug or unpublish. Report a forward into a 404 as a
**Blocker**. Report parked brand domains once, as a single **Ask** (forward each to its
live site, or let it lapse), not as a task per domain. Fix the record where the
domain's nameservers point, which isn't always the registrar (see
[domains.md](domains.md)).

## Building and porting pages

Entries 43 to 54 came from building, porting and redesigning pages rather than
auditing them. Each one passed a "does the copy match" check.

### 43. The section that took the next section's style
**Looks like:** after a section is deleted, every section below it has the wrong
background, and one section vanishes on desktop while the phone still shows it.
**Really is:** in the page JSON, `layoutSections.dnd_area.rows[i]` pairs with
`rowMetaData[i]` (background, padding, `breakpointStyles.default.hidden`) by position
only. The row was deleted and its style entry wasn't, so every later section took the
style of the one above it, including a desktop-only hide. The phone check passed
because the hide applied to desktop only.
**Avoid it:** add and remove top-level rows and their `rowMetaData` together, assert the
two lengths match, and compare each section's style with the source. Check 1440px as
well as 375px after any structural edit.

### 44. The white heading on a white section
**Looks like:** a section with body text and no heading, and a checklist with icons and
no words.
**Really is:** the text is there, in white. The theme's heading and list modules take a
`sectionStyleVariant`, and the white-text variant meant for a dark band was copied onto
light sections.
**Avoid it:** pick the variant from the section's background and screenshot every light
section.

### 45. The paragraphs that run together
**Looks like:** a block of copy with no gap between paragraphs.
**Really is:** the page's Head HTML zeroes paragraph margins
(`.dnd-module p{margin-bottom:0 !important}`), and every page cloned from it inherits the
rule.
**Avoid it:** add `.dnd-module p + p{margin-top:16px !important}`, or keep one paragraph
per module. Look at every multi-paragraph block.

### 46. The card grid with titles at different heights
**Looks like:** in a three-across grid, one card's title sits far higher than its
neighbours'.
**Really is:** the product images have different shapes (tall books beside a wide
monitor), so each title starts wherever its image ends. A width cap doesn't fix a tall
image.
**Avoid it:** give every image in a grid the same box, a fixed height plus
`object-fit: contain`, and check the title row lines up.

### 47. The review screenshot nobody can read
**Looks like:** a wall of review screenshots, readable on a laptop and a blur on a
phone.
**Really is:** written reviews are pictures of text, and they shrink with the column.
**Avoid it:** every page with review screenshots ships with click-to-enlarge:
[`assets/review-lightbox.html`](../assets/review-lightbox.html) in Head HTML, with the
heading pattern set to the page's review headings. Make it a standing rule for new
builds, ports and redesigns, and test it by opening one review at each width.

### 48. The hero that kept the words and lost the layout
**Looks like:** the copy is right, but the hero has a large empty area under the text,
the button is centred under left-aligned text, and the photo floats.
**Really is:** the source hero was a dark band with a large headline, a left-aligned
button and a cut-out photo resting on the band's bottom edge. The port poured the same
words into a generic two-column hero.
**Avoid it:** compare each section with the source side by side at both widths. Keep
text and button alignment the same inside a block, and rest a cut-out photo on the
section's bottom edge with no bottom padding.

### 49. The year that changed everywhere except the pictures
**Looks like:** the copy says next year throughout.
**Really is:** two graphics still show last year, one with last year's event dates, and
the image alt text still says it too. A text replace reaches neither.
**Avoid it:** after a year or date change, list every image that shows a year or date
and check the alt text. Report the graphics as placeholders that need new artwork, with
the dates needed to make them.

### 50. The order form with no price on it
**Looks like:** a checkout form with an empty space where the product name and price
belong.
**Really is:** the order module shows its label and price from its own fields, and a
clone or new instance leaves them blank.
**Avoid it:** fill the label and price to match the payment link's product, turn test
mode off, and read the price on the page next to the price on the checkout.

### 51. The leftover row on every order page
**Looks like:** an add-to-calendar or upsell block from a free-class page sitting on a
course checkout.
**Really is:** clone residue on every order and confirmation page of the funnel, because
nobody opened those pages after cloning them.
**Avoid it:** after a funnel is built from clones, open every page in it, order and
confirmation pages included, and read each one against what it is for.

### 52. The teammate's edit that got overwritten
**Looks like:** a section someone else built disappears after an unrelated change.
**Really is:** a module was rewritten from a copy read days earlier. A teammate had
turned it into an agenda that morning, and the write erased it.
**Avoid it:** read each module fresh immediately before writing it on a shared page. If
it changed since your last read, keep their content and change only what was asked, or
ask first.

### 53. The copy reported missing that was never visible
**Looks like:** a port audit says dozens of lines of the original are missing.
**Really is:** the lines came from the source platform's HTML, which carries hidden
mobile copies, elements with hide classes, and leftover sections nobody can see.
**Avoid it:** compare visible text only, and report a gap only when the text shows on
the source page.

### 54. The port with the right words and the wrong look
**Looks like:** every line of copy from the source page is on the new page, the buttons
work, and the page passes a copy check.
**Really is:** the port was built from a plain-text extract of the source. It lost the
three background images, the accent words set in a second font (a green serif italic),
dozens of bold phrases, the source's heading capitalisation, and dark text on light
cards, which came out white. HubSpot also drops a section's background colour when a
background image is set, so a transparent overlay meant to sit on cream sits on white.
**Avoid it:** run the side-by-side compare from the
[`hubspot-page-port`](../../hubspot-page-port/) skill on every port, migration and
redesign, and treat each difference as a defect until it is fixed or listed as
deliberate. A copy check alone can't pass a port.
