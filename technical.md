# FinTrack — Technical Architecture & Implementation Deep-Dive

**Project Owner / Lead Developer:** Samruddhi

This document outlines the technical architecture, design decisions, data contracts, security models, and key engineering fixes in **FinTrack**.

---

## 🏗️ 1. High-Level Architecture

```
[ Next.js 14 App Router ] <----\
  (Web - Port 3000)              \
                                  +---> [ FastAPI v1 REST API ] <---> [ SQLAlchemy 2.0 Async ] <---> [ PostgreSQL ]
[ Android Native (Compose) ] <---/             (Port 8000)                    (asyncpg)               (fintrack_db)
  (Kotlin - Mobile App)
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
   - **Refresh Token**: Long-lived (7 days), stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookie on Web and Jetpack DataStore / `TokenManager` on Android Native.
   - **Token Rotation**: Every call to `/api/v1/auth/refresh` revokes the previous token hash and issues a new refresh token.
   - **Revocation Table**: Database stores SHA-256 token hashes. Reusing a revoked token triggers instant global session invalidation (`logout-all`).

2. **Google OAuth 2.0 / OpenID Connect**:
   - Google ID Tokens verified via `google.oauth2.id_token.verify_oauth2_token`.
   - Includes `clock_skew_in_seconds=600` (10-minute tolerance) and fallback to Google REST API `https://oauth2.googleapis.com/tokeninfo?id_token=...`.

3. **Strict User Data Isolation**:
   - Injected `get_current_user` FastAPI dependency across all endpoints.
   - Every database query strictly filters by `Model.user_id == current_user.id`.

---

## 📱 4. Android Native Architecture (`android/`)

1. **Tech Stack & Libraries**:
   - **Language**: Kotlin 1.9.22 + JDK 17 LTS (Eclipse Adoptium).
   - **UI Toolkit**: Jetpack Compose + Material 3.
   - **Navigation**: Jetpack Navigation Compose (Single Activity `MainActivity.kt`).
   - **Networking**: Retrofit 2 + OkHttp 3 with `AuthInterceptor` for automatic JWT Bearer injection and background 401 token refresh.
   - **State & Storage**: Kotlin Coroutines + `StateFlow` + Jetpack DataStore `TokenManager`.
   - **Hardware Integrations**: CameraX & Gallery picker for Receipt Vision OCR, Web/Android Speech recognizer for Voice Logging.

2. **Network Resilience & Connection**:
   - Supports Android Emulator (`http://10.0.2.2:8000/api/v1/`), USB reverse port forwarding (`http://localhost:8000/api/v1/`), and Wi-Fi LAN IP (`http://10.88.244.110:8000/api/v1/`).
   - Dynamic Server Configuration modal accessible directly from Login Screen and Settings.
   - `network_security_config.xml` enables cleartext HTTP traffic for development IPs.

3. **Build & Toolchain**:
   - Fully standalone Android SDK 34 (`platforms;android-34`, `build-tools;34.0.0`) in `android/sdk/` without requiring Android Studio.
   - Command-line Gradle builds: `.\gradlew.bat assembleDebug` produces `app-debug.apk` in ~7 seconds.

---

## 🛠️ 5. Critical Technical Fixes & Patterns

### A. Android Network Connection on Physical Device
- **Fix**: Configured `DEFAULT_BASE_URL` with Wi-Fi IPv4 (`http://10.88.244.110:8000/api/v1/`) and added `adb reverse tcp:8000 tcp:8000` to prevent 30,000ms connection timeouts on physical phones.

### B. React Hook Form Component Binding (`frontend/src/components/ui/Input.tsx`)
- **Fix**: Wrapped `Input` with `React.forwardRef<HTMLInputElement, InputProps>`, allowing input value registration and error focus.

### C. Timezone Date Validation (`frontend/src/lib/formatters.ts`)
- **Fix**: Implemented `getTodayLocalDateString()` using `d.getFullYear()`, `d.getMonth()`, `d.getDate()` to generate ISO dates in the user's local timezone.

### D. CORS Middleware (`backend/app/main.py`)
- **Fix**: Configured explicit origin array (`http://localhost:3000`, `http://127.0.0.1:3000`, etc.) with `settings.CORS_ORIGINS`.

---

## 🚀 6. Deployment & Build Commands

1. **Backend**:
   - Run command: `.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000`

2. **Android Native**:
   - Build APK: `cd D:\Fintrack\android && .\gradlew.bat assembleDebug`
   - USB Install: `& 'D:\Fintrack\android\sdk\platform-tools\adb.exe' install -r 'D:\Fintrack\android\app\build\outputs\apk\debug\app-debug.apk'`

3. **Web Frontend**:
   - Dev server: `cd D:\Fintrack\frontend && npm run dev`
