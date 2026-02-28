"""
BPSC Scraper
------------
Bihar Public Service Commission — https://www.bpsc.bih.nic.in
State-level (Bihar). Pages are largely static HTML.
"""
from __future__ import annotations

import logging
import re

from bs4 import BeautifulSoup
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class BPSCScraper(BaseScraper):
    NAME     = "BPSC"
    ORG      = "Bihar Public Service Commission (BPSC)"
    LEVEL    = "State"
    STATE    = "Bihar"
    BASE_URL = "https://www.bpsc.bih.nic.in"

    ADS_URL  = "https://www.bpsc.bih.nic.in/AdvtList.aspx"

    DEFAULT_META = {
        "eligibility": "Bihar domicile preferred; Bachelor's degree from a recognised university; age 20–37 years (relaxation for reserved categories as per Bihar Govt rules).",
        "qualification": "Bachelor's Degree from a Recognised University",
        "age_limit": "20–37 years (SC/ST/EBC relaxation as per Bihar Govt rules)",
        "application_fee": "₹600 (GEN/EBC/EWS); ₹150 (SC/ST/Female/PwD of Bihar)",
        "selection_process": "Preliminary Exam → Main Exam → Interview/Viva Voce",
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            soup = self._soup(self.ADS_URL)
            exams = self._parse_ads(soup)
        except Exception as exc:
            logger.error("BPSC fetch error: %s", exc)
        logger.info("BPSC: found %d exam(s)", len(exams))
        return exams

    def _parse_ads(self, soup: BeautifulSoup) -> list[dict]:
        results = []
        seen = set()

        for a in soup.find_all("a", href=True):
            text = self._clean(a.get_text(), 300)
            if not text or len(text) < 10:
                continue
            if text in seen:
                continue
            seen.add(text)

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

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

            results.append(self._make_exam(
                exam_name=f"BPSC {text}" if "bpsc" not in text.lower() else text,
                official_website=href if not pdf_url else self.BASE_URL,
                notification_pdf=pdf_url,
                description=f"Official BPSC recruitment: {text}",
                **self.DEFAULT_META,
                **dates,
            ))

        return results
