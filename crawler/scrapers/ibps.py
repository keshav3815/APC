"""
IBPS Scraper
------------
Scrapes https://www.ibps.in — Common Recruitment Process notifications.
IBPS loads content via JavaScript, so we fall back to Selenium when the
static response is empty, or use the known API endpoint pattern.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from bs4 import BeautifulSoup
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class IBPSScraper(BaseScraper):
    NAME     = "IBPS"
    ORG      = "Institute of Banking Personnel Selection (IBPS)"
    LEVEL    = "Central"
    STATE    = None
    BASE_URL = "https://www.ibps.in"

    NOTICE_URL  = "https://www.ibps.in"          # home — recent notices sidebar
    CAREERS_URL = "https://www.ibps.in/careers"

    EXAM_META = {
        "po": {
            "description": "IBPS PO for Probationary Officers in participating Public Sector Banks.",
            "eligibility": "Graduate in any discipline, age 20–30 years.",
            "qualification": "Any Graduate from a Recognised University",
            "age_limit": "20–30 years (relaxation as per Govt norms)",
            "application_fee": "₹850 for GEN/EWS/OBC; ₹175 for SC/ST/PwD",
            "selection_process": "Preliminary Exam → Main Exam → Interview",
        },
        "clerk": {
            "description": "IBPS Clerk for Clerical Cadre posts in participating PSBs.",
            "eligibility": "Graduate in any discipline, age 20–28 years.",
            "qualification": "Any Graduate from a Recognised University",
            "age_limit": "20–28 years",
            "application_fee": "₹850 for GEN/EWS/OBC; ₹175 for SC/ST/PwD",
            "selection_process": "Preliminary Exam → Main Exam",
        },
        "rrb": {
            "description": "IBPS RRB for Officer Scale and Office Assistant posts in Regional Rural Banks.",
            "eligibility": "Graduate degree + proficiency in local official language.",
            "qualification": "Bachelor's Degree from a Recognised University",
            "age_limit": "18–30 years (varies by post and RRB)",
            "application_fee": "₹850 for GEN/EWS/OBC; ₹175 for SC/ST/PwD",
            "selection_process": "Preliminary Exam → Main Exam → Interview (for Officers)",
        },
        "so": {
            "description": "IBPS SO (Specialist Officer) for IT Officer, Law Officer, HR/Personnel Officer etc.",
            "eligibility": "Graduate + relevant professional qualification.",
            "qualification": "Relevant Professional Degree (IT/Law/Agriculture etc.)",
            "age_limit": "20–30 years",
            "application_fee": "₹850 for GEN/EWS/OBC; ₹175 for SC/ST/PwD",
            "selection_process": "Preliminary (Objective) → Main (Objective) → Interview",
        },
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            exams += self._fetch_static()
        except Exception as exc:
            logger.warning("IBPS static fetch failed (%s), trying Selenium…", exc)
            try:
                exams += self._fetch_selenium()
            except Exception as exc2:
                logger.error("IBPS Selenium fetch also failed: %s", exc2)

        seen, unique = set(), []
        for e in exams:
            key = e["exam_name"]
            if key not in seen:
                seen.add(key)
                unique.append(e)

        logger.info("IBPS: found %d exam(s)", len(unique))
        return unique

    def _fetch_static(self) -> list[dict]:
        results = []
        soup = self._soup(self.NOTICE_URL)

        # IBPS usually has a "Latest Notifications" / "Upcoming Exams" section
        for a in soup.find_all("a", href=True):
            text = self._clean(a.get_text(), 300)
            if not text:
                continue
            low = text.lower()
            if not re.search(r"\bibps\b|crp|rrb|clerk|po\b|specialist", low):
                continue

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

            meta = self._match_meta(text)
            results.append(self._make_exam(
                exam_name=text,
                official_website=href if not href.endswith(".pdf") else self.BASE_URL,
                notification_pdf=href if href.endswith(".pdf") else None,
                **meta,
            ))

        return results

    def _fetch_selenium(self) -> list[dict]:
        results = []
        soup = self._selenium_get(self.CAREERS_URL, wait_selector="a")
        for a in soup.find_all("a", href=True):
            text = self._clean(a.get_text(), 300)
            if not text:
                continue
            low = text.lower()
            if not re.search(r"\bibps\b|crp|rrb|clerk|po\b|specialist", low):
                continue

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

            meta = self._match_meta(text)
            results.append(self._make_exam(
                exam_name=text,
                official_website=href if not href.endswith(".pdf") else self.BASE_URL,
                notification_pdf=href if href.endswith(".pdf") else None,
                **meta,
            ))

        return results

    def _match_meta(self, text: str) -> dict:
        low = text.lower()
        for key, data in self.EXAM_META.items():
            if key in low:
                return data
        return {}
