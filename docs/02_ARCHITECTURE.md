# 2. ARCHITECTURE LOGICIELLE

## 2.1 Architecture globale — C4 Niveau 1 (Contexte)

```mermaid
C4Context
    title Cook & Food Gala OS — Contexte
    Person(visiteur, "Visiteur public", "Prospect, candidat, mécène, coopté")
    Person(staff, "Équipe CVLN", "Admin / Production / Juridique")
    Person(nomme, "Nommé", "Talent casté (magic link)")
    System(galaos, "CVLN Gala OS", "Site public éditorial + back-office privé")
    System_Ext(stripe, "Stripe", "Checkout Sessions + Webhooks (mode test)")
    System_Ext(resend, "Resend", "Emails transactionnels — MOCKÉ")
    System_Ext(yousign, "Yousign", "Signature électronique — MOCKÉ / NON INTÉGRÉ")
    Rel(visiteur, galaos, "HTTPS — formulaires write-only, billetterie")
    Rel(staff, galaos, "HTTPS — JWT cookies httpOnly")
    Rel(nomme, galaos, "HTTPS — magic link")
    Rel(galaos, stripe, "API + webhook")
    Rel(galaos, resend, "Prévu (clé absente)")
    Rel(galaos, yousign, "Prévu (aucun code)")
```

## 2.2 C4 Niveau 2 (Conteneurs) — ✅ OBSERVÉ

```mermaid
flowchart TB
    subgraph Client["Navigateur"]
        SPA["React SPA (port 3000)\n2 layouts : Public (dark) / Admin (light)\nAxios withCredentials"]
    end
    subgraph K8s["Ingress Kubernetes (TLS terminé en amont)"]
        ING["Règle de routage :\n/api/* → :8001\n/* → :3000"]
    end
    subgraph Backend["FastAPI (port 8001, supervisor)"]
        API["server.py — router /api\n(auth, CRUD, public, Stripe, stats)"]
        PH["phases.py — router /api\n(contrats, Bible, écosystème)"]
        MW["Middlewares : X-Robots-Tag noindex + CORS"]
    end
    DB[("MongoDB\n20 collections\nvia MONGO_URL")]
    FS["/app/backend/storage/bible/\n(PDF local, non chiffré)"]
    STRIPE["Stripe Checkout"]
    SPA -->|HTTPS| ING --> API
    ING --> SPA
    API --> DB
    PH --> DB
    PH --> FS
    API -->|create session / status / webhook| STRIPE
```

## 2.3 C4 Niveau 3 (Composants backend) — ✅ OBSERVÉ

| Composant | Fichier:lignes | Responsabilité |
|---|---|---|
| Auth Core | server.py:50–118 | bcrypt, JWT access/refresh, cookies, `get_current_user`, `require_role` |
| Auth Routes | server.py:276–389 | login (anti-brute-force), logout, me, refresh, magic-link |
| CRUD Production | server.py:395–492 | positions / people / assignments |
| Public Intake | server.py:498–625 | RSVP + 4 formulaires write-only + mécénat Stripe |
| Cooptation | server.py:640–705 | issue / check / list tokens 7 j |
| Billing | server.py:735–823 | tickets, checkout, status, webhook |
| Reporting | server.py:829–869 | dashboard stats, audit logs |
| Public Content | server.py:875–963 | prizes, ecosystem, countdown, health |
| Seeds | server.py:969–1044 + phases.py:511–555 | users, positions, ecosystem, founders |
| Contracts Engine | phases.py:293–400 | templates, rendu variables, workflow statut, PDF ReportLab |
| Bible Vault | phases.py:405–484 | upload, signed-url 5 min single-use (in-memory), stream, logs |
| Ecosystem Admin | phases.py:489–506 | CRUD nodes silencieux |

## 2.4 Architecture logique — séparation en 2 couches ✅ OBSERVÉ

- **Couche publique** : lecture de contenu non sensible (`/api/public/*`, prizes, ecosystem filtré `public_visible=true`, founders filtré) + **écriture seule** dans 6 collections d'intake. Aucun GET public ne retourne des données personnelles.
- **Couche privée** : toutes les routes non-`/api/public` exigent un JWT (`get_current_user`) ; les mutations exigent un rôle (`require_role`).
- Exceptions publiques par conception : `GET /api/public/cooptation/{token}` (validation token), `GET /api/bible/stream/{token}` (URL signée), `POST /api/webhook/stripe` (signature Stripe).

## 2.5 Architecture physique / Cloud / réseau

✅ OBSERVÉ (environnement) : conteneur Kubernetes ; supervisor gère `backend` (uvicorn 0.0.0.0:8001, hot reload) et `frontend` (dev server 3000) ; ingress route `/api` → 8001, reste → 3000 ; TLS terminé en amont de l'application (l'app ne gère pas de certificats).
❔ Topologie cloud de production cible (régions, réplication Mongo, CDN) : **non disponible dans le projet analysé.**
📋 RECOMMANDÉ : production = build statique React derrière CDN + uvicorn/gunicorn multi-workers + MongoDB Atlas répliqué + WAF.

## 2.6 Architecture sécurité (résumé — détail en 14_CYBERSECURITE)

✅ OBSERVÉ : JWT httpOnly/secure/samesite=none (access 15 min, refresh 7 j) ; RBAC 4 rôles ; anti-brute-force 5 essais / 15 min par `ip:email` (X-Forwarded-For pris en compte) ; honeypot anti-bot ; montants Stripe côté serveur ; `X-Robots-Tag` noindex sur `/api` ; Swagger désactivé (`docs_url=None`) ; audit log sur mutations ; anti-énumération d'emails sur magic-link (toujours 200).
⚠️ ÉCARTS OBSERVÉS : pas de HSTS/CSP applicatifs ; pas de rate limiting générique ; secrets fallback en dur ; mots de passe seed en dur ; Bible non chiffrée au repos ; tokens Bible in-memory (perdus au restart, non multi-worker) ; audit logs non immuables (collection Mongo standard) ; workflow contrats sans machine à états serveur.

## 2.7 Diagrammes de séquence — ✅ OBSERVÉ

### Authentification back-office
```mermaid
sequenceDiagram
    participant C as SPA (Login.jsx)
    participant A as FastAPI /api/auth
    participant M as MongoDB
    C->>A: POST /auth/login {email, password}
    A->>M: find login_attempts(ip:email)
    alt >= 5 échecs < 15 min
        A-->>C: 429 Trop de tentatives
    end
    A->>M: find users(email) + bcrypt.checkpw
    alt échec
        A->>M: $inc login_attempts
        A-->>C: 401
    else succès
        A->>M: delete login_attempts + insert audit_logs(login)
        A-->>C: 200 {id,email,name,role} + Set-Cookie access(15min)/refresh(7j)
    end
    C->>A: GET /auth/me (cookie)
    A-->>C: 200 user
    Note over C,A: à expiration : POST /auth/refresh (cookie refresh) → nouveau access
```

### Billetterie Stripe
```mermaid
sequenceDiagram
    participant C as Billetterie.jsx
    participant A as FastAPI
    participant S as Stripe
    participant M as MongoDB
    C->>A: GET /public/tickets
    A-->>C: 3 tiers (gradin 50 / latéral 80 / premium 120 €)
    C->>A: POST /public/checkout/session {package_id, quantity, origin_url, full_name, email}
    A->>A: amount = TICKET_PACKAGES[pkg].amount × qty (serveur)
    A->>S: create_checkout_session(amount, metadata)
    A->>M: insert payment_transactions(status=initiated)
    A-->>C: {url, session_id}
    C->>S: redirection Checkout
    S-->>A: POST /api/webhook/stripe (signé) → payment_status=paid
    C->>A: GET /public/checkout/status/{sid} (polling depuis /billetterie/success)
    A->>S: get_checkout_status(sid)
    A->>M: update payment_transactions (idempotent : paid une seule fois)
    A-->>C: {status, payment_status, amount_total}
```

### Accès Bible conditionnel
```mermaid
sequenceDiagram
    participant U as Utilisateur authentifié
    participant A as FastAPI (phases.py)
    participant M as MongoDB
    participant F as storage/bible/
    U->>A: POST /bible/signed-url (JWT)
    alt role == nomme
        A->>M: find contracts(person_id, template_id=nda, status=signed)
        alt NDA non signé
            A-->>U: 403 "Accès Bible réservé après signature du NDA"
        end
    else role ∉ {admin, juridique, production}
        A-->>U: 403
    end
    A->>A: SIGNED_TOKENS[token] = {user_id, expires: +5 min}  (in-memory)
    A->>M: insert bible_access_logs(signed_url_issued)
    A-->>U: {url: /api/bible/stream/{token}, expires_in: 300}
    U->>A: GET /bible/stream/{token}  (sans JWT — le token EST l'autorisation)
    A->>A: pop token (single-use)
    A->>F: read PDF
    A-->>U: StreamingResponse application/pdf
```

### Cooptation
```mermaid
sequenceDiagram
    participant Adm as Admin/Production (Inner.jsx)
    participant A as FastAPI
    participant P as Prospect (SurInvitation.jsx)
    Adm->>A: POST /cooptation/issue {sponsor_name}
    A-->>Adm: {token, url: /cercle-restreint?coopte=TOKEN, expires_in_days: 7}
    P->>A: GET /public/cooptation/{token}
    A-->>P: {valid: true, sponsor} | {valid: false}
    P->>A: POST /public/cercle-restreint (message contient "[coopte:TOKEN]")
    A->>A: marque cooptation_tokens.used=true + inquiry.coopted_by_token
```

## 2.8 Diagramme de déploiement — ✅ OBSERVÉ (environnement de preview)

```mermaid
flowchart LR
    U((Utilisateur)) -->|HTTPS 443| CF[Ingress K8s / TLS]
    CF -->|path /api| BE[Pod app\nsupervisor: uvicorn :8001]
    CF -->|path /| FE[Pod app\nsupervisor: react dev :3000]
    BE --> MG[(MongoDB\nMONGO_URL)]
    BE --> ST{{Stripe API}}
    BE --> DISK[/storage/bible/ PDF/]
```

## 2.9 Transversal

| Préoccupation | État |
|---|---|
| Gestion des erreurs | ✅ `HTTPException` FastAPI avec `detail` FR ; frontend `formatApiError()` normalise string/array/objet. ⚠️ ObjectId invalide non intercepté sur plusieurs routes → 500 (voir 14). |
| Journalisation | ✅ `logging` Python (INFO) + collection `audit_logs` (toutes mutations privées) + `bible_access_logs`. ⚠️ Non immuables. |
| Monitoring | ✅ `GET /api/health` (ping) et `GET /api/health/full` (Mongo, Stripe key, Resend mode, Bible storage, Yousign=mock, compteurs collections). ❔ APM/alerting externe : non disponible. |
| Observabilité | ❔ Traces distribuées, métriques Prometheus : non disponibles dans le projet analysé. |
| Sauvegardes | ❔ Aucun mécanisme de backup dans le code. 📋 mongodump chiffré quotidien + copie hors site recommandés. |
| Files d'attente / cache | ❔ Non disponibles dans le projet analysé (tout est synchrone). |
| i18n | ✅ Custom React (9 langues, fallback FR, persistance localStorage) — △ partiel : namespaces `nav`, `cta`, `hero`, `footer`, `invitation` uniquement ; le contenu éditorial des pages reste en FR. |
