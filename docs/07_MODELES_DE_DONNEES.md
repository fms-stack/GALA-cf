# 7. MODÈLES DE DONNÉES

## 7.1 Modèle utilisateurs & rôles — ✅ OBSERVÉ

```
User {
  id: ObjectId→str
  email: str (unique, lowercase)
  password_hash: str (bcrypt)      # jamais renvoyé par l'API
  name: str                        # fonctionnel : "Laurent — Admin", "Production · CVLN"
  role: "admin" | "production" | "juridique" | "nomme"
  person_id?: str                  # lie un compte "nomme" à sa fiche people
  created_at: ISO8601
}
```

Matrice de permissions effective (dérivée du code) :

| Capacité | admin | production | juridique | nomme | public |
|---|---|---|---|---|---|
| Lire positions/people/assignments/dashboard | ✅ | ✅ | ✅ | ✅ ⚠️* | ✗ |
| Créer/éditer positions/people/assignments | ✅ | ✅ | ✗ | ✗ | ✗ |
| Supprimer (toutes entités) | ✅ | ✗ | ✗ | ✗ | ✗ |
| Gérer invitations/intake/orders | ✅ | ✅ | ✗ | ✗ | écriture seule |
| Créer contrat | ✅ | ✅ | ✗ | ✗ | ✗ |
| Transitions contrat | toutes | draft, juridique_review | approved, refused | aucune | ✗ |
| Voir contrats | tous | tous | tous | **les siens** | ✗ |
| Bible signed-url | ✅ | ✅ | ✅ | si NDA signé | ✗ |
| Upload Bible, access-logs, audit-logs, ecosystem, send-reply | ✅ | ✗ | ✗ | ✗ | ✗ |
| Émettre token cooptation | ✅ | ✅ | ✗ | ✗ | ✗ |

⚠️* Constat : les routes en simple `get_current_user` (positions, people, assignments, dashboard, contract-templates, bible/meta) sont lisibles par le rôle `nomme` — plus large que le besoin fonctionnel (moindre privilège non appliqué, voir 14/SEC-08).

## 7.2 Modèle contenus — ✅ OBSERVÉ
- **CONTRACT_TEMPLATES** (7, immuables, en code — phases.py:27–232) : `nda`, `prestation`, `cession_droits_auteur`, `chef_invite_cip`, `cession_image_voisins`, `partenariat`, `droit_image_public`. Chaque template : `{id, title, kind: nda|contrat, body (fr, variables {full_name} {role_title} {deliverables} {fee_amount} {start_date} {end_date} {today})}`.
- **TICKET_PACKAGES** (3, en code — server.py:235–239) : gradin 50 € / latéral 80 € / premium 120 €, devise EUR, ordre d'affichage.
- **PRIZES CF-GAP-01..07** (en code — server.py:880–909) : code, titre, discipline, image (Unsplash ⚠️ URLs externes), intro, body.
- **I18N DICTS** (frontend — 9 langues × 5 namespaces : nav, cta, hero, footer, invitation) △ partiel.

## 7.3 Modèle médias
- Bible : fichier unique `storage/bible/GALA_COOK_FOOD_BIBLE.pdf` + singleton `bible_meta`. Non chiffré, non versionné.
- Images publiques : URLs Unsplash hardcodées (prix) et dans les pages. ❔ Aucun stockage média interne. 📋 Photoshoot propriétaire + Object Storage recommandés (droits d'image + fiabilité).
- Audio : URL externe via `REACT_APP_AMBIENT_AUDIO_URL` (composant opt-in) — ⚠️ dernière URL testée en 403.

## 7.4 Modèle transactions
```
PaymentTransaction {                     MecenatDonation {
  session_id (Stripe)                      session_id (Stripe)
  amount, currency: "eur"                  amount (≥ 500)
  package_id, package_label, quantity      full_name, email, organisation
  full_name, email                         purpose: general|prizes|casting|series|bible
  payment_status: initiated→paid           payment_status: initiated→(paid)
  status: open→complete                    status: open
  metadata {package_id, quantity, ...}     created_at
  paid_at?, created_at                   }
}
```
Distinction des flux par `metadata.kind` (`mecenat`) côté Stripe. Source de vérité paiement : Stripe ; la base locale est un miroir réconcilié (webhook + polling).

## 7.5 Modèle événements
❔ **Non disponible dans le projet analysé** — aucun bus d'événements ; flux synchrones REST + webhook Stripe entrant unique.

## 7.6 Modèle paramètres
❔ Pas de collection de configuration : les paramètres métier (date du gala, tarifs, templates, prix) sont **hardcodés**. 📋 Externaliser en collection `settings` si l'événement devient récurrent (Chapter II/III).

## 7.7 Modèle logs
```
AuditLog { actor, action, entity, entity_id, meta{}, at }         # toutes mutations privées
BibleAccessLog { user_id, user_email, at, action }                 # émissions d'URL signées
LoginAttempt { identifier, count, last_at }                        # anti-brute-force (technique)
```
⚠️ Aucune garantie d'immutabilité technique (voir 14/SEC-07).

## 7.8 Relations complètes
Voir ERD en [06_BASE_DE_DONNEES.md §6.4](06_BASE_DE_DONNEES.md). Synthèse : `users —(person_id)→ people` ; `assignments = positions × people` ; `contracts → people (+ assignments? + templates code)` ; `cercle_restreint_inquiries —(coopted_by_token)→ cooptation_tokens —(sponsor_user_id)→ users` ; transactions → Stripe (externe) ; intake sans relations.
