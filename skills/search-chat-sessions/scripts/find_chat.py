"""
find_chat.py
Author:  Jibril Sulaiman (with Claude Code)
Date:    2026-11-18 (ET)
Deploy:  Part of the search-chat-sessions skill (scripts/find_chat.py). Run with Python 3:
         python -I find_chat.py <word groups...> [options]
What:    Finds the Claude Code session where something was asked, decided or built. Reads every
         record in every session transcript under ~/.claude/projects: typed messages, messages
         sent mid-turn (queued), artifact comments, Claude's replies and tool results. Ranks
         sessions by matches in what the user wrote, then by matches in Claude's replies.
Why:     A search that read only typed user messages, and looked for the user's later wording
         ("migrate"), missed the chat. The request had been sent mid-turn, which transcripts
         store as a queued command rather than a user message, and it used different words
         ("Google Sheet logs should be setup as custom objects").

Usage:
  Each positional argument is one word group. Inside a group, | separates alternatives.
  A match needs every group (AND), all within --near characters of each other.
  Groups are case-insensitive regular expressions.

  python -I find_chat.py "sheets?" "custom objects?|hubspot objects?"
  python -I find_chat.py "impostor|scam account" --who user
  python -I find_chat.py --titles "ghl|gohighlevel"
  python -I find_chat.py "reit" "object" --days 30 --exclude 1a2b3c4d

Options:
  --near N      max distance in characters between the groups (default 400; 0 = same message)
  --who X       all | user | claude   (default all)
  --days N      only sessions changed in the last N days (default 180)
  --exclude ID  leave out a session (id prefix); repeatable. Use it for the current session.
  --titles      list sessions whose title matches the groups, with dates, and stop
  --show N      snippets per session (default 3)
  --top N       sessions to list (default 12)
"""
import argparse, glob, json, os, re, sys, time

PROJECTS = os.path.expanduser("~/.claude/projects")

AGENT_MARKERS = ("[Subagent hand-back]", "Another Claude session sent a message",
                 "<agent-message", "<task-notification")
SYSTEM_PREFIXES = ("Base directory for this skill", "<system-reminder>", "This session is being continued",
                   "<command-name>", "<local-command")


def label_user_text(txt, base):
    if any(m in txt[:600] for m in AGENT_MARKERS):
        return "agent report"
    if txt.lstrip().startswith(SYSTEM_PREFIXES):
        return "system"
    if txt.startswith("[Artifact comment"):
        return "user (artifact comment)"
    return base


def texts_from(rec):
    """Yield (who, text) for each readable piece of text in one transcript record."""
    t = rec.get("type")
    if t == "queue-operation":
        c = rec.get("content")
        if isinstance(c, str) and c.strip():
            yield label_user_text(c, "user (sent mid-turn)"), c
        return
    if t == "attachment":
        a = rec.get("attachment") or {}
        p = a.get("prompt")
        if isinstance(p, str) and p.strip():
            yield label_user_text(p, "user (sent mid-turn)"), p
        return
    if t not in ("user", "assistant"):
        return
    content = (rec.get("message") or {}).get("content")
    if isinstance(content, str):
        yield (label_user_text(content, "user") if t == "user" else "claude"), content
        return
    for part in content or []:
        if not isinstance(part, dict):
            continue
        if part.get("type") == "text":
            txt = part.get("text", "")
            yield (label_user_text(txt, "user") if t == "user" else "claude"), txt
        elif part.get("type") == "tool_result":
            c = part.get("content")
            if isinstance(c, list):
                c = " ".join(x.get("text", "") for x in c if isinstance(x, dict))
            if isinstance(c, str):
                yield "tool result", c


def near_match(txt, pats, near):
    """Return the start index of a window where every pattern matches, or None."""
    first = [m.start() for m in pats[0].finditer(txt)]
    if not first:
        return None
    if near <= 0:
        return first[0] if all(p.search(txt) for p in pats[1:]) else None
    for s in first:
        lo, hi = max(0, s - near), s + near
        win = txt[lo:hi]
        if all(p.search(win) for p in pats[1:]):
            return s
    return None


def session_meta(f):
    title, first_ts, last_ts = None, None, None
    for line in open(f, encoding="utf-8", errors="ignore"):
        if '"custom-title"' in line:
            try:
                title = json.loads(line).get("customTitle") or title
            except Exception:
                pass
        m = re.search(r'"timestamp":"([^"]+)"', line)
        if m:
            first_ts = first_ts or m.group(1)
            last_ts = m.group(1)
    return title, first_ts, last_ts


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # Windows consoles default to cp1252
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("groups", nargs="+")
    ap.add_argument("--near", type=int, default=400)
    ap.add_argument("--who", choices=["all", "user", "claude"], default="all")
    ap.add_argument("--days", type=int, default=180)
    ap.add_argument("--exclude", action="append", default=[])
    ap.add_argument("--titles", action="store_true")
    ap.add_argument("--show", type=int, default=3)
    ap.add_argument("--top", type=int, default=12)
    args = ap.parse_args()
    pats = [re.compile(g, re.I) for g in args.groups]
    cutoff = time.time() - args.days * 86400
    files = [f for f in glob.glob(os.path.join(PROJECTS, "*", "*.jsonl"))
             if os.path.getmtime(f) >= cutoff
             and not any(os.path.basename(f).startswith(x) for x in args.exclude)]

    if args.titles:
        rows = []
        for f in files:
            title, a, b = session_meta(f)
            if title and all(p.search(title) for p in pats):
                rows.append((b or "", title, os.path.basename(f)[:-6], a or ""))
        for b, title, sid, a in sorted(rows, reverse=True):
            print(f"{title}  [{sid}]  {a[:10]} to {b[:10]}")
        if not rows:
            print("No session title matched.")
        return

    results = []
    for f in files:
        title, first_ts, last_ts = None, None, None
        user_hits, claude_hits, other_hits = 0, 0, 0
        snippets, seen = [], set()
        for line in open(f, encoding="utf-8", errors="ignore"):
            try:
                rec = json.loads(line)
            except Exception:
                continue
            if rec.get("type") == "custom-title":
                title = rec.get("customTitle") or title
            ts = rec.get("timestamp") or ""
            if ts:
                first_ts = first_ts or ts
                last_ts = ts
            for who, txt in texts_from(rec):
                if not isinstance(txt, str) or who == "system":
                    continue
                is_user = who.startswith("user")
                if args.who == "user" and not is_user:
                    continue
                if args.who == "claude" and who != "claude":
                    continue
                pos = near_match(txt, pats, args.near)
                if pos is None:
                    continue
                if is_user:
                    user_hits += 1
                elif who == "claude":
                    claude_hits += 1
                else:
                    other_hits += 1
                snip = txt[max(0, pos - 180): pos + 260].replace("\n", " ")
                key = snip[:120]
                if key not in seen and len(snippets) < 40:
                    seen.add(key)
                    snippets.append((not is_user, who != "claude", ts, who, snip))
        if user_hits or claude_hits or other_hits:
            results.append((user_hits, claude_hits, other_hits, f, title, first_ts, last_ts, snippets))

    results.sort(key=lambda r: (r[0], r[1], r[2]), reverse=True)
    if not results:
        print("No match. Add alternatives to a group (a|b|c), raise --near or --days, or try --titles.")
        return
    for uh, ch, oh, f, title, a, b, snippets in results[: args.top]:
        sid = os.path.basename(f)[:-6]
        print(f"== {title or '(no title)'}  [{sid}]  {(a or '')[:10]} to {(b or '')[:10]}  "
              f"user: {uh}, claude: {ch}, other: {oh}")
        for _, _, ts, who, s in sorted(snippets)[: args.show]:
            print(f"   {ts[:16]} {who}: ...{s}...")
        print()


if __name__ == "__main__":
    main()
