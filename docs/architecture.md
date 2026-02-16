# Arquitectura (MVP)

## Objetivo

EventPlanner permite crear eventos con un formulario de registro dinámico (campos por evento) y administrar inscripciones, estatus y reportes.

## Componentes

- **Web**: React + Vite + TypeScript
- **API**: Express + TypeScript
- **DB**: PostgreSQL
- **ORM**: Prisma

## Monorepo

- `apps/api`: API + Prisma schema/migrations + scripts (seed)
- `apps/web`: UI (Vite) + build runtime con Nginx
- `docker/nginx`: configuración de runtime de web

## Datos (alto nivel)

- `Event`: evento, cupo, publicación, requirement de contacto
- `EventField`: campos dinámicos del registro
- `Participant`: entidad global (puede estar en múltiples eventos)
- `Registration`: vínculo Event <-> Participant + status
- `RegistrationFieldValue`: valores por registro (JSON)
- `User`: usuarios admin
- `EventMember`: miembros por evento (EDITOR/VIEWER)
- `Session`: sesiones de refresh token (hash + expiración)

## Auth & Seguridad

- Cookies httpOnly (`ep_access`, `ep_refresh`)
- CSRF token (`ep_csrf`) + header `x-csrf-token`
- CORS basado en `WEB_ORIGIN` + `credentials: true`
- Helmet
- Rate limiting
- Request ID + logging
- `TRUST_PROXY=true` cuando estás detrás de proxy

## Entornos (Docker)

### Local (dev)

- `docker-compose.local.yml` usa targets `dev` (hot reload).

### Demo

- `docker-compose.demo.yml` usa targets `runtime` (build + run).
- `DEMO_MODE=true`:
    - `prisma migrate deploy`
    - seeds demo/admin

### Prod

- `docker-compose.prod.yml` es referencia:
    - secrets reales
    - `COOKIE_SECURE=true`
    - `WEB_ORIGIN` dominio real
    - opcional `TRUST_PROXY=true`

## Flujo típico

1. Admin login
2. Crea evento (capacidad + contactRequirement)
3. Define campos dinámicos (`EventField`)
4. Publica evento
5. Participante se registra vía public endpoints
6. Admin lista/filtra registrations y exporta reportes
   <>
