"""
Email Notifier
--------------
Sends "New Exam Released" emails to all registered students when a
brand-new exam is discovered by the crawler.

Uses SMTP (Gmail App Password by default).
"""
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FROM_NAME

logger = logging.getLogger(__name__)


def _build_html(exam: dict) -> str:
    name = exam.get("exam_name", "New Exam")
    org  = exam.get("organization", "")
    last = exam.get("application_last_date", "TBA")
    site = exam.get("official_website", "#")
    level = exam.get("level", "")
    state = f"({exam['state']})" if exam.get("state") else ""

    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }}
    .header {{ background: linear-gradient(135deg,#ea580c,#dc2626); color: #fff; padding: 32px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 22px; }}
    .header p  {{ margin: 8px 0 0; opacity: .85; font-size: 14px; }}
    .body {{ padding: 28px 24px; }}
    .exam-card {{ background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 20px; margin-bottom: 20px; }}
    .exam-card h2 {{ margin: 0 0 8px; color: #1c1917; font-size: 18px; }}
    .badge {{ display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }}
    .badge-open {{ background: #dcfce7; color: #15803d; }}
    .badge-central {{ background: #dbeafe; color: #1d4ed8; }}
    .badge-state  {{ background: #ede9fe; color: #6d28d9; }}
    .info-row {{ display: flex; gap: 8px; margin-top: 10px; font-size: 14px; color: #57534e; }}
    .label {{ font-weight: 700; color: #44403c; min-width: 120px; }}
    .cta {{ display: inline-block; background: #ea580c; color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 8px; }}
    .footer {{ background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; }}
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🎯 New Exam Released!</h1>
    <p>A new competitive exam notification has been published</p>
  </div>
  <div class="body">
    <div class="exam-card">
      <h2>{name}</h2>
      <span class="badge badge-open">Open</span>&nbsp;
      <span class="badge badge-{"central" if level=="Central" else "state"}">{level} {state}</span>

      <div class="info-row"><span class="label">Organization:</span> {org}</div>
      <div class="info-row"><span class="label">Last Date:</span> <strong style="color:#dc2626">{last}</strong></div>
    </div>

    <p style="color:#57534e;font-size:14px;line-height:1.6;">
      Don't miss this opportunity! Click the button below to view full exam details and apply directly on the official website.
    </p>
    <a href="{site}" class="cta" target="_blank">View &amp; Apply Now →</a>
    <p style="margin-top:20px;font-size:13px;color:#9ca3af;">
      You can also find this exam in the <strong>Competitive Exam Hub</strong> on the APC platform.
    </p>
  </div>
  <div class="footer">
    You receive this email because you are registered on the APC student platform.<br>
    © 2026 Association for Progressive Community
  </div>
</div>
</body>
</html>
""".strip()


def send_new_exam_notification(exam: dict, students: list[dict]) -> int:
    """
    Send a "New Exam Released" email to each student.
    Returns the count of successfully sent emails.
    """
    if not SMTP_USER or not SMTP_PASS:
        logger.warning("SMTP not configured — skipping email notifications")
        return 0

    if not students:
        logger.info("No students to notify for exam: %s", exam.get("exam_name"))
        return 0

    html_body = _build_html(exam)
    subject   = f"🎯 New Exam: {exam.get('exam_name', 'Competitive Exam')} — Apply Now!"
    sent = 0

    try:
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10)
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)

        for student in students:
            to_email = student.get("email", "").strip()
            if not to_email:
                continue
            name = student.get("full_name") or "Student"
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
                msg["To"]      = to_email

                personalised = html_body.replace(
                    "Don't miss this opportunity!",
                    f"Hi {name}, don't miss this opportunity!"
                )
                msg.attach(MIMEText(personalised, "html"))
                server.sendmail(FROM_EMAIL, to_email, msg.as_string())
                sent += 1
            except Exception as exc:
                logger.warning("Failed to send to %s: %s", to_email, exc)

        server.quit()
        logger.info("Sent %d/%d notifications for: %s", sent, len(students), exam.get("exam_name"))
    except Exception as exc:
        logger.error("SMTP connection failed: %s", exc)

    return sent
