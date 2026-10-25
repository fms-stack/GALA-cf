import os
import pytest
import requests
from dotenv import dotenv_values

ENV = dotenv_values("/app/backend/.env")
BASE = "http://localhost:8001/api"
ADMIN = {"email": ENV["ADMIN_EMAIL"], "password": ENV["ADMIN_PASSWORD"]}
JURIDIQUE = {"email": "juridique@cfceremony.com", "password": ENV["STAFF_JURIDIQUE_PASSWORD"]}
PRODUCTION = {"email": "production@cfceremony.com", "password": ENV["STAFF_PRODUCTION_PASSWORD"]}


def login(creds):
    s = requests.Session()
    r = s.post(f"{BASE}/auth/login", json=creds, timeout=10)
    assert r.status_code == 200, r.text
    # cookies Secure non renvoyés en http local -> on utilise le header Bearer (supporté par l'API)
    s.headers["Authorization"] = f"Bearer {r.cookies.get('access_token')}"
    return s


@pytest.fixture(scope="module")
def admin():
    return login(ADMIN)


@pytest.fixture(scope="module")
def juridique():
    return login(JURIDIQUE)


@pytest.fixture(scope="module")
def production():
    return login(PRODUCTION)


# ---------- Santé & exposition ----------

def test_health_public():
    r = requests.get(f"{BASE}/health", timeout=10)
    assert r.status_code == 200 and r.json()["status"] == "ok"


def test_health_full_requires_admin():
    assert requests.get(f"{BASE}/health/full", timeout=10).status_code == 401


def test_health_full_admin_ok(admin):
    r = admin.get(f"{BASE}/health/full")
    assert r.status_code == 200
    checks = r.json()["checks"]
    assert checks["bible_storage"]["encrypted"] is True


# ---------- Auth ----------

def test_login_wrong_password():
    r = requests.post(f"{BASE}/auth/login", json={"email": ADMIN["email"], "password": "WRONG-xyz"}, timeout=10)
    assert r.status_code == 401
    # purge l'essai raté pour ne pas verrouiller le compte admin
    from pymongo import MongoClient
    db = MongoClient(ENV["MONGO_URL"])[ENV["DB_NAME"]]
    db.login_attempts.delete_many({"identifier": {"$regex": ADMIN["email"]}})


def test_bruteforce_lockout():
    fake = {"email": "bruteforce-test@nowhere.io", "password": "bad"}
    for _ in range(5):
        assert requests.post(f"{BASE}/auth/login", json=fake, timeout=10).status_code == 401
    assert requests.post(f"{BASE}/auth/login", json=fake, timeout=10).status_code == 429
    from pymongo import MongoClient
    db = MongoClient(ENV["MONGO_URL"])[ENV["DB_NAME"]]
    db.login_attempts.delete_many({"identifier": {"$regex": "bruteforce-test"}})


def test_me_requires_auth():
    assert requests.get(f"{BASE}/auth/me", timeout=10).status_code == 401


def test_magic_link_always_200():
    r = requests.post(f"{BASE}/auth/magic-link/request", json={"email": "ghost@nowhere.io"}, timeout=10)
    assert r.status_code == 200


# ---------- RBAC ----------

def test_juridique_cannot_create_position(juridique):
    r = juridique.post(f"{BASE}/positions", json={"code": "TST-99", "title": "x", "pole": "y"})
    assert r.status_code == 403


def test_production_cannot_delete_position(production, admin):
    r = admin.post(f"{BASE}/positions", json={"code": "TST-DEL", "title": "tmp", "pole": "tmp"})
    pid = r.json()["id"]
    assert production.delete(f"{BASE}/positions/{pid}").status_code == 403
    assert admin.delete(f"{BASE}/positions/{pid}").status_code == 200


# ---------- Paiements : montants côté serveur ----------

def test_checkout_rejects_unknown_package():
    r = requests.post(f"{BASE}/public/checkout/session", json={
        "package_id": "hacked", "quantity": 1, "origin_url": "https://x.io",
        "full_name": "T U", "email": "t@u.io"}, timeout=15)
    assert r.status_code == 400


def test_checkout_quantity_bounds():
    r = requests.post(f"{BASE}/public/checkout/session", json={
        "package_id": "gradin", "quantity": 99, "origin_url": "https://x.io",
        "full_name": "T U", "email": "t@u.io"}, timeout=15)
    assert r.status_code == 422


def test_mecenat_minimum_500():
    r = requests.post(f"{BASE}/public/mecenat", json={
        "full_name": "T U", "email": "t@u.io", "amount_eur": 100, "honeypot": ""}, timeout=15)
    assert r.status_code == 422


# ---------- Machine à états contrats ----------

@pytest.fixture(scope="module")
def contract(admin):
    p = admin.post(f"{BASE}/people", json={"full_name": "Test Nommé SM", "email": "sm@test.io"}).json()
    c = admin.post(f"{BASE}/contracts", json={"template_id": "nda", "person_id": p["id"]}).json()
    assert c["status"] == "draft"
    yield c
    from pymongo import MongoClient
    from bson import ObjectId
    db = MongoClient(ENV["MONGO_URL"])[ENV["DB_NAME"]]
    db.contracts.delete_one({"_id": ObjectId(c["id"])})
    db.people.delete_one({"_id": ObjectId(p["id"])})


def test_admin_cannot_skip_to_signed(admin, contract):
    r = admin.patch(f"{BASE}/contracts/{contract['id']}/status", json={"status": "signed"})
    assert r.status_code == 409  # draft -> signed interdit même pour admin


def test_production_cannot_approve(production, contract):
    r = production.patch(f"{BASE}/contracts/{contract['id']}/status", json={"status": "approved"})
    assert r.status_code == 403


def test_full_legal_workflow(admin, juridique, production, contract):
    cid = contract["id"]
    assert production.patch(f"{BASE}/contracts/{cid}/status", json={"status": "juridique_review"}).status_code == 200
    assert juridique.patch(f"{BASE}/contracts/{cid}/status", json={"status": "signed"}).status_code == 403
    assert juridique.patch(f"{BASE}/contracts/{cid}/status", json={"status": "approved"}).status_code == 200
    assert admin.patch(f"{BASE}/contracts/{cid}/status", json={"status": "signed"}).status_code == 409  # approved -> signed interdit
    assert admin.patch(f"{BASE}/contracts/{cid}/status", json={"status": "sent"}).status_code == 200
    assert admin.patch(f"{BASE}/contracts/{cid}/status", json={"status": "signed"}).status_code == 200
    assert admin.patch(f"{BASE}/contracts/{cid}/status", json={"status": "draft"}).status_code == 409


# ---------- Bible chiffrée + URL signée single-use ----------

def test_bible_encrypted_on_disk():
    enc = "/app/backend/storage/bible/GALA_COOK_FOOD_BIBLE.pdf.enc"
    if not os.path.exists(enc):
        pytest.skip("Bible non uploadée")
    head = open(enc, "rb").read(5)
    assert head != b"%PDF-"  # chiffré, pas un PDF en clair


def test_bible_signed_url_single_use(juridique):
    r = juridique.post(f"{BASE}/bible/signed-url")
    if r.status_code == 404:
        pytest.skip("Bible non uploadée")
    assert r.status_code == 200
    url = r.json()["url"]
    first = requests.get(f"http://localhost:8001{url}", timeout=15)
    assert first.status_code == 200 and first.content[:5] == b"%PDF-"  # déchiffrée au stream
    assert requests.get(f"http://localhost:8001{url}", timeout=10).status_code == 403  # single-use


def test_bible_requires_auth():
    assert requests.post(f"{BASE}/bible/signed-url", timeout=10).status_code == 401


# ---------- Cooptation ----------

def test_cooptation_cycle(production):
    r = production.post(f"{BASE}/cooptation/issue", json={"sponsor_name": "Test Sponsor"})
    assert r.status_code == 200
    token = r.json()["token"]
    v = requests.get(f"{BASE}/public/cooptation/{token}", timeout=10).json()
    assert v["valid"] is True and v["sponsor"] == "Test Sponsor"
    assert requests.get(f"{BASE}/public/cooptation/invalid-token", timeout=10).json()["valid"] is False
