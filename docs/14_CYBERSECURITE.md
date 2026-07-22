# 14. CYBERSÉCURITÉ — AUDIT

Chaque constat cite le fichier et la ligne. Gravité : 🔴 critique · 🟠 élevée · 🟡 moyenne · 🔵 faible.

## 14.1 Mesures en place — ✅ OBSERVÉ
| Mesure | Localisation |
|---|---|
| Hachage bcrypt (salt intégré) | server.py:50–58 |
| JWT HS256 typés (access/refresh), access 15 min | server.py:61–76, 99 |
| Cookies httpOnly + secure + samesite=none | server.py:79–81 |
| Anti-brute-force 5/15 min par ip:email (X-Forwarded-For) | server.py:279–300 |
| Anti-énumération d'emails (magic link → toujours 200) | server.py:351–370 |
| RBAC systématique sur les mutations | `require_role` — 28 usages |
| Honeypot sur 6 formulaires publics | server.py (public_*) |
| Montants serveur (billetterie + plancher mécénat) | server.py:235–247, 744–747 |
| `X-Robots-Tag: noindex` sur /api | server.py:1057–1062 |
| Swagger/Redoc désactivés | server.py:43 |
| CORS restreint (FRONTEND_URL + localhost) avec credentials | server.py:1065–1071 |
| Audit trail des mutations + logs d'accès Bible | `audit()`, bible_access_logs |
| Webhook Stripe : signature vérifiée par la lib (Stripe-Signature) | server.py:807–823 |
| `password_hash` jamais renvoyé | server.py:105 |
| Sortie publique founders/ecosystem whitelistée (pas d'_id) | server.py:676–679, 912–916 |

## 14.2 Vulnérabilités et écarts — constats

### SEC-01 🔴 Secrets avec valeurs de repli en dur
`JWT_SECRET` fallback `'changeme-dev-secret'` (server.py:34) ; `ADMIN_PASSWORD` fallback `admin123` (server.py:971). Si l'env disparaît, l'app démarre avec des secrets connus. **Correctif** : `os.environ['JWT_SECRET']` sans défaut (échec au boot), suppression des fallbacks.

### SEC-02 🔴 Identifiants seed en clair dans le code source
Mots de passe des comptes production/juridique écrits en dur (server.py:988–989) et donc dans l'historique Git. **Correctif** : passage en variables d'env + rotation immédiate avant toute mise en production ou export du dépôt.

### SEC-03 🔴 Bible non chiffrée au repos, stockage local
`storage/bible/GALA_COOK_FOOD_BIBLE.pdf` en clair (phases.py:405–415) — écart vs exigence « Object Storage chiffré ». **Correctif** : Object Storage + chiffrement (enveloppe AES-256, clé hors dépôt) ou a minima chiffrement fichier + montage volume persistant.

### SEC-04 🟠 Refresh token sans rotation ni révocation
JWT stateless 7 j (server.py:70–76, 321–337) : le logout ne fait qu'effacer les cookies ; un refresh volé reste valable. **Correctif** : jti + liste de révocation en base, rotation à chaque refresh.

### SEC-05 🟠 ObjectId non validé → 500
`ObjectId(pid)` non protégé sur PUT/DELETE/PATCH (ex. server.py:412, 419, 536 ; phases.py:381, 387). Un id malformé provoque une 500 (fuite de stack en log, DoS de bruit). **Correctif** : helper `parse_oid()` → 400/404.

### SEC-06 🟠 Absence de rate limiting générique et de captcha
Seul le login est limité ; les 6 endpoints publics d'écriture et le checkout sont flood-ables (pollution de base, coûts Stripe). **Correctif** : slowapi/limites par IP + éventuel captcha invisible ; TTL de purge sur les collections d'intake spammées.

### SEC-07 🟠 Journaux non immuables
`audit_logs`/`bible_access_logs` sont des collections Mongo standard, modifiables par tout accès DB. **Correctif** : export append-only externe (S3 Object Lock / journal signé par chaînage de hash).

### SEC-08 🟡 Moindre privilège incomplet pour `nomme`
Le rôle `nomme` lit positions/people/assignments/dashboard/audit-free routes via `get_current_user` simple (server.py:395, 424, 453, 829). Données internes exposées à un talent externe. **Correctif** : réserver ces routes à admin/production/juridique.

### SEC-09 🟡 `GET /api/health/full` sans authentification
Expose compteurs de collections, mode des intégrations et présence de la Bible (server.py:935–963). **Correctif** : restreindre à admin ou à un token de monitoring.

### SEC-10 🟡 `/openapi.json` probablement encore servi
`docs_url`/`redoc_url` désactivés mais `openapi_url` non nul par défaut. **Correctif** : `FastAPI(openapi_url=None)` en production.

### SEC-11 🟡 CSRF : SameSite=None sur cookies d'auth
Nécessaire au cross-site preview, mais en production même domaine, `samesite="lax"` + en-tête Origin vérifié réduiraient la surface CSRF (CORS restreint atténue déjà pour fetch/XHR).

### SEC-12 🟡 dev_link magic-link retourné dans la réponse
Sans `RESEND_API_KEY`, le lien de connexion est renvoyé au client (server.py:369) — utile en dev, dangereux si la clé manque en production (prise de compte par simple connaissance d'email de nommé). **Correctif** : conditionner au flag `ENV=dev` explicite.

### SEC-13 🟡 Tokens Bible in-memory + stream non journalisé
Perte au restart, non multi-worker ; seul `signed_url_issued` est loggé, pas la consommation (phases.py:466–479). **Correctif** : stocker les tokens signés en base avec TTL + log `stream_consumed`.

### SEC-14 🔵 En-têtes de durcissement absents côté app
HSTS, CSP, X-Content-Type-Options, Referrer-Policy non émis par l'application (délégués à l'ingress — non vérifiable dans le repo). **Correctif** : middleware d'en-têtes de sécurité.

### SEC-15 🔵 `.gitignore` n'excluait pas les `.env`
Corrigé durant cet audit ; rotation des secrets recommandée si le dépôt a déjà été partagé (voir 12.7).

### SEC-16 🔵 Workflow contrats sans machine à états serveur
Voir RULE-015 — risque d'intégrité juridique (contrat « signé » sans revue). Finding déjà relevé par le testing agent (iteration_2).

## 14.3 Revue OWASP Top 10 (2021)
| Catégorie | Verdict |
|---|---|
| A01 Broken Access Control | △ RBAC solide sur mutations ; SEC-08/09 à corriger |
| A02 Cryptographic Failures | △ bcrypt/JWT OK ; SEC-01/03 (secret fallback, Bible en clair) |
| A03 Injection | ✅ Pas de SQL ; requêtes Mongo à filtres construits serveur ; pas d'opérateur `$` injectable depuis les payloads Pydantic typés. XSS : React échappe par défaut, aucun `dangerouslySetInnerHTML` applicatif (le seul innerHTML est le split GSAP sur du texte déjà présent dans le DOM) |
| A04 Insecure Design | △ SEC-16 (état contrats), SEC-06 (rate limiting) |
| A05 Security Misconfiguration | △ SEC-09/10/14 |
| A06 Vulnerable Components | △ requirements.txt gonflé de ~90 paquets inutiles ; `pip-audit`/`yarn audit` à intégrer en CI |
| A07 Identification & Auth Failures | △ bonne base ; SEC-04/12 |
| A08 Software/Data Integrity | △ SEC-07 (logs), pas de vérification d'intégrité du PDF Bible |
| A09 Logging & Monitoring | △ audit riche mais mutable ; pas d'alerting |
| A10 SSRF | ✅ Aucune URL fournie par l'utilisateur n'est fetchée côté serveur (`origin_url` ne sert qu'à construire les redirects Stripe) |

CSRF : atténué (CORS + JSON), non éliminé (SEC-11). RCE : aucun `eval`/`exec`/désérialisation non sûre observé. Upload : Bible restreinte à l'admin, extension .pdf vérifiée (pas de vérification de contenu/magic bytes — 🔵).

## 14.4 Plan de remédiation priorisé
1. **Avant production (P0)** : SEC-01, SEC-02 (+ rotation), SEC-03, SEC-12, SEC-09.
2. **Semaine 1 (P1)** : SEC-04, SEC-05, SEC-06, SEC-13, SEC-16.
3. **Durcissement (P2)** : SEC-07, SEC-08, SEC-10, SEC-11, SEC-14, purge Git (12.7), sauvegardes chiffrées, pentest externe avant l'événement.
