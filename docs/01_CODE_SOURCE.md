# 1. CODE SOURCE

Tout ce chapitre est ✅ **OBSERVÉ** sauf mention contraire.

## 1.1 Arborescence complète du projet

```
/app
├── backend/                          # API FastAPI (Python)
│   ├── server.py                     # 1 092 lignes — application principale (voir 1.3)
│   ├── phases.py                     # 555 lignes — module contrats/Bible/écosystème (voir 1.4)
│   ├── requirements.txt              # 125 dépendances Python gelées (pip freeze)
│   ├── .env                          # Secrets backend (noms en 1.8 — valeurs jamais versionnées)
│   └── storage/
│       └── bible/
│           └── GALA_COOK_FOOD_BIBLE.pdf   # Bible uploadée — stockage LOCAL, NON chiffré
├── frontend/                         # SPA React 19 (Create React App + craco)
│   ├── package.json                  # 60+ dépendances JS (voir 1.6)
│   ├── tailwind.config.js            # Design tokens Cook & Food (noir/ivoire/sable/brun/sauge/or)
│   ├── craco.config.js               # Alias @/ → src/
│   ├── .env                          # REACT_APP_BACKEND_URL, REACT_APP_AMBIENT_AUDIO_URL, WDS_SOCKET_PORT
│   ├── public/                       # index.html, assets statiques
│   └── src/
│       ├── index.js                  # Point d'entrée React
│       ├── App.js                    # 97 lignes — routing global (16 routes publiques + 9 admin)
│       ├── App.css / index.css       # Fonts (Cormorant Garamond, Switzer), CSS vars shadcn, classes utilitaires
│       ├── lib/
│       │   ├── api.js                # 19 l.  — client Axios withCredentials + formatApiError()
│       │   ├── auth.jsx              # 44 l.  — AuthContext (user/login/logout/refresh via /auth/me)
│       │   ├── i18n.jsx              # 126 l. — 9 dictionnaires (5 namespaces), I18nProvider, LangSwitcher
│       │   ├── cinematics.js         # 86 l.  — hook useCinematics : GSAP ScrollTrigger (parallax, reveal, stagger, split-text)
│       │   └── utils.js              # helper cn() (clsx + tailwind-merge)
│       ├── components/
│       │   ├── Logo.jsx              # 83 l.  — logo SVG vectoriel (anneaux concentriques + onde) — PNG officiel NON intégré
│       │   ├── Countdown.jsx         # 29 l.  — compte à rebours vers 12.12.2026 (GET /public/countdown)
│       │   ├── CustomCursor.jsx      # 59 l.  — curseur custom 2 couches, désactivé sur écrans tactiles
│       │   ├── AmbientAudio.jsx      # 52 l.  — audio HTML5 opt-in (src via env) — URL externe non fiable
│       │   ├── PageTransition.jsx    # 26 l.  — wrapper Framer Motion
│       │   └── ui/                   # ~45 composants shadcn/ui (Radix) préinstallés
│       ├── constants/testIds/        # Constantes data-testid (auth.js, home.js, index.js)
│       ├── hooks/use-toast.js        # Hook toast shadcn
│       ├── layouts/
│       │   ├── PublicLayout.jsx      # 152 l. — header fixe, nav 9 entrées, burger mobile, LangSwitcher, footer FMS, AnimatedOutlet
│       │   └── AdminLayout.jsx       # 96 l.  — sidebar 9 entrées, burger mobile, bloc user + logout
│       └── pages/
│           ├── public/  (14 fichiers)
│           │   ├── Home.jsx (149 l.)          # Hero, countdown, disciplines, CTA
│           │   ├── Concept.jsx (51 l.)        # Manifeste éditorial
│           │   ├── Prix.jsx (105 l.)          # Les 7 prix CF-GAP (GET /public/prizes)
│           │   ├── Partenaires.jsx (48 l.)    # Écosystème public (GET /public/ecosystem)
│           │   ├── Billetterie.jsx (164 l.)   # Wizard 2 étapes → Stripe Checkout + BilletterieSuccess (polling)
│           │   ├── RSVP.jsx (138 l.)          # Formulaire RSVP VIP (POST /public/rsvp)
│           │   ├── Candidatures.jsx (70 l.)   # POST /public/applications
│           │   ├── Casting.jsx (68 l.)        # POST /public/casting
│           │   ├── Sponsoring.jsx (95 l.)     # POST /public/sponsoring (4 tiers)
│           │   ├── SurInvitation.jsx (73 l.)  # Landing cooptation ?coopte=TOKEN (GET /public/cooptation/{t})
│           │   ├── FoundersCircle.jsx (46 l.) # GET /public/founders-circle
│           │   ├── CercleRestreint.jsx (63 l.)# POST /public/cercle-restreint
│           │   ├── Mecenat.jsx (94 l.)        # POST /public/mecenat → Stripe + MecenatSuccess
│           │   └── Contact.jsx (44 l.)
│           └── admin/  (11 fichiers)
│               ├── Login.jsx (92 l.)          # POST /auth/login
│               ├── MagicLink.jsx (85 l.)      # /portail — request + verify magic link
│               ├── Dashboard.jsx (83 l.)      # GET /dashboard/stats
│               ├── Positions.jsx (105 l.)     # CRUD /positions
│               ├── People.jsx (98 l.)         # CRUD /people
│               ├── Assignments.jsx (120 l.)   # CRUD /assignments
│               ├── Invitations.jsx (103 l.)   # GET/PATCH /invitations
│               ├── Submissions.jsx (66 l.)    # GET /applications /castings /sponsoring /orders
│               ├── Contracts.jsx (175 l.)     # Templates, création, workflow statut, PDF
│               ├── Bible.jsx (112 l.)         # Upload, meta, signed-url, access-logs
│               └── Inner.jsx (124 l.)         # Cercle/Mécénat/Cooptation + émission token + export CSV
├── docs/                             # LE PRÉSENT DOSSIER (18 fichiers)
├── memory/
│   ├── PRD.md                        # Product Requirements Document
│   ├── test_credentials.md           # Identifiants de test — SENSIBLE, exclu du dépôt Git
│   └── IP_TECHNICAL_DOSSIER.md       # v1.0 — remplacé par /app/docs
├── test_reports/
│   ├── iteration_1.json              # Rapport testing agent #1 (pytest 15/16)
│   ├── iteration_2.json              # Rapport testing agent #2 (pytest 17/17 + findings mineurs)
│   └── pytest/pytest_results.xml
├── README.md                         # Guide développeur (créé par cet audit)
└── .gitignore                        # Durci par cet audit (exclusion .env)
```

## 1.2 Rôle de chaque dossier

| Dossier | Rôle |
|---|---|
| `backend/` | API REST FastAPI monolithique. Port interne 8001 (supervisor). Toutes les routes préfixées `/api`. |
| `backend/storage/bible/` | Stockage fichier de la Bible PDF. ⚠️ Local, non chiffré au repos — écart vs exigence "Object Storage chiffré". |
| `frontend/` | SPA React servie sur le port 3000 (dev server, hot reload). |
| `frontend/src/lib/` | Couche transverse : client HTTP, contexte auth, i18n, animations. |
| `frontend/src/components/ui/` | Bibliothèque shadcn/ui (MIT) — composants Radix stylés Tailwind. |
| `frontend/src/layouts/` | 2 layouts : public (thème sombre "Noir Nuit") et admin (thème clair "Ivoire Brut"). |
| `frontend/src/pages/` | 25 pages (14 publiques, 11 admin). |
| `memory/` | Mémoire projet de la plateforme Emergent (PRD, credentials de test). Hors périmètre applicatif. |
| `test_reports/` | Rapports du testing agent Emergent. |

## 1.3 `backend/server.py` — carte du fichier (1 092 lignes)

| Lignes | Section |
|---|---|
| 1–45 | Bootstrap : dotenv, Mongo (Motor), constantes env, `FastAPI(docs_url=None, redoc_url=None)`, `APIRouter(prefix="/api")` |
| 50–118 | Utilitaires auth : `hash_password`/`verify_password` (bcrypt), `create_access_token` (15 min) / `create_refresh_token` (7 j) (PyJWT HS256), `set_auth_cookies` (httpOnly, secure, samesite=none), `get_current_user` (cookie ou header Bearer), `require_role(*roles)` |
| 124–248 | Modèles Pydantic : `LoginInput`, `MagicLinkRequest/Verify`, `UserOut`, `PositionIn`, `PersonIn`, `AssignmentIn`, `InvitationVIPIn`, `ApplicationIn`, `CastingIn`, `SponsoringIn`, `CercleInquiryIn`, `MecenatIn`, `CheckoutCreateIn` + dict `TICKET_PACKAGES` (montants serveur) |
| 253–270 | Helpers : `doc_out()` (ObjectId→str), `audit()` (insertion `audit_logs`) |
| 276–389 | Routes auth : login (anti-brute-force), logout, me, refresh, magic-link request/verify |
| 395–492 | CRUD Positions / People / Assignments (RBAC admin+production, delete admin only) |
| 498–538 | RSVP public + gestion invitations |
| 544–729 | Formulaires publics (applications, casting, sponsoring, cercle, mécénat Stripe), listes admin, cooptation (issue/check/list), founders publics, reply Cercle 🔧 MOCKÉ |
| 735–823 | Billetterie Stripe : tickets, checkout session, status polling, webhook (`@app.post`, hors router) |
| 829–869 | Dashboard stats + audit-logs |
| 875–963 | Contenu public : prizes (hardcodé), ecosystem, countdown, health, health/full |
| 969–1044 | Seeds : `seed_admin()` (3 comptes système — ⚠️ mots de passe production/juridique en dur lignes 988–989), `SEED_POSITIONS` (25 postes, 7 pôles), `seed_positions()` |
| 1050–1092 | Lifecycle : inclusion routers, middleware `X-Robots-Tag: noindex` sur `/api/*`, CORSMiddleware (FRONTEND_URL + localhost:3000, credentials), startup (index Mongo + seeds), shutdown |

## 1.4 `backend/phases.py` — carte du fichier (555 lignes)

| Lignes | Section |
|---|---|
| 27–232 | `CONTRACT_TEMPLATES` : 7 templates juridiques complets en français (nda, prestation, cession_droits_auteur, chef_invite_cip, cession_image_voisins, partenariat, droit_image_public) avec variables `{full_name}`, `{role_title}`, `{deliverables}`, `{fee_amount}`, `{start_date}`, `{end_date}`, `{today}` |
| 238–257 | Modèles : `ContractCreateIn`, `ContractStatusIn`, `EcosystemNodeIn` |
| 263–287 | `_generate_contract_pdf()` : ReportLab A4, marges 2,5 cm, eyebrow or + titre + corps justifié, conversion `**gras**` markdown → `<b>` |
| 293–508 | `create_phase4_router(db, get_current_user, require_role, audit, doc_out)` : factory injectée par server.py — routes contrats (CRUD + workflow + PDF), Bible (upload/meta/signed-url/stream/logs — `SIGNED_TOKENS` dict **in-memory**), écosystème (CRUD admin) |
| 511–555 | Seeds : `seed_ecosystem_nodes` (7 nodes dont 4 silencieux : FREK, Kiltikonet, Label OS, Laurentia), `seed_founders` (Laurent, founder unique), `activate_seeded_founders` (⚠️ force `public_visible=True` sur tous les founders à chaque démarrage) |

## 1.5 Langages & frameworks

| Couche | Technologie | Version observée |
|---|---|---|
| Backend | Python + FastAPI | fastapi 0.110.1, starlette 0.37.2, uvicorn 0.25.0 |
| Driver DB | Motor (async MongoDB) | motor 3.3.1, pymongo 4.5.0 |
| Validation | Pydantic v2 | 2.13.4 (+ email-validator 2.3.0) |
| Auth | PyJWT + bcrypt | PyJWT 2.13.0, bcrypt 4.1.3 |
| PDF | ReportLab | 4.5.1 |
| Paiement | stripe SDK via emergentintegrations | stripe 14.4.1, emergentintegrations 0.2.0 |
| Frontend | React | 19.0.0 (react-dom 19.0.0), react-scripts 5.0.1 (CRA + craco) |
| Routing | react-router-dom | 7.5.1 |
| HTTP | axios | 1.8.4 |
| Styles | Tailwind CSS + tailwindcss-animate + shadcn/ui (Radix ~25 packages) | — |
| Animations | framer-motion 11.18.0, gsap 3.15.0 (ScrollTrigger) | — |
| Icônes | @phosphor-icons/react 2.1.10, lucide-react 0.516.0 | — |
| Toasts | sonner 2.0.3 | — |
| Typographie | Cormorant Garamond (Google Fonts, OFL) + Switzer (Fontshare, ITF FFL) | chargées dans index.css |

## 1.6 Dépendances & licences

### Backend (extrait significatif de requirements.txt — 125 paquets gelés)
| Paquet | Licence | Usage réel |
|---|---|---|
| fastapi, starlette, uvicorn | MIT / BSD-3 | Serveur API |
| motor, pymongo | Apache-2.0 | MongoDB |
| pydantic | MIT | Validation |
| PyJWT | MIT | Tokens JWT |
| bcrypt | Apache-2.0 | Hachage mots de passe |
| reportlab | BSD-3 | PDF contrats |
| stripe | MIT | Paiements |
| emergentintegrations | Propriétaire Emergent | Wrapper Stripe Checkout |
| python-dotenv | BSD-3 | Chargement .env |
| pytest | MIT | Tests |

🔮 INFÉRÉ : de nombreux paquets présents (openai, google-generativeai, litellm, boto3, pandas, numpy, huggingface_hub, tiktoken…) proviennent de l'image de base de l'environnement et **ne sont importés nulle part** dans `server.py`/`phases.py`. Ils constituent du poids mort dans `requirements.txt` (voir 15_PERFORMANCE et 12_EXPORT_GIT pour l'assainissement recommandé).

### Frontend (package.json)
| Paquet | Licence | Risque |
|---|---|---|
| react, react-dom, react-router-dom, axios, framer-motion, sonner, zod, clsx, tailwind-merge, @radix-ui/* | MIT | Faible |
| gsap | **GSAP Standard License** (gratuite, y compris usage commercial depuis rachat Webflow 2024 ; certaines conditions pour produits payants concurrents) | À vérifier au moment de la commercialisation |
| @phosphor-icons/react, lucide-react | MIT / ISC | Faible |
| tailwindcss | MIT | Faible |

📋 RECOMMANDÉ : générer un SBOM (`pip-licenses`, `license-checker`) avant tout dépôt APP ou due diligence.

## 1.7 Modules internes, services, middleware, helpers

| Type | Élément | Fichier |
|---|---|---|
| Middleware | `noindex_header` — ajoute `X-Robots-Tag: noindex, nofollow, noarchive` sur `/api/*` | server.py:1057 |
| Middleware | `CORSMiddleware` — origins `[FRONTEND_URL, "http://localhost:3000"]`, credentials=True | server.py:1065 |
| Dépendance | `get_current_user` — extraction JWT cookie/Bearer + lookup user | server.py:89 |
| Dépendance factory | `require_role(*roles)` — garde RBAC | server.py:113 |
| Helper | `doc_out(d)` — mapping `_id`→`id` string | server.py:253 |
| Helper | `audit(actor, action, entity, entity_id, meta)` — journalisation | server.py:262 |
| Helper | `_generate_contract_pdf(title, body)` — ReportLab | phases.py:263 |
| Helper | `send_magic_link_email` — 🔧 MOCKÉ (log uniquement, même si RESEND_API_KEY présent le code ne fait que logger) | server.py:343 |
| Factory | `create_phase4_router(...)` — injection de dépendances vers phases.py | phases.py:293 |
| Frontend service | `api` (Axios instance withCredentials) + `formatApiError` | lib/api.js |
| Frontend contexte | `AuthProvider/useAuth`, `I18nProvider/useI18n/LangSwitcher` | lib/auth.jsx, lib/i18n.jsx |
| Frontend hook | `useCinematics(rootRef)` — GSAP context | lib/cinematics.js |

❔ Files d'attente, cache applicatif, workers asynchrones : **non disponibles dans le projet analysé** (aucun Celery/Redis/queue).

## 1.8 Variables d'environnement & secrets attendus (noms uniquement)

### backend/.env
| Variable | Rôle | Criticité |
|---|---|---|
| `MONGO_URL` | Connexion MongoDB | Critique |
| `DB_NAME` | Nom de base | Critique |
| `CORS_ORIGINS` | ⚠️ Déclarée mais **non lue par le code** (le code utilise FRONTEND_URL) | Dette |
| `JWT_SECRET` | Signature HS256 — ⚠️ fallback `'changeme-dev-secret'` dans le code (server.py:34) | Critique |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed compte admin — ⚠️ fallback `admin123` (server.py:971) | Critique |
| `APP_NAME` | Nom applicatif | Faible |
| `FRONTEND_URL` | Base des liens magic-link/cooptation + CORS | Moyenne |
| `RESEND_API_KEY` | Emails — 🔧 non branché à un SDK réel | Moyenne |
| `STRIPE_API_KEY` | Stripe (clé test fournie par la plateforme) | Critique |
| `EMERGENT_LLM_KEY` | Présente, **non utilisée par le code applicatif** | — |

### frontend/.env
| Variable | Rôle |
|---|---|
| `REACT_APP_BACKEND_URL` | URL externe du backend (préfixe des appels `/api`) |
| `REACT_APP_AMBIENT_AUDIO_URL` | URL du MP3 d'ambiance — ⚠️ URL externe (Pixabay) ayant retourné HTTP 403 lors des tests |
| `WDS_SOCKET_PORT` | Hot reload dev server |
| `ENABLE_HEALTH_CHECK` | Flag plateforme |

## 1.9 Scripts et fichiers de configuration

| Fichier | Rôle |
|---|---|
| `frontend/craco.config.js` | Alias `@/ → src/` |
| `frontend/tailwind.config.js` | Palette propriétaire : `noir #050505`, `ivoire #EAE7E1`, `sable #CFC7BA`, `brun #6B5646`, `sauge #556058`, `or #A98A5A` + tokens shadcn + keyframe `fade-up` |
| `frontend/postcss.config.js`, `jsconfig.json`, `components.json` | Toolchain CRA/shadcn |
| Supervisor (environnement) | backend `0.0.0.0:8001`, frontend `3000` — géré par la plateforme, hors repo |

❔ CI/CD (GitHub Actions, Dockerfile, Helm) : **non disponibles dans le projet analysé** — recommandations en 12_EXPORT_GIT.
