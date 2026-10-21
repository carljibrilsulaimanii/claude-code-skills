<!--
  leak-tests.md -- repeatable tests for hubspot-stripe-utm-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   skills/hubspot-stripe-utm-qa/references/
  What:    One test per link in the attribution chain, with what healthy looks
           like and what a failure means.
  Why:     Each leak was first blamed on the wrong system; a test settles it.
-->

# Leak tests

These tests only read data, unless a test says otherwise. Never print a key.

HubSpot search filters dates in UTC. US Eastern midnight is 04:00Z in daylight
time and 05:00Z in standard time.

## Contents

1. [Whole chain in one run](#1-whole-chain-in-one-run)
2. [Is the workflow running the code you think?](#2-is-the-workflow-running-the-code-you-think)
3. [Purchase first touch / last touch / name](#3-purchase-first-touch--last-touch--name)
4. [Registration has no UTM](#4-registration-has-no-utm)
5. [Registration first touch is junk](#5-registration-first-touch-is-junk)
6. [Stripe payment has no UTM](#6-stripe-payment-has-no-utm)
7. [Page carries the header, fallback and module](#7-page-carries-the-header-fallback-and-module)
8. [Registration fallback fires](#8-registration-fallback-fires)
9. [Form has the hidden UTM fields](#9-form-has-the-hidden-utm-fields)
10. [Inherited source coverage](#10-inherited-source-coverage)
11. [Code step reports errors as success](#11-code-step-reports-errors-as-success)

## 1. Whole chain in one run

```
python -I scripts/utm_audit.py 2026-01-01 --pages
```

Runs [`scripts/utm_audit.py`](../scripts/utm_audit.py).

Save the first clean run as your baseline. Investigate when any of these
happen:
- First-touch blanks rise by more than a few points.
- Any junk appears in a first-touch field.
- Last touch disagrees with Stripe on any record where Stripe has a source.
- More than a handful of purchases are left unprocessed after the delay.
- Untagged registrations jump.
- Inherited coverage falls behind for more than a day.
- Any page is flagged.

## 2. Is the workflow running the code you think?

```
GET https://api.hubapi.com/automation/v4/flows/{flowId}
```

In the custom code action, compare these against the local file:
- `sourceCode`: normalise the line endings and hash both copies
- `secretNames`, `inputFields`, `outputFields` and `runtime`

Then read `isEnabled`, the enrollment criteria (re-enrollment), and
`revisionId`. Save the JSON as a backup before changing anything.

## 3. Purchase first touch / last touch / name

For a sample of blank purchase records, pull these properties:
- first touch, last touch and the Stripe copy
- topic, name and the `*_set_at` stamp
- `hs_createdate`

Then pull the buyer's registrations and read each case like this:
- **No stamp, and older than the delay:** the fill did not run. Go to test 11.
- **Stamped, but first touch blank and no clean registration:** an honest
  unknown.
- **Last touch differs from Stripe while Stripe has a source:** a regression in
  the fill.
- **Name blank but topic set:** the config title is missing or is a
  placeholder.

`propertiesWithHistory=<field>` shows which workflow or integration wrote each
value.

## 4. Registration has no UTM

```
GET https://api.hubapi.com/form-integrations/v1/submissions/forms/{formGuid}?limit=50
```

Read `pageUrl` on the submissions behind the untagged registrations:
- **No `utm_`, while tagged visits on the same page saved correctly:** an
  untagged visit (shared link, organic, a text message, a different browser).
  The page is not broken.
- **`utm_` in the URL but the registration is untagged:** the hidden fields or
  the workflow mapping are broken. Run tests 9 and 2.

## 5. Registration first touch is junk

Search the records created after the first-touch fix for first-touch values
the junk rules reject:
- `IMPORT`
- an all-digit ad id
- a GUID
- a domain
- anything containing `/`, `|` or `{{`
- anything longer than 40 characters

Any hit after the fix is a regression. Hits from before it are history to
repair.

## 6. Stripe payment has no UTM

Split succeeded payments with no `stripe_utm_source` into two groups:
- **`payment_link_id` blank:** a renewal, subscription creation or invoice.
  These can never carry a UTM. The inherited fields cover them.
- **`payment_link_id` set:** a link checkout. Read the session's
  `success_url` params:

```
GET https://api.stripe.com/v1/checkout/sessions?payment_intent={pi}
```

The key needs Checkout Sessions read. What the params tell you:
- **No `utm_*`, but `fbclid` or `prefilled_email` present:** the order module
  ran with an empty cookie. The buyer was in a different browser from the ad
  click (an in-app browser, then Safari).
- **No params at all:** a direct Stripe link from a text, an email or a rep.

## 7. Page carries the header, fallback and module

Fetch with a cache-buster (`?hsCacheBuster=<epoch>`), because funnel pages can
cache for hours. Then count marker strings in the HTML:
- the header's comment banner
- the fallback block's label
- the order module's class name

Also check every domain's Site header HTML in Settings > Content > Pages. Each
must inherit the default, not override it.

## 8. Registration fallback fires

Use a fresh browser profile.

1. Open a tagged URL:
   `https://example.com/?utm_source=qa&utm_medium=test&utm_campaign=fallback_check`.
2. Type in the registration page URL with no params, so there is no referrer.
3. Check that the address bar now has the `utm_*` params, and that your
   console flag (e.g. `window.SiteAttr.restored`) is `true`.
4. Open the page again from an outside referrer. Expect no restore this time.

Don't submit the form. A real submission creates records.

## 9. Form has the hidden UTM fields

```
GET https://api.hubapi.com/marketing/v3/forms/{formGuid}
```

Each form needs hidden `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content` and `utm_term` fields, with blank default values. Check every
form you use, not one page's DOM. Check a cloned form before launch.

## 10. Inherited source coverage

Take succeeded payments with no Stripe UTM. Count them by whether the
`*_set_at` stamp is set, then by basis. The processed count should equal the
total within a day.

For a few records of each basis, work the source out by hand and check that
the rule picked it. For a full check, compare every processed record with an
offline prediction made from a snapshot, and rebuild the prediction whenever
the rule changes.

## 11. Code step reports errors as success

HubSpot shows "Successfully executed" for a run whose code caught an error and
returned it as an output. Two ways to see the real result:
- Open the workflow's Action logs and read your `status` output column.
  Anything that starts with `error:` failed.
- Look for records with no stamp after the delay has passed.

A 429 with "TEN_SECONDLY_ROLLING" means another workflow saturated a shared
key. See [`fix-playbook.md`](fix-playbook.md#8-rate-limits-and-the-retry).
