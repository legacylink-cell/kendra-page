from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import io
import jwt
import bcrypt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, UploadFile, File, Form, Query, Header
from fastapi.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "kpstudio"
storage_key = None

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=True, samesite="none", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# Object storage helpers
# ---------------------------------------------------------------------------
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ClientInput(BaseModel):
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    dob: Optional[str] = ""
    address: Optional[str] = ""
    emergency_contact: Optional[str] = ""
    emergency_phone: Optional[str] = ""
    goals: Optional[str] = ""
    medical_notes: Optional[str] = ""
    package: Optional[str] = ""
    rate: Optional[float] = 0
    status: Optional[str] = "active"
    notes: Optional[str] = ""


class ContractInput(BaseModel):
    package: str = "1:1 Personal Training"
    sessions: int = 12
    rate: float = 0
    start_date: str = ""
    end_date: str = ""
    session_length: str = "60 minutes"
    cancellation_hours: int = 24
    include_media_release: bool = True


class PaymentInput(BaseModel):
    amount: float
    method: str = "Card"
    date: str = ""
    note: Optional[str] = ""
    status: str = "paid"


class LeadInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    goal: Optional[str] = ""
    message: Optional[str] = ""


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(body: LoginInput, response: Response):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"id": uid, "email": email, "name": user.get("name", "Kendra"), "role": user.get("role", "admin")}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", "Kendra"), "role": user.get("role")}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
@api_router.get("/clients")
async def list_clients(user: dict = Depends(get_current_user)):
    clients = await db.clients.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return clients


@api_router.post("/clients")
async def create_client(body: ClientInput, user: dict = Depends(get_current_user)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.clients.insert_one(dict(doc))
    return clean(doc)


@api_router.get("/clients/{client_id}")
async def get_client(client_id: str, user: dict = Depends(get_current_user)):
    c = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    return c


@api_router.put("/clients/{client_id}")
async def update_client(client_id: str, body: ClientInput, user: dict = Depends(get_current_user)):
    res = await db.clients.update_one({"id": client_id}, {"$set": body.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    return await db.clients.find_one({"id": client_id}, {"_id": 0})


@api_router.delete("/clients/{client_id}")
async def delete_client(client_id: str, user: dict = Depends(get_current_user)):
    await db.clients.delete_one({"id": client_id})
    await db.contracts.delete_many({"client_id": client_id})
    await db.payments.delete_many({"client_id": client_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Contracts
# ---------------------------------------------------------------------------
@api_router.get("/clients/{client_id}/contracts")
async def list_contracts(client_id: str, user: dict = Depends(get_current_user)):
    return await db.contracts.find({"client_id": client_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.post("/clients/{client_id}/contracts")
async def create_contract(client_id: str, body: ContractInput, user: dict = Depends(get_current_user)):
    c = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["client_id"] = client_id
    doc["status"] = "generated"
    doc["created_at"] = now_iso()
    doc["signed_path"] = None
    doc["signed_filename"] = None
    doc["signed_at"] = None
    await db.contracts.insert_one(dict(doc))
    return clean(doc)


@api_router.delete("/contracts/{contract_id}")
async def delete_contract(contract_id: str, user: dict = Depends(get_current_user)):
    await db.contracts.delete_one({"id": contract_id})
    return {"ok": True}


def build_contract_pdf(c: dict, ct: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.7 * inch, bottomMargin=0.7 * inch,
                            leftMargin=0.85 * inch, rightMargin=0.85 * inch)
    bronze = colors.HexColor("#8A5A40")
    dark = colors.HexColor("#1C1B1A")
    styles = getSampleStyleSheet()
    h_brand = ParagraphStyle("brand", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=22, textColor=bronze, spaceAfter=2, leading=24)
    h_sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=8, textColor=colors.grey,
                           spaceAfter=14, leading=11, tracking=2)
    h1 = ParagraphStyle("h1", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12,
                        textColor=dark, spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9.5, leading=14, textColor=dark, spaceAfter=6)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, leading=11, textColor=colors.grey)

    el = []
    el.append(Paragraph("KP STUDIO", h_brand))
    el.append(Paragraph("KENDRA ALBRITTON &nbsp;•&nbsp; PERSONAL TRAINING AGREEMENT &amp; RELEASE", h_sub))
    el.append(HRFlowable(width="100%", thickness=1.2, color=bronze, spaceAfter=12))

    el.append(Paragraph("1. Parties &amp; Program", h1))
    data = [
        ["Client", c.get("name", ""), "Trainer", "Kendra Albritton"],
        ["Email", c.get("email", "") or "—", "Phone", c.get("phone", "") or "—"],
        ["Program", ct.get("package", ""), "Sessions", str(ct.get("sessions", ""))],
        ["Session Length", ct.get("session_length", ""), "Rate", f"${ct.get('rate', 0):,.2f}"],
        ["Start Date", ct.get("start_date", "") or "—", "End Date", ct.get("end_date", "") or "—"],
    ]
    t = Table(data, colWidths=[1.1 * inch, 2.0 * inch, 1.1 * inch, 2.0 * inch])
    t.setStyle(TableStyle([
        ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
        ("FONT", (0, 0), (0, -1), "Helvetica-Bold", 9),
        ("FONT", (2, 0), (2, -1), "Helvetica-Bold", 9),
        ("TEXTCOLOR", (0, 0), (0, -1), bronze),
        ("TEXTCOLOR", (2, 0), (2, -1), bronze),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, colors.HexColor("#E5E0DA")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    el.append(t)

    def section(title, paras):
        el.append(Paragraph(title, h1))
        for p in paras:
            el.append(Paragraph(p, body))

    section("2. Payment &amp; Fees", [
        f"Client agrees to pay the total fees for the selected program (\"{ct.get('package','')}\"). Payment is due in accordance with the agreed schedule. Sessions are non-transferable unless otherwise agreed in writing.",
        "All fees paid are <b>non-refundable</b> once training has commenced, except where required by applicable law. Returned payments or failed charges may incur additional fees.",
    ])
    section("3. Cancellation &amp; No-Show Policy", [
        f"Client must provide at least <b>{ct.get('cancellation_hours',24)} hours</b> notice to cancel or reschedule a session. Sessions cancelled with less notice, or missed without notice (no-show), will be <b>forfeited and charged in full</b>.",
        "The Trainer reserves the right to reschedule sessions due to illness, emergency, or unforeseen circumstances.",
    ])
    section("4. Assumption of Risk &amp; Informed Consent", [
        "Client understands that participation in physical exercise and fitness training involves inherent risks, including but not limited to muscle strains, sprains, fractures, cardiovascular events, and in rare cases serious injury or death. Client <b>voluntarily assumes all such risks</b>.",
        "Client confirms they are participating voluntarily and have been advised to obtain a physician's clearance prior to beginning any exercise program.",
    ])
    section("5. Release &amp; Waiver of Liability", [
        "In consideration of being permitted to participate in training with Kendra Albritton / KP Studio, Client hereby <b>releases, waives, and discharges</b> the Trainer, her agents, and affiliates from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury sustained while participating in training, to the fullest extent permitted by law.",
        "Client agrees to <b>indemnify and hold harmless</b> the Trainer from any claims brought by Client or on Client's behalf.",
    ])
    section("6. Medical Readiness (PAR-Q)", [
        "Please answer the following. If you answer YES to any question, obtain physician clearance before training.",
    ])
    parq = [
        "Has a doctor ever said you have a heart condition or high blood pressure?",
        "Do you feel pain in your chest during physical activity?",
        "Do you lose balance from dizziness or lose consciousness?",
        "Do you have a bone/joint problem that could worsen with activity?",
        "Are you pregnant or recently postpartum?",
        "Do you know of any reason you should not do physical activity?",
    ]
    pq = [[Paragraph(f"{i+1}. {q}", small), "YES [  ]", "NO [  ]"] for i, q in enumerate(parq)]
    tq = Table(pq, colWidths=[4.6 * inch, 0.8 * inch, 0.8 * inch])
    tq.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                            ("FONT", (1, 0), (-1, -1), "Helvetica", 8),
                            ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    el.append(tq)

    section("7. Confidentiality", [
        "The Trainer will keep Client's personal and health information confidential and use it solely to deliver services, except as required by law.",
    ])
    if ct.get("include_media_release", True):
        section("8. Photo &amp; Media Release (optional)", [
            "Client grants permission for photos/video taken during training to be used for promotional purposes. Client may opt out by initialling here: __________.",
        ])
    section("9. Termination", [
        "Either party may terminate this agreement with written notice. Prepaid, unused sessions may be handled at the Trainer's discretion consistent with Section 2.",
    ])
    section("10. Entire Agreement", [
        "This document constitutes the entire agreement between the parties and supersedes any prior understanding. Client confirms they have read and understood this agreement in full.",
    ])

    el.append(Spacer(1, 18))
    el.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#E5E0DA"), spaceAfter=10))
    sig = [
        [Paragraph("Client Signature", small), Paragraph("Date", small), Paragraph("Trainer Signature", small), Paragraph("Date", small)],
        ["", "", "", ""],
        [Paragraph(f"<b>{c.get('name','')}</b>", small), "", Paragraph("<b>Kendra Albritton</b>", small), ""],
    ]
    ts = Table(sig, colWidths=[1.9 * inch, 1.0 * inch, 1.9 * inch, 1.0 * inch], rowHeights=[14, 30, 14])
    ts.setStyle(TableStyle([("LINEBELOW", (0, 1), (0, 1), 0.8, dark), ("LINEBELOW", (1, 1), (1, 1), 0.8, dark),
                            ("LINEBELOW", (2, 1), (2, 1), 0.8, dark), ("LINEBELOW", (3, 1), (3, 1), 0.8, dark),
                            ("VALIGN", (0, 0), (-1, -1), "BOTTOM")]))
    el.append(ts)
    el.append(Spacer(1, 10))
    el.append(Paragraph("KP Studio — Kendra Albritton · This agreement is provided for the mutual protection of client and trainer.", small))

    doc.build(el)
    buf.seek(0)
    return buf.read()


def validate_request_token(request: Request, auth, authorization):
    token = request.cookies.get("access_token") or auth or (
        authorization[7:] if authorization and authorization.startswith("Bearer ") else None)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@api_router.get("/contracts/{contract_id}/pdf")
async def contract_pdf(contract_id: str, request: Request, auth: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    validate_request_token(request, auth, authorization)
    ct = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not ct:
        raise HTTPException(status_code=404, detail="Contract not found")
    c = await db.clients.find_one({"id": ct["client_id"]}, {"_id": 0})
    pdf = build_contract_pdf(c, ct)
    fname = f"KPStudio_Agreement_{c.get('name','client').replace(' ', '_')}.pdf"
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="{fname}"'})


@api_router.post("/contracts/{contract_id}/upload-signed")
async def upload_signed(contract_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ct = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not ct:
        raise HTTPException(status_code=404, detail="Contract not found")
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "pdf"
    path = f"{APP_NAME}/signed/{contract_id}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    ctype = file.content_type or ("application/pdf" if ext == "pdf" else "application/octet-stream")
    await run_in_threadpool(put_object, path, data, ctype)
    await db.contracts.update_one({"id": contract_id}, {"$set": {
        "status": "signed", "signed_path": path, "signed_filename": file.filename,
        "signed_content_type": ctype, "signed_at": now_iso()}})
    return await db.contracts.find_one({"id": contract_id}, {"_id": 0})


@api_router.get("/contracts/{contract_id}/signed")
async def get_signed(contract_id: str, request: Request, auth: Optional[str] = Query(None), authorization: Optional[str] = Header(None)):
    validate_request_token(request, auth, authorization)
    ct = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not ct or not ct.get("signed_path"):
        raise HTTPException(status_code=404, detail="No signed document")
    data, ctype = await run_in_threadpool(get_object, ct["signed_path"])
    return Response(content=data, media_type=ct.get("signed_content_type", ctype),
                    headers={"Content-Disposition": f'inline; filename="{ct.get("signed_filename","signed")}"'})


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------
@api_router.get("/clients/{client_id}/payments")
async def list_payments(client_id: str, user: dict = Depends(get_current_user)):
    return await db.payments.find({"client_id": client_id}, {"_id": 0}).sort("date", -1).to_list(1000)


@api_router.post("/clients/{client_id}/payments")
async def add_payment(client_id: str, body: PaymentInput, user: dict = Depends(get_current_user)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["client_id"] = client_id
    doc["created_at"] = now_iso()
    if not doc.get("date"):
        doc["date"] = now_iso()[:10]
    await db.payments.insert_one(dict(doc))
    return clean(doc)


@api_router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: str, user: dict = Depends(get_current_user)):
    await db.payments.delete_one({"id": payment_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Leads (public contact form)
# ---------------------------------------------------------------------------
@api_router.post("/leads")
async def create_lead(body: LeadInput):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["status"] = "new"
    doc["created_at"] = now_iso()
    await db.leads.insert_one(dict(doc))
    return {"ok": True, "id": doc["id"]}


@api_router.get("/leads")
async def list_leads(user: dict = Depends(get_current_user)):
    return await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.put("/leads/{lead_id}")
async def update_lead(lead_id: str, status: str = Form(...), user: dict = Depends(get_current_user)):
    await db.leads.update_one({"id": lead_id}, {"$set": {"status": status}})
    return {"ok": True}


@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, user: dict = Depends(get_current_user)):
    await db.leads.delete_one({"id": lead_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@api_router.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)):
    active = await db.clients.count_documents({"status": "active"})
    total = await db.clients.count_documents({})
    pending = await db.contracts.count_documents({"status": "generated"})
    new_leads = await db.leads.count_documents({"status": "new"})
    month_prefix = datetime.now(timezone.utc).isoformat()[:7]
    payments = await db.payments.find({"status": "paid"}, {"_id": 0}).to_list(5000)
    revenue_month = sum(p["amount"] for p in payments if str(p.get("date", "")).startswith(month_prefix))
    revenue_total = sum(p["amount"] for p in payments)
    # revenue trend last 6 months
    trend = {}
    for p in payments:
        m = str(p.get("date", ""))[:7]
        if m:
            trend[m] = trend.get(m, 0) + p["amount"]
    trend_list = [{"month": k, "revenue": v} for k, v in sorted(trend.items())][-6:]
    return {"active_clients": active, "total_clients": total, "pending_contracts": pending,
            "new_leads": new_leads, "revenue_month": revenue_month, "revenue_total": revenue_total,
            "trend": trend_list}


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    pw = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({"email": email, "password_hash": hash_password(pw),
                                   "name": "Kendra Albritton", "role": "admin", "created_at": now_iso()})
        logger.info("Admin seeded")
    elif not verify_password(pw, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(pw)}})


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.clients.create_index("id", unique=True)
    await seed_admin()
    try:
        await run_in_threadpool(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@api_router.get("/")
async def root():
    return {"message": "KP Studio API"}


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
