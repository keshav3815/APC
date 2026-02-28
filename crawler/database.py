"""
Database writer
----------------
Handles all Supabase / PostgreSQL I/O for the crawler.
Uses the Supabase Python client (service-role key, so RLS is bypassed).
"""
import logging
from typing import Optional
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

logger = logging.getLogger(__name__)

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client


def exam_exists(exam_name: str, organization: str) -> Optional[str]:
    """
    Return the existing exam id if (exam_name, organization) already in DB,
    otherwise return None.
    """
    try:
        db = get_client()
        res = (
            db.table("exams")
            .select("id")
            .ilike("exam_name", exam_name)
            .ilike("organization", organization)
            .maybe_single()
            .execute()
        )
        return res.data["id"] if res.data else None
    except Exception as exc:
        logger.warning("exam_exists check failed: %s", exc)
        return None


def upsert_exam(data: dict) -> tuple[bool, bool, str]:
    """
    Insert or update an exam row.

    Returns (success, is_new, exam_id)
      is_new = True  → freshly inserted
      is_new = False → updated existing row
    """
    db = get_client()

    # Normalise
    data.setdefault("is_active", True)
    data.setdefault("status", _infer_status(data))
    data.setdefault("level", "Central")

    existing_id = exam_exists(data["exam_name"], data["organization"])

    try:
        if existing_id:
            # Update — keep existing id
            res = (
                db.table("exams")
                .update({k: v for k, v in data.items() if k not in ("id",)})
                .eq("id", existing_id)
                .execute()
            )
            logger.info("Updated existing exam: %s", data["exam_name"])
            return True, False, existing_id
        else:
            res = db.table("exams").insert(data).execute()
            new_id = res.data[0]["id"] if res.data else ""
            logger.info("Inserted new exam: %s (id=%s)", data["exam_name"], new_id)
            return True, True, new_id
    except Exception as exc:
        logger.error("upsert_exam failed for '%s': %s", data.get("exam_name"), exc)
        return False, False, ""


def get_all_student_emails() -> list[dict]:
    """
    Return all active student profiles with email, full_name.
    """
    try:
        db = get_client()
        res = (
            db.table("profiles")
            .select("id, email, full_name")
            .eq("is_active", True)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        logger.error("get_all_student_emails failed: %s", exc)
        return []


def _infer_status(data: dict) -> str:
    """
    Infer Open / Closed / Coming Soon from dates if not already provided.
    """
    import datetime
    today = datetime.date.today()

    def parse(d):
        if not d:
            return None
        try:
            return datetime.date.fromisoformat(str(d)[:10])
        except Exception:
            return None

    start = parse(data.get("application_start_date"))
    end   = parse(data.get("application_last_date"))

    if end and end < today:
        return "Closed"
    if start and start > today:
        return "Coming Soon"
    return "Open"
