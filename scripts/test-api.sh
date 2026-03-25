#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
#  RPS Arena — API smoke test
#  Usage: ./scripts/test-api.sh [BASE_URL]
#  Default BASE_URL: http://localhost:8080/api
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

BASE="${1:-http://localhost:8080/api}"
PASS=0; FAIL=0

# ── Helpers ──────────────────────────────────────────────────────
green() { printf "\033[32m✔ %s\033[0m\n" "$*"; }
red()   { printf "\033[31m✘ %s\033[0m\n" "$*"; }
blue()  { printf "\033[34m▶ %s\033[0m\n" "$*"; }

assert_status() {
  local label="$1" expected="$2" actual="$3"
  if [ "$actual" -eq "$expected" ]; then
    green "$label (HTTP $actual)"
    ((PASS++))
  else
    red "$label — expected HTTP $expected, got $actual"
    ((FAIL++))
  fi
}

assert_field() {
  local label="$1" field="$2" body="$3"
  if echo "$body" | grep -q "\"$field\""; then
    green "$label — field '$field' present"
    ((PASS++))
  else
    red "$label — field '$field' missing in: $body"
    ((FAIL++))
  fi
}

# ── Setup ────────────────────────────────────────────────────────
TEST_USER="testuser_$$"
TEST_PASS="testpass123"
TOKEN=""

echo ""
blue "Target: $BASE"
echo "────────────────────────────────────────────────────────────"

# ── 1. Health check ──────────────────────────────────────────────
blue "1. Health"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/../health")
assert_status "GET /health" 200 "$STATUS"

# ── 2. Register ──────────────────────────────────────────────────
blue "2. Auth — Register"
BODY=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${TEST_USER}_2\",\"password\":\"$TEST_PASS\"}")
assert_status "POST /auth/register" 201 "$STATUS"
assert_field "register response" "access_token" "$BODY"
TOKEN=$(echo "$BODY" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# ── 3. Register duplicate ────────────────────────────────────────
blue "3. Auth — Duplicate username"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")
assert_status "POST /auth/register (duplicate)" 409 "$STATUS"

# ── 4. Login ─────────────────────────────────────────────────────
blue "4. Auth — Login"
BODY=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")
assert_status "POST /auth/login" 200 "$STATUS"
assert_field "login response" "access_token" "$BODY"

# ── 5. Login wrong password ──────────────────────────────────────
blue "5. Auth — Wrong password"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"wrongpass\"}")
assert_status "POST /auth/login (wrong password)" 401 "$STATUS"

# ── 6. Get me ────────────────────────────────────────────────────
blue "6. Auth — GET /auth/me"
BODY=$(curl -s "$BASE/auth/me" -H "Authorization: Bearer $TOKEN")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/auth/me" \
  -H "Authorization: Bearer $TOKEN")
assert_status "GET /auth/me" 200 "$STATUS"
assert_field "/auth/me response" "username" "$BODY"

# ── 7. Get me — no token ─────────────────────────────────────────
blue "7. Auth — GET /auth/me (no token)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/auth/me")
assert_status "GET /auth/me (unauthorized)" 401 "$STATUS"

# ── 8. Play (authenticated) ──────────────────────────────────────
blue "8. Game — Play (authenticated)"
BODY=$(curl -s -X POST "$BASE/game/play" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"ROCK"}')
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/game/play" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"action":"ROCK"}')
assert_status "POST /game/play (auth)" 201 "$STATUS"
assert_field "play response" "botAction" "$BODY"
assert_field "play response" "result" "$BODY"

# ── 9. Play (guest) ──────────────────────────────────────────────
blue "9. Game — Play (guest)"
BODY=$(curl -s -X POST "$BASE/game/play" \
  -H "Content-Type: application/json" \
  -d '{"action":"SCISSORS"}')
assert_field "guest play response" "result" "$BODY"
green "POST /game/play (guest)"

# ── 10. Play (invalid action) ────────────────────────────────────
blue "10. Game — Play (invalid action)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/game/play" \
  -H "Content-Type: application/json" \
  -d '{"action":"INVALID"}')
assert_status "POST /game/play (invalid)" 400 "$STATUS"

# ── 11. Game state ───────────────────────────────────────────────
blue "11. Game — GET /game/state"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/game/state" \
  -H "Authorization: Bearer $TOKEN")
assert_status "GET /game/state" 200 "$STATUS"

# ── 12. Reset score ──────────────────────────────────────────────
blue "12. Game — Reset score"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/game/reset" \
  -H "Authorization: Bearer $TOKEN")
assert_status "POST /game/reset" 201 "$STATUS"

# ── 13. High score ───────────────────────────────────────────────
blue "13. Score — GET /score/high"
BODY=$(curl -s "$BASE/score/high")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/score/high")
assert_status "GET /score/high" 200 "$STATUS"
assert_field "/score/high response" "highScore" "$BODY"

# ── Summary ──────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL))
printf "Results: \033[32m%d passed\033[0m / \033[31m%d failed\033[0m / %d total\n" "$PASS" "$FAIL" "$TOTAL"
echo "════════════════════════════════════════════════════════════"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
