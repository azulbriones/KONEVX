# Technical Notes: Konevx

- Frontend: React 19 + Vite + TypeScript + MUI.
- Backend: Node.js + Express 5 + Prisma + PostgreSQL.
- Runtime contract: `/api`, cookies + CSRF, JSON envelope `{ ok, data | error }`.
- Repository shape: `apps/web` and `apps/api` are independent app roots; there is no root workspace manifest.
- Local startup: Docker Compose is the canonical full-stack path; per-app dev scripts are used when running without Docker.

## Conventions

- Types should prefer explicit DTOs over `any` at API/UI boundaries.
- Docs must describe the running contract, not aspirational architectures.
- Route and response changes must keep the browser-facing API base stable unless a breaking change is explicitly planned.
