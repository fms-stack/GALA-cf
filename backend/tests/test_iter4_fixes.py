# Iteration 4: targeted retests of iteration_3 fixes (brute-force, InvalidId, em-dash API)
import os
import uuid
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": os.environ["ADMIN_EMAIL"], "password": os.environ["ADMIN_PASSWORD"]}


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    assert r.status_code == 200, r.text
    tok = r.cookies.get("access_token") or r.json().get("access_token") or r.json().get("token")
    assert tok
    return tok


# FIX 1: brute-force keyed on email only
def test_bruteforce_not_bypassable_with_xff():
    email = f"test_bf_{uuid.uuid4().hex[:8]}@example.com"
    try:
        for i in range(5):
            r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"},
                              headers={"X-Forwarded-For": f"1.1.1.{i}"})
            assert r.status_code == 401, r.text
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"},
                          headers={"X-Forwarded-For": "9.9.9.9"})
        assert r.status_code == 429, f"{r.status_code} {r.text}"
    finally:
        c = MongoClient(os.environ["MONGO_URL"])
        c[os.environ["DB_NAME"]].login_attempts.delete_many({"identifier": {"$regex": email}})


# FIX 2: invalid ObjectId -> 404
def test_invalid_objectid_returns_404(admin_token):
    r = requests.patch(f"{BASE_URL}/api/contracts/not-an-id/status", json={"status": "sent"},
                       headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 404, f"{r.status_code} {r.text}"


# FIX 6: no em-dash in public prizes API
def test_public_prizes_no_emdash():
    r = requests.get(f"{BASE_URL}/api/public/prizes")
    assert r.status_code == 200
    assert "\u2014" not in r.text, r.text[r.text.find("\u2014") - 80: r.text.find("\u2014") + 80]


# Regression
def test_health_full_admin(admin_token):
    r = requests.get(f"{BASE_URL}/api/health/full", headers={"Authorization": f"Bearer {admin_token}"})
    assert r.status_code == 200
