# FinTrack — Personal Expense Tracker

FinTrack is a personal finance web application designed to help users log expenses effortlessly, categorize spending, analyze visual charts, and track a live monthly budget in INR (₹).

---

## 🏗 Architecture & Stack

- **Frontend**: Next.js (App Router), TypeScript, React Hook Form + Zod, TanStack Query, Recharts, Framer Motion, Dexie.js (IndexedDB).
- **Backend**: FastAPI (Python 3.12), Pydantic v2, SQLAlchemy 2.0 (asyncpg), Alembic migrations.
- **Database**: PostgreSQL (managed via Supabase or local Docker).

---

## 📁 Repository Structure

```
d:\Fintrack/
├── Docs/                  # PRD (v2.0) and SRS (v1.0) documentation
├── backend/               # FastAPI Backend service
│   ├── alembic/           # Database migration scripts
│   ├── app/               # Application code (api, services, repositories, models, schemas)
│   └── tests/             # Pytest suite
├── frontend/              # Next.js Frontend application
│   ├── src/               # React components, pages, hooks, services, types
│   └── tests/             # Vitest suite
├── docker-compose.yml     # Local Docker environment setup
└── agents.md.md           # Project guidelines & execution rules
```

---

## 🚀 Quick Start (Local Setup)

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📜 Governance
All development follows the guidelines in [`agents.md.md`](file:///d:/Fintrack/agents.md.md).
