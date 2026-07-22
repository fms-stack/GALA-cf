# 13. DOCUMENTATION DÉVELOPPEUR

Le guide d'installation/lancement complet est dans **[/app/README.md](../README.md)** (créé par cet audit). Ce chapitre le complète avec les conventions internes.

## 13.1 Prérequis
Python 3.11+, Node 20+, Yarn, MongoDB accessible, (optionnel) clé Stripe test.

## 13.2 Conventions de code — ✅ OBSERVÉES
- **Backend** : routes dans des `APIRouter(prefix="/api")` ; modèles d'entrée suffixés `In` ; sortie via `doc_out()` (jamais d'ObjectId brut) ; toute mutation privée appelle `audit()` ; messages d'erreur `detail` en français ; datetime UTC ISO 8601.
- **Frontend** : alias `@/` → `src/` ; pages en export default, composants en export nommé ; appels API exclusivement via `api` (`lib/api.js`) ; erreurs affichées via `toast.error(formatApiError(err.response?.data?.detail))` ; **chaque élément interactif porte un `data-testid` kebab-case** (ex. `admin-nav-contracts`, `lang-option-fr`) ; thème public = classe `dark` sur `<html>` (posée par PublicLayout, retirée par AdminLayout).
- **Design tokens** : utiliser `noir/ivoire/sable/brun/sauge/or` de tailwind.config.js ; classes utilitaires `serif-display`, `label-eyebrow` (index.css).
- **i18n** : toute nouvelle chaîne visible passe par `t("namespace.cle")` + ajout dans les 9 dictionnaires de `lib/i18n.jsx`.

## 13.3 Environnement d'exécution (plateforme Emergent)
- Supervisor : backend `0.0.0.0:8001`, frontend `3000` — ne pas modifier les ports.
- Hot reload actif des deux côtés ; `sudo supervisorctl restart backend|frontend` uniquement après changement de `.env` ou installation de dépendances.
- Logs : `tail -n 100 /var/log/supervisor/backend.err.log`.
- Frontend : toujours `process.env.REACT_APP_BACKEND_URL` ; backend : Mongo via `MONGO_URL`/`DB_NAME` uniquement.
- Dépendances : `yarn add <pkg>` (jamais npm) ; Python : `pip install <pkg> && pip freeze > backend/requirements.txt`.

## 13.4 Debugging — recettes
| Symptôme | Piste |
|---|---|
| 401 en boucle sur /admin | Cookies non envoyés : vérifier HTTPS (secure=true) et `withCredentials` |
| 429 login | Verrou brute-force : attendre 15 min ou purger `login_attempts` |
| 500 sur route avec id | ObjectId mal formé (défaut connu — voir 14/SEC-05) |
| Lien Bible 403 immédiat | Backend redémarré (tokens in-memory) → régénérer l'URL |
| Email non reçu | Normal : Resend 🔧 mocké — lire les logs backend (`[MOCK EMAIL]`) |
| Contrat non signable | Yousign 🔧 non intégré : le statut `signed` est posé manuellement par l'admin |
| Billetterie KO | Vérifier `STRIPE_API_KEY` (`GET /api/health/full`) |

## 13.5 Bonnes pratiques d'évolution
1. Nouvelle route privée → toujours `Depends(require_role(...))` + `audit()`.
2. Nouveau formulaire public → modèle Pydantic borné + champ `honeypot` + statut initial + `source_ip`.
3. Nouveau montant → défini côté serveur, jamais reçu du client.
4. Nouvelle collection → ajouter les index au `on_startup` et documenter dans docs/06.
5. Ne jamais logger de mot de passe, token ou contenu de contrat.
