"""Concours Héritage & Création · chefs, jury, notation pondérée, vote du public.

- Les chefs passent par les statuts candidat → qualifie → finaliste → laureat (ou elimine).
- Chaque juré note chaque chef par épreuve sur 4 critères (0 à 10), pondérés par CRITERIA.
- Le vote du public ne porte que sur les finalistes, une voix par adresse e-mail, ouvert/fermé par l'admin.
  Une voix ne compte qu'après confirmation par le lien reçu par e-mail (48 h).
"""
import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Literal, Optional

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field, EmailStr
from pymongo.errors import DuplicateKeyError

from mailer import send_email

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
EXPOSE_DEV_LINKS = os.environ.get("EXPOSE_DEV_LINKS", "false").lower() == "true"
VOTE_LINK_HOURS = 48

# Pondération du jury (somme = 1) · goût, technique, créativité, histoire racontée par le plat
CRITERIA = {"gout": 0.35, "technique": 0.25, "creativite": 0.20, "recit": 0.20}
ROUNDS = ("qualifications", "finale")
CHEF_STATUSES = ("candidat", "qualifie", "finaliste", "laureat", "elimine")
PUBLIC_STATUSES = ("finaliste", "laureat")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def weighted(score: dict) -> float:
    return round(sum(float(score[k]) * w for k, w in CRITERIA.items()), 2)


class ChefIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    origin: Optional[str] = Field(default="", max_length=120)  # territoire, pays
    specialty: Optional[str] = Field(default="", max_length=200)
    bio: Optional[str] = Field(default="", max_length=2000)
    photo_url: Optional[str] = Field(default="", max_length=500)
    email: Optional[str] = Field(default="", max_length=200)
    status: Literal["candidat", "qualifie", "finaliste", "laureat", "elimine"] = "candidat"
    # Autorisation de droit à l'image (contrat « Chef Invité + CIP ») · requise avant tournage et publication
    image_release: Literal["aucune", "envoyee", "signee"] = "aucune"


class JurorIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    role: Optional[str] = Field(default="", max_length=200)  # titre, territoire représenté


class ScoreIn(BaseModel):
    chef_id: str
    juror_id: str
    round: Literal["qualifications", "finale"]
    gout: float = Field(ge=0, le=10)
    technique: float = Field(ge=0, le=10)
    creativite: float = Field(ge=0, le=10)
    recit: float = Field(ge=0, le=10)


class VoteConfirmIn(BaseModel):
    token: str = Field(min_length=10, max_length=100)


class SettingsIn(BaseModel):
    vote_open: bool


class VoteIn(BaseModel):
    chef_id: str
    email: EmailStr
    honeypot: Optional[str] = ""


def public_chef(c: dict) -> dict:
    return {"id": str(c["_id"]), "name": c["name"], "origin": c.get("origin", ""),
            "specialty": c.get("specialty", ""), "bio": c.get("bio", ""),
            "photo_url": c.get("photo_url", ""), "status": c.get("status")}


async def ensure_indexes(db):
    await db.competition_scores.create_index([("chef_id", 1), ("juror_id", 1), ("round", 1)], unique=True)
    await db.competition_votes.create_index("email", unique=True)
    await db.competition_vote_requests.create_index("token", unique=True)
    await db.competition_vote_requests.create_index("email", unique=True)


def create_competition_router(db, require_role, audit, doc_out):
    router = APIRouter(prefix="/api")
    staff = require_role("admin", "production")

    async def get_settings() -> dict:
        s = await db.competition_settings.find_one({"_id": "settings"})
        return {"vote_open": bool(s and s.get("vote_open"))}

    async def get_chef(cid: str) -> dict:
        c = await db.competition_chefs.find_one({"_id": ObjectId(cid)})
        if not c:
            raise HTTPException(status_code=404, detail="Chef introuvable")
        return c

    # ---- Chefs ----
    @router.get("/competition/chefs")
    async def list_chefs(user: dict = Depends(staff)):
        items = await db.competition_chefs.find({}).sort("name", 1).to_list(500)
        return [doc_out(x) for x in items]

    @router.post("/competition/chefs")
    async def create_chef(payload: ChefIn, user: dict = Depends(staff)):
        doc = {**payload.model_dump(), "created_at": now_iso()}
        res = await db.competition_chefs.insert_one(doc)
        await audit(user["id"], "chef_create", "competition_chef", str(res.inserted_id))
        return doc_out({**doc, "_id": res.inserted_id})

    @router.put("/competition/chefs/{cid}")
    async def update_chef(cid: str, payload: ChefIn, user: dict = Depends(staff)):
        await get_chef(cid)
        await db.competition_chefs.update_one({"_id": ObjectId(cid)}, {"$set": payload.model_dump()})
        await audit(user["id"], "chef_update", "competition_chef", cid,
                    {"status": payload.status, "image_release": payload.image_release})
        return {"ok": True}

    @router.delete("/competition/chefs/{cid}")
    async def delete_chef(cid: str, user: dict = Depends(require_role("admin"))):
        await get_chef(cid)
        await db.competition_chefs.delete_one({"_id": ObjectId(cid)})
        await db.competition_scores.delete_many({"chef_id": cid})
        await audit(user["id"], "chef_delete", "competition_chef", cid)
        return {"ok": True}

    # ---- Jury ----
    @router.get("/competition/jurors")
    async def list_jurors(user: dict = Depends(staff)):
        items = await db.competition_jurors.find({}).sort("name", 1).to_list(200)
        return [doc_out(x) for x in items]

    @router.post("/competition/jurors")
    async def create_juror(payload: JurorIn, user: dict = Depends(staff)):
        doc = {**payload.model_dump(), "created_at": now_iso()}
        res = await db.competition_jurors.insert_one(doc)
        await audit(user["id"], "juror_create", "competition_juror", str(res.inserted_id))
        return doc_out({**doc, "_id": res.inserted_id})

    @router.delete("/competition/jurors/{jid}")
    async def delete_juror(jid: str, user: dict = Depends(require_role("admin"))):
        res = await db.competition_jurors.delete_one({"_id": ObjectId(jid)})
        if not res.deleted_count:
            raise HTTPException(status_code=404, detail="Juré introuvable")
        await db.competition_scores.delete_many({"juror_id": jid})
        await audit(user["id"], "juror_delete", "competition_juror", jid)
        return {"ok": True}

    # ---- Notation ----
    @router.get("/competition/scores")
    async def list_scores(stage: Literal["qualifications", "finale"] = Query(alias="round"), user: dict = Depends(staff)):
        items = await db.competition_scores.find({"round": stage}).to_list(5000)
        return [doc_out(x) for x in items]

    @router.put("/competition/scores")
    async def upsert_score(payload: ScoreIn, user: dict = Depends(staff)):
        await get_chef(payload.chef_id)
        if not await db.competition_jurors.find_one({"_id": ObjectId(payload.juror_id)}):
            raise HTTPException(status_code=404, detail="Juré introuvable")
        doc = payload.model_dump()
        doc.update(total=weighted(doc), updated_at=now_iso(), entered_by=user["id"])
        await db.competition_scores.update_one(
            {"chef_id": payload.chef_id, "juror_id": payload.juror_id, "round": payload.round},
            {"$set": doc}, upsert=True,
        )
        await audit(user["id"], "score_upsert", "competition_score", payload.chef_id,
                    {"juror_id": payload.juror_id, "round": payload.round, "total": doc["total"]})
        return {"ok": True, "total": doc["total"]}

    @router.get("/competition/leaderboard")
    async def leaderboard(stage: Literal["qualifications", "finale"] = Query(alias="round"), user: dict = Depends(staff)):
        chefs = await db.competition_chefs.find({}).to_list(500)
        scores = await db.competition_scores.find({"round": stage}).to_list(5000)
        votes = {}
        async for v in db.competition_votes.aggregate([{"$group": {"_id": "$chef_id", "n": {"$sum": 1}}}]):
            votes[v["_id"]] = v["n"]
        rows = []
        for c in chefs:
            cid = str(c["_id"])
            mine = [s for s in scores if s["chef_id"] == cid]
            n = len(mine)
            rows.append({
                "chef_id": cid, "name": c["name"], "origin": c.get("origin", ""), "status": c.get("status"),
                "image_release": c.get("image_release", "aucune"),
                "scores": n,
                "total": round(sum(s["total"] for s in mine) / n, 2) if n else None,
                "criteria": {k: round(sum(float(s[k]) for s in mine) / n, 2) if n else None for k in CRITERIA},
                "votes": votes.get(cid, 0),
            })
        rows.sort(key=lambda r: (r["total"] is None, -(r["total"] or 0), r["name"]))
        return {"round": stage, "weights": CRITERIA, "rows": rows,
                "jurors": await db.competition_jurors.count_documents({}),
                "votes_total": sum(votes.values())}

    # ---- Vote du public ----
    @router.get("/competition/settings")
    async def read_settings(user: dict = Depends(staff)):
        return await get_settings()

    @router.put("/competition/settings")
    async def write_settings(payload: SettingsIn, user: dict = Depends(require_role("admin"))):
        await db.competition_settings.update_one({"_id": "settings"}, {"$set": {"vote_open": payload.vote_open}}, upsert=True)
        await audit(user["id"], "vote_toggle", "competition_settings", "settings", payload.model_dump())
        return {"ok": True}

    @router.get("/public/competition")
    async def public_competition():
        items = await db.competition_chefs.find(
            {"status": {"$in": list(PUBLIC_STATUSES)}, "image_release": "signee"}).sort("name", 1).to_list(50)
        return {**(await get_settings()), "finalists": [public_chef(c) for c in items]}

    @router.post("/public/competition/vote")
    async def public_vote(payload: VoteIn):
        if payload.honeypot:
            return {"ok": True}
        if not (await get_settings())["vote_open"]:
            raise HTTPException(status_code=403, detail="Le vote du public n'est pas ouvert")
        try:
            chef = await db.competition_chefs.find_one({"_id": ObjectId(payload.chef_id), "status": {"$in": list(PUBLIC_STATUSES)},
                                                         "image_release": "signee"})
        except Exception:
            chef = None
        if not chef:
            raise HTTPException(status_code=400, detail="Ce chef ne fait pas partie des finalistes")
        email = payload.email.lower()
        if await db.competition_votes.find_one({"email": email}):
            raise HTTPException(status_code=409, detail="Un vote a déjà été enregistré pour cette adresse")
        # Vote en attente : un seul par adresse (un nouveau choix remplace l'ancien tant qu'il n'est pas confirmé)
        token = secrets.token_urlsafe(24)
        expires = (datetime.now(timezone.utc) + timedelta(hours=VOTE_LINK_HOURS)).isoformat()
        await db.competition_vote_requests.update_one(
            {"email": email},
            {"$set": {"email": email, "chef_id": payload.chef_id, "token": token, "expires_at": expires, "created_at": now_iso()}},
            upsert=True,
        )
        link = f"{FRONTEND_URL}/concours?confirmer={token}"
        await send_email(email, "Confirmez votre vote · Concours Héritage & Création",
                         f"<p>Vous avez choisi <b>{chef['name']}</b> pour le prix du public du Cook &amp; Food Gala.</p>"
                         f'<p>Pour que votre voix compte, confirmez-la (lien valable {VOTE_LINK_HOURS} h) :</p>'
                         f'<p><a href="{link}">{link}</a></p>')
        return {"ok": True, "pending": True, "dev_link": link if EXPOSE_DEV_LINKS else None}

    @router.post("/public/competition/vote/confirm")
    async def confirm_vote(payload: VoteConfirmIn):
        req = await db.competition_vote_requests.find_one({"token": payload.token})
        if not req:
            raise HTTPException(status_code=404, detail="Lien de confirmation invalide ou déjà utilisé")
        if datetime.fromisoformat(req["expires_at"]) < datetime.now(timezone.utc):
            await db.competition_vote_requests.delete_one({"_id": req["_id"]})
            raise HTTPException(status_code=410, detail="Lien de confirmation expiré · merci de voter à nouveau")
        if not (await get_settings())["vote_open"]:
            raise HTTPException(status_code=403, detail="Le vote du public est clos")
        chef = await db.competition_chefs.find_one({"_id": ObjectId(req["chef_id"])})
        try:
            await db.competition_votes.insert_one({"chef_id": req["chef_id"], "email": req["email"],
                                                   "confirmed_at": now_iso(), "created_at": req.get("created_at")})
        except DuplicateKeyError:
            raise HTTPException(status_code=409, detail="Un vote a déjà été enregistré pour cette adresse")
        finally:
            await db.competition_vote_requests.delete_one({"_id": req["_id"]})
        return {"ok": True, "chef": chef["name"] if chef else ""}

    return router
