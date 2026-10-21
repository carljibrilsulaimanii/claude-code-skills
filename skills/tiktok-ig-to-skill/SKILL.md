---
name: tiktok-ig-to-skill
description: >-
  Turn a TikTok or Instagram creator's posts into a Claude skill: download every
  video on the profile with yt-dlp or gallery-dl, transcribe them locally with
  faster-whisper, distill the method the creator teaches, write SKILL.md plus
  topic references, and package it for Claude Code and claude.ai (web, desktop
  and phone). Use whenever the user wants to "make a skill from this TikTok /
  Instagram / reels account", learn everything a creator teaches, download a
  whole profile and transcribe it, or rebuild or extend a skill made this way
  (like car-buying-coach). Not for downloading one video to watch, or for
  reposting someone else's content.
---

# TikTok / Instagram posts → Claude skill

This is the process that built `car-buying-coach`: about 1,400 TikToks from a
former car salesperson, downloaded overnight, transcribed on a laptop CPU, and
distilled into a skill that coaches a car purchase and drafts the dealer
messages. The same steps work for any creator who teaches a repeatable method
(negotiation, fitness programming, cooking technique, sales scripts, tax tips).

The output is a **skill in your own words** that captures the creator's method.
The videos and transcripts are inputs; they stay on the user's machine and never
go into the skill or a repo.

## 0. Scope it first

Before downloading anything, get from the user:

| Ask | Why it matters |
|---|---|
| Profile URL or @handle, and platform | Picks the downloader |
| What the skill should *do* for them (coach, draft messages, plan, answer questions) | Shapes SKILL.md; "know everything" is not a job |
| Where the skill should run: Claude Code, claude.ai / phone, or both | Decides packaging |
| Working folder (default `Downloads\<topic>`) | Media is often 20–40 GB |

Check free disk space (`Get-PSDrive C`). Roughly 25 MB per short video.

## 1. Install the tools (once)

```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
pip install -U faster-whisper gallery-dl
```

Open a new terminal afterwards so the new commands are on PATH. If `yt-dlp` is
"not recognized", that's the reason.

## 2. Download the profile

Both platforms need the user's logged-in cookies. The user exports them to
`cookies.txt` with a cookies.txt browser extension, or yt-dlp reads them with
`--cookies-from-browser chrome` (Chrome must be fully closed). **Never** read,
print, copy or commit the cookies file yourself; it is the user's login.

Full commands, flags and fixes for each platform are in
[`references/download.md`](references/download.md). The short version:

- **TikTok:** `yt-dlp` on `https://www.tiktok.com/@handle` with
  `--download-archive seen.txt` and `-o "%(upload_date)s-%(id)s.%(ext)s"`.
- **Instagram:** `gallery-dl` on `https://www.instagram.com/handle/reels/`
  (yt-dlp's Instagram profile support is unreliable; it's fine for single URLs).

Downloads take hours for big profiles. Have the **user** run them in their own
terminal (they can watch it and re-run on errors), or run it yourself in the
background. They're resumable: rerunning skips what the archive file lists.

## 3. Transcribe everything locally

Use [`scripts/transcribe_all.py`](scripts/transcribe_all.py). It's resumable,
skips clips that already have a `.txt`, and writes `.txt` and `.srt` per clip plus
one `_ALL_TRANSCRIPTS.txt`.

```powershell
python <skill-dir>\scripts\transcribe_all.py --src <videos-folder> --model small
```

On CPU, `small` handles roughly one short clip every 5–15 seconds. To go
faster, run shards in parallel terminals (`--of 4 --shard 0..3 --threads 2`), or
drop to `--model base`. Check `transcripts\_errors.log` afterwards; a handful of
failures doesn't matter.

## 4. Size up the corpus and slice it

```powershell
python <skill-dir>\scripts\slice_corpus.py --src <videos-folder>\transcripts --slices 8
```

This prints clip and word counts and writes `slices\slice-01.txt…` in date
order. Over budget (default 50k words per slice), it samples clips evenly
across the whole timeline, so early and late videos are both represented.
Short-form creators repeat themselves a lot. A well-spread sample of a
million-word corpus captures the method; reading only the first few hundred
clips does not.

Read 200–300 lines of one slice yourself first to judge transcript quality and
learn the creator's vocabulary.

## 5. Distill

Send one subagent per slice, in parallel, each with the same brief:

> Read `<slice file>`. Extract the creator's **method**, not a summary of videos:
> core principles, the steps in order, decision rules ("if X, do Y"), specific
> numbers and thresholds, scripts or exact phrasings they recommend, mistakes they
> warn about, and myths they debunk. Note contradictions or advice that changed
> over time (later clips win). Write it in your own words, grouped by topic, and
> don't quote more than a few words verbatim. Return markdown.

Then synthesize the notes yourself:

1. Find the **one idea everything rests on**: the frame the creator keeps
   coming back to.
2. Lay out the **arc**: the order a person goes through the process.
3. Group the details into 4–7 **topics**. Each one becomes a reference file.
4. Pull out the **house style** (if the skill writes messages or scripts) and
   the **things to steer the user away from**.
5. Resolve conflicts: prefer the more recent and more often repeated advice.

## 6. Write the skill

Follow the skeleton in [`references/skill-template.md`](references/skill-template.md),
which is the shape `car-buying-coach` uses: a lean `SKILL.md` (under ~250 lines)
for the frame, how to coach, the arc and the house style, with depth in
`references/*.md` loaded only when the moment needs it.

Rules:

- **Your words, not theirs.** Distill and restructure. No pasted transcripts, no
  long quotes, and don't name the creator in a skill meant to be shared.
- **Numbers are rules of thumb.** Prices, rates and laws drift, so say so.
- **Write a pushy description.** List the real phrases a user would say, so the
  skill triggers when it should.
- For finance, legal or medical topics, frame it as education that helps the
  user decide, not advice.

## 7. Package and install

- **Claude Code:** copy the skill folder to `%USERPROFILE%\.claude\skills\`.
- **claude.ai, desktop and phone:** build a `.skill` zip with
  [`scripts/package_skill.py`](scripts/package_skill.py), then have the user upload
  it at claude.ai → Settings → Capabilities → Skills → Upload skill. It syncs to
  the phone app on the same account.

```powershell
python <skill-dir>\scripts\package_skill.py <path>\my-skill
```

(Use this script rather than `Compress-Archive`, which writes backslash paths
that claude.ai rejects.)

## 8. Test it

Start a fresh session and ask three realistic questions in the user's own
words, at different stages of the arc. Check that the skill triggers, loads the
right reference, and gives the creator's method rather than generic advice. Fix
the description or the references table if not.

## 9. Publishing (only if the user asks)

The skill folder can go in a public repo. The media, transcripts, slices,
`seen.txt` and cookies never do. Add them to `.gitignore` before the first commit.
