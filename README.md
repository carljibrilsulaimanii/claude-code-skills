<!--
  README.md -- claude-code-skills
  Author:  Jibril Sulaiman
  Date:    2026-10-14 (updated 2026-10-20)
  Lives:   Repo root (GitHub).
  What:    Claude Code skills for publishing integration guides, filing tasks,
           checking funnels, reconciling ad-platform conversions against a CRM,
           auditing UTM attribution from ad click to purchase,
           running an ad pipeline from research to measurement,
           coaching a car purchase, and turning a TikTok or Instagram
           creator's posts into a skill.
  Why:     Each skill came out of repeated real work; written down once, Claude
           follows the same rules every time instead of being corrected again.
-->

# Claude Code skills

[Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills) are folders
with a `SKILL.md` that Claude Code loads when a task matches the skill's description.
These are the ones I use most, with everything specific to my employer removed.

## Skills

| Skill | What it does |
|---|---|
| [`skills/github-guide-repo/`](skills/github-guide-repo/) | Turns an integration you built into a public, sanitized GitHub guide repo: gathering the build chats, screenshots and live code, removing everything that identifies the employer, a click-by-click README standard, and scripts that check links and scan for leaks before the push |
| [`skills/asana-task/`](skills/asana-task/) | Writes Asana tasks a teammate can pick up cold: which project and owner, a fixed description layout with numbered steps and code blocks at the bottom, and the `html_notes` tags Asana accepts and rejects |
| [`skills/hubspot-funnel-qa/`](skills/hubspot-funnel-qa/) | Builds, self-checks and audits HubSpot funnel pages against a spec doc: a 40-entry defect catalogue (mostly clone residue and the hidden second module set), a full checklist, Stripe payment-link checks, a multi-page console crawler with a desktop-vs-mobile diff, and a page-by-page punch-list template |
| [`skills/meta-pixel-crm-reconcile/`](skills/meta-pixel-crm-reconcile/) | Reconciles Meta pixel and Conversions API events with HubSpot records (Purchase vs succeeded payments, Lead vs registrations) using matched windows and a three-way comparison, and explains each gap: duplicate senders, browser vs server, inflated CRM records |
| [`skills/hubspot-stripe-utm-qa/`](skills/hubspot-stripe-utm-qa/) | Finds where a UTM was lost between the ad click and the purchase record in a HubSpot + Stripe setup, proves it with a test, and fixes it without overwriting real captures: what each first / last touch field should mean, eleven repeatable leak tests, a simulate-then-deploy playbook with the HubSpot UI and rate-limit traps, and a one-command live audit script ([`utm_audit.py`](skills/hubspot-stripe-utm-qa/scripts/utm_audit.py)) |
| [`skills/ad-creation-management/`](skills/ad-creation-management/) | Runs one offer's paid-social ads through five gated stages that share one Campaign Blueprint: research and positioning into a 50-angle Creative Mosaic, writing hooks, copy and scripts, making static and video creative, launching on Meta (delivery statuses, learning phase, the optimization-event fields people misread), and measuring on purchases rather than leads so the results pick the next round's angles |
| [`skills/car-buying-coach/`](skills/car-buying-coach/) | Coaches you through buying or leasing a car one decision at a time and drafts the texts and emails you send dealerships: getting quotes, out-the-door pricing, financing and F&I add-ons, trade-ins and dealer tactics. Distilled from about 1,400 videos by a former dealership salesperson and finance manager (see [`pipelines/tiktok-to-skill/`](pipelines/tiktok-to-skill/)) |
| [`skills/tiktok-ig-to-skill/`](skills/tiktok-ig-to-skill/) | Turns a TikTok or Instagram creator's posts into a Claude skill, the same way car-buying-coach was built: downloads the whole profile (yt-dlp for TikTok, gallery-dl for Instagram), transcribes it locally ([`transcribe_all.py`](skills/tiktok-ig-to-skill/scripts/transcribe_all.py)), slices the corpus evenly across the timeline for parallel distilling ([`slice_corpus.py`](skills/tiktok-ig-to-skill/scripts/slice_corpus.py)), writes the skill from a proven skeleton, and packages it for upload ([`package_skill.py`](skills/tiktok-ig-to-skill/scripts/package_skill.py)) |

## Use a skill in claude.ai and the phone app

[`bundles/`](bundles/) has skills zipped for upload:
[`car-buying-coach.skill`](bundles/car-buying-coach.skill) and
[`tiktok-ig-to-skill.skill`](bundles/tiktok-ig-to-skill.skill). In claude.ai go to
**Settings** → **Capabilities** → **Skills** → **Upload skill**, pick the file, and
turn it on. It then works on the web, desktop and mobile apps under the same account.

tiktok-ig-to-skill downloads and transcribes on your own computer, so run it in
Claude Code. In claude.ai and on the phone it can still plan the build and write the
skill from transcripts you upload.

## Build a skill from a creator's videos

Use [`skills/tiktok-ig-to-skill/`](skills/tiktok-ig-to-skill/): ask Claude Code to
"make a skill from @handle's TikToks" and it runs every step.
[`pipelines/tiktok-to-skill/`](pipelines/tiktok-to-skill/) is the original manual
write-up of how the car buying coach was made: download a whole TikTok profile with
yt-dlp, transcribe every clip locally with faster-whisper
([`transcribe_all.py`](pipelines/tiktok-to-skill/transcribe_all.py)), then have Claude
distill the transcripts into a skill. The videos and transcripts
are not in this repo.

## Install

Copy a skill folder into your user skills folder (all projects) or a project's
`.claude/skills/` folder (that project only).

macOS or Linux:

```bash
cp -r skills/github-guide-repo ~/.claude/skills/
```

Windows (PowerShell):

```powershell
Copy-Item -Recurse skills\github-guide-repo "$HOME\.claude\skills\"
```

Start a new Claude Code session. Ask for the task in plain words ("make a guide repo for
the Stripe webhook integration") and the skill loads itself, or call it by name with
`/github-guide-repo`.

## Set up github-guide-repo

1. Fill in the table in section 0 of [`SKILL.md`](skills/github-guide-repo/SKILL.md):
   your GitHub user, guides folder, repo list and author credit.
2. Copy [`denylist.example.txt`](skills/github-guide-repo/scripts/denylist.example.txt)
   to a private place such as `~/.config/guide-denylist.txt` and replace the examples
   with your employer's names, domains, account ids and teammates. Never commit the
   filled-in copy.
3. Set these before running
   [`sanitize-scan.sh`](skills/github-guide-repo/scripts/sanitize-scan.sh):

   ```bash
   export GUIDE_DENYLIST=~/.config/guide-denylist.txt
   export GUIDE_AUTHOR='your name|yoursurname'
   export GUIDE_GITHUB_USER=your-github-user
   ```

The scripts need Bash (Git Bash on Windows) and Python 3.

## Scripts (github-guide-repo)

| Script | What it checks |
|---|---|
| [`sanitize-scan.sh`](skills/github-guide-repo/scripts/sanitize-scan.sh) | Denylist names, the author's name outside credit lines, secrets and tokens, long numeric ids, real emails and phones, every domain, and unpushed commits |
| [`link-check.py`](skills/github-guide-repo/scripts/link-check.py) | Repo file paths named in a README without a link; `--fix` adds the links |
| [`step-link-audit.py`](skills/github-guide-repo/scripts/step-link-audit.py) | Code files that a setup step uses without linking |
| [`series-links.py`](skills/github-guide-repo/scripts/series-links.py) | Rewrites one shared "Related repos" table across a series of repos from a JSON config |

---

Built by [Jibril Sulaiman](https://github.com/carljibrilsulaimanii).
