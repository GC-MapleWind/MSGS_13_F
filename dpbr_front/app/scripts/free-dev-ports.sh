#!/usr/bin/env sh

# Dev startup guard:
# - Frontend: enforce stable Vite port handling on 5173.
# - Backend: inspect 8000 and report status, but never kill it.

FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://127.0.0.1:${BACKEND_PORT}/health}"
FRONTEND_FORCE_KILL="${FRONTEND_FORCE_KILL:-0}"
FRONTEND_FORCE_KILL_CONFIRM="${FRONTEND_FORCE_KILL_CONFIRM:-}"

find_listen_pids() {
  port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' '
    return 0
  elif command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p { if (match($0, /pid=[0-9]+/)) { print substr($0, RSTART + 4, RLENGTH - 4) } }' | tr '\n' ' '
    return 0
  fi

  return 1
}

get_cmd() {
  pid="$1"
  ps -p "$pid" -o command= 2>/dev/null
}

wait_for_exit() {
  pid="$1"
  max_tries="${2:-10}"
  tries=0
  while [ "$tries" -lt "$max_tries" ]; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.2
    tries=$((tries + 1))
  done
  return 1
}

frontend_pids="$(find_listen_pids "$FRONTEND_PORT" || true)"
if [ -n "$frontend_pids" ]; then
  foreign_pids=""
  vite_pids=""

  for pid in $frontend_pids; do
    cmd="$(get_cmd "$pid")"
    if echo "$cmd" | grep -qi "vite"; then
      vite_pids="$vite_pids $pid"
    else
      foreign_pids="$foreign_pids $pid"
    fi
  done

  if [ -n "$foreign_pids" ]; then
    echo "ERROR: Port $FRONTEND_PORT is already in use by non-Vite process(es):$foreign_pids" >&2
    echo "       Stop them manually or run Vite on another port." >&2
    exit 1
  fi

  if [ -n "$vite_pids" ]; then
    echo "INFO: Releasing existing Vite process(es) on :$FRONTEND_PORT ($vite_pids)"
    for pid in $vite_pids; do
      cmd_before_kill="$(get_cmd "$pid")"
      if ! echo "$cmd_before_kill" | grep -qi "vite"; then
        if kill -0 "$pid" >/dev/null 2>&1; then
          echo "ERROR: Refusing to stop pid $pid because it is no longer recognized as Vite."
          echo "       Current command: ${cmd_before_kill:-<unknown>}"
          exit 1
        fi
        continue
      fi

      kill "$pid" >/dev/null 2>&1 || true
      if wait_for_exit "$pid" 25; then
        continue
      fi

      cmd_after_wait="$(get_cmd "$pid")"
      if [ "$FRONTEND_FORCE_KILL" = "1" ] && [ "$FRONTEND_FORCE_KILL_CONFIRM" = "YES" ] && echo "$cmd_after_wait" | grep -qi "vite"; then
        echo "WARN: Graceful stop timed out for Vite pid $pid; sending SIGKILL (FRONTEND_FORCE_KILL=1 and FRONTEND_FORCE_KILL_CONFIRM=YES)."
        kill -9 "$pid" >/dev/null 2>&1 || true
        continue
      fi

      echo "WARN: Graceful stop timed out for Vite pid $pid; leaving process running to avoid unexpected SIGKILL."
      echo "ERROR: Could not stop Vite pid $pid gracefully."
      echo "       Stop it manually, or set FRONTEND_FORCE_KILL=1 and FRONTEND_FORCE_KILL_CONFIRM=YES to allow SIGKILL fallback."
      exit 1
    done
  fi
fi

backend_pids="$(find_listen_pids "$BACKEND_PORT" || true)"
if [ -n "$backend_pids" ]; then
  first_backend_pid="$(echo "$backend_pids" | awk '{print $1}')"
  backend_cmd="$(get_cmd "$first_backend_pid")"

  echo "INFO: Backend port :$BACKEND_PORT is already in use (pid $first_backend_pid)."
  if [ -n "$backend_cmd" ]; then
    echo "INFO: Detected process: $backend_cmd"
  fi

  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
    echo "INFO: Backend health check succeeded at $BACKEND_HEALTH_URL"
  else
    echo "WARN: Could not verify backend health at $BACKEND_HEALTH_URL"
    echo "      If you just saw '[Errno 98] address already in use' from uvicorn, reuse existing backend or stop old PID first."
  fi
else
  echo "WARN: No backend process detected on :$BACKEND_PORT"
  echo "      Start backend before using API-backed pages."
fi

exit 0
