---
name: stripe-chargebacks
description: >-
  Handle, win and prevent Stripe disputes and chargebacks: triage open disputes by
  deadline, decide accept vs fight vs refund, build evidence and write the rebuttal
  for the reason code, keep dispute rates under Visa and Mastercard thresholds, and
  protect the account from reserves and closure. Use WHENEVER the user mentions a
  dispute, chargeback, inquiry, early fraud warning, Smart Disputes, fraud Radar
  rules, dispute rate, VAMP, or a Stripe reserve, hold or closure, even without the
  word "chargeback." Trigger on "we got a dispute," "win this chargeback," "write the
  dispute response," "what evidence do I upload," "should we accept it," "customer
  says they didn't authorize it," "our dispute rate is too high," "Stripe is holding
  our payouts," "list our open disputes." Not for plain refund requests with no
  dispute, building payment links, revenue reconciliation, or a consumer disputing
  their own charge.
---

# Stripe chargebacks

Built from Stripe's own dispute, pricing, Radar and card-network monitoring docs (as of
November 2026), 30 merchant-side videos (14 on handling Stripe disputes, 7 on Stripe
account reviews and Radar fraud rules, 9 on card chargebacks in general, whose Visa and
Mastercard rules apply on Stripe too), 44 Reddit threads (38 about Stripe, 6 about
chargebacks with no processor named) and 4 Hacker News threads.
Where a video or a Reddit post disagrees with Stripe's docs, the docs win and the
reference files say so. Reddit and video figures are anecdotes, labelled as such.

Your job: **triage, decide, assemble, and draft.** Find what's open and when it's
due, decide per dispute whether to fight, accept or refund, pull the Stripe facts,
tell the user exactly which evidence to gather, and write the rebuttal and the
customer message. You do **not** submit, accept or refund anything in Stripe
yourself unless the user explicitly says to for that dispute; a dispute response is
one-shot and can't be edited after it goes in.

Fees, deadlines and thresholds below are rules of thumb that card networks and
Stripe change; `references/fees-and-numbers.md` has the as-of date and sources.
This is operational guidance, not legal advice.

## The one idea everything rests on

**A dispute is decided in seconds by a stranger at the cardholder's bank, against a
specific reason code, using only what you upload.** Stripe passes the file along; it
doesn't judge it. So:

- **Answer the reason code, not the customer's story.** A fraud claim needs proof the
  real cardholder bought it; a "not received" claim needs proof of delivery or use.
  Generic proof that you're a real business moves nothing.
- **Usage after purchase is the knockout punch.** Logins, lessons opened, downloads,
  attendance, replies saying thanks, after the date they say they got nothing.
- **The evidence is built before the dispute exists.** Terms checkbox, receipt,
  payment-plan confirmation, access logs, attendance records. If it isn't captured at
  checkout and delivery, it can't be uploaded later.
- **Won disputes still count.** Networks count disputes received, not lost. Fighting
  recovers money; only prevention protects the account.

## How to coach

Before advising, get the facts the advice branches on:

1. The dispute id (`du_` or `dp_`), or run `scripts/list-disputes.mjs` to list what's open.
2. Reason and network code, amount, and the **response deadline** (Dashboard date wins).
3. What was sold (ticket, course, coaching, deposit, membership, physical goods) and
   whether it was delivered or used.
4. Whether the customer has been in touch, and whether a refund was promised or made.
5. Whether the account is under any dispute-rate pressure right now.

Then meet them where they are:

| If the user is... | Read |
|---|---|
| Looking at an open dispute, deciding what to do | `references/respond-step-by-step.md` |
| Gathering evidence for a specific reason code or product type | `references/evidence-by-reason.md` |
| Writing the rebuttal, filling Stripe's form or the API evidence fields | `references/rebuttal-writing.md` |
| Asking why disputes happen or how to cut them (descriptor, checkout, EFWs, alerts, Radar, 3DS) | `references/prevention.md` |
| Worried about dispute rate, VAMP, Mastercard programs, reserves, a hold or closure | `references/account-health.md` |
| Needing a fee, deadline, win rate or threshold | `references/fees-and-numbers.md` |

## Pulling the facts from Stripe

Two read-only scripts ship with this skill (GET requests only, nothing is submitted).
They need a Stripe key with Disputes, Charges, Customers and PaymentIntents read in
the `STRIPE_LIVE_KEY` environment variable; never read or print the key file.

```powershell
node <skill-dir>\scripts\list-disputes.mjs            # open disputes + inquiries, nearest deadline first
node <skill-dir>\scripts\list-disputes.mjs --all --days 365
node <skill-dir>\scripts\dispute-packet.mjs du_...    # one dispute as a Markdown fact sheet
```

The packet shows reason code, deadline in ET, CE 3.0 status, what Stripe already
pre-filled, AVS/CVC/3DS/Radar results, IP, receipt, and the customer's other payments
(prior undisputed purchases 120 to 365 days earlier are the Visa CE 3.0 pattern).

## The dispute, start to finish

1. **Read the deadline and reason code first.** Missing the deadline is an automatic
   loss. Inquiries (`warning_needs_response`, mostly Amex and Discover) must be
   answered too; an ignored inquiry becomes a near-unwinnable chargeback. → `respond-step-by-step.md`
2. **Check whether the customer is right.** Your error, product not delivered, or
   no use at all → accept (or refund an inquiry) instead of paying a second $15 to lose.
3. **Run the economics.** $15 received fee is gone either way; countering costs
   another $15, refunded only if you win. Below roughly $30 to $50, or with weak
   evidence, accepting is usually right. → `fees-and-numbers.md`
4. **Contact the customer** (draft it; don't send without the user's OK). Ask what
   happened and, if resolved, ask them to withdraw with their bank. Still submit
   evidence: a withdrawal alone can resolve as a loss.
5. **Gather evidence for that reason code**, as one file per evidence type, inside
   4.5 MB and the page limit (Mastercard 19 pages). → `evidence-by-reason.md`
6. **Write a one-page rebuttal**: who bought what, when, how it was delivered and
   used, what they agreed to, why the claim fails. Facts in date order, no emotion,
   no links, no audio or video. → `rebuttal-writing.md`
7. **Submit once, before the deadline, with time to spare.** Then wait 60 to 75 days
   for the issuer. If lost and appeals are enabled, pre-arbitration and arbitration
   exist but cost hundreds in network fees; rarely worth it below several thousand dollars.
8. **Log the root cause** (own error, friendly fraud, true fraud, confusion) and fix
   the leak upstream. → `prevention.md`

## House style for what you write

- **Rebuttal**: neutral, factual, chronological, short (one page plus labelled
  exhibits). First two sentences carry the whole case. Every claim points to an
  exhibit. Never overstate usage you can't show.
- **Customer message**: warm, short, plain words, no threats, no legal language, no
  blame. Acknowledge, ask what went wrong, offer the fix, then ask them to call the
  bank and withdraw. Use the business's own rep voice if it has one.
- **Status report to the team**: count of open disputes, nearest deadline, dollar
  total at stake, which ones to fight vs accept and why, in plain language.

## Things to steer the user away from

- "Let's just ignore it" → no response is an automatic loss, and an ignored inquiry
  can't be fought later.
- "Upload everything we have" → reviewers skim; bury the one proof that matters and you
  lose. Excerpt the relevant policy clause, crop the screenshot, label it.
- "Ask them to withdraw instead of us refunding" when you agree they're owed money →
  accept the dispute; a withdrawn dispute still counts and still needs evidence.
- "Refund every early fraud warning" → only worth it on charges near or below the
  dispute fee, unless the account is close to a threshold.
- "Give them a partial refund to make it go away" → they can still dispute the full
  amount later and some banks pay out twice. Refund in full, or get a written settlement
  and keep the refund ARNs.
- "Our terms say no refunds" on a fraud claim → irrelevant to "I didn't authorize it";
  only proof tying the buyer to the cardholder helps.
- "Turn on dispute resolution and forget it" → cap it by amount; merchants report it
  refunding whole high-ticket charges on partial disputes.
- "We lost, so the money's gone" → often true, but the customer still owes what they
  agreed to; demand letters and small claims are the owner's call.
- "Win every chargeback with this hack" → no such thing; a 5-dot Stripe rating is
  about 60%. Threats to blacklist customers, fake documents, or claimed usage you
  can't log are worse than losing.
- "Open a new Stripe account" or "spread volume to hide our ratio" after trouble →
  against Stripe's terms and doesn't fix the cause.
- "Turn on a Radar block rule today" → run it as review first and check what it
  would have caught.

## When it's done

A dispute is handled when evidence is submitted (or the dispute accepted) before the
deadline, the customer message is drafted, and the root cause is logged. The account
is healthy when monthly dispute activity sits well below 0.5% of transactions with
early fraud warnings included, and the Stripe Dashboard shows no VAMP or monitoring
warning. Stop optimizing a single dispute once the packet answers its reason code;
spend the remaining time on prevention.
