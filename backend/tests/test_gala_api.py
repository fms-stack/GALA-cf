import os
import time
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', open('/app/frontend/.env').read().split('REACT_APP_BACKEND_URL=')[1].split('\n')[0]).rstrip('/')
API = f"{BASE_URL}/api"

ADMIN = {"email": "laurent@cvln.holding", "password": "GalaCVLN2026!"}
PROD = {"email": "miguel@cvln.holding", "password": "Production2026!"}
JUR = {"email": "hashtag@cvln.holding", "password": "Juridique2026!"}


@pytest.fixture(scope="module")
def admin_sess():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN, timeout=15)
    assert r.status_code == 200, r.text
    return s


@pytest.fixture(scope="module")
def jur_sess():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=JUR, timeout=15)
    assert r.status_code == 200, r.text
    return s


def test_health():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_public_prizes():
    r = requests.get(f"{API}/public/prizes", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 7
    codes = [p["code"] for p in data]
    assert codes == [f"CF-GAP-0{i}" for i in range(1, 8)]


def test_login_and_me(admin_sess):
    r = admin_sess.get(f"{API}/auth/me", timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert j["email"] == ADMIN["email"]
    assert j["role"] == "admin"
    # httpOnly cookie present
    assert "access_token" in admin_sess.cookies.get_dict()


def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": "nobody@x.com", "password": "wrong"}, timeout=10)
    assert r.status_code == 401


def test_public_rsvp_creates():
    payload = {
        "full_name": "TEST_VIP Tester",
        "email": "test_vip@example.com",
        "phone": "+33600000000",
        "seats": 2,
        "message": "Test RSVP",
        "honeypot": "",
    }
    r = requests.post(f"{API}/public/rsvp", json=payload, timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert j["ok"] is True
    assert "ref" in j and len(j["ref"]) == 6


def test_public_rsvp_honeypot_dropped():
    payload = {
        "full_name": "Bot Spammer",
        "email": "bot@example.com",
        "seats": 1,
        "honeypot": "iambot",
    }
    r = requests.post(f"{API}/public/rsvp", json=payload, timeout=10)
    assert r.status_code == 200
    j = r.json()
    assert j == {"ok": True}  # silently dropped, no ref


def test_invitations_unauth():
    r = requests.get(f"{API}/invitations", timeout=10)
    assert r.status_code == 401


def test_invitations_listed_and_patch(admin_sess):
    r = admin_sess.get(f"{API}/invitations", timeout=10)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) >= 1
    inv_id = items[0]["id"]
    r2 = admin_sess.patch(f"{API}/invitations/{inv_id}", json={"status": "confirmed"}, timeout=10)
    assert r2.status_code == 200
    assert r2.json()["status"] == "confirmed"


def test_positions_seeded(admin_sess):
    r = admin_sess.get(f"{API}/positions", timeout=10)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 25
    codes = sorted(x["code"] for x in items if x["code"].startswith("POS-"))
    assert "POS-01" in codes and "POS-25" in codes


def test_positions_crud(admin_sess):
    body = {"code": "TEST-POS-99", "title": "TEST position", "pole": "Pôle Test", "description": "x"}
    r = admin_sess.post(f"{API}/positions", json=body, timeout=10)
    assert r.status_code == 200
    pid = r.json()["id"]
    body["title"] = "TEST updated"
    r2 = admin_sess.put(f"{API}/positions/{pid}", json=body, timeout=10)
    assert r2.status_code == 200
    assert r2.json()["title"] == "TEST updated"
    r3 = admin_sess.delete(f"{API}/positions/{pid}", timeout=10)
    assert r3.status_code == 200


def test_rbac_juridique_cannot_create_position(jur_sess):
    body = {"code": "TEST-RBAC-1", "title": "X", "pole": "Y"}
    r = jur_sess.post(f"{API}/positions", json=body, timeout=10)
    assert r.status_code == 403


def test_people_and_assignments(admin_sess):
    # Create person
    r = admin_sess.post(f"{API}/people", json={"full_name": "TEST_Person", "email": "tp@x.com"}, timeout=10)
    assert r.status_code == 200
    person_id = r.json()["id"]
    # Get a position
    positions = admin_sess.get(f"{API}/positions", timeout=10).json()
    position_id = positions[0]["id"]
    # Create assignment
    r2 = admin_sess.post(f"{API}/assignments", json={
        "position_id": position_id, "person_id": person_id, "status": "active"
    }, timeout=10)
    assert r2.status_code == 200
    aid = r2.json()["id"]
    # GET enriched
    r3 = admin_sess.get(f"{API}/assignments", timeout=10)
    assert r3.status_code == 200
    found = [a for a in r3.json() if a["id"] == aid]
    assert found and found[0]["position"] and found[0]["person"]
    assert found[0]["person"]["full_name"] == "TEST_Person"
    # Cleanup
    admin_sess.delete(f"{API}/assignments/{aid}", timeout=10)
    admin_sess.delete(f"{API}/people/{person_id}", timeout=10)


def test_dashboard_stats(admin_sess):
    r = admin_sess.get(f"{API}/dashboard/stats", timeout=10)
    assert r.status_code == 200
    j = r.json()
    for k in ["positions", "people", "assignments", "invitations", "days_to_gala"]:
        assert k in j
    assert j["positions"] >= 25


def test_magic_link_request_unknown_email_ok():
    r = requests.post(f"{API}/auth/magic-link/request", json={"email": "nobody@nowhere.com"}, timeout=10)
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_logout(admin_sess):
    r = admin_sess.post(f"{API}/auth/logout", timeout=10)
    assert r.status_code == 200
    # After logout, /auth/me should fail
    r2 = admin_sess.get(f"{API}/auth/me", timeout=10)
    assert r2.status_code == 401


def test_brute_force_429():
    s = requests.Session()
    for _ in range(6):
        s.post(f"{API}/auth/login", json={"email": "bruteforce@test.com", "password": "wrong"}, timeout=10)
    r = s.post(f"{API}/auth/login", json={"email": "bruteforce@test.com", "password": "wrong"}, timeout=10)
    assert r.status_code == 429
