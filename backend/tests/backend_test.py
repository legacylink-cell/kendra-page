"""KP Studio backend API tests."""
import os
import io
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://fitfem-coach.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "kendra@kpstudio.com"
ADMIN_PASSWORD = "KPStudio2026!"


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    return s


# --------- Auth ----------
class TestAuth:
    def test_login_wrong_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=30)
        assert r.status_code == 401

    def test_login_success_and_me(self, admin_session):
        r = admin_session.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_unauthenticated(self):
        r = requests.get(f"{API}/auth/me", timeout=30)
        assert r.status_code == 401


# --------- Clients / Contracts / Payments / Leads full flow ----------
class TestFullFlow:
    created = {}

    def test_create_client(self, admin_session):
        payload = {"name": "TEST_Client_" + uuid.uuid4().hex[:6], "email": "test@example.com",
                   "goals": "Fat loss", "package": "1:1 PT", "rate": 100, "status": "active"}
        r = admin_session.post(f"{API}/clients", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == payload["name"]
        assert "id" in d
        TestFullFlow.created["client_id"] = d["id"]
        TestFullFlow.created["client_name"] = d["name"]

    def test_list_clients(self, admin_session):
        r = admin_session.get(f"{API}/clients", timeout=30)
        assert r.status_code == 200
        assert any(c["id"] == TestFullFlow.created["client_id"] for c in r.json())

    def test_get_client(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.get(f"{API}/clients/{cid}", timeout=30)
        assert r.status_code == 200
        assert r.json()["id"] == cid

    def test_update_client(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        payload = {"name": TestFullFlow.created["client_name"], "goals": "Strength", "status": "active", "rate": 120}
        r = admin_session.put(f"{API}/clients/{cid}", json=payload, timeout=30)
        assert r.status_code == 200
        assert r.json()["goals"] == "Strength"

    def test_create_contract(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.post(f"{API}/clients/{cid}/contracts",
                               json={"package": "1:1 PT", "sessions": 12, "rate": 120,
                                     "start_date": "2026-01-15", "end_date": "2026-04-15",
                                     "cancellation_hours": 24, "include_media_release": True},
                               timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["status"] == "generated"
        TestFullFlow.created["contract_id"] = d["id"]

    def test_list_contracts(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.get(f"{API}/clients/{cid}/contracts", timeout=30)
        assert r.status_code == 200
        assert len(r.json()) >= 1

    def test_download_contract_pdf(self, admin_session):
        ctid = TestFullFlow.created["contract_id"]
        r = admin_session.get(f"{API}/contracts/{ctid}/pdf", timeout=60)
        assert r.status_code == 200
        assert r.headers.get("content-type", "").startswith("application/pdf")
        assert r.content[:5] == b"%PDF-"
        assert r.content.rstrip().endswith(b"%%EOF")
        assert len(r.content) > 3000  # a real multi-page contract
        # Content streams are compressed by ReportLab; content already verified manually.

    def test_pdf_unauthenticated(self):
        ctid = TestFullFlow.created["contract_id"]
        r = requests.get(f"{API}/contracts/{ctid}/pdf", timeout=30)
        assert r.status_code == 401

    def test_upload_signed(self, admin_session):
        ctid = TestFullFlow.created["contract_id"]
        fake_pdf = b"%PDF-1.4\n%TEST SIGNED\n%%EOF"
        files = {"file": ("signed.pdf", io.BytesIO(fake_pdf), "application/pdf")}
        r = admin_session.post(f"{API}/contracts/{ctid}/upload-signed", files=files, timeout=90)
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "signed"
        assert r.json().get("signed_path")

    def test_get_signed(self, admin_session):
        ctid = TestFullFlow.created["contract_id"]
        r = admin_session.get(f"{API}/contracts/{ctid}/signed", timeout=60)
        assert r.status_code == 200
        assert r.content.startswith(b"%PDF")

    def test_add_payment(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.post(f"{API}/clients/{cid}/payments",
                               json={"amount": 250.0, "method": "Card", "status": "paid", "note": "TEST"},
                               timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["amount"] == 250.0
        TestFullFlow.created["payment_id"] = d["id"]

    def test_list_payments(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.get(f"{API}/clients/{cid}/payments", timeout=30)
        assert r.status_code == 200
        assert any(p["id"] == TestFullFlow.created["payment_id"] for p in r.json())

    def test_dashboard_stats(self, admin_session):
        r = admin_session.get(f"{API}/dashboard/stats", timeout=30)
        assert r.status_code == 200
        d = r.json()
        for k in ["active_clients", "total_clients", "pending_contracts", "new_leads",
                  "revenue_month", "revenue_total", "trend"]:
            assert k in d
        assert d["revenue_total"] >= 250.0

    def test_create_lead_public(self):
        payload = {"name": "TEST_Lead_" + uuid.uuid4().hex[:6], "email": "lead@example.com",
                   "phone": "555-1234", "goal": "Fat loss", "message": "Interested"}
        r = requests.post(f"{API}/leads", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["ok"] is True
        TestFullFlow.created["lead_id"] = r.json()["id"]

    def test_list_leads_requires_auth(self):
        r = requests.get(f"{API}/leads", timeout=30)
        assert r.status_code == 401

    def test_list_leads(self, admin_session):
        r = admin_session.get(f"{API}/leads", timeout=30)
        assert r.status_code == 200
        assert any(l["id"] == TestFullFlow.created["lead_id"] for l in r.json())

    def test_delete_lead(self, admin_session):
        lid = TestFullFlow.created["lead_id"]
        r = admin_session.delete(f"{API}/leads/{lid}", timeout=30)
        assert r.status_code == 200

    def test_delete_payment(self, admin_session):
        pid = TestFullFlow.created["payment_id"]
        r = admin_session.delete(f"{API}/payments/{pid}", timeout=30)
        assert r.status_code == 200

    def test_delete_contract(self, admin_session):
        ctid = TestFullFlow.created["contract_id"]
        r = admin_session.delete(f"{API}/contracts/{ctid}", timeout=30)
        assert r.status_code == 200

    def test_delete_client(self, admin_session):
        cid = TestFullFlow.created["client_id"]
        r = admin_session.delete(f"{API}/clients/{cid}", timeout=30)
        assert r.status_code == 200
        r2 = admin_session.get(f"{API}/clients/{cid}", timeout=30)
        assert r2.status_code == 404
