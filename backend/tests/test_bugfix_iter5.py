"""Iteration 5 - regression tests for review bugs:
- Delete client -> orphan sessions removed from /api/sessions
- Session PUT to change date + time (double-click edit backend)
- Insights excludes Emergent platform sources (app.emergent.sh)
- Slot conflict 409 regression
- Contract email still 200
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].splitlines()[0].strip()
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN = {"email": "kendra@kpstudio.com", "password": "KPStudio2026!"}


@pytest.fixture(scope="module")
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json=ADMIN, timeout=30)
    assert r.status_code == 200, r.text
    return s


def _mk_client(admin, name_suffix=""):
    r = admin.post(f"{API}/clients", json={
        "name": f"TEST_it5_{name_suffix}_{uuid.uuid4().hex[:6]}",
        "email": "delivered@resend.dev",
        "package": "1:1 PT", "rate": 100, "status": "active",
    }, timeout=30)
    assert r.status_code == 200, r.text
    return r.json()["id"]


class TestDeleteFreesCalendar:
    def test_delete_client_removes_sessions_from_all_sessions(self, admin):
        cid = _mk_client(admin, "del")
        r = admin.post(f"{API}/clients/{cid}/sessions", json={
            "date": "2026-06-15", "time": "07:30", "duration": "60 min",
        }, timeout=30)
        assert r.status_code == 200, r.text
        sid = r.json()["id"]

        # Confirm session is in the global /sessions
        all_s = admin.get(f"{API}/sessions", timeout=30).json()
        assert any(s["id"] == sid for s in all_s), "session must appear on calendar"

        # Delete client
        r2 = admin.delete(f"{API}/clients/{cid}", timeout=30)
        assert r2.status_code == 200, r2.text

        # /sessions should self-heal and no longer include that session
        after = admin.get(f"{API}/sessions", timeout=30).json()
        assert not any(s["id"] == sid for s in after), "orphan session must be removed after client delete"
        assert not any(s.get("client_id") == cid for s in after), "no sessions for deleted client"

    def test_slot_freed_after_client_delete(self, admin):
        # A books a slot; delete A; B can then book same slot
        a = _mk_client(admin, "free_a")
        r = admin.post(f"{API}/clients/{a}/sessions", json={
            "date": "2026-06-16", "time": "08:00"}, timeout=30)
        assert r.status_code == 200
        # delete A
        admin.delete(f"{API}/clients/{a}", timeout=30)
        # B books same date+time — should succeed
        b = _mk_client(admin, "free_b")
        r2 = admin.post(f"{API}/clients/{b}/sessions", json={
            "date": "2026-06-16", "time": "08:00"}, timeout=30)
        assert r2.status_code == 200, r2.text
        admin.delete(f"{API}/clients/{b}", timeout=30)


class TestSessionEditDateTime:
    def test_put_session_updates_date_and_time(self, admin):
        cid = _mk_client(admin, "edit")
        r = admin.post(f"{API}/clients/{cid}/sessions", json={
            "date": "2026-07-01", "time": "09:00"}, timeout=30)
        sid = r.json()["id"]

        r2 = admin.put(f"{API}/sessions/{sid}",
                       json={"date": "2026-07-03", "time": "14:30"}, timeout=30)
        assert r2.status_code == 200, r2.text
        d = r2.json()
        assert d["date"] == "2026-07-03"
        assert d["time"] == "14:30"

        # Verify persisted in client's schedule tab source of truth
        r3 = admin.get(f"{API}/clients/{cid}/sessions", timeout=30).json()
        row = [x for x in r3 if x["id"] == sid][0]
        assert row["date"] == "2026-07-03" and row["time"] == "14:30"
        admin.delete(f"{API}/clients/{cid}", timeout=30)

    def test_put_session_conflict_409(self, admin):
        a = _mk_client(admin, "conf_a")
        b = _mk_client(admin, "conf_b")
        admin.post(f"{API}/clients/{a}/sessions",
                   json={"date": "2026-07-10", "time": "10:00"}, timeout=30)
        r = admin.post(f"{API}/clients/{b}/sessions",
                       json={"date": "2026-07-10", "time": "11:00"}, timeout=30)
        sid_b = r.json()["id"]
        r2 = admin.put(f"{API}/sessions/{sid_b}",
                       json={"date": "2026-07-10", "time": "10:00"}, timeout=30)
        assert r2.status_code == 409, r2.text
        admin.delete(f"{API}/clients/{a}", timeout=30)
        admin.delete(f"{API}/clients/{b}", timeout=30)


class TestInsightsExcludesEmergent:
    def test_emergent_referrers_excluded(self, admin):
        # push a mix of events
        for ref in ["https://app.emergent.sh/", "https://emergentagent.com/x",
                    "https://emergent.sh/"]:
            requests.post(f"{API}/track", json={"type": "page_view", "path": "/",
                          "referrer": ref, "device": "desktop", "value": 500}, timeout=30)
        # a real one
        requests.post(f"{API}/track", json={"type": "page_view", "path": "/",
                      "referrer": "https://www.google.com/", "device": "desktop", "value": 500}, timeout=30)

        d = admin.get(f"{API}/insights", timeout=30).json()
        sources = [s["source"].lower() for s in d.get("top_sources", [])]
        for bad in ("emergent.sh", "emergentagent.com", "app.emergent.sh"):
            assert not any(bad in s for s in sources), f"{bad} must not appear: {sources}"


class TestContractEmailRegression:
    def test_contract_email_returns_200(self, admin):
        cid = _mk_client(admin, "contract")
        r = admin.post(f"{API}/clients/{cid}/contracts",
                       json={"package": "1:1 PT", "sessions": 12, "rate": 100,
                             "start_date": "2026-02-01", "end_date": "2026-05-01",
                             "cancellation_hours": 24, "include_media_release": True},
                       timeout=60)
        assert r.status_code == 200
        contract_id = r.json()["id"]
        r2 = admin.post(f"{API}/contracts/{contract_id}/email", timeout=90)
        assert r2.status_code == 200, r2.text
        admin.delete(f"{API}/clients/{cid}", timeout=30)
