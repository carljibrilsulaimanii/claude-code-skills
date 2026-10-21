# Ideas: start from what already works

Read when the user is hunting for an app idea or unsure theirs is worth building.

## Four proven sources

**1. Copy a category that already makes money.** If people pay for an app, there's
demand for a cheaper, simpler or more focused version. One example: a free
alternative to a paid forms tool reached hundreds of thousands of dollars a month
by selling upgrades. The competitor even helps with marketing, because people
search "<big app> alternative" (see GEO in `growth.md`).

- Find candidates: top-grossing charts by category, apps with lots of 1–3 star
  reviews complaining about price or bloat, "alternative to X" searches.
- Win on one axis: price, simplicity, one platform the leader ignores, one
  audience it serves badly.

**2. Wrap a free dataset in a paid convenience.** A calorie-from-photo app
reportedly earns tens of millions while learning from open food-image datasets.
Free public data exists for weather, transit, jobs, books, films, maps and more.

- The bigger win is **combining** sources for one person's problem. For example,
  map data + live train times + event listings → "plan your night around the last
  train home".
- Starting list: the **public-apis** collection on GitHub, organized by category.
- Prompt for the user's AI: "Here are 5 public APIs from <category>. Suggest app
  ideas that combine two or more of them for <specific person>, ranked by how
  much that person would pay."

**3. Productize free research.** Big companies publish models and methods for
free. One AI headshot app earns six figures a month on a published Google method
(DreamBooth) that learns a face from a few photos. Free models also exist for
pose tracking, background removal, audio-to-sheet-music and more.

- Browse Hugging Face (and Civitai for image models) for new releases, and ask:
  who would pay to have this done in one tap?
- It can also be a paid **feature** inside an existing app, not a new app.

**4. Turn an existing website into an app.** If the user already has a web
product, wrapping it is a cheap new channel (see `shipping.md`).

## Validate before building: the lean canvas

Have them fill a one-page **lean canvas** first: problem, customer segments,
unique value proposition, solution, channels, revenue, costs, key metrics, unfair
advantage. Their AI chat tool can interview them through it. Don't skip it.
It's what makes sure the app solves a real problem for a real person.

Push back if the canvas shows:
- No clear person ("everyone who wants to be healthier")
- No channel they can reach for free (see `growth.md`)
- A price nobody in the category currently pays
