#!/usr/bin/env bash
# sanitize-scan.sh
# Author:  Jibril Sulaiman (with Claude Code)
# Date:    2026-09-29 (generic public version 2026-10-14)
# Lives:   skills/github-guide-repo/scripts/
# What:    Scans a guide repo for employer identifiers, people's names, real ids,
#          secrets and non-example domains before a push to a public GitHub repo.
# Why:     Guide repos are public and must carry nothing from the employer. A leak in
#          an old commit is still public, so unpushed history is scanned too.
#
# Usage:   GUIDE_DENYLIST=~/.config/guide-denylist.txt \
#          GUIDE_AUTHOR='your name|yoursurname' GUIDE_GITHUB_USER=your-github-user \
#          bash sanitize-scan.sh <repo-dir>
#
#          GUIDE_DENYLIST  file of regexes, one per line (# comments allowed): company
#                          and product names, domains, account ids, staff names.
#                          See denylist.example.txt. Keep the real one out of any repo.
#          GUIDE_AUTHOR    regex for the author's name; allowed only on "Author:" lines
#                          and the README "Built by [" credit line.
#          GUIDE_GITHUB_USER  your GitHub user, so credit links and no-reply emails pass.
# Exit:    0 = clean, 1 = findings to review (every hit is printed with file:line).

set -u
REPO="${1:?usage: sanitize-scan.sh <repo-dir>}"
HITS=0

# Build one alternation from the denylist file before leaving the caller's folder.
DENY=''
if [ -n "${GUIDE_DENYLIST:-}" ] && [ -f "$GUIDE_DENYLIST" ]; then
  DENY="$(grep -vE '^\s*(#|$)' "$GUIDE_DENYLIST" | tr -d '\r' | paste -sd'|' -)"
else
  echo "WARNING: GUIDE_DENYLIST not set or missing; employer names are NOT being checked."
  echo
fi
GHUSER="${GUIDE_GITHUB_USER:-your-github-user}"

cd "$REPO" || exit 2

# Paths to skip: dependencies and git internals.
EXCL=(--exclude-dir=node_modules --exclude-dir=.git)

report() { # $1 = label, rest = grep output
  local label="$1"; shift
  if [ -n "$*" ]; then
    echo "== $label"; echo "$*"; echo; HITS=1
  fi
}

# 1. Employer names, products, domains, known internal ids and staff names.
if [ -n "$DENY" ]; then
  report "Denylist hits" "$(grep -rniE "${EXCL[@]}" "$DENY" . 2>/dev/null)"
fi

# 2. The author credit is allowed only in header "Author:" lines and the README
#    credit line.
if [ -n "${GUIDE_AUTHOR:-}" ]; then
  report "Author name outside credit lines" "$(grep -rniE "${EXCL[@]}" "$GUIDE_AUTHOR" . 2>/dev/null | grep -viE "Author:|Built by \[|github\.com/$GHUSER")"
fi

# 3. Secrets and tokens (live or test). Placeholders like rk_live_... are fine.
SECRETS='pat-(na|eu)[0-9]-[0-9a-f]{8}|sk_(live|test)_[A-Za-z0-9]{10,}|rk_(live|test)_[A-Za-z0-9]{10,}|whsec_[A-Za-z0-9]{10,}|EAA[A-Za-z0-9]{20,}|GOCSPX-[A-Za-z0-9_-]{10,}|ya29\.[A-Za-z0-9_-]{10,}|1//0[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[bp]-[A-Za-z0-9-]{10,}|sk-ant-[A-Za-z0-9_-]{20,}'
report "Secrets or tokens" "$(grep -rnoE "${EXCL[@]}" "$SECRETS" . 2>/dev/null)"

# 4. Long numeric ids (pixel/dataset, ad account, conversion action, portal).
#    Excludes epoch-ms timestamps (13 digits starting 17/18).
#    Placeholder-looking numbers pass: 555 phones, 12345..., 98765..., 111222...,
#    runs of zeros, and the UK drama range 7946 0xxx.
PLACEHOLDER='555|12345|98765|1112223333|0000000|79460'
report "Long numeric ids (check each)" "$(grep -rnoE "${EXCL[@]}" '\b[0-9]{9,19}\b' . 2>/dev/null | grep -vE ':(1[78][0-9]{11})$' | grep -vE "$PLACEHOLDER")"

# 5. Real-looking emails and phone numbers.
report "Emails (non-example)" "$(grep -rnoiE "${EXCL[@]}" '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' . 2>/dev/null | grep -viE '@(example|yourdomain|your-domain)\.(com|org|net)|noreply@anthropic\.com|@users\.noreply\.github\.com')"
#    Test fixtures may use a made-up person at gmail.com (Google's dot-stripping rule
#    needs one). Keep those names obviously fake and say so.
report "Phone numbers (non-555)" "$(grep -rnoE "${EXCL[@]}" '(\+1[ -]?)?\(?[2-9][0-9]{2}\)?[ .-][0-9]{3}[ .-][0-9]{4}\b|\+1[2-9][0-9]{9}\b' . 2>/dev/null | grep -vE '555|123-456-7890|1234567890')"

# 6. Domains that are not example.com or a vendor's own. Review the list by eye.
echo "== Domains (review: only example.com, localhost and vendor domains belong here)"
grep -rhoE "${EXCL[@]}" 'https?://[A-Za-z0-9.-]+' . 2>/dev/null | sort | uniq -c | sort -rn
echo

# 7. Unpushed history: a leak removed from the working tree is still in old commits.
if git rev-parse --git-dir >/dev/null 2>&1; then
  RANGE='HEAD'
  if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then RANGE='@{u}..HEAD'; fi
  PAT="$SECRETS"
  [ -n "$DENY" ] && PAT="$DENY|$PAT"
  HIST="$(git log -p "$RANGE" 2>/dev/null | grep -E '^\+' | grep -niE "$PAT")"
  report "Unpushed history ($RANGE)" "$HIST"
fi

if [ "$HITS" = 0 ]; then echo "CLEAN: no findings."; else echo "FINDINGS: review every hit above before pushing."; fi
exit "$HITS"
