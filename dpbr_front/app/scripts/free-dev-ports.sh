#!/usr/bin/env sh

# Best-effort cleanup for common local dev ports before starting Vite.
# Intentionally never fails the npm lifecycle if no process is bound.

PORTS="5173 8000"

kill_port() {
  port="$1"
  pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' ')"
  elif command -v ss >/dev/null 2>&1; then
    pids="$(ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { if (match($0, /pid=[0-9]+/)) { print substr($0, RSTART + 4, RLENGTH - 4) } }' | tr '\n' ' ')"
  fi

  [ -n "$pids" ] || return 0

  # Try graceful stop first, then hard kill if still alive.
  kill $pids >/dev/null 2>&1 || true
  sleep 0.5

  alive=""
  for pid in $pids; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      alive="$alive $pid"
    fi
  done

  [ -n "$alive" ] && kill -9 $alive >/dev/null 2>&1 || true
}

for port in $PORTS; do
  kill_port "$port"
done

exit 0
