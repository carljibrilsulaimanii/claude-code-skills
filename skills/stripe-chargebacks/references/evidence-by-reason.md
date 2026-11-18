# Evidence by reason code and product type

Read this when assembling evidence for a specific dispute. Find the Stripe reason
first, then the product type section.

## Contents

1. Reason code map (Stripe category ↔ Visa / Mastercard / Amex)
2. Evidence every response should carry
3. Evidence by Stripe reason
4. Evidence by product type (digital, courses, coaching, events, deposits and payment plans, memberships, physical goods)
5. Visa CE 3.0 and 3D Secure
6. What doesn't count

## 1. Reason code map

Stripe maps hundreds of network codes into a handful of `reason` values. The network
code is what the issuer actually reads, so check it in the packet.

| Stripe `reason` | Visa | Mastercard | Amex | The claim in plain words |
|---|---|---|---|---|
| `fraudulent` | 10.4 card-absent fraud (10.3 card-present) | 4837 no cardholder authorization (4863 cardholder doesn't recognize) | F29 card not present, F24 multiple charges, F10/F30/F31 card-present | "I didn't make this purchase" |
| `product_not_received` | 13.1 | 4855 | C08 | "I paid and never got it" (includes digital access and event entry) |
| `product_unacceptable` | 13.3 not as described/defective, 13.4 counterfeit, 13.5 misrepresentation | 4853 | C31 not as described, C32 damaged/defective | "It wasn't what you promised" |
| `subscription_canceled` | 13.2 canceled recurring | 4841 canceled recurring or digital goods (also free-trial conversions) | C28 | "I canceled and you kept charging" |
| `credit_not_processed` | 13.6 credit not processed, 13.7 canceled merchandise/services | 4860 | C02, C04 returned, C05 canceled, C18 | "You owed me a refund" |
| `duplicate` | 12.6.1 duplicate, 12.6.2 paid by other means | 4834 | P08 duplicate, C14 paid by other means | "I was charged twice" |
| `general` / `incorrect_account_details` / others | 12.2, 12.5 incorrect amount | 4831 amount differs, 4846 currency | P05 incorrect amount, P23 currency, A01/A02/A08 authorization | Amount, currency or processing errors |
| `unrecognized` | (often filed as fraud) | 4863 | | "I don't know what this is" |

Over half of all disputes are filed as fraud. Many of those are **friendly fraud**: the
real buyer, who forgot, didn't recognize the descriptor, regrets it, or wants money back.

## 2. Evidence every response should carry

Stripe pre-fills much of this when the integration collects it; check the packet.

- Customer name, email, billing address, and purchase IP (with location)
- Receipt or confirmation email showing date, amount, product and the statement descriptor
- Product or service description **as it was shown at checkout** (screenshot of the page, not today's version if it changed)
- Proof they agreed to the terms: screenshot of the checkout with the required checkbox, plus only the relevant policy clause, highlighted
- Customer communication that matters, excerpted (not the whole thread)
- Any proof the dispute was withdrawn, or that you already compensated them

## 3. Evidence by Stripe reason

### Fraudulent (Visa 10.4, Mastercard 4837, Amex F29)

Goal: prove the **real cardholder** made or benefited from the purchase.

Strongest to weakest:
1. **Visa CE 3.0 eligibility** (see section 5) or **3D Secure authentication** (liability shift)
2. Prior **undisputed** purchases by the same person, same card, same email, IP or device
3. AVS match (street and ZIP) and CVC pass, IP location consistent with the billing address
4. Usage tied to the buyer's identity after purchase: logins from the purchase IP or
   device, course progress, event check-in with their name, emails or texts from
   their address or phone, social posts about the product
5. Signed agreement or application completed with their details

Hard truth from the videos: if the card really was stolen and nothing ties the buyer
to the cardholder, you won't win; accept and tighten Radar. Fraud disputes where the
buyer **used** what they bought are winnable because that use is the proof.

What merchants report actually moves fraud claims:
- **Continuity**: the same IP (or device) at checkout, at delivery (email opened, account
  created) and during use. Show it as a short table, not a raw log dump.
- Receipt or access email opened from the purchase IP (if your email tool logs opens with IP)
- For high-ticket digital programs: identity verification after purchase, before access

What doesn't: your refund policy, "no refunds" terms, or order confirmation emails on
their own. The bank only asks whether the cardholder authorized it. Leave policy out of
fraud responses unless it's needed to explain something else.

3D Secure is strong but not automatic. One merchant reported losing 9 of 10 fraud
disputes on fully authenticated (ECI 05) payments; Stripe support said the network's
screening failed to apply the liability shift. If an authenticated payment is disputed as
fraud, still respond with the 3DS data plus usage evidence, and raise it with Stripe.

### Product not received (Visa 13.1, Mastercard 4855, Amex C08)

- Physical: carrier tracking with **full delivery address** and delivery date (signature for higher value). Shipping address matching the billing address helps.
- Digital or online access: access email sent (timestamp), first login, every login after, IP of logins, downloads, lessons opened, community posts
- Live events and classes: registration confirmation, the joining link sent, check-in or attendance record, session join logs, replay views
- Services: delivery records per session (date, time, attendee), call recordings referenced in text, deliverables sent, the client's acknowledgments
- **Knockout item:** any use after the date the customer says they never received it

### Product unacceptable / not as described (Visa 13.3 to 13.5, Mastercard 4853, Amex C31/C32)

- Screenshot of what was promised at the time of purchase (sales page, checkout, agreement)
- Proof the thing delivered matches that description, point by point
- The customer never contacted you to complain or asked for a return, or you offered a fix they declined
- The refund or return policy they agreed to, and that they didn't follow it
- Usage that shows they got value (completion, attendance, repeat logins)
- Visa 13.3 and Mastercard 4853 generally expect the cardholder to have tried to
  resolve it with you first; note it if they never did

### Subscription canceled (Visa 13.2, Mastercard 4841, Amex C28)

- Sign-up screen showing recurring terms and the agreement checkbox
- Cancellation policy, and how to cancel, as shown before purchase
- Proof they **didn't** cancel before the charge (no request in the support log), or that they canceled after the billing date
- Renewal reminder emails sent before the charge
- Use of the service after the date they say they canceled
- If they did cancel and you charged anyway: accept

### Credit not processed (Visa 13.6/13.7, Mastercard 4860, Amex C02/C04/C05)

- If you already refunded: the refund record (date, amount, Dashboard screenshot). This is a "credit issued" response and issuers fix it readily, including partial refunds where they disputed the full amount.
- If no refund was due: the refund/cancellation policy they agreed to, and why they didn't qualify (past the window, attended, used the product)
- Any messages where they were told the outcome

### Duplicate (Visa 12.6, Mastercard 4834, Amex P08/C14)

- Both charges with what each one was for. Two different products, two seats, a
  ticket for a partner, a deposit plus a balance, or a plan installment are not
  duplicates. Show both receipts and line items.
- If one was a genuine double charge: refund was issued (show it) or accept.

### General, incorrect amount, currency

- Itemized receipt with base price, discounts, taxes, fees and currency as shown at checkout
- Exchange-rate notes if relevant

## 4. Evidence by product type

### Digital products and online courses

- Access delivered: welcome email timestamp, platform account creation
- Usage log: logins with date, time and IP; lessons or modules opened; percent complete; downloads
- Community activity: posts, comments, event RSVPs
- Terms accepted at checkout, including the digital-goods refund clause
- Prove only what logs actually show. Don't claim "completed the course" unless you have it.
- Put access and delivery proof in the field that matches it (`access_activity_log` text,
  service or shipping documentation file), not only in a catch-all upload; merchants report
  evidence in the wrong field getting ignored.
- Times in one timezone, labelled. Include only the Radar signals that help (AVS/CVC
  pass, matching IP); leave out unexplained risk flags.
- A screenshot of the sales page **as it looked on the order date** (keep dated copies
  when pages change), or your evidence can contradict what the buyer saw.

### Coaching, consulting, done-with-you services

- Signed agreement or accepted terms with the scope of what's included
- Onboarding or payment-plan confirmation message the client replied to
- Session log: each scheduled and attended session, with dates
- Deliverables sent (dated)
- Messages showing satisfaction or progress (excerpt them)
- Kept a check-in record early in the engagement (a "how's it going so far?" message
  and their answer); the videos flag this as one of the most useful exhibits weeks later

### Event tickets, summits, live classes

- Order confirmation and ticket email (tier, date, venue or online link)
- Event date versus dispute date (the dispute window often runs from the event date)
- Check-in, badge pickup, session join logs, or attendance list with their name and email
- Replay access delivered and replay views
- Transfer or no-refund policy accepted at checkout, as shown (helps on "credit not
  processed" and "not as described"; useless on fraud claims, where only proof the
  cardholder bought or attended counts)
- If the buyer bought for someone else, the second attendee's check-in counts
- Best capture for next time: timed check-in scans tied to the order, a login to buy, and
  a pre-event confirmation text or email the buyer replies to

### Deposits, payment plans and high-ticket programs

- The application or enrollment agreement with total price, deposit terms and refund terms
- Confirmation that the deposit holds a seat or starts onboarding, and what they received for it
- Each later installment's receipt and any reminders sent
- Onboarding steps completed (call booked, portal access, first session)
- Multiple disputes on related installments: answer each one separately, with the same core packet
- Any partial refund or settlement on the program: refund dates, amounts and ARNs, plus
  the written agreement, because the buyer can still dispute the full original amount

### Memberships

Same as subscriptions, plus a log of member activity (logins, content viewed, posts).

### Physical goods

Full delivery address on tracking, delivery photo or signature, the order page
showing shipping time, and any communication about delays.

## 5. Visa CE 3.0 and 3D Secure

**Visa Compelling Evidence 3.0** applies to Visa 10.4 (card-absent fraud):

- You need **two prior undisputed transactions** with the same payment credential
  that are **120 to 365 days older** than the disputed one, with no fraud reported on them.
- At least **two** of the core data elements must match between the prior
  transactions and the disputed one, and one of the two must be the IP address or the
  device ID/fingerprint. The core elements are: customer account or login ID (Stripe
  uses the customer email), shipping address, device ID or fingerprint, IP address.
  Vendors summarize this differently; Visa's own wording is the "two, one of which is
  IP or device" version.
- Stripe searches for qualifying history automatically, flags eligibility in the
  dispute email and Dashboard, and pre-fills fields badged "Required for Visa CE 3.0".
  **Don't edit pre-filled CE 3.0 fields**, and don't leave any required one blank, or
  eligibility is lost. You'll usually need to add product descriptions.
- A late fraud report on one of the prior transactions disqualifies it.
- Eligibility doesn't guarantee a win, but it's the single biggest lever on fraud claims.
- With Stripe's dispute prevention, CE 3.0-eligible Visa disputes can be blocked before
  they're filed ($15 per block in the US), and excluded from VAMP counts.

Practical upshot: guest checkouts with no saved Customer and no IP or device capture
can never qualify. Capture IP, device and a consistent customer record at checkout.

**3D Secure**: if the payment was authenticated, fraud liability usually shifts to the
issuer and Stripe adds the authentication data (ECI) automatically. Respond anyway;
add usage evidence on top.

## 6. What doesn't count

- Links (to terms, tracking pages, drives, videos). Issuers don't click.
- Audio or video files.
- "Call us for more information."
- Your whole terms of service. Excerpt the clause.
- Generic proof you're a legitimate business.
- Emails and texts as **identity** proof on fraud claims (they show conversation, not
  who owns the card). Useful for other reasons, weak for fraud.
- Illegible screenshots or color-highlighting only (use bold, boxes or arrows).
