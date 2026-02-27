#!/usr/bin/env sh

# Best-effort guard before starting Vite.
# Safety: never SIGKILL, and only stop project-local Vite listeners.

FRONTEND_PORT="5173"
BACKEND_PORT="8000"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://localhost:8000/health}"
APP_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

normalize_pids() {
  printf '%s\n' "$*" | tr ' ' '\n' | awk '/^[0-9]+$/ && !seen[$1]++ { print }' | tr '\n' ' '
}

find_listen_pids() {
  port="$1"

  if command -v lsof >/dev/null 2>&1; then
    lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' '
    return 0
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null |
      awk -v target_port="$port" '
        function endpoint_port(endpoint, idx) {
          idx = match(endpoint, /:[0-9]+$/)
          if (idx > 0) return substr(endpoint, idx + 1)
          return ""
        }
        endpoint_port($4) == target_port {
          line = $0
          while (match(line, /pid=[0-9]+/)) {
            print substr(line, RSTART + 4, RLENGTH - 4)
            line = substr(line, RSTART + RLENGTH)
          }
        }
      ' |
      tr '\n' ' '
    return 0
  fi

  return 0
}

port_has_listener() {
  port="$1"

  if command -v ss >/dev/null 2>&1; then
    if ss -ltn 2>/dev/null | awk -v target_port="$port" '
      function endpoint_port(endpoint, idx) {
        idx = match(endpoint, /:[0-9]+$/)
        if (idx > 0) return substr(endpoint, idx + 1)
        return ""
      }
      endpoint_port($4) == target_port { found = 1; exit 0 }
      END { exit found ? 0 : 1 }
    '; then
      return 0
    fi
  fi

  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  return 1
}

get_cmd() {
  pid="$1"
  ps -p "$pid" -o command= 2>/dev/null
}

get_pid_cwd() {
  pid="$1"
  if [ -d "/proc/$pid" ] && command -v readlink >/dev/null 2>&1; then
    readlink "/proc/$pid/cwd" 2>/dev/null
    return 0
  fi
  return 1
}

is_pid_in_app_dir() {
  pid="$1"
  pid_cwd="$(get_pid_cwd "$pid" || true)"
  if [ -z "$pid_cwd" ]; then
    return 2
  fi

  case "$pid_cwd/" in
    "$APP_DIR/"*) return 0 ;;
  esac
  return 1
}

is_vite_cmd() {
  cmd="$1"
  [ -n "$cmd" ] || return 1
  printf '%s\n' "$cmd" | grep -Eqi '(^|[[:space:]])([^[:space:]]*/)?vite(\.[cm]?js)?([[:space:]]|$)'
}

wait_for_exit() {
  pid="$1"
  max_tries="${2:-15}"
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

if port_has_listener "$FRONTEND_PORT" && [ -z "$frontend_pids" ]; then
  echo "ERROR: Port $FRONTEND_PORT is in use, but owner PID could not be detected." >&2
  echo "       Free the port manually before running dev server." >&2
  exit 1
fi

if [ -n "$frontend_pids" ]; then
  releasable_pids=""
  blocked_pids=""

  for pid in $frontend_pids; do
    cmd="$(get_cmd "$pid")"

    if ! is_vite_cmd "$cmd"; then
      blocked_pids="$blocked_pids $pid"
      continue
    fi

    if is_pid_in_app_dir "$pid"; then
      releasable_pids="$releasable_pids $pid"
      continue
    fi

    # Unknown or non-local cwd: do not kill to avoid touching unrelated tasks.
    blocked_pids="$blocked_pids $pid"
  done

  releasable_pids="$(normalize_pids "$releasable_pids")"
  blocked_pids="$(normalize_pids "$blocked_pids")"

  if [ -n "$blocked_pids" ]; then
    echo "ERROR: Port $FRONTEND_PORT is in use by process(es) not verified as this app's Vite server:$blocked_pids" >&2
    echo "       Stop them manually or run Vite on another port." >&2
    exit 1
  fi

  if [ -n "$releasable_pids" ]; then
    echo "INFO: Releasing existing app-local Vite process(es) on :$FRONTEND_PORT ($releasable_pids)"
    for pid in $releasable_pids; do
      kill "$pid" >/dev/null 2>&1 || true
      if ! wait_for_exit "$pid" 25; then
        echo "ERROR: Could not stop Vite pid $pid gracefully. Refusing SIGKILL by design." >&2
        echo "       Stop it manually before retrying." >&2
        exit 1
      fi
    done
  fi
fi

backend_pids="$(find_listen_pids "$BACKEND_PORT" || true)"
backend_pids="$(normalize_pids "$backend_pids")"

if port_has_listener "$BACKEND_PORT"; then
  echo "INFO: Backend port :$BACKEND_PORT is already in use; leaving existing process untouched."

  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "$BACKEND_HEALTH_URL" >/dev/null 2>&1; then
    echo "INFO: Backend health check succeeded at $BACKEND_HEALTH_URL"
  else
    echo "WARN: Could not verify backend health at $BACKEND_HEALTH_URL"
  fi

  if [ -n "$backend_pids" ]; then
    first_backend_pid="$(echo "$backend_pids" | awk '{print $1}')"
    backend_cmd="$(get_cmd "$first_backend_pid")"
    if [ -n "$backend_cmd" ]; then
      echo "INFO: Detected backend listener pid $first_backend_pid: $backend_cmd"
    fi
  fi
fi

exit 0
