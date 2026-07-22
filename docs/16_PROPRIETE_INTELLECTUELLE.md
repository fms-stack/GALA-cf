# 16. DOCUMENTATION DE PROPRIÉTÉ INTELLECTUELLE

Avertissement : ce chapitre est une analyse technique préparatoire, **pas un avis juridique**. Faire valider la stratégie par un conseil en PI (INPI/avocat).

## 16.1 Innovations et éléments différenciants — ✅ OBSERVÉS dans le code

| # | Actif | Description | Localisation |
|---|---|---|---|
| IP-01 | **Architecture « 2 couches » write-only** | Site public à écriture seule vers l'intake ; aucune lecture de donnée personnelle sans JWT | server.py (design global) |
| IP-02 | **Cooptation traçable par token nominatif single-use 7 j** | Mesure quantifiable de la qualité du réseau hôte-par-hôte (ALG-007) | server.py:682–705 |
| IP-03 | **VIP invisible** | Tier VIP retiré du catalogue public ; accès par dossier/cooptation, prix jamais affiché (RULE-009/013) | server.py:233–239 |
| IP-04 | **Bible conditionnelle** | Accès déverrouillé par signature NDA + capability URL 5 min single-use + journal (ALG-006) | phases.py:405–484 |
| IP-05 | **Écosystème silencieux** | Entités administrables avec drapeau `public_visible` ; 4 marques jamais exposées publiquement (FREK, Kiltikonet, Label OS, Laurentia) | phases.py:511–527 |
| IP-06 | **Moteur de contrats templatés** | 7 modèles juridiques FR à variables, rendu figé (instantané), workflow par rôles, PDF chartés | phases.py:27–400 |
| IP-07 | **CIP — Cultural Impact Protocol** | Standard culinaire propriétaire cité contractuellement (sourcing, traçabilité, mémoire culinaire afro, narration) | phases.py:129–155 |
| IP-08 | **Nomenclature CF-GAP-01..07** | Système des 7 prix (cuisine, artiste, action artistique, culture, cinéma, mode, littérature) avec ligne éditoriale rédigée | server.py:875–909 |
| IP-09 | **Identité visuelle Cook & Food** | Palette (Noir Nuit #050505, Ivoire Brut #EAE7E1, Or #A98A5A, Sable #CFC7BA, Brun #6B5646, Sauge #556058), duo typographique Cormorant Garamond/Switzer, grammaire de motion (parallax/split-text/transitions floutées) | tailwind.config.js, index.css, cinematics.js |
| IP-10 | **Logo vectoriel** | Anneaux concentriques + onde signature (composant React SVG) — ⚠️ version provisoire, PNG officiel non intégré | Logo.jsx |
| IP-11 | **Modèle Chapter I/II/III** | Trajectoire événementielle pluriannuelle (positionnement éditorial) | contenu pages |
| IP-12 | **Corpus éditorial** | Textes FR des 7 prix, manifeste, parcours "cercle restreint", 9 dictionnaires i18n | pages publiques, i18n.jsx |

## 16.2 Qualification juridique potentielle (à confirmer par conseil)

| Actif | Droit d'auteur | Secret d'affaires | Droit sui generis BDD | Marque | Brevet |
|---|---|---|---|---|---|
| Code source (backend + frontend) | ✅ automatique (L.112-2 CPI, logiciel) | — | — | — | ✗ (logiciel « en tant que tel » exclu en Europe) |
| 7 templates contractuels | ✅ œuvres textuelles | possible | — | — | — |
| Corpus éditorial (prix, manifeste, i18n) | ✅ | — | Base éditoriale structurée : possible | — | — |
| Bible technique (PDF confidentiel) | ✅ | ✅ **principal levier** (mesures de protection déjà en place : NDA + accès conditionnel + logs = « mesures raisonnables » L.151-1 C. com.) | — | — | — |
| CIP (protocole) | ✅ (document normatif à rédiger) | ✅ | — | ✅ marque verbale | — |
| « Cook & Food Gala », « CF-GAP », noms d'entités | — | — | — | ✅ INPI classes 41 (événementiel), 43 (restauration), 9/38/42 (plateforme) | — |
| Logo, charte graphique | ✅ | — | — | ✅ marque figurative | — |
| Mécanisme cooptation / Bible signée | documentation ✅ | ✅ | — | — | improbable (méthode d'affaires) |

## 16.3 Actifs logiciels et documentaires — inventaire de dépôt
1. Dépôt **APP** (Agence pour la Protection des Programmes) ou enveloppe **e-Soleau** : archive du code à date (tag Git + hash SHA-256 du bundle).
2. Dépôt notarié/e-Soleau : les 7 templates + le document CIP + la Bible (`GALA_COOK_FOOD_BIBLE.pdf`).
3. Dépôts INPI : « Cook & Food Gala » (verbal + semi-figuratif), « CIP / Cultural Impact Protocol », « CF-GAP » ; extension **WIPO Madrid** pour l'international (US, UK, JP, CN, BR, ZA) au moment de l'expansion Chapter II.
4. Preuves d'antériorité : historique Git (auto-commits horodatés) + le présent dossier daté.

## 16.4 Chaîne de titularité — points de vigilance ⚠️
- Code produit via la plateforme Emergent : vérifier les CGU quant à la cession des livrables générés (🔮 à confirmer contractuellement — non vérifiable dans le repo).
- **Images Unsplash** hardcodées (prix + pages) : licence Unsplash permissive mais sans droit à l'image des modèles pour usage commercial événementiel — **remplacer par un photoshoot commissionné avec cession écrite (photographe + modèles)** avant exploitation commerciale.
- **Audio** : l'URL externe configurée n'est ni contrôlée ni licenciée par CVLN (et retournait 403) — fournir une piste dont CVLN détient les droits.
- **Typographies** : Cormorant Garamond (OFL — libre), Switzer (Fontshare ITF Free Font License — usage commercial autorisé, vérifier la redistribution en self-hosting).
- **GSAP** : licence standard gratuite (depuis Webflow) — vérifier la clause « no charge for end users » au moment de la billetterie payante ; alternative : tout basculer sur Framer Motion (MIT).
- **MongoDB** : SSPL — sans impact tant que la plateforme n'est pas revendue comme service de base de données ; Atlas ou PostgreSQL en alternative si besoin.
- Dépendance stratégique : `emergentintegrations` (wrapper propriétaire) — prévoir la migration possible vers le SDK Stripe officiel (déjà présent).

## 16.5 Éléments NE constituant PAS des actifs propriétaires
Frameworks open source (React, FastAPI, Tailwind, Radix/shadcn), patterns génériques (JWT, RBAC, honeypot, webhook Stripe) : non appropriables. La valeur IP réside dans **l'assemblage, le corpus éditorial, les protocoles métier (CIP, cooptation, Bible) et la marque**.

## 16.6 Feuille de route IP recommandée 📋
| Horizon | Action |
|---|---|
| Immédiat | Recherche d'antériorité + dépôt INPI des marques ; e-Soleau code + Bible + CIP |
| Avant production | Purge des secrets de l'historique Git (12.7) ; NDA systématique déjà outillé ✅ |
| Court terme | Photoshoot propriétaire avec cessions ; document normatif CIP rédigé |
| Moyen terme | Contrats de cession IP des prestataires (les templates `prestation`/`cession_droits_auteur` du moteur couvrent déjà ce besoin ✅) |
| Long terme | Madrid Protocol ; valorisation (le présent dossier sert de data room technique) |
