# Skill skeleton

This is the shape `car-buying-coach` uses. Copy it and fill in each section from
the distilled notes. Keep `SKILL.md` lean and push depth into references.

```
<skill-name>/
├── SKILL.md
└── references/
    ├── <topic-1>.md
    ├── <topic-2>.md
    ├── ...            (4–7 topics)
    └── message-templates.md   (if the skill drafts messages or scripts)
```

## SKILL.md

```markdown
---
name: <kebab-case-name>
description: >-
  <What it does, in one sentence.> Use this WHENEVER the user <every situation
  where it applies, in plain words>, even if they don't say "<obvious keyword>."
  Trigger on things like "<real phrase 1>," "<real phrase 2>," "<real phrase 3>."
  Do not use it for <near-miss topics>.
---

# <Skill title>

<Two or three sentences: who the method comes from (a role, not a name) and
why it works.>

Your job: <the one or two things Claude does with this, e.g. coach + draft>.

<One line saying this is education and that numbers are rules of thumb, if
relevant.>

## The one idea everything rests on

<The frame the creator returns to over and over, plus 2–4 bullets on how it
shows up in practice.>

## How to coach

<What to find out from the user first (the facts the advice branches on), then
"meet them where they are". Don't dump the whole playbook.>

| If the user is... | Read |
|---|---|
| <stage or situation> | `references/<topic>.md` |

## The <process>, start to finish

1. **<Step>.** <The rule, any key number, the common mistake.> → `<topic>.md`
2. ...

## <House style> (if it writes messages)

<Voice and the 4–6 moves that make messages work.>

## Things to steer the user away from

- "<Thing people say or do>" → <what to do instead and why>

## When it's done

<How to tell the user they're finished and should stop optimizing.>
```

## Reference files

Each reference covers one topic in depth: the rules, the numbers, the
step-by-step, the scripts, and the traps. Start each one with a line saying when
to read it. Over ~300 lines, add a short table of contents.

## Checks before packaging

- [ ] `name` is kebab-case and matches the folder name
- [ ] The description lists real trigger phrases and near-misses
- [ ] Every file in the references table exists
- [ ] No creator name, handle, or verbatim passages longer than a few words
- [ ] No personal info about the user (their car, their finances, their name)
- [ ] Dollar figures and rates are framed as rules of thumb
