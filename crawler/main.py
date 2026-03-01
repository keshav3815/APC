"""
Crawler Orchestrator
=====================
Entry point for the APC competitive exam crawler.

Usage
-----
  # Run all scrapers
  python main.py

  # Run specific scrapers only (comma-separated names)
  python main.py --scrapers upsc,ssc

  # Dry run (scrape but don't write to DB or send emails)
  python main.py --dry-run

  # Run and explicitly send notifications for new exams
  python main.py --notify

  # Combine flags
  python main.py --scrapers bpsc,uppsc,mppsc --notify
"""
from __future__ import annotations

import argparse
import logging
import sys
import traceback
from datetime import datetime

import colorlog

from config import LOG_DIR
from database import upsert_exam, get_all_student_emails
from notifier import send_new_exam_notification
from webhook import push_results
from scrapers import ALL_SCRAPERS

# ── Logging ──────────────────────────────────────────────────────────────────
LOG_DIR.mkdir(parents=True, exist_ok=True)
_LOG_FILE = LOG_DIR / f"crawler_{datetime.now():%Y%m%d}.log"

_handler = colorlog.StreamHandler()
_handler.setFormatter(colorlog.ColoredFormatter(
    "%(log_color)s%(asctime)s │ %(levelname)-8s │ %(name)s │ %(message)s",
    datefmt="%H:%M:%S",
    log_colors={
        "DEBUG":    "cyan",
        "INFO":     "green",
        "WARNING":  "yellow",
        "ERROR":    "red",
        "CRITICAL": "bold_red",
    },
))

_file_handler = logging.FileHandler(_LOG_FILE, encoding="utf-8")
_file_handler.setFormatter(logging.Formatter(
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
))

logging.basicConfig(level=logging.INFO, handlers=[_handler, _file_handler])
logger = logging.getLogger("crawler.main")


# ── CLI ───────────────────────────────────────────────────────────────────────
def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="APC Competitive Exam Crawler — fetches exams from official sites."
    )
    p.add_argument(
        "--scrapers",
        metavar="NAMES",
        help="Comma-separated list of scrapers to run (e.g. upsc,ssc,ibps). Default: all.",
    )
    p.add_argument(
        "--dry-run",
        action="store_true",
        help="Scrape data but do NOT write to the database or send any emails.",
    )
    p.add_argument(
        "--notify",
        action="store_true",
        help="Send email notifications to registered students for newly discovered exams.",
    )
    p.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Enable DEBUG-level logging.",
    )
    return p.parse_args()


# ── Main ─────────────────────────────────────────────────────────────────────
def main() -> int:
    args = _parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Filter scrapers if requested
    scraper_classes = ALL_SCRAPERS
    if args.scrapers:
        requested = {n.strip().lower() for n in args.scrapers.split(",")}
        scraper_classes = [
            cls for cls in ALL_SCRAPERS if cls.NAME.lower() in requested
        ]
        if not scraper_classes:
            logger.error("No matching scrapers found for: %s", args.scrapers)
            return 1
        logger.info("Running scrapers: %s", [cls.NAME for cls in scraper_classes])
    else:
        logger.info("Running ALL scrapers (%d)", len(scraper_classes))

    # Pre-fetch student list once (if notifications are enabled)
    students: list[dict] = []
    if args.notify and not args.dry_run:
        try:
            students = get_all_student_emails()
            logger.info("Loaded %d student email(s) for notification.", len(students))
        except Exception as exc:
            logger.warning("Could not load student emails: %s", exc)

    # ── Per-scraper run ──────────────────────────────────────────────────────
    totals = {"scraped": 0, "new": 0, "updated": 0, "errors": 0, "notified": 0}
    all_exams: list[dict] = []   # collect for webhook push

    for ScraperClass in scraper_classes:
        scraper = ScraperClass()
        logger.info("━━━ Running %s scraper ━━━", scraper.NAME)
        try:
            exams = scraper.fetch()
            totals["scraped"] += len(exams)
            logger.info("%s: scraped %d exam(s)", scraper.NAME, len(exams))
            all_exams.extend(exams)   # accumulate for webhook

            for exam in exams:
                if not exam.get("exam_name") or not exam.get("official_website"):
                    logger.debug("Skipping incomplete exam record: %s", exam)
                    continue

                if args.dry_run:
                    logger.info("[DRY-RUN] Would upsert: %s", exam["exam_name"])
                    continue

                try:
                    success, is_new, exam_id = upsert_exam(exam)
                    if success:
                        if is_new:
                            totals["new"] += 1
                            logger.info("NEW exam saved: %s (id=%s)", exam["exam_name"], exam_id)
                            # Notify students about new exam
                            if args.notify and students:
                                sent = send_new_exam_notification(exam, students)
                                totals["notified"] += sent
                                logger.info(
                                    "Notifications sent for '%s': %d/%d",
                                    exam["exam_name"], sent, len(students),
                                )
                        else:
                            totals["updated"] += 1
                            logger.debug("Updated existing exam: %s (id=%s)", exam["exam_name"], exam_id)
                    else:
                        totals["errors"] += 1
                        logger.warning("DB upsert failed for: %s", exam["exam_name"])
                except Exception as exc:
                    totals["errors"] += 1
                    logger.error("Error upserting '%s': %s", exam.get("exam_name"), exc)

        except Exception as exc:
            totals["errors"] += 1
            logger.error("Scraper %s crashed: %s", scraper.NAME, exc)
            logger.debug(traceback.format_exc())
        finally:
            scraper.close()

    # ── Summary ──────────────────────────────────────────────────────────────
    logger.info(
        "━━━ DONE ━━━  scraped=%d  new=%d  updated=%d  errors=%d  notified=%d",
        totals["scraped"], totals["new"], totals["updated"],
        totals["errors"], totals["notified"],
    )

    # ── Push results to the Next.js webhook ──────────────────────────────────
    if not args.dry_run:
        scrapers_used = [cls.NAME for cls in scraper_classes]
        push_results(
            scrapers=scrapers_used,
            exams=all_exams,
            stats=totals,
            error_log="" if totals["errors"] == 0 else f"{totals['errors']} error(s) during run",
        )

    return 0 if totals["errors"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
