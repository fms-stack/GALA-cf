# 15. PERFORMANCE

## 15.1 Profil de charge attendu — 🔮 INFÉRÉ
Événement unique (120 places VIP + gradins), site vitrine : trafic modeste avec pics (annonces, ouverture billetterie). L'architecture actuelle (uvicorn async + Mongo) est dimensionnée pour ce profil, sous réserve des points ci-dessous.

## 15.2 Goulots d'étranglement identifiés — ✅ OBSERVÉ

### PERF-01 — N+1 sur `GET /api/assignments` (server.py:453–469)
2 requêtes Mongo **par affectation** (position + personne). 100 affectations = 201 requêtes. **Correctif** : pipeline `$lookup` (aggregation) ou pré-chargement en 3 requêtes (`$in`). Idem `GET /contracts` (1 requête personne par contrat, phases.py:309–317).

### PERF-02 — Index manquants
`payment_transactions.session_id`, `cooptation_tokens.token`, `contracts.person_id/status`, `audit_logs.at` interrogés sans index → collection scans (voir 06 §6.3). Impact faible aujourd'hui, croissant avec le volume.

### PERF-03 — Bible chargée en mémoire entière
`BIBLE_FILE.read_bytes()` dans `io.BytesIO` (phases.py:476) : un PDF de 200 Mo = 200 Mo de RAM par téléchargement. **Correctif** : `FileResponse` (streaming disque natif).

### PERF-04 — Dashboard : 15 `count_documents` séquentiels (server.py:831–846)
Latence additive (~15 aller-retours). **Correctif** : `asyncio.gather(...)` ou `$facet` — gain ×5–10 sur la route.

### PERF-05 — PDF regénéré à chaque téléchargement
`_generate_contract_pdf` à la volée (acceptable : documents courts, ReportLab rapide). 📋 Cache optionnel si volumétrie.

### PERF-06 — `SIGNED_TOKENS` sans purge
Les tokens expirés non consommés restent en RAM (fuite lente). **Correctif** : purge lazy à chaque émission.

### PERF-07 — Frontend
- CRA dev server en preview (non représentatif) ; production = `yarn build` (bundle minifié) derrière CDN.
- gsap + framer-motion + radix complet : bundle conséquent — 📋 code-splitting par route (`React.lazy`) et tree-shaking des composants ui inutilisés.
- Images Unsplash non dimensionnées par srcset (paramètre `w=1400` fixe) — 📋 formats AVIF/WebP + tailles responsives.
- Polling `checkout/status` depuis la page success : borné par l'UX, sans backoff observé — 📋 backoff exponentiel + arrêt après N essais.

### PERF-08 — requirements.txt surdimensionné
~90 paquets non importés (openai, pandas, numpy, grpcio…) : temps d'installation, taille d'image et surface CVE inutiles. **Correctif** : liste minimale (voir 12.7).

## 15.3 Mémoire / complexité
Aucune structure non bornée côté requête (limites `to_list(500–1000)` partout ✅). Complexités : toutes les routes O(1)–O(n) avec n petit ; pas d'algorithme quadratique observé.

## 15.4 Recommandations de production 📋
1. uvicorn multi-workers derrière gunicorn — **précondition** : sortir `SIGNED_TOKENS` de la RAM (SEC-13/PERF-06).
2. MongoDB avec indexes du §6.3 + TTL sur tokens/attempts.
3. CDN + cache immutable sur le build React ; cache HTTP (`Cache-Control`) sur `/api/public/prizes|countdown|tickets` (contenu quasi statique).
4. Tests de charge ciblés avant l'ouverture billetterie : `POST /public/checkout/session` et pages publiques.
