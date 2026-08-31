# Product Requirements Document (PRD)
## FinTrack — Personal Expense Tracker Application

**Document Owner:** Product Team
**Status:** Draft v2.0 (Merged)
**Last Updated:** August 26, 2026

---

## 1. Overview

### 1.1 What This Product Is
FinTrack is a personal finance application that lets a user log daily expenses, organize them into categories, and instantly see the impact on totals, charts, and a live budget — turning scattered notes/spreadsheet habits into one simple, searchable place to track and control spending. V1 ships as a responsive web app; native mobile and expanded platform support follow in later phases.

### 1.2 Problem Statement
Most people don't have a clear, real-time picture of where their money goes. Bank apps show transactions but not intent-driven categorization or budgeting context; spreadsheets and notes apps require manual effort most users abandon within weeks and are hard to search or filter. Because of this, users can't easily answer three simple questions:

- "How much have I spent?"
- "Where is my money going?"
- "Am I within my budget, or over it?"

This gap — between *"I want to control my spending"* and *"I actually know what I'm spending on"* — is where users lose motivation and revert to reactive financial behavior. FinTrack closes that gap with frictionless expense capture and a live, at-a-glance budgeting view.

### 1.3 Why We're Building It (Business Rationale)
- Personal finance management is a proven, monetizable category (subscriptions, premium tiers, potential financial-partner integrations).
- Low switching cost for users today means there's room for a simpler, faster-to-value competitor.
- Expense data is a foundation for future features (bill negotiation, savings recommendations, investment nudges, bank sync) — this PRD scopes the entry point into that ecosystem while keeping V1 deliberately small and shippable.

### 1.4 Why Keep V1 Small?
V1 focuses only on the core loop:

> **Log an expense → See it reflected in totals & charts → Track budget left**

Everything else (login, multi-device sync, recurring expenses, notifications, multi-user support, bank sync, multi-currency) is deferred to later phases. This keeps V1 simple to build, easy to test, and easy to actually use — while the architecture is built so later phases don't require a rebuild.

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Make expense logging effortless | Median time to log an expense | < 30 seconds |
| Show spending visually | Dashboard/chart usage per active user | Tracked qualitatively in V1 |
| Show a live remaining budget | % of budget-setting users who stay within budget | > 50% |
| Drive habitual use | Weekly active users / monthly active users | > 40% |
| Retain users past onboarding | Day-30 retention | > 25% |
| Make old expenses easy to find | Search/filter usage frequency | Tracked from launch |
| Prove monetization path (later phase) | Free-to-paid conversion (premium tier) | > 5% by month 6 post-monetization |

---

## 3. Target Users

**Primary:** Budget-conscious individuals (25–45) who want visibility into spending without manual bookkeeping, and who want to manually track their own personal spending.

**Secondary:** Couples/households managing shared expenses (Phase 2+).

**Tertiary:** Freelancers/gig workers tracking expenses loosely tied to tax deductions — not full accounting (see Out of Scope).

**Not for V1:** Teams or families sharing one account, businesses, advanced investment/finance tracking.

---

## 4. Scope

### 4.1 In-Scope (V1 / MVP)

1. **User Authentication & Data Isolation**
   - Email & Password Registration & Login (BCrypt hashed passwords)
   - Google Sign-In (OAuth 2.0 / OpenID Connect ID token verification)
   - Secure JWT Architecture: Short-lived Access Tokens (15 min) + Long-lived Refresh Tokens (7 days)
   - Refresh Token Rotation & Server-side Revocation stored in SHA-256 hashed database table
   - HttpOnly, SameSite, Secure Cookie storage for Refresh Tokens
   - Single-device Logout & Logout from All Devices / Sessions
   - Forgot Password & Reset Password workflows
   - Account Password Change for authenticated users
   - **Strict User Data Isolation**: Every resource (expenses, categories, budgets) bound to authenticated `user_id` derived from validated JWT. No user can access or modify another user's data.
   - Default Starter Categories seeded dynamically for every newly registered user.
2. **Expense Entry & CRUD**
   - Full Create / View / Edit / Delete on expenses
   - Fields: Title, Category, Amount (₹, 2 decimal places), Date (defaults to today), Notes (optional), Payment Mode (optional — Cash, Card, UPI)
3. **Categorization**
   - Categories the user creates and manages themselves (dynamic, user-isolated)
   - Default starter categories (Food, Transport, Utilities, Entertainment, Housing, Miscellaneous) seeded upon account registration
4. **Dashboard & Insights**
   - Total spend (overall and current month)
   - Recent-expenses snapshot
   - Pie/donut chart — spending by category
   - Bar/line chart — spending over time
   - Daily/weekly/monthly report views
   - Month-over-month comparison with % change
   - Top categories by spend, ranked
5. **Budgets**
   - Overall monthly budget goal and per-category limits
   - Live remaining-balance tracking as expenses are added
   - Status indicator: on track / near limit / over budget
6. **Search, Filter & Sort** (usable together)
   - Search by title or notes text
   - Filter by date range, category, amount range, payment mode
   - Sort by amount, date, or category
7. **Navigation**
   - Navigation header with Dashboard, Expenses, Categories, Budgets, Reports, User Profile Avatar, and Logout controls
8. **Validation & Security States**
   - Amount must be a positive number
   - Date cannot be in the future
   - Title required, max 50 characters
   - Password strength enforcement (min 8 chars, uppercase, lowercase, number, special char)
   - Auth Rate Limiting to prevent brute-force login and reset attempts
   - Empty, loading, error, and unauthenticated/unauthorized states for all screens
9. **Data Export**
   - CSV/PDF/Excel export of user-isolated filtered or full expense data

### 4.2 Post-MVP / Phase 2+ Candidates
- Multi-device sync push notifications
- Income tracking
- Recurring/auto-scheduled expenses (rent, subscriptions, EMI)
- Receipt photo capture with OCR-assisted amount/merchant extraction
- Bank/card/UPI/SMS auto-import via a secure aggregator, with auto-categorization and manual override
- Multiple wallets/accounts (cash, bank, card)
- Multi-currency support for users who spend/travel across currencies
- Notifications: budget threshold alerts, weekly/monthly summary digest
- Shared household budgets with multi-user permissions (RBAC)
- Goal-based savings tracking
- Split expenses (roommates/friends)
- AI-based spend prediction and auto-categorization
- Calendar heatmap of spend, year-view trends
- Biometric/PIN app-lock, cloud backup, custom themes/dark mode
- Premium tier: advanced analytics, unlimited bank connections, tax-category tagging

### 4.3 Out of Scope (V1)
- Shared household accounts / Role-based Access Control (RBAC) (single-user ownership per account in V1)
- Multiple currencies (single fixed currency — ₹/INR — in V1)
- Bank / UPI / SMS auto-import
- Income tracking
- Notifications / reminders
- Recurring or auto-scheduled expenses
- Full double-entry accounting / bookkeeping for businesses
- Investment portfolio tracking
- Tax filing or tax-form generation
- Bill pay / money movement — this is a tracker, not a payments product
- Dedicated native mobile app (V1 is a responsive web app with PWA support)

---

## 5. Functional Requirements & User Stories

### 5.1 Navigation

| ID | Requirement | Priority | User Story |
|---|---|---|---|
| FR-1 | Hamburger menu with two sections: **Dashboard** (view-only summary) and **Expenses** (add/edit/delete/search/filter/sort) | P0 | As a user, I want a simple hamburger menu so I can move between my Dashboard and my Expenses easily. |

### 5.2 Expense Fields & Validation

| Validation Rule | Why |
|---|---|
| Amount must be a positive number | Prevents bad data from skewing totals and charts |
| Date cannot be in the future | Keeps the log honest to actual spending |
| Title is required, max 50 characters | Keeps expense list scannable |

### 5.3 Expense CRUD

| ID | Action | Description | Priority | User Story |
|---|---|---|---|---|
| FR-2 | Add | Create a new expense entry | P0 | As a user, I want to quickly add an expense so that logging spending doesn't feel like a chore. |
| FR-3 | View | See all logged expenses in a paginated list | P0 | As a user, I want to view my past expenses so I can review my spending history. |
| FR-4 | Edit | Update any field of an existing expense | P0 | As a user, I want to edit my past expenses so my records stay accurate. |
| FR-5 | Delete | Remove an expense, with a confirmation step to avoid deleting by mistake | P0 | As a user, I want to delete an expense (with confirmation) so I don't lose data by accident. |

### 5.4 Category Management

| ID | Action | Description | Priority | User Story |
|---|---|---|---|---|
| FR-6 | Create | Add a new category by name while logging an expense, or from a category list | P0 | As a user, I want to create my own categories so my spending is organized the way I actually think about it. |
| FR-7 | Edit | Rename an existing category | P0 | As a user, I want to rename a category so I can keep my organization consistent over time. |
| FR-8 | Delete | Remove a category — only if unused, or reassign/cascade linked expenses with a warning | P0 | As a user, I want to safely delete a category without accidentally losing or orphaning expense data. |
| FR-9 | View | See the list of categories along with how many expenses use each one | P1 | As a user, I want to see how many expenses are in each category so I understand my category usage. |
| FR-10 | Default Categories | Ship with a few common starter categories so the app isn't empty on first use | P2 | As a new user, I want to see some starter categories so the app feels usable from day one. |

### 5.5 Search, Filter & Sort

All capabilities below work together (e.g. filter by "Food" category, then sort by highest amount).

| ID | Capability | Details | Priority | User Story |
|---|---|---|---|---|
| FR-11 | Search | By title or notes text | P1 | As a user, I want to search my expenses by title or note so I can quickly find a specific transaction. |
| FR-12 | Filter — Date Range | e.g. this week, this month | P0 | As a user, I want to filter expenses by date range so I can review a specific period. |
| FR-13 | Filter — Category | Isolate spend on a specific category | P0 | As a user, I want to filter by category so I can see how much I spent in one area. |
| FR-14 | Filter — Amount Range | Narrow down to a spend bracket | P1 | As a user, I want to filter by amount range so I can find larger or smaller transactions. |
| FR-15 | Filter — Payment Mode | Separate cash vs card vs UPI spend | P1 | As a user, I want to filter by payment mode so I can see how I paid for things. |
| FR-16 | Sort | By amount, date, or category | P1 | As a user, I want to sort my expenses so I can quickly scan the highest, most recent, or grouped entries. |

### 5.6 Dashboard

| ID | Requirement | Why | Priority | User Story |
|---|---|---|---|---|
| FR-17 | Total amount spent (overall, and current month by default) | The single most-asked question: "how much did I spend?" | P0 | As a user, I want to see my total spend so I immediately know where I stand. |
| FR-18 | Quick view of recent expenses | Snapshot without opening the full list | P0 | As a user, I want to see my recent expenses on the dashboard so I don't need to open the full list every time. |
| FR-19 | Pie/donut chart — spending by category | Instantly shows where money is going | P0 | As a user, I want to see a category breakdown chart so I know where my money is going. |
| FR-20 | Bar/line chart — spending over time | Reveals patterns and spikes across days/months | P0 | As a user, I want to see my spending trend over time so I can spot patterns or spikes. |
| FR-21 | Budget status vs goal | Turns the dashboard into a budgeting tool, not just a log | P0 | As a user, I want to see my budget status on the dashboard so I know if I'm on track. |
| FR-22 | Daily/Weekly/Monthly report views | Lets the user analyze spending across different time periods | P0 | As a user, I want to view my expenses broken down by day, week, and month so I can analyze my habits over different periods. |
| FR-23 | Month-over-month comparison with % change | Tells the user if they're improving or not | P1 | As a user, I want to compare this month to last month so I know if I'm improving. |
| FR-24 | Top categories by spend, ranked | Surfaces the biggest spending areas without digging | P1 | As a user, I want to see my top spending categories so I know where to cut back. |
| FR-25 | Average daily/weekly spend | Gives a normalized sense of spending pace | P2 | As a user, I want to see my average spend so I can gauge my daily/weekly pace. |
| FR-26 | Simple anomaly flags (e.g. "You spent 2x more on dining this week") | Surfaces meaningful changes without the user hunting for them | P2 | As a user, I want to be alerted to unusual spending spikes so I notice them right away. |

### 5.7 Budget / Spending Goal

The user can set a spending goal (a monthly limit, or a per-category limit). The app automatically shows total spent so far in that period, remaining budget (Goal − Spent), and a simple status. The user can update the goal anytime, and everything updates instantly.

| ID | Requirement | Priority | User Story |
|---|---|---|---|
| FR-27 | Set an overall monthly budget goal and per-category budget limits | P0 | As a user, I want to set a budget goal so I can catch overspending early. |
| FR-28 | Live remaining-balance tracking as expenses are added | P0 | As a user, I want to see my remaining budget update live as I add expenses so I always know where I stand. |
| FR-29 | Alert/status indicator when nearing or exceeding a limit (e.g. 80%, 100% thresholds) | P1 | As a user, I want to be warned when I'm close to or over a budget limit so I can adjust my spending in time. |

*Why this matters: this turns the app from "just a log" into a real budgeting tool — this is the heart of V1.*

### 5.8 Data Export (Nice-to-Have)

| ID | Requirement | Why | Priority | User Story |
|---|---|---|---|---|
| FR-30 | Export expenses (filtered or full) as CSV/PDF/Excel | Backup and analysis outside the app | P2 | As a user, I want to export my expenses so I can back them up or analyze them outside the app. |

### 5.9 Data Integrity Principle

| ID | Requirement | Priority | User Story |
|---|---|---|---|
| FR-31 | No hardcoded/demo data at any stage — all data is dynamically created, stored, and fetched from the real data layer | P0 | As a new user, I want to see an honest empty state built from real, dynamically generated data, so the app reflects my actual usage from day one. |

---

## 6. Key User Flows

| Flow | Steps |
|---|---|
| 🟢 Add an expense | Expenses → Add New → Fill form (pick or create a category) → Save → Expense appears in list, dashboard totals update |
| 🟢 Check spending | Dashboard → See total spent, charts, and budget status |
| 🟢 Find a past expense | Expenses → Search / Filter / Sort → Find it → Edit or Delete |
| 🟢 Set a budget goal | Set spending limit → Dashboard shows remaining balance, updates live as expenses are added |

---

## 7. Non-Functional Requirements

### 7.1 Performance
- App cold start: < 2 seconds on mid-tier devices
- Expense entry save (offline-first, local write): < 200ms perceived latency
- Dashboard/chart rendering with up to 5 years of data: < 1.5 seconds
- Dashboard and reports must load with real, database-driven data (no hardcoded/static values) at any data volume

### 7.2 Scalability
- Architecture should support later phases (Section 9) without major rework
- Backend must ultimately support scaling to 5M+ registered users and 50M+ transactions/month without an architecture rewrite (post-monetization horizon)
- Any future ingestion pipeline (e.g. bank-sync batch imports) must handle burst loads via queuing, not synchronous processing

### 7.3 Security & Privacy
- Biometric/PIN app-lock required for app access after inactivity (from the phase login is introduced)
- All financial data encrypted at rest (AES-256) and in transit (TLS 1.2+), once networked/cloud-backed
- Bank credentials, if/when connected, are never stored directly — delegated to a certified aggregation partner (tokenized access only)
- Role-based access control for shared/household accounts (Phase 3+)
- No sale of user financial data to third parties; clear, explicit consent flows for any data-sharing features
- Regular third-party penetration testing (at least annually) once publicly deployed

### 7.4 Compliance
- GDPR / CCPA compliance for data access, export, and deletion requests once user accounts exist
- PCI-DSS alignment for any payment-adjacent data handling (Phase 6 monetization)
- SOC 2 Type II readiness within 12 months of public launch (required for future B2B/partner integrations)
- Financial data retention and deletion policies clearly documented and enforced

### 7.5 Reliability & Availability
- Each phase must be fully functional (run → test → deploy) before the next phase begins
- 99.9% uptime SLA for core logging functionality, once publicly hosted
- Offline-first architecture: manual expense entry must work with zero connectivity and sync when back online
- Automated daily backups with point-in-time recovery (RPO < 1 hour, RTO < 4 hours), once cloud-hosted

### 7.6 Usability & Accessibility
- WCAG 2.1 AA compliance for all core flows
- Support for screen readers
- Minimum tap-target size and color-contrast standards for financial figures (critical for readability)
- Localization-ready architecture (strings externalized) even though V1 ships in a single locale/currency

### 7.7 Data Integrity
- No hardcoded or dummy data in any phase — all data (expenses, categories, budgets, reports) must be dynamically created, stored, and fetched from the actual data layer
- Idempotent transaction import (no duplicate entries on re-sync), once auto-import exists
- Audit trail for any auto-categorization changes or budget edits
- Currency conversion rates, once multi-currency exists, sourced from a reliable, timestamped provider and logged for consistency

### 7.8 Maintainability
- Modular service architecture separating: ingestion, categorization, budgeting logic, notification service (as these are introduced)
- Categorization engine (rules-based, later ML-assisted) must be updatable without full app releases
- Comprehensive logging/observability (error rates, sync failures, latency) with alerting

### 7.9 Interoperability
- Open export formats (CSV, JSON/PDF) so users are never locked in
- API-ready design to support future integrations (accounting tools, tax software) without re-architecture

### 7.10 Deployment (V1)
- Local or private deployment — no public internet exposure planned for V1, since there is no login/auth layer yet
- Testability: every feature/module must be independently testable before deployment

---

## 8. Definition of Done (V1)

- User can Add, View, Edit, and Delete expenses
- Categories are dynamic — user can create, edit, and delete their own
- Dashboard shows total spend, a recent-expenses snapshot, and at least 2 charts
- Expenses section supports search + at least 2 filters + at least 2 sort options, usable together
- User can set a budget goal and see a live remaining balance with status (on track / near limit / over budget)
- Hamburger menu navigation works between Dashboard and Expenses
- Amount and date fields are validated (positive amount, no future dates)
- No hardcoded/demo data anywhere in the app — all data is live and dynamic
- Deployed and tested end-to-end before moving to Phase 2

---

## 9. Roadmap — Phase-Wise

| Phase | Theme | Features | Run-Test-Deploy Requirement |
|---|---|---|---|
| **Alpha** | Core build-out | Manual entry, categorization, budgets, dashboard | Build with live data layer, unit + integration test |
| **Beta** | Sync & offline | Offline support hardening, early bank-sync groundwork, notifications groundwork | Feature-tested against real stored data |
| **Phase 1 (V1 / GA)** | Core Loop | Full expense CRUD, dynamic categories, dashboard with charts, search/filter/sort, budget goal with live balance, hamburger navigation, accessibility pass, hardened security baseline | Deployed as standalone working app |
| **Phase 2** | Login, Sync & Convenience | Login & multi-device sync, income tracking, recurring expenses (rent, subscriptions, EMI), receipt photo upload + OCR, multiple wallets/accounts, report export (PDF/Excel/CSV), dark mode | Each feature tested against real stored data, deployed as an update to Phase 1 app |
| **Phase 3** | Social/Sharing | Split expenses (roommates/friends), shared household budgets, multi-user/family accounts with role-based access | Multi-user data flow tested for accuracy before deployment |
| **Phase 4** | Smart & Advanced | Savings goals, multi-currency support, bank/UPI/SMS auto-import (secure aggregator), auto-categorization (ML-assisted), budget notifications, calendar heatmap, year-view trends | AI/ML and integration modules tested independently, deployed with monitoring |
| **Phase 5** | Security & Personalization | Biometric lock, cloud backup, custom themes, reminders/notifications | Security features tested for edge cases (failed auth, sync conflicts) before deployment |
| **Phase 6** | Monetization | Free vs. Premium plans (advanced analytics, unlimited bank connections, tax-category tagging), ads on free tier | Payment/subscription flow tested in sandbox before production deployment |

---

## 10. Risks & Open Questions

| Risk | Impact | Mitigation |
|---|---|---|
| Scope creep — later-phase features pulled into V1 | Delayed MVP ship | Enforce Section 4.3 Out-of-Scope list strictly for V1 |
| Users abandon manual logging | Core value prop fails | Prioritize speed of entry as the primary retention lever; auto-sync as an accelerant, not a dependency |
| Data accuracy risk if dummy/test data isn't fully replaced before deployment | Users see broken or misleading numbers | Enforce "no hardcoded data" principle (FR-31) end to end, verified pre-deploy |
| Bank aggregation partner outages (Phase 4+) | Users lose auto-sync trust | Robust manual entry fallback; clear sync-status UI |
| Auto-categorization inaccuracy (Phase 4+) | User distrust, correction fatigue | Start with conservative rules-based categorization, iterate with ML using correction feedback |
| Regulatory complexity for multi-region financial data (later phases) | Delayed launch in some markets | Phase geographic rollout, starting with lower-regulatory-burden markets |
| Security risk once login/multi-device sync is introduced (Phase 2+) | Exposure of financial data | Auth and encryption reviewed and tested each phase before release |

**Open questions for stakeholder input:**
- Which bank aggregation partner (build vs. buy) — cost and coverage tradeoffs?
- Is household/shared budgeting a Phase 2 or Phase 3 priority?
- What's the monetization model at launch — freemium from day one, or free-only until retention is proven?
- Should V1 include data export as a stretch goal, or defer entirely to Phase 2?

---

## 11. Assumptions

- Single-user app in V1 — no login needed
- One fixed currency (₹/INR) — no multi-currency support in V1
- Budget goal defaults to monthly
- Expense date should be today or earlier (not future-dated)
- Local or private deployment for V1 (no public internet exposure)

---

## 12. Dependencies

- Database/backend for persistent storage of expenses, categories, budgets
- Charting library for dashboard visualizations (pie/donut + bar/line)
- Authentication mechanism (introduced Phase 2 onward — PIN, later biometric)
- Export library for CSV/PDF/Excel (V1 nice-to-have, full support Phase 2)
- Secure account-aggregation partner for bank/UPI/SMS auto-import (Phase 4)
- Notification system (budget alerts, reminders — Phase 5)
- Payment gateway (Phase 6, for premium plans)

---

## 13. Stakeholders

- Product Owner
- Development Team
- QA/Testing Team
- End Users (primary feedback source for each phase)

---

## 14. Timeline

| Phase | Estimated Duration |
|---|---|
| Alpha | 8 weeks |
| Beta | +6 weeks |
| Phase 1 (V1 / GA) | +4 weeks |
| Phase 2 | To be defined post-GA review |
| Phase 3 | To be defined post Phase 2 review |
| Phase 4 | To be defined post Phase 3 review |
| Phase 5 | To be defined post Phase 4 review |
| Phase 6 | To be defined post Phase 5 review |

*Note: Each phase's timeline should only be finalized after the previous phase is successfully run, tested, and deployed.*

---

## 15. Appendix

Glossary, wireframes, and technical architecture diagrams to be linked as they're produced by design/engineering.
