<!--
  stripe.md -- Stripe checks for hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-14 (generic public version 2026-10-15)
  Lives:   skills/hubspot-funnel-qa/references/
  What:    The six Stripe integration checks every page that takes payment gets.
  Why:     One audit found three separate Stripe faults (a cloned placeholder link, a
           form choice that routed nowhere, and links that never returned buyers to the
           funnel) that a "is there a payment link" check passes.
-->

# Stripe integration checks

Run all six on every page that carries an order module or a Stripe Payment Link. Each
has caught a real fault the others missed.

## How a typical setup works

A custom **order form module** shows a HubSpot form first, then sends the buyer to
**one** Stripe Payment Link: the module's live link field, or its test link when test
mode is on. The page usually exposes it as a data attribute (for example
`data-stripe-url` and `data-test-mode` on the module's wrapper). After payment, Stripe
does whatever the link's **After payment** setting says. That's set on the link in
Stripe, not on the page.

Payment links appear under two hosts: a branded custom domain
(`https://pay.example.com/b/<id>`) and Stripe's own (`https://buy.stripe.com/<id>`).
Scan for both.

## The six checks

**1. Which link does the module actually use?** Read the module's link and test flag
from the fetched HTML ([`../scripts/crawl.js`](../scripts/crawl.js) reports both when
you set `MODULE_LINK_ATTR`). "A payment link is somewhere on the page" is not the
check. Cloned pages keep the source page's link: one set of deposit pages all shipped
with another event's ticket link. Test mode must be off on anything published.

**2. Does a choice on the form change anything?** The module sends **everyone** to its
one link. A radio or dropdown on the form ("Deposit" vs "Paid in full") does nothing
unless a router script maps each choice to a link. If the page offers a choice, find the
code that routes it. No router means everyone pays the module's single link whatever
they picked: a **Blocker**. The fix is one module per option, or a router.

**3. What does each link charge?** Resolve each link to product and price, read-only,
with a restricted Stripe key that can only read:
- `GET /v1/payment_links/<plink_id>` and `GET /v1/payment_links/<plink_id>/line_items`
  give the product and price.
- In the dashboard: **Payment Links**, open the link.

Check the product name matches the page's offer and the price matches the copy. Watch
for near-duplicate products at the same price (a funnel version and a sales-team
version); only one belongs on the page.

**4. Where does the buyer land after paying?** The check most likely to fail, and
nothing on the page shows it. On the payment link, `after_completion.type` must be
`redirect`, with `after_completion.redirect.url` set to **this funnel's** confirmation
page on the funnel's own domain. `hosted_confirmation` means Stripe shows its own
thank-you and the buyer never reaches your confirmation page, so the booking button, the
next-steps copy and UTM capture on it all silently never happen. Report it as a
**Blocker** with the link id and the URL it should point to. Changing it writes to live
Stripe: get an explicit yes per link first.

**5. Does the page price match what Stripe shows?** Load the link **in a browser**
(fetching it returns an empty shell). Compare product, price and any optional add-on
with the page copy. Order bumps are optional add-ons, not separate prices.

**6. Is the confirmation page ready for the buyer?** On the redirect target, check any
next step (a booking link, an agreement notice) points at the right system. If Purchase
is sent server-side from the payment, don't look for a Purchase snippet on the page;
its absence is correct.

## Never

- Never complete a purchase or submit a live order form to test. Use the module's test
  mode with a test link, or ask for a 100%-off code.
- Never change a payment link (redirect, price, products) without a yes for that link.
- Never put a Stripe key in a page, a script you share, or the report.

## Report format

For each page: the full page URL, the full payment link URL, the product and price it
charges, test or live, and where it lands after payment. Put Stripe faults under the
page they break, not in a separate section.
