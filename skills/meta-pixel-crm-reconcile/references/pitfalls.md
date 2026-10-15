<!--
  pitfalls.md -- measurement traps for meta-pixel-crm-reconcile
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-21 (generic public version 2026-10-15)
  Lives:   skills/meta-pixel-crm-reconcile/references/
  What:    Each trap produced a wrong answer that was stated confidently before
           being caught, in rough order of how often it bites.
  Why:     Knowing the shape of the mistake is cheaper than rediscovering it.
-->

# Pitfalls

## Mismatched windows

The most common error. Meta's data ran to 10 AM, the CRM query ran to 11:20, and the
resulting 0.95x was reported as under-delivery. It was 80 extra minutes of
registrations with no Meta data to match.

Find Meta's last complete hour first, then cut the CRM at exactly that instant. State
the window whenever you quote a ratio.

## Reporting-tool counts

On custom objects, a reporting/SQL-style query tool and the search API can disagree by
30% or more, and the search API matched reality (it agreed with Meta's own count to
within 1%). The reporting tool also drifted between calls on a closed day, and a bare
`COUNT(*)` returned a different total from `COUNT(*), COUNT(DISTINCT x)` with identical
filters. Separately, a search connector once silently ignored filters and returned the
whole object's count.

Use the reporting tool for GROUP BY. Take counts from the search API, after a control
query.

## Unpaid payment intents

A payments object fed by Stripe can hold every PaymentIntent, not only completed ones.
In one week about 16% of rows were `canceled`, `requires_payment_method`,
`requires_confirmation` or `requires_action`. `amount` is set on all of them, so an
unfiltered `SUM(amount)` looks plausible and overstated one day's revenue by about 60%.

Always filter `status = succeeded`. A CAPI action that skips non-succeeded payments
tracks succeeded payments, not raw rows; check the denominator before concluding events
were lost.

## Duplicate CRM records

An attendance workflow that creates a record on every watch-page load produced about six
records per person over a week. An event stream mirroring those records reconciles
perfectly and is still 6x over-counted.

Check `COUNT(*)` against `COUNT(DISTINCT email)` before declaring a match. Where
duplicates are structural, key the event on person + occurrence rather than on the
record id, so Meta collapses them; that only works inside Meta's deduplication window.

## The host breakdown mixes sources

The per-URL breakdown can't be split by source, and CAPI sets `event_source_url` (often
from Stripe's success URL), so server events show up under funnel hosts too. Six events
on one host once matched the browser count for that hour exactly, and the coincidence
blamed the wrong page on the wrong platform.

## Blank guard is not proof

A guard stamped after a 2xx reliably means the event landed. The reverse doesn't hold:
with the workflow's CRM token detached or rotated, events keep reaching Meta and nothing
is stamped. Blank guards once led to "the workflow never ran" when it had run hundreds
of times and been switched off two days earlier. Check Events Manager before declaring a
sender dead.

## Buckets keep filling

The latest hourly bucket is partial: one read 58, then 71, then 73 across three pulls.
A day's total can also grow when a backfill sends events with older `event_time`
values. Pull a bucket twice before treating it as final, and re-check the live API
before re-quoting a figure from an export.

## Lookalike subdomains, different platforms

Two subdomains one letter apart can run on different CMSs with different tracking. An
audit of one side says nothing about the other. Confirm which platform serves each
host before attributing events to it.

## Unmapped inputs fail silently

A custom code action reads its inputs by name. If an input isn't mapped, or is mapped
under a different name, the value is `undefined` and the code falls back to a default,
often "now" for a timestamp. Nothing errors; the action reports success. That's how an
event came to carry a new `event_id` on every send: the dedupe-key input was never
mapped.

After any mapping change, run the action's **Test** and read the logged payload, not
just the status. The values are the evidence; the status code isn't.

## The blended Purchase event

If several products all send `Purchase`, the event is a blend. In one account most
Purchase events were a low-price add-on, so optimising to Purchase chased the wrong
buyer. Split by product (custom conversions on value or content) before judging
campaigns on it.
