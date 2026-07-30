# KP Studio — Product Requirements Document

## Original Problem Statement
Website + backend admin portal for a female personal trainer (KP Studio, trainer Kendra Albritton, who trains women). Portal must: add clients; per client generate a training contract with an attached liability waiver, download it, upload the signed copy back, and log payments; plus other legal protections. Public website must be bold and best-in-class. Emergent badge removed.

## User Choices
- Brand: CK Studio (artistic wordmark, italic caramel K) · Trainer: Kendra Albritton (women-only coaching)
- Contracts: downloadable PDF now (email later)
- Signing: offline — email PDF, client signs, upload signed copy back
- Payments: manual logging
- Auth: email + password (JWT)
- Visual direction: "Warm & Powerful". NOTE (2026-07-29): marketing site fully redesigned to a warm editorial "wellness" aesthetic modeled on jessicamanning.com — cream/beige (#EFE9E1 / #F5F2ED), taupe cards (#E5DCCF), caramel-bronze accent (#A9784E), charcoal text (#1C1B1A); Playfair Display headings + Manrope body. (Superseded the earlier dark Iron&Bronze and the interim aqua/teal coastal palette.)

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

## Marketing Redesign (2026-07-29)
- Full editorial redesign of Home.jsx + MarketingChrome.jsx to match jessicamanning.com.
- New sections: Hero (mix-blend white-bg portrait on cream), Meet Kendra (overlapping photo collage), "This is you" (About You bullets), "What Makes This Different" (taupe card), Programs grid (6 rounded taupe cards w/ Enquire pill buttons), Results/Gallery collage, Testimonials carousel (dark section, prev/next arrows, 5 quotes), caramel CTA banner, cream Contact form, dark footer.
- Nav: caramel announcement bar + light cream nav (charcoal links, caramel "Start Here" CTA, Trainer Login).
- Fonts: Playfair Display (display) + Manrope (body) via Google Fonts; new hero image /kendra-white.jpg (AI white-bg cutout).
- Frontend e2e test: 100% pass (iteration_2.json), no bugs. Backend unchanged.

## Round 3–4 (2026-07-29) — Rebrand, Email, Insights, Session Tracking
- Rebrand: KP Studio → "CK Studio" (artistic wordmark: C + italic caramel K). Applied across site, admin, PDF, emails. Coach K abbreviated to CK per user.
- Location: "Argyle, TX" (announcement + footer). Contact email: kalbritton13@gmail.com (footer mailto + owner notifications + reply-to).
- Footer: Instagram + Facebook social icon links; "Payments accepted: PayPal · Venmo · Zelle".
- Email (Emergent-managed Resend): lead-submit notifies owner (reply-to = prospect); admin "Email" button on each contract sends the PDF as attachment to the client (status → "sent"). Sender name "CK Studio · Kendra Albritton" (platform sending address; not literal gmail).
- Enquire prefill: program "Enquire" buttons set the contact form goal + scroll to contact.
- Session tracking: PUT /sessions/{id} status (scheduled/completed/no-show) with colored selects + calendar chip colors; recurring weekly sessions (weekday chips + weeks) via POST /clients/{id}/sessions/recurring.
- Website Insights admin tab: real tracking via POST /api/track (page_view w/ device+load time, scroll depth, clicks, form_submit) + GET /api/insights aggregation (views trend, top sources, device split, scroll funnel, inquiry types, most-viewed, top clicks, conversion). Facebook/Instagram = disabled "Connect" placeholders.
- Payments: added PayPal, Venmo, Zelle methods.
- Admin portal retheme: shadcn CSS vars switched to warm cream/caramel/charcoal to match site; Insights charts recolored warm.
- Tests: iteration_3.json 100% pass (13/13 new backend + 23/23 legacy; admin UI selectors verified).

## 2026-07-30 — Font weight fix + Kendra Page rename
- Headings were rendering Poppins at weight 400 (thin); added `.font-display { font-weight: 700 }` in index.css so all marketing/login headings are bold — matches approved preview.
- Renamed "Kendra Albritton" → "Kendra Page" everywhere (site, contract PDF, emails, sender name, admin seed).

## 2026-07-30 — Bright Aqua theme applied platform-wide
- New theme approved & applied everywhere: aqua #0FB6C4 primary, coral #FF6B6B pop, deep teal-navy #0B3B4A text/darks, white + light-aqua (#ECFDFF) backgrounds; Poppins headings + Roboto body.
- Fonts: tailwind.config.js (display=Poppins, body/sans/admin=Roboto) + index.html Google Fonts + index.css body.
- Admin colors via shadcn CSS vars in index.css :root retuned to aqua. Marketing/Login/Insights hardcoded hex swapped. ::selection = aqua.
- New bio on homepage About; package auto-fill in schedule modal (pulls total sessions from client's latest contract).
- Verified via screenshots: marketing home, /admin/login, dashboard, insights. /theme-preview route kept for future trials.

## 2026-07-30 — Scheduling: sync, conflicts, count-based recurring; KP rebrand
- Rebrand: "CK Studio" → "KP Studio" across marketing site, admin, Login, PDF agreement, emails, API, and public/index.html.
- Delete client now also deletes their sessions (frees calendar slots). Client Edit/Archive/Restore/Delete from Clients list (row menu) + client detail.
- Recurring schedule is TOTAL-SESSIONS driven: enter total sessions + weekdays → auto-logs exactly that many across the needed weeks (e.g. 8 × Mon/Thu = 8 over 4 weeks).
- Timeslot conflict detection: add_session / update_session(move) / recurring return 409 if date+time already booked by another client; UI shows sonner error toast.
- Calendar drag-to-reschedule (Dashboard) → PUT /api/sessions/{id} {date}. Single source of truth: same session doc powers the client's Schedule tab, so profile stays in sync automatically. Single-session edit via pencil in Schedule tab.
- Insights: excludes Emergent preview traffic (emergentagent.com); added "Reset analytics" (POST /api/insights/reset). Removed the "Reset all data" Dashboard button (endpoint kept for maintenance).
- Add/Edit client + reschedule modals no longer close on backdrop click (dismissible=false).
- Contract email: secure PDF download link (attachments unsupported by managed proxy); sender display name now "Kendra Albritton", reply-to = owner gmail.
- Tests: iteration_4.json 100% (10/10 frontend flows); backend curl-verified for all scheduling/conflict/sync cases.

## 2026-07-29 — Contract email: link instead of attachment
- Emergent-managed Resend proxy does NOT support attachments (playbook payload = to/subject/html/from_name/contact_email only), so the PDF never arrived. Fixed: email now embeds a secure, token-signed download link to GET /api/contracts/{id}/download?token=... (JWT type=contract_dl, 60-day exp). Verified end-to-end (valid PDF 32KB, bad token→401).
- From address (…emergentmails.com) is platform-fixed and cannot be changed on the managed integration; only display name (EMAIL_FROM_NAME="CK Studio · Kendra Albritton") and reply-to (OWNER_EMAIL) are set. To send from a coachkstudio.com address would require the user's own Resend account + domain DNS verification.

## 2026-07-29 — Portal admin controls + insights cleanup
- Client management: Edit / Archive-Restore / Delete actions on Clients list (row menu) and ClientDetail; status filters (Active/Lead/Archived/All); delete cascades contracts+payments (existing API).
- "Reset portal data": Dashboard Danger Zone + protected POST /api/admin/reset-data (requires confirm="RESET"); wipes clients/contracts/payments/sessions/leads/events, keeps login. Preview DB wiped now. reset_data.py maintenance script added.
- Insights now exclude Emergent preview traffic (host/referrer containing emergentagent.com); real production (emergent.host) still counted. track.js now sends window.location.host; TrackInput has host field.
- Theme change to "Alive & Free" (Poppins/Roboto, sand/clay palette) previewed at /theme-preview only — user put ON HOLD, live site untouched.

## Backlog
- P1: Email contracts to clients directly (Resend/SendGrid).
- P1: In-portal digital signature capture.
- P2: Stripe payments / invoicing.
- P2: Live Facebook/Instagram insights (replace placeholders once accounts connected).
- P2: Rate-limit/origin-check on POST /api/track.
- Tech debt: split server.py (913 lines) into routers; extract ClientDetail tabs into components.

## Credentials
See /app/memory/test_credentials.md (admin: kendra@kpstudio.com / KPStudio2026!).
