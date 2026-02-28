#!/usr/bin/env bash
# ============================================================
# run_crawler.sh  —  Shell wrapper for the APC exam crawler
# Designed to be called directly from cron.
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

LOGFILE="$LOG_DIR/cron_$(date +%Y%m%d_%H%M%S).log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting APC exam crawler…" | tee -a "$LOGFILE"

# ── Activate virtual environment if it exists ────────────────
if [[ -d "$SCRIPT_DIR/venv" ]]; then
    # shellcheck disable=SC1091
    source "$SCRIPT_DIR/venv/bin/activate"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Activated virtualenv at $SCRIPT_DIR/venv" >> "$LOGFILE"
fi

# ── Run the crawler ──────────────────────────────────────────
python "$SCRIPT_DIR/main.py" --notify "$@" >> "$LOGFILE" 2>&1
EXIT_CODE=$?

if [[ $EXIT_CODE -eq 0 ]]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Crawler finished successfully." | tee -a "$LOGFILE"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Crawler exited with code $EXIT_CODE." | tee -a "$LOGFILE"
fi

exit $EXIT_CODE
