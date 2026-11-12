<!--
  domains.md -- domains and hosts for hubspot-funnel-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-12
  Lives:   skills/hubspot-funnel-qa/references/
  What:    How to read which platform serves a domain from DNS, the traps that produced
           wrong answers, and when to run scripts/domaincheck.sh.
  Why:     A page can be perfect in HubSpot and unreachable, because the domain in front
           of it points somewhere else. Defects #41 and #42 in defects.md.
-->

# Domains and hosts

Keep your own map of every domain you own: the host that serves it, where its DNS is
managed, and what it should land on. Re-check it with
[`../scripts/domaincheck.sh`](../scripts/domaincheck.sh).

## Reading the host from DNS

| What you see | Host |
|---|---|
| CNAME `*.sites.hubspot.net` (often `*.group<N>.sites.hubspot.net`), or `A 199.60.103.x` | HubSpot |
| CNAME `sites.ludicrous.cloud`, or `A 162.159.140.166` | GoHighLevel |
| CNAME `*.clickfunnels.com` | ClickFunnels |
| CNAME `*.myshopify.com`, or `A 23.227.38.x` | Shopify |
| NS `*.bluehost.com`, `Server: Apache` | Bluehost |
| NS `dns-parking.com`, header `platform: hostinger` | Hostinger |
| `A 3.33.130.190` + `15.197.148.33` | GoDaddy parked page |
| `A 3.33.251.168` + `15.197.225.128`, `Server: awselb/2.0` | GoDaddy forwarding (follow it to see where it goes) |
| NS `*.domaincontrol.com` | DNS managed in GoDaddy (says nothing about the host) |

These values were correct when written; providers change them, so treat an "unknown"
as a prompt to look, not as a fault.

## Traps

**A bot block is not an outage.** Some hosts answer `curl` with 403, 405 or 406. Retry
with a browser user agent and an `Accept: text/html` header, or open it in a browser,
before calling a domain down. The script does this.

**A 200 from GoHighLevel proves nothing.** It serves the funnel's first page with a 200
for any unknown path. Check the final URL and the page title, not the status code.

**A HubSpot 404 on every path means the DNS moved and the pages did not.** The portal
is answering for the domain but has nothing published there. Check the domain in
**Settings > Content > Domains & URLs** and which pages are assigned to it.

**Nameservers decide where to make a change.** If NS points at another provider,
changes in the registrar's DNS screen are ignored. Fix the record where the nameservers
point.

**A domain can resolve and still be broken, and the protocol changes the answer.** One
domain returned an `A` record but no NS or SOA from public resolvers, showed a host's
placeholder on `http://` and timed out on `https://`. Test both protocols, and for an
apparent DNS failure ask the TLD's registry nameserver directly
(`nslookup -type=ns <domain> <registry nameserver>`).

## When to run the domain sweep

- Every QA pass on a funnel whose entry point is a vanity domain.
- After any page that domains forward into is renamed, re-slugged or unpublished.
- After anyone mentions moving a funnel between platforms. A move is two changes, DNS
  and pages, and the order matters (#41).
- When the registrar's domain list changes: a new domain, a renewal, a **Set up**
  button appearing on a domain that used to work.
