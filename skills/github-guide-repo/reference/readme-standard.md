<!--
  readme-standard.md -- the README bar for github-guide-repo
  Author:  Jibril Sulaiman (with Claude Code)
  Date:    2026-09-29 (generic public version 2026-10-14)
  Lives:   skills/github-guide-repo/reference/
  What:    Section order, step format and a copy-paste brief for a writer subagent.
  Why:     Settings summaries were rejected: the setup instructions weren't detailed
           and didn't point to the code files the reader pastes. The bar is the build
           guides in the original chats.
-->

# README standard

## Section order

1. `<!-- header comment -->`: title, author, date, what, why
2. `# Title`, then a two- or three-sentence summary of what it does and for whom
3. `## Why it exists`: the full problem. Cover what the platform can't do natively, what
   the vendor's support confirmed (numbered list), what went wrong in production, and
   the before/after numbers as ratios.
4. `## How it works`: the flow, one short paragraph or a diagram
5. `## What's in this repo`: a file table (path → what it is → where it gets pasted)
6. `## Table of contents`, which lists every setup step
7. `## 1. Requirements`: plans or tiers, permissions, tools with versions
8. `## 2. Setup, step by step` (split per platform if large: `## 3. Setup: Meta`...)
9. Reference sections: ids and dedupe, hashing, what passes through, reconciling
10. `## Troubleshooting`: a table of symptom → cause → the step that fixes it
11. `## Limits` and `## Security`
12. The credit line: `Built by [<Your Name>](https://github.com/<your-github-user>).`

## Step format

````markdown
### Step 5: The Purchase workflow

About 20 minutes.

**5a. Create it.** **Automation → Workflows → Create workflow → From scratch**, pick
**<object>**, name it `META Purchase CAPI`.

**5b. Trigger.** ... exact picker wording, in bold ...

**5c. Add the custom code action.** Click **+**, choose **Custom code**.
1. **Language:** Node.js 20.x
2. **Secrets:** click **Add secret** and tick `STRIPE_READ_KEY` ...
3. **Property to include in code**, one row per input:

   | Input name (left box) | Value (right box) |
   |---|---|
   | `paymentIntentId` | **Enrolled record → PaymentIntent id property.** Required. |

4. Delete the sample code and paste in **all** of [`meta/meta-purchase-action.js`](meta/meta-purchase-action.js).
5. **Data outputs**, one row per output:

   | Output | Type |
   |---|---|
   | `status` | String |

**5d. Test action.** Pick a recent succeeded record. Success looks like: Status
*Success*, `status = sent`, and a Logs line such as `Memory: 97/2048 MB`.

| You got | Cause | Fix |
|---|---|---|

> ⚠️ **<The trap that bit in production>.** What happened and how to avoid it.

✅ **Check:** <one observable thing that proves the step worked>.
````

Rules:
- Include **every** step and sub-step the chats walked through, including the small
  ones: opening menus, naming things, saving, publishing, turning it on, re-checking.
  When in doubt, add the step.
- Exact UI labels go in **bold** or *"quotes"*, copied from screenshots. Anything not
  confirmed gets "(wording may differ)".
- Every input and output table matches the code, name for name.
- Say which data token group each input comes from (*Enrolled object*,
  *Contact: <label>, Most recently created*, the webhook group).
- Branch steps get a table mapping each output value to what to add on that branch.
- Scripts get the exact command in a fenced block, plus the console output that means
  success. Write commands for the user's shell first (PowerShell on Windows).

## Brief for a writer subagent (copy and fill in)

> Write the replacement "Setup, step by step" section for `<repo path>` README.
> Sources: build sessions `<ids or search terms>`; screenshots `<folder or catalog>`
> (platforms `<platforms>`, dates `<range>`). Read the images. The code in
> `<repo path>` is the source of truth for names. Follow
> `skills/github-guide-repo/reference/readme-standard.md`.
> Sanitize: no employer names, no people's names, no ids, no domains except
> example.com. Write `steps.md` (open with an HTML comment naming the README sections
> it replaces and every cross-reference to renumber) and `sources.md` (the source of
> each instruction, and what couldn't be verified) to `<scratch folder>`. Read-only
> everywhere else. Final reply under 200 words: files, steps covered, unverified items,
> and code defects noticed.
