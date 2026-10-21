# -*- coding: utf-8 -*-
# Author:   Jibril Sulaiman (with Claude Code)
# Created:  2026-10-20 (generic public version 2026-10-20)
# Location: skills/hubspot-stripe-utm-qa/scripts/utm_audit.py
#           HUBSPOT_TOKEN=... python -I utm_audit.py [SINCE=2026-01-01] [--pages]
#
# What: One live, read-only health check of UTM attribution across a HubSpot +
#       Stripe chain:
#         1. Purchase records: blank / junk first and last touch, no source at
#            all, blank name, last touch agreeing with Stripe, unprocessed.
#         2. Registration records: untagged registrations and junk left in the
#            first-touch field, per day for the last 7 days.
#         3. Stripe payments, succeeded: no Stripe UTM, split by payment link /
#            no link, and how many carry an inherited source.
#         4. --pages: the live pages carry the sitewide header (with the
#            registration fallback) and the order module.
#
# Why:  A "blank UTM Source" in a sales audit had five causes in five systems.
#       This prints every one of those numbers in one run, so a regression shows
#       up the day it happens instead of in the next audit.
#
# Setup: fill in the CONFIG block. Token: a HubSpot private-app token with
#        read scopes for the objects, in the HUBSPOT_TOKEN environment variable.
#        Never printed.

import collections
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

# CONFIG ----------------------------------------------------------------------
PURCHASES = "2-REPLACE"          # purchase records (what sales exports come from)
REGS = "2-REPLACE"               # registration records
PAYMENTS = "2-REPLACE"           # Stripe payments (Data Sync or your own mirror)
REG_NAME_PROP = "class_registration_name"   # filters real registrations ...
REG_NAME_TOKEN = "*Registration*"           # ... from attendance / replay rows
P = {  # purchase-record property names
    "first": "utm_source__f", "last": "utm_{k}__l", "stripe": "utm_{k}__stripe",
    "name": "class_name", "topic": "class_topic", "stamp": "acquisition_utm_set_at",
}
R = {"first": "utm_source__f", "last": "utm_source__l"}  # registration fields
S = {"source": "stripe_utm_source", "link": "payment_link_id",
     "inherited": "inherited_utm_source", "inherited_stamp": "inherited_utm_set_at"}
FILL_DELAY_MIN = 20              # how long after creation the fill should have run
JUNK_FIRST_TOUCH = ["IMPORT"]    # exact junk values to count in registration first touch
PAGES = [                        # registration, order and upgrade pages to fetch
    "https://example.com/webinar-registration",
    "https://example.com/order-form",
]
MARKERS = {                      # strings that prove each piece is on the page
    "header": "REPLACE_WITH_HEADER_BANNER_TEXT",
    "fallback": "REGISTRATION FALLBACK",
    "module": "REPLACE_WITH_ORDER_MODULE_CLASS",
}
REG_PAGE = "webinar-registration"  # pages containing this need the fallback, not the module
META = {"fb", "facebook", "ig", "instagram", "an", "th", "wa", "meta"}
TEXT = {"sms", "text"}
# ------------------------------------------------------------------------------

TOKEN = os.environ.get("HUBSPOT_TOKEN")
if not TOKEN:
    raise SystemExit("Set HUBSPOT_TOKEN (a read-only private-app token) first.")
if "REPLACE" in PURCHASES + REGS + PAYMENTS:
    raise SystemExit("Fill in the CONFIG block (object type ids) first.")

SEARCH = "https://api.hubapi.com/crm/v3/objects/%s/search"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
SINCE = args[0] if args else "2026-01-01"
CHECK_PAGES = "--pages" in sys.argv


def eastern_midnight_utc(day):
    """US Eastern midnight as a UTC timestamp: 04:00Z in EDT, 05:00Z in EST."""
    d = dt.date.fromisoformat(day)
    # EDT runs from the second Sunday of March to the first Sunday of November.
    march = dt.date(d.year, 3, 8 + (6 - dt.date(d.year, 3, 8).weekday()) % 7)
    nov = dt.date(d.year, 11, 1 + (6 - dt.date(d.year, 11, 1).weekday()) % 7)
    return f"{day}T{'04' if march <= d < nov else '05'}:00:00Z"


def post(obj, body):
    for attempt in range(8):
        time.sleep(0.25)
        req = urllib.request.Request(SEARCH % obj, data=json.dumps(body).encode(), method="POST",
                                     headers={"Authorization": "Bearer " + TOKEN, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2 * (attempt + 1))
                continue
            raise SystemExit(f"HubSpot HTTP {e.code}: {e.read().decode()[:300]}")
    raise SystemExit("HubSpot kept rate-limiting")


def total(obj, filters):
    return post(obj, {"filterGroups": [{"filters": filters}], "limit": 1})["total"]


def pull(obj, filters, props):
    """All rows, paged. The search API stops at 10,000 per query, so callers keep windows small."""
    rows, after = [], None
    while True:
        body = {"filterGroups": [{"filters": filters}], "properties": props, "limit": 200,
                "sorts": [{"propertyName": "hs_createdate", "direction": "ASCENDING"}]}
        if after:
            body["after"] = after
        d = post(obj, body)
        rows += [r["properties"] for r in d["results"]]
        after = (d.get("paging") or {}).get("next", {}).get("after")
        if not after or len(rows) >= 9800:
            return rows


JUNK_EXACT = {"import", "integration", "crm_ui", "conversations", "internalmember", "offline",
              "unassigned", "null", "undefined", "none", "n/a"}


def junk(v):
    v = (v or "").strip().lower()
    if not v or v in JUNK_EXACT or re.fullmatch(r"\d+", v) or re.match(r"[0-9a-f]{8}-[0-9a-f]{4}-", v):
        return True
    return ("|" in v or " / " in v or "{{" in v or "/" in v or v.startswith("http")
            or bool(re.search(r"\.(com|net|org|io|co)\b", v)) or len(v) > 40)


s = lambda v: (v or "").strip()
pct = lambda a, b: f"{a:>6} ({100 * a / b:4.1f}%)" if b else f"{a:>6}"
since_utc = eastern_midnight_utc(SINCE)
print(f"UTM audit since {SINCE} (Eastern; {since_utc})\n")

# 1. Purchase records ---------------------------------------------------------
KEYS = ("source", "medium", "campaign")
props = [P["first"], P["name"], P["topic"], P["stamp"], "hs_createdate"]
props += [P["last"].format(k=k) for k in KEYS] + [P["stripe"].format(k=k) for k in KEYS]
tp = pull(PURCHASES, [{"propertyName": "hs_createdate", "operator": "GTE", "value": since_utc}], props)
n = len(tp)
first, last_src, stripe_src = P["first"], P["last"].format(k="source"), P["stripe"].format(k="source")
print(f"PURCHASES  {n}")
print(f"  first touch blank         {pct(sum(not s(p[first]) for p in tp), n)}")
print(f"  first touch junk          {pct(sum(bool(s(p[first])) and junk(p[first]) for p in tp), n)}")
print(f"  last touch blank          {pct(sum(not s(p[last_src]) for p in tp), n)}")
print(f"  no usable source at all   {pct(sum(junk(p[first]) and junk(p[last_src]) for p in tp), n)}")
print(f"  name blank                {pct(sum(not s(p[P['name']]) for p in tp), n)}"
      f"   (of those, with a topic: {sum(not s(p[P['name']]) and bool(s(p[P['topic']])) for p in tp)})")
withs = [p for p in tp if not junk(p[stripe_src])]
agree = sum(all(s(p[P["last"].format(k=k)]) == s(p[P["stripe"].format(k=k)]) for k in KEYS) for p in withs)
print(f"  last touch equals Stripe, where Stripe has a source: {agree} of {len(withs)}"
      + ("" if agree == len(withs) else "   <- the fill rule says these should match"))
cutoff = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=FILL_DELAY_MIN)).strftime("%Y-%m-%dT%H:%M")
unstamped = [p for p in tp if not s(p[P["stamp"]]) and s(p["hs_createdate"]) < cutoff]
print(f"  not processed by the fill (older than {FILL_DELAY_MIN} min): {len(unstamped)}"
      + ("   <- check the fill workflow's action logs for 'error:' status" if unstamped else ""))
src = collections.Counter(s(p[first]).lower() for p in tp if not junk(p[first]))
print(f"  first-touch sources: Meta {sum(v for k, v in src.items() if k in META)} | texts {sum(v for k, v in src.items() if k in TEXT)}"
      f" | top {src.most_common(8)}\n")

# 2. Registrations, last 7 days (split by day to stay under the 10K cap) -------
today = dt.date.today()
print("REGISTRATIONS, last 7 days (real registrations only)")
for i in range(7, 0, -1):
    day = (today - dt.timedelta(days=i)).isoformat()
    nxt = (today - dt.timedelta(days=i - 1)).isoformat()
    base = [{"propertyName": "hs_createdate", "operator": "GTE", "value": eastern_midnight_utc(day)},
            {"propertyName": "hs_createdate", "operator": "LT", "value": eastern_midnight_utc(nxt)},
            {"propertyName": REG_NAME_PROP, "operator": "CONTAINS_TOKEN", "value": REG_NAME_TOKEN}]
    allr = total(REGS, base)
    untagged = total(REGS, base + [{"propertyName": R["last"], "operator": "NOT_HAS_PROPERTY"}])
    imp = total(REGS, base + [{"propertyName": R["first"], "operator": "IN", "values": JUNK_FIRST_TOUCH}])
    print(f"  {day}  {allr:>6} registrations | untagged {pct(untagged, allr)} | junk in first touch {imp}")
print()

# 3. Stripe payments ----------------------------------------------------------
ok = [{"propertyName": "status", "operator": "EQ", "value": "succeeded"},
      {"propertyName": "hs_createdate", "operator": "GTE", "value": since_utc}]
nostripe = ok + [{"propertyName": S["source"], "operator": "NOT_HAS_PROPERTY"}]
ns = total(PAYMENTS, nostripe)
allp = total(PAYMENTS, ok)
nolink = total(PAYMENTS, nostripe + [{"propertyName": S["link"], "operator": "NOT_HAS_PROPERTY"}])
inh = total(PAYMENTS, nostripe + [{"propertyName": S["inherited"], "operator": "HAS_PROPERTY"}])
considered = total(PAYMENTS, nostripe + [{"propertyName": S["inherited_stamp"], "operator": "HAS_PROPERTY"}])
print(f"STRIPE PAYMENTS (succeeded)  {allp}")
print(f"  no Stripe UTM             {pct(ns, allp)}   (no payment link: {nolink}; link checkouts: {ns - nolink})")
print(f"  of those, processed by the inherited-source workflow: {considered} | inherited a source: {inh}"
      + ("" if considered >= ns - 5 else "   <- inherited-source workflow behind or erroring"))
print()

# 4. Pages ---------------------------------------------------------------------
if CHECK_PAGES:
    print("PAGES (fetched with a cache-buster; funnel pages can cache for hours)")
    for u in PAGES:
        try:
            req = urllib.request.Request(f"{u}?hsCacheBuster={int(time.time())}", headers={"User-Agent": "Mozilla/5.0"})
            h = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
            header = MARKERS["header"] in h
            fallback = MARKERS["fallback"] in h
            module = MARKERS["module"] in h
            needs_module = REG_PAGE not in u
            flag = "" if header and (fallback or needs_module) and (module or not needs_module) else "   <- check"
            print(f"  {u:<58} header {header!s:<5} fallback {fallback!s:<5} order module {module!s:<5}{flag}")
        except Exception as e:  # a 404 is itself a finding
            print(f"  {u:<58} FAILED {e}")
