# Shipping: getting into the stores and staying there

Read when the app is built but not published, rejected, waiting on review, or
the user wants App Clips or to turn a website into an app.

## Costs (check current pricing)

- Apple Developer Program: about $99 a year.
- Google Play developer account: a one-time $25.
- Store commission on digital purchases: usually 30%, or 15% for small
  developers enrolled in Apple's Small Business Program and on most Google Play
  subscriptions.

## Why finished apps never ship

Most people who finish an AI-built app never publish it. The usual blocker is
Apple's questionnaire: what the app does, what data it collects (privacy
labels), whether it uses encryption, reviewer login details, age rating. People
who didn't write the code either guess and get rejected, or give up.

**Fix: let the AI that wrote the code answer it.** Connect the coding agent to
App Store Connect. Options, most official first:

- **Expo apps:** EAS Build + EAS Submit (no Mac needed).
- **Any app:** the App Store Connect API with fastlane (needs a Mac or a CI Mac).
- **Lance** (lance.app): an MCP server that lets Claude Code / Codex drive App
  Store Connect from a cloud Mac. Convenient, but it means giving a third party
  access to your Apple account, so check the vendor and use a scoped API key
  you can revoke.

Then:

> Get this app ready for App Store submission: fill the listing, privacy
> details and encryption answers from the actual code, write reviewer notes with
> a demo login, upload the build, and submit for review.

## Pre-submission checklist

- [ ] **Privacy policy URL** (required) and support URL
- [ ] **Privacy labels cover third-party SDKs**, not just your own code:
      analytics, session replay (PostHog records screens, so declare it), ads,
      crash reporting. The code alone won't show everything an SDK collects.
- [ ] **Screenshots** for the required device sizes, with keyword captions
      (see `growth.md`)
- [ ] **Reviewer access:** a working demo login in the reviewer notes
- [ ] **In-app purchases** created and attached to the build, if you charge
- [ ] **TestFlight** run on a real device before submitting
- [ ] **Not a thin clone.** Apple rejects copycat or template apps (guideline
      4.3, spam) and apps with too little functionality (4.2). When copying a
      category (`ideas.md`), make the difference obvious in the app and the
      listing.

**Google Play:** new personal developer accounts must run a **closed test with
at least 12 testers for 14 days** before they can publish to production. Line up
testers early; this blocks many Android launches.

**On rejection,** give the agent the rejection message: "Explain why this was
rejected, fix it, and resubmit." Most rejections are about metadata, missing
reviewer access, privacy text, or purchases outside in-app purchase.

## Updates without waiting on review

Set up over-the-air updates before launch (see `build-with-ai.md`), so a broken
release can be fixed in minutes, not after a week in review.

## App Clips (iOS): use without installing

An App Clip is a small, working slice of the app opened from a link, QR code or
NFC tag, with no install. One restaurant-ordering app reported App Clips
bringing in over 60% of its users (one developer's report, not typical).

- Make links open specific content (a recipe, a workout, an order) so users can
  share exactly what they're looking at.
- The same link opens the full app for people who already have it.
- Setup touches App Store Connect configuration and associated domains, so it's
  a good job to hand to the agent through the same App Store connection.

## Website → app store app

Wrapping an existing website used to mean redoing half of it for store rules.
Now Capacitor or Cordova let the AI reuse the site and add the native features
reviewers expect (push notifications, offline handling, native navigation).

The catch: digital subscriptions sold inside the app generally have to go
through Apple and Google in-app purchase, not Stripe. Those purchases then need
syncing back to the website's user accounts (a tool like RevenueCat, or store
server notifications to your backend). Plan for this, and for the commission.
