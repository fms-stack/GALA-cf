"""Billetterie · quotas, Early Bird, billets nominatifs (QR) et contrôle d'accès.

- Les catégories et leurs prix sont définis côté serveur (jamais de prix venant du frontend).
- La jauge de chaque catégorie est modifiable par l'admin (collection `ticket_settings`).
- Une session Stripe ouverte bloque ses places pendant HOLD_MINUTES pour éviter la survente.
- Chaque place payée donne un billet unique (collection `tickets`), scanné une seule fois à l'entrée.
"""
import os
import secrets
import logging
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from pydantic import BaseModel, Field

from mailer import send_email

logger = logging.getLogger(__name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
HOLD_MINUTES = 30
PARIS = ZoneInfo("Europe/Paris")
# Version du texte d'information sur la captation affiché à l'achat (à incrémenter si le texte change)
IMAGE_NOTICE_VERSION = "2026-10-27"

# Jauge publique Chapter I : 800 places (les 120 VIP passent par le Cercle, hors billetterie).
# Répartition par défaut · ajustable dans le back-office une fois le plan de salle validé.
TICKET_PACKAGES = {
    "early":   {"label": "Early Bird · Gradin face", "amount": 40.0,  "currency": "eur", "tier": "public", "order": 0,
                "capacity": 100, "sales_end": "2027-01-31T22:59:59+00:00"},
    "gradin":  {"label": "Gradin face",              "amount": 50.0,  "currency": "eur", "tier": "public", "order": 1, "capacity": 350},
    "lateral": {"label": "Zone latérale (debout)",   "amount": 80.0,  "currency": "eur", "tier": "public", "order": 2, "capacity": 200},
    "premium": {"label": "Gradin premium",           "amount": 120.0, "currency": "eur", "tier": "public", "order": 3, "capacity": 150},
}

# Sans 0/O/1/I pour une saisie manuelle sans ambiguïté à l'entrée
CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def new_ticket_code() -> str:
    raw = "".join(secrets.choice(CODE_ALPHABET) for _ in range(10))
    return f"CF-{raw[:5]}-{raw[5:]}"


def normalize_code(value: str) -> str:
    """Accepte le code seul ou l'URL du billet encodée dans le QR."""
    v = (value or "").strip()
    if "/billet/" in v:
        v = v.rsplit("/billet/", 1)[1].split("?")[0].strip("/")
    return v.upper()


def ticket_url(code: str) -> str:
    return f"{FRONTEND_URL}/billet/{code}"


async def package_settings(db) -> dict:
    pkgs = {k: dict(v, active=True) for k, v in TICKET_PACKAGES.items()}
    async for s in db.ticket_settings.find({}):
        pid = s.get("package_id")
        if pid in pkgs:
            if s.get("capacity") is not None:
                pkgs[pid]["capacity"] = int(s["capacity"])
            if s.get("active") is not None:
                pkgs[pid]["active"] = bool(s["active"])
    return pkgs


async def seat_counts(db) -> dict:
    """{package_id: {"paid": n, "held": n}} · held = sessions ouvertes depuis moins de HOLD_MINUTES."""
    cutoff = (now_utc() - timedelta(minutes=HOLD_MINUTES)).isoformat()
    counts = {pid: {"paid": 0, "held": 0} for pid in TICKET_PACKAGES}
    cursor = db.payment_transactions.find(
        {"package_id": {"$in": list(TICKET_PACKAGES)}},
        {"package_id": 1, "quantity": 1, "payment_status": 1, "status": 1, "created_at": 1},
    )
    async for t in cursor:
        c = counts[t["package_id"]]
        qty = int(t.get("quantity") or 0)
        if t.get("payment_status") == "paid":
            c["paid"] += qty
        elif t.get("status") == "open" and (t.get("created_at") or "") >= cutoff:
            c["held"] += qty
    return counts


def on_sale(pkg: dict) -> bool:
    if not pkg.get("active", True):
        return False
    end = pkg.get("sales_end")
    return not end or now_utc() < datetime.fromisoformat(end)


async def availability(db) -> list:
    pkgs = await package_settings(db)
    counts = await seat_counts(db)
    out = []
    for pid, p in pkgs.items():
        c = counts[pid]
        remaining = max(0, p["capacity"] - c["paid"] - c["held"])
        out.append({
            "id": pid, "label": p["label"], "amount": p["amount"], "currency": p["currency"],
            "tier": p["tier"], "order": p["order"], "sales_end": p.get("sales_end"),
            "remaining": remaining, "on_sale": on_sale(p), "sold_out": remaining == 0,
        })
    out.sort(key=lambda x: x["order"])
    return out


async def reserve_check(db, package_id: str, quantity: int) -> dict:
    """Vérifie qu'une commande peut être ouverte · retourne la définition du billet."""
    pkgs = await package_settings(db)
    pkg = pkgs.get(package_id)
    if not pkg:
        raise HTTPException(status_code=400, detail="Type de billet invalide")
    if not on_sale(pkg):
        raise HTTPException(status_code=409, detail="Cette catégorie n'est plus en vente")
    c = (await seat_counts(db))[package_id]
    remaining = pkg["capacity"] - c["paid"] - c["held"]
    if remaining <= 0:
        raise HTTPException(status_code=409, detail="Catégorie complète")
    if quantity > remaining:
        raise HTTPException(status_code=409, detail=f"Il ne reste que {remaining} place(s) dans cette catégorie")
    return pkg


def _ticket_email(name: str, label: str, codes: list) -> str:
    rows = "".join(
        f'<li style="margin:6px 0"><a href="{ticket_url(c)}" style="color:#A98A5A">{c}</a></li>' for c in codes
    )
    return (
        '<div style="font-family:Georgia,serif;background:#050505;color:#EAE7E1;padding:32px">'
        '<p style="color:#A98A5A;letter-spacing:2px;font-size:11px">COOK &amp; FOOD GALA · CHAPTER I · PARIS · 10.04.2027</p>'
        f"<h1 style=\"font-weight:normal\">Bienvenue, {name}.</h1>"
        f"<p>Votre commande <b>{label}</b> est confirmée. Voici vos billets nominatifs · "
        "chaque lien ouvre un QR code à présenter à l'entrée :</p>"
        f"<ul>{rows}</ul>"
        "<p style=\"font-size:12px;opacity:.7\">Chaque billet est valable pour une seule entrée.</p>"
        "</div>"
    )


async def issue_tickets(db, session_id: str) -> list:
    """Émet les billets d'une commande payée · idempotent (un seul passage par session)."""
    rec = await db.payment_transactions.find_one_and_update(
        {"session_id": session_id, "payment_status": "paid",
         "package_id": {"$in": list(TICKET_PACKAGES)}, "tickets_issued": {"$ne": True}},
        {"$set": {"tickets_issued": True}},
    )
    if not rec:
        return []
    now = now_utc().isoformat()
    docs = [{
        "code": new_ticket_code(),
        "session_id": session_id,
        "package_id": rec["package_id"],
        "package_label": rec.get("package_label", ""),
        "holder_name": rec.get("full_name", ""),
        "email": rec.get("email", ""),
        "seat_index": i + 1,
        "status": "valid",
        "checked_in_at": None,
        "image_consent": rec.get("image_consent"),
        "created_at": now,
    } for i in range(int(rec.get("quantity") or 1))]
    await db.tickets.insert_many(docs)
    codes = [d["code"] for d in docs]
    await send_email(rec.get("email", ""), "Vos billets · Cook & Food Gala 2027",
                     _ticket_email(rec.get("full_name", ""), rec.get("package_label", ""), codes))
    logger.info(f"Issued {len(codes)} ticket(s) for session {session_id}")
    return codes


def qr_svg(data: str) -> str:
    from reportlab.graphics.barcode.qr import QrCodeWidget
    from reportlab.graphics.shapes import Drawing
    from reportlab.graphics import renderSVG

    w = QrCodeWidget(data, barLevel="M")
    x1, y1, x2, y2 = w.getBounds()
    size = 300
    d = Drawing(size, size, transform=[size / (x2 - x1), 0, 0, size / (y2 - y1), 0, 0])
    d.add(w)
    return renderSVG.drawToString(d)


def public_ticket(t: dict) -> dict:
    return {
        "code": t["code"], "holder_name": t.get("holder_name", ""), "package_id": t.get("package_id"),
        "package_label": t.get("package_label", ""), "seat_index": t.get("seat_index"),
        "status": t.get("status"), "checked_in_at": t.get("checked_in_at"),
    }


class PackageSettingsIn(BaseModel):
    capacity: int = Field(ge=0, le=5000)
    active: bool = True


class CheckinIn(BaseModel):
    code: str = Field(min_length=3, max_length=300)


def create_ticketing_router(db, require_role, audit, doc_out):
    router = APIRouter(prefix="/api")
    staff = require_role("admin", "production")

    # ---- Public ----
    @router.get("/public/checkout/tickets/{session_id}")
    async def order_tickets(session_id: str):
        items = await db.tickets.find({"session_id": session_id}).sort("seat_index", 1).to_list(20)
        return [public_ticket(t) for t in items]

    @router.get("/public/ticket/{code}")
    async def get_ticket(code: str):
        t = await db.tickets.find_one({"code": normalize_code(code)})
        if not t:
            raise HTTPException(status_code=404, detail="Billet introuvable")
        return public_ticket(t)

    @router.get("/public/ticket/{code}/qr.svg")
    async def get_ticket_qr(code: str):
        t = await db.tickets.find_one({"code": normalize_code(code)})
        if not t:
            raise HTTPException(status_code=404, detail="Billet introuvable")
        return Response(content=qr_svg(ticket_url(t["code"])), media_type="image/svg+xml",
                        headers={"Cache-Control": "private, max-age=86400"})

    # ---- Back-office ----
    @router.get("/ticketing/overview")
    async def overview(user: dict = Depends(staff)):
        pkgs = await package_settings(db)
        counts = await seat_counts(db)
        rows = []
        for pid, p in sorted(pkgs.items(), key=lambda kv: kv[1]["order"]):
            c = counts[pid]
            checked = await db.tickets.count_documents({"package_id": pid, "status": "checked_in"})
            rows.append({
                "id": pid, "label": p["label"], "amount": p["amount"], "capacity": p["capacity"],
                "active": p["active"], "on_sale": on_sale(p), "sales_end": p.get("sales_end"),
                "paid": c["paid"], "held": c["held"],
                "remaining": max(0, p["capacity"] - c["paid"] - c["held"]),
                "revenue": round(c["paid"] * p["amount"], 2), "checked_in": checked,
            })
        totals = {k: sum(r[k] for r in rows) for k in ("capacity", "paid", "held", "remaining", "revenue", "checked_in")}
        return {"packages": rows, "totals": totals, "hold_minutes": HOLD_MINUTES}

    @router.put("/ticketing/packages/{pid}")
    async def update_package(pid: str, payload: PackageSettingsIn, user: dict = Depends(require_role("admin"))):
        if pid not in TICKET_PACKAGES:
            raise HTTPException(status_code=404, detail="Catégorie inconnue")
        paid = (await seat_counts(db))[pid]["paid"]
        if payload.capacity < paid:
            raise HTTPException(status_code=409, detail=f"Jauge inférieure aux {paid} place(s) déjà vendues")
        await db.ticket_settings.update_one(
            {"package_id": pid},
            {"$set": {"package_id": pid, "capacity": payload.capacity, "active": payload.active,
                      "updated_at": now_utc().isoformat()}},
            upsert=True,
        )
        await audit(user["id"], "ticket_package_update", "ticket_package", pid, payload.model_dump())
        return {"ok": True}

    @router.get("/ticketing/tickets")
    async def list_tickets(user: dict = Depends(staff)):
        items = await db.tickets.find({}).sort("created_at", -1).to_list(2000)
        return [doc_out(x) for x in items]

    @router.post("/ticketing/checkin")
    async def checkin(payload: CheckinIn, user: dict = Depends(staff)):
        code = normalize_code(payload.code)
        now = now_utc().isoformat()
        t = await db.tickets.find_one_and_update(
            {"code": code, "status": "valid"},
            {"$set": {"status": "checked_in", "checked_in_at": now, "checked_in_by": user["id"]}},
        )
        if t:
            await audit(user["id"], "ticket_checkin", "ticket", code)
            t.update(status="checked_in", checked_in_at=now)
            return {"result": "ok", "ticket": public_ticket(t)}
        existing = await db.tickets.find_one({"code": code})
        if not existing:
            raise HTTPException(status_code=404, detail="Billet inconnu")
        at = existing.get("checked_in_at")
        when = datetime.fromisoformat(at).astimezone(PARIS).strftime("%d/%m à %H:%M") if at else "?"
        raise HTTPException(status_code=409, detail=f"Billet déjà scanné le {when} (heure de Paris)")

    return router
