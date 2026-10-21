# Pipeline: TikTok profile → transcripts → Claude skill

> These steps are now a skill: [`skills/tiktok-ig-to-skill/`](../../skills/tiktok-ig-to-skill/).
> It also covers Instagram, corpus slicing and packaging. This page stays as the
> record of how car-buying-coach was built.

This is how the skill in [`skills/car-buying-coach/`](../../skills/car-buying-coach/) was built. About 1,400 short
videos from one car-negotiation creator were downloaded, transcribed locally, and
distilled into a skill. The videos and transcripts are not in this repo.

## 1. Install the tools (Windows)

```powershell
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
pip install faster-whisper
```

Open a new terminal afterwards so `yt-dlp` and `ffmpeg` are on your PATH.

## 2. Download every video on the profile

TikTok blocks anonymous bulk requests, so yt-dlp needs your browser's cookies.
Export them for `tiktok.com` to `cookies.txt` with a cookies.txt browser extension,
or use `--cookies-from-browser chrome` (Chrome must be closed for that).

```powershell
mkdir videos; cd videos
yt-dlp --cookies ..\cookies.txt --download-archive seen.txt `
  -o "%(upload_date)s-%(id)s.%(ext)s" `
  "https://www.tiktok.com/@<creator-handle>"
```

- `--download-archive seen.txt` makes it resumable. Rerun the same command after
  any error and it skips what you already have.
- File names come out as `YYYYMMDD-<videoid>.mp4`, so they sort by date.
- Leftover `.part` files are interrupted downloads. Rerunning picks them up.

## 3. Transcribe everything locally

```powershell
python <path-to-repo>\pipelines\tiktok-to-skill\transcribe_all.py --src . --model small
```

- Writes `transcripts\<name>.txt` and `.srt` per clip, plus one combined
  `_ALL_TRANSCRIPTS.txt`.
- Resumable: clips that already have a `.txt` are skipped. Ctrl+C is safe.
- Runs on CPU (int8). To go faster, split the work across terminals:

  ```powershell
  python transcribe_all.py --src . --of 4 --shard 0 --threads 2
  python transcribe_all.py --src . --of 4 --shard 1 --threads 2
  # ...shard 2 and 3 in two more terminals
  ```

  `--model base` is faster and slightly less accurate. `--beam 5` is more
  accurate and slower.

## 4. Turn the transcripts into a skill

Point Claude Code at the `transcripts` folder and ask it to use the
`skill-creator` skill to build a skill from the method the creator teaches.
That produced:

- `SKILL.md`: the core method, the order of decisions, and how to coach.
- `references/*.md`: topic files Claude loads only when needed (pricing, getting
  quotes, financing and F&I, trade-ins, dealer tactics, message templates).

Keep the skill in your own words. Distill the method; don't paste transcripts in.
