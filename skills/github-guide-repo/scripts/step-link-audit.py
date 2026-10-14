"""step-link-audit.py -- Author: Jibril Sulaiman (with Claude Code) · 2026-10-01
Lives: skills/github-guide-repo/scripts/  (public version 2026-10-14)
Why:   every code file must be linked in the ### Step that pastes, runs or edits it.
Usage: python step-link-audit.py <repo> [...]   (NOLINK / NONE rows need a look;
       meta.json and helper files no step uses are fine)
"""
import os, re, sys

CODE = re.compile(r'\.(js|mjs|gs|html|css|json|ps1|sh|py)$')

for repo in sys.argv[1:]:
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules')]
        if 'README.md' not in files:
            continue
        text = open(os.path.join(root, 'README.md'), encoding='utf-8').read()
        # code files under this README's folder (skip tests and package files)
        code = []
        for r2, d2, f2 in os.walk(root):
            d2[:] = [d for d in d2 if d not in ('.git', 'node_modules', 'test', 'tests')]
            if r2 != root and os.path.exists(os.path.join(r2, 'README.md')):
                d2[:] = []; continue
            for f in f2:
                if CODE.search(f) and f not in ('package.json', 'package-lock.json'):
                    code.append(os.path.relpath(os.path.join(r2, f), root).replace('\\', '/'))
        # split into step sections
        secs = re.split(r'\n(?=### Step )', text)
        steps = [s for s in secs if s.startswith('### Step ')]
        print(f'\n=== {os.path.relpath(root, os.path.dirname(repo.rstrip("/")))}  ({len(steps)} steps)')
        for c in sorted(code):
            base = os.path.basename(c)
            linked_in, plain_in = [], []
            for s in steps:
                title = s.split('\n', 1)[0][4:40]
                if re.search(r'\]\((?:\./)?' + re.escape(c) + r'\)', s):
                    linked_in.append(title)
                elif c in s or re.search(r'(?<![\w/])' + re.escape(base) + r'\b', s):
                    plain_in.append(title)
            flag = 'OK ' if linked_in else ('NOLINK' if plain_in else 'NONE')
            print(f'  {flag:6} {c:55} linked: {linked_in[:3]} plain: {plain_in[:3]}')
