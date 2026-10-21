"""
Zip a skill folder into <name>.skill for upload at claude.ai -> Settings ->
Capabilities -> Skills. Uses forward-slash paths (Compress-Archive on Windows
writes backslashes, which the upload rejects) and checks the frontmatter first.

Usage:
    python package_skill.py path\\to\\my-skill
    python package_skill.py path\\to\\my-skill --out dist
"""

import argparse
import re
import sys
import zipfile
from pathlib import Path

SKIP = {"__pycache__", ".git", ".DS_Store"}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("skill_dir", help="Folder containing SKILL.md")
    ap.add_argument("--out", default=None, help="Output folder (default: next to the skill)")
    args = ap.parse_args()

    skill = Path(args.skill_dir).resolve()
    md = skill / "SKILL.md"
    if not md.is_file():
        print(f"ERROR: no SKILL.md in {skill}")
        return 1

    head = md.read_text(encoding="utf-8-sig")
    m = re.match(r"---\s*\n(.*?)\n---", head, re.S)
    if not m:
        print("ERROR: SKILL.md has no --- frontmatter block")
        return 1
    name = re.search(r"^name:\s*(\S+)", m.group(1), re.M)
    if not name or not re.search(r"^description:", m.group(1), re.M):
        print("ERROR: frontmatter needs both name: and description:")
        return 1
    if name.group(1) != skill.name:
        print(f"WARNING: name '{name.group(1)}' doesn't match folder '{skill.name}'")

    out_dir = Path(args.out).resolve() if args.out else skill.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    target = out_dir / f"{skill.name}.skill"

    files = [p for p in sorted(skill.rglob("*"))
             if p.is_file() and not SKIP.intersection(p.relative_to(skill).parts)]
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, p.relative_to(skill.parent).as_posix())

    print(f"Wrote {target} ({len(files)} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
