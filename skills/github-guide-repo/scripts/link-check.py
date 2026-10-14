"""link-check.py -- Author: Jibril Sulaiman (with Claude Code) · 2026-10-01 (public 2026-10-14)
Lives:  skills/github-guide-repo/scripts/
Why:    READMEs that name code files without linking them make the reader hunt for
        the file they are told to paste.

Find (and optionally link) backticked repo file paths in README.md files that aren't links.

python link-check.py <repo> [<repo> ...]          report only
python link-check.py --fix <repo> [<repo> ...]    wrap unlinked mentions as [`path`](path)

Skips fenced code blocks and HTML comments. Only touches paths that exist in the repo.
"""
import os, re, sys

fix = '--fix' in sys.argv
repos = [a for a in sys.argv[1:] if a != '--fix']

def tracked(repo):
    out = set()
    for root, dirs, files in os.walk(repo):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules')]
        rel = os.path.relpath(root, repo).replace('\\', '/')
        if rel != '.':
            out.add(rel); out.add(rel + '/')
        for f in files:
            out.add((f if rel == '.' else rel + '/' + f))
    return out

for repo in repos:
    paths = tracked(repo)
    for rd in sorted({os.path.relpath(r, repo).replace('\\', '/') for r, d, f in os.walk(repo) if 'README.md' in f and '.git' not in r and 'node_modules' not in r}):
        readme = os.path.join(repo, rd, 'README.md')
        base = '' if rd == '.' else rd + '/'
        text = open(readme, encoding='utf-8').read()
        # split into protected (code fences, comments) and editable chunks
        parts = re.split(r'(```.*?```|<!--.*?-->)', text, flags=re.S)
        hits = []
        for i in range(0, len(parts), 2):
            chunk = parts[i]
            def sub(m):
                inner = m.group(1)
                cand = inner.rstrip('/')
                # resolve relative to the README's folder first, then repo root
                for target, linkpath in ((base + inner, inner), (inner, os.path.relpath(inner, rd).replace('\\', '/') if rd != '.' else inner)):
                    t = target.rstrip('/')
                    if t in paths or (t + '/') in paths:
                        hits.append(inner)
                        return f'[`{inner}`]({linkpath})' if fix else m.group(0)
                return m.group(0)
            # backticked token not already inside [ ... ](...)
            parts[i] = re.sub(r'(?<!\[)`([A-Za-z0-9_.\-/]+(?:\.[a-z]{1,5}|/))`(?!\]\()', sub, chunk)
        if fix and hits:
            open(readme, 'w', encoding='utf-8', newline='\n').write(''.join(parts))
        name = os.path.basename(repo.rstrip('/\\')) + ('/' + rd if rd != '.' else '')
        print(f'{name}: {len(hits)} unlinked file mentions' + (f" -> {sorted(set(hits))}" if hits else ''))
