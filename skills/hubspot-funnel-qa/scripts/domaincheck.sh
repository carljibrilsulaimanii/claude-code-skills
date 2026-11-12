#!/usr/bin/env bash
# domaincheck.sh -- domain sweep for hubspot-funnel-qa
# Author:  Jibril Sulaiman (with Claude Code)
# Date:    2026-10-22 (generic public version 2026-11-12)
# Runs from: any shell with curl (Git Bash on Windows, macOS, Linux). Nothing to deploy.
# What:    For each domain, prints nameservers, apex A, www CNAME, a best guess at the
#          host, and where a browser actually lands (final URL, status, page title).
# Why:     A page can be perfect in HubSpot and unreachable because the domain in front
#          of it points somewhere else: a domain moved before its pages existed (#41),
#          or a forwarding domain that rotted when its target page moved (#42).
#          See references/domains.md.
#
# Usage:
#   bash domaincheck.sh example.com example.org     # these domains
#   bash domaincheck.sh -f domains.txt              # one domain per line, # comments ok
#
# Reads DNS with dig if installed, otherwise nslookup, always against 8.8.8.8 so a
# stale local cache can't answer. Fetches with a browser user agent, because some
# hosts block curl's default one (a 403/405/406 there is not an outage).

DOMAINS=()
if [ "${1:-}" = "-f" ] && [ -f "${2:-}" ]; then
  while IFS= read -r line; do
    line="${line%%#*}"; line="$(echo "$line" | tr -d '[:space:]')"
    [ -n "$line" ] && DOMAINS+=("$line")
  done < "$2"
else
  DOMAINS=("$@")
fi
if [ ${#DOMAINS[@]} -eq 0 ]; then
  echo "usage: domaincheck.sh <domain> [...]   or   domaincheck.sh -f domains.txt" >&2
  exit 2
fi

UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

# dns <type> <name> -> one answer per line
dns() {
  if command -v dig >/dev/null 2>&1; then
    dig +short "$1" "$2" @8.8.8.8 2>/dev/null | sed 's/\.$//'
  else
    case "$1" in
      NS)    nslookup -type=ns "$2" 8.8.8.8 2>/dev/null | awk '/nameserver =/ {print $NF}' ;;
      CNAME) nslookup -type=cname "$2" 8.8.8.8 2>/dev/null | awk '/canonical name =/ {print $NF}' ;;
      A)     nslookup -type=a "$2" 8.8.8.8 2>/dev/null | awk '/^Name:/ {f=1} f { for (i = 1; i <= NF; i++) if ($i ~ /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/) print $i }' ;;
    esac | sed 's/\.$//'
  fi
}

# host_of <ns> <a> <cname> <headers> -> best guess at who serves the domain
host_of() {
  local all="$1 $2 $3 $4"
  case "$all" in
    *hubspot.net*|*199.60.103.*)                 echo "HubSpot" ;;
    *ludicrous.cloud*|*162.159.140.166*)         echo "GoHighLevel" ;;
    *clickfunnels.com*)                          echo "ClickFunnels" ;;
    *myshopify.com*|*23.227.38.*)                echo "Shopify" ;;
    *dns-parking.com*|*"platform: hostinger"*)   echo "Hostinger" ;;
    *bluehost.com*)                              echo "Bluehost" ;;
    *3.33.130.190*|*15.197.148.33*)              echo "GoDaddy parked" ;;
    *3.33.251.168*|*15.197.225.128*)             echo "GoDaddy forwarding" ;;
    *)                                           echo "unknown" ;;
  esac
}

for d in "${DOMAINS[@]}"; do
  ns=$(dns NS "$d" | sort | paste -sd, -)
  a=$(dns A "$d" | grep -E '^[0-9.]+$' | sort | paste -sd, -)
  cname=$(dns CNAME "www.$d" | paste -sd, -)
  hdrs=$(curl -s -I --max-time 10 -A "$UA" "https://$d" 2>/dev/null | tr -d '\r' | tr '\n' ' ')
  body=$(curl -s -L --max-time 15 -A "$UA" -H 'Accept: text/html' \
    -w $'\n@@%{http_code} %{url_effective}' "http://$d" 2>/dev/null)
  result=${body##*@@}
  title=$(printf '%s' "${body%@@*}" | tr '\n' ' ' | grep -oiE '<title[^>]*>[^<]*' | head -1 | sed -E 's/<title[^>]*>//I' | tr -s '[:space:]' ' ' | sed -E 's/^ //; s/ $//')
  host=$(host_of "$ns" "$a" "$cname" "$hdrs")

  flag=""
  case "$result" in
    000*)         flag="  <-- NO RESPONSE" ;;
    404*|5??*)    flag="  <-- BROKEN" ;;
  esac
  [ "$host" = "GoDaddy parked" ] && flag="  <-- PARKED"
  [ -z "$ns" ] && flag="$flag  <-- NO NAMESERVERS"

  printf '%s  [%s]%s\n' "$d" "$host" "$flag"
  printf '    NS     %s\n    A      %s\n    www    %s\n    lands  %s  "%s"\n' \
    "${ns:--}" "${a:--}" "${cname:--}" "$result" "${title:-no title}"
done
