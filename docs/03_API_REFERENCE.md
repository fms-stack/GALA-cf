# 3. INVENTAIRE COMPLET DES API — 45 endpoints

Tous ✅ OBSERVÉS dans `server.py` et `phases.py`. Préfixe global `/api`. Base URL : `{REACT_APP_BACKEND_URL}/api`.
Authentification : cookie httpOnly `access_token` **ou** header `Authorization: Bearer <jwt>` (server.py:89–94).
Erreurs communes à toutes les routes protégées : `401` (absent/expiré/invalide), `403` (rôle insuffisant), `422` (validation Pydantic).
⚠️ Défaut transversal observé : un identifiant Mongo mal formé (`ObjectId(pid)`) lève une exception non interceptée → `500` au lieu de `400/404`.

Rôles : `admin` · `production` · `juridique` · `nomme`. « Authentifié » = tout rôle valide.

---

## 3.1 Santé & monitoring

| # | Méthode | URL | Auth | Objectif |
|---|---|---|---|---|
| 1 | GET | `/api/health` | Aucune | Ping — `{"status":"ok","service":"cvln-gala-os"}` |
| 2 | GET | `/api/health/full` | Aucune ⚠️ | Statut intégrations : mongodb, stripe (présence clé), resend (`mode: live/mock`), bible_storage, yousign (`mock`), compteurs de 5 collections. ⚠️ Expose des compteurs internes sans auth — voir 14_CYBERSECURITE (SEC-09). |

## 3.2 Authentification

| # | Méthode | URL | Auth | Body | Réponses |
|---|---|---|---|---|---|
| 3 | POST | `/api/auth/login` | Aucune | `{email: EmailStr, password: str}` | `200 {id,email,name,role}` + Set-Cookie access(900 s)/refresh(604 800 s) · `401` identifiants invalides · `429` ≥ 5 échecs/15 min par `ip:email` |
| 4 | POST | `/api/auth/logout` | Authentifié | — | `200 {ok:true}` + suppression cookies + audit |
| 5 | GET | `/api/auth/me` | Authentifié | — | `200 {id,email,name,role}` |
| 6 | POST | `/api/auth/refresh` | Cookie `refresh_token` | — | `200 {ok:true}` + nouveau access cookie · `401` |
| 7 | POST | `/api/auth/magic-link/request` | Aucune | `{email}` | **Toujours** `200 {ok:true}` (anti-énumération). Si user rôle `nomme` existe : token 20 min créé ; `dev_link` retourné quand `RESEND_API_KEY` absent 🔧 |
| 8 | POST | `/api/auth/magic-link/verify` | Aucune | `{token}` | `200 user` + cookies · `400` lien invalide/déjà utilisé/expiré |

Exemple :
```bash
curl -X POST "$API/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"<admin_email>","password":"<password>"}' -c cookies.txt
curl "$API/auth/me" -b cookies.txt
```

## 3.3 CRUD Back-office (Positions / People / Assignments)

| # | Méthode | URL | Rôles écriture | Notes |
|---|---|---|---|---|
| 9 | GET | `/api/positions` | Authentifié (lecture) | Tri par `code`, limite 500 |
| 10 | POST | `/api/positions` | admin, production | Body `PositionIn {code*, title*, pole*, description}` |
| 11 | PUT | `/api/positions/{pid}` | admin, production | Remplacement complet |
| 12 | DELETE | `/api/positions/{pid}` | **admin seul** | `{ok:true}` |
| 13 | GET | `/api/people` | Authentifié | Tri `full_name` |
| 14 | POST | `/api/people` | admin, production | `PersonIn {full_name*, email, phone, company, notes}` |
| 15 | PUT | `/api/people/{pid}` | admin, production | |
| 16 | DELETE | `/api/people/{pid}` | admin seul | |
| 17 | GET | `/api/assignments` | Authentifié | Enrichi : chaque item embarque `position` et `person` (2 requêtes Mongo par ligne — voir 15_PERFORMANCE) |
| 18 | POST | `/api/assignments` | admin, production | `AssignmentIn {position_id*, person_id*, start_date, end_date, status=active, fee_amount, deliverables}` |
| 19 | PUT | `/api/assignments/{aid}` | admin, production | |
| 20 | DELETE | `/api/assignments/{aid}` | admin seul | |

Toutes les mutations insèrent un document `audit_logs`.

## 3.4 Formulaires publics (write-only, honeypot)

Tous : si `honeypot != ""` → `200 {ok:true}` **sans persistance** (leurre bots). Retour succès : `{ok:true, ref: "XXXXXX"}` (6 derniers hex de l'ObjectId, majuscules).

| # | Méthode | URL | Body (validation Pydantic) |
|---|---|---|---|
| 21 | POST | `/api/public/rsvp` | `{full_name(2-120)*, email*, phone, seats(1-10)=1, message, honeypot}` → statut `pending` + `source_ip` + `user_agent` |
| 22 | POST | `/api/public/applications` | `{full_name*, email*, discipline*, project_title(2-200)*, description(10-2000)*, portfolio_url, honeypot}` → statut `new` |
| 23 | POST | `/api/public/casting` | `{full_name*, email*, phone, profile_type*(chef/artiste/performer/mc), bio(10-2000)*, demo_url, honeypot}` |
| 24 | POST | `/api/public/sponsoring` | `{company_name(2-200)*, contact_name*, email*, phone, tier_interest*(titre/or/argent/partenaire), sector, message(10-2000)*, honeypot}` |
| 25 | POST | `/api/public/cercle-restreint` | `{full_name*, email*, phone, sector(2-120)*, recommended_by, philanthropic_engagement, message, honeypot}` → statut `pending_review`. Si `message` contient `[coopte:TOKEN]` : consomme le token de cooptation |
| 26 | POST | `/api/public/mecenat` | `{full_name*, email*, organisation, amount_eur ≥ 500*, purpose, honeypot}` → crée session Stripe, insère `mecenat_donations(initiated)`, retourne `{ok:true, url: <stripe_checkout>}` |

## 3.5 Billetterie Stripe

| # | Méthode | URL | Auth | Détail |
|---|---|---|---|---|
| 27 | GET | `/api/public/tickets` | Aucune | 3 tiers serveur : `gradin` 50 €, `lateral` 80 €, `premium` 120 € (VIP absent par conception) |
| 28 | POST | `/api/public/checkout/session` | Aucune | `{package_id*, quantity(1-10)=1, origin_url*, full_name*, email*}` — montant calculé **serveur** ; `400` package inconnu ; insère `payment_transactions(initiated)` ; retourne `{url, session_id}` |
| 29 | GET | `/api/public/checkout/status/{session_id}` | Aucune | Interroge Stripe, met à jour la transaction (transition `paid` idempotente — `paid_at` fixé une seule fois) ; retourne `{status, payment_status, amount_total, currency, metadata}` |
| 30 | POST | `/api/webhook/stripe` | Signature Stripe (`Stripe-Signature`, vérifiée par emergentintegrations) | Marque `paid/complete`. Toute exception → `{received:false}` (HTTP 200) |

## 3.6 Gestion privée des flux entrants

| # | Méthode | URL | Rôles | Détail |
|---|---|---|---|---|
| 31 | GET | `/api/invitations?status=` | admin, production | Liste RSVP, filtre statut optionnel, tri desc |
| 32 | PATCH | `/api/invitations/{iid}` | admin, production | Body `{status}` ∈ {pending, confirmed, declined, waiting} sinon `400` |
| 33 | GET | `/api/applications` | admin, production | |
| 34 | GET | `/api/castings` | admin, production | |
| 35 | GET | `/api/sponsoring` | admin, production | |
| 36 | GET | `/api/orders` | admin, production | `payment_transactions` (billetterie) |
| 37 | GET | `/api/cercle-restreint-inquiries` | admin, production | |
| 38 | GET | `/api/mecenat-donations` | admin, production | |
| 39 | POST | `/api/cercle/{iid}/send-reply` | **admin** | 🔧 MOCKÉ : compose l'email de confirmation, log seulement (`sent:false, mode:"mock"` sans clé Resend) ; met à jour `last_reply_at`/`reply_sent` ; `404` si demande introuvable |

## 3.7 Cooptation & Founders

| # | Méthode | URL | Auth | Détail |
|---|---|---|---|---|
| 40 | POST | `/api/cooptation/issue` | admin, production | `{sponsor_name?}` → `{token, url: {FRONTEND_URL}/cercle-restreint?coopte=TOKEN, expires_in_days: 7}` |
| 41 | GET | `/api/public/cooptation/{token}` | Aucune | `{valid: bool, sponsor?}` — invalide si inexistant, utilisé ou expiré |
| 42 | GET | `/api/cooptation/list` | admin, production | Tous les tokens (⚠️ inclut la valeur du token en clair) |
| 43 | GET | `/api/public/founders-circle` | Aucune | Membres `public_visible=true`, champs limités `{name,title,bio,kind}` |

## 3.8 Contenu public

| # | Méthode | URL | Détail |
|---|---|---|---|
| 44 | GET | `/api/public/prizes` | 7 prix CF-GAP-01..07 **hardcodés** (titre, discipline, image Unsplash, intro, body) |
| 45 | GET | `/api/public/ecosystem` | Nodes `public_visible=true` uniquement → `{name, kind}` (les 4 entités silencieuses ne sortent jamais) |
| 46 | GET | `/api/public/countdown` | `{gala_date: 2026-12-12T19:00Z, days, hours}` |

## 3.9 Dashboard & audit

| # | Méthode | URL | Rôles | Détail |
|---|---|---|---|---|
| 47 | GET | `/api/dashboard/stats` | Authentifié | 15 compteurs (positions, people, assignments, invitations par statut, contrats par statut, applications, castings, sponsoring, orders total/paid, days_to_gala) |
| 48 | GET | `/api/audit-logs` | **admin** | 100 derniers, tri desc |

## 3.10 Contrats & NDA (phases.py)

| # | Méthode | URL | Rôles | Détail |
|---|---|---|---|---|
| 49 | GET | `/api/contract-templates` | Authentifié | 7 templates `{id, title, kind}` |
| 50 | GET | `/api/contracts` | Authentifié | `nomme` : filtré sur son `person_id` uniquement ; enrichi avec `person` |
| 51 | POST | `/api/contracts` | admin, production | `{template_id*, assignment_id?|person_id?, deliverables, fee_amount, start_date, end_date, notes}` — rend le template avec variables → `rendered_body`, statut initial `draft` ; `400` template/affectation/personne introuvable |
| 52 | PATCH | `/api/contracts/{cid}/status` | Selon matrice | production → {draft, juridique_review} ; juridique → {approved, refused} ; admin → tout ; nomme → rien. `403` sinon. ⚠️ Aucune validation de transition depuis l'état courant (admin peut passer draft→signed directement) — finding testing agent iteration_2 |
| 53 | GET | `/api/contracts/{cid}/pdf` | Authentifié (nomme : seulement les siens) | Génère le PDF ReportLab à la volée, `Content-Disposition: attachment` ; `404` contrat introuvable |

## 3.11 Bible PDF (phases.py)

| # | Méthode | URL | Rôles | Détail |
|---|---|---|---|---|
| 54 | POST | `/api/bible/upload` | **admin** | multipart `file` (.pdf sinon `400`) → écrit `storage/bible/GALA_COOK_FOOD_BIBLE.pdf` + upsert `bible_meta{_id:"current"}` |
| 55 | GET | `/api/bible/meta` | Authentifié | `{exists: bool, meta: {uploaded_by, uploaded_at, size, original_filename}}` |
| 56 | POST | `/api/bible/signed-url` | admin/juridique/production, ou nomme avec NDA `signed` | `{url:/api/bible/stream/{token}, expires_in:300}` ; `403` NDA absent ; `404` Bible non uploadée ; log `signed_url_issued` |
| 57 | GET | `/api/bible/stream/{token}` | Token signé (single-use, 5 min, **in-memory**) | Stream PDF inline ; `403` expiré/invalide. ⚠️ La consommation du stream n'est pas journalisée (seule l'émission l'est) |
| 58 | GET | `/api/bible/access-logs` | **admin** | 200 derniers logs |

## 3.12 Écosystème (phases.py)

| # | Méthode | URL | Rôles |
|---|---|---|---|
| 59 | GET | `/api/ecosystem` | admin (tous les nodes, y compris silencieux) |
| 60 | POST | `/api/ecosystem` | admin — `{code*, name*, kind*, public_visible=false}` |
| 61 | DELETE | `/api/ecosystem/{nid}` | admin |

---

## 3.13 Spécification OpenAPI

Le schéma OpenAPI est généré automatiquement par FastAPI mais **l'UI est désactivée** (`docs_url=None, redoc_url=None` — server.py:43, choix de sécurité). Le JSON reste servi sur `/openapi.json` par défaut de FastAPI (non désactivé explicitement — à vérifier/désactiver en production, voir 14/SEC-10).
📋 Pour produire une doc Swagger interne : réactiver `docs_url` sur un environnement privé uniquement.
