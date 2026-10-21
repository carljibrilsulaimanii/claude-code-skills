<!--
  fields.md -- field roles for hubspot-stripe-utm-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   skills/hubspot-stripe-utm-qa/references/
  What:    What each UTM field should mean, who should write it, and the traps
           on each object.
  Why:     Most wrong answers came from a field whose meaning had changed, or from
           two fields that looked alike but answered different questions.
-->

# UTM fields, writers and meanings

Record the date whenever a field's meaning changes, and never compare values
across that date.

## Contents

- [Registration records](#registration-records)
- [Purchase records](#purchase-records)
- [Stripe payment records](#stripe-payment-records)
- [Contact](#contact)
- [Pages and the cookie](#pages-and-the-cookie)
- [Keys](#keys)

## Registration records

| Field | Should mean | Use it for |
|---|---|---|
| last touch (`utm_*__l`) | the UTMs on the visit that made this registration | crediting a campaign with registrants |
| first touch (`utm_*__f`) | the person's first known source, parsed in code from Original Traffic Source and its drill-downs, with the registration UTMs as the fallback | first-touch analysis |

Traps:
- **First touch is the field most likely to have changed meaning.** It may have
  been a copy of last touch, then raw drill-downs, then true first touch.
  Check its property history before trusting it.
- Other workflows can create attendance or replay rows on the same object.
  Filter to real registrations.
- Count a class by its date field, not a session label, if sessions are
  assigned late.
- Every registration form needs hidden `utm_source`, `utm_medium`,
  `utm_campaign`, `utm_content` and `utm_term` fields, with blank defaults so
  the page URL fills them. Older forms with one packed
  `utm_source_medium_campaign` field are a sign of an abandoned version.

## Purchase records

These are usually created by an automation that copies:
- the contact's stored UTMs into last touch
- something frozen at registration into first touch
- the class or product name, often on only one sales path

A fill workflow running a few minutes after creation should set these
fields:

| Field | After the fill |
|---|---|
| first touch | the acquiring registration's last touch: the most recent class held on or before the purchase date, with the earliest sign-up within it and junk skipped. With no clean registration, keep a clean value and clear a junk one. If the buyer never registered, leave it blank. |
| last touch | the Stripe copy whenever Stripe captured a source (all three fields together); otherwise what the automation wrote |
| class/product name | if blank: the title from a config object keyed by topic, skipping placeholder titles |
| `*_set_at` | stamped on every run that finishes (the re-run guard and the "processed?" test) |

A one-time corrector left in place can silently overwrite this with stale
logic. Check who last wrote each value (property history `sourceId`).

## Stripe payment records

- **Raw capture `stripe_utm_*`:** taken from the checkout `success_url`.
  Never backfill it.
- **Inherited fields:** `inherited_utm_source` / `_medium` / `_campaign`,
  `inherited_utm_basis` and `inherited_utm_set_at`, for succeeded payments
  with no Stripe UTM. The basis, in order of preference:
  1. an earlier tagged payment by the same buyer
  2. the acquiring registration
  3. the contact
  4. no source found
- **Blank with no `payment_link_id`:** renewals, subscription creation and
  invoices. These can never carry a UTM.
- **Matching buyers:** guest checkouts rarely carry `customer_id`, so match on
  `receipt_email` / `customer_email`.
- **Unpaid rows:** mirrors often include payments that never completed.
  Filter `status = succeeded`.

## Contact

- `utm_*`: the last tagged visit. It's overwritten by later sessions, so it's
  often stale at purchase time.
- `hs_analytics_source`, `_data_1` and `_data_2` are Original Traffic Source
  and its drill-downs. **They are not UTMs.**
  - HubSpot lowercases them, turns `+` into a space and drops a trailing `+`.
  - Drill-down 2 holds different things by source: "source / ad set", "IMPORT
    / id", a referring domain, or the platform plus the campaign.
- Parse these in code. Restore casing by looking up the same campaign on other
  records that kept the original spelling.

## Pages and the cookie

- **Sitewide header:**
  - It writes the attribution cookie (e.g. 90 days, on the parent domain) only
    on page views that carry campaign params. It replaces the cookie, never
    merges it.
  - Check that no domain overrides the default header.
  - A **registration fallback** in the header restores the saved UTMs into the
    URL (`history.replaceState`) on the registration page. It does this when
    the visit has no campaign params and the referrer is empty or your own
    domain, before the form loads.
  - Expose a flag such as `window.SiteAttr.restored` so it can be tested in the
    console.
- **Order page module:** it reads the cookie and appends clean `utm_*` to the
  Stripe link.
- **What Stripe keeps:** Stripe copies **only** `utm_*` into the
  `success_url`. A checkout opened with an empty cookie therefore looks exactly
  like a direct Stripe link.

## Keys

- Give each ongoing workflow its own private-app key. A key shared by several
  workflows that run at once hits HubSpot's per-key 10-second limit, which
  shows up as 429 errors.
- A read-only local token can't create properties (no schema scope). Create
  them in the UI, with internal names and option values exactly as the code
  writes them.
