#!/usr/bin/env bash
# Usage: scripts/cutover-check.sh https://<host>
set -euo pipefail
BASE_URL="${1:?base url}"
BASE_URL="${BASE_URL%/}"
echo "== URL parity against $BASE_URL"
status=0
TEST_MODE=http BASE_URL="$BASE_URL" node --test tests/urls.test.mjs || status=$?
echo "== Spot checks"
for p in / /about /blog /blog/sass-loops /sitemap.xml /robots.txt /og/index.png; do
  printf '%-22s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$BASE_URL$p")"
done
curl -sI "$BASE_URL/about/" | grep -iE '^(HTTP|location)' || true
curl -s "$BASE_URL/nope" -o /dev/null -w 'unknown url -> %{http_code}\n'
exit "$status"
