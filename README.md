# CVLN Gala OS — Cook & Food Gala 2026

Portail du **Cook & Food Gala 2026 — Chapter I** (Paris · 12.12.2026) : site public éditorial premium + back-office privé sécurisé.

> 📚 **Documentation complète** : voir [`/docs`](docs/00_INDEX.md) — architecture, API (45+ endpoints), règles métier, algorithmes, base de données, sécurité, performance, propriété intellectuelle.

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 19 · Tailwind CSS · shadcn/ui · Framer Motion · GSAP · react-router 7 |
| Backend | FastAPI · Motor (MongoDB async) · Pydantic v2 · PyJWT · bcrypt · ReportLab |
| Base | MongoDB (20 collections, seeds automatiques) |
| Paiements | Stripe Checkout (mode test) via emergentintegrations |
| Mockés 🔧 | Resend (emails) · Yousign (signature électronique) |

## Prérequis
- Python 3.11+, Node 20+, Yarn, MongoDB accessible.

## Configuration (`.env` — jamais versionnés)

`backend/.env` :
```
MONGO_URL=mongodb://...
DB_NAME=...
JWT_SECRET=<secret fort>
ADMIN_EMAIL=...
ADMIN_PASSWORD=<secret fort>
APP_NAME=cvln-gala-os
FRONTEND_URL=https://...
RESEND_API_KEY=            # vide = mode mock
STRIPE_API_KEY=sk_test_...
```

`frontend/.env` :
```
REACT_APP_BACKEND_URL=https://...        # base URL du backend (les appels sont préfixés /api)
REACT_APP_AMBIENT_AUDIO_URL=             # optionnel : MP3 d'ambiance (opt-in)
```

## Lancement (développement)

```bash
# Backend (port 8001)
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (port 3000)
cd frontend
yarn install
yarn start
```

Sur la plateforme Emergent, les deux services sont gérés par supervisor (`sudo supervisorctl restart backend frontend`) — ne pas changer les ports.

Au premier démarrage, le backend **seed automatiquement** : 3 comptes système (admin/production/juridique), 25 postes (POS-01→25, 7 pôles), 7 entités écosystème, le founder.

## Routes principales

- Public : `/` `/concept` `/prix` `/billetterie` `/rsvp` `/candidatures` `/casting` `/sponsoring` `/mecenat` `/cercle-restreint` `/founders-circle` `/sur-invitation` `/contact`
- Back-office : `/login` → `/admin` (dashboard, postes, personnes, affectations, contrats & NDA, bible, invitations VIP, cercle & mécénat, réceptions)
- Portail nommés : `/portail` (magic link)
- API : `{BACKEND_URL}/api/...` — santé : `GET /api/health`, intégrations : `GET /api/health/full`

## Build production

```bash
cd frontend && yarn build     # bundle statique dans frontend/build/
```

## Tests

```bash
cd backend && pytest tests -q       # suite à versionner — voir docs/11_TESTS.md
```
Rapports des campagnes précédentes : `test_reports/iteration_1.json` (15/16), `iteration_2.json` (17/17 + findings).

## Debugging rapide
| Problème | Voir |
|---|---|
| 401 en boucle / cookies | HTTPS requis (cookies `secure`) + `withCredentials` |
| Lien Bible 403 | Tokens signés en mémoire → régénérer après redémarrage |
| Email non reçu | Resend mocké : lire les logs backend (`[MOCK EMAIL]`) |
| Billetterie KO | Vérifier `STRIPE_API_KEY` via `GET /api/health/full` |

Guide complet : [`docs/13_DOCUMENTATION_DEVELOPPEUR.md`](docs/13_DOCUMENTATION_DEVELOPPEUR.md).

## Sécurité — points d'attention avant production
Voir [`docs/14_CYBERSECURITE.md`](docs/14_CYBERSECURITE.md) : suppression des secrets de repli, rotation des identifiants seed, chiffrement de la Bible, restriction de `/api/health/full`, rate limiting.

## Licences
Code propriétaire © 2026 CVLN Holding · Factory Maker Studio. Dépendances open source : voir `docs/01_CODE_SOURCE.md` §1.6.
