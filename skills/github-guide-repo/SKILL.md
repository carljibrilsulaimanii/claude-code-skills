---
name: github-guide-repo
description: Create, update or push a public GitHub guide repo that shows someone else how to rebuild an integration you built at work. Use whenever the user asks to make a repo or guide for an integration, push a guide to GitHub, rename a guide repo, or fix a guide README. Covers sourcing from the build chats, screenshots and live code, removing everything that identifies the employer, the click-by-click README standard, the sanitize scan, and the push itself.
---

<!--
  SKILL.md -- github-guide-repo
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-29 (generic public version 2026-10-14)
  Lives:   ~/.claude/skills/github-guide-repo/SKILL.md (user level) or
           <project>/.claude/skills/github-guide-repo/SKILL.md
  What:    The standard for building and pushing public integration guide repos:
           one repo per integration, sanitized, with a click-by-click README.
  Why:     Guides written from memory or from a code read were rejected as
           summaries. Every rule below came from a correction while publishing a
           couple of dozen of these repos.
-->

# GitHub guide repos

The user publishes **one public repo per integration** they built at work. Each repo is
a guide someone else can follow to rebuild the integration from scratch. The rules
below came from corrections; treat none of them as optional.

## 0. Set up once

Fill these in before the first repo. Keep the filled-in copies **outside** any public
repo.

| Setting | Where | Example |
|---|---|---|
| GitHub user | `gh auth status` | `your-github-user` |
| Guides folder | One local folder, one subfolder per repo. The parent is not a repo. | `~/github-guides/` |
| Repo list | A Markdown file with candidates, skipped rows and published repos | `~/github-guides/repo-ideas.md` |
| Commit email | GitHub's no-reply address, set per repo | `12345678+your-github-user@users.noreply.github.com` |
| Denylist | Regexes for your employer's names, domains, ids and staff ([`scripts/denylist.example.txt`](scripts/denylist.example.txt)) | `~/.config/guide-denylist.txt` |
| Author credit | The one name allowed in the repo | `Your Name` |

Keep a table of published repos here (or in the repo list) and update repos in place;
never create a near-duplicate.

## 1. Gather the real build before writing anything

A guide built from memory or a code read gets rejected. Collect all three sources:

1. **The build chats.** Find every session that built or fixed the integration:
   - Claude Code sessions: search the session transcripts by feature keywords. Raw
     transcripts are the `*.jsonl` files under `~/.claude/projects/<project>/`.
   - claude.ai chats: the user may point to them. Read them in a browser where the user
     is signed in.
   - Exports from other assistants (ChatGPT or claude.ai data exports) are often huge
     single-line files. Search them with a short Python script, not grep.
   - Pull out every step the assistant walked the user through, in order, **and every
     correction the user made**. The corrections are the most valuable part.
2. **Screenshots.** Required, not optional. Filter the user's screenshot folder by
   platform and by dates near the build (a spreadsheet catalog with OCR text helps), then
   **read the images** to copy the exact labels: panel titles, buttons, dropdown text and
   error messages. If nothing is catalogued, match image timestamps in the transcript to
   the screenshot file names.

   **Read the screenshots yourself, against the README text, before reporting.** A
   helper's report is a summary, and whatever it leaves out never reaches the guide. One
   helper summary missed a lookalike option, a dialog warning, a revoke button and a
   visible token. Write the steps, then open each screenshot and check every label in
   the step it supports. "A helper read them" is not "I reviewed them".

   **Skip screenshots that show a live secret** (token debuggers, API explorers, key
   pages). Don't transcribe the value. Tell the user which files expose it, and that
   making a new token doesn't cancel the old one.
3. **The working code.** This is the source of truth for input names, output names and
   types, secret names and constants.

Also check email or chat threads the user names (for example, vendor support
confirmations). The "Why it exists" section should state the vendor's confirmed limits.

### Keep token cost down

- Never fan out parallel subagents or a multi-agent workflow unless the user asks.
  A six-agent screenshot audit once burned ~845k tokens in 40 seconds.
- Shortlist with a cheap script first (Python over the screenshot catalog or the
  transcripts), then read a handful of items yourself.
- For audits across repos, go one repo at a time and report between repos.
- At most one background helper, only when a script can't do the job, and say the
  expected cost before launching it. Verify its output yourself (step 4).
- Don't mine a stopped helper's transcript; rerunning the cheap script costs less.

### Check the live version, not just the local file

Local folders and session copies go stale. Read what is actually running:

- Read live workflows in a browser profile that is signed in to the platform. Read
  only: **never click Save or Publish**; use Cancel or close the panel.
- CodeMirror editors (HubSpot custom code):
  `document.querySelector('.CodeMirror').CodeMirror`, then
  `setOption('viewportMargin', Infinity)` and read the page text to see every line.
- Monaco editors (Apps Script): `editor.layout({height: 12000})`, then read the page
  text.
- If returning code through page JavaScript is blocked by a filter, don't work around
  it. Compare per-line hashes of the live code with your copy, then screenshot the
  lines that differ.
- Workflow details panels show conditions and targets as text; reading the panel's
  accessibility tree works when plain page text doesn't.

**Live code that isn't on disk can often be read from the served page.**
- GoHighLevel funnel pages embed their custom code (head/footer tracking, custom HTML)
  in the page HTML as escaped strings: fetch the page and extract the string around a
  known token. That copy is **rendered**: GHL has already replaced every `{{...}}` with
  values, and it mangles `{{`/`}}` inside code too. Get custom-value names from an older
  template copy, and report mangled code as a live defect.
- HubSpot Design Manager JS: the served `.min.js` carries a `sourceURL` comment that
  points at the unminified file. Fetch that.
- Compare your copy with the live one by diff or line hashes; only placeholders and
  identifiers should differ.

### Reading GoHighLevel workflows (read only)

- The workflow list's search box often drops typed text. Click it, wait a second, type,
  then check the screenshot and retry.
- Open a step's panel and use its **Next / Previous** arrows to walk the workflow in
  order. They follow only the first path of each branch; click the other branches'
  first step on the canvas. Scroll from the panel's margin, or the scroll moves the code
  box instead.
- Custom Code sits in a cross-origin iframe, so page JavaScript can't read it. Expand the
  panel and read the code from zoomed screenshots, a screen at a time.
- A workflow with **no trigger** is often a sub-workflow started by "Add to Workflow"
  elsewhere. Don't call it broken, and when a name is ambiguous, ask for the workflow URL
  instead of guessing.
- The canvas zoom buttons can stop responding after a panel closes; use the minimap or
  drag.

### Confirm who built it

Check each workflow's **Created by / Updated by** and its **Version history**. Live code
is sometimes a teammate's later version. Show the user the split and ask which version
to publish (for example "my build plus the teammate's proven fixes"). Never publish a
teammate's code as the user's.

### Prove it ran before building

- GoHighLevel: the workflow list's **Total enrolled** column. 0 means it never ran.
  Execution logs and email stats are the second check.
- Apps Script: the project's **Triggers** and **Executions** pages.
- HubSpot: the workflow's enrollment history and action logs.
- If it never ran, ask before building. Options: skip, or publish with a status banner
  at the top of the README ("built and tested, never used with real members"). Ask each
  time; don't assume an earlier answer carries over.
- If the source would need a long hunt (a huge doc, dozens of panels), say so and ask
  first.

### Check what's already published

Diff the new idea against existing repos before starting. If most of it is already
published, add the new piece to that repo as a new step instead of creating a
near-duplicate.

## 2. Remove everything that identifies the employer

The repo is public. **Nothing from the employer goes in it.** Vendors (HubSpot, Stripe,
GoHighLevel, Meta, Google and so on) may be named.

| Remove | Replace with |
|---|---|
| Company, brand, product and offer names, prices | "your offer", generic amounts |
| Portal, account, dataset, pixel, ad account, conversion, object and workflow ids | `2-12345678`, `1234567890`, `REPLACE_WITH_...` |
| Company domains | `example.com`, `your-community.example.com` |
| Staff names | "your team", "the rep" |
| Real contacts, emails, phones | `you@example.com`, `555-01xx` numbers, obviously fake names |
| Personal info: attendees, callers, client or brand folder names, `C:\Users\<name>` paths, business emails | Nothing, or a placeholder |
| Secrets, tokens and keys, even expired ones | Placeholder and secret name only; never in code |
| Real production numbers | Only rounded ratios that name no one (e.g. "8.0x → 1.02x") |
| Build timelines: audit-log dates, "on Aug 6 we built...", who built what when | Nothing. Use that history only to get the steps right. General lessons ("a first attempt did X; don't") are fine. |

The author credit is the one exception: `Author: <Your Name>` in header comments and a
`Built by [<Your Name>](https://github.com/<your-github-user>).` line in the README.

Set the commit email in each new repo:
`git config user.email <id>+<your-github-user>@users.noreply.github.com`.

Keep ported code identical to the working version except for config values and
comments. **Never run a ported script until its placeholders are in.** The original
reads the user's real token, so a failed edit followed by a test run calls the live
account (this once dumped real ad data into a repo folder). To avoid it:
- Make the edit script assert every replacement.
- Write it to a scratch file, or use the Edit tool. Windows paths like `C:\Users` in
  inline Python strings fail with a `\U` unicode-escape error.
- Grep that no real id is left.
- Test with a throwaway home folder (`HOME=/tmp/nohome USERPROFILE=/tmp/nohome`) so no
  token can be found.
- If anything live does run, delete its output and tell the user.

**Publish only what the user actually built and ran.** Don't write new tools, CLIs or
helper scripts and present them as part of the integration. Setup helpers (a
property-creation or schema script) are fine only when the README labels them as
optional shortcuts for steps it also explains by hand. A script written in a build
session doesn't count as run: look for its output in the transcript or the screenshots
before including it.

Freeze `Date.now` in tests so fixtures don't go stale, and use made-up timestamps and
ids in fixtures, never ones copied from real payloads.

## 3. Write the README to the click-by-click standard

Follow [reference/readme-standard.md](reference/readme-standard.md) exactly. In short:

- **Why it exists** states the whole problem: what the platform can't do natively and
  what the vendor confirmed. It is not a one-line summary.
- **Setup, step by step:** numbered steps with lettered sub-steps and the exact on-screen
  wording. Every step includes:
  - "About N minutes"
  - a table of every input and every output
  - "delete the sample code and paste in **all** of [`path/file.js`](path/file.js)",
    naming the repo file **as a link, in that step**. The link goes where the reader
    pastes it, never only in one big table elsewhere. When there are several modules or
    files, give each its own sub-step that links its own files. The "What's in this
    repo" table links folders only.
  - Test action, with what success looks like
  - ⚠️ traps from production
  - a closing ✅ **Check:**
- Where a label couldn't be confirmed from a screenshot, write "(wording may differ)".
  Never invent a quote.
- The bar is the build chats themselves, not an earlier README.

## 4. Verify before committing

Run every check; don't skip any:

1. **Tables match the code.** List the code's inputs and outputs with grep, for example
   `grep -o "inp\.\w*"`, `inputFields`, `outputFields` and the status strings. Diff them
   against the README tables. Also check every script name, npm script, function and
   file the README mentions.
2. **Cross-references.** After renumbering steps, fix the table-of-contents anchors and
   every "Step N" reference in Troubleshooting and other sections.
3. **Tests:** `npm test` (or the repo's test command) must pass. Report the counts.
4. **Sanitize scan** (set `GUIDE_DENYLIST` to your denylist file first):
   ```bash
   bash ~/.claude/skills/github-guide-repo/scripts/sanitize-scan.sh <repo-dir>
   ```
   Runs [`scripts/sanitize-scan.sh`](scripts/sanitize-scan.sh). Every hit must be fixed
   or be a deliberate placeholder you can explain. Read the domain list by eye. If this
   build introduced a new identifier, add it to your denylist.
5. **Code-file links:** every backticked repo path must be a link, and no relative link
   may be broken:
   ```bash
   python ~/.claude/skills/github-guide-repo/scripts/link-check.py <repo-dir>
   python ~/.claude/skills/github-guide-repo/scripts/link-check.py --fix <repo-dir>
   ```
   Runs [`scripts/link-check.py`](scripts/link-check.py). The first run reports, `--fix`
   wraps the mentions as links. It skips code fences and HTML comments and only touches
   paths that exist. It misses bare file names inside a folder, so link those by hand.

   Then check that each file is linked **in the step that uses it**:
   ```bash
   python ~/.claude/skills/github-guide-repo/scripts/step-link-audit.py <repo-dir>
   ```
   Runs [`scripts/step-link-audit.py`](scripts/step-link-audit.py). Every `NOLINK` row
   is a step that pastes, runs or edits the file without linking it. A script that
   appears only in a command block gets a line under the block, indented to match if the
   block sits in a list: ``Runs [`scripts/x.mjs`](scripts/x.mjs).`` Check matches by
   hand: `npm run send` also matches `npm run send-batch`, and "Next: npm run x" in
   console *output* is not a command.
6. When splicing drafts, anchor on headings at the **start of a line**
   (`'\n## Heading'`). Drafts often quote the headings inside an HTML comment, and a
   plain `index()` matches the comment instead.

## 5. Commit and push

- **New repo:** push only when the user says to. Create it with
  ```bash
  gh repo create <your-github-user>/<slug> --public --source . --push --description "<one line>"
  ```
  Take the slug from the title the user gives: kebab-case, specific to one integration.
  Fix obvious typos and say you did.
- **Update to an existing repo** the user asked to fix: commit and `git push`.
- Commit messages say what changed for a reader.
- **License:** ask the user. Sharing work material on a personal account may need the
  employer's approval; raise it once, then follow their decision.
- One integration per repo. A different feature of the same platform gets its own repo.
- **Series.** Related repos stay separate but link each other: every member's README
  ends with the same **Related repos** table. Fill in the `SERIES` list in
  [`scripts/series-links.py`](scripts/series-links.py) and run it; it rewrites the
  section in every published member. When a member is published, drop its "(coming)"
  and push them all. Also `grep -rn <old-slug>` the other repos for prose links and code
  comments that point at a member, and repoint them when a topic moves.
- **Splitting a repo:**
  - Slice the README by headings at the start of a line, renumber the steps and their
    lettered sub-steps (`**4a.**` becomes `**2a.**`), and fix every "Step N" reference.
  - Turn references to steps that moved into links to the other repo's anchors.
  - Split shared tests. A cross-repo check, such as both files using the same cookie
    name, gets pinned to the literal value in each repo.
  - Copy files to the new repo first, then `git rm` them from the old one.
  - Update the old repo's description (`gh repo edit ... --description`), the series
    table and the "Built by" line in both repos.

## 6. After the push

- Update the repo list: move a new repo from the candidates into **Already created**, or
  note what changed. **Re-read it first**; other sessions may have added rows. Don't
  hard-code a count; read it and increment it, and never remove rows you didn't write.
  - A row the user skips stays in the candidates with **Skipped <date> (user).** and the
    reason, so it isn't offered again.
  - A row merged into an existing repo gets an "(update)" line and doesn't raise the
    count.
- Report to the user in plain language:
  - the full repo URL, and a link to the repo list
  - what the guide covers
  - test results and the scan result
  - labels you couldn't confirm
  - any **live** defects found in the working version along the way. Report them;
    don't fix them only in the public repo. Fixing one in production is a live change:
    ask first.
