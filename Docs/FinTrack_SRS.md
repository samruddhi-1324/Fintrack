# Software Requirements Specification (SRS)
## FinTrack — Personal Expense Tracker Application

**Document Version:** 1.0
**Status:** Draft
**Based on:** FinTrack PRD v2.0 (Merged), Merged Aug 26, 2026
**Last Updated:** August 26, 2026

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements, system architecture, data model, and interface requirements for **FinTrack**, a personal expense tracking web application, Version 1 (V1/MVP). It translates the FinTrack Product Requirements Document (PRD) v2.0 into a technical specification suitable for design, development, and testing.

### 1.2 Scope
FinTrack V1 is a responsive web application that allows a single user to:
- Log, view, edit, and delete expenses
- Organize expenses into user-defined categories
- View spending through a dashboard with totals, charts, and reports
- Set budget goals and track remaining balance live
- Search, filter, and sort expense records
- Export expense data (nice-to-have, P2)

V1 is explicitly scoped as a **single-user, no-login, offline-capable (single-device), privately deployed** application. Multi-user support, bank integrations, notifications, and monetization are deferred to later phases (see Section 9).

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| SRS | Software Requirements Specification |
| PRD | Product Requirements Document |
| MVP | Minimum Viable Product |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| CRUD | Create, Read, Update, Delete |
| ORM | Object-Relational Mapping |
| JWT | JSON Web Token |
| RLS | Row Level Security |
| WCAG | Web Content Accessibility Guidelines |
| P0/P1/P2 | Priority levels (P0 = must-have, P1 = should-have, P2 = nice-to-have) |

### 1.4 References
- FinTrack PRD v2.0 (Merged), Product Team, August 26, 2026
- FinTrack Resolved Technical Decisions (DECISIONS.md)
- WCAG 2.1 AA Guidelines
- IEEE 830 SRS Standard (structural reference)

### 1.5 Document Overview
Section 2 describes the product at a high level. Section 3 details functional requirements by feature area. Section 4 covers external interface requirements. Section 5 specifies non-functional requirements. Section 6 defines the data model. Section 7 describes system architecture and deployment. Section 8 lists constraints and assumptions. Section 9 outlines the phased roadmap for context.

---

## 2. Overall Description

### 2.1 Product Perspective
FinTrack is a new, standalone product — not an extension of an existing system. V1 is a self-contained responsive web application with no external financial integrations. The architecture is designed so that later phases (login, bank sync, multi-user, notifications, monetization) can be added without a fundamental rebuild.

**System Context:**
```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────────┐
│   React Frontend │  HTTPS  │   FastAPI Backend │   SQL   │  Supabase Postgres │
│   (Vercel)        │◄───────►│   (Render)         │◄───────►│  (Managed DB)      │
└─────────────────┘         └──────────────────┘         └───────────────────┘
        │
        ▼
┌─────────────────┐
│  IndexedDB        │  ← Local offline-write queue (single-device)
│  (Browser-local)   │
└─────────────────┘
```

### 2.2 Product Functions (Summary)
- Expense CRUD with validation
- Dynamic, user-managed categories
- Dashboard with totals, charts (pie/donut, bar/line), and reports
- Budget goal setting with live remaining-balance tracking
- Search, filter, and sort across expenses
- Offline-capable expense entry (single device) with sync-on-reconnect
- Data export (CSV/PDF/Excel) — P2

### 2.3 User Characteristics

| User Type | Description |
|---|---|
| Primary | Budget-conscious individuals (25–45) tracking personal spending manually, no bookkeeping background assumed |
| Secondary (Phase 2+) | Couples/households managing shared expenses — out of scope for V1 |
| Tertiary | Freelancers/gig workers with light tax-adjacent tracking needs — not full accounting |

V1 assumes a single system user; no user account management, roles, or permissions exist at this stage.

### 2.4 Operating Environment
- **Frontend:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge — latest 2 major versions), desktop and mobile
- **Backend:** Python 3.12 runtime, containerized or native, hosted on Render
- **Database:** Managed Postgres via Supabase
- **Frontend hosting:** Vercel (static build + CDN)

### 2.5 Design and Implementation Constraints
- No authentication/login in V1 (single system user, `user_id` defaulted)
- Single fixed currency: INR (₹), 2 decimal places
- No public internet exposure planned for V1 (local/private deployment)
- No native mobile app in V1 (responsive web only)
- No hardcoded/demo data permitted at any stage — all data dynamically sourced from the database

### 2.6 Assumptions and Dependencies
- Users have a modern browser with JavaScript and IndexedDB support
- A Supabase project and Render service are provisioned before deployment
- Budget goals default to a monthly cycle
- Expense dates are same-day-or-earlier only (no future dating)

---

## 3. Functional Requirements

Each requirement below corresponds to the PRD's FR-ID for traceability.

### 3.1 Navigation

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The system shall provide a hamburger menu with two sections: **Dashboard** (view-only summary) and **Expenses** (add/edit/delete/search/filter/sort) | P0 |

### 3.2 Expense CRUD

| ID | Requirement | Priority |
|---|---|---|
| FR-2 | The system shall allow the user to create a new expense with fields: Title, Category, Amount (₹, 2 decimals), Date (defaults to today), Notes (optional), Payment Mode (optional: Cash/Card/UPI) | P0 |
| FR-3 | The system shall display all logged expenses in a paginated list | P0 |
| FR-4 | The system shall allow the user to update any field of an existing expense | P0 |
| FR-5 | The system shall allow the user to delete an expense, requiring a confirmation step before deletion | P0 |

### 3.3 Category Management

| ID | Requirement | Priority |
|---|---|---|
| FR-6 | The system shall allow the user to create a new category, either inline while logging an expense or from a dedicated category list | P0 |
| FR-7 | The system shall allow the user to rename an existing category | P0 |
| FR-8 | The system shall prevent deletion of a category with linked expenses unless the user explicitly confirms reassignment of those expenses to another category | P0 |
| FR-9 | The system shall display the list of categories along with a count of expenses linked to each | P1 |
| FR-10 | The system shall ship with a set of default starter categories (e.g., Food, Transport, Rent) pre-populated on first use | P2 |

### 3.4 Search, Filter & Sort

| ID | Requirement | Priority |
|---|---|---|
| FR-11 | The system shall allow the user to search expenses by title or notes text | P1 |
| FR-12 | The system shall allow filtering expenses by date range | P0 |
| FR-13 | The system shall allow filtering expenses by category | P0 |
| FR-14 | The system shall allow filtering expenses by amount range | P1 |
| FR-15 | The system shall allow filtering expenses by payment mode | P1 |
| FR-16 | The system shall allow sorting expenses by amount, date, or category | P1 |
| — | Search, filter, and sort capabilities shall be usable in combination within a single query | P0 |

### 3.5 Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-17 | The system shall display total amount spent, overall and for the current month | P0 |
| FR-18 | The system shall display a snapshot of recent expenses on the dashboard | P0 |
| FR-19 | The system shall display a pie/donut chart of spending by category | P0 |
| FR-20 | The system shall display a bar/line chart of spending over time | P0 |
| FR-21 | The system shall display budget status relative to the user's goal | P0 |
| FR-22 | The system shall provide daily, weekly, and monthly report views | P0 |
| FR-23 | The system shall display month-over-month spending comparison with percentage change | P1 |
| FR-24 | The system shall display top spending categories, ranked | P1 |
| FR-25 | The system shall display average daily/weekly spend | P2 |
| FR-26 | The system shall flag simple spending anomalies (e.g., a spike relative to recent average) | P2 |

### 3.6 Budget / Spending Goal

| ID | Requirement | Priority |
|---|---|---|
| FR-27 | The system shall allow the user to set an overall monthly budget goal and per-category budget limits | P0 |
| FR-28 | The system shall track and display remaining budget balance live as expenses are added | P0 |
| FR-29 | The system shall display a status indicator (on track / near limit / over budget) with alerts at configurable thresholds (e.g., 80%, 100%) | P1 |

### 3.7 Data Export

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | The system shall allow the user to export filtered or full expense data as CSV, PDF, or Excel | P2 |

### 3.8 Data Integrity

| ID | Requirement | Priority |
|---|---|---|
| FR-31 | The system shall not use hardcoded or demo data at any stage; all data (expenses, categories, budgets, reports) shall be dynamically created, stored, and fetched from the live data layer | P0 |

### 3.9 Field-Level Validation Rules

| Field | Rule |
|---|---|
| Title | Required; 1–50 characters; whitespace-trimmed; reject all-whitespace input |
| Amount | Required; positive number only; max 2 decimal places; reasonable upper bound; reject zero |
| Date | Required; cannot be a future date; not before a reasonable lower bound (e.g., year 2000) |
| Category | Required; must reference an existing category or a newly created one |
| Notes | Optional; max 250 characters; input sanitized against script/HTML injection |
| Payment Mode | Optional; constrained to enum values (Cash, Card, UPI) |
| Category name | Required; 1–30 characters; unique per user (case-insensitive) |
| Budget amount | Required if set; positive number; 2 decimal places; reasonable upper bound |
| Amount range filter | Minimum ≤ maximum; both non-negative |
| Date range filter | Start date ≤ end date; end date not in the future |

All client-side validations are re-enforced server-side (FastAPI/Pydantic) as the source of truth; client-side validation is a UX convenience only.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Responsive layout across three breakpoints: mobile (<640px), tablet (640–1024px), desktop (>1024px)
- Dashboard: single-column stack on mobile; two-column grid (summary + charts) on tablet/desktop
- Expense list: card-based layout on mobile; sortable data table on desktop
- Expense form: full-screen modal/sheet on mobile; centered modal or side panel on desktop
- Navigation: hamburger menu on mobile/tablet; optional persistent sidebar on desktop
- Numeric input fields use `inputmode="decimal"` on mobile devices
- Micro-interactions (Framer Motion): animated list insert/remove/reorder, animated number counting on totals/budget figures, chart entry animation on first render, form validation shake/error-fade, button loading/success states
- Accessibility: WCAG 2.1 AA compliance, minimum 44×44px tap targets, 4.5:1 minimum color contrast, screen-reader support, visible focus states, color never used as the sole indicator of budget status

### 4.2 Hardware Interfaces
None. FinTrack is a software-only application with no direct hardware dependencies. It runs within a standard web browser on any device with network and local storage (IndexedDB) capability.

### 4.3 Software Interfaces

| Interface | Description |
|---|---|
| Frontend ↔ Backend | REST API over HTTPS, JSON payloads, versioned under `/api/v1/` |
| Backend ↔ Database | SQLAlchemy 2.0 ORM over Postgres wire protocol; pooled connection (pgBouncer, port 6543) for app traffic, direct connection (port 5432) for Alembic migrations |
| Backend ↔ Supabase Auth (Phase 2+) | JWT verification of Supabase-issued tokens on protected routes; disabled in V1 |
| Frontend ↔ IndexedDB | Local browser storage (via Dexie.js) for offline-first expense writes and a sync queue |

### 4.4 Communication Interfaces
- All client-server communication over HTTPS/TLS
- CORS restricted to configured frontend origins (Vercel deployment URL(s))
- API responses use a consistent envelope: `{"data": ..., "meta": {...}}` for list endpoints, `{"detail": "..."}` for errors

### 4.5 API Endpoints (Summary)

| Category | Endpoints |
|---|---|
| Health | `GET /health`, `GET /health/ready`, `GET /version` |
| Expenses | `POST /api/v1/expenses`, `GET /api/v1/expenses`, `GET /api/v1/expenses/{id}`, `PUT /api/v1/expenses/{id}`, `DELETE /api/v1/expenses/{id}` |
| Categories | `POST /api/v1/categories`, `GET /api/v1/categories`, `GET /api/v1/categories/{id}`, `PUT /api/v1/categories/{id}`, `DELETE /api/v1/categories/{id}` |
| Budgets | `POST /api/v1/budgets`, `GET /api/v1/budgets`, `GET /api/v1/budgets/status`, `PUT /api/v1/budgets/{id}`, `DELETE /api/v1/budgets/{id}` |
| Dashboard | `GET /api/v1/dashboard/summary`, `/by-category`, `/trend`, `/comparison`, `/top-categories`, `/average-spend`, `/anomalies` |
| Reports | `GET /api/v1/reports` |
| Export | `GET /api/v1/export` |

Full endpoint-level detail (query parameters, request/response schemas) is maintained in the API design reference and implemented via FastAPI's auto-generated OpenAPI schema.

---

## 5. Non-Functional Requirements

### 5.1 Performance
- Application cold start: < 2 seconds on mid-tier devices
- Expense entry save (offline-first, local write): < 200ms perceived latency
- Dashboard/chart rendering with up to 5 years of data: < 1.5 seconds
- All dashboard and report data shall be database-driven at any data volume; no static/hardcoded values

### 5.2 Scalability
- Architecture shall support later roadmap phases (Section 9) without a fundamental rewrite
- Backend shall be designed to eventually scale to 5M+ registered users and 50M+ transactions/month
- Future ingestion pipelines (e.g., bank-sync imports) shall use queuing for burst loads rather than synchronous processing

### 5.3 Security & Privacy
- No authentication in V1; system operates under a single default user context
- All financial data encrypted at rest (AES-256, via Supabase) and in transit (TLS 1.2+)
- Bank credentials, if introduced in later phases, shall never be stored directly — delegated to a certified aggregation partner via tokenized access
- No sale of user financial data to third parties
- Regular third-party penetration testing (at least annually) once publicly deployed

### 5.4 Compliance
- GDPR/CCPA readiness for data access, export, and deletion once user accounts exist
- PCI-DSS alignment for any payment-adjacent data handling (Phase 6)
- SOC 2 Type II readiness within 12 months of public launch
- Documented and enforced data retention/deletion policies

### 5.5 Reliability & Availability
- Each development phase shall be fully functional (built, tested, deployed) before the next begins
- 99.9% uptime target for core logging functionality once publicly hosted
- Offline-first architecture: manual expense entry shall function with zero connectivity and sync when reconnected (single-device scope for V1 — see Section 8.3)
- Automated daily backups with point-in-time recovery (RPO < 1 hour, RTO < 4 hours) once cloud-hosted — provided via Supabase's managed backup capability

### 5.6 Usability & Accessibility
- WCAG 2.1 AA compliance across all core flows
- Screen reader support
- Minimum tap-target size and color-contrast standards, particularly for financial figures
- Localization-ready architecture (externalized strings), even though V1 ships in a single locale/currency

### 5.7 Data Integrity
- No hardcoded or dummy data in any phase
- Idempotent transaction import once auto-import exists (no duplicate entries on re-sync)
- Audit trail for auto-categorization changes or budget edits (future phases)
- Currency conversion rates, once multi-currency exists, sourced from a reliable timestamped provider and logged

### 5.8 Maintainability
- Modular service architecture: business logic (`services/`) separated from data access (`repositories/`) and route handlers
- Categorization engine (rules-based initially, ML-assisted later) updatable without full application releases
- Comprehensive logging and observability (error rates, latency) with alerting

### 5.9 Interoperability
- Open export formats (CSV, PDF, Excel/JSON) to avoid user lock-in
- API-ready design (versioned REST API) to support future integrations without re-architecture

### 5.10 Deployment
- V1: local/private deployment via Render (backend) and Vercel (frontend), with Supabase as the managed database — no public internet exposure required for V1 given the absence of authentication
- Every feature/module shall be independently testable before deployment
- Database migrations (Alembic) run as an explicit pre-deploy step, separate from application startup, to avoid race conditions under multi-instance scaling

---

## 6. Data Model (V1)

### 6.1 Entities

**Expense**
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key (defaulted to system user in V1) |
| title | string | Required, max 50 chars |
| category_id | UUID | Foreign key → Category |
| amount | numeric(10,2) | Required, positive |
| date | date | Required, not in future |
| notes | string | Optional, max 250 chars |
| payment_mode | enum | Optional: cash, card, upi |
| created_at | timestamp | System-generated |
| updated_at | timestamp | System-generated |

**Category**
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key (defaulted to system user in V1) |
| name | string | Required, max 30 chars, unique per user (case-insensitive) |
| is_default | boolean | True for starter categories |
| created_at | timestamp | System-generated |

**Budget**
| Field | Type | Constraints |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key (defaulted to system user in V1) |
| category_id | UUID (nullable) | Null = overall monthly budget; set = per-category limit |
| amount | numeric(10,2) | Required, positive |
| period | enum | monthly (default in V1) |
| created_at | timestamp | System-generated |
| updated_at | timestamp | System-generated |

### 6.2 Relationships
- One `Category` has many `Expenses` (restrict delete unless reassignment confirmed)
- One `Budget` optionally references one `Category` (null = overall budget)
- All entities scoped by `user_id`, defaulted to a single system user in V1, ready for multi-user use from Phase 2 onward without schema changes

---

## 7. System Architecture

### 7.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| State/Data | TanStack Query (server state), Zustand (UI state) |
| Forms/Validation | React Hook Form + Zod |
| Charts | Recharts |
| Animation | Framer Motion |
| Offline storage | IndexedDB via Dexie.js |
| Backend | Python 3.12, FastAPI |
| ORM/Migrations | SQLAlchemy 2.0, Alembic |
| Database | PostgreSQL (managed via Supabase) |
| Auth (Phase 2+) | Supabase Auth, JWT verification in FastAPI |
| Export | reportlab (PDF), openpyxl (Excel), stdlib csv |

### 7.2 Deployment Architecture

| Component | Platform |
|---|---|
| Frontend | Vercel (static build, CDN-served, SPA routing fallback) |
| Backend | Render (containerized FastAPI service via Gunicorn + Uvicorn workers) |
| Database | Supabase (managed Postgres, pooled + direct connections) |

Both frontend and backend maintain separate Dockerfiles, `.env.example` files, and `.gitignore` files, with a root-level `.gitignore` for repository-wide concerns.

### 7.3 Environment Configuration
Environment variables are managed per-platform (Vercel/Render dashboards in production, local `.env` files in development), mirroring the structure defined in each project's `.env.example`. Real secrets are never committed to version control.

---

## 8. Constraints, Assumptions & Open Items Log

### 8.1 Constraints
- Single fixed currency (₹/INR) in V1
- No login/multi-user support in V1
- No native mobile application in V1
- No bank/UPI/SMS auto-import in V1

### 8.2 Assumptions
- Users have a modern browser with IndexedDB support
- Budget goals default to a monthly cycle
- A Supabase project and Render service exist prior to deployment

### 8.3 Resolved Decisions (post-PRD)
The following were open questions during technical planning and have been resolved; see `DECISIONS.md` for full rationale:
1. **Authentication:** Supabase Auth adopted (not custom JWT); disabled in V1, config-flag-enabled in Phase 2
2. **Offline-first scope (V1):** single-device, local-only sync — resolves apparent tension between PRD's offline-first NFR and no-login/no-public-deployment constraint
3. **Migration execution:** Alembic migrations run as a separate Render pre-deploy step, not inside the application container's startup command
4. **Export libraries:** confirmed as reportlab, openpyxl, and stdlib csv

---

## 9. Roadmap Reference (Context Only)

V1/Phase 1 is the scope of this SRS. Later phases (summarized from the PRD for context, not specified in detail here):

| Phase | Theme |
|---|---|
| Phase 2 | Login & multi-device sync, income tracking, recurring expenses, receipt OCR, multiple wallets, full export, dark mode |
| Phase 3 | Split expenses, shared household budgets, multi-user/role-based access |
| Phase 4 | Savings goals, multi-currency, bank/UPI/SMS auto-import, ML-assisted auto-categorization |
| Phase 5 | Biometric/PIN lock, cloud backup, custom themes, notifications |
| Phase 6 | Monetization — premium tier, ads on free tier |

Each phase requires its own SRS addendum as it is scoped in detail, following the same run-test-deploy discipline established for V1.

---

## 10. Definition of Done (V1)

- User can Add, View, Edit, and Delete expenses
- Categories are dynamic — user can create, edit, and delete their own
- Dashboard shows total spend, a recent-expenses snapshot, and at least 2 charts
- Expenses section supports search + at least 2 filters + at least 2 sort options, usable together
- User can set a budget goal and see a live remaining balance with status
- Hamburger menu navigation works between Dashboard and Expenses
- Amount and date fields are validated per Section 3.9
- No hardcoded/demo data anywhere in the application
- Deployed (Render + Vercel + Supabase) and tested end-to-end before Phase 2 begins

---

## Appendix
Wireframes, ER diagrams, and OpenAPI schema exports to be linked here as they are produced by design/engineering.
