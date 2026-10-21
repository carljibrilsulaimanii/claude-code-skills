<!--
  pitfalls.md -- traps for hubspot-stripe-utm-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   skills/hubspot-stripe-utm-qa/references/
  What:    Each trap produced a confident wrong answer before it was caught.
  Why:     Knowing the shape of the mistake is cheaper than rediscovering it.
-->

# Pitfalls

## Wrong object

- **A sales audit is about purchase records, not the Stripe mirror.** Measuring
  the mirror gives a different blank rate and has no class or product name.
  Ask which export the number came from.
- **Some products have their own purchase object,** or no record at all. A
  missing product line in an audit may be a missing record, not a missing
  UTM.

## Field meanings that changed

- **A first-touch field can mean three things over its life.** It may have
  been a copy of last touch, then raw drill-downs, then true first touch.
  Comparisons across those dates are meaningless.
- **A one-time corrector's live code can differ from the local file.** It may
  have copied junk and blanked good values. Read the live workflow JSON before
  trusting any local copy.
- **The contact's stored UTMs are often stale at purchase time.** Prefer
  Stripe's capture for last touch.
- **An automation that only writes a name on one sales path** makes the blanks
  a coverage gap, not a lookup bug.

## Counting

- **Search filters run in UTC.** Use explicit bounds for a local day.
- **Reporting-style query tools have included the whole next day** on date
  filters. Don't use them for counts.
- **Search results cap at 10,000.** Split by day.
- **EQ filters are case-insensitive.** Count case variants in code.
- **Python's `time.mktime` uses local time.** Use `calendar.timegm` for UTC.
- **One platform can arrive under many source labels.** Counting only `fb`
  undercounts Meta badly; group the labels.
- **Attendance and replay rows on the registration object inflate counts.**

## Matching buyers

- **Guest checkouts rarely carry `customer_id`.** Matching on it found almost
  nothing; matching on email worked.
- **The acquiring class is the most recent one held on or before the purchase
  date.** It isn't the buyer's first or latest registration. Within that
  class, use the earliest sign-up.

## Diagnosing pages

- **An untagged registration is usually an untagged visit.** Read the
  submission `pageUrl` before calling a page broken.
- **A checkout with no UTM is usually a different browser,** for example an ad
  clicked in an in-app browser and the purchase made in Safari. Stripe keeps
  only `utm_*`, so this looks like a direct link. Read `fbclid` or
  `prefilled_email` to tell the two apart.
- **"Every domain" means every domain.** A per-domain header override can hide
  behind one page that works.
- **"Every form" means every form's definition,** not one page's DOM.
- **Funnel pages cache for hours.** Without a cache-buster, a deployed fix
  looks missing.

## Deploying

- **A one-time workflow that's turned off can be correct.** What's missing may
  be an ongoing workflow for new records.
- **HubSpot logs caught errors as "Successfully executed".** A whole batch of
  429s can look green. Read the `status` output, and check for missing
  stamps.
- **Turning a workflow on can fail silently.** Re-pull the flow after any
  error.
- **A prediction file overwritten by a later rule's run** produces hundreds of
  false "differs". Version the files.
- **When a check fails, test the checker before the code.** A stray control
  character in a test's regex once looked like a code bug.
- **A mis-click in a scrolling mapping panel** nearly saved a wrong mapping.
  Cancel unsaved, verify through the API, then redo the mapping one field at a
  time.

## Communicating

- **Use plain words.** Explain each field the first time it comes up.
- **Say what can't be filled.** Buyers who never registered and came through
  untagged links have no source anywhere.
- **Draft, don't send.** Re-derive every number just before handing a message
  over.
