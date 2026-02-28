"""
Base Scraper
-------------
Abstract base class that every site-specific scraper inherits from.
Provides:
  - Requests session with retry logic
  - Selenium browser (lazy-loaded)
  - Date parsing helpers
  - Sanitisation helpers
  - Standard return type (list of exam dicts)
"""
from __future__ import annotations

import abc
import logging
import re
import time
from datetime import date, datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup
from dateutil import parser as dateparser
from tenacity import retry, stop_after_attempt, wait_fixed

from config import (
    DEFAULT_HEADERS,
    REQUEST_TIMEOUT,
    REQUEST_DELAY,
    MAX_RETRIES,
    HEADLESS_BROWSER,
    CHROME_DRIVER_PATH,
)

logger = logging.getLogger(__name__)

# ── Selenium lazy import ────────────────────────────────────────────────────
_SELENIUM_AVAILABLE = True
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options as ChromeOptions
    from selenium.webdriver.chrome.service import Service as ChromeService
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    _SELENIUM_AVAILABLE = False
    logger.warning("Selenium not installed; dynamic-page scrapers will be skipped.")


MONTH_ABBR = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


class BaseScraper(abc.ABC):
    # Override in subclass
    NAME: str         = "Base"
    ORG: str          = "Unknown Organisation"
    LEVEL: str        = "Central"
    STATE: str | None = None
    BASE_URL: str     = ""

    def __init__(self):
        self._session = self._build_session()
        self._driver  = None   # Selenium WebDriver (lazy)

    # ── Session ─────────────────────────────────────────────────────────────
    def _build_session(self) -> requests.Session:
        s = requests.Session()
        s.headers.update(DEFAULT_HEADERS)
        s.max_redirects = 5
        return s

    @retry(stop=stop_after_attempt(MAX_RETRIES), wait=wait_fixed(REQUEST_DELAY))
    def _get(self, url: str, **kwargs) -> requests.Response:
        resp = self._session.get(url, timeout=REQUEST_TIMEOUT, **kwargs)
        resp.raise_for_status()
        time.sleep(REQUEST_DELAY)
        return resp

    def _soup(self, url: str, **kwargs) -> BeautifulSoup:
        html = self._get(url, **kwargs).text
        return BeautifulSoup(html, "lxml")

    # ── Selenium ─────────────────────────────────────────────────────────────
    def _get_driver(self):
        if not _SELENIUM_AVAILABLE:
            raise RuntimeError("Selenium is not installed.")
        if self._driver is None:
            opts = ChromeOptions()
            if HEADLESS_BROWSER:
                opts.add_argument("--headless=new")
            opts.add_argument("--no-sandbox")
            opts.add_argument("--disable-dev-shm-usage")
            opts.add_argument("--disable-gpu")
            opts.add_argument("--window-size=1920,1080")
            opts.add_argument(f"user-agent={DEFAULT_HEADERS['User-Agent']}")

            if CHROME_DRIVER_PATH:
                service = ChromeService(executable_path=CHROME_DRIVER_PATH)
            else:
                service = ChromeService(ChromeDriverManager().install())

            self._driver = webdriver.Chrome(service=service, options=opts)
        return self._driver

    def _selenium_get(self, url: str, wait_selector: str | None = None, timeout: int = 15) -> BeautifulSoup:
        driver = self._get_driver()
        driver.get(url)
        if wait_selector:
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, wait_selector))
            )
        time.sleep(REQUEST_DELAY)
        return BeautifulSoup(driver.page_source, "lxml")

    def close(self):
        try:
            if self._driver:
                self._driver.quit()
                self._driver = None
        except Exception:
            pass

    # ── Date helpers ─────────────────────────────────────────────────────────
    def _parse_date(self, text: str | None) -> str | None:
        """
        Parse a messy date string → ISO 8601 'YYYY-MM-DD' or None.
        Handles: "15 March 2026", "15/03/2026", "March 15, 2026", etc.
        """
        if not text:
            return None
        text = text.strip()
        # Remove parenthetical notes e.g. "(till 11:59 PM)"
        text = re.sub(r"\(.*?\)", "", text).strip()
        # Replace ordinal suffixes: 15th → 15
        text = re.sub(r"(\d+)(st|nd|rd|th)", r"\1", text, flags=re.IGNORECASE)
        try:
            parsed = dateparser.parse(text, dayfirst=True)
            if parsed:
                return parsed.date().isoformat()
        except Exception:
            pass
        return None

    def _extract_dates_from_text(self, text: str) -> dict:
        """
        Look for common date patterns inside a block of text.
        Returns dict with keys: application_start_date, application_last_date, exam_date
        """
        result = {}
        lines = text.splitlines()

        START_KW  = ["notification", "start date", "begin", "opening date", "apply from"]
        LAST_KW   = ["last date", "closing date", "end date", "final date", "last day"]
        EXAM_KW   = ["exam date", "examination date", "written test", "date of exam", "tentative date"]

        DATE_PAT = re.compile(
            r"\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}"
            r"|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}"
            r"|\d{4}[\/\-\.]\d{2}[\/\-\.]\d{2})\b",
            re.IGNORECASE,
        )

        for line in lines:
            low = line.lower()
            dates = DATE_PAT.findall(line)
            if not dates:
                continue
            parsed_date = self._parse_date(dates[0])
            if not parsed_date:
                continue

            if any(kw in low for kw in LAST_KW):
                result.setdefault("application_last_date", parsed_date)
            elif any(kw in low for kw in EXAM_KW):
                result.setdefault("exam_date", parsed_date)
            elif any(kw in low for kw in START_KW):
                result.setdefault("application_start_date", parsed_date)

        return result

    # ── Text helpers ─────────────────────────────────────────────────────────
    @staticmethod
    def _clean(text: str | None, max_len: int = 0) -> str:
        if not text:
            return ""
        cleaned = " ".join(text.split())
        if max_len and len(cleaned) > max_len:
            cleaned = cleaned[:max_len].rsplit(" ", 1)[0] + "…"
        return cleaned

    # ── Abstract interface ───────────────────────────────────────────────────
    @abc.abstractmethod
    def fetch(self) -> list[dict]:
        """
        Main entry point.
        Returns a list of exam dicts matching the DB schema.

        Required keys per dict:
          exam_name, organization, level, official_website
        Optional: state, description, eligibility, qualification, age_limit,
                  application_start_date, application_last_date, exam_date,
                  notification_pdf, application_fee, selection_process, status
        """
        ...

    # ── Result builder ───────────────────────────────────────────────────────
    def _make_exam(self, **kw) -> dict:
        """Helper to build a well-formed exam dict with defaults."""
        return {
            "exam_name":              self._clean(kw.get("exam_name", ""), 255),
            "organization":           self._clean(kw.get("organization", self.ORG), 255),
            "level":                  kw.get("level", self.LEVEL),
            "state":                  kw.get("state", self.STATE),
            "description":            self._clean(kw.get("description", ""), 2000),
            "eligibility":            self._clean(kw.get("eligibility", ""), 1000),
            "qualification":          self._clean(kw.get("qualification", ""), 500),
            "age_limit":              self._clean(kw.get("age_limit", ""), 200),
            "application_start_date": kw.get("application_start_date"),
            "application_last_date":  kw.get("application_last_date"),
            "exam_date":              kw.get("exam_date"),
            "official_website":       kw.get("official_website", self.BASE_URL),
            "notification_pdf":       kw.get("notification_pdf"),
            "application_fee":        self._clean(kw.get("application_fee", ""), 200),
            "selection_process":      self._clean(kw.get("selection_process", ""), 500),
            "status":                 kw.get("status"),   # None → auto-inferred by database.py
        }
