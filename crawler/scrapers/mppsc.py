"""
MPPSC Scraper
-------------
Madhya Pradesh Public Service Commission — https://mppsc.mp.gov.in
State-level (Madhya Pradesh). Static HTML + occasional PDF notifications.
"""
from __future__ import annotations

import logging
import re

from bs4 import BeautifulSoup
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class MPPSCScraper(BaseScraper):
    NAME     = "MPPSC"
    ORG      = "Madhya Pradesh Public Service Commission (MPPSC)"
    LEVEL    = "State"
    STATE    = "Madhya Pradesh"
    BASE_URL = "https://mppsc.mp.gov.in"

    ADS_URL  = "https://mppsc.mp.gov.in/advertisements"

    DEFAULT_META = {
        "eligibility": "MP domicile; Bachelor's degree from a recognised university; age 21–40 years (relaxation for reserved categories per MP Govt rules).",
        "qualification": "Bachelor's Degree from a Recognised University",
        "age_limit": "21–40 years (SC/ST/OBC relaxation as per MP Govt rules)",
        "application_fee": "₹500 for GEN; ₹250 for SC/ST/OBC of MP",
        "selection_process": "Preliminary Exam → Main Exam → Interview",
    }

    EXAM_META = {
        "state service": {
            "description": "MPPSC State Service Exam for Deputy Collector, DSP, Treasury Officer and other Group A/B posts.",
            "selection_process": "Preliminary Exam → Main Exam (9 papers + 2 optional papers) → Interview",
        },
        "forest service": {
            "description": "MPPSC State Forest Service Exam for Deputy Forest Ranger and District Range Officer posts.",
            "qualification": "B.Sc. (with Physics/Chemistry/Math/Biology) or equivalent",
        },
        "assistant professor": {
            "description": "MPPSC Assistant Professor exam for government degree colleges.",
            "qualification": "Post Graduate + NET/SLET/SET qualification",
        },
        "sub engineer": {
            "description": "MPPSC Sub Engineer/Junior Engineer posts in various state departments.",
            "qualification": "Diploma or B.E./B.Tech in relevant discipline",
        },
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            soup = self._soup(self.ADS_URL)
            exams = self._parse_ads(soup)
        except Exception as exc:
            logger.error("MPPSC fetch error: %s", exc)
        logger.info("MPPSC: found %d exam(s)", len(exams))
        return exams

    def _parse_ads(self, soup: BeautifulSoup) -> list[dict]:
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

            if not re.search(r"exam|recruit|advt|notification|vacancy|advertisement", href + text, re.I):
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
                exam_name=text if "mppsc" in text.lower() else f"MPPSC {text}",
                official_website=href if not pdf_url else self.BASE_URL,
                notification_pdf=pdf_url,
                description=meta.pop("description", f"Official MPPSC recruitment: {text}"),
                **meta,
                **dates,
            ))

        return results
