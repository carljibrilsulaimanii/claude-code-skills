<!--
  fix-playbook.md -- build, simulate, deploy and verify for hubspot-stripe-utm-qa
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   skills/hubspot-stripe-utm-qa/references/
  What:    The order of work for a UTM fix that touches live records, plus the
           HubSpot UI traps and the rate-limit retry.
  Why:     Every shortcut around this order ended in a rollback.
-->

# Fix playbook

## Contents

1. [Before building](#1-before-building)
2. [Write the code](#2-write-the-code)
3. [Simulate on a snapshot](#3-simulate-on-a-snapshot)
4. [Deploy in the HubSpot UI](#4-deploy-in-the-hubspot-ui)
5. [Backfills](#5-backfills)
6. [Verify and document](#6-verify-and-document)
7. [HubSpot UI traps](#7-hubspot-ui-traps)
8. [Rate limits and the retry](#8-rate-limits-and-the-retry)
9. [Site header changes](#9-site-header-changes)

## 1. Before building

- Write a short build doc first: what changes, which fields are written, the
  rule, and how you'll verify it. Nothing goes live until it's been reviewed.
- Check which private-app secrets already exist, and reuse one whose scopes
  fit. A person creates keys; the assistant never pastes them.
- Pull the live workflow JSON (`GET /automation/v4/flows/{id}`) and save it as
  the backup.
- Decide which field the fix writes. Never overwrite raw captures. Derived
  values get their own field plus a basis field.

## 2. Write the code

- Start the file with a header comment: author, date, deploy location, what it
  does and why.
- Write it for Node 20 with `exports.main = async (event, callback)` and
  `fetch`. Use no packages.
- Take inputs from `event.inputFields` and the secret from `process.env`.
- Share one set of junk rules across every file:
  - IMPORT
  - digits only
  - GUIDs
  - domains
  - anything containing `/`, `|` or `{{`
  - anything longer than 40 characters
- Move source, medium and campaign together, from one record.
- Always return a `status` output: `ok`, `skipped: ...` or `error: ...`.
- Stamp a `*_set_at` field on success and on skip, never on error.
- Wrap every HubSpot call in the patient retry (section 8).

## 3. Simulate on a snapshot

1. Snapshot every record in scope to JSON. The search API caps at 10,000
   results, so split by date window.
2. Run the real code file with `fetch` mocked to answer from the snapshot, and
   record every write it would make. That's the prediction.
3. Check invariants that are written separately from the code's own logic:
   - no junk is ever written
   - last touch equals Stripe whenever Stripe has a source
   - a correct value is never rewritten
   - source, medium and campaign come from one record
4. Read 10 to 20 predictions by hand, including the odd ones.
5. Name each prediction file by rule version, so a later run can't overwrite
   the one you'll compare against.

## 4. Deploy in the HubSpot UI

1. Back up one real record, then run the action's **Test** on it. The test
   writes for real. Compare the result with the prediction.
2. Paste the code (section 7). Re-pull the flow through the API and confirm:
   - the code is byte-identical (compare hashes)
   - the secret, inputs, outputs and enrollment are right
3. Set the action's rate limit in the UI. The API doesn't expose it.
4. Turn the workflow on. If HubSpot says "Something went wrong", re-pull the
   flow: it can be ON with nothing enrolled. Turn it off and on again.
5. Watch the first 20 to 50 runs. Read the `status` output column, not the
   "Successfully executed" label.

## 5. Backfills

- With re-enrollment off, a record runs once. To process old records, clone
  the workflow as a one-time run, trigger it on the records in scope, and turn
  it off when it has drained.
- Run one heavy backfill at a time. They share keys with the ongoing
  workflows.
- Make a retry clone that triggers on "stamp is unknown" inside the original
  scope, to catch records that errored.

## 6. Verify and document

- Compare every processed record with the prediction. Count matches,
  differences and unprocessed records, and explain each difference.
- Re-run the audit script and compare the result with the baseline.
- Write a deploy log covering:
  - what changed, with the workflow ids and revision numbers
  - where the backups are
  - the verification counts
  - the time, in your reporting time zone
- Update `fields.md` with the date of any change in meaning.
- Put every number in a message fresh from the live source.

## 7. HubSpot UI traps

- **Pasting code.** The editor is CodeMirror. Typing into it or calling
  `setValue` can drop characters, or fail to mark the action as changed.
  Instead:
  1. Put the file on the clipboard. On Windows:
     `Get-Content -Raw file | Set-Clipboard`.
  2. Run `cm.focus(); cm.execCommand('selectAll')` in the page console.
  3. Press Ctrl+V.
  4. Check a fingerprint (length plus a simple hash of `cm.getValue()`).
- **Outputs.** An existing output name can't be renamed. Delete it and add it
  again, then re-point any downstream actions.
- **Mapping panels scroll under the cursor.** Before each click, check which
  field it will land on. If one goes wrong, cancel without saving and verify
  through the API.
- **Property creation.** A token without schema scope gets a 403. Create the
  property in the UI instead.
  - Use internal names and option values exactly as the code writes them.
  - Labels can be renamed later without breaking anything.
- **Changes to shared resources** need an explicit go-ahead from the owner for
  that action. That means the sitewide header, or a workflow that will write
  thousands of records.

## 8. Rate limits and the retry

Private-app keys are limited per key, to roughly 100 calls per 10 seconds.
When workflows that share a key run at the same time, calls fail with 429.

The retry pattern:
- A run budget of about 17 seconds (`RUN_BUDGET_MS`), checked against a
  deadline before each wait.
- Up to 8 attempts. Wait 1 second first, doubling up to a cap of 6 seconds,
  and honour `Retry-After` up to 10 seconds.
- If time runs out, give up with `status = error: rate limited` and no stamp.
  Do this before HubSpot's 20-second action timeout, so the record stays
  visible to the retry clone.

The real fix is one key per ongoing workflow.

## 9. Site header changes

- **Find it.** It's under Settings > Content > Pages > default settings for
  all domains > Site header HTML. Confirm that no domain overrides it.
- **Change only what you mean to.** Leave anything else in the header
  unchanged, such as other tags or a tag manager snippet. Paste over only the
  attribution block, then check the saved length and fingerprint.
- **Check for caching.** Saving purges HubSpot's cache, but a funnel CDN may
  still serve old HTML. Verify with a cache-buster (leak test 7).
- **Make it testable.** Give every new behaviour a console flag, so it can be
  tested without submitting a form.
