#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8000}"
public_status="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/menu")"
case "$public_status" in
  200) printf 'Public menu: published (HTTP 200)\n' ;;
  404) printf 'Public menu: not published yet (HTTP 404)\n' ;;
  *) printf 'Unexpected public menu status: HTTP %s\n' "$public_status" >&2; exit 1 ;;
esac

if [[ -n "${ADMIN_COOKIE:-}" ]]; then
  admin_status="$(curl -sS -o /dev/null -w '%{http_code}' \
    -H "Cookie: $ADMIN_COOKIE" "$BASE_URL/api/admin/menu")"
  case "$admin_status" in
    200) printf 'Admin menu: loaded (HTTP 200)\n' ;;
    404) printf 'Admin menu: no published version yet (HTTP 404)\n' ;;
    *) printf 'Unexpected admin menu status: HTTP %s\n' "$admin_status" >&2; exit 1 ;;
  esac
else
  printf 'Admin menu: skipped (set ADMIN_COOKIE to test an authenticated session)\n'
fi
