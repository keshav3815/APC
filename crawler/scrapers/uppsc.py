"""
UPPSC Scraper
-------------
Uttar Pradesh Public Service Commission — https://uppsc.up.nic.in
State-level (Uttar Pradesh). Uses a largely static HTML listing page.
"""
from __future__ import annotations

import logging
import re

from bs4 import BeautifulSoup
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class UPPSCScraper(BaseScraper):
    NAME     = "UPPSC"
    ORG      = "Uttar Pradesh Public Service Commission (UPPSC)"
    LEVEL    = "State"
    STATE    = "Uttar Pradesh"
    BASE_URL = "https://uppsc.up.nic.in"

    NOTICE_URL = "https://uppsc.up.nic.in/pub_notices.aspx"

    DEFAULT_META = {
        "eligibility": "UP domicile; Bachelor's degree from a recognised university; age 21–40 years (relaxation for reserved categories per UP Govt rules).",
        "qualification": "Bachelor's Degree from a Recognised University",
        "age_limit": "21–40 years (OBC/SC/ST relaxation as per UP Govt rules)",
        "application_fee": "₹105 for UR/OBC; ₹65 for SC/ST; ₹25 for PwD",
        "selection_process": "Preliminary Exam (screening) → Main Exam → Interview",
    }

    EXAM_META = {
        "pcs": {
            "description": "UPPSC PCS exam for State Service posts including SDM, CDPO, ARTO etc.",
            "selection_process": "Preliminary Exam → Main Exam (General Studies + Optional) → Interview",
        },
        "ro": {
            "description": "UPPSC Review Officer / Assistant Review Officer Exam.",
            "selection_process": "Preliminary Exam → Main Exam",
        },
        "aro": {
            "description": "UPPSC Special Selection/Assistant Review Officer Exam.",
            "selection_process": "Written Exam → Skill Test",
        },
        "lecturers": {
            "description": "UPPSC Lecturers / Assistant Professor recruitment.",
            "qualification": "Post Graduate in relevant subject + NET/SLET",
        },
        "beo": {
            "description": "UPPSC Block Education Officer Exam.",
            "qualification": "Bachelor's Degree in Education (B.Ed.)",
        },
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            soup = self._soup(self.NOTICE_URL)
            exams = self._parse_notices(soup)
        except Exception as exc:
            logger.error("UPPSC fetch error: %s", exc)
        logger.info("UPPSC: found %d exam(s)", len(exams))
        return exams

    def _parse_notices(self, soup: BeautifulSoup) -> list[dict]:
        results = []
        seen = set()

        for a in soup.find_all("a", href=True):
            text = self._clean(a.get_text(), 300)
            if not text or len(text) < 8 or text in seen:
                continue
            seen.add(text)

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

            # Filter out irrelevant links
            if not re.search(r"exam|recruit|advt|notification|circular|vacancy", href + text, re.I):
                continue

            pdf_url = href if href.lower().endswith(".pdf") else None
            dates = {}
            if not pdf_url:
                try:
                    linked = self._soup(href)
                    dates = self._extract_dates_from_text(linked.get_text(separator="\n"))
                    for a2 in linked.find_all("a", href=True):
                        if a2["href"].lower().endswith(".pdf"):
                            pdf_url = a2["href"]
                            if not pdf_url.startswith("http"):
                                pdf_url = self.BASE_URL.rstrip("/") + "/" + pdf_url.lstrip("/")
                            break
                except Exception:
                    pass

            meta = {**self.DEFAULT_META}
            low = text.lower()
            for key, extra in self.EXAM_META.items():
                if key in low:
                    meta.update(extra)
                    break

            results.append(self._make_exam(
                exam_name=text if "uppsc" in text.lower() else f"UPPSC {text}",
                official_website=href if not pdf_url else self.BASE_URL,
                notification_pdf=pdf_url,
                description=meta.pop("description", f"Official UPPSC recruitment: {text}"),
                **meta,
                **dates,
            ))

        return results
