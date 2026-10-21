# Teardowns: how big apps really make money

Read when the user asks how a well-known app works, wants a teardown of a
competitor, or wants to know what's fair to borrow.

These come from the creator decompiling apps and reading their code and config.
They're the creator's findings, not verified independently. Present them that
way, and remember apps change with every release.

## What the teardowns found

**Ad-driven puzzle game (Block Blast).** An on-device model (XGBoost) predicts
how much each player is worth in ad revenue from their phone model, country,
past ad earnings and settings. Difficulty then follows that value. A "boost then
kill" rule makes the game easier until the player's usual game length. When an
expensive ad is ready, a rule helps ad-watchers beat their high score and then
rigs the next turn so they lose. The first thing they see is a revive-for-an-ad
offer, and reviving quietly adds about 10% to the score. They even A/B test the
exact minute to make players lose.

**Duolingo.** A daily churn score predicts whether you'll come back tomorrow,
built from how you opened the app (notification, widget or icon), lessons done,
wrong answers, and recent crashes. To reach you at the right moment, it
fingerprints Wi-Fi networks to guess when you're home, notes whether your phone
was on silent, and pitches turning notifications back on using whatever it
thinks you care about most (a friend's progress, the leaderboard, your streak).

**Subway Surfers.** A server-driven rules engine checks up to ~158 player
attributes (ever paid, total spend, hours since the last ad, other games from
the same studio installed). That decides shop prices, ads, which power-ups
appear, and even max run speed. Rules ship as JSON from the server and can change
for anyone at any time, with 100+ variants tested at once. The same power-up can
cost up to 3× the coins depending on your variant.

**Tinder.** Learns your "type" by averaging embeddings of the photos you swipe
right on, and times how long you look. Scores you by **right-swipe received
ratio** (how many who see you swipe right). An on-device model predicts that
score per photo, and the photo picker scans up to 20,000 camera-roll photos to
choose the best. The creator's test of the extracted model found it favored
mirror selfies and more revealing clothes, scored darker skin lower, and
penalized weight and age for women only. Popular profiles feed a paywall, with
sales tagged as upsells of high-ratio profiles.

**A grossing-$100k-a-day game.** Sends five purchase signals to ad trackers for
one $40 purchase, plus separate signals for paying within a day, returning as a
payer on day 2, and second purchases, combined with thousands of ad creatives.
Its review prompt pre-selects 5 stars and only opens the store for 5-star
submissions, which Apple doesn't allow.

## Fair to borrow vs. don't

| Borrow the idea | Don't copy the dark pattern |
|---|---|
| Predict churn and reach at-risk users at a good moment | Covert tracking (Wi-Fi fingerprinting, silent-mode checks) without clear disclosure |
| Server-driven config and A/B tests on prices and offers | Rigging difficulty or outcomes by a player's spending value |
| Personalizing re-engagement by what the user values | Sending inflated purchase events to ad platforms |
| Asking for reviews right after a win | Pre-filtered or 5-star-preselected review prompts |
| Picking a user's best photos to help them | Models whose scores encode bias on skin tone, weight or age |

If the user wants to build something in the right-hand column, say plainly
that it's a dark pattern, name the risk (store rejection, ad-account bans,
privacy law, user trust), and offer the left-hand version.

## Running a teardown

When the user wants to understand an app themselves:

1. **Outside view first:** download it, record the onboarding and paywall,
   note every price, trial, notification and prompt and when it appears. Check
   its listing keywords, localized storefronts, ratings and review prompts.
2. **Public data:** ad libraries (Meta Ad Library) for its creatives, and
   ASO tools for its keywords and downloads.
3. **Inside view (only on apps they're allowed to inspect):** decompiling and
   reading config can break an app's terms of service and, in some places, the
   law. Point that out, and stick to the outside view for competitors unless they
   know they're on solid ground.
4. **Write it up:** how it acquires users, converts them, keeps them, and
   charges them, plus which parts are fair to borrow.
