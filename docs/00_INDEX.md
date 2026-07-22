# CVLN GALA OS — DOSSIER TECHNIQUE & PROPRIÉTÉ INTELLECTUELLE
## Cook & Food Gala 2026 — Chapter I · Paris · 12.12.2026

**Titulaire** : CVLN Holding · **Éditeur** : Factory Maker Studio
**Version** : 2.0 · **Date** : Juin 2026
**Méthode** : audit intégral du code source réel (`/app/backend`, `/app/frontend`), sans invention.

---

## Convention de lecture (appliquée dans TOUT le dossier)

| Marqueur | Signification |
|---|---|
| ✅ **OBSERVÉ** | Constaté directement dans le code source (fichier + ligne cités) |
| 🔧 **MOCKÉ** | Présent dans le code mais simulé — non opérationnel en production |
| 🔮 **INFÉRÉ** | Reconstruit par inférence à partir de l'implémentation |
| 📋 **RECOMMANDÉ** | Proposition d'amélioration, non présente dans le code |
| ❔ **NON DISPONIBLE** | "Non disponible dans le projet analysé." |

---

## Table des matières

| # | Fichier | Contenu |
|---|---|---|
| 1 | [01_CODE_SOURCE.md](01_CODE_SOURCE.md) | Arborescence complète, rôle de chaque fichier, dépendances, licences, variables d'environnement |
| 2 | [02_ARCHITECTURE.md](02_ARCHITECTURE.md) | Architecture globale/logique/physique/cloud/réseau/sécurité, diagrammes C4, séquence, déploiement |
| 3 | [03_API_REFERENCE.md](03_API_REFERENCE.md) | Inventaire exhaustif des 45 endpoints (méthode, auth, params, body, réponses, erreurs, exemples) |
| 4 | [04_REGLES_METIER.md](04_REGLES_METIER.md) | RULE-001 → RULE-030 : toutes les règles métier avec conditions, contraintes, cas limites |
| 5 | [05_ALGORITHMES.md](05_ALGORITHMES.md) | ALG-001 → ALG-012 : algorithmes métier, pseudo-code, complexité, fichiers/endpoints concernés |
| 6 | [06_BASE_DE_DONNEES.md](06_BASE_DE_DONNEES.md) | 20 collections MongoDB, champs, index, ERD Mermaid, seeds |
| 7 | [07_MODELES_DE_DONNEES.md](07_MODELES_DE_DONNEES.md) | Modèles utilisateurs, rôles, contenus, transactions, logs, relations complètes |
| 8 | [08_DEPENDANCES_MODULES.md](08_DEPENDANCES_MODULES.md) | Cartographie qui-appelle-qui, couplage, cohésion, dette technique |
| 9 | [09_PROMPTS_IA.md](09_PROMPTS_IA.md) | Prompts / logique IA (état : aucun LLM en production) + intentions reconstruites |
| 10 | [10_SPECIFICATIONS_FONCTIONNELLES.md](10_SPECIFICATIONS_FONCTIONNELLES.md) | Vision, personas, parcours, cas d'utilisation, exigences F/NF |
| 11 | [11_TESTS.md](11_TESTS.md) | Couverture actuelle (rapports réels), couverture manquante, plan de tests proposé |
| 12 | [12_EXPORT_GIT.md](12_EXPORT_GIT.md) | Structure de dépôt, GitFlow, .gitignore, versionning, releases |
| 13 | [13_DOCUMENTATION_DEVELOPPEUR.md](13_DOCUMENTATION_DEVELOPPEUR.md) | Guide développeur (complète le README.md racine) |
| 14 | [14_CYBERSECURITE.md](14_CYBERSECURITE.md) | Audit OWASP, failles identifiées (avec lignes de code), recommandations priorisées |
| 15 | [15_PERFORMANCE.md](15_PERFORMANCE.md) | Goulots d'étranglement identifiés, N+1, index manquants, optimisations |
| 16 | [16_PROPRIETE_INTELLECTUELLE.md](16_PROPRIETE_INTELLECTUELLE.md) | Actifs IP, innovations, marques, stratégie de dépôt, licences tierces |
| 17 | [17_MATRICE_COUVERTURE.md](17_MATRICE_COUVERTURE.md) | Matrice ✓/△/✗ de couverture documentaire globale |

**Fichiers racine créés** : `/app/README.md` (guide d'installation complet) · `/app/.gitignore` (durci : exclusion des `.env`).

> Note : `/app/memory/IP_TECHNICAL_DOSSIER.md` (v1.0) est remplacé par le présent dossier v2.0, plus exhaustif et vérifié ligne par ligne contre le code.

---

## Synthèse exécutive (état réel au 2026-06)

**Implémenté et fonctionnel** ✅ : auth JWT cookies httpOnly + refresh + anti-brute-force, magic links (lien retourné en mode dev), RBAC 4 rôles, CRUD postes/personnes/affectations (25 postes seedés), RSVP VIP, 4 formulaires publics write-only avec honeypot, billetterie Stripe test (3 tiers, VIP retiré), mécénat Stripe, cooptation par token 7 jours, 7 templates de contrats + génération PDF ReportLab, workflow contrats par rôle, Bible PDF avec URL signée 5 min single-use + logs d'accès, dashboard KPI, audit logs, écosystème silencieux, i18n 9 langues (navigation/CTA/hero uniquement).

**Mocké** 🔧 : Resend (emails), Yousign (signature électronique), réponse email Cercle restreint.

**Non conforme aux annonces antérieures** ⚠️ : Bible stockée en **local non chiffré** (`/app/backend/storage/bible/`), pas en Object Storage chiffré ; i18n **partielle** (contenu éditorial profond en FR) ; audio ambiant dépendant d'une URL externe non fiable ; workflow contrats non validé côté serveur comme machine à états.

**Corrigé durant cet audit** : crash runtime `/admin` (imports `useState`, `List`, `X` manquants dans `AdminLayout.jsx`).
