# Downloading a whole profile

Make one folder per creator, `cd` into it, and keep `cookies.txt` **outside**
it (one level up) so it can't get swept into a zip or a repo.

## Cookies

Both platforms block anonymous bulk downloads. Two options:

1. **cookies.txt file (most reliable).** Log in to the site in the browser,
   export cookies for that domain with a "Get cookies.txt" extension, save as
   `..\cookies.txt`. Re-export if downloads start failing with login or 403
   errors; sessions expire.
2. **Straight from the browser.** `--cookies-from-browser chrome` (or `edge`,
   `firefox`). Chrome has to be completely closed, or it fails with a
   "could not copy cookie database" error.

The cookies file is the user's live login. Don't open it, print it, or move it
into the working folder.

## TikTok: yt-dlp

```powershell
yt-dlp --cookies ..\cookies.txt `
  --download-archive seen.txt `
  -o "%(upload_date)s-%(id)s.%(ext)s" `
  --write-info-json `
  "https://www.tiktok.com/@handle"
```

- `--download-archive seen.txt`: resumable. Rerun the same command after any
  crash and it continues where it stopped.
- File names come out as `YYYYMMDD-<id>.mp4`, which sort by date and keep the
  timeline that `slice_corpus.py` relies on.
- `--write-info-json` saves the caption and stats next to each video. Optional,
  but the caption sometimes holds the key point.
- `.part` files are interrupted downloads. Rerunning finishes them.
- Errors on single items ("Unable to extract", "Requested format is not
  available") are normal for a few clips, and photo slideshows often fail.
  Ignore them unless most items fail.
- Everything failing: run `yt-dlp -U` (TikTok changes often), then refresh
  cookies.
- To grab a range only: `--dateafter 20250101` or `--playlist-end 300`.

## Instagram: gallery-dl

yt-dlp's Instagram *profile* extractor is unreliable, so use gallery-dl for
whole profiles:

```powershell
gallery-dl --cookies ..\cookies.txt `
  --download-archive ig-archive.sqlite3 `
  -D . `
  -f "{date:%Y%m%d}-{post_shortcode}-{num}.{extension}" `
  --filter "extension == 'mp4'" `
  --write-metadata `
  "https://www.instagram.com/handle/reels/"
```

- `/reels/` gets only reels. Use `https://www.instagram.com/handle/` to include
  feed videos. The `--filter` drops photos, which have no audio.
- `--write-metadata` keeps each caption as JSON. For creators who teach in
  carousel captions rather than on camera, drop the `--filter` and use the
  captions as the corpus instead.
- Instagram rate-limits hard. If it starts returning 401/429, stop, wait an
  hour, and rerun. The archive file makes that safe. Add `--sleep-request 2-5`
  for big profiles.
- Errors on everything: `pip install -U gallery-dl`, then refresh cookies.

**Fallback for either platform:** put post URLs one per line in `urls.txt` and
run `yt-dlp --cookies ..\cookies.txt --download-archive seen.txt -o "%(upload_date)s-%(id)s.%(ext)s" -a urls.txt`.
Single-post downloads work on both platforms even when profile listing breaks.

## When it's done

```powershell
(Get-ChildItem *.mp4).Count
"{0:N1} GB" -f ((Get-ChildItem *.mp4 | Measure-Object Length -Sum).Sum / 1GB)
```

Compare the count against the post count on the profile. Within ~5% is fine.
