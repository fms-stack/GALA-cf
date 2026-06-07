# CVLN Gala OS — PRD

## Original problem statement
Portail Privé Cook & Food Gala 2026 — plateforme à 2 couches strictement séparées :
1. Site public éditorial `cfceremony.com` (vitrine du Gala, RSVP VIP, ZÉRO donnée sensible exposée).
2. Back-office privé sécurisé JWT (gestion postes/personnes/affectations, contrats NDA, signature Yousign, accès Bible conditionnel, dashboard admin).

## Architecture
- **Backend**: FastAPI + MongoDB (motor) + bcrypt + PyJWT cookies httpOnly (samesite=none, secure)
- **Frontend**: React 19 + Tailwind + Cormorant Garamond/Switzer + Phosphor icons + Framer Motion
- **Charte respectée**: Noir Nuit #050505, Ivoire Brut #EAE7E1, Or #A98A5A, Sable, Brun Terre, Sauge Fumé
- **Collections Mongo**: users, positions, people, assignments, invitations_vip, magic_link_tokens, login_attempts, audit_logs

## Personas
- **Laurent** (admin) — accès total
- **Miguel** (production) — budget, contrats, planning
- **Hashtag** (juridique) — validation contrats
- **Nommés** (nomme) — magic link, lecture seule de son dossier

## Phase 1-3 MVP — DONE (2026-06-07)
- Site public dark editorial: Home, Concept, Prix (7 CF-GAP), Partenaires, RSVP VIP, Contact
- Formulaire RSVP VIP public → écriture seule dans `invitations_vip` (honeypot anti-spam)
- Auth back-office: login email/password JWT cookies + refresh + brute-force protection (X-Forwarded-For aware)
- Magic link flow for "nomme" (mock email returns dev_link when RESEND_API_KEY empty)
- Seed automatique: 3 system users + 25 positions (POS-01..POS-25, 7 pôles)
- CRUD Positions / People / Assignments (back-office light theme)
- Liste & gestion invitations VIP avec filtres et changement de statut
- Dashboard admin: 4 KPI (postes, personnes, affectations, J-XXX vers 12/12/2026) + cards invitations & contrats
- Audit logs sur toutes mutations
- Header `X-Robots-Tag: noindex, nofollow, noarchive` sur toutes les routes `/api/`
- RBAC: admin/production peuvent créer/éditer, admin seul peut supprimer, juridique read-only

## Test report
- Backend pytest 15/16 passed (94%), 0 critical issues, 0 failed tests
- Frontend Playwright: home/RSVP/login/dashboard/positions/admin nav/logout tous validés

## Prioritized backlog (P0/P1/P2)

### P0 — Next iteration
- **Phase 4** Moteur de contrats: 5 templates + NDA, génération PDF avec variables, validation Juridique workflow, archivage
- **Phase 5** Bible PDF: conversion `GALA_COOK_FOOD_BIBLE_COMPLETE.docx` → PDF, upload Object Storage Emergent, accès conditionnel post-NDA signé, URL signée 5 min

### P1
- **Yousign integration**: clé API requise (compte business CVLN), workflow envoi/relance/signature/archivage RGPD
- **Resend integration**: clé API pour envoi réel des magic links + notifications RSVP
- **Phase 6** Portail nommé: vue détail dossier + signature NDA → contrat → Bible
- **Phase 6 bis** Module 7 Prix CF-GAP: nominations, jury, lauréats

### P2
- **Phase 7** Durcissement: HSTS, CSP stricte, backups Mongo chiffrés, monitoring logs immuables, déploiement sous-domaine séparé (back-office.cfceremony.com)
- Export CSV invitations VIP
- Import bulk affectations depuis CSV
- Multi-langue (FR / EN)
- Billetterie premium (post-MVP)

## Test credentials
Voir `/app/memory/test_credentials.md` — admin Laurent, production Miguel, juridique Hashtag.
