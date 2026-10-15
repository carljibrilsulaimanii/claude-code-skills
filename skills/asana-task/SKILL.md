---
name: asana-task
description: Create or update Asana tasks for your team from a request, a Slack paste, a meeting transcript, a chat's findings or a build that just finished. Use whenever the user says "create an asana task", "make a task for <teammate>", "put this in Asana", "update the asana task", "add this to the task", "review today's meeting transcripts and create tasks", or asks for a solution "and an Asana task" afterwards. Covers which project and assignee to use, the html_notes format Asana accepts (and the tags it rejects), the description structure a teammate needs, code blocks, follow-ups and the reply format.
---

<!--
  SKILL.md -- asana-task
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-10-07 (generic public version 2026-10-15)
  Lives:   ~/.claude/skills/asana-task/SKILL.md (user level) or
           <project>/.claude/skills/asana-task/SKILL.md
  What:    The standard for creating and updating Asana tasks that a teammate can
           pick up cold.
  Why:     Built from about fourteen task-writing sessions. It captures the
           corrections and the API errors that kept recurring, so the first version
           of a task is the right one.
-->

# Asana tasks

The user hands tasks to teammates who were not in the conversation. A task must stand
on its own: someone opening it cold has to be able to do the work without asking a
question. Every rule below comes from a correction or an error Asana returned.

## 1. Known IDs (fill in once)

Look these up once with the Asana connector (`search_objects` with
`resource_type: "user"` or `"project"`) and keep them here. Never guess a gid.

Workspace: `REPLACE_WITH_WORKSPACE_GID`

| Person | Asana user gid | Email |
|---|---|---|
| Teammate A | `REPLACE_WITH_USER_GID` | a@example.com |
| Teammate B | `REPLACE_WITH_USER_GID` | b@example.com |
| The user | `REPLACE_WITH_USER_GID` | you@example.com, or `"me"` |

| Project | gid | Use for |
|---|---|---|
| **Team tasks** | `REPLACE_WITH_PROJECT_GID` | **Default.** Almost every task for a teammate goes here. |
| The user's own tasks | `REPLACE_WITH_PROJECT_GID` | Tasks the user assigns to themself. |
| Other projects | `REPLACE_WITH_PROJECT_GID` | Only when the user names them. |

Anyone not in the table (managers, outside vendors): look them up before assigning.

## 2. Hard rules

1. **A task, not a project.** "Create an asana project in <project>" usually means a
   task in that project. Never call `create_project` unless the user says "new
   project" and clearly means a new Asana project.
2. **Use the default project** when the user names none.
3. **One owner per task.** When work splits between people, make a separate task for
   each. Don't put two people's work in one task.
4. **Followers: always `me`.** Add whoever the work came from (a manager, the person
   who ran the meeting) as a follower too.
5. **No due date unless the user gives one or a meeting set one.** Say in the reply
   that none was set.
6. **Get the facts right before writing.** Read the actual source: the full meeting
   transcript (not the summary), the recording itself, the live record or page, the
   Slack thread. Tasks get rebuilt when they guess (a "token" that was really a
   webhook; the wrong recording; the wrong calendar tool). If the user asks to see
   findings first ("before you create the task, tell me what you found"), report and
   wait.
7. **Restate the user's requirement exactly.** If a request or pasted message spells
   out the behaviour ("a new note for each summary", "notes are added, not
   overwritten"), the task must say the same thing. Don't swap in a design you think
   is better; raise it in chat instead.
8. **Check for an existing task first.** `search_tasks` / `search_objects` with
   `resource_type: "task"` on the topic. If one exists, update it or link to it
   ("Follow-up to ..."); don't duplicate it.

## 3. What goes in the description

Write in plain language: non-technical teammates read these too. No emojis. Full URLs
everywhere, never a slug or a partial path.

Structure, in this order:

1. **One-line summary at the top** in bold: what this is and where it came from
   ("Follow-up to <task link> from the Oct 7 huddle."). If code is included, say so
   here: "The finished code is at the bottom of this description."
2. **Why / what's wrong**: short bullets with the cause, not just the symptom.
3. **Steps**: **numbered**, every step, click by click. Include the setup steps people
   skip, for example "Duplicate the module" and "Name the copy Replay Countdown" as
   their own steps. Unnumbered steps and a missing "clone and name" step were both
   rejected.
4. **Expected behaviour**: a table when there are cases (page x state, on/off).
5. **Do not**: things that break if done wrong ("Do not edit the original module").
6. **Testing**: how to confirm it worked, including waits (CMS pages can take a few
   minutes to reflect a toggle; test in a private window).
7. **Open decisions**: anything the user must decide, stated as a question.
8. **Code blocks at the very bottom**: the complete, final code, not a diff and not a
   pointer to a file. Label each one `CODE BLOCK 1 - <where it is pasted>`. Steps
   refer to them by that label.

Use the real names of things: the property's internal name and label, the module
name, the workflow name, the object type id, with a full link to each.

## 4. html_notes format (Asana rejects anything else)

Use the Asana connector's `create_tasks`, `update_tasks`, `add_comment` and
`search_objects` tools. Send the description as `html_notes`, wrapped in
`<body>...</body>`.

Allowed and used successfully: `<body> <h1> <h2> <strong> <em> <u> <s> <code> <pre>
<a href="..."> <ul> <ol> <li> <blockquote> <hr/> <table> <tr> <td>`, plus
`<a data-asana-gid="TASK_GID"/>` to link another task.

**Rejected with "XML is invalid":** `<p>` and `<br/>`. This error came back in four
separate sessions. Use plain text with a `\n` newline instead of `<p>`, and a new line
instead of `<br/>`.

Other rules:
- Escape `&`, `<` and `>` inside text and inside `<pre>` as `&amp;`, `&lt;`, `&gt;`.
  Code in a `<pre>` block must be fully escaped or the XML breaks.
- Every tag must be closed and properly nested.
- Numbered steps: use `<ol><li>` or write the numbers explicitly
  (`<strong>1.</strong> Duplicate ...`). Either way the numbers must show.
- `tasks` must be a real JSON array, not a string. Numeric params like `limit` must be
  numbers.
- After a "Created 0 of 1" or "Updated 0 of 1", read the `errors` array, fix the
  cause, and resend. Don't report success until the result says 1 of 1.

Minimal working call:

```json
{
  "default_project": "REPLACE_WITH_PROJECT_GID",
  "tasks": [{
    "name": "Short imperative title that says the outcome",
    "assignee": "REPLACE_WITH_USER_GID",
    "followers": "me",
    "html_notes": "<body><strong>One-line summary.</strong>\n<h2>Why</h2><ul><li>...</li></ul><h2>Steps</h2><ol><li>...</li></ol><h2>Testing</h2><ul><li>...</li></ul><h1>CODE BLOCK 1 - paste into ...</h1><pre>escaped code</pre></body>"
  }]
}
```

## 5. Files and attachments

Asana connectors usually can't upload attachments. When the user wants files on a
task:
- Put the full code or text in the description as code blocks (preferred for code).
- For many or large files, publish them somewhere the team can open (a shared doc or
  page) and put its full link in the task. Tell the user attachments were not
  uploaded.

## 6. Updating a task

- "Update the asana task" / "add this to the task" means rewrite the description so it
  is current. Fix anything that has drifted (old counts, old file paths, old
  decisions), not just append.
- Use `add_comment` only for a dated note or an answer to a teammate's question.
  Comments notify followers, so say in chat what was posted.
- After an update that includes code, re-read the task and check the code in Asana
  matches the local file exactly.

## 7. Many tasks from meetings

For "review today's meeting transcripts and create tasks for <person>":
1. Make sure the transcript tool can actually return full transcripts (some workspaces
   or plans only return summaries).
2. Read every relevant transcript in full. Summaries miss action items.
3. One task per action item, assigned to the person who owns it. If something clearly
   belongs to someone else, mention it and offer a task for them.
4. Note who said it and when in the summary line ("<Name> said on the vendor call
   ...").

## 8. Reply format after creating

- The full permalink for every task
  (`https://app.asana.com/1/<workspace>/project/<project>/task/<task>`).
- Project, assignee, followers, due date (or "no due date").
- A short numbered list of what the task covers.
- Anything you couldn't do (attachments, unverified facts) and any decision left open
  for the user.
