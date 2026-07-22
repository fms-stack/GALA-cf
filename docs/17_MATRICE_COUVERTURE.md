# 17. RAPPORT DE COUVERTURE

Légende : ✓ entièrement documenté · △ partiellement documenté · ✗ non documenté / absent du projet.

## 17.1 Matrice de couverture documentaire (le présent dossier)

| Domaine | Couverture | Référence | Commentaire |
|---|---|---|---|
| Code source (structure, rôles, dépendances, licences) | ✓ | docs/01 | Arborescence + cartes de fichiers ligne à ligne |
| Architecture (C4, séquence, déploiement, flux) | ✓ | docs/02 | Diagrammes Mermaid ; topologie cloud de prod cible ✗ (n'existe pas) |
| API (45+ endpoints) | ✓ | docs/03 | Méthodes, auth, bodies, réponses, erreurs, exemples |
| Règles métier | ✓ | docs/04 | RULE-001 → RULE-030 avec cas limites |
| Algorithmes | ✓ | docs/05 | ALG-001 → ALG-012 avec pseudo-code et complexité |
| Base de données | ✓ | docs/06 | 20 collections, index, ERD ; migrations ✗ (inexistantes) |
| Modèles de données | ✓ | docs/07 | Utilisateurs, rôles, contenus, transactions, logs |
| Dépendances entre modules | ✓ | docs/08 | Graphe + dette technique |
| Prompts / IA | ✓ | docs/09 | État factuel : aucun LLM en production ; intentions reconstruites 🔮 |
| Spécifications fonctionnelles | ✓ | docs/10 | Vision, personas, parcours, RF/RNF avec états réels |
| Tests | △ | docs/11 | Campagnes 1–2 documentées ; suite versionnée ✗ ; plan proposé ✓ |
| Export Git | ✓ | docs/12 | .gitignore durci ✓ (fichier réel) ; CI proposée 📋 |
| Documentation développeur | ✓ | docs/13 + /README.md | README réel créé |
| Cybersécurité | ✓ | docs/14 | 16 findings SEC-01..16 + OWASP + plan de remédiation |
| Performance | ✓ | docs/15 | 8 findings PERF-01..08 |
| Propriété intellectuelle | ✓ | docs/16 | 12 actifs IP + qualification + feuille de route |
| Infrastructure | △ | docs/02 §2.5/2.8 | Environnement preview documenté ; infra de prod cible ✗ (n'existe pas encore) |
| CI/CD | ✗→📋 | docs/12 §12.6 | Aucun pipeline dans le projet ; modèle fourni |
| DevOps (backups, monitoring externe) | ✗→📋 | docs/02 §2.9 | Health endpoints ✓ ; backups/alerting ✗ |

## 17.2 Matrice d'état d'implémentation du PRODUIT (rappel synthétique)

| Fonction | Implémenté | Testé (agent) | Production-ready |
|---|---|---|---|
| Auth JWT + brute-force + refresh | ✓ | ✓ (it.1) | △ (SEC-01/02/04) |
| Magic link nommés | ✓ | ✓ (it.1) | ✗ (email mocké, SEC-12) |
| CRUD production + RBAC | ✓ | ✓ (it.1) | ✓ |
| RSVP + intakes publics | ✓ | ✓ (it.1 partiel) | △ (SEC-06) |
| Contrats + PDF + workflow | ✓ | ✓ (it.2) | △ (SEC-16) |
| Bible conditionnelle | ✓ | ✓ (it.2) | ✗ (SEC-03/13) |
| Billetterie Stripe | ✓ (test mode) | ✗ post-it.2 | △ (passage live à valider) |
| Mécénat Stripe | ✓ (test mode) | ✗ | △ |
| Cooptation + Cercle restreint | ✓ | ✗ | △ |
| Founders / écosystème silencieux | ✓ | ✗ | △ (RULE-023 : visibilité forcée au boot) |
| i18n 9 langues | △ (nav/CTA/héro) | ✗ | ✗ |
| Emails Resend | ✗ 🔧 | — | ✗ |
| Signature Yousign | ✗ 🔧 | — | ✗ |
| Audio ambiant | △ (composant OK, source 403) | ✗ | ✗ |
| Logo officiel PNG | ✗ (SVG provisoire) | — | ✗ |
| Admin responsive mobile | ✓ (crash imports corrigé durant cet audit) | ✗ | À re-tester |

## 17.3 Lacunes résiduelles connues (transparence)
1. Suite de tests versionnée absente — le plus grand risque de régression.
2. Aucune couverture testing agent des fonctionnalités post-iteration 2 (billetterie, mécénat, cooptation, i18n, mobile admin).
3. Infra de production, CI/CD, sauvegardes : à construire (modèles fournis).
4. Contenu éditorial multilingue : à traduire humainement avant d'annoncer 9 langues.
5. Conversion DOCX→PDF de la Bible : non outillée dans le code (le PDF actuel a été uploadé tel quel).
