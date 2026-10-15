<!--
  queries.md -- call shapes for meta-pixel-crm-reconcile
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-21 (generic public version 2026-10-15)
  Lives:   skills/meta-pixel-crm-reconcile/references/
  What:    Exact Meta and HubSpot query shapes for each side of the reconciliation.
  Why:     The wrong tool or filter shape returns a plausible number that is wrong;
           these are the shapes that matched reality.
-->

# Query shapes

## Timestamps

Meta's dataset stats take unix seconds; HubSpot's search API takes datetimes as epoch
**milliseconds**. Get them from the shell rather than by hand:

```bash
date -u +%s                                 # now, seconds
date -u -d '2026-09-20T04:00:00Z' +%s       # an instant, seconds (x1000 for HubSpot)
```

Meta labels buckets in the **ad account's** time zone. Convert from the timestamps you
passed in rather than trusting the labels.

## Meta side

With the Meta Ads MCP connector (`ads_get_dataset_stats`), or the Graph API equivalent
for the dataset. Hourly counts, split by source; run both, the split is the diagnosis:

```
ads_get_dataset_stats
  dataset_id:   <dataset id>
  event_name:   Purchase | Lead | <custom event>
  event_source: WEB_ONLY | SERVER_ONLY
  start_time:   <unix seconds>
  end_time:     <unix seconds>
```

- Omit `event_source` for the total.
- `aggregation` takes lowercase values: `event`, `device_type`, `event_source`, `url`,
  `host`, `event_total_counts`. `event_source` gives the browser/server split in one
  call. `url` returns hosts, not paths, and can't be combined with `event_source`.
- `aggregation: event_total_counts` lists every event name in a window: the way to
  spot legacy duplicates (`Attended` beside `ClassAttended`, `OrderFormPurchase` beside
  `Purchase`).
- The last bucket is usually still filling. Pull it twice a few minutes apart before
  treating it as final.
- `ads_pixel_event_create` creates Event Setup Tool (codeless) rules, which are a
  different and mostly unwanted thing. Don't reach for it by mistake.

## HubSpot side: counts

Use the CRM search API and read `total`, with `limit: 1`. Run a **control** first: two
different days must return different totals, or the filters are being ignored.

```bash
curl -s -X POST "https://api.hubapi.com/crm/v3/objects/<objectTypeId>/search" \
  -H "Authorization: Bearer $HUBSPOT_TOKEN" -H "Content-Type: application/json" \
  -d '{"filterGroups":[{"filters":[
        {"propertyName":"status","operator":"EQ","value":"succeeded"},
        {"propertyName":"created","operator":"GTE","value":"<epoch ms>"},
        {"propertyName":"created","operator":"LT","value":"<epoch ms>"}
      ]}],"limit":1}'
```

Keep the token in an environment variable or a secret store; never paste it into a
command you share or print it.

Filters by question:

| Question | Filters |
|---|---|
| Succeeded payments | `status EQ succeeded` + `created` bounds |
| Registrations | `registered_at` bounds + status `EQ` your registered value |
| CAPI sends (datetime guard) | `<guard> GTE / LT` bounds |
| CAPI sends (date-only guard) | `<guard> EQ "YYYY-MM-DD"`, or `<guard> HAS_PROPERTY` + `hs_lastmodifieddate` bounds as a proxy |
| Unsent records | record-time bounds + `<guard> NOT_HAS_PROPERTY` |

For unsent records, return the record time and check age. A handful minutes old is the
normal in-flight buffer; anything older than an hour is a real miss.

## HubSpot side: breakdowns

A reporting/SQL-style tool is fine for GROUP BY, where the shape is the point. Its day
boundaries may be in the portal's time zone rather than UTC, and its absolute counts
can be off; don't quote them.

```sql
SELECT status, COUNT(*) AS n, SUM(amount) AS amt
FROM <payments object>
WHERE created >= '2026-09-20' AND created < '2026-09-21'
GROUP BY status ORDER BY n DESC
```

**Records per person**, the check that reframes everything else:

```sql
SELECT COUNT(*) AS records, COUNT(DISTINCT email) AS people
FROM <registrations object>
WHERE <attended status filter> AND registered_at >= '<from>'
```

Near 1.0 means the object is clean. Six to one means the CRM itself is inflated and no
event-side fix will help.

**Product mix**, what a blended `Purchase` event actually contains:

```sql
SELECT description, COUNT(*) AS n, SUM(amount) AS revenue
FROM <payments object>
WHERE created >= '<from>' AND created < '<to>' AND status = 'succeeded'
GROUP BY description ORDER BY n DESC
```

## Events Manager CSV exports

The export is the only place that separates browser and server per event with full
history. Its file names can contain a narrow no-break space (U+202F) before "AM"/"PM",
so a typed path won't match; copy the file with a glob to a plain name first.
