---
name: ad-creation-management
description: >-
  Run a paid-social ad pipeline end to end for one offer in five stages:
  research and positioning (a 50-angle Creative Mosaic), writing the ads
  (hooks, copy, scripts), making the creative (static and video), launching
  and managing on Meta, and measuring and learning so results feed the next
  round, all held together by one living Campaign Blueprint. Use whenever the
  user asks to research competitors or positioning for an offer, build ad
  angles or hooks, map objections, make a positioning map, write ad copy or a
  video script, brief or make static or video ads, prepare creative for an
  agency or design team, set up or launch a Meta campaign, review which ads or
  angles worked, or says "new creative", "fresh angles", "creative mosaic",
  "ad brief", "write the ads", "launch these ads" or "what should the next ads
  say". Budget, scaling and cut/keep calls on running campaigns are a
  separate decision (see "What this skill does not decide").
---

<!--
  SKILL.md -- ad-creation-management
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-20 (generic public version 2026-10-20)
  Lives:   ~/.claude/skills/ad-creation-management/SKILL.md (user level) or
           <project>/.claude/skills/ad-creation-management/SKILL.md
  What:    A five-stage loop (research, write, create, launch, learn) for one
           offer's ads, with approval gates and one shared Campaign Blueprint.
  Why:     Ad work spread across chats, tools and people loses the offer facts,
           the approved voice and what the last round taught. One blueprint
           and scoped approvals stop the re-asking and the unapproved launches.
           The research-to-launch loop is adapted from The Room's Ad Creation &
           Management workflow, restated in my own words; none of its prompts
           are included. The measurement rules come from running it on a live
           account.
-->

# Ad creation and management

One offer moves through five stages in order, and the last stage feeds the
first, so every round of ads starts from what the previous round taught.
Each stage ends with an approval and a handoff, and every stage reads from
and writes to the same Campaign Blueprint, so nothing gets re-asked and
nothing gets lost between tools.

| Stage | Output | Approval that closes it |
|---|---|---|
| 1. Research and position | evidence register, objection map, positioning map, 50-angle Creative Mosaic, Top 10 | the position and the chosen angle IDs |
| 2. Write the ads | hooks, primary text, headlines, CTAs and video scripts for each chosen angle, in a copy bank | the words, per angle |
| 3. Make the creative | 3 to 5 static ads and one video at a time, each on a different angle, using approved copy | the finished files |
| 4. Launch and manage | a paused campaign built from approved copy and creative, then a clean launch | the exact campaign plan ("LAUNCH") |
| 5. Measure and learn | verified results, an outcome for every ad, the next three briefs | the next round's angles, back into Stage 1 |

The loop out of Stage 5 has three moves: scale what earned it, replace what
did not, and test new angles from the backlog.

## What this skill does not decide

This skill makes creative and campaign plans. Whether a running campaign
deserves more or less money is a different question with its own failure
modes (fast numbers mistaken for the goal, unsettled days, the wrong
attribution ruler). If you have a separate budget or media-plan skill, hand
those calls to it. If not, apply the rules in `references/measure.md` and
keep budget changes small and deliberate.

## The Campaign Blueprint (the brand brain)

Everything the stages need to know about the business lives here: the offer,
its own method, the voice, the proof, the visual taste and the rules. Keep
one dated blueprint per offer, for example `ad-blueprints/<offer-slug>_blueprint.md`
in the project. Read it first, update it at the end of every stage, and hand
it over whole when work moves to another tool, chat or person. Never restart
the intake when a blueprint exists. Sections:

1. **Offer and journey**: what is sold, to whom, price, the immediate action
   after the ad, and the full URL of every page in the path (for example a
   free webinar registration page, then the paid ticket page).
2. **Positioning**: one-sentence position, named mechanism, buyer
   situations, objections, approved claims, proof with status
   (AVAILABLE / NEEDS CONFIRMATION / MISSING), evidence IDs.
3. **Angles**: the chosen angle IDs and why each is being tested.
4. **Voice and visual direction**: approved voice sample, words never used,
   fonts, HEX colors, references, who may appear in ads, the Video Style
   Card.
5. **Copy bank**: every hook, primary text, headline, CTA and script with its
   copy ID, angle ID, destination, status and approval date.
6. **Assets**: every static and video file with its angle ID, copy IDs,
   format, file name, storage link and approval status.
7. **Campaign**: ad account, objective, optimization event, audience,
   placements, destination URLs, UTM template, budget ceiling, dates, target,
   stop conditions, and the launch approval (who, when, exact scope).
8. **Learning log and next cycle**: one row per ad with its result and
   outcome, open decisions, the next three briefs, next review date.

End every stage by showing the updated blueprint sections and one clear next
decision.

## Rules that apply to every stage

- **The user sets the standard.** They approve the voice, approve the work at
  every gate, and own the budget and decision rules. Nothing moves to the next
  stage, and nothing spends, without their explicit yes.
- **Never invent** business facts, customer quotes, competitor claims, proof,
  numbers or results. Mark unknowns. Label inference as hypothesis.
- **Never present a plan as a finished asset.** If no image or video tool is
  available in this session, deliver a labeled production brief, not a
  pretend file. Claude Code on its own cannot render images or video;
  finished assets come from a designer or a generation tool, then come back
  for review.
- **Never claim an action you did not take**: viewed, saved, uploaded,
  connected, launched or measured.
- **Approval is scoped.** Approving research is not approving copy, approving
  copy is not approving creative, and approving creative is not approving
  launch.
- **Draft outbound messages** (to an agency, a designer, a platform) and wait
  for "send it".
- **Regulated claims.** If the offer touches money, health, housing,
  employment or credit, no promised results, income figures or "guaranteed"
  language, and no copy that describes the viewer's own situation. Platforms
  disapprove "unreliable claims" and restrict some categories (housing,
  credit, employment) to limited targeting. Details in
  `references/angle-system.md`, "Claims and policy", and
  `references/copywriting.md`.
- **Destination rule.** Ads that land on a page that sells (a ticket or
  checkout page) carry only copy and creative that directly sell that offer.
  Organic-style content belongs on top-of-funnel pages, not in purchase
  campaigns.

## Stage 1: Research and position

Read `references/angle-system.md` before starting. In short:

1. **Intake by confirmation, not interrogation.** Pull the offer page and the
   brand's social profiles first, then present what you found as statements
   to confirm, one topic at a time, with two or three suggested answers.
   Topics: offer, buyer and buying moment, audience, how it works, proof,
   resistance, alternatives, brand vibe, ad destination and style. Propose
   two or three names for the mechanism; never invent a method.
2. **Research sprint, time-boxed.** Own customer evidence first (sales notes,
   SMS and email replies, support inbox, webinar Q&A), then competitor sites,
   then the Meta Ad Library and social profiles where access is real. Log
   every source in an evidence register (S01, S02, ...). Keep customer
   evidence, competitor claims, practitioner guidance and your hypotheses
   separate. Say "not observed in the reviewed sample", never "nobody does
   this".
3. **Objection and motivation map** from the objection families, with buyer
   identity in three parts (current, aspired, rejected).
4. **Positioning map** as an HTML page with three views: speed by depth,
   ease by impact, sacrifice by value. Positions are judgment calls and the
   page says so.
5. **50 angle cards** (A001 to A050) using the awareness split and card fields
   in the reference. Every unaware and problem-aware card must pass the cold
   stranger test.
6. **Audit**, then a Top 10 to produce first, each with its test question.
7. **Deliver**: the Creative Mosaic as an interactive HTML page (tiles
   colored by awareness, filters, click to open the full card, plus an
   objection-map view), a one-page positioning snapshot, a private competitor
   swipe file, and the blueprint update.

On the second and later rounds, start from Stage 5's learning log: update the
evidence register and the angle cards before choosing new angles.

Approval gate: the user approves the position and the chosen angle IDs.

## Stage 2: Write the ads

Read `references/copywriting.md`. In short:

- **Calibrate the voice on one passage first**, get it approved, then write
  the rest. Record the approved sample and the words never used.
- For each chosen angle: three genuinely different hooks, short and long
  primary text, a headline that says what happens next, and a CTA that
  matches the destination (for example `SIGN_UP` for a free registration,
  `BUY_TICKETS` for a ticket page). Short on-image text. Video scripts with
  the hook in the first three seconds, timed beats and captions.
- Give every piece a copy ID tied to its angle (`A012-H1`, `A012-PS`,
  `A012-V15`).
- **Check before approval**: cold stranger test, claims only where proof is
  AVAILABLE, no description of the viewer's personal circumstances, event
  dates and times confirmed against the source of truth and the live page,
  destination fit, house style.

Approval gate: the user approves the words per angle, recorded in the copy
bank. Creative is only made from approved copy.

## Stage 3: Make the creative

Read `references/production.md`.

**Static ads**

- Default is **3 to 5 separate ads, each on a different angle ID**. Different
  colors or crops of one argument are one angle, not several.
- Ask only for what the blueprint lacks: shape (4:5 feed, 9:16 stories and
  reels), fonts, HEX codes, inspiration ads, and **who appears**: (A) no
  person, (B) original photos kept unchanged, (C) generated likeness from 3
  to 5 reference photos, or (D) a stated mix.
- **First ad alone first.** Produce or brief one complete ad with its
  approved copy, get it reviewed for spelling, offer facts, CTA, colors and
  likeness, then do the rest.
- Save approved files only, named `<Month>_Static_Ad #NN.png` with a
  matching `<Month>_Static_Ad #NN_Copy.txt`, into the folder recorded in the
  blueprint.

**Video ads**, one route per video:

- **A. Talking head from a photo**: one clear primary photo, optional
  supporting photos, the approved script.
- **B. Edit a recorded video**: the original file, a list of what changes and
  a list of what must stay.
- **C. Cinematic 15-second video**: the idea, feeling, references, the exact
  approved title, CTA or voiceover.
- **D. Publish-ready edit of raw footage**: platform, title and caption style,
  audio cleanup, motion-graphics references.

Get the shot list or edit plan approved before production. Output is 9:16
unless the plan says otherwise. One video at a time; review the whole thing
with sound before anything is saved externally (captions, spelling,
identity, offer facts, timing, final frame). Update the Video Style Card so
the next video matches.

Approval gate: the finished files, each mapped to its angle ID and copy IDs.

## Stage 4: Launch and manage

Read `references/launch.md` before touching an account, and fill in its
account facts section once. The rules that matter most:

- **Whoever runs the account is told first.** If an agency or teammate
  manages the campaigns, notify them before enabling anything, and for every
  build give exact campaign and ad set names plus Ads Manager deep links.
- **Know your access route.** Meta's ads connector (MCP) if your account has
  it, otherwise the Marketing API with a token, otherwise click-by-click
  instructions for a person. Spend-affecting changes always get a human's
  final click and a read-back afterwards.
- **Build paused, launch on an explicit "LAUNCH"** for the exact plan shown:
  campaign, objective, optimization event, audience, placements, creative,
  copy IDs, destination, schedule, budget, tracking and expected spend.
- **Upload finished creative to the ad account's media library in Ads
  Manager, not the Business media library.** Images can go in a batch; videos
  one at a time.
- Keep it running cleanly: delivery statuses, learning phase, billing, and
  the troubleshooting order are in the reference.

Approval gate: the exact campaign plan, approved with "LAUNCH" or an equally
clear instruction naming that plan.

## Stage 5: Measure and learn

Read `references/measure.md`. In short:

- Report only retrieved, settled data, with source, scope, date range,
  attribution and retrieval time.
- Judge ads and angles on the outcome that pays (purchases per $1,000 and
  revenue per ad dollar, by first touch), not cost per lead. If you sell on a
  live webinar or event, purchase spikes on event days are mostly the live
  pitch, not proof an ad earned more budget. Below a spend floor you set in
  the blueprint, an ad is untested.
- Give every ad an outcome in the learning log: scale, keep, replace, retire
  or untested.
- **Scale** goes to whoever owns the budget decision. **Replace** keeps a
  sound angle with new hooks or creative, or retires an angle that had a fair
  test. **Test** pulls distinct new angles from the Creative Mosaic backlog,
  each with a test question and a stop rule.
- Close the cycle with the next three briefs and take them into Stage 1.

Approval gate: the user picks which briefs start the next round.

## Files

- [`references/angle-system.md`](references/angle-system.md) (Stage 1):
  objection families, buyer identity, awareness split, angle card fields,
  cold stranger test, audit, claims and policy.
- [`references/copywriting.md`](references/copywriting.md) (Stage 2): voice
  calibration, what to write per angle, copy IDs, pre-approval checks.
- [`references/production.md`](references/production.md) (Stage 3): static
  and video production rules and the failure fixes that recur.
- [`references/launch.md`](references/launch.md) (Stage 4): account facts to
  fill in, pre-launch decisions, uploading, delivery statuses, learning
  phase, billing, Meta's ads connector, troubleshooting.
- [`references/measure.md`](references/measure.md) (Stage 5): how a winner is
  judged, the three moves, the learning log, reporting rules, the Performance
  Ledger.
