# Growth without paid ads

Read when the app is live (or about to be) and the user wants downloads. The
source developer says these channels bring their apps 20,000–50,000 downloads a
month with no ad spend. That's their anecdote, not a benchmark. Do them in
roughly this order.

## 0. Diagnose before prescribing (live apps)

Open App Store Connect → Analytics (Play Console → Statistics on Android) and
compare:

- **Low impressions** → people aren't finding it. Fix keywords, title and
  localization (1–2 below).
- **Good impressions, low product-page conversion** → people find it and pass.
  Fix the **icon, first two screenshots, and rating count**.
- **Good downloads, little revenue** → the problem is onboarding and paywall,
  not growth (`onboarding-and-paywall.md`).

## 1. App Store Optimization (about 30 minutes, biggest lever)

The app's **name is a search term.** "Lumora" ranks for nothing. "Blackjack
Trainer – Lumora" shows up when people search "blackjack".

- Everything is ranked against keywords: **title, subtitle, keyword field
  (iOS), description (mainly Google Play), and screenshot text.**
- Don't guess the keywords. ASO tools (Astro, AppTweak and similar) show search
  volume and how many apps compete for each term.
- Pick terms that are **popular but uncrowded**, and put the strongest one in
  the title.
- iOS limits: title 30 characters, subtitle 30, keyword field 100. In the
  keyword field, separate with commas and no spaces, and don't repeat words
  already in the title or subtitle (they already count).
- The first two screenshots carry most of the conversion. Lead with the outcome,
  in big caption text that also holds a keyword.

Offer to build a table: keyword | popularity | competing apps | where it goes
(title / subtitle / keywords / screenshot caption).

## 2. Localization: 175 storefronts, not one

The App Store is one store per country, and most apps only show up in one.
"Calorie counter" in the US has hundreds of competitors. The German equivalent
may have almost none.

- Apple lets each locale have its own name, subtitle, keywords and
  description, and that's what search reads there. A German title can rank in
  German search even if the app itself is English-only.
- Find demand for free: Apple Ads (formerly Apple Search Ads) shows a
  popularity score for search terms in each country, without running an ad.
- Look for terms that are popular but empty, then have the AI translate the
  listing into each of those locales. Aim for 20+ storefronts.

## 3. Reviews: the moat

Top results win largely on rating count. The best defense against any competitor
is having more reviews than them.

- Ask at a **moment of success** (finished a workout, hit a streak, got a
  result), never on launch or after an error.
- Use the system review prompt (on iOS, `SKStoreReviewController` /
  `requestReview`, which Apple limits to about three showings a year). Don't
  pre-screen users so that only happy ones reach the store. Both stores forbid
  that "review gating". A separate "send feedback" option elsewhere in the app
  is fine.

## 4. Go free for a few days (catch up on ratings fast)

This only applies to **paid-upfront** apps. For free-with-subscription apps,
the equivalent is a limited-time free premium period or an extended trial
promoted to the same communities.

Prompting for reviews closes the rating gap one user at a time. Faster: make a
paid app free briefly and list it on deal communities where people wait for paid
apps to go free (AppRaven and similar). Thousands of interested users arrive,
leave ratings if the app works, and often convert to upgrades or subscriptions
as well as normal users. That's months of catch-up in days.

## 5. SEO pages: catch Google searches

People google the problem the app solves. Give each problem its own page on the
website that **actually solves it** and links to the app.

- Example: a bill-splitting app builds a working "how to split rent fairly"
  calculator page that points to the app for ongoing tracking.
- Find the searches with Google Ads **Keyword Planner** (free, no ad spend). It
  shows monthly volume by country.
- Workflow: AI lists ways people would phrase the problem → check volumes in
  Keyword Planner → AI builds a small page for each top term.

## 6. GEO: show up in ChatGPT and Claude answers

When people ask an AI for "a cheaper alternative to X", the AI searches
comparison sites. List the app on them (AlternativeTo, SaaSHub, and directory
lists with hundreds of submission sites) as an alternative to the big names in
its category. The AI then finds it next to a name it already knows, with a reason
to recommend it. One forms startup said AI search became its largest source of
new users. This is called **Generative Engine Optimization (GEO).**

Have the AI research the right directories and draft each listing, then submit.

## 7. Extra revenue channels for an existing app

- **App bundles** (Setapp and similar): subscribers pay for a whole catalog, and
  developers get a share based on use. Bundles look for polished apps that fill a
  gap in their collection, so pitch where they have nothing like yours. The app
  can still be sold on its own as well.
- **App Clip links** for sharing without an install (`shipping.md`).

## Priority by situation

| Situation | Start with |
|---|---|
| Not launched yet | ASO + localization + review prompt built in |
| Live, few downloads | Diagnose (section 0) → ASO audit → localization → go-free listing if paid-upfront |
| Has a website | SEO pages + GEO listings |
| Ratings far behind competitors | Go-free listing + review prompt timing |
