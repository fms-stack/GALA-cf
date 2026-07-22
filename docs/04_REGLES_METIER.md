# 4. RÈGLES MÉTIER — RULE-001 → RULE-030

Toutes ✅ OBSERVÉES dans le code, sauf marquage contraire. Format : identifiant, description, conditions, contraintes, dépendances, cas limites.

---

### RULE-001 — Séparation stricte public / privé
- **Description** : le site public ne lit jamais de donnée personnelle ; les formulaires publics sont en écriture seule.
- **Conditions** : routes `/api/public/*` sans dépendance `get_current_user` ; les GET publics filtrent (`public_visible=true`) ou servent du contenu éditorial.
- **Contraintes** : aucune API publique ne retourne les collections d'intake.
- **Cas limites** : `GET /api/health/full` (sans auth) expose des compteurs de collections — écart mineur (SEC-09).
- **Fichiers** : server.py (routes public), phases.py.

### RULE-002 — RBAC à 4 rôles
- **Description** : `admin` (total), `production` (CRUD opérationnel + intake), `juridique` (validation contrats, lecture), `nomme` (accès restreint à son dossier).
- **Conditions** : `require_role(*roles)` sur chaque mutation.
- **Contraintes** : suppression (positions/people/assignments/ecosystem) = admin seul.
- **Cas limites** : `juridique` a accès en lecture à tout ce qui utilise `get_current_user` sans rôle (positions, people, assignments, dashboard, contrats) — lecture voulue ; il ne peut rien écrire hors transitions contrats.

### RULE-003 — Anti-brute-force login
- **Description** : blocage 15 minutes après 5 échecs pour un couple `ip:email`.
- **Conditions** : compteur `login_attempts` ; IP extraite de `X-Forwarded-For` (premier élément) sinon `request.client.host`.
- **Cas limites** : après expiration de la fenêtre, le compteur est purgé au prochain essai ; un succès purge immédiatement ; l'attaquant changeant d'IP contourne le verrou (limite connue, pas de verrou par email seul).

### RULE-004 — Sessions JWT courtes avec refresh
- **Description** : access token 15 min, refresh token 7 jours, tous deux en cookies httpOnly/secure/samesite=none.
- **Contraintes** : le type de token est vérifié (`type: access|refresh`).
- **Cas limites** : pas de rotation ni de liste de révocation du refresh (un refresh volé reste valable 7 jours — SEC-04).

### RULE-005 — Magic link réservé aux nommés
- **Description** : seul un utilisateur `role=nomme` peut recevoir un magic link (20 min, usage unique).
- **Conditions** : lookup `users{email, role:"nomme"}`.
- **Contraintes** : réponse toujours 200 (anti-énumération d'emails).
- **Cas limites** : sans `RESEND_API_KEY`, le lien est retourné dans la réponse (`dev_link`) 🔧 — interdit en production.

### RULE-006 — Honeypot anti-spam
- **Description** : tout formulaire public possède un champ caché `honeypot` ; s'il est rempli, la requête est acceptée (200) mais jamais persistée.
- **Dépendances** : RULE-001.
- **Cas limites** : aucun captcha ni rate limiting complémentaire (SEC-06).

### RULE-007 — RSVP à statut managé
- **Description** : chaque RSVP naît `pending` ; statuts autorisés {pending, confirmed, declined, waiting}, modifiables par admin/production uniquement.
- **Cas limites** : PATCH avec statut hors liste → 400.

### RULE-008 — Prix jamais affichés en premier (billetterie)
- **Description** : parcours en 2 étapes — étape 1 présente les tiers sans montant, le prix n'apparaît qu'après sélection.
- **Fichier** : Billetterie.jsx (commentaire explicite « no prices on step 1 »).

### RULE-009 — VIP retiré de la billetterie publique
- **Description** : `TICKET_PACKAGES` ne contient que gradin/latéral/premium ; l'accès VIP passe exclusivement par le Cercle restreint (dossier, cooptation), sans prix public.
- **Fichier** : server.py:233–239 (note explicite dans le code).

### RULE-010 — Montants de paiement définis côté serveur
- **Description** : le frontend n'envoie jamais de montant ; billetterie = `TICKET_PACKAGES[package_id].amount × quantity` ; mécénat = montant libre mais ≥ 500 € validé serveur (Pydantic `ge=500.0`).
- **Cas limites** : `package_id` inconnu → 400 ; `quantity` bornée 1–10.

### RULE-011 — Transition « payé » idempotente
- **Description** : `paid_at` n'est fixé qu'à la première transition vers `paid` (checkout/status vérifie l'état courant avant mise à jour).
- **Dépendances** : Stripe webhook + polling.

### RULE-012 — Mécénat minimum 500 €
- **Description** : tout don < 500 € est refusé à la validation (422).
- **Champs d'affectation** (`purpose`) : general, prizes, casting, series, bible (valeurs observées dans le code/les UI).

### RULE-013 — Cercle restreint sur dossier, sans paiement
- **Description** : la demande Cercle est une pré-qualification (`pending_review`), validation humaine ; aucun montant, aucun tarif exposé.
- **Docstring code** : « no payment, manual validation by Laurent ».

### RULE-014 — Cooptation par token unique 7 jours
- **Description** : token émis par admin/production, nominatif (sponsor), expirant à 7 jours, à usage unique.
- **Conditions de validité** : existe ∧ `used=false` ∧ `expires_at > now`.
- **Consommation** : à la soumission Cercle contenant `[coopte:TOKEN]` dans le message → `used=true` + traçage `coopted_by_token` sur la demande.
- **Cas limites** : un token expiré mais non utilisé reste en base (pas de purge) ; la consommation ne re-vérifie pas l'expiration (un token expiré cité dans un message serait quand même marqué `used`) — écart mineur.

### RULE-015 — Workflow contrat par rôle
- **Description** : matrice de transitions — production : {draft, juridique_review} ; juridique : {approved, refused} ; admin : {draft, juridique_review, approved, refused, sent, signed, archived} ; nomme : aucune.
- **Cas limites** ⚠️ : la matrice contrôle le **statut cible** mais pas la **transition depuis l'état courant** — l'intégrité du flux (draft→review→approved→sent→signed→archived) n'est garantie que par l'UI (finding testing agent iteration_2). 📋 Machine à états serveur recommandée.

### RULE-016 — Un contrat = un template + une personne
- **Description** : création via `assignment_id` (personne + intitulé de poste dérivés) ou `person_id` direct (partenariat, droit à l'image public) ; le corps est rendu immédiatement (variables figées à la création dans `rendered_body`).
- **Cas limites** : modification ultérieure de la personne/poste ne met pas à jour `rendered_body` (instantané voulu).

### RULE-017 — Le nommé ne voit que ses contrats
- **Description** : `GET /contracts` et `GET /contracts/{id}/pdf` filtrent sur `person_id == user.person_id` pour le rôle `nomme` (403 sinon).
- **Cas limites** : si le compte nommé n'a pas de `person_id`, il ne voit rien (filtre sur `None`).

### RULE-018 — Accès Bible conditionnel
- **Description** : admin/juridique/production : toujours ; nommé : uniquement si un contrat `template_id=nda` à statut `signed` existe pour son `person_id` ; tout autre profil : refus.
- **Dépendances** : RULE-015, RULE-017.

### RULE-019 — URL Bible signée, 5 minutes, usage unique
- **Description** : l'accès au PDF passe par un token opaque, TTL 300 s, consommé à la première lecture.
- **Cas limites** ⚠️ : stockage in-memory (dict Python) → invalidé par redémarrage, non partagé entre workers ; la consommation du stream n'est pas journalisée.

### RULE-020 — Journal des accès Bible
- **Description** : chaque émission d'URL signée est consignée (`bible_access_logs` : user, email, horodatage, action).
- **Cas limites** : « immuable » par convention seulement — aucune protection technique contre modification.

### RULE-021 — Audit trail des mutations privées
- **Description** : toute création/modification/suppression authentifiée insère `audit_logs {actor, action, entity, entity_id, meta, at}` ; consultable par admin seul (100 derniers).

### RULE-022 — Écosystème silencieux
- **Description** : les entités CVLN sont stockées avec un drapeau `public_visible` ; seules FMS, CVLN Holding, CVL Culinary Innovations sont publiques ; FREK, Kiltikonet, Label OS, Laurentia n'apparaissent **jamais** dans les réponses publiques.
- **Dépendances** : RULE-001.

### RULE-023 — Founder unique public
- **Description** : le Founders' Circle public expose les membres `public_visible=true` (champs restreints) ; le seed installe Laurent comme founder unique et purge les anciens placeholders.
- **Cas limites** ⚠️ : `activate_seeded_founders()` force `public_visible=true` sur **tous** les founders à chaque démarrage — un masquage manuel en base serait annulé au restart (dette).

### RULE-024 — Référence courte de soumission
- **Description** : chaque soumission publique reçoit une référence lisible : 6 derniers caractères hex de l'ObjectId en majuscules — communiquée à l'utilisateur.
- **Cas limites** : non garantie unique (collision hex possible) ; usage purement relationnel.

### RULE-025 — Comptes système sans nom personnel complet
- **Description** : comptes back-office nommés par fonction (« Production · CVLN », « Juridique · CVLN ») ; seul l'admin porte le prénom Laurent.
- **Fichier** : seed server.py:977–997.

### RULE-026 — API non indexable
- **Description** : toutes les réponses `/api/*` portent `X-Robots-Tag: noindex, nofollow, noarchive` ; Swagger/Redoc désactivés.

### RULE-027 — Date pivot unique : 12 décembre 2026, 19 h UTC
- **Description** : countdown public et `days_to_gala` du dashboard dérivent de cette constante (hardcodée en deux endroits — server.py:845 et 921).
- **Cas limites** : duplication → risque d'incohérence si l'une est modifiée (dette mineure).

### RULE-028 — Bible : un seul document courant
- **Description** : l'upload écrase le fichier unique `GALA_COOK_FOOD_BIBLE.pdf` et upsert le singleton `bible_meta{_id:"current"}` — pas de versionnage.
- **Cas limites** : aucune restauration possible d'une version antérieure. 📋 Versionnage recommandé.

### RULE-029 — Emails transactionnels 🔧 MOCKÉS
- **Description** : magic links et réponses Cercle sont composés mais uniquement journalisés ; `reply_sent=false` en mode mock. Le branchement Resend est un point d'extension identifié dans le code (« Production: integrate Resend SDK here »).

### RULE-030 — Signature électronique 🔧 NON INTÉGRÉE
- **Description** : le statut `signed` d'un contrat est posé **manuellement** par l'admin ; aucun appel Yousign n'existe dans le code (`health/full` le déclare `mock`). La preuve de signature repose donc sur un processus hors plateforme.
