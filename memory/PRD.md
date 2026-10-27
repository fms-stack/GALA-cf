# CVLN Gala OS — PRD

## Original problem statement
Portail Privé Cook & Food Gala 2027 — plateforme à 2 couches strictement séparées :
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
- Dashboard admin: 4 KPI (postes, personnes, affectations, J-XXX vers 10/04/2027) + cards invitations & contrats
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

## Audit technique & dossier IP — DONE (2026-06, ce fork)
- Dossier complet `/app/docs/` (18 fichiers) : code source, architecture C4/Mermaid, 45+ endpoints, RULE-001→030, ALG-001→012, 20 collections + ERD, dépendances modules, prompts IA (aucun LLM en prod), specs fonctionnelles, tests, export Git, guide dev, cybersécurité (SEC-01→16 + OWASP), performance (PERF-01→08), IP (12 actifs + stratégie dépôt), matrice de couverture.
- `/app/README.md` développeur créé ; `.gitignore` durci (exclusion `.env` + Bible PDF).
- **Bug corrigé** : crash runtime `/admin` — imports `useState`, `List`, `X` manquants dans `AdminLayout.jsx`. Vérifié par screenshot desktop + mobile (login admin OK).
- Constats clés à traiter (voir docs/14) : SEC-01 fallback JWT_SECRET, SEC-02 mots de passe seed en dur dans server.py, SEC-03 Bible non chiffrée locale, SEC-16 workflow contrats sans machine à états ; Resend/Yousign toujours MOCKÉS ; i18n partielle (nav/CTA/héro).

## Durcissement P0 + i18n complète + machine à états + tests — DONE (2026-06, testé iterations 3 & 4)
- Sécurité P0 : JWT_SECRET sans fallback ; mots de passe staff via env (rotés, plus rien en dur) ; /api/health/full admin-only ; dev_link gaté par EXPOSE_DEV_LINKS ; Bible chiffrée Fernet stockée en **GridFS (MongoDB)** — persistante en production, plus aucun fichier pod-local ; brute-force indexé sur email (bypass XFF fermé) ; handler global ObjectId invalide → 404.
- Machine à états contrats serveur : draft→juridique_review→(approved|refused), approved→sent→signed→archived, refused→draft ; transition illégale → 409 même admin.
- i18n COMPLÈTE 9 langues : /frontend/src/lib/translations/{fr,en,es,pt,ru,zh,ja,hi,ht}.js — 14 pages publiques, footer, countdown, billetterie, prix (+modales) traduits. Tous les « — » supprimés des textes visibles (remplacés par « · »).
- Suite pytest versionnée : backend/tests/test_gala.py (19 tests) + test_iter3_public.py (16) + test_iter4_fixes.py (4) — tous verts.
- Accès équipe : /login (lien footer « Accès équipe »), 3 rôles (admin/production/juridique, credentials dans memory/test_credentials.md) ; nommés via /portail (magic link).
- Limitations connues avant production réelle : Resend/Yousign MOCKÉS ; Stripe en mode test ; tokens Bible in-memory (perdus au restart).

## Test credentials
Voir `/app/memory/test_credentials.md` — admin Laurent, production, juridique (mots de passe rotés 2026-06).

## Report de date + billetterie opérationnelle (2026-10-27)
- **Date du Gala : samedi 10 avril 2027, 19h00 (Europe/Paris)** · constante `GALA_DATE` dans `backend/server.py`, textes mis à jour dans les 9 langues, contrats, e-mails, docs. Trajectoire décalée : Chapter I (2027) · II (2028) · III (2029).
- `backend/ticketing.py` : 4 catégories (Early Bird 40 € jusqu'au 31/01/2027 · Gradin 50 € · Latéral 80 € · Premium 120 €), jauge par catégorie (100/350/200/150 = 800, modifiable par l'admin), places bloquées 30 min pendant le paiement, billets nominatifs `CF-XXXXX-XXXXX` avec QR (SVG), contrôle d'accès à usage unique.
- `backend/mailer.py` : envoi réel via Resend dès que `RESEND_API_KEY` est renseignée (`RESEND_FROM` = expéditeur sur domaine vérifié). Mock sinon.
- Front : cartes « Complet / Vente close / Plus que N places », billets affichés après paiement, page `/billet/:code`, back-office `/admin/billetterie` (ventes, recettes, jauge) et `/admin/checkin` (douchette, saisie, caméra).
- Reste à faire avant ouverture : clés Stripe live + Resend, domaine `cfceremony.com`, achat réel de bout en bout.
