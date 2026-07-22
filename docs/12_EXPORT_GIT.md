# 12. EXPORT GIT

## 12.1 État actuel — ✅ OBSERVÉ
- Dépôt Git présent (`/app/.git`), branche unique `main`, commits automatiques de la plateforme Emergent (« auto-commit for <job> »).
- `.gitignore` racine existant ; **durci par cet audit** : ajout de l'exclusion des fichiers `.env` (les secrets n'étaient pas exclus auparavant) et des artefacts (`storage/bible/*.pdf`).
- ⚠️ Si des `.env` ont déjà été commités dans l'historique, un simple `.gitignore` ne les retire pas : avant tout export public, exécuter `git rm --cached backend/.env frontend/.env` puis **faire tourner les secrets** (JWT_SECRET, mots de passe, clés).
- Export recommandé via la fonctionnalité **« Save to GitHub »** de la plateforme.

## 12.2 Structure de dépôt recommandée 📋
```
cvln-gala-os/
├── backend/            ├── frontend/           ├── docs/            # le présent dossier
├── .github/workflows/ci.yml                    ├── README.md
├── .gitignore          ├── LICENSE (propriétaire — voir 16)         └── CHANGELOG.md
```

## 12.3 Stratégie de branches (GitFlow allégé) 📋
| Branche | Rôle |
|---|---|
| `main` | Production — protégée, merge par PR uniquement, tag à chaque release |
| `develop` | Intégration continue |
| `feature/<slug>` | Développements (ex : `feature/yousign-integration`) |
| `hotfix/<slug>` | Corrections urgentes depuis `main` |

## 12.4 Versionning & releases 📋
- **SemVer** : `MAJOR.MINOR.PATCH`. État actuel proposé : **v0.9.0** (MVP complet, intégrations email/signature mockées). `v1.0.0` = Resend + Yousign réels + i18n complète + durcissement SEC-P0.
- Tags annotés `git tag -a v0.9.0 -m "MVP Gala OS"` ; releases GitHub avec notes générées depuis CHANGELOG (format Keep a Changelog).

## 12.5 `.gitignore` (contenu effectif après durcissement — extrait ajouté)
```gitignore
# Secrets — ne jamais versionner
.env
*/.env
**/.env.*
!**/.env.example
# Documents confidentiels
backend/storage/bible/*.pdf
memory/test_credentials.md
```
📋 Fournir des gabarits `backend/.env.example` et `frontend/.env.example` (noms de variables sans valeurs — liste au chapitre 01 §1.8).

## 12.6 CI recommandée (GitHub Actions) 📋
```yaml
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r backend/requirements.txt && pip install pytest pytest-asyncio
      - run: pytest backend/tests -q
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd frontend && yarn install --frozen-lockfile && yarn build
```
Compléments : `pip-audit` / `yarn npm audit`, `gitleaks` (détection de secrets), badge de couverture.

## 12.7 Assainissement avant export (checklist)
- [ ] `git rm --cached` des `.env` + rotation des secrets.
- [ ] Purger l'historique si secrets présents (`git filter-repo`) ou repartir d'un commit orphelin propre.
- [ ] Régénérer `requirements.txt` minimal (fastapi, uvicorn, motor, pymongo, pydantic[email], python-dotenv, PyJWT, bcrypt, reportlab, stripe, emergentintegrations, python-multipart, pytest) — le fichier actuel embarque ~90 paquets non utilisés.
- [ ] Retirer `memory/` et `test_reports/` de l'export public (internes plateforme).
