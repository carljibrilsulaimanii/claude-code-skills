---
name: slack-issue-scan
description: Daily scan of your team's Slack for technical issues (something broken, failing or misbuilt in the CRM, payment platform, community platform, SMS tool, pages, links or automations) and any issue that involves an associated CRM, platform or integration task, matched against the open Asana tasks for your builders, with each "fixed" claim checked in the live systems, and any issue that has no task turned into one. Use whenever the user says "scan for issues", "daily issue scan", "check Slack for issues", "review slack for reported issues", "map issues to asana", "what's broken", "did <teammate> fix X", "anything I asked <teammate> for that isn't in Asana", or "check the CRM for updates on asana tasks". Use it even when the ask names only Slack or only Asana, because the useful output is the match between the two plus proof from the live systems. Not for business, content, sales or customer-service follow-ups that no platform task depends on (copy deadlines, dispute responses), a general unreplied-messages digest, or a single task the user dictates (use an Asana task-writing skill for that).
---

<!--
  SKILL.md -- slack-issue-scan
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-18 (generic public version)
  Lives:   ~/.claude/skills/slack-issue-scan/SKILL.md (user level) or
           <project>/.claude/skills/slack-issue-scan/SKILL.md
  What:    A daily Slack issue scan: find reported technical problems, match them to
           Asana, verify fixes in the live systems, and turn the gaps into Asana tasks.
  Why:     Manual scans kept finding the same three misses: asks to builders that
           never became a task, tasks still open after the work shipped, and "fixed"
           claims nobody checked (an error channel full of failures that turned out to
           be a test, and a process with no alert at all).
-->

# Daily Slack issue scan

The goal is one short report the user can act on in five minutes: what broke, who
owns it, whether it is really fixed, and which asks have no Asana task. A list of
Slack messages is not the output. Every item has to say what you checked and what
you found.

**Technical and platform-task issues only.** This scan covers technical problems,
plus anything that involves an associated CRM, platform or integration task. Other
business, content, sales and customer-service items stay out of the report even when
they look urgent (section 3 has the line).

## 0. Fill in once

| Setting | Value |
|---|---|
| Builders the scan tracks | Teammate A (`REPLACE_WITH_ASANA_USER_GID`, a@example.com), Teammate B (`REPLACE_WITH_ASANA_USER_GID`, b@example.com) |
| Default Asana project for new tasks | `REPLACE_WITH_PROJECT_GID` |
| Who owns what by default | Teammate A: payments, deals, contracts, payment routing. Teammate B: community platform, email/SMS sends, campaigns, monitors. |
| Last-scan file | `<project>/slack-issue-scan/last-scan.txt` |

Channels to read in full (look up IDs once with `slack_search_channels`):

| Channel | ID | Why |
|---|---|---|
| Team group DM or ops channel | `REPLACE_WITH_CHANNEL_ID` | Most asks to builders and their status reports land here, often in threads |
| #technology (or your tech-requests channel) | `REPLACE_WITH_CHANNEL_ID` | Leadership's tech asks |
| Automation error channel | `REPLACE_WITH_CHANNEL_ID` | Code-step and integration failures posted by a bot |
| Monitoring / ops alerts channel | `REPLACE_WITH_CHANNEL_ID` | Scheduled checks: send reports, pre-send checks, planners |
| Program or customer delivery channel | `REPLACE_WITH_CHANNEL_ID` | Contracts, deals, access problems |
| Payment notifications channel | `REPLACE_WITH_CHANNEL_ID` | Sales and renewals |
| DMs with each builder | `REPLACE_WITH_CHANNEL_ID` | Build updates and asks for the user |

## 1. Window

Scan from the last scan to now. The last scan date is in the last-scan file (one ISO
date, local time). If the file is missing, use the last 2 days and say so. Write
today's date to the file when the report is done. Show all times in the user's time
zone.

## 2. Where to look

Read the section 0 channels in full for the window (`slack_read_channel`, `oldest` =
window start, `response_format: "concise"`). Reading beats searching here: keyword
search misses most real reports because people write "it's not showing" rather than
"error".

Then search all channels (`slack_search_public_and_private`, `after:<window start>`,
`sort: "timestamp"`, `include_context: false`) for the names of your platforms (CRM,
payment, SMS, community), plus `workflow`, `error`, `broken`, `wrong`, `issue`, `404`,
`not working`, `didn't get`, `can't access`. Skim the customer-service channel for
repeated access or link complaints.

Open every thread with replies (`slack_read_thread`). Status, fixes and new asks are
usually in the replies, and a parent message alone is misleading.

## 3. What counts as an issue

The test has two parts. An item is in if either is true:
1. **Technical:** a system is broken, failing, misconfigured or missing a build. Fixing
   it means changing a workflow, code step, property, integration, page, link, payment
   link, key or setting.
2. **Tied to a platform task:** it involves a CRM, platform or integration task, either
   an open Asana task in that area or work that would need one. A business or ops
   message counts when it changes, blocks or depends on that task. Example: a manager
   asking how an annual-renewal bundle will bill next year is a business question, but
   it depends on the bundle's payment workflows, so it is in.

If neither is true (fixing it only means writing copy, answering a customer, chasing a
person or making a business call with no system change), it is out.

Keep:
- Something broken or wrong in the CRM, payment platform, SMS tool, community
  platform, pages, links, automated emails or texts, contract generation, payment
  routing or reports (wrong amounts, missing records, 404s, failed sends, wrong field
  values).
- Error-channel and bot alerts that point to a failing automation (failed code steps,
  permission errors, stuck enrollments).
- A technical build or fix the user asked a builder for, and technical questions from
  builders waiting on the user (which field, which design, approve this build).
- A missing automation someone raised (example: no Slack alert when a payment dispute
  opens). The missing alert is technical; answering the disputes is not.
- Any message that adds to, changes, blocks or answers a question on an open CRM,
  platform or integration task in Asana. Search Asana for the topic before dropping
  anything that names a workflow, object, product, plan, link or integration.
- Business decisions that a platform build is waiting on (example: who should be
  notified when a dispute opens, because the alert can't be built without it; whether
  a missed installment should push back a subscription's end date, because that
  changes the workflow).

Drop:
- Content and copy (emails not written yet, welcome-email wording, how-to guides).
- Customer service and member how-to questions (where's the meeting link, how do I log
  in), unless several people hit the same broken link or page, which is a technical
  issue.
- Sales, coaching, scheduling, staffing and business decisions that no platform task
  depends on (pricing talk, call times, who to invite to an event).
- Dispute responses, refunds and chargeback evidence.
- Anything already closed in the thread ("fixed", "resent", "done") **after you confirm
  it** (section 5).

When an item has both sides, report only the technical part. Example: "the community
platform sends three welcome emails to new bundle buyers" is technical (plan setup);
rewriting the CRM's welcome email is content.

Merge duplicates. A bot that posts the same error 30 times is one item with a count
and a list of affected records.

## 4. Match to Asana

For each item, search before deciding it is a gap:
- `search_tasks` with `text` = two or three topic words, `completed` unset (so done
  tasks show too).
- `search_tasks` with `assignee_any` = the builders' emails, `modified_on_after` =
  window start, to see what moved.

Each item gets one status:

| Status | Meaning |
|---|---|
| **Covered** | An open task already describes this work. Link it. |
| **Done, still open** | The work is live and verified (section 5) but the task is open. Recommend closing it. |
| **Done, closed** | Task complete and the fix checks out. Mention only if it was reported in the window. |
| **Gap** | No task covers it. Propose one (section 6). |
| **Decision needed** | Waiting on the user or another person before a build can go ahead. Say who and what. |

## 5. Check the live systems

A teammate's "it's fixed" is a claim. Check the ones that matter, read-only:

- **CRM (for example HubSpot):** read workflows (enabled flag, revision, last
  updated), records and properties with a GET-only helper. Some objects name search
  properties without the usual prefix; if a filter returns nothing, check the name.
- **Payment platform (for example Stripe):** small read-only scripts that take the key
  from an environment variable, never from a file you print. Useful reads:
  subscriptions (end date, status), disputes (status, response deadline), charges by
  date.
- **Other platforms:** only through existing read-only helpers. Never refresh a shared
  OAuth token from a scan; rotating it can break the sync that owns it.

Lessons:
- An error-channel flood can be a teammate's test. Read the replies and the sender's
  next message, then check the live result before calling it broken.
- Check the exact value, not just that a field is set. Example: a subscription end
  date must land on the final billing time, not after it, or the platform bills one
  more payment.
- Two copies of a workflow both on (a "v2" clone) can double-process events. Check
  whether both are enabled, and look for duplicate records created since the clone.

## 6. Turning gaps into tasks

If the user said "convert", "create" or "make tasks", create them. Otherwise list the
proposed tasks and ask once.

Follow your Asana task-writing standard for the task itself (default project, one
owner per task, the user as follower, no due date unless one was given, valid
`html_notes`: Asana rejects `<p>` and `<br/>`). In each new task:
- Bold first line: where it came from, with the full Slack permalink and date.
- The exact ask as the person wrote it (do not swap in a different design; raise that
  in chat).
- What you verified and how.

Assign by the defaults in section 0. If an item fits an open task, add a dated comment
or rewrite that task's description instead of creating a new one.

Do not close or reassign tasks without the user's OK. When the user fixed something
themselves, recommend closing or reassigning the teammate's task. Never send Slack
messages from a scan; give drafts.

## 7. Report

Keep it short and in plain language. No emojis. Full links for every Slack message,
Asana task, CRM record and payment object.

```
**Broken now** (failing in production, or customers or money affected)
- <item>: <what is wrong>, <who/what is affected>. Owner: <name>. <link>

**Gaps: no Asana task**
1. <item> - proposed task for <owner>: "<title>". Source: <Slack link>

**Done but still open in Asana** (verified)
- <task link> - <what you checked and what you saw>

**Waiting on a technical decision**
- <who> needs to decide <what> before <build> can go ahead. <link>

**Covered** (open tasks, no action)
- <item> -> <task link>
```

End with one question, normally "Create the N proposed tasks?" or "Close the N
verified tasks?", whichever matters more.
