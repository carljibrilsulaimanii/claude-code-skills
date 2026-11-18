# Preventing disputes

Read this when the user asks why disputes happen, how to reduce them, what to do with
early fraud warnings, whether to use alerts or dispute prevention, or how to set up
Radar rules and 3D Secure.

## The order that matters

Most disputes aren't professional fraud. They're confusion (didn't recognize the
charge), regret, a failed refund or cancellation, or a family member using a saved
card. Fix those first; they're cheap. Then add interception (alerts and EFW refunds),
then fraud screening (Radar, 3DS).

## 1. Make the charge recognizable

- **Statement descriptor**: use the brand people know or the website (for example
  `BRAND.COM`), not the legal entity. Stripe descriptors are 5 to 22 characters; a
  dynamic suffix can name the product. Test by buying something yourself and checking
  your own statement. Changing it affects how renewals show up, so tell subscribers.
- Put support contact in the account's public details (phone or URL) so it shows on
  the statement where banks support it.
- A **"what is this charge?"** page at the descriptor's URL with the company name,
  products, prices, and a way to get help or a refund.
- If you use several descriptors, give them the same static prefix: Visa monitors each
  descriptor (per country and acquiring bank) as a separate account.

## 2. Checkout that doubles as evidence

- Required, unticked **terms and refund policy checkbox**, with the relevant clauses
  visible near the button, not only behind a link
- Clear total price, recurring terms and next charge date before payment
- Capture name, email, phone, billing address (AVS), and keep IP and device data
  (Stripe Checkout, Payment Links and Elements collect richer signals for Radar than a
  raw API integration; API-only integrations should add Radar session data)
- Use a consistent Customer record per buyer instead of guest checkouts, so prior
  purchase history (CE 3.0) can be found later
- Store order metadata on the PaymentIntent (product, tier, event date, CRM id)

## 3. After payment: confirmation, onboarding, check-ins

- Instant branded receipt showing the descriptor text, what was bought, and how to get help
- Access or ticket email right away; reminders before live dates
- For programs, coaching and payment plans: a welcome message restating what's
  included and the payment schedule, and ask them to reply to confirm
- A short satisfaction check early on ("how's it going so far?"), and keep the reply
- Make the support channel faster than calling the bank: published email, phone or
  text, and quick replies. A refund you give is cheaper than a dispute you win.

## 4. Subscriptions and memberships

- One-click cancellation in the account area (hidden cancel flows drive "canceled
  recurring" disputes and regulators are tightening rules on them)
- Reminder before trials convert and before renewals: about 7 days before an annual
  renewal, 2 to 3 days before a monthly one
- Receipt after every renewal with a cancel link
- A flexible early-cancel refund (for example, full refund if canceled the day after billing)
- Revoke access when a dispute is filed, and don't let the same customer re-add a card
  to get around it until support has talked to them

## 5. Early fraud warnings (EFWs)

An EFW is the issuer reporting a payment as fraud to Visa, Mastercard or JCB. No
money moves, but **Visa counts EFWs in VAMP** whether or not a dispute follows.

- About 40% of Visa and Mastercard EFWs become fraud disputes if not refunded.
- Stripe's guidance: refunding pays off on charges **at or below roughly your dispute
  fee**; on charges more than about 35% above the fee, it usually isn't worth it.
- Refunding does **not** remove the EFW from Visa's count. Only a reversal (usually
  within about 2 hours of capture) prevents the fraud report.
- Refund more aggressively when the account is near a threshold, or the payment is
  clearly fraud (stolen-card pattern) and the goods haven't been delivered yet.
- Listen for `radar.early_fraud_warning.created` and route it to someone, or use a
  Stripe Workflow.
- Separate auth and capture plus manual review on risky payments: a payment caught and
  canceled before capture isn't reported at all.

## 6. Alerts and Stripe dispute prevention

Card networks run pre-dispute programs that let you refund or answer before a
chargeback is filed. Stripe integrates them directly (Settings > Disputes, no code):

| Tool | What it does | US price (Nov 2026) |
|---|---|---|
| Deflection (Verifi Order Insight for Visa, Ethoca Consumer Clarity for Mastercard) | Shows the cardholder order details in their banking app so they recognize the charge | Included |
| Visa CE 3.0 block via Order Insight | Blocks a Visa fraud dispute before filing when CE 3.0 history exists | $15 per block |
| Visa resolution (RDR) | Radar rule auto-refunds matching Visa disputes before they become chargebacks | $15 per resolution |
| Mastercard resolution (Ethoca) | Same for Mastercard | $29 per resolution |

Resolved disputes don't count toward the dispute rate or VAMP and don't incur the
dispute received fee. Resolution rules look like:

```
Resolve dispute if :amount_in_usd: <= 50.00
Resolve dispute if :is_fraudulent: = false and :amount_in_usd: <= 100
Resolve dispute if :network_reason_code: = '13.2'
```

Attributes available: `amount_in_usd` (and other currencies), `card_brand` (visa, mc),
`card_bin`, `card_country`, `currency`, `is_fraudulent`, `network_reason_code` (Visa
only), `statement_descriptor`.

Use resolution for low-value or non-fraud categories you'd accept anyway. Don't
blanket-refund high-ticket items you'd win; and remember, a pile of resolved disputes
still points at an upstream problem (the networks increasingly expect merchants to fix
the cause, not just refund).

**Check what's already switched on.** Merchants report finding dispute resolution enabled
on their accounts without noticing, with these side effects:
- Orders with valid delivery or tracking were auto-refunded with no chance to respond.
- On a **partial** dispute ($200 of a $1,500 charge), resolution refunded the **whole
  charge**, and Stripe wouldn't reverse it.
- Changing thresholds or excluding order types took a written support request.

So: open Settings > Disputes and Radar's dispute rules, write down exactly which rules
exist, and cap them with an amount limit (for example `:amount_in_usd: <= 50`) so a
high-ticket charge is never auto-refunded in full. Deflection (sharing order details with
the bank) has no such downside and is worth leaving on.

## 7. Radar and 3D Secure

- **Radar** scores every payment. Default blocks very high risk. Custom rules (Radar for
  Fraud Teams) let you review, block or require 3DS on patterns. Rules can be written in
  plain English with the Radar assistant and back-tested on past payments.
- **Run new rules in review (or 3DS) mode first for at least a week.** Promote to block
  only if most matches (say over 80%) are clearly fraud; if under half are, tighten it.
- Pair a risk score with a second signal instead of using the score alone.

Example rules (adapt thresholds to your own data; these are starting points from
practitioners, not Stripe defaults):

```
Request 3D Secure if :risk_score: > 50
Review if :risk_score: > 65 and :card_country: != :ip_country:
Block if :card_count_for_ip_address_daily: > 3
Block if :blocked_charges_per_card_number_hourly: >= 3
Review if :amount_in_usd: > 1000 and :risk_level: = 'elevated'
Review if :ip_country: != :billing_address_country:
```

Rules merchants shared on Reddit (attribute names checked against Stripe's list in
Nov 2026; thresholds are theirs, test on your own data first):

```
Block if :total_charges_per_card_number_hourly: >= 3
Review if :email_count_for_card_daily: >= 2
Block if :total_charges_per_ip_address_hourly: > 2
Block if :blocked_charges_per_ip_address_daily: > 2
Block if :declined_charges_per_customer_hourly: > 2
Block if :risk_level: = 'highest'
Block if :payment_method_type: = 'card' and NOT :is_3d_secure_authenticated:
```

The last rule is for high-risk, low-margin stores: it closes the gap where "request 3DS"
does nothing on cards that don't support it, at a real conversion cost. Don't copy blanket
country blocks or "block under $15" rules without checking your own prices and buyers.

(Check exact attribute names in Radar's rule editor; names change and some need
Fraud Teams. Radar's `risk_level` values are `normal`, `elevated` and `highest`.)

**Strict AVS and CVC rules break wallets.** Apple Pay and Google Pay usually return no
CVC or 3DS result, so `Block if :cvc_check: != 'pass'` blocks good wallet orders. Block on
`'fail'` (and maybe `'not_provided'` for typed cards), not on "anything but pass", or
lean on Stripe's built-in rules, which handle these cases.

- **3D Secure** shifts fraud liability to the issuer when the cardholder
  authenticates. Use adaptive 3DS (only on medium/high risk) to limit checkout
  friction, or require it on high-ticket purchases (merchants suggest anything over
  $30 to $50 for risky products). 3DS doesn't help with "not received" or "not as
  described" disputes.
- "Request 3D Secure" only asks. If the card or issuer doesn't support it, the payment
  goes through with **no** liability shift. Pair it with a review or block rule on
  `NOT :is_3d_secure_authenticated:` for the purchases where fraud would hurt most.
- Use Radar block lists for card fingerprints, emails and IPs of past fraud disputers so
  they can't buy again.
- When one fraud dispute arrives, check for sibling orders from the same card, email or
  IP and refund the undelivered ones now; once they're disputed, the refund button locks
  and the fee is charged.
- **Card testing** (many small failed attempts) also counts in Visa's enumeration
  monitoring; use CAPTCHA or rate limits on public payment forms.
- Blocking whole card types (for example prepaid) cuts fraud but also conversion;
  decide from your own dispute data.

## 8. Fix the product and sales causes

- Don't over-promise in ads or on calls; "not as described" starts in the sales pitch.
- Deliver fast; delays create "not received" claims.
- Review products or offers with outsized dispute rates; it's often the offer, not the buyer.
- Track every dispute's root cause monthly: own error, confusion, friendly fraud, true
  fraud, cancellation, product issue. Fix the biggest bucket first.
