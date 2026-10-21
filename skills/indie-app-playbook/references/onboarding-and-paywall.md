# Onboarding, paywall and pricing

Read when the user is designing first-run screens, a paywall, a free trial,
review prompts, or wondering why installs don't turn into revenue.

## Don't design it, assemble it

The paywalls and onboarding in top-grossing apps were A/B tested against
millions of users, version after version. Taste can't out-design that. Screen
libraries (Mobbin, ScreensDesign and similar) collect hundreds of thousands of
screens and full flows from live apps, Duolingo and Spotify included.

**Fast follower's advantage:** first movers paid for the testing. Find the
winning flow in the user's category, adapt the copy to their app, and have the
AI implement it. None of the screens need to be designed from scratch.

## The flow profitable apps share: Promise → Quiz → Plan → Paywall

1. **Promise: one promise, one button.** A single outcome ("Sleep better,
   starting tonight."), a line setting expectations ("A few questions, then your
   plan."), and one *Get started* button. No sign-up wall, no feature tour.
2. **Quiz: every answer shapes their plan.** 3–6 quick questions (goal, timing,
   level). Show each answer collecting visibly into "your plan" (chips at the
   top work well), so the user feels the plan being built for them.
3. **Plan: show the value before the price.** A short "building your plan…"
   moment, then a personalized result built from their answers (a schedule, a
   target, a first week). The button says *Unlock my plan*, not *Subscribe*.
4. **Paywall: show exactly when they pay.** Trial timeline: *Today*, full
   access; *Day 5*, we'll remind you; *Day 7*, membership starts. A **"Remind me
   before it ends"** toggle, and the price in plain text ("7 days free, then
   $39.99/year"). Then a warm confirmation ("You're all set. See you at 6:30
   AM.").

Being clear about the trial date builds trust and cuts refunds and angry
reviews. It's also what store reviewers expect: price, length and renewal shown
clearly before purchase.

Offer to write the four screens' copy for the user's app, plus the prompt that
has their coding agent build it.

## Review prompt timing

Ask right after a win: lesson finished, streak hit, result delivered. Use the
system prompt and show it to everyone you ask; don't filter for happy users
first. Details in `growth.md`.

Only show the "Remind me before it ends" toggle if the app really sends that
reminder. It needs notification permission and a scheduled notification for
day 5. A promised reminder that never arrives turns into refunds and 1-star
reviews.

## Pricing patterns

- **Hard vs. soft paywall.** A hard paywall (no use without trial or payment)
  converts more installs to revenue in utility apps with a clear outcome. A soft
  paywall (limited free use, upgrade later) suits apps that need habit or network
  effects first. Start hard if the plan step makes the value obvious.
- A yearly plan with a free trial is the default for subscription utilities.
  Offer monthly next to it as the anchor that makes yearly look cheap.
- **The billed amount must be the most prominent price.** A per-week equivalent
  is fine as secondary text, but if it's bigger than the real charge Apple will
  reject it.
- Keep a visible way to close or skip the paywall where the app has free use.
  Hidden or delayed close buttons are a common rejection reason.
- Users who came in through a free promotion often convert to upgrades as well
  as normal users (see `growth.md`), so don't write them off.

## Measure the right events

If the user runs ads, send the ad platforms real events at each step: trial
start, purchase, paying user who returns on day 2, second purchase. Those let ad
algorithms find better buyers. **Never send several purchase events for one
sale** to inflate value. That misreports data to the ad platform and breaks its
terms (see `teardowns.md`).

## Diagnose a leaky funnel

Watch session replays of the onboarding and find the step with the biggest
drop:

- Drop at the promise → the promise is unclear or there's a sign-up wall.
- Drop mid-quiz → too many or too hard questions.
- Drop at the plan → the result doesn't feel personal.
- Drop at the paywall → the price or trial terms are unclear, or the plan didn't
  earn it.
