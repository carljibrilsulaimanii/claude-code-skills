---
name: meta-pixel-crm-reconcile
description: >-
  Reconcile Meta pixel and Conversions API events against CRM truth in HubSpot:
  Purchase against succeeded Stripe payments, Lead against registrations, a custom
  event (such as Attended) against attendance records. Explain every gap instead of
  just reporting it. Use whenever asked to reconcile, verify, sanity-check or "check
  the numbers" on Meta events; whenever someone asks why Ads Manager disagrees with
  HubSpot or Stripe; whenever a Meta Events Manager CSV export is pasted; and whenever
  a CAPI workflow is turned on, changed or tested and someone wants to know whether it
  worked. Also use it for over-counting, duplicate events, missing conversions,
  browser-vs-server split, CPL or ROAS accuracy, or whether a pixel fix landed. Reach
  for it even when the question sounds like a quick lookup, because nearly every wrong
  answer here came from comparing two numbers measured over different windows or with
  different filters.
---

<!--
  SKILL.md -- meta-pixel-crm-reconcile
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-21 (generic public version 2026-10-15)
  Lives:   ~/.claude/skills/meta-pixel-crm-reconcile/SKILL.md (user level) or
           <project>/.claude/skills/meta-pixel-crm-reconcile/SKILL.md
  What:    The method for reconciling Meta events with HubSpot records: matched
           windows, a three-way comparison, a gap-diagnosis table, and the traps.
  Why:     One pixel once received about 8x more Purchase events than there were
           paid orders, from four senders nobody had listed in one place. Most wrong
           answers before that came from comparing numbers that only looked
           comparable.
-->

# Meta ↔ CRM reconciliation

Meta's event counts and the CRM's records disagree for many legitimate reasons and a
few illegitimate ones. The job is to tell them apart. A number on its own proves
nothing; nearly every wrong conclusion came from comparing two figures that looked
comparable and weren't.

## 0. Fill in once

| Thing | Value |
|---|---|
| Meta pixel / dataset id | `REPLACE_WITH_DATASET_ID` |
| Ad account id and its time zone | `act_REPLACE` (bucket labels come back in this zone) |
| Your reporting time zone | e.g. US Eastern |
| Payments object (Stripe Data Sync or your own) | `2-REPLACE` |
| Registrations / attendance object | `2-REPLACE` |
| CAPI guard properties (what each workflow stamps after a 2xx) | e.g. `meta_capi_purchase_sent_at` |

## The reconciliations

| Meta event | CRM truth |
|---|---|
| `Purchase` | Payments where `status = succeeded` |
| `Lead` | Registrations with a registered status |
| A custom event (e.g. `Attended`) | Registrations with an attended status |

## Window discipline

This matters more than anything else here.

- **Meta reports on a lag (roughly two hours), and the latest bucket is still
  filling.** Pull hourly data first, find the last *complete* hour, and cut both sides
  there. Comparing Meta-through-10am with CRM-through-now has produced several false
  "under-reporting" alarms.
- **Meta buckets by `event_time`, not by when it received the event.** A backfill sent
  today with last Tuesday's timestamp lands in last Tuesday's bucket, so a day's total
  can grow afterwards. "Sent today" and "events dated today" are different questions.
- **Use explicit UTC bounds** for a local day (US Eastern is `04:00Z` to `04:00Z` in
  daylight time, `05:00Z` in standard time). Never pass a bare date and hope.

## Getting the numbers

[`references/queries.md`](references/queries.md) has the call shapes. Two rules:

- **Counts come from the CRM search API's `total`**, with a control query first (two
  different days must give different totals). Reporting-style query tools have
  returned counts tens of percent off on custom objects, and some silently ignored
  filters while returning the whole object's count. They're fine for GROUP BY, where
  the shape matters; never quote their absolute counts.
- **Split Meta by source.** Browser (`WEB_ONLY`) and server (`SERVER_ONLY`) counts
  carry most of the diagnostic value: browser events come from page snippets and
  codeless rules, server events from CAPI and integrations. A per-URL breakdown can't
  be combined with the source split, so it always mixes the two.

## The three-way comparison

Don't compare two numbers. Compare three:

```
CRM records  ->  CAPI sends (guard property)  ->  Meta received
```

Each gap means something different; one ratio throws the diagnosis away.

A guard property is stamped only after Meta returns 2xx, so a stamp means the event
was accepted. The reverse doesn't hold: if the workflow's CRM token is detached, events
still reach Meta and nothing is stamped. A blank guard is not proof of a missing event.
If a guard is date-only, it can't be windowed below a day; use the record's last
modified time as a send-time proxy and say you did.

## Diagnosing the gap

| Observation | Most likely cause | Where to look |
|---|---|---|
| Meta server **>** CAPI sends | Another server sender, or a retry re-sending what the main workflow sent | The CRM's own ad-conversion settings; the retry workflow's enrolment history |
| Meta server **<** CAPI sends | Window mismatch, or Meta still settling | Re-cut both sides at the last complete hour |
| CAPI sends **<** CRM records | In-flight records, deliberate skips, or failures | Records with no guard, and how old they are |
| Browser **> 0** | A page snippet or a codeless Event Setup Tool rule survives | [`references/senders.md`](references/senders.md) |
| Meta total **≫** CRM | Several uncoordinated senders with no shared `event_id` | [`references/senders.md`](references/senders.md) |
| CRM records **≫** unique people | Duplicate record creation upstream | `COUNT(*)` vs `COUNT(DISTINCT email)` |

That last row changes the meaning of everything above it. If the CRM holds six records
per attendee, an event stream that faithfully mirrors them is 6x over-counted while
reconciling perfectly. Check records per person before declaring a match.

## Reporting

Lead with a table, one row per measured quantity, and put the window in the heading.

```markdown
**<Event> -- <window, in your time zone>**

| | Count |
|---|---|
| CRM records | |
| CAPI sends | |
| Meta browser | |
| Meta server | |
| **Ratio (Meta ÷ CRM)** | |
```

Flag, don't bury:
- any browser count above zero, with the page or rule responsible if known
- server sends above CAPI sends: a sender nobody is tracking
- records per person above ~1.1
- anything measured with a proxy or over mismatched windows

When a number contradicts an earlier one, say so plainly and give the corrected figure.

## Before concluding

Cross-check with an independent source where one exists. The CRM search API and Meta's
own count agreeing is far stronger than either alone; that's how a bad reporting count
was caught.

If the answer is "this doesn't reconcile and I don't know why", say that. A plausible
explanation offered as fact stops the investigation.

## Reference files

- [`references/queries.md`](references/queries.md): call shapes, filters, timestamps
- [`references/senders.md`](references/senders.md): every kind of Meta event sender and
  how to check each one; keep your own list current
- [`references/pitfalls.md`](references/pitfalls.md): measurement traps, each learned
  the hard way
