# Account health: dispute rates, monitoring programs, reserves and closure

Read this when the user is worried about their dispute rate, sees a VAMP or
monitoring warning, has a reserve or payout hold, got a document request, or had a
Stripe account restricted or closed.

## Two different rates

| Measure | Formula | Used for | Where in Stripe |
|---|---|---|---|
| **Dispute activity** | Disputes received in a period ÷ payments in that period (by dispute date) | Card network monitoring programs | Dashboard > Analytics |
| **Dispute rate** | Disputes on payments made in a period ÷ those payments (by charge date) | Spotting which sales or products cause disputes; keeps changing for ~120 days | Radar page |

Everything counts: won, lost, withdrawn and accepted disputes. Visa also counts
**early fraud warnings**. Refunds don't reduce the count. Inquiries that never escalate
don't count. Disputes resolved through pre-dispute programs (RDR, Ethoca, CE 3.0
blocks) are excluded.

## Thresholds (as of November 2026)

**Stripe**: industry standard treats dispute activity **above 0.75%** as excessive,
but a sudden spike or a steep upward trend can draw attention well below that. Stripe
also runs predictive models and may warn you before you get there.

**Visa VAMP** (Visa Acquirer Monitoring Program, monthly, per statement descriptor):

- VAMP count = disputes (TC15) + fraud reports/EFWs (TC40). The same payment can count
  twice if it has both.
- VAMP ratio = VAMP count ÷ captured transactions in the same month.

| Level | Count | Ratio (US, Canada, EU, AP, LAC) |
|---|---|---|
| Non-compliant | 5+ | 0.5% |
| Excessive | 1,500+ | 1.5% (2.2% and $75K volume in CEMEA) |

Visa assesses fees above Excessive and may above Non-compliant. Stripe shows your
standing in the VAMP dashboard (Radar > VAMP), including its own daily estimate.
Separate enumeration (card testing) monitoring: 300,000 enumerated attempts and 20%
ratio; no fines.

**Mastercard ECP** (monthly; chargebacks this month ÷ transactions last month):

| Level | Chargebacks | Rate | Fines |
|---|---|---|---|
| ECM | 100 to 299 | 1.5% to 2.99% | $0 month 1, $1,000 months 2-3, rising to $100,000 at 19+ months |
| HECM | 300+ | 3%+ | rising to $200,000 at 19+ months |

Exit after 3 consecutive months under the threshold. Mastercard **EFM** (excessive
fraud) applies at 1,000+ e-commerce payments, $50K+ fraud chargebacks, 0.5%+ fraud
rate, and low 3DS usage.

**Visa MERP** (Asia Pacific, from October 2026) targets new accounts with
concentrated fraud and declines; can bring backdated fraud disputes and VMSS listing.

**MATCH list**: a merchant terminated for excessive disputes or fraud can be added to
Mastercard's MATCH (Terminated Merchant File) for 5 years, which blocks most other
processors. It isn't automatic on closure, but it's the reason to fix ratios early.

Rough comfort zone: keep monthly dispute activity plus EFWs **well under 0.5%**, and
watch the trend, not just the level.

## Estimating where you stand

- Count payments by capture date and disputes by creation date, per card brand, per
  calendar month. For US accounts Stripe suggests counting disputes from the 5th of
  the month to the 5th of the next month (reporting lag).
- `node scripts/list-disputes.mjs --all --days 120` gives the dispute side; pull
  payment counts from the Dashboard or Sigma.
- Add EFW counts for Visa.

## What triggers a Stripe review, reserve or hold

From the videos and merchant threads, and consistent with Stripe's own description:

- Rising dispute or refund rate, or a spike in EFWs
- **Delayed fulfillment**: paying now for something delivered later (event tickets,
  pre-orders, cohort programs, deposits) means Stripe carries the refund risk until
  delivery
- Sudden jump in volume or average ticket size (a big launch or sale)
- Business model that changed from what was described at signup, or a restricted category
- Unanswered document requests, mismatched business details

Low dispute rate alone isn't a guarantee. Merchant reports (anecdotes, not rules):
- A startup closed at 0.18% (7 disputes in about 3,900 payments) after fast growth, with
  a 120-day hold.
- A SaaS terminated at 0.9% with $80,000 held for 120 days.
- Small accounts flagged after more than about 5 disputes in a month.
- Coaching, high-ticket courses and personalized services get extra scrutiny.
- Clusters of early fraud warnings preceding shutdowns.

## Reserves and payout holds

- A **reserve** holds a percentage of volume or a fixed amount to cover future
  refunds and disputes. Reserved funds cover only refunds and disputes.
- After a closure, Stripe typically holds remaining funds for around **90 to 120
  days** (the dispute window), then pays out the balance. Disputes and refunds after
  closure can still pull the balance negative and be debited from the bank account.
- Rolling reserves of **25%** of payouts are reported on accounts flagged for risk. Ask
  for a reassessment with fulfillment proof and a falling dispute trend.
- **Released doesn't mean paid.** Merchants report balances sitting in "Available" after
  the hold ended. If that happens, open a ticket that says exactly that: the hold period
  ended on [date], [amount] shows Available, and the payout hasn't been sent.
- A negative balance from lost disputes is a debt under the merchant agreement (often
  with a personal guarantee). Stripe reportedly offers payment plans before collections;
  ask for one early.

## When Stripe asks for information or restricts the account

1. Identify exactly what it is: document request, payout hold, reserve, restricted
   payments, or closure. Read the email's stated reason.
2. **Answer requests fast and completely.** Missing deadlines on these escalates.
3. Pause any risky spend or launch that would spike volume until it's resolved.
4. Build a short review packet: what you sell and how it's delivered, fulfillment
   timeline, refund policy, recent dispute causes and what you changed, proof of
   delivery for future-dated events.
5. Refund clear problem orders proactively.
6. Before a big launch, tell Stripe the expected volume and delivery dates.

## If the account is closed

- Use the review or appeal link in the closure email; respond specifically to the
  stated reason.
- **Export first**: payments, customers, subscriptions, disputes. Don't close the
  account yourself.
- Ask Stripe to migrate saved cards to the new processor (the receiving processor must
  be PCI Level 1).
- Don't open a new Stripe account to get around it; that breaks Stripe's terms and
  usually gets found.
- You're still liable for refunds and disputes on past payments.
- Escalation paths merchants report working: pushing past the first automated "no" to
  get a human review with fulfillment logs, invoices and usage proof; a short, specific
  email to a senior contact; or a public post in r/stripe or on Hacker News that draws a
  Stripe employee's attention. In the UK and EU, financial ombudsman complaints have
  moved stuck payouts. Results vary.

## Backup processing

- Keep a second processor approved before you need it; approval can take weeks.
- A dedicated merchant account, underwritten up front, suits high-ticket and
  delayed-fulfillment businesses.
- Never use vague descriptors or split volume across accounts to hide a dispute ratio;
  networks and processors treat that as a red flag, and it doesn't fix the cause.
