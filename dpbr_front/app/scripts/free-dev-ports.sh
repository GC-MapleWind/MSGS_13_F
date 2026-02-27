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
    lsof_raw="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null)"
    if [ "$?" -eq 0 ]; then
      printf '%s' "$lsof_raw" | tr '\n' ' '
      return 0
    fi
  fi

  if command -v ss >/dev/null 2>&1; then
    ss_raw="$(
      ss -ltnp 2>/dev/null | awk -v target_port="$port" '
        function endpoint_port(endpoint, idx) {
          idx = match(endpoint, /:[0-9]+$/)
          if (idx > 0) {
            return substr(endpoint, idx + 1)
          }
          return ""
        }
        {
          if (endpoint_port($4) == target_port) {
            line = $0
            while (match(line, /pid=[0-9]+/)) {
              print substr(line, RSTART + 4, RLENGTH - 4)
              line = substr(line, RSTART + RLENGTH)
            }
          }
        }
      '
    )"
    if [ "$?" -eq 0 ]; then
      printf '%s' "$ss_raw" | tr '\n' ' '
      return 0
    fi
  fi

  return 1
}

port_has_listener() {
  port="$1"

  if command -v ss >/dev/null 2>&1; then
    if ss -ltn 2>/dev/null | awk -v target_port="$port" '
      function endpoint_port(endpoint, idx) {
        idx = match(endpoint, /:[0-9]+$/)
        if (idx > 0) {
          return substr(endpoint, idx + 1)
        }
        return ""
      }
      endpoint_port($4) == target_port { found = 1; exit 0 }
      END { exit found ? 0 : 1 }
    '; then
      return 0
    fi
  fi

  if command -v lsof >/dev/null 2>&1; then
    if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      return 0
    fi
  fi

  return 1
}

normalize_pids() {
  # Keep only numeric PIDs and de-duplicate while preserving first-seen order.
  printf '%s\n' "$*" | tr ' ' '\n' | awk '/^[0-9]+$/ && !seen[$1]++ { print }' | tr '\n' ' '
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
frontend_pids="$(normalize_pids "$frontend_pids")"
frontend_has_listener=0
if port_has_listener "$FRONTEND_PORT"; then
  frontend_has_listener=1
fi

if [ "$frontend_has_listener" -eq 1 ] && [ -z "$frontend_pids" ]; then
  echo "ERROR: Port $FRONTEND_PORT is in use, but owner PID could not be detected."
  echo "       Free the port manually before running dev server."
  exit 1
fi

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

  vite_pids="$(normalize_pids "$vite_pids")"
  foreign_pids="$(normalize_pids "$foreign_pids")"

  if [ -n "$vite_pids" ]; then
    echo "INFO: Releasing existing Vite process(es) on :$FRONTEND_PORT ($vite_pids)"
    for pid in $vite_pids; do
      cmd_before_kill="$(get_cmd "$pid")"
      current_frontend_pids="$(find_listen_pids "$FRONTEND_PORT" || true)"
      current_frontend_pids="$(normalize_pids "$current_frontend_pids")"
      pid_still_on_frontend_port=0
      for current_pid in $current_frontend_pids; do
        if [ "$current_pid" = "$pid" ]; then
          pid_still_on_frontend_port=1
          break
        fi
      done

      if [ "$pid_still_on_frontend_port" -ne 1 ] || ! echo "$cmd_before_kill" | grep -qi "vite"; then
        if kill -0 "$pid" >/dev/null 2>&1; then
          echo "ERROR: Refusing to stop pid $pid because it is no longer recognized as Vite on :$FRONTEND_PORT."
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
backend_pids="$(normalize_pids "$backend_pids")"
backend_has_listener=0
if port_has_listener "$BACKEND_PORT"; then
  backend_has_listener=1
fi

if [ "$backend_has_listener" -eq 1 ] && [ -z "$backend_pids" ]; then
  echo "INFO: Backend port :$BACKEND_PORT is in use, but owner PID could not be detected."
  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
    echo "INFO: Backend health check succeeded at $BACKEND_HEALTH_URL"
  else
    echo "WARN: Could not verify backend health at $BACKEND_HEALTH_URL"
    echo "      If you just saw '[Errno 98] address already in use' from uvicorn, reuse existing backend or free :$BACKEND_PORT first."
  fi
elif [ -n "$backend_pids" ]; then
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
