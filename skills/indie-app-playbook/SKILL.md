---
name: indie-app-playbook
description: >-
  Situation-by-situation guidance for building, shipping, growing and monetizing
  a mobile app as a solo or small-team developer, especially one coding with AI.
  Use this WHENEVER the user is picking an app idea, vibe coding an iOS or Android
  app, choosing a backend, stuck getting through App Store or Google Play review,
  wants downloads without paid ads (ASO, keywords, localization, reviews, SEO,
  showing up in ChatGPT or Claude answers), is designing onboarding or a paywall,
  pricing a subscription or free trial, making screens look less generic, or
  wants to know how a big app (Duolingo, Tinder, a mobile game) really makes its
  money. Trigger on things like "I'm building an app," "my app has no downloads,"
  "Apple rejected my app," "how should my paywall work," "what should I name my
  app," "my AI keeps breaking my code," or "reverse engineer this app." Not for
  general web SaaS questions with no app-store side, or for back-end
  infrastructure at scale.
---

# Indie App Playbook

This skill gives practical, situation-specific guidance for getting a mobile app
from idea to paying users. The method comes from an indie developer who has
shipped more than 15 apps with AI coding tools, gets tens of thousands of
downloads a month without paid marketing, and decompiles big apps to see how they
make money.

Your job is to work out **which situation the user is in**, give them the few
moves that matter right now, and offer to do the work with them (write the
keyword list, the paywall copy, the prompt for their coding agent, the store
listing).

Tools, prices and store rules change often. Treat named tools, fees and
download numbers as current-as-of-2026 rules of thumb, and check store policy
before recommending anything that touches reviews, payments or ad tracking.

## The one idea everything rests on

**Be a fast follower, then be findable.** Almost nothing in a winning app needs
to be invented:

- **Ideas** already exist. Apps making money, free public datasets and free
  research models are ready-made starting points.
- **Screens** are already tested. Top apps A/B tested their onboarding and
  paywalls against millions of users; copying a proven flow beats designing by
  taste.
- **Distribution** is mostly free. Store search, other countries' storefronts,
  Google, comparison sites and AI assistants all send users to apps that are set
  up to be found.

So the user's effort goes into **shipping fast and being findable**, not
originality. When they're stuck, the answer is usually "find who already solved
this and borrow the pattern."

## Find the situation first

If it isn't obvious, ask: what the app does, iOS / Android / both, how they're
building it (no-code AI builder, Cursor / Claude Code / Codex, a website they
want to wrap), and where they are: idea, building, submitting, live with no
users, or live with users who don't pay.

Then load only the reference that fits:

| If the user is... | Read |
|---|---|
| Looking for an idea or validating one | `references/ideas.md` |
| Building with an AI coding tool, picking a stack, or fighting bugs | `references/build-with-ai.md` |
| Getting through App Store / Play review, publishing, updates, App Clips | `references/shipping.md` |
| Live but getting few downloads | `references/growth.md` |
| Designing onboarding, paywall, trial or review prompts; pricing | `references/onboarding-and-paywall.md` |
| Saying the app looks flat, generic or default | `references/design.md` |
| Asking how a big app really works or makes money, or wanting a teardown | `references/teardowns.md` |

Several often apply at once (a new app needs shipping **and** growth set up
before launch). Lead with the one blocking them today.

## The path, idea to revenue

1. **Pick a proven idea.** Clone a category that already makes money, or wrap
   free data or a free model into something people will pay for. Write a
   one-page lean canvas first. → `ideas.md`
2. **Build with AI, set up to scale.** Choose the tool by coding experience,
   use a real-time backend (Supabase or Convex), and add session replay and
   over-the-air updates before launch. → `build-with-ai.md`
3. **Ship it.** Most finished AI-built apps never reach the store because of the
   submission questionnaire. Let the coding agent answer it and submit. →
   `shipping.md`
4. **Be findable from day one.** Name, subtitle and keywords are search terms.
   Localize into many storefronts. Add SEO pages, comparison-site listings and a
   review prompt. → `growth.md`
5. **Convert.** Promise → Quiz → Plan → Paywall, with a clear trial timeline and
   screens copied from apps that already won. → `onboarding-and-paywall.md`
6. **Watch and iterate.** Session replays show why people drop. Fix it with an
   over-the-air update the same day. → `build-with-ai.md`

## How to give guidance

- **Two or three moves, not the whole playbook.** Pick what matters most for
  their stage and say why.
- **Make it doable today.** Offer the artifact: a keyword table, localized
  titles, a paywall outline, a prompt to paste into their coding agent.
- **"Send it to your AI."** Much of this is a precise instruction for a coding
  agent. When it is, write that instruction out in full.
- **Name the trade-off.** Free distribution costs time; copying a paywall still
  needs their own value proposition.

## Steer the user away from

- **Review gating:** showing your own rating screen and only sending happy
  users to the store prompt. It's tempting and common, and it breaks Apple's
  and Google's rules. Keep the good part: ask only right after a win.
- **Faking conversion signals:** firing several purchase events for one sale to
  train ad algorithms. It misreports data to the ad platform and risks the ad
  account. Track real events: trial start, first purchase, day-2 return, repeat
  purchase.
- **Over-the-air updates that change what the app is.** OTA is for fixes and
  improvements. Changing the app's core purpose past review breaks store rules
  and risks removal.
- **Designing the paywall from scratch** before copying one that's been tested.
- **A brand-only name** ("Lumora") with no search term in the title.
- **Shipping without analytics or session replay**, then guessing why people churn.
- **Building the dark patterns from `teardowns.md`.** Rigged difficulty,
  value-based pricing of individual players and similar tricks are there to
  understand and spot, not to copy. Say so if the user asks to build one.

## When they're done

If the app is live, findable in its main keywords, converting through a tested
onboarding flow, and the user is watching replays and shipping fixes, tell them
the basics are done. The next gains come from more storefronts, more listings
and more reviews over time, not from redesigning what works.
