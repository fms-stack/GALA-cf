# Iteration 3 regression via PUBLIC URL: security hardening, contract state machine, encrypted Bible, payments validation
import os
import uuid
import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient
from bson import ObjectId

ENV = dotenv_values("/app/backend/.env")
FENV = dotenv_values("/app/frontend/.env")
BASE_URL = FENV["REACT_APP_BACKEND_URL"].rstrip("/")
BASE = f"{BASE_URL}/api"
ADMIN = {"email": ENV["ADMIN_EMAIL"], "password": ENV["ADMIN_PASSWORD"]}
JURIDIQUE = {"email": "juridique@cfceremony.com", "password": ENV["STAFF_JURIDIQUE_PASSWORD"]}
PRODUCTION = {"email": "production@cfceremony.com", "password": ENV["STAFF_PRODUCTION_PASSWORD"]}
DB = MongoClient(ENV["MONGO_URL"])[ENV["DB_NAME"]]


def login(creds):
    s = requests.Session()
    r = s.post(f"{BASE}/auth/login", json=creds, timeout=15)
    assert r.status_code == 200, r.text
    tok = r.cookies.get("access_token") or s.cookies.get("access_token")
    assert tok, "access_token cookie missing"
    s.headers["Authorization"] = f"Bearer {tok}"
    return s, r


@pytest.fixture(scope="module")
def admin():
    return login(ADMIN)[0]


@pytest.fixture(scope="module")
def juridique():
    return login(JURIDIQUE)[0]


@pytest.fixture(scope="module")
def production():
    return login(PRODUCTION)[0]


# Health
def test_health_full_noauth_401():
    assert requests.get(f"{BASE}/health/full", timeout=15).status_code == 401


def test_health_full_admin(admin):
    r = admin.get(f"{BASE}/health/full", timeout=15)
    assert r.status_code == 200
    assert r.json()["checks"]["bible_storage"]["encrypted"] is True


def test_health_full_production_forbidden(production):
    assert production.get(f"{BASE}/health/full", timeout=15).status_code == 403


# Auth cookies / hashing
def test_login_cookie_flags():
    _, r = login(ADMIN)
    sc = r.headers.get("set-cookie", "").lower()
    assert "httponly" in sc and "secure" in sc


def test_bcrypt_hash_format():
    u = DB.users.find_one({"email": ADMIN["email"]})
    assert u["password_hash"].startswith("$2b$")


def test_old_staff_password_rejected():
    r = requests.post(f"{BASE}/auth/login", json={"email": "production@cfceremony.com", "password": "Prod-CF2026!Gala"}, timeout=15)
    assert r.status_code == 401
    DB.login_attempts.delete_many({"identifier": {"$regex": "production@cfceremony.com"}})


def test_bruteforce_lockout():
    fake = {"email": f"bf-{uuid.uuid4().hex[:6]}@nowhere.io", "password": "bad"}
    try:
        for _ in range(5):
            assert requests.post(f"{BASE}/auth/login", json=fake, timeout=15).status_code == 401
        assert requests.post(f"{BASE}/auth/login", json=fake, timeout=15).status_code == 429
    finally:
        DB.login_attempts.delete_many({"identifier": {"$regex": "bf-"}})


def test_bruteforce_xff_bypass():
    # Informational: spoofed X-Forwarded-For first hop changes identifier
    fake = {"email": f"bfx-{uuid.uuid4().hex[:6]}@nowhere.io", "password": "bad"}
    try:
        for _ in range(5):
            requests.post(f"{BASE}/auth/login", json=fake, timeout=15)
        r = requests.post(f"{BASE}/auth/login", json=fake, headers={"X-Forwarded-For": "1.2.3.4"}, timeout=15)
        print("XFF spoof 6th attempt status:", r.status_code)
        assert r.status_code == 429, "Brute-force lockout bypassable via spoofed X-Forwarded-For"
    finally:
        DB.login_attempts.delete_many({"identifier": {"$regex": "bfx-"}})


# Contract state machine
@pytest.fixture(scope="module")
def contract(admin):
    p = admin.post(f"{BASE}/people", json={"full_name": "TEST_SM Iter3", "email": "test_sm3@test.io"}, timeout=15).json()
    c = admin.post(f"{BASE}/contracts", json={"template_id": "nda", "person_id": p["id"]}, timeout=15).json()
    assert c["status"] == "draft"
    yield c
    DB.contracts.delete_one({"_id": ObjectId(c["id"])})
    DB.people.delete_one({"_id": ObjectId(p["id"])})


def test_contract_workflow(admin, juridique, production, contract):
    cid = contract["id"]
    u = f"{BASE}/contracts/{cid}/status"
    r = admin.patch(u, json={"status": "signed"}, timeout=15)
    assert r.status_code == 409 and "Transition interdite" in r.json()["detail"]
    assert production.patch(u, json={"status": "approved"}, timeout=15).status_code == 403
    assert production.patch(u, json={"status": "juridique_review"}, timeout=15).status_code == 200
    assert juridique.patch(u, json={"status": "approved"}, timeout=15).status_code == 200
    assert admin.patch(u, json={"status": "signed"}, timeout=15).status_code == 409
    assert admin.patch(u, json={"status": "sent"}, timeout=15).status_code == 200
    r = admin.patch(u, json={"status": "signed"}, timeout=15)
    assert r.status_code == 200 and r.json()["status"] == "signed"
    lst = admin.get(f"{BASE}/contracts", timeout=15).json()
    assert any(x["id"] == cid and x["status"] == "signed" for x in lst)


def test_contract_invalid_id(admin):
    r = admin.patch(f"{BASE}/contracts/not-an-id/status", json={"status": "sent"}, timeout=15)
    print("invalid id status:", r.status_code)
    assert r.status_code in (400, 404, 422)


# Bible
def test_bible_signed_url_single_use(juridique):
    r = juridique.post(f"{BASE}/bible/signed-url", timeout=15)
    if r.status_code == 404:
        pytest.skip("Bible non uploadée")
    assert r.status_code == 200
    url = r.json()["url"]
    first = requests.get(f"{BASE_URL}{url}", timeout=30)
    assert first.status_code == 200 and first.content[:4] == b"%PDF"
    assert requests.get(f"{BASE_URL}{url}", timeout=15).status_code == 403


# Payments validation
def test_checkout_unknown_package():
    r = requests.post(f"{BASE}/public/checkout/session", json={"package_id": "hacked", "quantity": 1, "origin_url": BASE_URL, "full_name": "TEST U", "email": "t@u.io"}, timeout=20)
    assert r.status_code == 400


def test_checkout_qty_99():
    r = requests.post(f"{BASE}/public/checkout/session", json={"package_id": "gradin", "quantity": 99, "origin_url": BASE_URL, "full_name": "TEST U", "email": "t@u.io"}, timeout=20)
    assert r.status_code == 422


def test_checkout_valid_session():
    r = requests.post(f"{BASE}/public/checkout/session", json={"package_id": "gradin", "quantity": 1, "origin_url": BASE_URL, "full_name": "TEST U", "email": "t@u.io"}, timeout=30)
    print("valid checkout:", r.status_code, r.text[:200])
    assert r.status_code == 200 and "url" in r.json()


def test_mecenat_100_rejected():
    r = requests.post(f"{BASE}/public/mecenat", json={"full_name": "TEST U", "email": "t@u.io", "amount_eur": 100, "honeypot": ""}, timeout=20)
    assert r.status_code == 422


def test_magic_link_dev_link_flag():
    r = requests.post(f"{BASE}/auth/magic-link/request", json={"email": "ghost@nowhere.io"}, timeout=15)
    assert r.status_code == 200
    assert r.json().get("dev_link") is None  # unknown email never leaks a link
