# KP Studio — Product Requirements Document

## Original Problem Statement
Website + backend admin portal for a female personal trainer (KP Studio, trainer Kendra Albritton, who trains women). Portal must: add clients; per client generate a training contract with an attached liability waiver, download it, upload the signed copy back, and log payments; plus other legal protections. Public website must be bold and best-in-class. Emergent badge removed.

## User Choices
- Brand: KP Studio · Trainer: Kendra Albritton (women-only coaching)
- Contracts: downloadable PDF now (email later)
- Signing: offline — email PDF, client signs, upload signed copy back
- Payments: manual logging
- Auth: email + password (JWT)
- Visual direction: "Warm & Powerful" — dark editorial marketing site (Iron & Bronze), light Sand & Stone admin

## Architecture
- Frontend: React (CRACO), Tailwind, framer-motion, recharts, sonner. Dual theme: dark marketing site + light admin portal.
- Backend: FastAPI, JWT httpOnly-cookie auth, ReportLab PDF generation, Emergent Object Storage for signed uploads.
- DB: MongoDB (collections: users, clients, contracts, payments, leads).

## Personas
- Kendra (admin): manages clients, contracts/waivers, payments, leads.
- Prospective client: discovers site, submits enquiry via lead form.

## Implemented (2026-07-27)
- Public marketing site: hero, marquee, about, programs, results/gallery, testimonials, lead form, footer. Emergent badge removed.
- Admin auth (email+password, JWT cookies), seeded admin, protected routes.
- Dashboard: stat cards + revenue trend chart.
- Clients: list/search, add, edit, delete, detail page.
- Contracts & Waivers: generate Personal Training Agreement PDF containing liability waiver, assumption of risk/informed consent, PAR-Q, cancellation/no-show policy, payment/refund terms, confidentiality, photo/media release, termination. Download PDF; upload signed copy (object storage); view signed; delete.
- Payments: manual logging per client, totals, delete.
- Leads inbox: view website enquiries, convert to client, delete.
- Full test pass: backend 23/23, frontend e2e 100%.

## Backlog
- P1: Email contracts to clients directly (Resend/SendGrid).
- P1: In-portal digital signature capture.
- P2: Stripe payments / invoicing.
- P2: Session scheduling & attendance tracking.
- P2: Brute-force lockout on login; env-driven cookie Secure flag for local dev.

## Credentials
See /app/memory/test_credentials.md (admin: kendra@kpstudio.com / KPStudio2026!).
