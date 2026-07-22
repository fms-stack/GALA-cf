# DOSSIER TECHNIQUE — CVLN Gala OS / Cook & Food Gala 2026
## Propriété Intellectuelle Logicielle — Version 1.0

**Titulaire** : CVLN Holding · **Éditeur** : Factory Maker Studio · **Date** : Juin 2026

---

## 1. CODE SOURCE

### 1.1 Structure du projet
```
/app/
├── backend/
│   ├── server.py                 (2000+ lignes — API FastAPI complète)
│   ├── phases.py                 (Modules Phase 4/5/6 : contrats, bible, écosystème)
│   ├── requirements.txt          (Dépendances Python)
│   ├── .env                      (Secrets : MONGO_URL, JWT_SECRET, STRIPE_API_KEY, RESEND_API_KEY, ADMIN_EMAIL/PASSWORD, APP_NAME, FRONTEND_URL)
│   └── storage/bible/            (Object storage local Bible PDF chiffrée)
├── frontend/
│   ├── package.json              (Dépendances JS)
│   ├── tailwind.config.js        (Palette Cook & Food : noir/ivoire/or/sable/brun/sauge)
│   ├── .env                      (REACT_APP_BACKEND_URL, REACT_APP_AMBIENT_AUDIO_URL)
│   └── src/
│       ├── App.js                (Routing + AuthProvider + I18nProvider + CustomCursor + AmbientAudio)
│       ├── App.css / index.css   (Fonts Cormorant Garamond + Switzer + CSS vars thèmes)
│       ├── lib/
│       │   ├── api.js            (Axios avec withCredentials)
│       │   ├── auth.jsx          (AuthContext JWT cookies)
│       │   ├── i18n.jsx          (9 dictionnaires + LangSwitcher)
│       │   └── cinematics.js     (GSAP ScrollTrigger : parallax/split-text/reveal/stagger)
│       ├── components/
│       │   ├── Logo.jsx          (SVG anneaux concentriques + wave signature)
│       │   ├── Countdown.jsx     (J-XXX vers 12/12/2026)
│       │   ├── CustomCursor.jsx  (Cercle or + halo délayé)
│       │   ├── AmbientAudio.jsx  (Audio HTML5 opt-in)
│       │   └── ui/               (shadcn/ui composants)
│       ├── layouts/
│       │   ├── PublicLayout.jsx  (Nav publique + burger + lang + footer FMS + AnimatedOutlet)
│       │   └── AdminLayout.jsx   (Sidebar responsive + burger mobile + logout)
│       └── pages/
│           ├── public/           (15 pages : Home, Concept, Prix, Billetterie, Candidatures, Casting, Sponsoring, RSVP, Contact, SurInvitation, FoundersCircle, CercleRestreint, Mecenat)
│           └── admin/            (10 pages : Login, Dashboard, Positions, People, Assignments, Invitations, Submissions, Contracts, Bible, Inner)
├── memory/
│   ├── PRD.md                    (Product Requirements Document)
│   ├── test_credentials.md       (Comptes admin/production/juridique)
│   └── IP_TECHNICAL_DOSSIER.md   (Ce fichier)
└── test_reports/                 (Rapports testing_agent)
```

### 1.2 Langages & frameworks
- **Backend** : Python 3.11+, FastAPI, Motor (async MongoDB), Pydantic v2, PyJWT, bcrypt, reportlab, Stripe SDK, uvicorn
- **Frontend** : React 19, JavaScript ES2023 (JSX), Tailwind CSS, React Router 6, Axios, Framer Motion, GSAP + ScrollTrigger, @phosphor-icons/react, sonner
- **Infrastructure** : MongoDB, Supervisor, Kubernetes ingress (Cloudflare)
- **Design system** : shadcn/ui (Radix under the hood) + Cormorant Garamond (Google Fonts) + Switzer (Fontshare)

### 1.3 Dépendances Python (backend/requirements.txt)
`fastapi, motor, pymongo, pyjwt, bcrypt, python-dotenv, uvicorn, reportlab, emergentintegrations (Stripe wrapper), pydantic[email], starlette`

### 1.4 Dépendances JavaScript (frontend/package.json)
`react@19, react-dom@19, react-router-dom, axios, framer-motion, gsap, @phosphor-icons/react, sonner, tailwindcss, tailwindcss-animate, shadcn/ui composants (~30)`

---

## 2. ARCHITECTURE TECHNIQUE

### 2.1 Architecture globale (2 couches strictement séparées)

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEURS PUBLICS                       │
│   (visiteurs / candidats / donateurs / cooptés / VIP)         │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS (Cloudflare TLS)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│              INGRESS Kubernetes (routing /api → 8001)          │
└──────────┬────────────────────────────────────┬──────────────┘
           │                                    │
           ▼ (routes non-/api)                  ▼ (routes /api)
    ┌──────────────┐                    ┌───────────────┐
    │  REACT SPA   │                    │ FASTAPI       │
    │  (port 3000) │                    │ (port 8001)   │
    │              │◀─── httpOnly ─────▶│               │
    │  - Public    │      cookies       │  - REST API   │
    │  - Admin     │                    │  - JWT auth   │
    └──────────────┘                    │  - RBAC 4     │
                                        │    rôles      │
                                        └───┬───────────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                    ┌──────────┐      ┌──────────┐     ┌────────────┐
                    │ MongoDB  │      │ Stripe   │     │ Object     │
                    │ 16 col-  │      │ Checkout │     │ Storage    │
                    │ lections │      │ + Webhook│     │ (Bible PDF)│
                    └──────────┘      └──────────┘     └────────────┘

Services externes (mockés jusqu'aux keys) :
   ⏸ Resend (emails) · ⏸ Yousign (signatures) · ⏸ Suno (audio AI)
```

### 2.2 Frontend
- **SPA React 19** avec hot reload
- **2 layouts distincts** : PublicLayout (thème sombre Noir Nuit) + AdminLayout (thème clair Ivoire Brut)
- **Auth Context** stocké en cookies httpOnly (samesite=none, secure=true)
- **I18n Context** avec 9 langues, persistance localStorage
- **Animation stack** : GSAP ScrollTrigger + Framer Motion `<AnimatePresence>` + CSS transitions
- **Design tokens** : Tailwind + CSS custom vars pour thèmes light/dark

### 2.3 Backend
- **FastAPI** async avec Motor driver Mongo
- **JWT stateless** : access token 15min + refresh token 7j (rotation automatique)
- **RBAC** : décorateur `require_role("admin", "production", "juridique", "nomme")`
- **Anti-brute-force** : compteur `login_attempts` par `IP:email`, blocage 15 min après 5 échecs
- **Anti-spam public** : honeypot invisible sur tous les formulaires publics
- **Audit logs** : chaque mutation dans `audit_logs` (acteur/action/entité/entity_id/meta/timestamp)
- **PDF generation** : reportlab côté serveur, streaming HTTP
- **Signed URLs** : tokens single-use 5 min pour la Bible (mémoire in-process)

### 2.4 API — endpoints principaux (60+)
Voir section 4.5 pour la liste exhaustive.

### 2.5 Services externes
| Service | Rôle | État |
|---|---|---|
| Stripe | Billetterie + Mécénat (Checkout Session + Webhook) | ✅ Actif (test keys) |
| MongoDB | Persistance | ✅ Actif |
| Resend | Emails transactionnels | ⏸ Mocké (retourne dev_link) |
| Yousign | Signature électronique NDA/contrats | ⏸ Mocké (statut manuel) |
| Emergent Object Storage | Bible chiffrée | ✅ Actif local |

### 2.6 Flux de données critiques

**Flux 1 — Auth JWT** :
```
Client → POST /api/auth/login {email, password}
       ← Set-Cookie: access_token (15min) + refresh_token (7j)
       → GET /api/auth/me (avec cookies)
       ← {id, email, name, role}
```

**Flux 2 — Billetterie Stripe** :
```
Client → POST /api/public/checkout/session {package_id, quantity, ...}
       ← {url: stripe_checkout_url, session_id}
       → Redirect to Stripe
       ← Webhook /api/webhook/stripe (payment_intent.succeeded)
       → Update payment_transactions.payment_status = "paid"
       → Client polls /api/public/checkout/status/{sid}
```

**Flux 3 — Cooptation → Cercle** :
```
Admin → POST /api/cooptation/issue → token 7j
Sponsor partage URL /sur-invitation?coopte=XXX
Prospect visite → GET /api/public/cooptation/XXX → validation
Prospect soumet → POST /api/public/cercle-restreint (message inclut [coopte:XXX])
Backend marque token used=true + tag coopted_by_token
```

**Flux 4 — Bible conditionnel** :
```
Admin → POST /api/bible/upload (multipart PDF)
Nommé signe NDA → contract.status = "signed"
Nommé → POST /api/bible/signed-url
  → Vérif : role=admin/juridique/production OU (role=nomme AND NDA signed)
  ← {url: /api/bible/stream/{token}, expires_in: 300}
Nommé GET /api/bible/stream/{token} → PDF streamé + token invalidé (single-use)
Log bible_access_logs (immuable)
```

---

## 3. ALGORITHMES MÉTIER

### 3.1 `auth_with_bruteforce_protection`
**Objectif** : Authentifier un utilisateur en résistant aux attaques par force brute
**Entrées** : email, password, IP client, X-Forwarded-For header
**Traitement** :
```
identifier = f"{ip}:{email}"
attempt = db.login_attempts.find(identifier)
if attempt.count >= 5 AND (now - attempt.last) < 15min:
    RETURN 429 "Trop de tentatives"
user = db.users.find(email)
if not user OR not bcrypt.verify(password, user.hash):
    db.login_attempts.upsert({$inc: count, $set: last: now})
    RETURN 401
CLEAR login_attempts[identifier]
tokens = create_jwt_pair(user_id, role)
SET cookies httpOnly secure samesite=none
LOG audit(user, "login")
RETURN user
```
**Sorties** : Cookies JWT + objet user public (sans password_hash)

### 3.2 `magic_link_flow` (Nommés uniquement)
**Objectif** : Login sans mot de passe pour talents castés
**Entrées** : email
**Traitement** :
```
user = db.users.find(email, role="nomme")
if user:
    token = secrets.token_urlsafe(32)
    db.magic_link_tokens.insert({token, user_id, expires: now+20min, used: false})
    link = f"{FRONTEND_URL}/portail?token={token}"
    IF RESEND_API_KEY: send_email(link)
    ELSE: log_dev(link) + return dev_link
RETURN {ok: true, dev_link?}  # Anti-enum : toujours 200
```
**Vérification** : token unique, single-use, expires 20 min

### 3.3 `contract_workflow_rbac`
**Objectif** : Faire circuler un contrat entre les rôles selon un workflow strict
**Matrice des transitions autorisées** :
```
production: {draft, juridique_review}
juridique:  {approved, refused}
admin:      {draft, juridique_review, approved, refused, sent, signed, archived}
nomme:      (aucune transition d'écriture)
```
**Traitement PATCH `/api/contracts/{id}/status`** :
```
allowed = MATRIX[user.role]
if new_status not in allowed: RETURN 403
db.contracts.update({_id: id}, {status: new_status, status_at: now})
LOG audit(user, "status", contract_id, {to: new_status})
```

### 3.4 `bible_conditional_access`
**Objectif** : Ouvrir la Bible uniquement aux ayants droit
**Entrées** : user courant (JWT)
**Traitement** :
```
IF user.role IN [admin, juridique, production]: PASS
ELIF user.role == "nomme":
    nda = db.contracts.find({person_id: user.person_id, template_id: "nda", status: "signed"})
    IF NOT nda: RETURN 403 "Accès Bible réservé après signature NDA"
ELSE: RETURN 403
token = secrets.token_urlsafe(24)
SIGNED_TOKENS[token] = {user_id, expires: now+5min}
LOG bible_access_logs.insert({user_id, at, action: "signed_url_issued"})
RETURN {url: /api/bible/stream/{token}, expires_in: 300}
```
**GET stream** : pop token (single-use), stream PDF, log_stream_consumed

### 3.5 `cooptation_token_lifecycle`
**Objectif** : Tracer la qualité du réseau hôte-par-hôte
**Émission** (admin/production) :
```
token = secrets.token_urlsafe(20)
db.cooptation_tokens.insert({
    token, sponsor_user_id, sponsor_name,
    expires: now+7d, used: false, created: now
})
RETURN url = f"{FRONTEND_URL}/cercle-restreint?coopte={token}"
```
**Validation publique** GET `/api/public/cooptation/{token}` :
```
rec = find({token, used: false})
IF NOT rec OR rec.expires < now: RETURN {valid: false}
RETURN {valid: true, sponsor: rec.sponsor_name}
```
**Consommation** POST `/api/public/cercle-restreint` :
```
IF "[coopte:XXX]" in message:
    tok = extract_token(message)
    db.cooptation_tokens.update({token: tok}, {used: true, used_at: now})
    doc.coopted_by_token = tok
```

### 3.6 `honeypot_antispam`
**Objectif** : Filtrer les soumissions bot sans captcha visible
**Traitement** sur tous les endpoints POST public :
```
IF payload.honeypot != "":
    RETURN {ok: true}  # 200 silencieux, jamais persisté
```

### 3.7 `stripe_checkout_generator` (billetterie + mécénat)
**Objectif** : Créer session Stripe sécurisée
**Règle critique** : montants toujours côté serveur, jamais confiance frontend
```
pkg = TICKET_PACKAGES.get(payload.package_id)  # ou pack mécénat
IF NOT pkg: RETURN 400
amount = pkg.amount * quantity
metadata = {package_id, quantity, full_name, email}
session = stripe.create_session(amount, currency, success_url, cancel_url, metadata)
db.payment_transactions.insert({session_id, amount, status: "open"})
RETURN {url: session.url}
```

### 3.8 `founders_visibility_toggle`
**Objectif** : Contrôler quels nodes/founders sont exposés publiquement
```
GET /api/public/ecosystem  →  filter({public_visible: true})
GET /api/public/founders-circle  →  filter({public_visible: true})
GET /api/ecosystem (admin)  →  aucun filtre (tous visibles)
```

### 3.9 `pdf_generation_reportlab`
**Objectif** : Rendre un template contrat avec variables → PDF A4 stylé
```
tmpl = CONTRACT_TEMPLATES[template_id]
rendered = tmpl.body.format(
    full_name, role_title, deliverables, fee_amount, start_date, end_date, today
)
doc = SimpleDocTemplate(A4, margins=2.5cm)
story = [
    Paragraph(eyebrow_style, "COOK & FOOD GALA — CHAPTER I · PARIS · 12.12.2026"),
    Paragraph(title_style, tmpl.title),
    ...paragraphs from rendered.split("\n")
]
doc.build(story) → bytes → StreamingResponse
```

### 3.10 `i18n_dictionary_fallback`
**Objectif** : Traduction avec fallback FR si clé absente
```
t(path) :
    parts = path.split(".")
    v = DICTS[current_lang]
    for p in parts: v = v?.[p]
    if v == null:
        v = DICTS["fr"]
        for p in parts: v = v?.[p]
    return v ?? path
```

---

## 4. BASE DE DONNÉES

### 4.1 Technologie
- **MongoDB** (accès async via Motor Python driver)
- **Connexion** : variable env `MONGO_URL`, base env `DB_NAME`
- **Convention** : ObjectId Mongo natif exposé en `id` string via helper `doc_out()`
- **Timestamps** : ISO 8601 UTC string

### 4.2 Collections (16)

**`users`** — Comptes système
Champs : `_id, email (unique idx), password_hash (bcrypt), name, role (admin|production|juridique|nomme), person_id?, created_at`

**`positions`** — 25 postes seedés (POS-01 → POS-25, 7 pôles)
Champs : `_id, code (unique idx), title, pole, description, created_at`

**`people`** — Personnes physiques/morales
Champs : `_id, full_name, email, phone, company, notes, created_at`

**`assignments`** — Lien poste ↔ personne
Champs : `_id, position_id (ref), person_id (ref), start_date, end_date, status (active|ended), fee_amount, deliverables, created_at`

**`invitations_vip`** — RSVP VIP legacy public
Champs : `_id, full_name, email, phone, seats, message, status (pending|confirmed|declined|waiting), source_ip, user_agent, created_at`

**`applications`** — Candidatures créatives publiques
Champs : `_id, full_name, email, discipline (cuisine|musique|art|mode|cinema|litterature|culture), project_title, description, portfolio_url, status, source_ip, created_at`

**`castings`** — Casting talents publics
Champs : `_id, full_name, email, phone, profile_type (chef|artiste|performer|mc), bio, demo_url, status, source_ip, created_at`

**`sponsoring_requests`** — Demandes de partenariat
Champs : `_id, company_name, contact_name, email, phone, tier_interest (titre|or|argent|partenaire), sector, message, status, created_at`

**`cercle_restreint_inquiries`** — Pré-qualification VIP
Champs : `_id, full_name, email, phone, sector, recommended_by, philanthropic_engagement, message, status (pending_review|...), coopted_by_token?, last_reply_at?, reply_sent?, source_ip, created_at`

**`mecenat_donations`** — Dons Stripe
Champs : `_id, session_id (unique), amount, full_name, email, organisation, purpose (general|prizes|casting|series|bible), payment_status (initiated|paid|expired), status, paid_at?, created_at`

**`payment_transactions`** — Tickets Stripe billetterie
Champs : `_id, session_id (unique), amount, currency, package_id, package_label, quantity, full_name, email, payment_status, status, metadata, paid_at?, created_at`

**`contracts`** — Contrats générés
Champs : `_id, template_id, template_title, kind (nda|contrat), assignment_id?, person_id (ref), position_title, fee_amount, start_date, end_date, deliverables, rendered_body (template rempli), status (draft|juridique_review|approved|refused|sent|signed|archived), status_at, notes, created_by (user_id), created_at`

**`bible_meta`** — Métadonnées Bible (singleton `_id: "current"`)
Champs : `_id="current", uploaded_by, uploaded_at, size, original_filename`

**`bible_access_logs`** — Logs immuables
Champs : `_id, user_id, user_email, at, action (signed_url_issued|stream_consumed)`

**`magic_link_tokens`** — Tokens login sans mot de passe
Champs : `_id, token (unique idx), user_id, email, expires_at, used, used_at?`

**`login_attempts`** — Compteur brute force
Champs : `_id, identifier ("{ip}:{email}"), count, last_at`

**`cooptation_tokens`** — Tokens cooptation
Champs : `_id, token (unique idx), sponsor_user_id, sponsor_name, expires_at, used, used_at?, created_at`

**`audit_logs`** — Toutes mutations privées
Champs : `_id, actor (user_id), action, entity, entity_id, meta (dict), at`

**`ecosystem_nodes`** — 7 nodes CVLN
Champs : `_id, code, name, kind (platform|brand|label|studio|holding), public_visible (bool), created_at`

**`founders_circle`** — Membres Cercle des fondateurs
Champs : `_id, name, title, bio, kind, public_visible, order, created_at`

### 4.3 Index MongoDB
```python
db.users.create_index("email", unique=True)
db.positions.create_index("code", unique=True)
db.invitations_vip.create_index("created_at")
db.magic_link_tokens.create_index("token", unique=True)
db.login_attempts.create_index("identifier")
```

### 4.4 Règles de validation (Pydantic)
- Emails validés via `EmailStr`
- Longueurs min/max sur `full_name`, `message`, `bio`, etc.
- Montants `mecenat` : `ge=500.0`
- Tickets `quantity` : `1 ≤ n ≤ 10`
- Amounts serveur-only (jamais depuis frontend)

---

## 5. MODÈLES DE DONNÉES

### 5.1 Diagramme d'entités (relations)

```
users ─────┐
           │ 1..1 (person_id ref si role=nomme)
           ▼
positions ◄────── assignments ─────► people
   1..N              N..N              1..N
                                       │
                                       │ 1..N
                                       ▼
                                    contracts ────► audit_logs
                                       │
                                       │ 1..1 (template)
                                       ▼
                                CONTRACT_TEMPLATES (dict Python)

payment_transactions ────► Stripe Checkout Sessions (externe)
mecenat_donations ────► Stripe Checkout Sessions (externe)

cercle_restreint_inquiries ────coopted_by_token───► cooptation_tokens
                                                        │
                                                        │ sponsor_user_id
                                                        ▼
                                                     users(admin)

Public write-only (aucune relation retour lisible côté public) :
   invitations_vip, applications, castings, sponsoring_requests

Auth utility :
   magic_link_tokens ─► users(role=nomme)
   login_attempts (identifier-based, pas de FK)

Contenu :
   bible_meta (singleton) ─► bible_access_logs (N)
   ecosystem_nodes (7)
   founders_circle (N, ordonné)
```

### 5.2 Modèles utilisateurs
- **Public visiteur** : anonyme, écrit uniquement (RSVP/candidature/casting/sponsoring/cercle/mécénat/billetterie)
- **Admin** (Laurent) : lecture/écriture totale + workflow envoi contrat
- **Production** : CRUD Positions/People/Assignments + création brouillon contrat + gestion RSVP
- **Juridique** : lecture seule + validation/refus contrat
- **Nommé** : lecture de son dossier + signature NDA/contrat + accès Bible conditionnel

### 5.3 Modèles contenus
- **CONTRACT_TEMPLATES** (7 templates immuables en code) : nda, prestation, cession_droits_auteur, chef_invite_cip, cession_image_voisins, partenariat, droit_image_public
- **TICKET_PACKAGES** (3 tiers publics en code) : gradin/lateral/premium (VIP retiré)
- **CF-GAP-01..07** (7 prix éditoriaux avec images/intro/body) hardcodés dans `/api/public/prizes`

### 5.4 Modèles transactions
- `payment_transactions` : billetterie
- `mecenat_donations` : dons

Les 2 utilisent Stripe Checkout Session avec `metadata.kind` distinguant `ticket` vs `mecenat`.

### 5.5 Modèles événements
Aucun système d'events pub/sub — flux synchrones REST + webhook Stripe.

---

## 6. PROMPTS ET INSTRUCTIONS IA

**Note** : cette application **n'utilise aucun LLM en production** actuellement. Les prompts historiques de développement (conversations avec l'agent E1 d'Emergent qui a construit cette plateforme) constituent l'historique de conception. Ils ne sont pas persistés côté application.

### 6.1 Intentions fonctionnelles reconstruites (observées via l'implémentation)

**Sécurité** :
- « Zéro donnée sensible côté public — écriture seule sur formulaires »
- « Toutes routes /api → header X-Robots-Tag: noindex, nofollow, noarchive »
- « JWT httpOnly + samesite=none + secure — jamais accessible en JS »
- « Bruteforce protection avec fenêtre glissante 15min »
- « Bible accessible seulement post-NDA signé — logs immuables »

**Métier** :
- « Chaque contrat lié à 1 affectation OU 1 personne directe »
- « Workflow contrat : Production → Juridique → Admin, jamais l'inverse »
- « VIP retiré de la billetterie publique — cooptation only »
- « Écosystème silencieux : FREK/Kiltikonet/Label OS/Laurentia non nommés publiquement »

**UX** :
- « Éditorial premium type magazine Cereal/Aesop »
- « Charte Cook & Food : Noir Nuit + Ivoire Brut + accent or »
- « Typographie Cormorant Garamond titres / Switzer texte »
- « Diaspora afro mondiale — visuels non-caucasiens »
- « Aucun prix affiché avant sélection catégorie »

Aucun système d'automatisation IA implémenté ; l'infrastructure permet de brancher OpenAI/Claude/Gemini via emergentintegrations mais aucun endpoint métier n'appelle actuellement de LLM.

---

## 7. SPÉCIFICATIONS FONCTIONNELLES

### 7.1 Vision
CVLN Gala OS est le portail privé et le site vitrine du **Cook & Food Gala 2026 — Chapter I**, événement gastronomique et culturel de la diaspora afro mondiale, tenu à Paris le 12 décembre 2026. La plateforme opère l'ensemble du cycle : communication publique premium, RSVP VIP confidentiel, casting, candidatures artistiques, sponsoring, mécénat défiscalisable, cooptation traçable, gestion des postes/personnes/affectations, contrats juridiques avec workflow, Bible technique chiffrée, signature électronique, et monitoring.

### 7.2 Objectifs
1. **Fonder un standard culturel** premium pour la diaspora afro mondiale
2. **Filtrer une audience VIP** par cooptation, sans jamais afficher de prix
3. **Automatiser** le cycle production (postes → contrats → PDF → workflow)
4. **Protéger** les données sensibles (contrats, Bible, invitations) par RBAC strict
5. **Tracer** chaque interaction pour audit et mesure du réseau
6. **Ouvrir** un canal international par i18n 9 langues

### 7.3 Utilisateurs cibles
- **Visiteurs curieux** → site vitrine premium
- **Créatifs / talents / chefs** → candidatures + casting
- **Marques** → sponsoring 4 tiers
- **Mécènes / grands donateurs** → mécénat défiscalisable
- **Ultra-fortunés** → cooptation only, Cercle restreint
- **Équipe interne CVLN** → back-office production/juridique/admin
- **Nommés** (talents castés) → portail personnel + signature + Bible

### 7.4 Fonctionnalités principales
Voir section 4.5 et l'inventaire de la conversation.

### 7.5 Parcours utilisateurs

**Parcours 1 — Prospect billetterie public** :
`/` → CTA « Billetterie » → 3 cartes tiers → sélection → formulaire nom/email → Stripe Checkout → `/billetterie/success`

**Parcours 2 — Prospect coopté** :
Sponsor partage URL `/sur-invitation?coopte=XXX` → Landing avec bannière « Vous êtes coopté(e) par [Sponsor] » → email → validation → réponse Cook & Food Gala sous 7j

**Parcours 3 — Mécène** :
`/mecenat` → montant suggéré ou libre → affectation → Stripe → reçu fiscal sous 7j

**Parcours 4 — Nommé (talent casté)** :
Admin crée compte → nommé reçoit magic link → login → voit son dossier → signe NDA (mock Yousign) → débloque Bible → signe contrat → accès complet

**Parcours 5 — Contrat interne** :
Production crée draft → passe à Juridique → validation/refus → Admin envoie → marque signé → archive

### 7.6 Cas d'utilisation
Documentés dans les 10 pages admin (Dashboard, Positions, People, Assignments, Contracts, Bible, Invitations, Submissions, Inner) et les 15 pages publiques (voir inventaire).

---

## 8. DOCUMENTATION PROPRIÉTÉ INTELLECTUELLE

### 8.1 Éléments différenciants
1. **Architecture 2 couches strictement séparées** — site public éditorial (write-only vers Mongo) + back-office privé JWT — modèle rare dans les CMS de gala classiques
2. **Cooptation traçable par token single-use** — mesure quantifiable de la qualité d'un réseau hôte-par-hôte (équivalent Soho House digitalisé)
3. **VIP invisible** dans la billetterie publique — pattern anti-friction pour audience ultra-fortunée
4. **Bible conditionnelle** avec URL signées 5 min single-use et logs immuables — protection IP forte pour documents stratégiques
5. **Écosystème silencieux** — 4 nodes CVLN (FREK, Kiltikonet, Label OS, Laurentia) invisibles publiquement mais traçables administrativement
6. **CIP (Cultural Impact Protocol)** — standard silencieux mentionné dans les contrats chefs
7. **Palette Cook & Food** (Noir Nuit #050505 / Ivoire Brut #EAE7E1 / Or #A98A5A / Sable / Brun / Sauge) comme signature identitaire cohérente
8. **Logo SVG** — anneaux concentriques irréguliers avec signature ondulée au bas central + dot central (composant vectoriel React)

### 8.2 Innovations techniques
- **Workflow RBAC déclaratif** par matrice de transitions (contract_workflow_rbac)
- **Générateur PDF templatable** (reportlab + `.format()` sécurisé) avec 7 templates métier
- **Cooptation lifecycle** (token → validation publique sans auth → consommation avec traçage)
- **Bible signed URL** avec token in-memory single-use (pas de dépendance à un service tiers)
- **i18n custom** avec fallback FR (sans dépendance i18next)
- **Custom cursor** à 2 couches (cercle immédiat + halo délayé) désactivé sur touch devices
- **AmbientAudio** opt-in avec equalizer CSS animation
- **Split-text headline** via GSAP ScrollTrigger sur `data-hero-title`
- **AnimatedOutlet** pour transitions de page avec effet blur cinématographique

### 8.3 Concepts propriétaires
- **CF-GAP-01 à 07** — nomenclature des 7 prix Cook & Food Awards
- **Chapter I / II / III trajectory** — modèle de séquence pluri-annuelle
- **Founders' Circle** — modèle de gouvernance à cooptation traçable
- **Cultural Impact Protocol (CIP)** — standard culinaire silencieux (à déposer)
- **Cook & Food Gala** — marque événement (à déposer)
- **Standard culturel de la diaspora afro mondiale** — positionnement éditorial

### 8.4 Actifs à protéger
| Actif | Type | Protection recommandée |
|---|---|---|
| Cook & Food Gala | Marque | INPI + WIPO Madrid Protocol |
| CVLN Holding / Factory Maker Studio / CVL Culinary Innovations | Marques | INPI |
| CF-GAP-01..07 | Marques nomenclature | INPI |
| CIP (Cultural Impact Protocol) | Norme silencieuse | INPI + document normatif |
| Logo (anneaux concentriques + wave) | Œuvre graphique | Enveloppe Soleau + dépôt marque figurative |
| Charte Cook & Food (palette + typo) | Charte graphique | Droit d'auteur (auto) + dépôt |
| Code source CVLN Gala OS | Œuvre logicielle | Enveloppe Soleau + APP (Agence Protection Programmes) |
| CONTRACT_TEMPLATES (7 templates) | Œuvres textuelles | Droit d'auteur + dépôt notarial |
| Base éditoriale (7 prix + descriptions) | Bases de données | Droit sui generis producteur BDD |
| Bible technique (`.docx` fournie) | Œuvre confidentielle | NDA + dépôt notarial + chiffrement Object Storage |
| Cooptation lifecycle algorithm | Innovation logicielle | Documentation technique + potentielle demande INPI logiciel |

### 8.5 Dépendances externes
| Dépendance | Type | Alternative | Risque IP |
|---|---|---|---|
| React 19 | MIT | Vue/Svelte | Faible |
| FastAPI | MIT | Django | Faible |
| MongoDB | SSPL | PostgreSQL | Moyen (licence SSPL) |
| Stripe | Commercial | Adyen, Mollie | Faible |
| Cormorant Garamond | Google Fonts (OFL) | Playfair Display | Faible |
| Switzer | Fontshare Free | Söhne (commercial) | Faible |
| GSAP | Standard License gratuite | Framer Motion pur | Faible pour usage non-commercial ; commercial license requise pour usage commercial |
| Emergent Integrations | Interne Emergent | SDK Stripe direct | Dépendance stratégique |
| Unsplash images | Unsplash License (gratuite avec attribution) | Photoshoot propriétaire | **À remplacer par photoshoot CVLN** pour sécurité IP |
| Pexels images | Pexels License | Photoshoot propriétaire | idem |

### 8.6 Recommandations de dépôt IP
1. **Immédiat** : dépôt INPI marques (Cook & Food Gala, CIP, CF-GAP-01..07, logos)
2. **Court terme** : Enveloppe Soleau + dépôt APP du code source (état actuel du repo `/app/`)
3. **Court terme** : dépôt notarial des 7 CONTRACT_TEMPLATES et du fichier `GALA_COOK_FOOD_BIBLE_COMPLETE.docx`
4. **Moyen terme** : photoshoot commissionné avec cession complète des droits d'auteur (photographe + modèles)
5. **Moyen terme** : reconnaissance d'utilité publique de CVLN Holding pour cadre fiscal des dons articles 200/238 bis CGI
6. **Long terme** : dépôt WIPO Madrid Protocol pour expansion internationale (US, UK, JP, CN, BR, ZA)

---

## Annexes

### A.1 Comptes de test
Voir `/app/memory/test_credentials.md`

### A.2 Rapports testing_agent
Voir `/app/test_reports/iteration_1.json` et `iteration_2.json`

### A.3 Variables d'environnement backend
`MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, APP_NAME, FRONTEND_URL, RESEND_API_KEY, STRIPE_API_KEY, EMERGENT_LLM_KEY`

### A.4 Variables d'environnement frontend
`REACT_APP_BACKEND_URL, REACT_APP_AMBIENT_AUDIO_URL, WDS_SOCKET_PORT`

### A.5 Points de monitoring
- `GET /api/health` — ping simple
- `GET /api/health/full` — MongoDB/Stripe/Resend/Yousign/Bible/Collections

---

**Fin du dossier technique. Document exploitable par CTO, DevTeam, investisseur ou cabinet de propriété intellectuelle.**

*Généré le 7 juin 2026 · Version 1.0*
