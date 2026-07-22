# 11. TESTS

## 11.1 Couverture actuelle — ✅ OBSERVÉ (rapports réels dans /app/test_reports/)

| Campagne | Portée | Résultat |
|---|---|---|
| `iteration_1.json` | Phases 1–3 : auth, cookies httpOnly HTTPS, RSVP, CRUD, dashboard, navigation admin, logout | Backend pytest **15/16 (94 %)** ; parcours Playwright critiques validés ; 1 vérification RSVP incomplète (data-testid manquant à l'époque) |
| `iteration_2.json` | Phases 4–6 : contrats/NDA, Bible, écosystème | Backend pytest **17/17 (100 %)** ; UI contrats + Bible validées ; **findings mineurs ouverts** : (a) pas de validation de transition d'état des contrats côté serveur, (b) accès `production` à la Bible non documenté dans la règle, (c) admin peut sauter des étapes du workflow |
| `pytest/pytest_results.xml` | Export JUnit de la campagne | — |

⚠️ **Trou de couverture** : les fonctionnalités livrées APRÈS iteration_2 n'ont **pas** été couvertes par le testing agent : billetterie Stripe, mécénat, cercle restreint, cooptation, founders, i18n, admin mobile, audio, health/full, send-reply. Elles ont été testées manuellement/par curl au fil de l'eau (non formalisé).

## 11.2 Tests unitaires
❔ **Aucun test unitaire versionné dans le dépôt** (pas de dossier `tests/` ; les pytest des campagnes ont été exécutés par l'agent de test, artefacts non conservés comme suite maintenue).

## 11.3 Couverture manquante (priorisée)
1. **P0** — Suite backend versionnée `backend/tests/` : auth (429 brute-force, refresh, magic link expiré/réutilisé), RBAC par rôle sur chaque endpoint privé, workflow contrats (transitions illégales), Bible (nomme sans NDA → 403 ; token single-use ; expiration), montants Stripe serveur (package inconnu, quantité hors bornes, mécénat < 500).
2. **P0** — Intégration Stripe test : session → webhook simulé → idempotence `paid_at`.
3. **P1** — E2E Playwright : billetterie 2 étapes, cooptation bout-en-bout, cercle restreint, i18n switch (9 langues), responsive mobile admin.
4. **P1** — Sécurité : ObjectId invalide → doit rendre 400/404 (aujourd'hui 500), honeypot, en-têtes.
5. **P2** — Charge : `GET /assignments` (N+1), pics de soumissions publiques.

## 11.4 Propositions de tests automatisés (squelettes)

```python
# backend/tests/test_auth.py  (pytest + httpx.AsyncClient)
async def test_bruteforce_lock(client):
    for _ in range(5):
        r = await client.post("/api/auth/login", json={"email": E, "password": "wrong"})
        assert r.status_code == 401
    r = await client.post("/api/auth/login", json={"email": E, "password": "wrong"})
    assert r.status_code == 429

async def test_contract_illegal_transition(prod_client, contract_id):
    r = await prod_client.patch(f"/api/contracts/{contract_id}/status", json={"status": "signed"})
    assert r.status_code == 403  # production ne peut pas signer

async def test_bible_requires_nda(nomme_client):
    r = await nomme_client.post("/api/bible/signed-url")
    assert r.status_code == 403

async def test_checkout_amount_server_side(client):
    r = await client.post("/api/public/checkout/session", json={
        "package_id": "hacked", "quantity": 1, "origin_url": "https://x", "full_name": "T U", "email": "t@u.io"})
    assert r.status_code == 400
```

```javascript
// e2e/billetterie.spec.js (Playwright)
test('les prix ne sont pas visibles à l’étape 1', async ({ page }) => {
  await page.goto('/billetterie');
  await expect(page.getByTestId('public-billetterie')).not.toContainText('€');
});
```

📋 Outils recommandés : pytest + pytest-asyncio + mongomock-motor (ou base éphémère), Playwright CT, GitHub Actions (voir 12_EXPORT_GIT). Objectif de couverture initial : 80 % des routes, 100 % des règles RULE-003/010/015/018/019.
