# Writing the rebuttal and filling Stripe's form

Read this when drafting the dispute response text, building the evidence PDF, or
submitting through the Dashboard or API.

## Who reads it

An analyst at the cardholder's bank who reviews many of these a day, starts out
sympathetic to their own customer, has no idea who you are, and decides in seconds.
They won't click links, play audio, call you, or read past a page of narrative.

So the response must: name the reason code's question, answer it in the first two
sentences, and point to labelled proof for every claim.

## The cover letter (one page)

Put it as page 1 of the main PDF and paste a shorter version into the form's
explanation field. Target 150 to 300 words.

```
Re: Dispute [du_...] | [Card brand] reason [code, plain name] | [amount] | charged [date]

Summary
[Customer name] purchased [product, in plain words] from [business] on [date] for
[amount] using a [brand] card ending [last4]. [One sentence on why the claim fails,
aimed at the reason code: e.g. "The customer logged in to the course 14 times
between [date] and [date], after the date they say they received nothing."]

Timeline
- [date, time ET] Purchase completed. AVS ZIP match, CVC pass, IP [x] ([city, state]). (Exhibit A)
- [date] Customer accepted the Terms and Refund Policy at checkout. (Exhibit B, clause 4 highlighted)
- [date] Access/ticket/confirmation email sent to [email]. (Exhibit C)
- [date to date] [Use: logins / sessions attended / check-in / downloads]. (Exhibit D)
- [date] [Any message from the customer, or none received before the dispute]. (Exhibit E)

Why the claim is not valid
[Two or three sentences tied to the reason code. Fraud: the cardholder's own details
and prior history. Not received: delivery and use. Not as described: what was
promised vs delivered. Canceled: no cancellation before the charge. Credit not
processed: refund already issued / not owed under the accepted policy.]

We request that the dispute be reversed in our favor.
```

Rules:

- Facts in date order. Times in one timezone, labelled.
- Neutral and professional. No anger, no "this customer is a scammer", no pleading.
- Say what each exhibit proves, by letter. Don't overstate it.
- Customer name, product and amount must match the receipt exactly.
- If you already partially refunded, lead with that and the amount ("credit issued").
- If the customer withdrew, say so and attach their confirmation.

## Exhibits

- One PDF per Stripe evidence type (Stripe allows one file per type). Combine
  related screenshots into that one file. Don't merge everything into one giant PDF:
  separate, single-purpose files in the matching fields read better and, per merchants,
  win more often.
- Label exhibits (Exhibit A, B, C...) and refer to those labels in the cover letter.
- Put each item in its own field: tracking in the tracking field, access logs in
  `access_activity_log`, refund details in the refund fields. Items buried in notes get missed.
- Include only the data that helps. A raw Radar export full of neutral or unexplained
  signals gives the analyst reasons to doubt you.
- Each page: a one-line caption at the top saying what it shows and why it matters.
- Crop screenshots to the relevant part; add boxes, arrows or bold labels. Avoid
  relying on color highlight alone.
- Excerpt policy text; don't upload the whole terms of service.
- Excerpt message threads to the relevant messages, with dates and sender visible.
- 12 pt or larger, Letter or A4 portrait (screenshots inside can be landscape).
- Formats: PDF, JPEG, PNG. Combined size **4.5 MB**, combined pages **under 50**,
  and **19 pages for Mastercard**. Compress images if needed.
- No links, audio or video, and no "contact us for more".

## Dashboard: Counter dispute form

1. Click **Counter dispute**.
2. Page 1: pick why you believe the dispute is wrong and the product type (physical,
   digital, offline service, event, etc.). This decides which fields appear next.
3. Page 2: fill every field that appears. Pre-filled fields (billing address, email,
   IP, receipt) come from the charge; don't change CE 3.0 badged fields.
4. Supporting files: upload each PDF and **set its evidence type** correctly
   (Customer communication, Receipt, Service documentation, Shipping documentation,
   Cancellation policy, Refund policy, Customer signature, Uncategorized).
5. Use the text fields to say what each file shows.
6. Tick that the response is final and submit. **One shot; no edits afterwards.**

## API

Upload files with `POST /v1/files` and `purpose=dispute_evidence`, then update the
dispute. Stage with `submit=false`; send everything with `submit=true`. Combined text
across all text fields is capped at 150,000 characters.

Main `evidence[...]` fields:

| Type | Fields |
|---|---|
| Customer | `customer_name`, `customer_email_address`, `customer_purchase_ip`, `billing_address`, `customer_signature` (file), `customer_communication` (file) |
| Product | `product_description`, `receipt` (file), `uncategorized_text`, `uncategorized_file` (file) |
| Service | `service_date`, `service_documentation` (file) |
| Shipping | `shipping_address`, `shipping_carrier`, `shipping_date`, `shipping_tracking_number`, `shipping_documentation` (file) |
| Duplicate | `duplicate_charge_id`, `duplicate_charge_explanation`, `duplicate_charge_documentation` (file) |
| Refunds | `refund_policy` (file), `refund_policy_disclosure`, `refund_refusal_explanation` |
| Cancellation | `cancellation_policy` (file), `cancellation_policy_disclosure`, `cancellation_rebuttal` |
| Access | `access_activity_log` (text: logins, downloads, usage) |
| Visa CE 3.0 | `enhanced_evidence[visa_compelling_evidence_3][...]` (disputed transaction details and prior undisputed transactions) |
| Appeal | `evidence[appeal][card][reason_for_filing]`, `evidence[appeal][card][supporting_files][]` (up to 5) |

Useful dispute fields: `status`, `reason`, `amount`, `evidence_details.due_by`,
`evidence_details.has_evidence`, `evidence_details.submission_count`,
`payment_method_details.card.network_reason_code`,
`enhanced_eligibility.visa_compelling_evidence_3.status`.

Webhooks: `charge.dispute.created`, `charge.dispute.updated`, `charge.dispute.closed`,
`charge.dispute.funds_withdrawn`, `charge.dispute.funds_reinstated`, and
`radar.early_fraud_warning.created`.

Page-limit errors come back as HTTP 400 with `error.code`
`dispute_evidence_page_limit_exceeded`; trim and retry.

Always confirm with the user before any write call (`submit=true`, closing/accepting
via `POST /v1/disputes/{id}/close`, or refunds). The scripts in this skill are
read-only on purpose.

## Example: "never attended" fraud claim on an event ticket

> Re: Dispute du_... | Mastercard 4837 No Cardholder Authorization | $497.00 | charged Oct 11, 2026
>
> Jane Doe purchased one VIP ticket to the [Event] (Oct 25 to 27, 2026) on
> Oct 11, 2026 for $497.00 with a Mastercard ending 1234. The cardholder authorized
> and used this purchase: the billing ZIP and CVC matched, the purchase IP is in the
> cardholder's billing city, and Jane Doe checked in at the event on Oct 25 and
> joined the online sessions on Oct 26 and 27 from the same IP.
>
> Timeline ... (Exhibits A to E)
>
> The cardholder received and attended the event they purchased. We request the
> dispute be reversed.

Replace every detail with real, provable facts; if a fact can't be shown in an
exhibit, leave it out.
