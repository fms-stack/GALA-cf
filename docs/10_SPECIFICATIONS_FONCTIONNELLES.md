# 10. SPÉCIFICATIONS FONCTIONNELLES

## 10.1 Vision produit
CVLN Gala OS est le système d'exploitation du **Cook & Food Gala 2026 — Chapter I** (Paris, samedi 12 décembre 2026) : événement gastronomique et culturel de la diaspora afro mondiale mêlant cuisine, culture, musique, art, mode, cinéma et littérature. La plateforme couvre l'intégralité du cycle : vitrine éditoriale premium, billetterie publique sans friction tarifaire, filière VIP confidentielle par cooptation, mécénat, candidatures/casting/sponsoring, production interne (postes, personnes, affectations), contrats juridiques avec workflow, Bible technique confidentielle, gouvernance (Founders' Circle) et pilotage (dashboard, audit).

## 10.2 Objectifs
1. Installer un standard culturel premium pour la diaspora afro mondiale (« plus qu'un événement, une empreinte culturelle »).
2. Vendre les places publiques sans jamais banaliser le VIP (prix VIP invisible, cooptation only).
3. Industrialiser la production : postes → affectations → contrats → PDF → validation juridique.
4. Protéger l'actif confidentiel (Bible, contrats, données VIP) par RBAC, NDA et journalisation.
5. Tracer la qualité du réseau (tokens de cooptation nominaux).
6. Porter la marque à l'international (i18n 9 langues — △ actuellement partielle).

## 10.3 Personas — ✅ OBSERVÉ (PRD + code)
| Persona | Rôle système | Besoin |
|---|---|---|
| Laurent | `admin` (founder unique) | Contrôle total, arbitrages, envoi contrats, réponses Cercle |
| Équipe production | `production` | CRUD opérationnel, intake, brouillons contrats, cooptation |
| Conseil juridique | `juridique` | Validation/refus contrats, lecture |
| Nommé (talent casté) | `nomme` | Magic link, son dossier, signer NDA, lire la Bible |
| Visiteur / prospect | public | Découvrir, réserver, candidater, donner, se signaler |
| Ultra-fortuné coopté | public + token | Parcours confidentiel sans prix affiché |

## 10.4 Parcours utilisateurs — ✅ OBSERVÉS (pages + endpoints)
1. **Billetterie** : `/billetterie` → étape 1 : 3 tiers présentés SANS prix → sélection → étape 2 : quantité + identité + total → Stripe Checkout → `/billetterie/success` (polling statut).
2. **Coopté** : réception URL `/cercle-restreint?coopte=TOKEN` (ou `/sur-invitation`) → bannière « coopté(e) par [sponsor] » → formulaire confidentiel → `pending_review` → réponse direction sous 7 j (email 🔧 mocké).
3. **Mécène** : `/mecenat` → montant (≥ 500 €) + affectation → Stripe → `/mecenat/success`.
4. **Candidat créatif** : `/candidatures` (7 disciplines) → réf. courte de suivi.
5. **Talent casting** : `/casting` (chef/artiste/performer/mc) → réf. courte.
6. **Marque** : `/sponsoring` (4 tiers : titre/or/argent/partenaire) → contact production.
7. **VIP RSVP** : `/rsvp` → statut piloté par production (pending/confirmed/declined/waiting).
8. **Nommé** : compte créé par admin → `/portail` (magic link) → dossier → NDA signé (statut manuel 🔧) → Bible débloquée → contrat.
9. **Contrat interne** : production crée `draft` → `juridique_review` → juridique `approved/refused` → admin `sent` → `signed` → `archived`.
10. **Pilotage** : `/admin` (KPI), `/admin/inner` (Cercle/Mécénat/Cooptation + export CSV), `/admin/submissions`, audit logs.

## 10.5 Fonctionnalités (inventaire)
**Public (14 pages)** : Home (héro cinématique, countdown, disciplines), Concept, Prix (7 CF-GAP), Partenaires (écosystème public), Billetterie 2 étapes + success, RSVP, Candidatures, Casting, Sponsoring, Sur-Invitation (cooptation), Founders Circle, Cercle Restreint, Mécénat + success, Contact. Switcher 9 langues, curseur custom, audio opt-in, transitions animées.
**Back-office (11 pages)** : Login, Portail magic link, Dashboard KPI, Postes, Personnes, Affectations, Invitations VIP, Réceptions publiques, Contrats & NDA (templates, workflow, PDF), Bible (upload/consultation/logs), Cercle & Mécénat & Cooptation (+ CSV).

## 10.6 Exigences fonctionnelles (RF) — état
| RF | Exigence | État |
|---|---|---|
| RF-01 | Auth JWT + refresh + brute-force | ✅ |
| RF-02 | RBAC 4 rôles | ✅ |
| RF-03 | Magic link nommés | ✅ (email 🔧 mock) |
| RF-04 | CRUD production complet | ✅ |
| RF-05 | RSVP + 4 intakes publics write-only | ✅ |
| RF-06 | Billetterie Stripe 3 tiers, VIP exclu | ✅ (mode test) |
| RF-07 | Mécénat ≥ 500 € Stripe | ✅ (mode test) |
| RF-08 | Cooptation token 7 j traçable | ✅ |
| RF-09 | 7 templates contrats + PDF + workflow | ✅ (machine à états serveur △) |
| RF-10 | Bible conditionnelle NDA + URL signée + logs | ✅ (stockage local △) |
| RF-11 | Signature électronique Yousign | ✗ 🔧 non intégrée |
| RF-12 | Emails transactionnels Resend | ✗ 🔧 mockés |
| RF-13 | i18n 9 langues | △ nav/CTA/héro seulement |
| RF-14 | Dashboard + audit | ✅ |
| RF-15 | Écosystème silencieux | ✅ |

## 10.7 Exigences non fonctionnelles (RNF) — état
| RNF | Exigence | État |
|---|---|---|
| RNF-01 | Aucune donnée sensible côté public | ✅ (sauf compteurs health/full △) |
| RNF-02 | API non indexables | ✅ |
| RNF-03 | Secrets via variables d'environnement | △ fallbacks en dur + seeds en dur (SEC-01/02) |
| RNF-04 | Chiffrement au repos des documents confidentiels | ✗ (Bible en clair sur disque) |
| RNF-05 | Journalisation immuable | △ (Mongo standard) |
| RNF-06 | Résilience multi-instance | ✗ (tokens Bible in-memory) |
| RNF-07 | Design premium propriétaire (palette, typo, motion) | ✅ |
| RNF-08 | Responsive mobile public + admin | ✅ (burger deux couches ; admin corrigé durant cet audit) |
| RNF-09 | Sauvegardes chiffrées | ✗ non implémentées |
| RNF-10 | Tests automatisés | △ (voir 11_TESTS) |

## 10.8 Cas d'utilisation formels (exemple type)
**UC-07 : Émettre une cooptation** — Acteur : admin/production. Précondition : authentifié. Scénario : ouvrir `/admin/inner` → onglet Cooptation → saisir sponsor → « Générer » → URL copiée au presse-papier → transmission au prospect hors plateforme. Extension : prospect ouvre l'URL → validation token → soumission → token consommé + traçage. Postcondition : `cooptation_tokens.used=true`, demande marquée `coopted_by_token`.
Les 15 autres UC suivent les parcours du §10.4 avec les endpoints du chapitre 03.
