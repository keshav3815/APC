"""
UPSC Scraper
-------------
Scrapes https://www.upsc.gov.in — the recruitment / notification sections.
UPSC lists notifications as anchor links on a static HTML page, which makes
BeautifulSoup sufficient (no Selenium needed for this site).
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from bs4 import BeautifulSoup, Tag
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class UPSCScraper(BaseScraper):
    NAME     = "UPSC"
    ORG      = "Union Public Service Commission (UPSC)"
    LEVEL    = "Central"
    STATE    = None
    BASE_URL = "https://www.upsc.gov.in"

    NOTIFICATIONS_URL = "https://www.upsc.gov.in/recruitment"

    # Exam → partial name → metadata hint
    KNOWN_EXAMS = {
        "civil services": {
            "eligibility": "Indian citizen, Bachelor's degree from a recognised university, age 21–32 years.",
            "qualification": "Bachelor's Degree in Any Discipline",
            "age_limit": "21–32 years (relaxation for SC/ST/OBC/PwD as per rules)",
            "application_fee": "₹100 (exempted for Female/SC/ST/PwD)",
            "selection_process": "Preliminary Examination → Main Examination → Personality Test (Interview)",
        },
        "combined defence": {
            "eligibility": "Indian citizen, 10+2 or equivalent (service-dependent), age 16.5–24 years.",
            "qualification": "Class XII or equivalent",
            "age_limit": "16.5–24 years depending on service",
            "application_fee": "₹200",
            "selection_process": "Written Exam → SSB Interview → Medical",
        },
        "nda": {
            "eligibility": "Male Indian citizen, unmarried, passed Class 12 or appearing.",
            "qualification": "Class 10+2 / equivalent (Science for AF/Navy)",
            "age_limit": "16.5–19.5 years",
            "application_fee": "₹100 (exempted for SC/ST/Sons of JCO/NCO)",
            "selection_process": "Written Exam → SSB Interview → Medical",
        },
        "engineering services": {
            "eligibility": "Degree in Engineering or equivalent.",
            "qualification": "B.E. / B.Tech in relevant discipline",
            "age_limit": "21–30 years",
            "application_fee": "₹200",
            "selection_process": "Preliminary (Objective) → Main (Conventional) → Personality Test",
        },
        "capf": {
            "eligibility": "Bachelor's degree, age 20–25 years.",
            "qualification": "Bachelor's Degree from a Recognised University",
            "age_limit": "20–25 years",
            "application_fee": "₹200",
            "selection_process": "Written Exam → Physical/Medical Test → Interview",
        },
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            soup = self._soup(self.NOTIFICATIONS_URL)
            exams = self._parse_recruitment_page(soup)
        except Exception as exc:
            logger.error("UPSC fetch error: %s", exc)
        return exams

    def _parse_recruitment_page(self, soup: BeautifulSoup) -> list[dict]:
        results = []

        # UPSC renders active exams in a table or ul/li with anchor links
        # Try multiple selectors to be resilient against minor layout changes
        anchors: list[Tag] = []

        # Selector 1 — main notice board table
        table = soup.find("table", attrs={"class": re.compile(r"notification|exam|recruit", re.I)})
        if table:
            anchors = table.find_all("a", href=True)

        # Fallback — any link containing "exam" or "notification" text
        if not anchors:
            anchors = [
                a for a in soup.find_all("a", href=True)
                if re.search(r"exam|recruit|notification|advt", a.get_text(), re.I)
            ]

        seen = set()
        for a in anchors[:20]:   # cap at 20 — avoid crawling the entire site
            title = self._clean(a.get_text(), 300)
            if not title or title in seen:
                continue
            seen.add(title)

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

            # Only include pages that look like recruitment announcements
            if not re.search(r"exam|recruit|recruit|advt|cse|cds|nda|capf|ies|ifs|geo", href + title, re.I):
                continue

            exam_data = self._build_exam_from_link(title, href)
            if exam_data:
                results.append(exam_data)

        logger.info("UPSC: found %d exam(s)", len(results))
        return results

    def _build_exam_from_link(self, title: str, href: str) -> Optional[dict]:
        pdf_url   = href if href.lower().endswith(".pdf") else None
        page_url  = href if not href.lower().endswith(".pdf") else self.BASE_URL

        # Try to fetch the linked page for date details
        dates = {}
        if not href.lower().endswith(".pdf"):
            try:
                linked_soup = self._soup(href)
                text = linked_soup.get_text(separator="\n")
                dates = self._extract_dates_from_text(text)
                # Look for PDF links on that page
                for a2 in linked_soup.find_all("a", href=True):
                    if a2["href"].lower().endswith(".pdf"):
                        pdf_url = a2["href"]
                        if not pdf_url.startswith("http"):
                            pdf_url = self.BASE_URL.rstrip("/") + "/" + pdf_url.lstrip("/")
                        break
            except Exception as exc:
                logger.debug("Could not fetch UPSC linked page %s: %s", href, exc)

        # Match against known exams for richer metadata
        meta = {}
        low = title.lower()
        for key, data in self.KNOWN_EXAMS.items():
            if key in low:
                meta = data
                break

        return self._make_exam(
            exam_name=f"UPSC {_title_case(title.replace('UPSC', '').strip())}",
            official_website=page_url,
            notification_pdf=pdf_url,
            description=f"Official recruitment notification by UPSC. Title: {title}",
            **meta,
            **dates,
        )


def _title_case(s: str) -> str:
    stop = {"of", "for", "and", "in", "the", "a", "an", "to"}
    words = s.split()
    return " ".join(
        w.capitalize() if i == 0 or w.lower() not in stop else w.lower()
        for i, w in enumerate(words)
    )
