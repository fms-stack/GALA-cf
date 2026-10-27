"""Transactional e-mail · Resend HTTP API.

Mode mock tant que RESEND_API_KEY est vide : le message est seulement journalisé.
L'adresse d'expédition (RESEND_FROM) doit appartenir à un domaine vérifié chez Resend.
"""
import os
import logging

import httpx

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM", "Cook & Food Gala <billetterie@cfceremony.com>")


async def send_email(to: str, subject: str, html: str) -> bool:
    if not RESEND_API_KEY:
        logger.warning(f"[MOCK EMAIL] to={to} subject={subject!r}")
        return False
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                json={"from": RESEND_FROM, "to": [to], "subject": subject, "html": html},
            )
        if r.status_code >= 300:
            logger.error(f"[Resend] {r.status_code} for {to}: {r.text[:200]}")
            return False
        logger.info(f"[Resend] sent to {to}: {subject!r}")
        return True
    except httpx.HTTPError as e:
        logger.error(f"[Resend] error for {to}: {e}")
        return False
