"""
Phase 4 (Contracts/NDA) + Phase 5 (Bible PDF) + Phase 6 (Ecosystem) backend tests.
Uses public preview URL from REACT_APP_BACKEND_URL.
"""
import io
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://production-vault-5.preview.emergentagent.com").rstrip("/")

ADMIN = {"email": "laurent@cvln.holding", "password": "GalaCVLN2026!"}
PROD = {"email": "production@cfceremony.com", "password": "Prod-CF2026!Gala"}
JUR = {"email": "juridique@cfceremony.com", "password": "Jur-CF2026!Gala"}


def _login(creds):
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json=creds, timeout=20)
    assert r.status_code == 200, f"Login failed for {creds['email']}: {r.status_code} {r.text}"
    return s


@pytest.fixture(scope="module")
def admin():
    return _login(ADMIN)


@pytest.fixture(scope="module")
def prod():
    return _login(PROD)


@pytest.fixture(scope="module")
def jur():
    return _login(JUR)


@pytest.fixture(scope="module")
def seed_person(admin):
    """Create a TEST person for contracts."""
    r = admin.post(f"{BASE_URL}/api/people", json={"full_name": "TEST_Phase4 Person", "email": "test_phase4@example.com"})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]
    yield pid
    admin.delete(f"{BASE_URL}/api/people/{pid}")


# ============================================================================
# Phase 4 — Contract templates & CRUD
# ============================================================================
class TestContractTemplates:
    def test_list_templates_returns_7(self, admin):
        r = admin.get(f"{BASE_URL}/api/contract-templates")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 7, f"Expected 7 templates, got {len(data)}"
        ids = {t["id"] for t in data}
        expected = {"nda", "prestation", "cession_droits_auteur", "chef_invite_cip",
                    "cession_image_voisins", "partenariat", "droit_image_public"}
        assert ids == expected, f"Missing or extra templates: {ids ^ expected}"


class TestContractCRUD:
    def test_create_nda_contract(self, admin, seed_person):
        r = admin.post(f"{BASE_URL}/api/contracts", json={
            "template_id": "nda", "person_id": seed_person, "fee_amount": 0
        })
        assert r.status_code == 200, r.text
        c = r.json()
        assert c["status"] == "draft"
        assert c["template_id"] == "nda"
        assert c["person_id"] == seed_person
        assert "rendered_body" in c
        pytest.contract_id = c["id"]

    def test_get_pdf_returns_valid_pdf(self, admin):
        cid = pytest.contract_id
        r = admin.get(f"{BASE_URL}/api/contracts/{cid}/pdf")
        assert r.status_code == 200
        assert r.headers["content-type"].startswith("application/pdf")
        assert r.content[:4] == b"%PDF", f"Not a PDF: {r.content[:20]}"
        assert len(r.content) > 500


# ============================================================================
# Phase 4 — RBAC workflow
# ============================================================================
class TestContractRBAC:
    def test_production_draft_to_juridique_review(self, prod, admin, seed_person):
        # Create a fresh contract as admin
        r = admin.post(f"{BASE_URL}/api/contracts", json={
            "template_id": "prestation", "person_id": seed_person, "fee_amount": 1000
        })
        assert r.status_code == 200
        cid = r.json()["id"]
        pytest.rbac_cid = cid

        # Production moves draft → juridique_review
        r = prod.patch(f"{BASE_URL}/api/contracts/{cid}/status", json={"status": "juridique_review"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "juridique_review"

    def test_juridique_cannot_send(self, jur):
        cid = pytest.rbac_cid
        r = jur.patch(f"{BASE_URL}/api/contracts/{cid}/status", json={"status": "sent"})
        assert r.status_code == 403, f"Juridique should not be able to send: {r.status_code}"

    def test_juridique_can_approve(self, jur):
        cid = pytest.rbac_cid
        r = jur.patch(f"{BASE_URL}/api/contracts/{cid}/status", json={"status": "approved"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "approved"

    def test_admin_can_send(self, admin):
        cid = pytest.rbac_cid
        r = admin.patch(f"{BASE_URL}/api/contracts/{cid}/status", json={"status": "sent"})
        assert r.status_code == 200
        assert r.json()["status"] == "sent"

    def test_admin_can_sign(self, admin):
        cid = pytest.rbac_cid
        r = admin.patch(f"{BASE_URL}/api/contracts/{cid}/status", json={"status": "signed"})
        assert r.status_code == 200
        assert r.json()["status"] == "signed"


# ============================================================================
# Phase 5 — Bible PDF upload + signed url + single-use
# ============================================================================
def _make_test_pdf() -> bytes:
    from reportlab.pdfgen import canvas
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(100, 750, "TEST Bible CVLN")
    c.save()
    return buf.getvalue()


class TestBible:
    def test_upload_pdf_as_admin(self, admin):
        pdf = _make_test_pdf()
        files = {"file": ("test_bible.pdf", pdf, "application/pdf")}
        r = admin.post(f"{BASE_URL}/api/bible/upload", files=files)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["size"] > 100

    def test_upload_forbidden_for_production(self, prod):
        pdf = _make_test_pdf()
        files = {"file": ("test_bible.pdf", pdf, "application/pdf")}
        r = prod.post(f"{BASE_URL}/api/bible/upload", files=files)
        assert r.status_code == 403

    def test_signed_url_admin(self, admin):
        r = admin.post(f"{BASE_URL}/api/bible/signed-url")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "url" in d and d["url"].startswith("/api/bible/stream/")
        assert d["expires_in"] == 300
        pytest.bible_token_url = d["url"]

    def test_signed_url_production(self, prod):
        r = prod.post(f"{BASE_URL}/api/bible/signed-url")
        assert r.status_code == 200, r.text

    def test_signed_url_juridique(self, jur):
        r = jur.post(f"{BASE_URL}/api/bible/signed-url")
        assert r.status_code == 200, r.text

    def test_stream_token_single_use(self, admin):
        # Issue fresh token
        r = admin.post(f"{BASE_URL}/api/bible/signed-url")
        assert r.status_code == 200
        url = r.json()["url"]
        # 1st access should succeed
        r1 = requests.get(f"{BASE_URL}{url}", timeout=15)
        assert r1.status_code == 200, f"first call: {r1.status_code}"
        assert r1.content[:4] == b"%PDF"
        # 2nd access with same token MUST fail (single-use)
        r2 = requests.get(f"{BASE_URL}{url}", timeout=15)
        assert r2.status_code == 403, f"Token should be single-use, got {r2.status_code}"


# ============================================================================
# Phase 6 — Ecosystem public visibility
# ============================================================================
class TestEcosystem:
    def test_public_ecosystem_only_visible(self):
        r = requests.get(f"{BASE_URL}/api/public/ecosystem", timeout=15)
        assert r.status_code == 200
        names = {n["name"] for n in r.json()}
        # public_visible=true nodes
        assert "CVLN Holding" in names
        assert "Factory Maker Studio" in names
        assert "CVL Culinary Innovations" in names
        # silent nodes must NOT appear
        for hidden in ["FREK", "Kiltikonet", "Label OS", "Laurentia"]:
            assert hidden not in names, f"Silent node leaked: {hidden}"

    def test_admin_ecosystem_full_list(self, admin):
        r = admin.get(f"{BASE_URL}/api/ecosystem")
        assert r.status_code == 200
        names = {n["name"] for n in r.json()}
        # Should include the silent ones
        assert "FREK" in names
        assert "Laurentia" in names


# ============================================================================
# Dashboard stats with contracts counts
# ============================================================================
class TestDashboardStats:
    def test_contracts_counts_present(self, admin):
        r = admin.get(f"{BASE_URL}/api/dashboard/stats")
        assert r.status_code == 200
        s = r.json()
        assert "contracts" in s
        for k in ("signed", "pending", "refused"):
            assert k in s["contracts"]
            assert isinstance(s["contracts"][k], int)
        # We signed at least one earlier
        assert s["contracts"]["signed"] >= 1
