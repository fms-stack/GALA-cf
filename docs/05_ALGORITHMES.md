# 5. ALGORITHMES MÉTIER — ALG-001 → ALG-012

Tous ✅ OBSERVÉS. Pour chacun : objectif, contexte, entrées/sorties, pré/post-conditions, traitement, pseudo-code, complexité, dépendances, fichiers et endpoints concernés.

---

## ALG-001 — Authentification avec protection brute-force
- **Contexte** : porte d'entrée du back-office. **Endpoint** : `POST /api/auth/login`. **Fichier** : server.py:276–306.
- **Entrées** : email, password, header `X-Forwarded-For`, IP socket.
- **Sorties** : user public + 2 cookies JWT, ou 401/429.
- **Préconditions** : collection `users` seedée. **Postconditions** : `login_attempts` purgé au succès ; `audit_logs(login)` inséré.
- **Pseudo-code** :
```
identifier ← ip + ":" + lower(email)
attempt ← login_attempts.find(identifier)
si attempt.count ≥ 5 et now − attempt.last_at < 15 min → 429
sinon si fenêtre expirée → delete(attempt)
user ← users.find(email)
si user absent ou ¬bcrypt.checkpw(password, user.password_hash):
    login_attempts.upsert($inc count, $set last_at=now) → 401
login_attempts.delete(identifier)
access ← JWT(sub, email, role, exp=+15min, type=access)
refresh ← JWT(sub, exp=+7j, type=refresh)
Set-Cookie httpOnly/secure/samesite=none ; audit(login) → 200 user
```
- **Complexité** : O(1) (2 lookups indexés). **Dépendances** : bcrypt, PyJWT, index `users.email`, `login_attempts.identifier`.

## ALG-002 — Cycle magic link (nommés)
- **Endpoints** : `POST /auth/magic-link/request`, `POST /auth/magic-link/verify`. **Fichier** : server.py:343–389.
- **Entrées** : email (request) ; token (verify). **Sorties** : `{ok:true, dev_link?}` ; session JWT.
- **Invariants** : token `secrets.token_urlsafe(32)`, TTL 20 min, `used` flippé atomiquement avant émission des cookies ; réponse constante 200 côté request (anti-énumération).
- **Pseudo-code (verify)** :
```
rec ← magic_link_tokens.find({token, used:false})   → 400 si absent
si rec.expires_at < now → 400 "Lien expiré"
user ← users.find(rec.user_id)                       → 400 si absent
magic_link_tokens.update(rec, used:true)
émettre cookies access+refresh ; audit(magic_link_login)
```
- **Complexité** : O(1). 🔧 L'envoi email est mocké (ALG dépend de RULE-029).

## ALG-003 — Garde RBAC déclarative
- **Fichier** : server.py:113–118. **Contexte** : dépendance FastAPI composable.
- **Traitement** : `require_role(*roles)` retourne un checker qui résout `get_current_user` puis vérifie `user.role ∈ roles` sinon 403.
- **Utilisé par** : 28 endpoints privés. **Complexité** : O(1).

## ALG-004 — Workflow contrat par matrice de rôles
- **Endpoint** : `PATCH /api/contracts/{cid}/status`. **Fichier** : phases.py:371–383.
- **Entrées** : cid, statut cible, rôle courant. **Sorties** : contrat mis à jour ou 403.
- **Pseudo-code** :
```
MATRICE ← {production:{draft,juridique_review}, juridique:{approved,refused},
           admin:{draft,juridique_review,approved,refused,sent,signed,archived}}
si statut ∉ MATRICE[role] → 403
contracts.update(cid, {status, status_at:now}) ; audit(status)
```
- **Limite observée** ⚠️ : validation du **statut cible** uniquement, pas de contrôle de l'état source (pas de machine à états). **Complexité** : O(1).

## ALG-005 — Rendu de contrat : template → variables → PDF
- **Endpoints** : `POST /api/contracts`, `GET /api/contracts/{cid}/pdf`. **Fichiers** : phases.py:320–369 (rendu), 263–287 (PDF).
- **Entrées** : template_id, personne (directe ou via affectation), livrables, montant, dates.
- **Traitement** :
```
tmpl ← CONTRACT_TEMPLATES[template_id]           → 400 si inconnu
si assignment_id: résoudre person_id + position.title
person ← people.find(person_id)                  → 400 si absent
rendered ← tmpl.body.format(full_name, role_title, deliverables,
           fee_amount formaté "12 500.00", start_date, end_date, today=JJ/MM/AAAA)
contracts.insert({..., rendered_body:rendered, status:"draft"})
--- PDF à la demande ---
story ← [eyebrow "COOK & FOOD GALA — CHAPTER I · PARIS · 12.12.2026", titre]
pour chaque ligne de rendered_body:
    ligne vide → Spacer ; "**x**" → <b>x</b> (bascule alternée) ; Paragraph justifié
SimpleDocTemplate(A4, marges 2.5 cm).build(story) → bytes → StreamingResponse
```
- **Postcondition** : le corps rendu est figé (instantané juridique). **Complexité** : O(L) lignes du template. **Dépendances** : ReportLab.

## ALG-006 — Contrôle d'accès Bible conditionnel + URL signée single-use
- **Endpoints** : `POST /bible/signed-url`, `GET /bible/stream/{token}`. **Fichier** : phases.py:437–479.
- **Pseudo-code** :
```
-- émission --
si role = nomme: nda ← contracts.find({person_id:user.person_id, template_id:"nda", status:"signed"})
                 si absent → 403
sinon si role ∉ {admin, juridique, production} → 403
si fichier Bible absent → 404
token ← urlsafe(24) ; SIGNED_TOKENS[token] ← {user_id, expires:+5 min}   # RAM
bible_access_logs.insert(signed_url_issued)
retour {url:/api/bible/stream/token, expires_in:300}
-- consommation --
rec ← SIGNED_TOKENS[token] ; si absent ou expiré → 403
SIGNED_TOKENS.pop(token)          # usage unique
stream(PDF)
```
- **Propriétés** : le lien est porteur d'autorisation (capability URL) ; défense en profondeur avec le contrôle NDA en amont.
- **Limites** ⚠️ : RAM (perdu au restart, mono-worker) ; consommation non journalisée ; pas de purge des tokens expirés jamais consommés (fuite mémoire lente). **Complexité** : O(1).

## ALG-007 — Cycle de vie du token de cooptation
- **Endpoints** : `POST /cooptation/issue`, `GET /public/cooptation/{token}`, `POST /public/cercle-restreint`. **Fichiers** : server.py:682–705, 580–599.
- **Pseudo-code** :
```
-- émission (admin/production) --
token ← urlsafe(20)
cooptation_tokens.insert({token, sponsor_user_id, sponsor_name, expires:+7j, used:false})
url ← FRONTEND_URL + "/cercle-restreint?coopte=" + token
-- validation publique --
rec ← find({token, used:false}) ; si absent ou expiré → {valid:false}
sinon {valid:true, sponsor}
-- consommation --
si message contient "[coopte:X]": extraire X entre "[coopte:" et "]"
cooptation_tokens.update({token:X}, used:true, used_at) ; inquiry.coopted_by_token ← X
```
- **Valeur métier** : traçabilité hôte-par-hôte du réseau (qui a coopté qui). **Complexité** : O(1).

## ALG-008 — Génération de session Stripe (billetterie & mécénat)
- **Endpoints** : `POST /public/checkout/session`, `POST /public/mecenat`. **Fichier** : server.py:602–625, 742–780.
- **Invariant central** : montant TOUJOURS calculé/validé serveur (catalogue `TICKET_PACKAGES` ou plancher 500 €).
- **Pseudo-code** :
```
pkg ← TICKET_PACKAGES[package_id] → 400 si absent
amount ← pkg.amount × quantity (1..10)
session ← StripeCheckout.create(amount, "eur", success_url avec {CHECKOUT_SESSION_ID}, cancel_url, metadata)
payment_transactions.insert({session_id, amount, ..., payment_status:"initiated", status:"open"})
retour {url: session.url}
```
- **Dépendances** : emergentintegrations (wrapper stripe). **Complexité** : O(1) + latence Stripe.

## ALG-009 — Réconciliation de paiement (webhook + polling idempotent)
- **Endpoints** : `POST /api/webhook/stripe`, `GET /public/checkout/status/{sid}`. **Fichier** : server.py:783–823.
- **Pseudo-code (polling)** :
```
st ← stripe.get_checkout_status(sid)
record ← payment_transactions.find(session_id)
si record.payment_status ≠ "paid" et st.payment_status = "paid":
    update({payment_status:"paid", status, paid_at:now})     # première fois seulement
sinon: update({payment_status, status})                       # pas de paid_at
```
- **Propriété** : idempotence de `paid_at` (double crédit impossible). Le webhook (signature vérifiée par la lib) fait la même transition côté serveur-à-serveur.
- **Limite** : le webhook ne met à jour que `payment_transactions`, pas `mecenat_donations` (les dons sont réconciliés via la page success/polling) — 🔮 INFÉRÉ du code, à vérifier fonctionnellement.

## ALG-010 — Filtrage de visibilité (écosystème / founders)
- **Endpoints** : `GET /public/ecosystem`, `GET /public/founders-circle`, `GET /ecosystem` (admin). **Fichiers** : server.py:676–679, 912–916 ; phases.py:489–492.
- **Traitement** : projection publique = filtre `{public_visible:true}` + champs whitelistés ; vue admin sans filtre. Sortie publique jamais enrichie d'`_id`.
- **Complexité** : O(n) sur petites collections (≤ 50).

## ALG-011 — Traduction avec repli (i18n)
- **Fichier** : frontend `lib/i18n.jsx:88–97`. **Contexte** : 9 dictionnaires, 5 namespaces.
- **Pseudo-code** :
```
t(path): v ← DICTS[lang] ; pour p dans path.split("."): v ← v?[p]
si v = null: v ← DICTS.fr (même parcours)
retour v ?? path
```
- **Propriété** : jamais d'écran cassé — repli FR, puis clé brute. Persistance `localStorage("cvln_lang")` + `document.documentElement.lang`.
- **Limite** △ : couverture partielle (contenu éditorial non externalisé).

## ALG-012 — Chorégraphie cinématique au scroll
- **Fichier** : frontend `lib/cinematics.js`. **Contexte** : identité visuelle "magazine premium".
- **Traitement** : au montage de page, un `gsap.context` attache : parallax scrubbé sur `[data-parallax]` (y 0→120, scale 1.06→1) ; reveal une fois sur `[data-reveal]` (y 40→0, 1.1 s power3) ; stagger 0.1 s sur `[data-stagger-item]` ; split du titre héro `[data-hero-title]` en mots (spans imbriqués, y 110%→0, expo.out, stagger 0.08 s) avec garde anti-double-split (`dataset.split`). Nettoyage par `ctx.revert()` au démontage.
- **Complexité** : O(éléments décorés). **Dépendances** : gsap + ScrollTrigger.

---

## Algorithmes de recommandation / classement / scoring
❔ **Non disponibles dans le projet analysé.** Aucun moteur de scoring, ranking ou recommandation n'est implémenté. Le classement des prix CF-GAP est éditorial (liste hardcodée). 📋 Un scoring de qualification des demandes Cercle (cooptation, secteur, engagement philanthropique) serait une extension naturelle d'ALG-007.
