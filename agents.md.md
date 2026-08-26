# FinTrack — AGENTS.md

## Core Rules
- Follow the PRD and SRS as the source of truth.
- Stay within approved V1 scope.
- Do not invent or silently change requirements.
- Ask for approval before changing architecture, stack, folder structure, dependencies, database schema, API contracts, or major UI behavior.
- Start project-related work with **“Om Bhai”** and finish with **“Over n Out”**.

## Architecture
- Use **Next.js → FastAPI → PostgreSQL**.
- Frontend must never access PostgreSQL directly.
- Keep API routes/controllers thin; business logic belongs in services.
- Database access belongs in repositories.
- Keep frontend API communication inside the centralized API/service layer.
- Preserve the approved project structure and separation of concerns.

## Environment & Security
- Keep configuration environment-variable driven.
- Never hardcode secrets, credentials, passwords, tokens, API keys, database URLs, or environment-specific values.
- Never commit `.env`, `.env.local`, or real secrets.
- Do not expose secrets in client code or logs.
- Keep `.env.example` updated with placeholder values.
- Treat `NEXT_PUBLIC_*` values as public.
- Do not expose internal errors, stack traces, or sensitive configuration.

## Code Quality
- Prefer reusable components, services, utilities, and shared constants.
- Avoid duplicated configuration, validation rules, constants, and UI values.
- Keep functions/components focused and reasonably small.
- Do not add unnecessary dependencies.
- Do not use inline or unnecessary one-off styling.
- Follow the existing Design System and styling system.

## API & Validation
- Follow the SRS API contract exactly: endpoints, methods, parameters, request/response shapes, validation, status codes, and error formats.
- Use FastAPI/Pydantic as the backend contract.
- Keep OpenAPI/Swagger accurate.
- Use a centralized typed frontend API client.
- Do not invent undocumented API behavior.
- Validate frontend data with **React Hook Form + Zod**.
- Validate again with **Pydantic**; backend validation is authoritative.
- Prevent duplicate submissions.
- Warn before losing unsaved changes.
- Require confirmation for destructive actions.

## Database & Data Integrity
- Use **PostgreSQL** with **SQLAlchemy 2.0 async + asyncpg**.
- Use **Alembic** for every schema change; never modify schema manually.
- Review generated migrations.
- Preserve SRS constraints, relationships, indexes, unique constraints, and deletion rules.
- Never use floating-point arithmetic for monetary values.
- Never use fake, demo, mock, or placeholder financial data.
- Seed only approved starter categories.
- Never seed expenses or budgets.
- Seeds must be idempotent.
- Derived financial values must use real database data as required by the SRS.

## UI/UX & Accessibility
- Build a production-quality, mobile-first responsive UI.
- Support mobile, tablet, laptop, desktop, and large screens.
- Avoid unintended horizontal overflow.
- Follow centralized design tokens and reusable components.
- Provide applicable loading, empty, validation-error, system-error, and retry states.
- Use consistent currency formatting.
- Use semantic HTML, keyboard navigation, visible focus states, appropriate ARIA, and sufficient contrast.
- Do not rely on color alone for financial/status information.
- Respect `prefers-reduced-motion`.

## Animation & 3D
- Use **Framer Motion** intentionally and sparingly.
- Animations must be short, subtle, non-blocking, and never delay business/API actions.
- Use meaningful micro-interactions for important state changes.
- 3D is optional and must never affect core functionality.
- Lazy-load heavy/3D modules and provide a WebGL fallback.

## Performance
- Prefer Next.js Server Components where appropriate.
- Use Client Components only when interactivity requires them.
- Use **TanStack Query** for server-state caching, invalidation, loading, and errors.
- Avoid duplicate API requests.
- Lazy-load non-critical/heavy modules.
- Avoid unnecessary re-renders, oversized assets, layout shifts, and blocking effects.
- Keep core functionality usable on mobile hardware and slower networks.

## Testing
- Every feature must be tested before completion.
- Backend: **Pytest + pytest-asyncio + httpx.AsyncClient**.
- Frontend: **Vitest + React Testing Library**.
- Critical flows: **Playwright**.
- Test success, failure, validation, edge cases, empty database, and real data.
- Verify responsive behavior, accessibility, reduced motion, slow-network behavior, and WebGL fallback where applicable.

## Run → Test → Deploy
- Follow the PRD's **Run → Test → Deploy** cycle.
- Do not proceed while the current stage is broken or untested.
- Run frontend and backend locally before deployment.
- Verify migrations from an empty database.
- Verify `/api/health` performs a real database connectivity check.
- Run the complete automated test suite before release.
- Use **GitHub Actions** as the quality gate.
- Deploy only from a passing pipeline.
- Perform production smoke tests after deployment.

## Git & Change Control
- Never commit or push without approval.
- Before committing, show what changed, why, and what was tested.
- Ask explicitly before pushing.
- Keep commits focused and meaningful.
- Do not overwrite or delete existing project work without approval.
- Keep documentation synchronized with approved changes.

## Stable V1 Release Gate
Do not declare **FinTrack Stable V1** until:
- Core CRUD flows work end-to-end with real PostgreSQL data.
- Required API endpoints are implemented and tested.
- Dashboard, charts, filters, sorting, categories, and budgets use real API data.
- No demo/mock financial data remains.
- Client and server validation pass.
- Loading, empty, error, and retry states work.
- Responsive, accessibility, and performance requirements are verified.
- Animation/3D fallback requirements are verified where applicable.
- Dockerized local setup works.
- Deployment connectivity and migrations are verified where deployed.
- `/api/health` verifies database connectivity.
- GitHub Actions lint/test pipeline passes.
- Secrets are absent from Git.
- Production smoke tests pass for:
  - Add → View → Edit → Delete expense
  - Category create → rename → delete/reassign
  - Search → filter → sort
  - Dashboard updates
  - Budget create → update → live status
- The complete automated test suite passes.
