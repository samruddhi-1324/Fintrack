# FinTrack — Technical Architecture & Implementation Deep-Dive

**Om Bhai**

This document outlines the technical architecture, design decisions, data contracts, and key engineering fixes in **FinTrack**.

---

## 🏗️ 1. High-Level Architecture

```
[ Next.js 14 App Router ] <---> [ Axios / Fetch API ] <---> [ FastAPI v1 REST API ] <---> [ SQLAlchemy 2.0 Async ] <---> [ PostgreSQL ]
  (Port 3000)                                                    (Port 8000)                    (asyncpg)               (fintrack_db)
```

---

## 🗄️ 2. Database Schema & Entities (`backend/app/models/`)

### `categories`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Indexed)
- `name`: VARCHAR(30) (Unique per user)
- `is_default`: BOOLEAN (Default: False)
- `created_at`, `updated_at`: TIMESTAMP

### `expenses`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Indexed)
- `category_id`: UUID (Foreign Key -> `categories.id`, ON DELETE RESTRICT)
- `title`: VARCHAR(50) (Indexed)
- `amount`: NUMERIC(10, 2) (Check Constraint: > 0)
- `date`: DATE (Indexed)
- `notes`: VARCHAR(250) (Nullable)
- `payment_mode`: VARCHAR(10) (`cash`, `card`, `upi`)
- `created_at`, `updated_at`: TIMESTAMP

### `budgets`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Indexed)
- `category_id`: UUID (Nullable, Foreign Key -> `categories.id`, ON DELETE CASCADE)
- `amount`: NUMERIC(10, 2) (Check Constraint: > 0)
- `period`: VARCHAR(10) (Default: `monthly`)
- `created_at`, `updated_at`: TIMESTAMP

---

## 🛠️ 3. Critical Technical Fixes & Patterns

### A. React Hook Form Component Binding (`frontend/src/components/ui/Input.tsx`)
- **Issue**: Standard functional components without `React.forwardRef` drop `ref` passed by `{...register('name')}`.
- **Fix**: Wrapped `Input` with `React.forwardRef<HTMLInputElement, InputProps>`, allowing input value registration and error focus.

### B. Timezone Date Validation (`frontend/src/lib/formatters.ts`)
- **Issue**: `new Date().toISOString().split('T')[0]` computes date in UTC, leading to false-positive *"Transaction date cannot be in the future"* validation errors in non-UTC local timezones.
- **Fix**: Implemented `getTodayLocalDateString()` using `d.getFullYear()`, `d.getMonth()`, `d.getDate()` to generate ISO dates in the user's local timezone.

### C. CORS Middleware (`backend/app/main.py`)
- **Issue**: `allow_credentials=True` with wildcard `allow_origins=["*"]` fails browser preflight `OPTIONS` requests.
- **Fix**: Configured explicit origin array (`http://localhost:3000`, `http://127.0.0.1:3000`, etc.) with `allow_credentials=False` for dev endpoints.

---

## 🚀 4. Deployment Readiness Checklist

1. **Backend**:
   - Docker build: `docker build -t fintrack-backend ./backend`
   - Run command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Production DB: Set `DATABASE_URL` and `ASYNC_DATABASE_URL` to managed PostgreSQL connection string (SSL required).

2. **Frontend**:
   - Build command: `npm run build`
   - Environment variable: `NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api/v1`

**Over n Out**
