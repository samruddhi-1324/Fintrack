# FinTrack — Technical Architecture & Implementation Deep-Dive

**Project Owner / Lead Developer:** Samruddhi

This document outlines the technical architecture, design decisions, data contracts, security models, and key engineering fixes in **FinTrack**.

---

## 🏗️ 1. High-Level Architecture

```
[ Next.js 14 App Router ] <---> [ Axios / Fetch API ] <---> [ FastAPI v1 REST API ] <---> [ SQLAlchemy 2.0 Async ] <---> [ PostgreSQL ]
  (Port 3000)                                                    (Port 8000)                    (asyncpg)               (fintrack_db)
```

---

## 🗄️ 2. Database Schema & Entities (`backend/app/models/`)

### `users`
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255) (Indexed, Unique)
- `hashed_password`: VARCHAR(255) (Nullable for OAuth users)
- `full_name`: VARCHAR(100) (Nullable)
- `avatar_url`: VARCHAR(500) (Nullable)
- `is_active`: BOOLEAN (Default: True)
- `is_verified`: BOOLEAN (Default: False)
- `google_id`: VARCHAR(255) (Indexed, Unique, Nullable)
- `created_at`, `updated_at`: TIMESTAMP

### `refresh_tokens`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE)
- `token_hash`: VARCHAR(64) (SHA-256 hash, Indexed)
- `expires_at`: TIMESTAMP WITH TIMEZONE
- `is_revoked`: BOOLEAN (Default: False)
- `user_agent`: VARCHAR(500) (Nullable)
- `ip_address`: VARCHAR(45) (Nullable)
- `created_at`: TIMESTAMP

### `password_reset_tokens`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE)
- `token_hash`: VARCHAR(64) (SHA-256 hash, Indexed)
- `expires_at`: TIMESTAMP WITH TIMEZONE
- `is_used`: BOOLEAN (Default: False)
- `created_at`: TIMESTAMP

### `categories`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, Indexed)
- `name`: VARCHAR(30) (Unique per user)
- `is_default`: BOOLEAN (Default: False)
- `created_at`, `updated_at`: TIMESTAMP

### `expenses`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, Indexed)
- `category_id`: UUID (Foreign Key -> `categories.id`, ON DELETE RESTRICT)
- `title`: VARCHAR(50) (Indexed)
- `amount`: NUMERIC(10, 2) (Check Constraint: > 0)
- `date`: DATE (Indexed)
- `notes`: VARCHAR(250) (Nullable)
- `payment_mode`: VARCHAR(10) (`cash`, `card`, `upi`)
- `created_at`, `updated_at`: TIMESTAMP

### `budgets`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> `users.id`, ON DELETE CASCADE, Indexed)
- `category_id`: UUID (Nullable, Foreign Key -> `categories.id`, ON DELETE CASCADE)
- `amount`: NUMERIC(10, 2) (Check Constraint: > 0)
- `period`: VARCHAR(10) (Default: `monthly`)
- `created_at`, `updated_at`: TIMESTAMP

---

## 🔐 3. Authentication & Security Architecture

1. **JWT Session Model**:
   - **Access Token**: Short-lived (15 minutes), signed with `HS256`, transmitted in `Authorization: Bearer <token>` header.
   - **Refresh Token**: Long-lived (7 days), stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookie (`fintrack_refresh_token`).
   - **Token Rotation**: Every call to `/api/v1/auth/refresh` revokes the previous token hash and issues a new refresh token and cookie.
   - **Revocation Table**: Database stores SHA-256 token hashes. Reusing a revoked token triggers instant global session invalidation (`logout-all`).

2. **Google OAuth 2.0 / OpenID Connect**:
   - Google ID Tokens verified via `google.oauth2.id_token.verify_oauth2_token`.
   - Includes `clock_skew_in_seconds=600` (10-minute tolerance) and fallback to Google REST API `https://oauth2.googleapis.com/tokeninfo?id_token=...` to ensure system clock drift never breaks authentication.

3. **Strict User Data Isolation**:
   - Injected `get_current_user` FastAPI dependency across all endpoints (`expenses`, `categories`, `budgets`, `dashboard`, `reports`, `export`).
   - Every database query strictly filters by `Model.user_id == current_user.id`.

---

## 🛠️ 4. Critical Technical Fixes & Patterns

### A. React Hook Form Component Binding (`frontend/src/components/ui/Input.tsx`)
- **Fix**: Wrapped `Input` with `React.forwardRef<HTMLInputElement, InputProps>`, allowing input value registration and error focus.

### B. Timezone Date Validation (`frontend/src/lib/formatters.ts`)
- **Fix**: Implemented `getTodayLocalDateString()` using `d.getFullYear()`, `d.getMonth()`, `d.getDate()` to generate ISO dates in the user's local timezone.

### C. CORS Middleware (`backend/app/main.py`)
- **Fix**: Configured explicit origin array (`http://localhost:3000`, `http://127.0.0.1:3000`, etc.) with `settings.CORS_ORIGINS`.

### D. Next.js Suspense Boundary for Search Params (`frontend/src/app/reset-password/page.tsx`)
- **Fix**: Wrapped component reading `useSearchParams()` inside `<Suspense>` to comply with Next.js App Router static prerendering requirements.

---

## 🚀 5. Deployment Readiness Checklist

1. **Backend**:
   - Docker build: `docker build -t fintrack-backend ./backend`
   - Run command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Managed DB: Set `DATABASE_URL` and `ASYNC_DATABASE_URL` (SSL required).

2. **Frontend**:
   - Build command: `npm run build`
   - Environment variables: `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
