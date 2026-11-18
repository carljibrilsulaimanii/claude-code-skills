---
name: search-chat-sessions
description: Find the past chat session where something was asked, decided, built or explained, by searching every Claude Code session transcript thoroughly (typed messages, messages sent mid-turn, artifact comments, Claude's replies and tool results), then claude.ai chats, artifacts, Slack and meeting notes if it isn't there. Use whenever the user says "there was a chat where I...", "find the chat/session where...", "which session did we...", "I asked for X in another chat", "check the <topic> chat", "where did we decide...", "didn't we already build...", or gives a half-remembered request and expects you to locate it. Use it even when the user names the session vaguely ("the CRM build chat"), because the useful output is the exact session, date and quote, not a guess.
---

<!--
  SKILL.md -- search-chat-sessions
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-11-18 (generic public version)
  Lives:   ~/.claude/skills/search-chat-sessions/SKILL.md (user level) or
           <project>/.claude/skills/search-chat-sessions/SKILL.md
           (script: scripts/find_chat.py)
  What:    How to find the past session that holds a request or decision, every time.
  Why:     A search that read only typed user messages, using the user's current wording,
           reported "not found" for a request that existed. It had been sent mid-turn
           (transcripts store that as a queued command, not a user message) and in
           different words. The user had to point to the session themself.
-->

# Search all chat sessions

The user remembers the gist, not the words, and often not the session. Saying "I
couldn't find it" after one narrow search costs them time and trust. Run every step
below before reporting a miss, and when you do report a miss, list exactly what you
searched.

## 1. Turn the request into word groups

The user's wording today is rarely the wording in the old chat. Before searching, write
down 2 to 3 **word groups** for the core ideas, each with synonyms, and drop verbs like
"migrate", "build", "request" that people phrase many ways.

Example: "migrating the rest of the Google Sheets to CRM objects" becomes
- `google sheets?|sheet logs?|\bsheets?\b|spreadsheets?`
- `custom objects?|crm objects?|objects?`

Also think of the **names** involved: the platform, the teammate, the product, the
artifact or page title.

## 2. Search every transcript with the script

```bash
python -I ~/.claude/skills/search-chat-sessions/scripts/find_chat.py "<group 1>" "<group 2>" --exclude <current session id prefix>
```

It reads every session under `~/.claude/projects`, including the record types a plain
search misses:
- typed user messages
- messages sent mid-turn (`queue-operation` and queued-command `attachment` records,
  shown as "user (sent mid-turn)")
- artifact comments sent to the session
- Claude's replies and tool results (labelled, ranked below what the user wrote)
- subagent and other-session reports, labelled "agent report", not "user"

Groups must all appear within `--near` characters (default 400). Results rank by
matches in what the user wrote, then by Claude's replies. Always pass
`--exclude <this session>` so the current chat (which now contains the question) doesn't
come first.

Run at least three searches before concluding anything:
1. The core word groups, `--who all`.
2. Looser: one group only, or `--near 0` (anywhere in the same message).
3. **Titles:** `--titles "<platform or topic>"` lists sessions by name and date. When
   the user names the chat ("the CRM build chat"), start here and then search inside
   the candidates.

If a session looks right, open its transcript
(`~/.claude/projects/<project>/<id>.jsonl`) around the matched time and read the
surrounding messages, so you report what was actually asked and what Claude did.

## 3. If no Claude Code session has it

Keep going, in this order, and stop at the first hit:
1. **Artifacts:** list the user's published artifacts. Requests often live as artifact
   comments or as items on a page. Read the likely artifact.
2. **claude.ai chats:** through a browser session where the user is signed in to
   claude.ai.
3. **Slack** (if connected): search the user's own messages for the word groups, then
   everyone's.
4. **Meeting notes** (if a notes tool is connected): search meetings, then transcripts.
5. **Older exports** the user keeps (for example a compiled archive of another
   assistant's chats).

## 4. Report

- The session title, its date, and the exact quote of the request (who wrote it and
  when, in the user's time zone). Link the session only with an id a tool returned;
  never build one from the transcript file name. Otherwise give the title and the
  transcript id.
- What came of it: what Claude built or changed, and whether it reached the task
  tracker, chat or a live system.
- If nothing was found after every step, say so and list each place and word group you
  searched, then ask for one more detail (rough date, a word they used, who else was
  involved).

## Script options

| Option | Does |
|---|---|
| `--near N` | Max distance in characters between groups (default 400; `0` = same message) |
| `--who all\|user\|claude` | Only what the user wrote, or only Claude's replies |
| `--days N` | Only sessions changed in the last N days (default 180) |
| `--exclude ID` | Leave out a session by id prefix; repeatable |
| `--titles` | List sessions whose title matches the groups, then stop |
| `--show N` / `--top N` | Snippets per session (default 3) / sessions listed (default 12) |

[`scripts/find_chat.py`](scripts/find_chat.py) needs Python 3 and nothing else. It only
reads files.
