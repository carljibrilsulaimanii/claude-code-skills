# Responding to a dispute, step by step

Read this when there is an open dispute or inquiry and the user needs to decide what
to do and in what order.

## Contents

1. The lifecycle in one picture
2. Triage: the first ten minutes
3. Fight, accept or refund
4. Talking to the customer
5. Submitting
6. After the decision: wins, losses, appeals
7. Smart Disputes and outside services

## 1. The lifecycle in one picture

| Stage | What it is | Stripe status | What you do |
|---|---|---|---|
| Early fraud warning (EFW) | Issuer reported the payment as fraud to Visa (TC40), Mastercard (SAFE) or JCB. No money moved. | (separate EFW object, `radar.early_fraud_warning.created`) | Optionally refund; see `prevention.md` |
| Inquiry | Pre-dispute "please explain this charge". Mostly Amex and Discover; Visa and Mastercard no longer use it. No fee yet. | `warning_needs_response` → `warning_under_review` → `warning_closed` (after 120 days with no escalation) | Answer with evidence, or fully refund. Never ignore. |
| Chargeback | Money and the $15 fee are pulled from the balance. Can't refund outside the dispute now. | `needs_response` | Counter with evidence or accept, before `evidence_details.due_by` |
| Under review | Issuer weighing your file, usually 60 to 75 days | `under_review` | Wait. Stay reachable. |
| Decision | Issuer rules | `won` / `lost` | If won, money (and the $15 counter fee) comes back. If lost, it's final unless appeals apply. |
| Appeal (optional) | Pre-arbitration and arbitration | `appeal_needs_response` → `appeal_under_review` | Only for eligible accounts with appeals enabled; see section 6 |

Cardholders usually have 120 days from the payment to dispute, longer in some cases.
For anything paid in advance (event tickets, bookings, programs that start later), the
clock generally starts from the **event or service date**, not the payment date.

Response windows are usually 7 to 21 days depending on network; Stripe sometimes shows
longer. **The `due_by` in the Dashboard or API is the only deadline that counts.**

## 2. Triage: the first ten minutes

1. List everything open: `node scripts/list-disputes.mjs`. Sort is nearest deadline
   first. Anything due within 3 days is today's work.
2. For each item, note: reason, network code (for example Visa 10.4, Mastercard 4837,
   Amex C31), amount, what was sold, deadline.
3. Pull the facts: `node scripts/dispute-packet.mjs du_...`. Check AVS, CVC, 3DS,
   IP, receipt, prior purchases, and what Stripe already pre-filled.
4. Read the issuer's claim documents in the Dashboard ("Review the claim details").
   The cardholder's own words often tell you exactly what to disprove.
5. Check the CRM and support inbox for this buyer: messages, refund requests,
   cancellations, logins, attendance. A promised-but-unprocessed refund changes
   everything (see "credit not processed" in `evidence-by-reason.md`).
6. Look for **multiple disputes from the same buyer** or the same card. Two fraud
   disputes on back-to-back high-ticket payments usually means either real stolen-card
   use or a buyer trying to claw back a program; the evidence plan differs.

## 3. Fight, accept or refund

Work through these in order. The first one that fits decides it.

| Situation | Decision |
|---|---|
| It's an inquiry and the customer is right or the amount is small | Full refund resolves it with no dispute fee and no count against the ratio |
| It's an inquiry and you're right | Answer with evidence now; an unanswered inquiry turns into a chargeback you can't win |
| You made the mistake (double charge, refund promised and not sent, wrong amount) | Accept |
| Product or service not delivered, or delivered late against what was promised | Accept |
| Customer never logged in, never attended, never used it, and asks nicely | Accept (or, before it becomes a dispute, refund). Fighting a no-use case rarely wins. |
| Real stolen card, no 3DS, no prior history with this buyer | Accept unless Stripe shows liability shift (3DS) or CE 3.0 eligibility |
| Fraud claim but Stripe flags **Visa CE 3.0 eligible** | Fight. Stripe pre-fills most of it; eligibility sharply raises the odds. Don't edit the pre-filled CE 3.0 fields. |
| Fraud claim and the payment was **3DS authenticated** | Fight; liability usually shifted to the issuer. Stripe auto-adds the 3DS data. |
| Delivered, used, documented, and the claim is "not received", "not as described" or "canceled" | Fight |
| You already refunded part (or all) of it and they disputed the full amount | Fight with a "credit issued" response: each refund's date, amount and ARN, plus a Dashboard screenshot. Merchants report losing these anyway (one lost $6,000 after refunding $7,000 of $8,000), so don't skip it and don't assume the issuer will notice. |
| Fraud claim, but your terms or "no refunds" policy is your main evidence | Policy doesn't answer "I didn't authorize this". Fight only if you can tie the buyer to the cardholder (AVS/CVC, IP, prior orders, use); otherwise accept |
| Amount below about $30 to $50 and evidence would take more than half an hour | Accept. You pay $15 received + $15 to counter and lose your time; even a win only returns the amount and the counter fee. |
| Account is close to a monitoring threshold | Still fight good cases (money), but put the energy into prevention; won disputes count the same as lost ones |

Rules of thumb from the videos and Stripe's data:

- Stripe's own win-likelihood dots: 5 dots about 60%, 4 about 40%, 3 about 25%, 2
  about 15%, 1 about 5%. "Always win" is a myth.
- Fighting is worth it when `amount x likely win rate` comfortably beats $15 plus
  the time to build the file.
- Accepting isn't an admission of wrongdoing and doesn't add further penalties.
- A Workflow can auto-accept disputes under a set amount (Stripe ships an "Accept
  disputes under 15 USD" template); set the threshold to your own break-even.

## 4. Talking to the customer

Contact them early, while there's still time to submit before the deadline. Draft
the message for the user to send; never send it yourself without their OK.

Goal of the message: find out what happened, fix it if it's fixable, and if they
agree, have them call their bank to **withdraw** the dispute.

Shape:

1. Friendly opener with their name and what they bought, in plain words.
2. "We saw a dispute on this charge with your bank" (some people genuinely forgot or
   didn't recognize the descriptor).
3. Ask what went wrong, and offer the specific fix (access link, replay, transfer to
   another date, help using it).
4. If they're satisfied: ask them to contact their bank and withdraw the dispute, and
   to forward the bank's confirmation.
5. One line on how to reach a person.

Don't: threaten, mention blacklists, quote the law, or argue the case in the message.
Anything they write back becomes evidence, so keep it clean.

Important mechanics:

- You **can't refund a charge while it's disputed.** If you agree to refund, you
  either accept the dispute (simplest) or wait until it resolves. Don't refund the
  card through another route while the dispute is open, or they can end up paid twice.
- A withdrawal doesn't speed anything up and still counts against the dispute rate.
- **Still submit evidence even if they say they withdrew.** Many issuers treat no
  response as accepting liability. Include their withdrawal message or bank
  confirmation as customer communication.
- If you agree they should keep the money, accept the dispute rather than asking
  them to withdraw and then refunding.
- A customer's screenshot of "dispute withdrawn" isn't the end. Stripe only closes it
  when the issuer sends the withdrawal. Submit evidence with that screenshot (and the
  original email file if you have it) before the deadline.
- **Partial refunds don't close the door.** A buyer can still dispute the full original
  amount months later, and several merchants report banks paying out twice. Before the
  dispute stage, prefer a full refund, or get a written settlement that names the amount
  and says it resolves the charge, and keep the refund ARNs.

## 5. Submitting

- You get **one submission**. Stripe forwards it to the issuer immediately and you
  can't add to it. Build everything first. In the API, stage with `submit=false`,
  then send with `submit=true`.
- Leave a buffer: submit at least 2 to 3 days before `due_by`. Late is a loss.
- Combine files of the same evidence type into one PDF; limits are PDF, JPEG or PNG,
  4.5 MB combined, under 50 pages combined, and 19 pages for Mastercard. The API
  returns `dispute_evidence_page_limit_exceeded` if you're over.
- Writing and form-filling details: `rebuttal-writing.md`.

## 6. After the decision: wins, losses, appeals

- **Won**: the disputed amount and the $15 counter fee return. The $15 received fee
  never does.
- **Lost**: final for most accounts. The bank's reasoning is sometimes viewable
  under "View issuing bank response". Read it; it tells you what to capture next time.
- **Late wins** happen occasionally (issuer reverses after the fact); Stripe credits
  them automatically.
- **Late withdrawals**: a customer can still withdraw after a loss; money may come
  back weeks or months later.
- **Appeals (pre-arbitration and arbitration)**: available only to eligible
  businesses that enable "Appeal responses" in Settings > Payments > Disputes.
  - Visa non-fraud and Mastercard: the issuer rejects your response with reasons; you
    get **20 days** to send a final targeted rebuttal.
  - Visa fraud: if the issuer rejects, you have **7 days** to take it to arbitration.
  - Costs: Stripe's $15 appeal fee (not refunded even if you win), plus network
    filing and ruling fees that **can exceed $600**, and technical-violation fees that
    can exceed $250, charged to whoever loses or breaks a rule.
  - Only appeal with genuinely **new** information on a large amount. Second rounds
    are usually lost.
- **The same buyer can dispute the same charge again** (a new reason code, a different
  line item, or new information at the issuer). Answer each one; if it keeps happening on
  a large charge, escalate with Stripe support and consider a lawyer's letter.
- **A lost dispute doesn't erase what the customer agreed to pay.** Merchants report
  recovering money after losses with a short formal demand letter (purchase, delivery,
  refund ARNs if any, amount owed, deadline), an attorney letter, or small claims court
  using the same evidence. Card network rules don't allow double recovery (refund plus
  chargeback), which strengthens those cases. This is a legal and business decision for
  the owner: get counsel for anything sizeable, keep it factual, never threaten or harass,
  and don't hand debts to collectors without checking the rules that apply to them.

## 7. Smart Disputes and outside services

**Stripe Smart Disputes** assembles and auto-submits evidence for eligible disputes
just before the deadline unless you respond yourself. Fee: **30% of the disputed
amount, only on wins**; the $15 received fee still applies. It uses only data Stripe
has (transaction, Radar, receipts), not your logins, attendance or messages.

- Good fit: you currently let disputes lapse, or volume is high and amounts are small.
- Poor fit: your best proof lives outside Stripe (course logins, attendance, signed
  agreements, texts), or amounts are large (30% of $2,000 is $600).
- Smart Disputes doesn't charge the $15 counter fee (that applies to manual responses).
  So on a $500 dispute: manual win costs $15 net, manual loss $30; Smart Disputes win
  costs $165 ($15 + $150), Smart Disputes loss $15. It only pays off on disputes you'd
  otherwise lose or not bother fighting.
- Rough break-even: once you'd win about a third of the time or more by hand, manual is
  cheaper.
- Merchants report Smart Disputes auto-submitting on disputes they'd stopped fighting and
  sometimes winning, and also report generic, non-reason-specific packets. Fine for the
  long tail of small disputes; do high-value ones by hand.
- Auto-submit can be turned off in Dashboard settings. If it's on, check that it
  won't fire before you've submitted your own better file.

**Chargeback services** (representment firms, alert networks): consider at roughly 50+
disputes a month or when near a monitoring threshold. Many of the videos were made by
these vendors; discount their win-rate claims.
