from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import logging
import uuid
import io
import base64
import httpx
import jwt
import bcrypt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from collections import Counter, defaultdict
from urllib.parse import urlparse

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

# Emergent managed email (Resend) — base URL is a constant, never from env.
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "CK Studio")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL")

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
# Email helper (Emergent managed Resend)
# ---------------------------------------------------------------------------
async def send_email(to: str, subject: str, html: str, reply_to: str = None, attachments: list = None):
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set; skipping email send")
        return None
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to:
        payload["contact_email"] = reply_to
    if attachments:
        payload["attachments"] = [
            {"filename": a["filename"], "content": base64.b64encode(a["content"]).decode("utf-8")}
            for a in attachments
        ]
    async with httpx.AsyncClient(timeout=30) as hc:
        resp = await hc.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                             headers={"X-Email-Key": EMAIL_KEY}, json=payload)
    resp.raise_for_status()
    return resp.json()


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


from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

SIG_FONT = "Helvetica-Oblique"
try:
    pdfmetrics.registerFont(TTFont("GreatVibes", str(ROOT_DIR / "fonts" / "GreatVibes-Regular.ttf")))
    SIG_FONT = "GreatVibes"
except Exception as _e:
    logger.warning(f"Signature font not loaded: {_e}")


def build_contract_pdf(c: dict, ct: dict) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=0.7 * inch, bottomMargin=0.7 * inch,
                            leftMargin=0.85 * inch, rightMargin=0.85 * inch)
    bronze = colors.HexColor("#8A5A40")
    dark = colors.HexColor("#1C1B1A")
    styles = getSampleStyleSheet()
    h_brand = ParagraphStyle("brand", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=24, textColor=bronze, spaceAfter=9, leading=27, alignment=1)
    h_sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=8.5, textColor=colors.grey,
                           spaceAfter=3, leading=12, alignment=1)
    h_doc = ParagraphStyle("doc", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9,
                           textColor=dark, spaceAfter=2, leading=13, alignment=1)
    h1 = ParagraphStyle("h1", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12,
                        textColor=dark, spaceBefore=12, spaceAfter=6)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=9.5, leading=13, textColor=dark, spaceAfter=5)
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=8, leading=11, textColor=colors.grey)

    el = []
    el.append(Paragraph("CK&nbsp;STUDIO", h_brand))
    el.append(Paragraph("K&nbsp;E&nbsp;N&nbsp;D&nbsp;R&nbsp;A&nbsp;&nbsp;&nbsp;A&nbsp;L&nbsp;B&nbsp;R&nbsp;I&nbsp;T&nbsp;T&nbsp;O&nbsp;N", h_sub))
    el.append(Paragraph("PERSONAL TRAINING AGREEMENT &amp; RELEASE", h_doc))
    el.append(HRFlowable(width="100%", thickness=1.2, color=bronze, spaceBefore=12, spaceAfter=18))

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
        "In consideration of being permitted to participate in training with Kendra Albritton / CK Studio, Client hereby <b>releases, waives, and discharges</b> the Trainer, her agents, and affiliates from any and all liability, claims, demands, or causes of action arising out of or related to any loss, damage, or injury sustained while participating in training, to the fullest extent permitted by law.",
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

    section("7. Voluntary Engagement &amp; Independent Choice", [
        "Client affirms that they have chosen CK Studio and Kendra Albritton <b>freely, voluntarily, and of their own accord</b>, and that no one has required, referred, or directed them to engage these services. Client is seeking out and retaining the Trainer on their own initiative.",
        "Client represents and warrants that their engagement of the Trainer does <b>not violate any non-compete, non-solicitation, exclusivity, or similar agreement</b> the Client may have with any gym, studio, employer, or other party. Any such obligation is solely between the Client and that third party and <b>does not apply to, bind, or involve the Trainer or CK Studio</b>.",
        "Client agrees to <b>indemnify, defend, and hold harmless</b> the Trainer and CK Studio from any claim, demand, or liability arising out of any such non-compete or restrictive agreement between the Client and any third party. The Trainer shall not be held liable in any way for the Client's own contractual obligations to others.",
    ])
    section("8. Confidentiality", [
        "The Trainer will keep Client's personal and health information confidential and use it solely to deliver services, except as required by law.",
    ])
    if ct.get("include_media_release", True):
        section("9. Photo &amp; Media Release (optional)", [
            "Client grants permission for photos/video taken during training to be used for promotional purposes. Client may opt out by initialling here: __________.",
        ])
    section("10. Termination", [
        "Either party may terminate this agreement with written notice. Prepaid, unused sessions may be handled at the Trainer's discretion consistent with Section 2.",
    ])
    section("11. Entire Agreement", [
        "This document constitutes the entire agreement between the parties and supersedes any prior understanding. Client confirms they have read and understood this agreement in full.",
    ])

    eff_raw = ct.get("start_date") or (ct.get("created_at", "") or now_iso())[:10]
    try:
        eff = datetime.strptime(eff_raw, "%Y-%m-%d").strftime("%B %d, %Y")
    except Exception:
        eff = eff_raw

    el.append(Spacer(1, 8))
    el.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#E5E0DA"), spaceAfter=6))
    el.append(Paragraph(f"Effective date of this agreement: <b>{eff}</b>", body))

    sig_style = ParagraphStyle("sigfont", parent=styles["Normal"], fontName=SIG_FONT, fontSize=26, textColor=dark, leading=28)
    lbl = ParagraphStyle("siglbl", parent=small, fontSize=8.5, leading=12)
    client_name = c.get("name", "")
    sig = [
        [Paragraph("", sig_style), Paragraph("Kendra Albritton", sig_style)],
        [Paragraph(f"<b>Client Signature</b> — {client_name}<br/>Date: __________________", lbl),
         Paragraph(f"<b>Trainer Signature</b> — Kendra Albritton, CK Studio<br/>Date: {eff}", lbl)],
    ]
    ts = Table(sig, colWidths=[3.25 * inch, 3.25 * inch], rowHeights=[34, 26])
    ts.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (0, 0), 0.8, dark),
        ("LINEBELOW", (1, 0), (1, 0), 0.8, dark),
        ("VALIGN", (0, 0), (-1, 0), "BOTTOM"),
        ("VALIGN", (0, 1), (-1, 1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ("TOPPADDING", (0, 1), (-1, 1), 4),
    ]))
    el.append(ts)
    el.append(Spacer(1, 8))
    el.append(Paragraph("CK Studio — Kendra Albritton · This agreement is provided for the mutual protection of client and trainer.", small))

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
    fname = f"CKStudio_Agreement_{c.get('name','client').replace(' ', '_')}.pdf"
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


@api_router.post("/contracts/{contract_id}/email")
async def email_contract(contract_id: str, user: dict = Depends(get_current_user)):
    ct = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not ct:
        raise HTTPException(status_code=404, detail="Contract not found")
    c = await db.clients.find_one({"id": ct["client_id"]}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    if not c.get("email"):
        raise HTTPException(status_code=400, detail="This client has no email on file. Add one first.")
    pdf = build_contract_pdf(c, ct)
    fname = f"CKStudio_Agreement_{c.get('name','client').replace(' ', '_')}.pdf"
    first = (c.get("name", "there") or "there").split(" ")[0]
    reply = OWNER_EMAIL or ""
    html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;color:#1C1B1A;">
      <tr><td style="padding:8px 0;">
        <p style="font-size:18px;margin:0 0 4px;color:#A9784E;font-weight:bold;">CK Studio</p>
        <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a8a;margin:0 0 18px;">Kendra Albritton · Personal Training</p>
        <p>Hi {first},</p>
        <p>Attached is your personal training agreement (with the liability waiver, PAR-Q, and studio policies).</p>
        <p><b>Next steps:</b> please review, sign, and send the signed copy back to
           <a href="mailto:{reply}">{reply}</a>. Once received, we'll get your first session booked.</p>
        <p>Can't wait to get started.</p>
        <p style="margin-top:20px;">— Kendra<br/><span style="color:#8a8a8a;font-size:12px;">CK Studio</span></p>
      </td></tr>
    </table>"""
    try:
        await send_email(c["email"], "Your CK Studio training agreement", html,
                         reply_to=OWNER_EMAIL, attachments=[{"filename": fname, "content": pdf}])
    except Exception as e:
        logger.error(f"Contract email failed: {e}")
        raise HTTPException(status_code=502, detail="Could not send the email. Please try again.")
    await db.contracts.update_one({"id": contract_id}, {"$set": {
        "status": "sent" if ct.get("status") != "signed" else "signed",
        "sent_to": c["email"], "sent_at": now_iso()}})
    return await db.contracts.find_one({"id": contract_id}, {"_id": 0})


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
    if OWNER_EMAIL:
        try:
            html = f"""
            <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;color:#1C1B1A;">
              <tr><td>
                <p style="font-size:16px;color:#A9784E;font-weight:bold;margin:0 0 12px;">New website enquiry</p>
                <p style="margin:4px 0;"><b>Name:</b> {doc.get('name','')}</p>
                <p style="margin:4px 0;"><b>Email:</b> {doc.get('email','')}</p>
                <p style="margin:4px 0;"><b>Phone:</b> {doc.get('phone','') or '—'}</p>
                <p style="margin:4px 0;"><b>Goal:</b> {doc.get('goal','') or '—'}</p>
                <p style="margin:12px 0 4px;"><b>Message:</b></p>
                <p style="margin:0;white-space:pre-wrap;">{doc.get('message','') or '—'}</p>
                <p style="color:#8a8a8a;font-size:12px;margin-top:18px;">Reply directly to this email to reach {doc.get('name','the client')}.</p>
              </td></tr>
            </table>"""
            await send_email(OWNER_EMAIL, f"New enquiry — {doc.get('name','')}", html, reply_to=doc.get("email"))
        except Exception as e:
            logger.error(f"Lead notification email failed: {e}")
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
# Training sessions (scheduling)
# ---------------------------------------------------------------------------
class SessionInput(BaseModel):
    date: str
    time: Optional[str] = ""
    duration: Optional[str] = "60 min"
    note: Optional[str] = ""
    status: Optional[str] = "scheduled"


@api_router.get("/sessions")
async def list_all_sessions(user: dict = Depends(get_current_user)):
    return await db.sessions.find({}, {"_id": 0}).sort("date", 1).to_list(2000)


@api_router.get("/clients/{client_id}/sessions")
async def list_client_sessions(client_id: str, user: dict = Depends(get_current_user)):
    return await db.sessions.find({"client_id": client_id}, {"_id": 0}).sort("date", 1).to_list(1000)


@api_router.post("/clients/{client_id}/sessions")
async def add_session(client_id: str, body: SessionInput, user: dict = Depends(get_current_user)):
    c = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["client_id"] = client_id
    doc["client_name"] = c.get("name", "")
    doc["created_at"] = now_iso()
    await db.sessions.insert_one(dict(doc))
    return clean(doc)


@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user: dict = Depends(get_current_user)):
    await db.sessions.delete_one({"id": session_id})
    return {"ok": True}


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    note: Optional[str] = None
    time: Optional[str] = None
    duration: Optional[str] = None
    date: Optional[str] = None


@api_router.put("/sessions/{session_id}")
async def update_session(session_id: str, body: SessionUpdate, user: dict = Depends(get_current_user)):
    upd = {k: v for k, v in body.model_dump().items() if v is not None}
    if not upd:
        return {"ok": True}
    res = await db.sessions.update_one({"id": session_id}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    return await db.sessions.find_one({"id": session_id}, {"_id": 0})


class RecurringInput(BaseModel):
    start_date: str
    weeks: int = 4
    weekdays: List[int] = []   # 0=Mon .. 6=Sun (Python weekday)
    time: Optional[str] = ""
    duration: Optional[str] = "60 min"
    note: Optional[str] = ""


@api_router.post("/clients/{client_id}/sessions/recurring")
async def add_recurring_sessions(client_id: str, body: RecurringInput, user: dict = Depends(get_current_user)):
    c = await db.clients.find_one({"id": client_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Client not found")
    if not body.weekdays:
        raise HTTPException(status_code=400, detail="Pick at least one weekday")
    try:
        start = datetime.strptime(body.start_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid start date")
    wd = set(body.weekdays)
    docs = []
    for i in range(max(body.weeks, 1) * 7):
        d = start + timedelta(days=i)
        if d.weekday() in wd:
            docs.append({
                "id": str(uuid.uuid4()), "client_id": client_id, "client_name": c.get("name", ""),
                "date": d.isoformat(), "time": body.time or "", "duration": body.duration or "60 min",
                "note": body.note or "", "status": "scheduled", "created_at": now_iso(),
            })
    if docs:
        await db.sessions.insert_many([dict(x) for x in docs])
    return {"ok": True, "created": len(docs)}


# ---------------------------------------------------------------------------
# Website analytics (tracking + insights)
# ---------------------------------------------------------------------------
class TrackInput(BaseModel):
    type: str
    path: Optional[str] = "/"
    referrer: Optional[str] = ""
    host: Optional[str] = ""
    device: Optional[str] = "desktop"
    label: Optional[str] = ""
    value: Optional[float] = None


@api_router.post("/track")
async def track_event(body: TrackInput):
    doc = body.model_dump()
    doc["created_at"] = now_iso()
    try:
        await db.events.insert_one(doc)
    except Exception as e:
        logger.error(f"track failed: {e}")
    return {"ok": True}


def _host(ref: str) -> str:
    if not ref:
        return "Direct"
    try:
        h = urlparse(ref).netloc or "Direct"
        return h.replace("www.", "") or "Direct"
    except Exception:
        return "Direct"


def _inquiry_type(text: str) -> str:
    g = (text or "").lower()
    if any(k in g for k in ["postnatal", "postpartum", "pregnan", "mama"]):
        return "Pre/Postnatal"
    if any(k in g for k in ["nutrition", "fat", "weight", "diet"]):
        return "Nutrition / Weight"
    if "online" in g:
        return "Online Coaching"
    if "group" in g:
        return "Small Group"
    if any(k in g for k in ["strong", "strength", "1:1", "personal", "confiden"]):
        return "1:1 Strength"
    return "General"


def _is_preview_traffic(e: dict) -> bool:
    """Exclude Emergent preview/editor traffic (*.emergentagent.com).
    The real production site (emergent.host) is intentionally NOT excluded."""
    blob = f"{e.get('host','')} {e.get('referrer','')}".lower()
    return "emergentagent.com" in blob


@api_router.get("/insights")
async def insights(user: dict = Depends(get_current_user)):
    events = await db.events.find({}, {"_id": 0}).to_list(50000)
    events = [e for e in events if not _is_preview_traffic(e)]
    leads = await db.leads.find({}, {"_id": 0}).to_list(5000)
    clients_count = await db.clients.count_documents({})

    pv = [e for e in events if e.get("type") == "page_view"]
    clicks = [e for e in events if e.get("type") == "click"]
    scrolls = [e for e in events if e.get("type") == "scroll"]
    forms = [e for e in events if e.get("type") == "form_submit"]

    total_views = len(pv)
    total_inquiries = len(leads)
    conversion = round(total_inquiries / total_views * 100, 1) if total_views else 0.0
    lead_to_client = round(clients_count / total_inquiries * 100, 1) if total_inquiries else 0.0

    by_day = defaultdict(int)
    for e in pv:
        d = str(e.get("created_at", ""))[:10]
        if d:
            by_day[d] += 1
    days = sorted(by_day)[-14:]
    views_trend = [{"date": d, "views": by_day[d]} for d in days]

    dev = Counter((e.get("device") or "desktop") for e in pv)
    device_split = [{"name": k.title(), "value": v} for k, v in dev.items()]
    mobile_pct = round(dev.get("mobile", 0) / total_views * 100, 1) if total_views else 0.0

    loads = [e["value"] for e in pv if isinstance(e.get("value"), (int, float)) and e["value"] > 0]
    avg_load = round(sum(loads) / len(loads)) if loads else 0
    mob_loads = [e["value"] for e in pv if e.get("device") == "mobile" and isinstance(e.get("value"), (int, float)) and e["value"] > 0]
    mobile_load = round(sum(mob_loads) / len(mob_loads)) if mob_loads else 0

    src = Counter(_host(e.get("referrer", "")) for e in pv)
    top_sources = [{"source": k, "visits": v} for k, v in src.most_common(6)]

    sc = Counter(int(e.get("value") or 0) for e in scrolls)
    scroll_funnel = [{"depth": f"{m}%", "count": sc.get(m, 0)} for m in (25, 50, 75, 100)]

    clk = Counter(e.get("label", "") for e in clicks if e.get("label"))
    top_clicks = [{"label": k, "count": v} for k, v in clk.most_common(6)]

    mv = Counter(e.get("path", "/") for e in pv)
    most_viewed_pages = [{"page": k, "views": v} for k, v in mv.most_common(6)]

    it = Counter(_inquiry_type(l.get("goal") or l.get("message")) for l in leads)
    inquiry_types = [{"type": k, "count": v} for k, v in it.most_common()]

    return {
        "total_views": total_views, "total_inquiries": total_inquiries,
        "total_clicks": len(clicks), "total_forms": len(forms) or total_inquiries,
        "conversion": conversion, "lead_to_client": lead_to_client, "clients": clients_count,
        "avg_load_ms": avg_load, "mobile_load_ms": mobile_load, "mobile_pct": mobile_pct,
        "views_trend": views_trend, "device_split": device_split, "top_sources": top_sources,
        "scroll_funnel": scroll_funnel, "top_clicks": top_clicks,
        "most_viewed_pages": most_viewed_pages, "inquiry_types": inquiry_types,
    }


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
class ResetInput(BaseModel):
    confirm: str = ""


@api_router.post("/admin/reset-data")
async def reset_data(body: ResetInput, user: dict = Depends(get_current_user)):
    """Wipe all client/business data for a clean slate. Keeps admin login(s)."""
    if body.confirm != "RESET":
        raise HTTPException(status_code=400, detail='Type RESET to confirm.')
    deleted = {}
    for coll in ("clients", "contracts", "payments", "sessions", "leads", "events"):
        res = await db[coll].delete_many({})
        deleted[coll] = res.deleted_count
    logger.info(f"Portal data reset by {user.get('email')}: {deleted}")
    return {"ok": True, "deleted": deleted}


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
    today = datetime.now(timezone.utc).date().isoformat()
    upcoming_sessions = await db.sessions.count_documents({"date": {"$gte": today}})
    return {"active_clients": active, "total_clients": total, "pending_contracts": pending,
            "new_leads": new_leads, "upcoming_sessions": upcoming_sessions,
            "revenue_month": revenue_month, "revenue_total": revenue_total, "trend": trend_list}


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
    return {"message": "CK Studio API"}


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
