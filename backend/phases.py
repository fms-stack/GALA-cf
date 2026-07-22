"""
Phase 4-5-6 modules — Contrats & NDA / Bible PDF / Ecosystem nodes
Imported and wired by server.py
"""
import os
import io
import uuid
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from pathlib import Path

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak


# ============================================================================
# CONTRACT & NDA TEMPLATES
# ============================================================================
CONTRACT_TEMPLATES = {
    "nda": {
        "id": "nda",
        "title": "NDA — Accord de Confidentialité",
        "kind": "nda",
        "body": """Entre les soussignés :

**CVLN Holding** (ci-après dénommée « CVLN »), représentée par son représentant légal,
d'une part,

Et **{full_name}**, {role_title}, ci-après dénommé(e) « le Récipiendaire »,
d'autre part,

**IL A ÉTÉ EXPOSÉ CE QUI SUIT :**

Dans le cadre de la préparation et de la réalisation du Cook & Food Gala — Chapter I, prévu le 12 décembre 2026 à Paris, CVLN est amenée à transmettre au Récipiendaire des informations strictement confidentielles relatives à la production, aux talents, aux montants, aux contrats partenaires, à la Bible technique ainsi qu'à l'ensemble de l'écosystème CVLN.

**ARTICLE 1 — Objet**
Le Récipiendaire s'engage à garder strictement confidentielles toutes les informations transmises, sous quelque forme que ce soit (orale, écrite, numérique, visuelle).

**ARTICLE 2 — Durée**
Le présent engagement de confidentialité prend effet à la date de signature et reste en vigueur pendant cinq (5) années suivant la dernière communication d'information confidentielle.

**ARTICLE 3 — Propriété intellectuelle**
Toute information transmise reste la propriété exclusive de CVLN. Aucun droit de propriété intellectuelle n'est cédé au Récipiendaire au titre du présent accord.

**ARTICLE 4 — Sanction**
Tout manquement engage la responsabilité civile et pénale du Récipiendaire et donne droit à CVLN à des dommages et intérêts.

**ARTICLE 5 — Droit applicable**
Le présent accord est soumis au droit français. Tout litige relèvera des juridictions compétentes de Paris.

Fait à Paris, le {today}.

Le Récipiendaire : ________________________     Pour CVLN : ________________________""",
    },
    "prestation": {
        "id": "prestation",
        "title": "Contrat de Prestation",
        "kind": "contrat",
        "body": """**CONTRAT DE PRESTATION DE SERVICES**

Entre :
**CVLN Holding**, ci-après dénommée « le Client »,
Et **{full_name}**, intervenant en qualité de {role_title}, ci-après dénommé(e) « le Prestataire ».

**ARTICLE 1 — Objet**
Le Prestataire s'engage à réaliser la mission suivante pour le compte du Client dans le cadre du Cook & Food Gala 2026 : {role_title}.

**Livrables attendus :**
{deliverables}

**ARTICLE 2 — Durée**
Du {start_date} au {end_date}.

**ARTICLE 3 — Rémunération**
La prestation est rémunérée à hauteur de **{fee_amount} € HT**, payable en deux fois : 50 % à la signature, 50 % à la livraison finale.

**ARTICLE 4 — Propriété intellectuelle**
Toutes les productions réalisées dans le cadre du présent contrat sont la propriété exclusive de CVLN Holding et de Factory Maker Studio (clause IP forte).

**ARTICLE 5 — Confidentialité**
Le Prestataire est tenu à une obligation stricte de confidentialité, conformément à l'accord NDA signé préalablement.

**ARTICLE 6 — Résiliation**
En cas de manquement grave, le contrat peut être résilié de plein droit avec préavis de 8 jours.

Fait à Paris, le {today}.

Le Prestataire : ________________________     Pour CVLN : ________________________""",
    },
    "cession_droits_auteur": {
        "id": "cession_droits_auteur",
        "title": "Cession des Droits d'Auteur",
        "kind": "contrat",
        "body": """**CONTRAT DE CESSION DES DROITS D'AUTEUR**

Entre **CVLN Holding** (« le Cessionnaire ») et **{full_name}** (« l'Auteur »), il est convenu :

**ARTICLE 1 — Œuvre concernée**
Toute œuvre originale créée par l'Auteur dans le cadre du Cook & Food Gala 2026, au titre de sa mission de {role_title}.

**ARTICLE 2 — Droits cédés**
L'Auteur cède au Cessionnaire, à titre exclusif et pour le monde entier, l'intégralité de ses droits patrimoniaux : reproduction, représentation, adaptation, traduction, exploitation commerciale, sous tous formats et supports connus ou à venir.

**ARTICLE 3 — Durée**
La cession est consentie pour toute la durée légale de protection des droits d'auteur.

**ARTICLE 4 — Rémunération**
La cession est consentie en contrepartie d'un montant forfaitaire de **{fee_amount} € HT**.

**ARTICLE 5 — Garanties**
L'Auteur garantit l'originalité de l'œuvre et l'absence de contrefaçon. Il garantit le Cessionnaire contre toute revendication.

Fait à Paris, le {today}.

L'Auteur : ________________________     Pour CVLN : ________________________""",
    },
    "chef_invite_cip": {
        "id": "chef_invite_cip",
        "title": "Contrat Chef Invité + CIP",
        "kind": "contrat",
        "body": """**CONTRAT CHEF INVITÉ — CIP (Cultural Impact Protocol)**

Entre **CVLN Holding** / **CVL Culinary Innovations** et **{full_name}** (« le Chef Invité »).

**ARTICLE 1 — Mission**
Le Chef Invité participe au Cook & Food Gala 2026 en qualité de chef performeur sur les îlots cuisine de l'arène studio 360°.
Livrables : {deliverables}

**ARTICLE 2 — Standard CIP**
Le Chef Invité s'engage à respecter le Cultural Impact Protocol défini par CVL Culinary Innovations : sourcing, traçabilité, mémoire culinaire afro mondiale, narration culturelle de chaque plat.

**ARTICLE 3 — Période**
Du {start_date} au {end_date}.

**ARTICLE 4 — Rémunération**
**{fee_amount} € HT** versés en deux tranches.

**ARTICLE 5 — Droits image et captation**
Le Chef Invité cède son droit à l'image dans le cadre des captations TC'V et de la diffusion ultérieure série/broadcast.

**ARTICLE 6 — Propriété intellectuelle**
Toute recette créée pour le Gala devient propriété co-exploitée CVLN / CVL Culinary Innovations dans le cadre du standard CIP.

Fait à Paris, le {today}.

Le Chef : ________________________     Pour CVL Culinary Innovations : ________________________""",
    },
    "cession_image_voisins": {
        "id": "cession_image_voisins",
        "title": "Cession droits voisins + image (artiste/performer)",
        "kind": "contrat",
        "body": """**CESSION DE DROITS VOISINS ET DROIT À L'IMAGE**

Entre **CVLN Holding** et **{full_name}** (« l'Artiste »), au titre de sa mission de {role_title}.

**ARTICLE 1 — Droits voisins**
L'Artiste cède à CVLN ses droits voisins relatifs à toute interprétation, performance, captation sonore ou visuelle réalisée dans le cadre du Cook & Food Gala 2026.

**ARTICLE 2 — Droit à l'image**
L'Artiste autorise CVLN, Factory Maker Studio et leurs partenaires à fixer, reproduire et diffuser son image pour toute exploitation liée au Gala, à la série TC'V et aux supports promotionnels, pour une durée de 10 ans.

**ARTICLE 3 — Territoire**
Monde entier, tous médias connus ou à venir.

**ARTICLE 4 — Rémunération**
Forfait global de **{fee_amount} € HT**.

Fait à Paris, le {today}.

L'Artiste : ________________________     Pour CVLN : ________________________""",
    },
    "partenariat": {
        "id": "partenariat",
        "title": "Accord de Partenariat",
        "kind": "contrat",
        "body": """**ACCORD DE PARTENARIAT**

Entre **CVLN Holding** et **{full_name}** (« le Partenaire »).

**ARTICLE 1 — Objet**
Le Partenaire s'associe au Cook & Food Gala 2026 en qualité de partenaire officiel selon les modalités définies dans l'annexe sponsoring.

**ARTICLE 2 — Engagements du Partenaire**
{deliverables}

**ARTICLE 3 — Contreparties accordées**
Visibilité logo · présence sur le site cfceremony.com · mentions broadcast TC'V · cocktail privé · réseautage VIP.

**ARTICLE 4 — Contribution**
**{fee_amount} € HT**.

**ARTICLE 5 — Exclusivité**
Le Partenaire bénéficie d'une exclusivité sectorielle.

**ARTICLE 6 — Image et communication**
Toute communication conjointe est soumise à validation préalable de CVLN.

Fait à Paris, le {today}.

Le Partenaire : ________________________     Pour CVLN : ________________________""",
    },
    "droit_image_public": {
        "id": "droit_image_public",
        "title": "Cession droit à l'image — Public/Convive",
        "kind": "contrat",
        "body": """**AUTORISATION DE FIXATION ET D'EXPLOITATION DE L'IMAGE**

Je soussigné(e) **{full_name}**, présent(e) au Cook & Food Gala 2026 le 12 décembre 2026 à Paris,

Autorise **CVLN Holding** et **Factory Maker Studio** à :

— Me filmer et me photographier durant l'événement ;
— Reproduire et diffuser mon image dans tous les supports liés au Gala (TC'V série, broadcast, communication digitale, presse, supports promotionnels) ;
— Sur tous territoires et pour une durée de 10 ans à compter du présent accord.

Cette autorisation est consentie à titre gracieux dans le cadre de ma présence en qualité de convive.

Je reconnais avoir été informé(e) de mon droit d'opposition exercé dans des conditions raisonnables, à formuler par écrit à contact@cookandfood.gala.

Fait à Paris, le {today}.

Signature : ________________________""",
    },
}


# ============================================================================
# Models
# ============================================================================
class ContractCreateIn(BaseModel):
    template_id: str
    assignment_id: Optional[str] = None  # link to assignment (position + person)
    person_id: Optional[str] = None      # OR direct person (for partenariat/public image)
    deliverables: Optional[str] = ""
    fee_amount: Optional[float] = 0
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    notes: Optional[str] = ""


class ContractStatusIn(BaseModel):
    status: str  # draft, juridique_review, approved, sent, signed, refused, archived


class EcosystemNodeIn(BaseModel):
    code: str
    name: str
    kind: str  # platform, brand, label, studio, partner
    public_visible: bool = False


# ============================================================================
# PDF generation helper
# ============================================================================
def _generate_contract_pdf(title: str, body: str) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=2.5*cm, rightMargin=2.5*cm, topMargin=2.5*cm, bottomMargin=2.5*cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=18, leading=22, alignment=TA_CENTER, spaceAfter=24, textColor="#050505")
    body_style  = ParagraphStyle("body", parent=styles["BodyText"], fontSize=10.5, leading=15, alignment=TA_JUSTIFY, spaceAfter=8, textColor="#050505")
    eyebrow     = ParagraphStyle("eb", parent=styles["BodyText"], fontSize=8, alignment=TA_CENTER, textColor="#A98A5A", spaceAfter=24, leading=10)

    story = []
    story.append(Paragraph("COOK &amp; FOOD GALA — CHAPTER I · PARIS · 12.12.2026", eyebrow))
    story.append(Paragraph(title, title_style))
    for raw in body.split("\n"):
        line = raw.strip()
        if not line:
            story.append(Spacer(1, 6))
            continue
        # bold markdown **...**
        line = line.replace("**", "<b>", 1)
        while "**" in line:
            line = line.replace("**", "</b>", 1)
            if "**" in line:
                line = line.replace("**", "<b>", 1)
        story.append(Paragraph(line, body_style))
    doc.build(story)
    return buf.getvalue()


# ============================================================================
# Router factory — receives db + helpers from main server
# ============================================================================
def create_phase4_router(db, get_current_user, require_role, audit, doc_out):
    router = APIRouter(prefix="/api")

    # ---- Templates ----
    @router.get("/contract-templates")
    async def list_templates(user: dict = Depends(get_current_user)):
        return [{"id": k, "title": v["title"], "kind": v["kind"]} for k, v in CONTRACT_TEMPLATES.items()]

    # ---- Contracts CRUD ----
    @router.get("/contracts")
    async def list_contracts(user: dict = Depends(get_current_user)):
        q = {}
        if user.get("role") == "nomme":
            q["person_id"] = user.get("person_id")  # only their own
        items = await db.contracts.find(q).sort("created_at", -1).to_list(500)
        out = []
        for c in items:
            c = doc_out(c)
            if c.get("person_id"):
                try:
                    p = await db.people.find_one({"_id": ObjectId(c["person_id"])})
                    c["person"] = doc_out(p) if p else None
                except Exception:
                    c["person"] = None
            out.append(c)
        return out

    @router.post("/contracts")
    async def create_contract(payload: ContractCreateIn, user: dict = Depends(require_role("admin", "production"))):
        tmpl = CONTRACT_TEMPLATES.get(payload.template_id)
        if not tmpl:
            raise HTTPException(status_code=400, detail="Template inconnu")

        person_id = payload.person_id
        position_title = ""
        if payload.assignment_id:
            a = await db.assignments.find_one({"_id": ObjectId(payload.assignment_id)})
            if not a:
                raise HTTPException(status_code=400, detail="Affectation introuvable")
            person_id = a.get("person_id")
            pos = await db.positions.find_one({"_id": ObjectId(a["position_id"])}) if a.get("position_id") else None
            position_title = pos.get("title", "") if pos else ""

        person = await db.people.find_one({"_id": ObjectId(person_id)}) if person_id else None
        if not person:
            raise HTTPException(status_code=400, detail="Personne introuvable")

        rendered = tmpl["body"].format(
            full_name=person.get("full_name", "—"),
            role_title=position_title or "—",
            deliverables=payload.deliverables or "À définir",
            fee_amount=f"{(payload.fee_amount or 0):,.2f}".replace(",", " "),
            start_date=payload.start_date or "—",
            end_date=payload.end_date or "—",
            today=datetime.now(timezone.utc).strftime("%d/%m/%Y"),
        )

        doc = {
            "template_id": payload.template_id,
            "template_title": tmpl["title"],
            "kind": tmpl["kind"],
            "assignment_id": payload.assignment_id,
            "person_id": person_id,
            "position_title": position_title,
            "fee_amount": payload.fee_amount or 0,
            "start_date": payload.start_date,
            "end_date": payload.end_date,
            "deliverables": payload.deliverables,
            "rendered_body": rendered,
            "status": "draft",
            "notes": payload.notes,
            "created_by": user["id"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        res = await db.contracts.insert_one(doc)
        await audit(user["id"], "create", "contract", str(res.inserted_id), {"template": payload.template_id})
        return doc_out(await db.contracts.find_one({"_id": res.inserted_id}))

    @router.patch("/contracts/{cid}/status")
    async def update_status(cid: str, payload: ContractStatusIn, user: dict = Depends(get_current_user)):
        allowed = {
            "production": {"draft", "juridique_review"},
            "juridique":  {"approved", "refused"},
            "admin":      {"draft", "juridique_review", "approved", "refused", "sent", "signed", "archived"},
        }
        role = user.get("role", "")
        if payload.status not in allowed.get(role, set()):
            raise HTTPException(status_code=403, detail="Action non autorisée pour votre rôle")
        await db.contracts.update_one({"_id": ObjectId(cid)}, {"$set": {"status": payload.status, "status_at": datetime.now(timezone.utc).isoformat()}})
        await audit(user["id"], "status", "contract", cid, {"to": payload.status})
        return doc_out(await db.contracts.find_one({"_id": ObjectId(cid)}))

    @router.get("/contracts/{cid}/pdf")
    async def download_pdf(cid: str, user: dict = Depends(get_current_user)):
        c = await db.contracts.find_one({"_id": ObjectId(cid)})
        if not c:
            raise HTTPException(status_code=404, detail="Contrat introuvable")
        # RBAC: nomme can only see own
        if user.get("role") == "nomme" and c.get("person_id") != user.get("person_id"):
            raise HTTPException(status_code=403, detail="Accès refusé")
        pdf = _generate_contract_pdf(c.get("template_title", "Contrat"), c.get("rendered_body", ""))
        await audit(user["id"], "download_pdf", "contract", cid)
        filename = f"{c.get('template_id','contrat')}_{cid[-6:]}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    # ============================================================================
    # PHASE 5 — Bible PDF
    # ============================================================================
    BIBLE_DIR = Path("/app/backend/storage/bible")
    BIBLE_DIR.mkdir(parents=True, exist_ok=True)
    BIBLE_FILE = BIBLE_DIR / "GALA_COOK_FOOD_BIBLE.pdf"
    SIGNED_TOKENS = {}  # token -> {user_id, expires_at}

    @router.post("/bible/upload")
    async def bible_upload(file: UploadFile = File(...), user: dict = Depends(require_role("admin"))):
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Fichier PDF requis")
        content = await file.read()
        BIBLE_FILE.write_bytes(content)
        await db.bible_meta.update_one(
            {"_id": "current"},
            {"$set": {
                "uploaded_by": user["id"],
                "uploaded_at": datetime.now(timezone.utc).isoformat(),
                "size": len(content),
                "original_filename": file.filename,
            }},
            upsert=True,
        )
        await audit(user["id"], "upload", "bible", None, {"size": len(content)})
        return {"ok": True, "size": len(content)}

    @router.get("/bible/meta")
    async def bible_meta(user: dict = Depends(get_current_user)):
        m = await db.bible_meta.find_one({"_id": "current"})
        return {
            "exists": BIBLE_FILE.exists(),
            "meta": (doc_out(m) if m else None),
        }

    @router.post("/bible/signed-url")
    async def bible_signed_url(user: dict = Depends(get_current_user)):
        # Conditional access: admin/juridique always OK; nomme only after NDA signed
        role = user.get("role")
        if role == "nomme":
            nda = await db.contracts.find_one({
                "person_id": user.get("person_id"),
                "template_id": "nda",
                "status": "signed",
            })
            if not nda:
                raise HTTPException(status_code=403, detail="Accès Bible réservé après signature du NDA")
        elif role not in {"admin", "juridique", "production"}:
            raise HTTPException(status_code=403, detail="Accès refusé")
        if not BIBLE_FILE.exists():
            raise HTTPException(status_code=404, detail="Bible non uploadée")
        token = secrets.token_urlsafe(24)
        SIGNED_TOKENS[token] = {
            "user_id": user["id"],
            "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        }
        await db.bible_access_logs.insert_one({
            "user_id": user["id"],
            "user_email": user["email"],
            "at": datetime.now(timezone.utc).isoformat(),
            "action": "signed_url_issued",
        })
        return {"url": f"/api/bible/stream/{token}", "expires_in": 300}

    @router.get("/bible/stream/{token}")
    async def bible_stream(token: str):
        rec = SIGNED_TOKENS.get(token)
        if not rec or rec["expires_at"] < datetime.now(timezone.utc):
            raise HTTPException(status_code=403, detail="Lien expiré ou invalide")
        if not BIBLE_FILE.exists():
            raise HTTPException(status_code=404, detail="Bible introuvable")
        # Single-use: pop the token
        SIGNED_TOKENS.pop(token, None)
        return StreamingResponse(
            io.BytesIO(BIBLE_FILE.read_bytes()),
            media_type="application/pdf",
            headers={"Content-Disposition": 'inline; filename="GALA_COOK_FOOD_BIBLE.pdf"'},
        )

    @router.get("/bible/access-logs")
    async def bible_logs(user: dict = Depends(require_role("admin"))):
        items = await db.bible_access_logs.find({}).sort("at", -1).limit(200).to_list(200)
        return [doc_out(x) for x in items]

    # ============================================================================
    # PHASE 6 — Ecosystem nodes (silent)
    # ============================================================================
    @router.get("/ecosystem")
    async def list_ecosystem(user: dict = Depends(require_role("admin"))):
        items = await db.ecosystem_nodes.find({}).sort("name", 1).to_list(200)
        return [doc_out(x) for x in items]

    @router.post("/ecosystem")
    async def create_node(n: EcosystemNodeIn, user: dict = Depends(require_role("admin"))):
        doc = n.model_dump()
        doc["created_at"] = datetime.now(timezone.utc).isoformat()
        res = await db.ecosystem_nodes.insert_one(doc)
        await audit(user["id"], "create", "ecosystem_node", str(res.inserted_id))
        return doc_out(await db.ecosystem_nodes.find_one({"_id": res.inserted_id}))

    @router.delete("/ecosystem/{nid}")
    async def del_node(nid: str, user: dict = Depends(require_role("admin"))):
        await db.ecosystem_nodes.delete_one({"_id": ObjectId(nid)})
        await audit(user["id"], "delete", "ecosystem_node", nid)
        return {"ok": True}

    return router


async def seed_ecosystem_nodes(db, audit):
    """Seed silent ecosystem nodes — never displayed publicly."""
    if await db.ecosystem_nodes.count_documents({}) > 0:
        return
    nodes = [
        {"code": "FREK", "name": "FREK", "kind": "platform", "public_visible": False},
        {"code": "KILTIKONET", "name": "Kiltikonet", "kind": "platform", "public_visible": False},
        {"code": "LABEL_OS", "name": "Label OS", "kind": "label", "public_visible": False},
        {"code": "FMS", "name": "Factory Maker Studio", "kind": "studio", "public_visible": True},
        {"code": "LAURENTIA", "name": "Laurentia", "kind": "brand", "public_visible": False},
        {"code": "CVLN", "name": "CVLN Holding", "kind": "holding", "public_visible": True},
        {"code": "CVL_CULINARY", "name": "CVL Culinary Innovations", "kind": "brand", "public_visible": True},
    ]
    for n in nodes:
        n["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.ecosystem_nodes.insert_one(n)


async def seed_founders(db):
    """Seed Laurent as founder of all CVLN ecosystem brands."""
    if await db.founders_circle.count_documents({}) > 0:
        return
    founders = [
        {"name": "Laurent", "title": "Founder · CVLN Holding · Factory Maker Studio · CVL Culinary Innovations", "bio": "Fondateur de l'écosystème CVLN. Architecte du Cook & Food Gala Chapter I et du standard CIP (Cultural Impact Protocol).", "kind": "Founder", "public_visible": True, "order": 1},
    ]
    for f in founders:
        f["created_at"] = datetime.now(timezone.utc).isoformat()
        await db.founders_circle.insert_one(f)


async def activate_seeded_founders(db):
    # Replace generic placeholders with Laurent as sole founder
    await db.founders_circle.delete_many({"name": {"$in": ["Hôte inaugural", "Conseil culturel", "Conseil gastronomique"]}})
    if await db.founders_circle.count_documents({}) == 0:
        await db.founders_circle.insert_one({
            "name": "Laurent",
            "title": "Founder · CVLN Holding · Factory Maker Studio · CVL Culinary Innovations",
            "bio": "Fondateur de l'écosystème CVLN. Architecte du Cook & Food Gala Chapter I et du standard CIP (Cultural Impact Protocol).",
            "kind": "Founder",
            "public_visible": True,
            "order": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    await db.founders_circle.update_many({"public_visible": False}, {"$set": {"public_visible": True}})
