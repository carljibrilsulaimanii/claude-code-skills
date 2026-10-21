"""
Size up a folder of per-clip transcripts and split it into date-ordered slice
files, one per distilling subagent.

If the corpus is bigger than slices x words-per-slice, clips are sampled evenly
across the whole timeline (every k-th clip), so early and late videos are both
represented.

Usage:
    python slice_corpus.py --src transcripts
    python slice_corpus.py --src transcripts --slices 6 --words-per-slice 40000
"""

import argparse
import math
import sys
from pathlib import Path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="Folder of per-clip .txt transcripts")
    ap.add_argument("--out", default=None, help="Output folder (default: <src>/../slices)")
    ap.add_argument("--slices", type=int, default=8, help="Number of slice files")
    ap.add_argument("--words-per-slice", type=int, default=50000,
                    help="Word budget per slice; over budget, clips are sampled")
    ap.add_argument("--min-words", type=int, default=15,
                    help="Skip clips shorter than this (music-only, no speech)")
    args = ap.parse_args()

    src = Path(args.src)
    files = sorted(p for p in src.glob("*.txt") if not p.name.startswith("_"))
    if not files:
        print(f"No per-clip .txt files in {src}")
        return 1

    clips = []
    for p in files:
        text = p.read_text(encoding="utf-8", errors="replace").strip()
        n = len(text.split())
        if n >= args.min_words:
            clips.append((p.stem, text, n))

    total_words = sum(n for _, _, n in clips)
    budget = args.slices * args.words_per_slice
    stride = max(1, math.ceil(total_words / budget))
    picked = clips[::stride]

    print(f"Transcript files : {len(files)}")
    print(f"With speech      : {len(clips)} (>= {args.min_words} words)")
    print(f"Total words      : {total_words:,}")
    if clips:
        print(f"Date range       : {clips[0][0][:8]} .. {clips[-1][0][:8]}")
    if stride > 1:
        print(f"Over budget      : sampling every {stride} clips -> {len(picked)} clips")

    out = Path(args.out) if args.out else src.parent / "slices"
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("slice-*.txt"):
        old.unlink()

    per = math.ceil(len(picked) / args.slices)
    print(f"\n{'slice':<14}{'clips':>6}{'words':>10}  range")
    for i in range(args.slices):
        chunk = picked[i * per:(i + 1) * per]
        if not chunk:
            break
        path = out / f"slice-{i + 1:02d}.txt"
        with path.open("w", encoding="utf-8") as fh:
            for stem, text, _ in chunk:
                fh.write(f"===== {stem} =====\n{text}\n\n")
        words = sum(n for _, _, n in chunk)
        print(f"{path.name:<14}{len(chunk):>6}{words:>10,}  {chunk[0][0][:8]}..{chunk[-1][0][:8]}")

    print(f"\nSlices in: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
