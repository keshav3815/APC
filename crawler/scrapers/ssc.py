"""
SSC Scraper
-----------
Scrapes https://ssc.nic.in — latest notices and exam calendar.
SSC renders most content as static HTML tables.
"""
from __future__ import annotations

import logging
import re
from typing import Optional

from bs4 import BeautifulSoup, Tag
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)


class SSCScraper(BaseScraper):
    NAME     = "SSC"
    ORG      = "Staff Selection Commission (SSC)"
    LEVEL    = "Central"
    STATE    = None
    BASE_URL = "https://ssc.nic.in"

    LATEST_NOTICES_URL = "https://ssc.nic.in/portal/LatestNews"
    EXAM_CALENDAR_URL  = "https://ssc.nic.in/portal/ExamCalendar"

    EXAM_META = {
        "cgl": {
            "description": "SSC CGL is conducted for Group B and Group C posts in various Ministries including Inspector, Sub-Inspector, AAO etc.",
            "eligibility": "Graduate from a recognised university, age 18–32 years.",
            "qualification": "Bachelor's Degree in Any Subject",
            "age_limit": "18–32 years (varies by post; relaxation available)",
            "application_fee": "₹100 (Exempted for Female/SC/ST/PwD/ESM)",
            "selection_process": "Tier-I (CBT) → Tier-II (CBT) → Document Verification",
        },
        "chsl": {
            "description": "SSC CHSL for LDC, JSA, PA, SA and DEO posts across Central Departments.",
            "eligibility": "12th pass from a recognised board, age 18–27 years.",
            "qualification": "Class 12 / Intermediate from a Recognised Board",
            "age_limit": "18–27 years (relaxation for SC/ST/OBC/PwD)",
            "application_fee": "₹100 (Exempted for Female/SC/ST/PwD/ESM)",
            "selection_process": "Tier-I (CBT) → Tier-II (CBT + Skill Test / Typing Test)",
        },
        "mts": {
            "description": "SSC MTS for Multi Tasking (Non-Technical) Staff and Havaldar posts.",
            "eligibility": "10th pass from a recognised board, age 18–25 years.",
            "qualification": "Class 10 / Matriculation",
            "age_limit": "18–25 years",
            "application_fee": "₹100 (Exempted for Female/SC/ST/PwD/ESM)",
            "selection_process": "Paper-I (CBT) → Paper-II (Descriptive, qualifying)",
        },
        "gd": {
            "description": "SSC GD Constable in CAPFs, NIA, SSF and Rifleman in AR.",
            "eligibility": "10th pass, age 18–23 years, medical fitness required.",
            "qualification": "Class 10 / Matriculation",
            "age_limit": "18–23 years (relaxation for SC/ST/OBC)",
            "application_fee": "₹100 (Exempted for Female/SC/ST/PwD/ExSM)",
            "selection_process": "CBT → Physical Efficiency Test → Medical",
        },
        "cpo": {
            "description": "SSC CPO for Sub-Inspector in Delhi Police, CAPFs and Assistant Sub-Inspector in CISF.",
            "eligibility": "Bachelor's degree, age 20–25 years.",
            "qualification": "Bachelor's Degree from a Recognised University",
            "age_limit": "20–25 years",
            "application_fee": "₹100 (Exempted for Female/SC/ST/PwD/ExSM)",
            "selection_process": "Paper-I → Physical Standard/Efficiency Test → Medical → Paper-II → DV",
        },
        "jht": {
            "description": "SSC JHT (Junior Hindi Translator) and related posts.",
            "eligibility": "Master's degree in Hindi/English, age 18–30 years.",
            "qualification": "Master's Degree in Hindi or English",
            "age_limit": "18–30 years",
            "application_fee": "₹100",
            "selection_process": "Paper-I (Objective) → Paper-II (Descriptive)",
        },
    }

    def fetch(self) -> list[dict]:
        exams: list[dict] = []
        try:
            exams += self._scrape_latest_notices()
        except Exception as exc:
            logger.error("SSC latest notices error: %s", exc)
        try:
            exams += self._scrape_calendar()
        except Exception as exc:
            logger.error("SSC calendar error: %s", exc)

        # Deduplicate by exam_name
        seen, unique = set(), []
        for e in exams:
            if e["exam_name"] not in seen:
                seen.add(e["exam_name"])
                unique.append(e)

        logger.info("SSC: found %d exam(s)", len(unique))
        return unique

    def _scrape_latest_notices(self) -> list[dict]:
        results = []
        soup = self._soup(self.LATEST_NOTICES_URL)
        rows = soup.find_all("a", href=True)

        for a in rows[:30]:
            text = self._clean(a.get_text(), 300)
            if not text:
                continue
            low = text.lower()
            if not re.search(r"\bssc\b|cgl|chsl|gd|mts|cpo|jht|steno|je\b", low):
                continue

            href = a["href"]
            if not href.startswith("http"):
                href = self.BASE_URL.rstrip("/") + "/" + href.lstrip("/")

            exam_data = self._enrich(text, href)
            if exam_data:
                results.append(exam_data)

        return results

    def _scrape_calendar(self) -> list[dict]:
        results = []
        try:
            soup = self._soup(self.EXAM_CALENDAR_URL)
            table = soup.find("table")
            if not table:
                return results
            for row in table.find_all("tr")[1:]:
                cells = [self._clean(td.get_text(), 200) for td in row.find_all("td")]
                if len(cells) < 3:
                    continue
                name = cells[0] or cells[1]
                if not name:
                    continue

                dates = {}
                for cell in cells:
                    d = self._parse_date(cell)
                    if d and "application_last_date" not in dates:
                        dates["application_last_date"] = d

                meta = self._match_meta(name)
                results.append(self._make_exam(
                    exam_name=name,
                    official_website=self.BASE_URL,
                    **meta,
                    **dates,
                ))
        except Exception as exc:
            logger.debug("SSC calendar parse failed: %s", exc)
        return results

    def _enrich(self, title: str, href: str) -> Optional[dict]:
        pdf_url = href if href.lower().endswith(".pdf") else None

        dates = {}
        if not href.lower().endswith(".pdf"):
            try:
                linked = self._soup(href)
                text = linked.get_text(separator="\n")
                dates = self._extract_dates_from_text(text)
                for a2 in linked.find_all("a", href=True):
                    if a2["href"].lower().endswith(".pdf"):
                        pdf_url = a2["href"]
                        if not pdf_url.startswith("http"):
                            pdf_url = self.BASE_URL.rstrip("/") + "/" + pdf_url.lstrip("/")
                        break
            except Exception:
                pass

        meta = self._match_meta(title)
        return self._make_exam(
            exam_name=title,
            official_website=href if not href.lower().endswith(".pdf") else self.BASE_URL,
            notification_pdf=pdf_url,
            **meta,
            **dates,
        )

    def _match_meta(self, text: str) -> dict:
        low = text.lower()
        for key, data in self.EXAM_META.items():
            if key in low:
                return data
        return {}
