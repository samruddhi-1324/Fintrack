# FinTrack — Complete Features Specification & Documentation
**Project Owner / Lead Developer:** Samruddhi  
**Stack:** Next.js 14 (App Router) → FastAPI (Python 3.14 async) → PostgreSQL (SQLAlchemy 2.0 async + asyncpg)

---

## 🌟 Table of Contents
1. [Core Financial & Expense Management](#1-core-financial--expense-management)
2. [Category Management & Reassignment](#2-category-management--reassignment)
3. [Budgeting & Spending Goals](#3-budgeting--spending-goals)
4. [Interactive Dashboard & Analytics](#4-interactive-dashboard--analytics)
5. [AI Financial Intelligence Suite](#5-ai-financial-intelligence-suite)
6. [Authentication & Security](#6-authentication--security)
7. [UI/UX, Performance & PWA](#7-uiux-performance--pwa)
8. [Testing & Quality Assurance](#8-testing--quality-assurance)

---

## 1. Core Financial & Expense Management

* **Full CRUD Operations**:
  * **Add Expense**: Log transactions with title, exact amount, date, payment mode, and category.
  * **Edit Expense**: Real-time update of existing expense items.
  * **Delete Expense**: Instant deletion with confirmation safeguards to prevent accidental data loss.
  * **View Details**: Clean transaction details modal with payment mode indicators.
* **Smart Filtering & Search**:
  * **Real-time Keyword Search**: Search expenses by title or notes.
  * **Category Filter**: Filter expenses by one or multiple categories.
  * **Payment Mode Filter**: Filter by `UPI`, `Card`, or `Cash`.
  * **Date Range Picker**: Filter by Custom Date ranges, Current Month, or Past Months.
  * **Multi-column Sorting**: Sort transactions by Date (Newest/Oldest) or Amount (Highest/Lowest).
* **Data Portability**:
  * **CSV Export**: Export filtered or all transaction records into CSV files for accounting.
  * **CSV Bulk Import**: Bulk import transactions with validation and category mapping.
* **Pagination & Skeleton Loaders**:
  * Responsive server/client pagination with shimmer loading states.

---

## 2. Category Management & Reassignment

* **Default Starter Categories**:
  * Automatically seeds baseline categories on user creation (`Food & Dining`, `Transportation`, `Utilities`, `Entertainment`, `Housing`, `Miscellaneous`).
* **Custom Categories**:
  * Create custom categories with custom color palettes and icons/emojis.
* **Rename & Edit**:
  * Modify existing category labels without losing expense history.
* **Safe Deletion & Reassignment**:
  * Prevents orphaned records: When deleting a category, prompts the user to reassign its associated expenses to an alternative category.

---

## 3. Budgeting & Spending Goals

* **Overall Monthly Budget**:
  * Set a total spending ceiling for the calendar month with live progress indicators.
* **Category-Specific Budgets**:
  * Configure specific spending limits per category (e.g. ₹2,500 for Food, ₹2,000 for Transport).
* **Daily Spending Limit**:
  * Real-time tracker for daily expenditures.
  * Shows **Today's Remaining Cap** vs **Spent Today** with warning badges when exceeded.
* **Visual Threshold Alerts**:
  * 🟢 **On Track** (`0% – 84%` utilized)
  * 🟡 **Near Limit** (`85% – 99%` utilized)
  * 🔴 **Over Budget** (`100%+` exceeded)

---

## 4. Interactive Dashboard & Analytics

* **Summary Metric Cards**:
  * Real-time Total Spend (Current Month vs Overall).
  * Real-time remaining budget balances and active daily limits.
* **Month-over-Month (MoM) Comparison Widget**:
  * Visual comparative percentage change against the previous calendar month.
* **Payment Mode Breakdown**:
  * Visual distribution charts and percentages for `UPI`, `Card`, and `Cash`.
* **Recent Transactions Snapshot**:
  * Quick-access feed of the latest transactions logged.

---

## 5. AI Financial Intelligence Suite

FinTrack includes a **Pluggable Multi-Provider AI Architecture** (Google Gemini 1.5, OpenAI ChatGPT, and Offline Rule-Based Fallback) with zero hardcoding and 100% environment-driven configuration.

### 5.1 Smart Real-Time Auto-Categorization ("✨ AI Suggest")
* Predicts the most accurate category for any expense title or merchant name in real-time as the user types.
* **UI**: Interactive "✨ AI Suggest" chip inside the expense form.

### 5.2 Natural Language "Smart Quick Add" (Sentence Parser)
* Parses plain natural-language sentences (e.g. *"Paid 450 for Domino's Pizza with UPI"*) into structured form fields (Title, Amount, Payment Mode, Category).
* **UI**: One-line NLP input box with instant form pre-fill.

### 5.3 AI Spending Insights & Savings Recommendations
* Analyzes 100% authentic PostgreSQL transaction aggregates to deliver personalized financial insights:
  * High-spend category flags (e.g. *"Transportation makes up 59.6% of your monthly expenditure"*).
  * Anomaly detection and spending trend alerts.

### 5.4 Intelligent Category Budget Recommendations
* Calculates dynamic 15% buffer recommendations from real category spend data.
* **UI**: 1-Click **"Apply Target →"** button that automatically opens the budget modal, pre-selects the category UUID, and fills the target amount.

### 5.5 AI Financial Mood & Emotional Sentiment Analysis (with Emojis)
* Context-aware emotional sentiment indicators across the Dashboard and Budget cards:
  * 😱 🚨 💸 **Distressed / Critical Overrun**: High budget excess warnings.
  * 😬 ⚠️ ⚡ **Cautious / Approaching Limit**: Near-limit warnings.
  * 🥳 💰 🎯 **Thriving / Disciplined**: On-track celebrations.
  * 🧘 🌟 💚 **Zen**: Clean financial balance.

### 5.6 AI Predictive Expense Forecasting & Burn Rate Analytics
* **Daily Burn Pace (`₹/day`)**: Measures spending velocity across elapsed days.
* **Projected Month-End Spend**: Forecasts total spending by the last day of the month.
* **Recommended Safe Daily Spending Cap**: Calculates the exact daily allowance for remaining days to avoid budget overrun.
* **Predicted Exhaustion Day**: Warns on which day of the month the budget will run out if the current pace continues.
* **Category Month-End Run Rates**: Projected month-end run rate per category.

### 5.7 AI Financial Health Score (0–100 Gauge & 4 Core Pillars)
Evaluates financial discipline across 4 weighted pillars:
1. **Budget Adherence (30 pts)**: Adherence to monthly spending ceilings.
2. **Daily Burn Velocity (25 pts)**: Daily spending rate vs safe allowance.
3. **Category Concentration Risk (25 pts)**: Checks if any single category absorbs >60% of expenditures.
4. **Month-over-Month Savings Progression (20 pts)**: Tracks spending growth or reduction against the previous month.
* **Output**: Overall Score (0–100), Letter Grade (`A+` to `D`), Tier Title (e.g. `🏆 Financial Master`), and **AI Actionable Score Booster Tips**.

---

## 6. Authentication & Security

* **JWT Authentication**:
  * Secure Access Tokens & Refresh Token Rotation.
  * Automatic token refresh on expiration.
* **Password Security**:
  * Strong hashing with Argon2 / bcrypt.
  * Secure Password Reset & Forgot Password workflow with token expiration via Email.
* **Strict Multi-Tenant User Isolation**:
  * Every database query is scoped strictly by `user_id`.
* **Zero Secrets in Code**:
  * 100% environment-driven settings (`.env.example` templates).

---

## 7. UI/UX, Performance & PWA

* **Design System**:
  * Dark luxury theme with glassmorphism, curated gradients, and responsive layouts.
  * Dynamic micro-animations using Framer Motion (non-blocking).
* **Mobile-First & PWA**:
  * Progressive Web App with Web App Manifest and Service Worker support for offline usage.
  * Responsive across mobile phones, tablets, laptops, and wide screens.
* **Data Reactivity**:
  * **TanStack Query (React Query)**: Automatic cache invalidation, instant optimistic UI updates, and background refetching.

---

## 8. Testing & Quality Assurance

* **Backend Test Suite**:
  * **Pytest + pytest-asyncio + httpx.AsyncClient**:
  * 100% automated test coverage across Authentication, Expenses, Categories, Budgets, Dashboard Analytics, and all AI features (`pytest tests/ -v`).
* **Frontend Verification**:
  * Clean TypeScript compilation and static build verification across all routes (`next build`).
