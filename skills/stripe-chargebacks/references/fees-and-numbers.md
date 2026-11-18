# Fees, deadlines and numbers

Read this when the user needs a specific figure. All figures are US, checked against
Stripe's docs and pricing page in **November 2026**. Prices and network rules change;
re-check https://stripe.com/pricing and https://docs.stripe.com/disputes before quoting
a figure in anything that leaves the team.

## Stripe dispute fees (US)

| Fee | Amount | Refunded if you win? |
|---|---|---|
| Dispute received | $15 | No (never, unless your contract says otherwise) |
| Dispute countered (you submit evidence) | $15, since June 17, 2025 | Yes |
| Dispute appealed (pre-arb / arbitration) | $15 | No, plus network fees |
| Smart Disputes | 30% of disputed amount, wins only | n/a (no fee on losses) |
| Visa resolution (RDR) | $15 per resolution | n/a (no received fee, not counted) |
| Visa CE 3.0 block | $15 per block | n/a |
| Mastercard resolution (Ethoca) | $29 per resolution | n/a |
| Visa or Mastercard compliance case | $500 network amount on top | Yes, if you win |
| Arbitration network fees | Filing/ruling often $600+; technical violations $250+ | Charged to the loser / violator |
| Radar | from $0.05 per screened transaction (pay as you go) | |

Other countries: Canada CAD 15/15, UK GBP 20/20, Eurozone EUR 20/20, Australia AUD
25/25 (received/countered). Mexico and Japan have no counter fee.

## Break-even for fighting (US)

- Accepting costs: the amount + $15.
- Fighting and losing costs: the amount + $30, plus your time.
- Fighting and winning returns: the amount + $15 (the counter fee back); the original
  $15 is gone.
- So fight when `amount x your win odds > $15 + time cost`. Example: $97 at 25% odds
  ≈ $24 expected recovery; marginal. $497 at 40% ≈ $199; fight.
- Smart Disputes on a win keeps 30%: on $2,000 that's $600; worth it only if you
  wouldn't have fought it yourself.

Total cost per dispute, $500 example:

| Route | If you win | If you lose |
|---|---|---|
| Accept | n/a | $515 ($500 + $15) |
| Manual response | $15 | $530 ($500 + $15 + $15) |
| Smart Disputes (no counter fee) | $165 ($15 + 30% of $500) | $515 |
| Third-party dispute service (typically 15% to 25% of wins) | $90 to $140 | about $530, depending on the vendor |

## Deadlines and timing

| Item | Typical |
|---|---|
| Cardholder's window to dispute | 120 days from payment; for future events and services, often from the service date |
| Your response window | 7 to 21 days by network (trust `due_by`) |
| Issuer decision after evidence | 60 to 75 days; full cycle 2 to 3 months |
| Inquiry auto-closes | 120 days without escalation |
| Pre-arbitration reply (Visa non-fraud, Mastercard) | 20 days |
| Visa fraud appeal to arbitration | 7 days after rejection |
| Issuer escalation window to arbitration | 10 days Visa, 15 days Mastercard |
| Local payment methods (Klarna, PayPal) | Up to 180 days to dispute; their own rules |
| EFW reversal that prevents a fraud report | Usually within about 2 hours of capture |
| Post-closure hold | Around 90 to 120 days |

## Win odds

Stripe's dispute win-likelihood dots (Radar): 5 dots about 60%, 4 about 40%, 3 about
25%, 2 about 15%, 1 about 5%. Vendor claims of 70 to 90% win rates are marketing.

What merchants report on Reddit (single accounts, for scale only): 30% to 40% overall
for an e-commerce store (under 10% on fraud claims, much higher on signed or
photo-verified "not received"); one SaaS dropped from 40% on Braintree to 8% on Stripe;
one merchant lost 9 of 10 fraud disputes despite full 3DS.

## Evidence limits

PDF, JPEG or PNG; one file per evidence type; 4.5 MB combined; under 50 pages
combined; 19 pages for Mastercard; 150,000 characters of text across fields (API).

## Monitoring thresholds

| Program | Trigger |
|---|---|
| Stripe "excessive" | Dispute activity above 0.75% (trend and spikes matter too) |
| Visa VAMP non-compliant | Ratio 0.5% and 5+ disputes/fraud reports in a month |
| Visa VAMP excessive (US etc.) | Ratio 1.5% and 1,500+ |
| Mastercard ECM | 100 to 299 chargebacks and 1.5% to 2.99% |
| Mastercard HECM | 300+ chargebacks and 3%+ |
| Mastercard EFM | 1,000+ e-com payments, $50K+ fraud chargebacks, 0.5%+, low 3DS |
| Visa Secure excessive fraud (US) | $75K EFW volume on 3DS payments and 0.9% |
| EFW → fraud dispute | About 40% if not refunded (Visa, Mastercard) |

## Numbers from the videos that are wrong or outdated

- "Visa's threshold is 0.9%" or "1% gets you banned": older Visa programs (VDMP/VFMP)
  used 0.9%; VAMP replaced them. Stripe's line is 0.75%; Visa's non-compliant line is 0.5%.
- "Only a $15 fee": since June 2025 countering adds a second $15 (refunded on a win).
- "Radar is an early warning tool": Radar scores payments; EFWs and alerts are separate.
- "5 MB upload limit": it's 4.5 MB combined.
- Friendly-fraud market-size and "86% of consumers" stats in vendor videos are unsourced.

## Sources

- Stripe docs: how disputes work, responding, best practices, reason codes, withdrawals,
  monitoring programs, measuring disputes, Smart Disputes, dispute prevention, Radar
  dispute rules, pre-arbitration and arbitration, API (docs.stripe.com/disputes/...)
- Stripe pricing page and the June 2025 dispute pricing update (support.stripe.com)
- Visa CE 3.0 materials (Visa/Verifi) and processor summaries
- 30 YouTube videos by Stripe, chargeback consultants, processors and merchants (2023 to 2026)
- Hacker News threads on Stripe holds, chargeback fraud and whether fighting is worth it
- About 45 Reddit threads (r/stripe, r/smallbusiness, r/ecommerce, r/shopify,
  r/startups, r/Entrepreneur and others, 2023 to Nov 2026), gathered with Gemini and
  checked against Stripe's docs before use. Reddit figures are merchant anecdotes.
- "Radar for Fraud Teams costs $0.02 per transaction" appears in older Reddit threads;
  Stripe's Nov 2026 pricing page lists Radar from $0.05 per screened transaction. Check
  the account's own plan.
