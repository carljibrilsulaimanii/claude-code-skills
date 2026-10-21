# Building with an AI coding tool

Read when the user is choosing tools or a stack, or the app is laggy, buggy, or
the AI "keeps going in circles."

## Pick the tool by experience

| User | Tool |
|---|---|
| Never coded | An AI app builder made for mobile (for example a0.dev) |
| Some technical comfort | Cursor, Claude Code or Codex in a React Native / Expo or native project |
| Already has a website | Wrap it with Capacitor or Cordova (see `shipping.md`) |

**Backend:** most apps need one. Recommend Supabase or Convex. Both scale far
past an indie app's needs and can **push** data to the app in real time.

## Two things AI agents do quietly that hurt the app

**1. Polling instead of subscribing.** Agents often make the app ask the server
for new data every few seconds forever. It looks fine in testing, then drains
battery and drops frame rate for real users. Fix: use the backend's real-time
subscriptions so the server pushes changes.

Paste-ready instruction:
> Audit the app for any polling (setInterval, repeated fetches, refetch loops).
> Replace each with a real-time subscription from <Supabase/Convex> so data is
> pushed on change. List every place you changed.

**2. Piling version 2 on top of a broken version 1.** Asked to change a feature,
agents often keep the old one "for backwards compatibility" and add fallbacks.
The codebase fills with dead, half-broken paths, and later prompts get confused
about which one is live. That's why things that used to work start breaking.

Paste-ready instruction:
> Do not add fallbacks or backwards compatibility. When changing a feature,
> replace the old implementation entirely, delete the dead code, and confirm the
> new version works end to end.

## Set up before launch

- **Session replay (for example PostHog).** Basic analytics show *that* users
  churn. Replays show *why*: the exact taps, the confusing step, the bug you'd
  never catch. It's the closest thing to sitting next to a user. Add it on day
  one, and watch a few replays daily after launch.
- **Over-the-air (OTA) updates (for example Expo EAS Update).** Every store
  update waits for review, sometimes a week. OTA pushes JavaScript and asset
  fixes to installed apps in seconds. Limit: fixes and improvements only. Store
  rules (Apple guideline 3.3.2, Google Play policy) forbid using it to change
  the app's core purpose, and doing so risks rejection or removal.
- **A review prompt** at a moment of success (see `onboarding-and-paywall.md`).

## When the user is stuck in a loop

1. Have the AI write down what the feature should do, and the current behavior.
2. Remove fallbacks and duplicate versions (instruction above).
3. Reproduce the bug in a session replay or with logs before asking for a fix.
4. Make one change per prompt and test it before the next.
