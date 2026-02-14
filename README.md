# EventPlanner

Plataforma web para gestión de eventos: un organizador crea eventos, define campos personalizados de registro y administra participantes, estatus y reportes.

## Stack

- Backend: Node.js + Express + TypeScript
- Frontend: React (Vite) + TypeScript
- DB: PostgreSQL
- ORM: Prisma
- Infra (dev/prod): Docker + Docker Compose

## Requisitos

- Docker Desktop

## Estructura del repo

```
apps/
  api/   # Express + TS + Prisma
  web/   # React + Vite
docker/
  nginx/ # config nginx (web runtime)
docs/
  api.md
  architecture.md
docker-compose.local.yml
docker-compose.demo.yml
docker-compose.prod.yml
```

## Entornos

### 1) Local (dev)

Levanta DB + API (dev) + Web (dev):

```bash
docker compose -f docker-compose.local.yml up --build
```

URLs:

- Web: http://localhost:5173
- API health: http://localhost:3001/api/health

> En local, típicamente trabajas con hot reload (Vite + tsx watch).

---

### 2) Demo (modo showcase)

Levanta DB + API (runtime) + Web (runtime Nginx):

```bash
docker compose -f docker-compose.demo.yml up --build
```

URLs:

- Web: http://localhost:8080
- API health: http://localhost:3001/api/health

**Demo mode**

- `DEMO_MODE=true` ejecuta:
    - `prisma migrate deploy`
    - seed admin (best-effort)
    - seed demo (reset + seed)

---

### 3) Prod

Este repo incluye `docker-compose.prod.yml` como referencia. En producción:

- Usa **secrets reales**
- `COOKIE_SECURE=true`
- Define `WEB_ORIGIN` al dominio real
- Habilita `TRUST_PROXY=true` si hay reverse proxy (Nginx/Hostinger/etc.)

---

## Variables de entorno

### Local (`.env`)

Ejemplo mínimo:

```bash
POSTGRES_USER=eventplanner
POSTGRES_PASSWORD=eventplanner
POSTGRES_DB=eventplanner
DATABASE_URL=postgresql://eventplanner:eventplanner@db:5432/eventplanner

API_PORT=3001
WEB_PORT=5173
VITE_API_URL=http://localhost:3001
WEB_ORIGIN=http://localhost:5173

AUTH_ACCESS_TOKEN_SECRET=change-me-access
AUTH_REFRESH_TOKEN_SECRET=change-me-refresh
AUTH_ACCESS_TOKEN_TTL=15m
AUTH_REFRESH_TOKEN_TTL=7d

COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

### Demo (`.env.demo`)

```bash
POSTGRES_USER=eventplanner
POSTGRES_PASSWORD=eventplanner
POSTGRES_DB=eventplanner
DATABASE_URL=postgresql://eventplanner:eventplanner@db:5432/eventplanner?schema=public

AUTH_ACCESS_TOKEN_SECRET=dev_change_me_access
AUTH_REFRESH_TOKEN_SECRET=dev_change_me_refresh
```

### Prod (`.env.prod`)

- No se versiona. Usar secrets reales.

---

## Seguridad (resumen)

- Auth con cookies **httpOnly**
- CSRF token (cookie + header)
- CORS con `WEB_ORIGIN`
- Helmet + Rate limits + Request ID + logs

---

## Scripts útiles

Detener:

```bash
docker compose -f docker-compose.local.yml down
```

Reset total (borra DB local):

```bash
docker compose -f docker-compose.local.yml down -v
```

Ver logs:

```bash
docker compose -f docker-compose.demo.yml logs -f api
```

---

## Docs

- API: `docs/api.md`
- Arquitectura: `docs/architecture.md`
