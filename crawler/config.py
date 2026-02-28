"""
Competitive Exam Crawler — Configuration
-----------------------------------------
All settings are loaded from environment variables.
Copy .env.example → .env and fill in your values.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the same directory as this file
load_dotenv(Path(__file__).parent / ".env")

# ── Supabase / PostgreSQL ───────────────────────────────────────────────────
SUPABASE_URL: str        = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_KEY"]   # service-role key (bypass RLS)
DB_HOST: str             = os.environ.get("DB_HOST", "")
DB_PORT: int             = int(os.environ.get("DB_PORT", 5432))
DB_NAME: str             = os.environ.get("DB_NAME", "postgres")
DB_USER: str             = os.environ.get("DB_USER", "postgres")
DB_PASSWORD: str         = os.environ.get("DB_PASSWORD", "")

# ── SMTP (for student email notifications) ──────────────────────────────────
SMTP_HOST: str   = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int   = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER: str   = os.environ.get("SMTP_USER", "")
SMTP_PASS: str   = os.environ.get("SMTP_PASS", "")
FROM_EMAIL: str  = os.environ.get("FROM_EMAIL", SMTP_USER)
FROM_NAME: str   = os.environ.get("FROM_NAME", "APC Exam Hub")

# ── Crawler behaviour ───────────────────────────────────────────────────────
REQUEST_TIMEOUT: int  = int(os.environ.get("REQUEST_TIMEOUT", 30))
REQUEST_DELAY: float  = float(os.environ.get("REQUEST_DELAY", 2.0))   # seconds between requests
MAX_RETRIES: int      = int(os.environ.get("MAX_RETRIES", 3))
HEADLESS_BROWSER: bool = os.environ.get("HEADLESS_BROWSER", "true").lower() == "true"
CHROME_DRIVER_PATH: str = os.environ.get("CHROME_DRIVER_PATH", "")   # leave blank for auto-detect

# ── Logging ─────────────────────────────────────────────────────────────────
LOG_DIR: Path    = Path(__file__).parent / "logs"
LOG_LEVEL: str   = os.environ.get("LOG_LEVEL", "INFO")
LOG_DIR.mkdir(exist_ok=True)

# ── Browser headers ─────────────────────────────────────────────────────────
DEFAULT_HEADERS: dict = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# ── Target websites ──────────────────────────────────────────────────────────
SCRAPER_TARGETS = [
    "upsc",
    "ssc",
    "ibps",
    "bpsc",
    "uppsc",
    "mppsc",
]
