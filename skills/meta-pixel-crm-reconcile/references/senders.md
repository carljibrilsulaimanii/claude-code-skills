<!--
  senders.md -- Meta event senders for meta-pixel-crm-reconcile
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-21 (generic public version 2026-10-15)
  Lives:   skills/meta-pixel-crm-reconcile/references/
  What:    Every kind of place a Meta event can come from in a HubSpot + Stripe stack,
           how to check each one, and a table to keep your own live list in.
  Why:     A pixel once received about 8x more Purchase events than paid orders, from
           four senders none of which knew about the others. Finding the last one took
           two days because no single place listed them.
-->

# Event senders

When a count doesn't reconcile, the answer is almost always that one of these is live
and nobody remembered it. Keep your own list in the table at the bottom, and date it.

## Server-side

| Sender | Where | Notes |
|---|---|---|
| CAPI custom code action, per event | A workflow on the payments or registrations object | The only senders that know the real amount and set a stable `event_id`, so Meta can deduplicate. |
| A retry workflow | Separate workflow | Must enrol only failed records (a delay, then a branch on the guard). One that enrols every record re-sends everything. |
| An inline action inside another workflow | An older workflow | Often left behind after the event moves to its own workflow. |
| The CRM's built-in ad conversion events (HubSpot **Ads > Conversion Events**) | Ads settings | Fire on form submission, have no `event_id`, and carry a static value per event, so every order can be reported at one price. |
| Platform integrations (Stripe apps, funnel builders, Zapier) | Their own settings | Easy to forget; check each connected app. |

## Browser-side

If Purchase and Lead go server-side, browser counts for them should be **zero**. Every
one that appears is a snippet or a rule that survived a cleanup.

| Source | Where it lives | Notes |
|---|---|---|
| Inline `fbq('track', ...)` | Page settings: Head HTML, footer HTML, custom modules | The usual culprit. Check pages whose names don't match the obvious pattern. |
| Other page builders on other subdomains | Their page source | A one-letter subdomain difference can mean a different platform with its own tracking. |
| Meta **Event Setup Tool** | Events Manager, not in any page's code | Codeless URL and button-text rules, invisible from the CMS. |
| Google Tag Manager | The container | Injected at runtime, so absent from page HTML. Changes stay pending until **Submit**. |

An orphaned `fbq('track', ...)` with no `fbq('init')` on the page is a no-op. Remove
it, but it's not your missing or extra events.

## How to check each one

**Page snippets:** fetch the HTML and grep. Don't load the page in a browser; that
fires a real event into the live pixel.

```bash
for u in <urls>; do
  b=$(curl -s -L --max-time 25 "$u?v=$RANDOM$RANDOM")
  echo "$(echo "$b" | grep -oE "fbq\( *'track' *, *'[A-Za-z ]+'" | sort -u | tr '\n' ',')  $u"
done
```

The cache-buster matters: CMS pages can cache for hours, so a removal can look
unapplied for most of a day.

**Event Setup Tool:** open any page with the Meta Pixel Helper extension, then the
tool's "All events" tab. Deletions need **Finish setup** to persist.

**GTM:** read the container's tag list. A tag deleted but not submitted is still live;
the workspace shows pending changes on its Overview.

**CRM ad conversion events:** check the trigger and the sent count for each row.

**CAPI workflows:** the guard property records what was sent; the enrolment history
shows what's being picked up.

## Your senders (keep current)

State recorded **YYYY-MM-DD**. Verify before relying on it.

| Sender | Where | Event | State |
|---|---|---|---|
| | | | |
