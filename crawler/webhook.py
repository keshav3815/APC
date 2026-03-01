"""
Webhook Pusher
--------------
After the crawler finishes, push results to the Next.js webhook endpoint
so the web app's crawler_runs table stays in sync.
"""
import logging
import os
import requests
from config import SUPABASE_URL

logger = logging.getLogger(__name__)

# The webhook URL — the Next.js /api/crawler/webhook endpoint
# Set via environment variable or derive from NEXT_PUBLIC_SITE_URL
WEBHOOK_URL: str = os.environ.get(
    "CRAWLER_WEBHOOK_URL",
    "https://apc-foundation.vercel.app/api/crawler/webhook"
)
CRON_SECRET: str = os.environ.get("CRON_SECRET", "")


def push_results(
    scrapers: list[str],
    exams: list[dict],
    stats: dict,
    error_log: str = "",
) -> bool:
    """
    Push crawler results to the Next.js webhook endpoint.
    Returns True if successful.
    """
    if not CRON_SECRET:
        logger.warning("CRON_SECRET not set — skipping webhook push.")
        return False

    payload = {
        "scrapers": scrapers,
        "exams": exams,
        "stats": stats,
        "error_log": error_log,
    }

    try:
        resp = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={
                "Authorization": f"Bearer {CRON_SECRET}",
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        if resp.ok:
            data = resp.json()
            logger.info(
                "Webhook push OK: new=%d, updated=%d, errors=%d, run_id=%s",
                data.get("new", 0),
                data.get("updated", 0),
                data.get("errors", 0),
                data.get("run_id", ""),
            )
            return True
        else:
            logger.error(
                "Webhook push failed: HTTP %d — %s",
                resp.status_code,
                resp.text[:500],
            )
            return False
    except Exception as exc:
        logger.error("Webhook push exception: %s", exc)
        return False
