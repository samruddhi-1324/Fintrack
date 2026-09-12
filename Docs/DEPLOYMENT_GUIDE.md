# FinTrack — Render & Supabase Deployment Guide
**Author:** Samruddhi  
**Stack:** FastAPI (Backend on Render) + PostgreSQL (Database on Supabase) + Next.js / Android (Clients)

---

## Step 1: Set Up Supabase PostgreSQL Database

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com/) and sign in.
   - Click **"New Project"**, name it `fintrack`, set a secure database password, and choose your preferred region.

2. **Get the Database Connection String:**
   - In Supabase Dashboard, navigate to **Project Settings** → **Database** → **Connection string**.
   - Select **URI** mode:
     - **Session Pooler (Port 5432)** or **Transaction Pooler (Port 6543 - Recommended)**:
       ```
       postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
       ```
   - Make sure to replace `[YOUR-PASSWORD]` with your real database password.

---

## Step 2: Deploy Backend to Render

### Option A: Using Render Web Service (Recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your Git repository (`Fintrack`).
3. Configure settings:
   - **Name:** `fintrack-backend`
   - **Region:** Choose closest to your Supabase region (e.g. `Oregon (US West)` or `Singapore`).
   - **Branch:** `main` (or your active branch).
   - **Runtime:** **Docker** (Render will use [`backend/Dockerfile`](file:///d:/Fintrack/backend/Dockerfile)).
     - *Or if using Python native:*
       - **Root Directory:** `backend`
       - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
       - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables** in Render Dashboard:

| Variable | Value / Description |
|---|---|
| `ENVIRONMENT` | `production` |
| `DATABASE_URL` | `postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres` |
| `JWT_SECRET_KEY` | `(Generate a 32+ character random string or click Generate)` |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `CORS_ORIGINS` | `http://localhost:3000,https://your-frontend-domain.vercel.app` |
| `AI_PROVIDER` | `gemini` (or `rule_based` / `openai`) |
| `GEMINI_API_KEY` | `your_google_gemini_api_key` |
| `EMAIL_PROVIDER` | `console` (or `smtp` / `resend`) |

5. Click **Create Web Service**.
6. Render will build the Docker container, automatically execute `alembic upgrade head` to apply all database tables to Supabase, and start FastAPI!

---

### Option B: Using `render.yaml` (Blueprint)

1. In Render Dashboard, click **New +** → **Blueprint**.
2. Connect your `Fintrack` repository. Render will automatically read the [`render.yaml`](file:///d:/Fintrack/render.yaml) file at the root.
3. Fill in the requested `DATABASE_URL` (Supabase URI) and `GEMINI_API_KEY`.
4. Click **Apply**.

---

## Step 3: Run Migrations Locally (Optional / Direct)

If you want to migrate your Supabase database directly from your local machine:

1. Open `backend/.env` and update:
   ```env
   DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ASYNC_DATABASE_URL=postgresql+asyncpg://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
2. Run alembic upgrade:
   ```powershell
   cd backend
   .\.venv\Scripts\alembic.exe upgrade head
   ```
3. Your Supabase database tables (`users`, `categories`, `expenses`, `budgets`, etc.) are now fully created with initial seed data!

---

## Step 4: Connect Clients to Deployed Render Backend

Once Render gives you your public URL (e.g. `https://fintrack-backend.onrender.com`):

### 1. Android App:
- In the FinTrack Android app, open **Settings** ⚙️.
- Under **API Server URL**, enter:
  ```
  https://fintrack-backend.onrender.com/api/v1/
  ```
- Tap **Save & Apply** (or update [`Constants.kt`](file:///d:/Fintrack/android/app/src/main/kotlin/com/fintrack/app/utils/Constants.kt)).

### 2. Next.js Frontend:
- Update `frontend/.env.local` / Vercel Environment Variables:
  ```env
  NEXT_PUBLIC_API_BASE_URL=https://fintrack-backend.onrender.com/api/v1
  ```
