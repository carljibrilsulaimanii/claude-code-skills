r"""series-links.py -- rewrite the "Related repos" section across a series of guide repos
Author:  Jibril Sulaiman (with Claude Code)
Date:    2026-10-06 (public version 2026-10-14)
Lives:   skills/github-guide-repo/scripts/
What:    Writes the same series table at the end of every member's README, marking the
         current repo "(this repo)". Members whose folder doesn't exist yet are listed
         without a link and with "(coming)".
Why:     Related guides stay separate repos but must list each other. Editing seven
         READMEs by hand drifts; one config and one run keeps them identical.

Usage:   python series-links.py series.json

series.json:
{
  "guides_dir": "C:/Users/you/github-guides",
  "github_user": "your-github-user",
  "title": "Stripe beyond HubSpot Commerce",
  "intro": "This repo is one of a set of guides for ... Each one stands alone.",
  "members": [
    ["hubspot-stripe-utm-attribution", "UTM attribution from form to payment record"],
    ["stripe-webhooks-to-hubspot-custom-events", "Any Stripe event into a HubSpot workflow"]
  ]
}
"""
import io, json, os, re, sys

cfg = json.load(io.open(sys.argv[1], encoding='utf-8'))
G, U = cfg['guides_dir'], f"https://github.com/{cfg['github_user']}/"
TITLE, INTRO, SERIES = cfg['title'], cfg['intro'], cfg['members']

def published(slug):
    return os.path.exists(os.path.join(G, slug, 'README.md'))

def block(this):
    rows = []
    for slug, what in SERIES:
        if slug == this:
            rows.append(f'| **{slug}** (this repo) | {what} |')
        elif published(slug):
            rows.append(f'| [{slug}]({U}{slug}) | {what} |')
        else:
            rows.append(f'| {slug} (coming) | {what} |')
    return (f'## Related repos: {TITLE}\n\n{INTRO}\n\n'
            '| Repo | What it adds |\n|---|---|\n' + '\n'.join(rows) + '\n')

for slug, _ in SERIES:
    if not published(slug):
        continue
    p = os.path.join(G, slug, 'README.md')
    s = io.open(p, encoding='utf-8').read()
    new = block(slug)
    if '\n## Related repos' in s:
        # replace the existing section up to the next "---" divider or the end
        i = s.index('\n## Related repos') + 1
        m = re.search(r'\n---\n', s[i:])
        j = i + m.start() + 1 if m else len(s)
        s = s[:i] + new + '\n' + s[j:]
    else:
        # insert before the closing "---" + "Built by" credit, or append
        m = re.search(r'\n---\n\nBuilt by', s)
        if m:
            s = s[:m.start() + 1] + '\n' + new + s[m.start():]
        else:
            s = s.rstrip('\n') + '\n\n' + new
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
    print('ok', slug)
