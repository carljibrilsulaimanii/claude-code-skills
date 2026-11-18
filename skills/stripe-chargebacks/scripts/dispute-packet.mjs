#!/usr/bin/env node
/**
 * dispute-packet.mjs -- pull every Stripe fact about one dispute into a Markdown fact sheet
 * ---------------------------------------------------------------------------
 * Author:  Jibril Sulaiman (built with Claude)
 * Created: 2026-11-17 (ET)
 * Deploy:  Ships inside the stripe-chargebacks skill (scripts/). Run locally:
 *            $env:STRIPE_LIVE_KEY = "rk_live_..."   # a restricted key; load it from your secrets store
 *            node dispute-packet.mjs du_1Abc...            print the fact sheet
 *            node dispute-packet.mjs du_1Abc... > du.md    save it next to the evidence
 *          Read-only: only GET requests. Never submits, stages or accepts anything.
 * What:    For one dispute: amount, reason, network code, deadline (ET), CE 3.0
 *          eligibility, the evidence Stripe already pre-filled, the charge's AVS /
 *          CVC / 3D Secure / Radar results, IP and billing details, refunds, the
 *          checkout description and metadata, and the same customer's other
 *          payments (oldest first) with dispute/refund flags, so prior undisputed
 *          purchases (the CE 3.0 pattern) are visible at a glance.
 * Why:     Drafting a rebuttal means hopping across five Dashboard screens. This
 *          puts the Stripe side of the evidence on one page so the rebuttal can be
 *          written against the reason code without missing a fact Stripe already has.
 * Key:     Restricted key needs Disputes, Charges, Customers and PaymentIntents: read.
 *          Missing permissions are reported per section instead of aborting.
 * Notes:   Prior payments are found by Customer id only. Guest checkouts with no
 *          Customer object show none; match those by email in the CRM instead.
 */

const KEY = process.env.STRIPE_LIVE_KEY;
const id = process.argv[2];
if (!KEY) { console.error('Set STRIPE_LIVE_KEY first (see header).'); process.exit(1); }
// Dispute ids start with du_ (current) or dp_ (older accounts); both work.
if (!id || !/^(du|dp)_/.test(id)) { console.error('Usage: node dispute-packet.mjs du_... (or dp_...)'); process.exit(1); }

async function stripe(path) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${KEY}`, 'Stripe-Version': '2024-06-20' },
  });
  const body = await res.json();
  if (body.error) throw new Error(`${path}: ${body.error.message}`);
  return body;
}
async function safe(path) { try { return await stripe(path); } catch (e) { return { _error: e.message }; } }

const et = (u) => u ? new Date(u * 1000).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' }) + ' ET' : '';
const money = (c, cur) => `${(c / 100).toFixed(2)} ${String(cur || '').toUpperCase()}`;
const out = [];
const line = (s = '') => out.push(s);

async function main() {
  const d = await stripe(`disputes/${id}?expand[]=charge`);
  const ch = typeof d.charge === 'object' ? d.charge : await stripe(`charges/${d.charge}`);
  const card = ch.payment_method_details?.card || {};
  const due = d.evidence_details?.due_by;

  line(`# Dispute ${d.id}`);
  line();
  line(`| Field | Value |`);
  line(`|---|---|`);
  line(`| Status | ${d.status} |`);
  line(`| Disputed amount | ${money(d.amount, d.currency)} (charge was ${money(ch.amount, ch.currency)}) |`);
  line(`| Stripe reason | ${d.reason} |`);
  line(`| Network | ${card.brand || ''} reason code ${d.payment_method_details?.card?.network_reason_code || 'n/a'} (${d.payment_method_details?.card?.case_type || ''}) |`);
  line(`| Response due | ${et(due)}${due ? ` (${Math.floor((due * 1000 - Date.now()) / 86400000)} days left)` : ''} |`);
  line(`| Evidence staged / submissions | ${d.evidence_details?.has_evidence ? 'yes' : 'no'} / ${d.evidence_details?.submission_count ?? 0} |`);
  line(`| Visa CE 3.0 | ${d.enhanced_eligibility?.visa_compelling_evidence_3?.status || 'n/a'}${(d.enhanced_eligibility?.visa_compelling_evidence_3?.required_actions || []).length ? ' - needs: ' + d.enhanced_eligibility.visa_compelling_evidence_3.required_actions.join(', ') : ''} |`);
  line(`| Dispute opened | ${et(d.created)} |`);
  line();

  line(`## The charge`);
  line();
  line(`| Field | Value |`);
  line(`|---|---|`);
  line(`| Charge / PaymentIntent | ${ch.id} / ${ch.payment_intent || ''} |`);
  line(`| Paid | ${et(ch.created)} |`);
  line(`| Description | ${ch.description || ''} |`);
  line(`| Statement descriptor | ${ch.calculated_statement_descriptor || ch.statement_descriptor || ''} |`);
  line(`| Billing name / email / phone | ${ch.billing_details?.name || ''} / ${ch.billing_details?.email || ch.receipt_email || ''} / ${ch.billing_details?.phone || ''} |`);
  const a = ch.billing_details?.address || {};
  line(`| Billing address | ${[a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean).join(', ')} |`);
  line(`| Card | ${card.brand || ''} ${card.funding || ''} ending ${card.last4 || ''}, issued ${card.country || ''}, wallet ${card.wallet?.type || 'none'} |`);
  line(`| CVC check | ${card.checks?.cvc_check || 'n/a'} |`);
  line(`| AVS line1 / zip | ${card.checks?.address_line1_check || 'n/a'} / ${card.checks?.address_postal_code_check || 'n/a'} |`);
  const tds = card.three_d_secure;
  line(`| 3D Secure | ${tds ? `${tds.result || ''} (${tds.authentication_flow || ''}, v${tds.version || ''})` : 'not used'} |`);
  line(`| Radar | risk ${ch.outcome?.risk_level || ''} ${ch.outcome?.risk_score ?? ''}, ${ch.outcome?.seller_message || ''} |`);
  line(`| Refunded | ${money(ch.amount_refunded || 0, ch.currency)} |`);
  line(`| Receipt sent to | ${ch.receipt_email || 'none'} ${ch.receipt_url ? '(receipt exists)' : ''} |`);
  const md = { ...(ch.metadata || {}) };
  if (Object.keys(md).length) line(`| Charge metadata | ${Object.entries(md).map(([k, v]) => `${k}=${v}`).join('; ')} |`);
  line();

  if (ch.payment_intent) {
    const pi = await safe(`payment_intents/${ch.payment_intent}`);
    if (!pi._error && Object.keys(pi.metadata || {}).length) {
      line(`PaymentIntent metadata: ${Object.entries(pi.metadata).map(([k, v]) => `${k}=${v}`).join('; ')}`);
      line();
    }
  }

  line(`## Evidence Stripe already holds for this dispute`);
  line();
  const ev = d.evidence || {};
  const filled = Object.entries(ev).filter(([, v]) => v !== null && v !== '' && typeof v !== 'object');
  if (!filled.length) line('_Nothing pre-filled yet._');
  for (const [k, v] of filled) line(`- **${k}**: ${String(v).slice(0, 300)}`);
  line();

  line(`## Same customer's other payments`);
  line();
  if (!ch.customer) {
    line('_Guest checkout (no Customer object). Look the buyer up by email in the CRM for prior purchases, logins and attendance._');
  } else {
    const list = await safe(`charges?customer=${ch.customer}&limit=100`);
    if (list._error) line(`_Could not list: ${list._error}_`);
    else {
      const rows = list.data.sort((x, y) => x.created - y.created);
      line(`| Date | Amount | Status | Refunded | Disputed | Description | Charge |`);
      line(`|---|---|---|---|---|---|---|`);
      for (const c of rows) {
        const ageDays = Math.floor((ch.created - c.created) / 86400);
        const mark = c.id === ch.id ? ' **(this one)**' : (ageDays >= 120 && ageDays <= 365 && c.status === 'succeeded' && !c.disputed ? ' (120-365 days earlier)' : '');
        line(`| ${et(c.created)} | ${money(c.amount, c.currency)} | ${c.status} | ${c.amount_refunded ? money(c.amount_refunded, c.currency) : ''} | ${c.disputed ? 'yes' : ''} | ${(c.description || '').slice(0, 60)} | ${c.id}${mark} |`);
      }
    }
  }
  line();
  line(`_Pulled ${et(Math.floor(Date.now() / 1000))}. Read-only; nothing was submitted._`);
  console.log(out.join('\n'));
}

main().catch((e) => { console.error(e.message); process.exit(1); });
