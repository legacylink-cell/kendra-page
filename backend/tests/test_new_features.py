"""Coach K Studio — tests for new features (track, insights, session updates,
recurring sessions, contract email)."""
import os
import uuid
import pytest
import requests

def _load_backend_url():
    v = os.environ.get("REACT_APP_BACKEND_URL")
    if v:
        return v
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    return line.split("=", 1)[1].strip()
    except Exception:
        pass
    raise RuntimeError("REACT_APP_BACKEND_URL not set")

BASE_URL = _load_backend_url().rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "kendra@kpstudio.com"
ADMIN_PASSWORD = "KPStudio2026!"


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    return s


# --- Tracking (public) ---
class TestTracking:
    def test_track_page_view_desktop(self):
        r = requests.post(f"{API}/track", json={
            "type": "page_view", "path": "/", "referrer": "https://www.google.com/",
            "device": "desktop", "value": 850
        }, timeout=30)
        assert r.status_code == 200 and r.json()["ok"] is True

    def test_track_page_view_mobile(self):
        r = requests.post(f"{API}/track", json={
            "type": "page_view", "path": "/", "referrer": "https://www.instagram.com/",
            "device": "mobile", "value": 1200
        }, timeout=30)
        assert r.status_code == 200

    def test_track_scrolls(self):
        for depth in (25, 50, 75, 100):
            r = requests.post(f"{API}/track", json={
                "type": "scroll", "path": "/", "device": "desktop", "value": depth
            }, timeout=30)
            assert r.status_code == 200

    def test_track_click(self):
        r = requests.post(f"{API}/track", json={
            "type": "click", "path": "/", "label": "hero-cta-start", "device": "desktop"
        }, timeout=30)
        assert r.status_code == 200


# --- Insights ---
class TestInsights:
    def test_insights_requires_auth(self):
        r = requests.get(f"{API}/insights", timeout=30)
        assert r.status_code == 401

    def test_insights_shape_and_values(self, admin):
        # ensure at least a couple of events + one lead exist
        requests.post(f"{API}/track", json={"type": "page_view", "path": "/",
                     "referrer": "https://www.google.com/", "device": "desktop", "value": 500}, timeout=30)
        requests.post(f"{API}/track", json={"type": "page_view", "path": "/",
                     "referrer": "https://www.instagram.com/", "device": "mobile", "value": 900}, timeout=30)
        for d in (25, 50, 75, 100):
            requests.post(f"{API}/track", json={"type": "scroll", "value": d}, timeout=30)
        requests.post(f"{API}/track", json={"type": "click", "label": "hero-cta-start"}, timeout=30)
        requests.post(f"{API}/leads", json={"name": "TEST_Lead_" + uuid.uuid4().hex[:6],
                     "email": "lead@example.com", "goal": "1:1 Strength", "message": ""}, timeout=30)

        r = admin.get(f"{API}/insights", timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["total_views", "total_inquiries", "total_clicks", "conversion",
                  "avg_load_ms", "mobile_pct", "views_trend", "device_split",
                  "top_sources", "scroll_funnel", "inquiry_types",
                  "most_viewed_pages", "top_clicks"]:
            assert k in d, f"missing key {k}"
        assert d["total_views"] >= 2
        assert d["total_inquiries"] >= 1
        assert d["avg_load_ms"] > 0
        assert d["mobile_pct"] > 0
        # top_sources should contain google or instagram host we tracked
        sources = [s["source"] for s in d["top_sources"]]
        assert any("google" in s or "instagram" in s for s in sources), sources
        # scroll_funnel always has 4 depths
        depths = [s["depth"] for s in d["scroll_funnel"]]
        assert depths == ["25%", "50%", "75%", "100%"]


# --- Sessions: status update + recurring ---
class TestSessions:
    client_id = None
    contract_id = None
    session_id = None

    def test_setup_client(self, admin):
        r = admin.post(f"{API}/clients", json={
            "name": "TEST_Sess_" + uuid.uuid4().hex[:6],
            "email": "delivered@resend.dev", "package": "1:1 PT",
            "rate": 100, "status": "active"
        }, timeout=30)
        assert r.status_code == 200, r.text
        TestSessions.client_id = r.json()["id"]

    def test_add_session_and_update_status(self, admin):
        r = admin.post(f"{API}/clients/{TestSessions.client_id}/sessions",
                       json={"date": "2026-02-10", "time": "09:00", "duration": "60 min"}, timeout=30)
        assert r.status_code == 200, r.text
        sid = r.json()["id"]
        TestSessions.session_id = sid

        r2 = admin.put(f"{API}/sessions/{sid}", json={"status": "completed"}, timeout=30)
        assert r2.status_code == 200, r2.text
        assert r2.json()["status"] == "completed"

        r3 = admin.put(f"{API}/sessions/{sid}", json={"status": "no-show"}, timeout=30)
        assert r3.status_code == 200
        assert r3.json()["status"] == "no-show"

    def test_recurring_sessions(self, admin):
        # 2 weeks, Mon(0)+Wed(2) starting Mon 2026-02-02 -> 4 sessions expected
        r = admin.post(f"{API}/clients/{TestSessions.client_id}/sessions/recurring", json={
            "start_date": "2026-02-02", "weeks": 2, "weekdays": [0, 2],
            "time": "10:00", "duration": "60 min"
        }, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ok"] is True
        assert d["created"] == 4, d

        # verify they show up in client sessions list
        r2 = admin.get(f"{API}/clients/{TestSessions.client_id}/sessions", timeout=30)
        assert r2.status_code == 200
        sess = r2.json()
        assert len(sess) >= 4

    def test_recurring_requires_weekdays(self, admin):
        r = admin.post(f"{API}/clients/{TestSessions.client_id}/sessions/recurring", json={
            "start_date": "2026-02-02", "weeks": 2, "weekdays": []
        }, timeout=30)
        assert r.status_code == 400


# --- Contract email ---
class TestContractEmail:
    def test_email_contract_flow(self, admin):
        # create client w/ Resend safe recipient
        r = admin.post(f"{API}/clients", json={
            "name": "TEST_Email_" + uuid.uuid4().hex[:6],
            "email": "delivered@resend.dev", "package": "1:1 PT",
            "rate": 100, "status": "active"
        }, timeout=30)
        assert r.status_code == 200
        cid = r.json()["id"]

        r2 = admin.post(f"{API}/clients/{cid}/contracts",
                        json={"package": "1:1 PT", "sessions": 12, "rate": 100,
                              "start_date": "2026-02-01", "end_date": "2026-05-01",
                              "cancellation_hours": 24, "include_media_release": True},
                        timeout=30)
        assert r2.status_code == 200
        contract_id = r2.json()["id"]

        r3 = admin.post(f"{API}/contracts/{contract_id}/email", timeout=90)
        assert r3.status_code == 200, r3.text
        d = r3.json()
        assert d["status"] in ("sent", "signed")
        assert d.get("sent_to") == "delivered@resend.dev"

    def test_email_contract_no_client_email(self, admin):
        r = admin.post(f"{API}/clients", json={
            "name": "TEST_NoEmail_" + uuid.uuid4().hex[:6], "email": ""
        }, timeout=30)
        assert r.status_code == 200
        cid = r.json()["id"]
        r2 = admin.post(f"{API}/clients/{cid}/contracts", json={"package": "1:1 PT",
                        "sessions": 1, "rate": 100}, timeout=30)
        contract_id = r2.json()["id"]
        r3 = admin.post(f"{API}/contracts/{contract_id}/email", timeout=60)
        assert r3.status_code == 400


# --- Lead notification (does not fail if email is slow) ---
class TestLeadNotification:
    def test_create_lead_returns_200(self):
        r = requests.post(f"{API}/leads", json={
            "name": "TEST_NotifyLead_" + uuid.uuid4().hex[:6],
            "email": "lead-notify@example.com",
            "phone": "555-1000", "goal": "Postnatal strength",
            "message": "Interested in postpartum program"
        }, timeout=90)
        assert r.status_code == 200
        assert r.json()["ok"] is True
