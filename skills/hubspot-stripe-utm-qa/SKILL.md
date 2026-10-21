---
name: hubspot-stripe-utm-qa
description: >-
  QA, audit and fix UTM attribution end to end in a HubSpot portal that sells
  through Stripe: ad click, a sitewide attribution cookie, registration forms,
  first-touch and last-touch fields on registration records, the contact, an
  order page that appends UTMs to Stripe links, Stripe checkout UTMs, purchase
  records, and an inherited source on payments Stripe could not tag. Use this
  whenever someone says UTM Source or a class/product name is blank, missing,
  wrong or "not tracking"; whenever a sales, registration or payment export is
  audited for attribution ("a third of sales have no UTM Source"); whenever
  asked what first touch vs last touch means on a record, which field to report
  on, or why two UTM fields disagree; whenever a landing page, form, order page,
  payment link or workflow that writes UTMs is built, cloned or changed; and
  whenever asked to verify a UTM fix landed. Reach for it even when the question
  sounds like a quick count, because most wrong UTM answers came from reading
  the wrong object, trusting a field whose meaning had changed, or treating an
  untagged visit as a broken page.
---

<!--
  SKILL.md -- hubspot-stripe-utm-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   ~/.claude/skills/hubspot-stripe-utm-qa/SKILL.md (user level) or
           <project>/.claude/skills/hubspot-stripe-utm-qa/SKILL.md
  What:    The method for finding where a UTM was lost between the ad click and
           the purchase record, proving it with a test, and fixing it at the right
           layer without overwriting what was really captured.
  Why:     One sales audit's "blank UTM Source" turned out to be five separate
           leaks in five different systems. Each had been blamed on the wrong one.
-->

# HubSpot + Stripe UTM QA

A blank UTM is a symptom with several causes, and each lives in a different
system. The job is to find which link in the chain lost the source, prove it
with a test rather than a theory, and fix it at the right layer without
overwriting what was really captured.

## 0. Fill in once

| Thing | Value |
|---|---|
| Registration object and its first / last touch fields | `2-REPLACE`; e.g. `utm_source__f`, `utm_source__l` |
| Purchase object (the one sales exports come from) and its fields | `2-REPLACE`; first, last, Stripe-copy and product/class name fields |
| Stripe payments object (Data Sync or your own mirror) | `2-REPLACE`; raw `stripe_utm_*` fields, inherited fields |
| Workflows that write each field | ids and action numbers |
| Private-app secrets each workflow uses | names only, never values |
| Attribution cookie name, domain and lifetime | e.g. `site_attr`, `.example.com`, 90 days |
| Registration page path(s) | e.g. `/webinar-registration` |
| Your reporting time zone | e.g. US Eastern |
| Source label groups | e.g. Meta: fb, facebook, ig, an, th, wa, meta; texts: sms, text |

## The chain

```
ad click (utm_* in URL)
  -> sitewide header saves the UTMs in a first-party cookie
  -> registration form reads utm_* from the page URL into hidden fields
     (the header can restore them from the cookie on untagged internal visits)
  -> registration workflow writes last touch (this visit) and first touch
  -> order page appends the cookie's utm_* to the Stripe payment link
  -> Stripe copies utm_* into the checkout success_url
  -> a workflow writes stripe_utm_* on the payment record
  -> a purchase-record automation creates the purchase record
  -> a fill workflow, a few minutes later: first touch from the acquiring
     registration, last touch from Stripe, product/class name from the topic
  -> an inherited-source workflow: a source for payments Stripe could not tag
```

[`references/fields.md`](references/fields.md) describes each field's job and
who should write it.

## Procedure

### 1. Pin the object and the field

Ask which export or report the number came from. A "sales" export is usually
the purchase object, not the Stripe mirror. The two have different blank rates,
and the mirror has no class or product name. Measuring the wrong one can be
off by a wide margin.

Then name the exact property: first touch, last touch, the Stripe copy, the raw
Stripe capture, or the inherited source. Each answers a different question.

### 2. Measure live, never from memory

Run [`scripts/utm_audit.py`](scripts/utm_audit.py) after filling in its config
block:

```
python -I scripts/utm_audit.py 2026-01-01 --pages
```

It prints:
- blank and junk rates on purchases, and whether last touch agrees with Stripe
- untagged registrations per day, and junk in the first-touch field
- Stripe payments with no UTM, and how many have an inherited source
- whether the live pages carry the header, the fallback and the order module

Use the CRM search API with explicit UTC bounds for a local day. Reporting-style
query tools have returned whole extra days on date filters. Re-derive every
number before it goes in a message.

### 3. Find the broken link with a test, not a theory

| Symptom | Test ([`references/leak-tests.md`](references/leak-tests.md)) | Usual cause |
|---|---|---|
| Purchase first touch blank / junk | live workflow JSON + property history | fill not running, buyer never registered, junk copied from a registration |
| Purchase last touch blank | is the Stripe copy set? | contact had no stored source |
| Class/product name blank | is the topic set? | automation only writes it on one sales path |
| Registration has no UTM | form submission `pageUrl` | the visit arrived untagged |
| Registration first touch junk | values like IMPORT, ad ids, `fb / ad set`, domains | raw drill-downs mapped into a UTM field |
| Stripe payment has no UTM | `payment_link_id` blank? checkout `success_url` | renewal/invoice (never taggable), or checkout opened in a browser with no cookie |
| Page suspected | fetch with a cache-buster, count markers | header missing on a cloned page, module not used, CDN cache |

Prove which one it is before naming a cause. A blank on a page that saved UTMs
every time its URL had them is an untagged visit, not a broken page.

### 4. Fix at the right layer

Follow [`references/fix-playbook.md`](references/fix-playbook.md). These rules
always apply:

- **Never overwrite a raw capture.** The Stripe capture and a real last touch
  are evidence. Put derived values in their own fields, with a basis field
  saying where each came from.
- **Never map a UTM field straight from HubSpot's traffic-source drill-downs.**
  Parse them in code, with junk rules.
- **One touch per record.** Source, medium and campaign move together, from the
  same record.
- **Read the live workflow JSON first** (`GET /automation/v4/flows/{id}`). The
  local copy may not be what is running.
- **Simulate on a snapshot with `fetch` mocked.** Check it against invariants
  that don't reuse the code's own logic. Then test one backed-up record, verify
  the deployed code is byte-identical, turn the workflow on, and compare every
  processed record with the prediction.

### 5. Report plainly

Use people's words, not field jargon: "where the buyer first came from", "the
class they signed up for". Always group the source labels (Meta, texts). Say
which share is honestly unknown: mostly buyers who never registered or who came
through untagged links. Don't imply everything can be filled. Draft messages;
let a person send them.

## References

- [`references/fields.md`](references/fields.md): what each field should mean,
  who writes it, and the traps on each object
- [`references/leak-tests.md`](references/leak-tests.md): repeatable tests for
  each link in the chain
- [`references/fix-playbook.md`](references/fix-playbook.md): build, simulate,
  deploy and verify, plus HubSpot UI traps and rate limits
- [`references/pitfalls.md`](references/pitfalls.md): mistakes that produced
  confident wrong answers
- [`scripts/utm_audit.py`](scripts/utm_audit.py): the live health check
