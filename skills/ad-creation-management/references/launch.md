<!--
  launch.md -- Stage 4 reference for ad-creation-management
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   skills/ad-creation-management/references/
  What:    Account facts to fill in, the eight launch decisions, uploading,
           what each Meta delivery status means, learning phase, billing and
           the troubleshooting order.
  Why:     Most launch problems on a live account were settings read from the
           wrong field, expired end dates on reactivated ad sets, and changes
           nobody told the account's managers about.
-->

# Launch and manage (Stage 4)

How approved creative becomes a running campaign, and how to keep it
running cleanly. Reading results and deciding what to make next is Stage 5
(`measure.md`). Budget, keep, cut and scale judgments on a running campaign
belong to whoever owns the budget decision.

## Your account facts (fill in once)

Keep these in the blueprint's Campaign section, or here in your own copy:

| Fact | Your value |
|---|---|
| Meta ad account ID and business ID | `act_REPLACE_WITH_ACCOUNT_ID`, `REPLACE_WITH_BUSINESS_ID` |
| Pixel / dataset ID | `REPLACE_WITH_DATASET_ID` |
| Purchase optimization event | the custom conversion or filtered event that means "this offer was bought" (not the blended Purchase event if you sell more than one product) |
| Registration optimization event | the event that means "signed up for the free step" |
| UTM template on ads | for example `utm_source={{site_source_name}}&utm_medium={{adset.name}}&utm_campaign={{campaign.name}}` |
| Who runs the account | you, a teammate, or an agency, and where to notify them |
| Access route | Meta's ads connector, the Marketing API with a token, or a person in Ads Manager |
| Billing | card, or invoice on a credit line |

Notes that apply to any account:

- **Read the optimization event from `promoted_object`, all three fields:**
  `custom_conversion_id`, `pixel_rule` and `custom_event_type`. A
  `pixel_rule` with no ID is an inline filtered event, equal to a custom
  conversion with that rule. Calling an ad set "optimizing to generic
  Purchase" from `custom_event_type` alone is a common wrong call.
- **`{{site_source_name}}` resolves to the placement network**, so Meta
  traffic arrives as `fb`, `ig`, `an` (Audience Network), `th` (Threads) and
  `wa` (WhatsApp). Group them all as Meta in reports. On some placements the
  macros do not resolve and the literal text `{{site_source_name}}` is stored
  instead; count those as Meta too.
- `utm_medium={{adset.name}}` makes medium an ad set name, not a channel.
- Keep a working UTM template intact, and never put personal data in a URL.
- Deep link pattern for any change instruction:
  `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=<account id>&business_id=<business id>&selected_campaign_ids=<campaign id>`
  (use `adsets` or `ads` in place of `campaigns` to land on that level).
- Never use a disabled or restricted ad account, and never create a new one
  to get around a restriction.

## Before launch: the plan, in eight decisions

Work through these one at a time, skipping anything the blueprint already
answers:

1. **Business goal**: registration for a free step, a purchase, or something
   else. Name the page that records success.
2. **Objective and optimization event** that match that journey, verified
   in the pixel, not assumed.
3. **Audience**: new people, warm registrants, attendees, buyers. State what
   Advantage+ may expand beyond, and keep prospecting and retargeting
   results separable.
4. **Copy**: approved primary text, headline, description and CTA per
   asset or copy group.
5. **Creative**: the approved files and which copy goes with each, as a
   mapping (asset label, angle ID, copy group, headline, destination, CTA).
6. **Budget and timing**: starting daily budget, the ceiling it counts
   against (this campaign or the account), the test total, review date, end
   date. A daily budget is an average, not a hard cap; Meta can overspend on
   strong days.
7. **Tracking and readiness**: Page and Instagram identity, permissions,
   billing state and credit headroom, destination loads on a phone and
   matches the offer, conversion event firing, UTMs set. Report each as
   Ready, Needs help, or Not verifiable here.
8. **Launch review**: the full plan in one place, all objects created
   paused, previews checked per placement.

Launch only on an explicit instruction that refers to this exact reviewed
plan. Approval of copy, creative, an upload or a connection is not launch
approval. If the plan changes materially, show it again.

After enabling, read back each object's state and keep these distinct:
enabled, scheduled, in review, rejected, actually delivering.

## Uploading creative

- Use the **ad account's media library in Ads Manager, not the Business
  media library**. Images can be uploaded in a batch; upload videos one at a
  time.
- A Google Drive share link is not a usable Meta media URL.
- Keep the original labels (`<Month>_Static_Ad #NN`,
  `<Month>_Video_Ad #NN`) and record the Meta ad ID next to each in the
  blueprint.
- Check creative enhancement settings before launch: some can crop, recolor,
  add music or alter the person shown. Turn off anything that would change
  approved work unless the user agrees.

## Adding ads to a running campaign

Inspect the campaign first (objective, audience, destination, budget level,
current ads). Create only the new ads, paused, then enable them on approval.
New creative does not authorize a budget change. Never pause a whole running
campaign to stage new ads.

## Reactivating an old ad set

Before turning one back on, read its full `promoted_object` (a sequenced ad
set has `multi_event_product` set, and may optimize to an event chain you no
longer want) and its `end_time`. An expired end date makes a reactivated ad
set show "Completed" and spend nothing, while its cost per lead can look fine
the whole time. Tell whoever runs the account first.

## Meta's ads connector (MCP)

From Meta's help article on its ads AI connectors:

- One server address for every supported agent: `https://mcp.facebook.com/ads`.
  Supported agents include ChatGPT, Claude, Claude Code and Perplexity.
- Not every ad account has it yet. Check with the connector's own
  read-only accounts call (for example `ads_get_ad_accounts`, which reports
  whether the account is enabled) before assuming either way.
- What it can do: reporting; create and edit campaigns, ad sets and ads;
  build image, video and carousel creatives and upload media to the library;
  manage custom audiences and catalogs; read signal (pixel) health; run A/B
  tests and lift studies; read the account's change history. New ads are
  created paused.
- **Guardrails live in Meta, not in the chat.** A business admin can set
  per-account rules in Meta Business Suite: Settings, then Integrations, then
  Ads MCP server. Each action can be allowed or blocked (for example creating
  campaigns or editing budgets), and budgets above a set amount can be
  blocked. Rules a partner sets on a shared account apply only to that
  partner's own staff, so the business and its agency each set their own.
  Propose a budget ceiling rule before anyone connects an agent.

## What the Delivery column means

Check campaign, ad set and ad separately; they can disagree.

| Status | What it means | What to do |
|---|---|---|
| In review / Processing | Meta is checking or applying an edit (processing can take hours) | wait; do not duplicate |
| Preparing | passed review, finding its first impressions | wait |
| Learning | the system is still working out delivery; costs run high and unstable | avoid edits |
| Learning limited | not enough results to settle | look at budget, audience, event volume; do not add money just to clear the label |
| Active | running | none |
| Scheduled | starts later | check the start date |
| Completed | its end date passed | the trap on reactivated ad sets: clear or move the end date |
| No ads / Ads off / Ad set off | something below the campaign is off | turn on the right level, after notifying whoever runs the account |
| Rejected | fails an ad policy | fix the stated reason, then request review; never re-upload unchanged |

## Learning phase facts

- An ad set usually leaves learning after about **50 optimization events in
  the 7 days after its last significant edit**. Ads Manager has a "Last
  significant edit" column to check this.
- Significant edits restart learning: budget jumps, targeting, bid or
  optimization changes, creative swaps. Keep budget steps small (many teams
  cap them at 20 to 25 percent a day) and avoid edits on top performers just
  before a big sales day.
- Many small ad sets learn less than a few combined ones. A budget set very
  low or very high also distorts what the system learns.

## Billing and account restrictions

- On card billing the failure mode is a declined card. On invoiced billing
  with a credit line, it is running out of credit line: check Billing and
  payments, then Credit lines, before blaming delivery.
- If a payment fails, Meta pauses the ads and disables the account until the
  balance is paid; after payment it resumes active and scheduled ads.
- A restricted or disabled account is handled in Meta Business Support Home:
  open the account, follow "What you can do" (confirm identity, verify,
  secure the account, request review). Only an admin can request review.
  Never create a replacement account to get around a restriction.

## Troubleshooting order

Before changing budgets, duplicating campaigns or creating accounts, check in
this order: the Delivery column at campaign, ad set and ad level; review and
rejection reasons; billing and the credit line; schedule and end dates
(expired end dates on reactivated ad sets are a common trap); the
destination on a phone; the conversion event in Events Manager. A "Learning
limited" label is not an error and not a reason to add budget. Meta and your
payment processor will never match exactly; explain the difference rather
than forcing it.
