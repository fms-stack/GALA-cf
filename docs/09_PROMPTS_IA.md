# 9. PROMPTS ET INSTRUCTIONS IA

## 9.1 État factuel — ✅ OBSERVÉ

**L'application n'utilise aucun LLM ni service IA en production.**
- Aucun endpoint métier n'appelle OpenAI/Anthropic/Gemini.
- Aucun prompt applicatif n'est stocké en base ou dans le code.
- `EMERGENT_LLM_KEY` est présente dans `backend/.env` mais **jamais lue** par `server.py`/`phases.py`.
- Les paquets IA de `requirements.txt` (openai, google-generativeai, litellm, tiktoken…) proviennent de l'image d'environnement et ne sont pas importés.

## 9.2 Prompts historiques de conception
**Non disponibles dans le projet analysé.** La plateforme a été construite par itérations conversationnelles avec l'agent E1 (Emergent) ; ces échanges ne sont pas persistés dans le dépôt. Ce qui suit est une **reconstruction par inférence** 🔮 des intentions de conception, déduite exclusivement de l'implémentation observée.

## 9.3 Intentions fonctionnelles reconstruites 🔮

### Sécurité & confidentialité
- « Le site public ne doit jamais exposer de donnée sensible : formulaires en écriture seule, listes réservées au back-office. »
- « Les API ne doivent pas être indexées (X-Robots-Tag) ni documentées publiquement (Swagger off). »
- « Les sessions sont des cookies httpOnly inaccessibles au JavaScript ; access court (15 min), refresh 7 jours. »
- « Le login résiste à la force brute (5 essais / 15 min par IP+email). »
- « La Bible n'est consultable qu'après signature du NDA, via un lien à durée de vie de 5 minutes, à usage unique, journalisé. »
- « Ne jamais faire confiance au client pour un montant : catalogue serveur + plancher mécénat. »
- « Ne jamais confirmer qu'un email existe (magic link : réponse constante). »

### Métier & positionnement
- « Le VIP n'a pas de prix public : il se mérite par cooptation et dossier (Cercle restreint). »
- « Chaque cooptation est traçable : qui a invité qui, avec quel token, consommé quand. »
- « Le workflow contrat suit les rôles : la production prépare, le juridique tranche, l'admin décide et archive. »
- « L'écosystème CVLN comporte des entités silencieuses (FREK, Kiltikonet, Label OS, Laurentia) jamais nommées publiquement. »
- « Le fondateur unique public est Laurent (CVLN Holding · Factory Maker Studio · CVL Culinary Innovations). »
- « Les prix affichés racontent une ligne éditoriale : 7 prix CF-GAP pour 7 disciplines de la diaspora afro mondiale. »
- « Les chefs invités adhèrent au standard CIP (Cultural Impact Protocol) : sourcing, traçabilité, mémoire culinaire, narration. »

### Expérience & identité
- « Éditorial premium type magazine : Cormorant Garamond pour l'émotion, Switzer pour la précision. »
- « Palette signature : Noir Nuit #050505, Ivoire Brut #EAE7E1, Or #A98A5A, Sable, Brun Terre, Sauge. »
- « Deux mondes : public sombre et cinématographique, back-office clair et dense. »
- « Le mouvement raconte : parallax, reveal, split-text du titre héro, transitions floutées entre pages. »
- « L'ambiance sonore est un opt-in discret, jamais imposée. »
- « L'international d'emblée : 9 langues dont le Kreyòl (ancrage Martinique). »

## 9.4 Workflows IA
❔ **Non disponibles dans le projet analysé.**
📋 Extensions candidates (si souhaitées, via la clé universelle Emergent) : pré-qualification automatique des dossiers Cercle restreint, tri/résumé des candidatures artistiques, génération multilingue du contenu éditorial, assistance de rédaction des réponses Cercle.
