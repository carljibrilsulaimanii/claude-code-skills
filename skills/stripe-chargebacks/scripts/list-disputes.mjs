#!/usr/bin/env node
/**
 * list-disputes.mjs -- list Stripe disputes with deadlines, reason codes and CE 3.0 eligibility
 * ---------------------------------------------------------------------------
 * Author:  Jibril Sulaiman (built with Claude)
 * Created: 2026-11-17 (ET)
 * Deploy:  Ships inside the stripe-chargebacks skill (scripts/). Run locally:
 *            $env:STRIPE_LIVE_KEY = "rk_live_..."   # a restricted key; load it from your secrets store
 *            node list-disputes.mjs                 open disputes and inquiries only
 *            node list-disputes.mjs --all           every dispute in the window
 *            node list-disputes.mjs --days 365      look back further (default 180)
 *            node list-disputes.mjs --json          machine-readable output
 *          Read-only: only GET requests. Makes no changes to Stripe.
 * What:    Prints each dispute's id, amount, Stripe reason, network reason code,
 *          status, response deadline in US Eastern with days left, Visa CE 3.0
 *          eligibility, and the buyer's email/name from the charge, sorted so the
 *          nearest deadline comes first. Ends with a count of open items.
 * Why:     A missed deadline is an automatic loss, and inquiries (Amex/Discover)
 *          that go unanswered escalate to chargebacks that are close to unwinnable.
 *          The Dashboard shows these one at a time; this is the triage list.
 * Key:     Restricted key needs Disputes: read and Charges: read. If Stripe answers
 *          "permission" errors, the key lacks Disputes read; add it in the Dashboard
 *          (Developers > API keys > the restricted key) rather than using another key.
 * Notes:   Sends Stripe-Version 2024-06-20 because the account's default API version
 *          on older accounts predates enhanced_eligibility and network_reason_code.
 */

const KEY = process.env.STRIPE_LIVE_KEY;
if (!KEY) { console.error('Set STRIPE_LIVE_KEY first (see header).'); process.exit(1); }

const argv = process.argv.slice(2);
const ALL = argv.includes('--all');
const JSON_OUT = argv.includes('--json');
const daysIdx = argv.indexOf('--days');
const DAYS = daysIdx >= 0 ? parseInt(argv[daysIdx + 1], 10) || 180 : 180;

const OPEN = new Set(['needs_response', 'warning_needs_response', 'appeal_needs_response']);

async function stripe(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${KEY}`, 'Stripe-Version': '2024-06-20' },
  });
  const body = await res.json();
  if (body.error) throw new Error(`${path}: ${body.error.message}`);
  return body;
}

const et = (unix) => unix
  ? new Date(unix * 1000).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET'
  : '';

async function main() {
  const since = Math.floor(Date.now() / 1000) - DAYS * 86400;
  const rows = [];
  let starting_after = null;
  for (;;) {
    const q = new URLSearchParams({ limit: '100', 'created[gte]': String(since) });
    q.append('expand[]', 'data.charge');
    if (starting_after) q.set('starting_after', starting_after);
    const page = await stripe(`disputes?${q}`);
    for (const d of page.data) {
      if (!ALL && !OPEN.has(d.status)) continue;
      const ch = typeof d.charge === 'object' ? d.charge : {};
      const due = d.evidence_details?.due_by || null;
      rows.push({
        id: d.id,
        status: d.status,
        amount: (d.amount / 100).toFixed(2) + ' ' + d.currency.toUpperCase(),
        reason: d.reason,
        network_code: d.payment_method_details?.card?.network_reason_code || '',
        brand: d.payment_method_details?.card?.brand || ch.payment_method_details?.card?.brand || '',
        ce3: d.enhanced_eligibility?.visa_compelling_evidence_3?.status || '',
        due_by: et(due),
        days_left: due ? Math.floor((due * 1000 - Date.now()) / 86400000) : null,
        has_evidence: !!d.evidence_details?.has_evidence,
        submissions: d.evidence_details?.submission_count ?? 0,
        charge: ch.id || d.charge,
        payment_intent: d.payment_intent || ch.payment_intent || '',
        charge_date: et(ch.created),
        email: ch.billing_details?.email || ch.receipt_email || '',
        name: ch.billing_details?.name || '',
        description: ch.description || '',
        created: et(d.created),
      });
    }
    if (!page.has_more) break;
    starting_after = page.data[page.data.length - 1].id;
  }

  rows.sort((a, b) => (a.days_left ?? 9e9) - (b.days_left ?? 9e9));

  if (JSON_OUT) { console.log(JSON.stringify(rows, null, 2)); return; }
  if (!rows.length) { console.log(`No ${ALL ? '' : 'open '}disputes in the last ${DAYS} days.`); return; }

  for (const r of rows) {
    console.log(`${r.id}  ${r.status}  ${r.amount}  ${r.reason}${r.network_code ? ` (${r.brand} ${r.network_code})` : ''}`);
    if (r.due_by && OPEN.has(r.status)) console.log(`   due ${r.due_by}  -> ${r.days_left} day(s) left${r.has_evidence ? '  [evidence staged]' : ''}${r.submissions ? `  [submitted x${r.submissions}]` : ''}`);
    if (r.ce3) console.log(`   Visa CE 3.0: ${r.ce3}`);
    console.log(`   buyer: ${r.name || '?'} <${r.email || '?'}>  charged ${r.charge_date}  ${r.charge}  ${r.payment_intent}`);
    if (r.description) console.log(`   ${r.description}`);
  }
  const open = rows.filter((r) => OPEN.has(r.status));
  const urgent = open.filter((r) => r.days_left !== null && r.days_left <= 3);
  console.log(`\n${open.length} open (needs response), ${urgent.length} due within 3 days, ${rows.length} listed.`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
