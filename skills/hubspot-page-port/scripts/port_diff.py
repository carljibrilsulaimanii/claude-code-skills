# =============================================================================
# port_diff.py -- hubspot-page-port
# Author:  Jibril Sulaiman (with Claude Code)
# Date:    2026-11-18
# Lives:   skills/hubspot-page-port/scripts/port_diff.py
# Run:     python port_diff.py source.json new.json [--year-from 2026 --year-to 2027]
#          (both files are page-snapshot.js output taken at 1440px)
# What:    compares a ported or redesigned page with its source block by block and
#          prints every difference a visitor would see: missing or extra copy, changed
#          capitalisation, lost bold / italic / accent words, font, size, colour,
#          alignment and section backgrounds, and background images on one page only.
# Why:     a ported page passed a copy check while losing its source's backgrounds,
#          accent font, bold phrases and heading case.
# =============================================================================
import json, re, sys
from difflib import SequenceMatcher

args = sys.argv[1:]
yf = args[args.index('--year-from') + 1] if '--year-from' in args else None
yt = args[args.index('--year-to') + 1] if '--year-to' in args else None
src, new = (json.load(open(p, encoding='utf-8')) for p in args[:2])

def norm(t):
    t = t.replace('’', "'").replace('“', '"').replace('”', '"').replace('…', '...')
    if yf: t = t.replace(yf, yt)
    return re.sub(r'\s+', ' ', t).strip()

def key(t):
    return re.sub(r'[^a-z0-9]', '', norm(t).lower())

new_by_key = {}
for b in new['blocks']:
    new_by_key.setdefault(key(b['text']), []).append(b)

issues = {'missing': [], 'case': [], 'format': [], 'style': [], 'background': []}
for s in src['blocks']:
    k = key(s['text'])
    cands = new_by_key.get(k)
    if not cands:
        best = max(new['blocks'], key=lambda b: SequenceMatcher(None, k, key(b['text'])).ratio(), default=None)
        r = SequenceMatcher(None, k, key(best['text'])).ratio() if best else 0
        issues['missing'].append(f"{s['tag']} '{s['text'][:90]}'" + (f"  (closest {r:.0%}: '{best['text'][:60]}')" if r > .6 else ''))
        continue
    n = cands.pop(0)
    if norm(s['text']) != norm(n['text']) and norm(s['text']).lower() == norm(n['text']).lower():
        issues['case'].append(f"'{norm(s['text'])[:70]}' -> '{n['text'][:70]}'")
    sm = sorted(re.sub(yf or '^$', yt or '', m) for m in s['marks']); nm = sorted(n['marks'])
    if sm != nm:
        issues['format'].append(f"'{s['text'][:50]}': source {sm or 'plain'} | new {nm or 'plain'}")
    diffs = [f"{a} {s[a]} -> {n[a]}" for a in ('font', 'weight', 'color', 'align') if str(s[a]) != str(n[a])]
    if abs(s['size'] - n['size']) > 2: diffs.append(f"size {s['size']} -> {n['size']}")
    if diffs: issues['style'].append(f"'{s['text'][:50]}': " + '; '.join(diffs))
    if s['bg']['images'] != n['bg']['images'] or s['bg']['color'] != n['bg']['color']:
        issues['background'].append(f"'{s['text'][:50]}': source {s['bg']} | new {n['bg']}")

extra = [b for bs in new_by_key.values() for b in bs]
labels = {'missing': 'Copy on the source page not found on the new page',
          'case': 'Capitalisation changed', 'format': 'Bold / italic / accent words differ',
          'style': 'Font, size, weight, colour or alignment differ',
          'background': 'Section background differs'}
for k, label in labels.items():
    print(f"\n== {label}: {len(issues[k])}")
    for line in issues[k]: print('  -', line)
print(f"\n== On the new page only: {len(extra)}")
for b in extra: print('  -', b['tag'], b['text'][:90])
sb = {b['image'] for b in src['backgrounds']} - {'gradient'}
nb = {b['image'] for b in new['backgrounds']} - {'gradient'}
print('\n== Background images on the source only:', sorted(sb - nb) or 'none')
print('== Background images on the new page only:', sorted(nb - sb) or 'none')
total = sum(len(v) for v in issues.values())
print(f"\n{total} differences. A port is not done until each one is fixed or listed for the page owner as a deliberate change.")
