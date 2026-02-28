#!/usr/bin/env bash
# ============================================================
# setup_cron.sh  —  Install/update the daily cron job for the
#                   APC competitive exam crawler.
#
# Usage:
#   chmod +x setup_cron.sh
#   ./setup_cron.sh          # install (runs daily at 06:00)
#   ./setup_cron.sh --remove # remove the cron entry
# ============================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="$SCRIPT_DIR/run_crawler.sh"

# ── Make run_crawler.sh executable if it isn't already ──────
chmod +x "$RUNNER"

# ── Cron schedule: 06:00 every day ──────────────────────────
CRON_SCHEDULE="0 6 * * *"
CRON_CMD="$CRON_SCHEDULE $RUNNER"
CRON_MARKER="# APC_EXAM_CRAWLER"

remove_cron() {
    crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | crontab -
    echo "✓ Cron job removed."
}

install_cron() {
    # Check whether entry already exists
    if crontab -l 2>/dev/null | grep -q "$CRON_MARKER"; then
        echo "Cron entry already present. Updating…"
        remove_cron
    fi

    # Append new entry
    (crontab -l 2>/dev/null; echo "$CRON_CMD $CRON_MARKER") | crontab -
    echo "✓ Cron job installed:"
    echo "  $CRON_CMD"
    echo ""
    echo "The crawler will run every day at 06:00 local time."
    echo "Logs will be written to: $SCRIPT_DIR/logs/"
}

# ── Parse args ───────────────────────────────────────────────
if [[ "${1:-}" == "--remove" ]]; then
    remove_cron
else
    install_cron
fi
