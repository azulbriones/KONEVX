# Guía de API: Konevx

Base: `/api`

## Salud

- `GET /api/health`

## Respuesta

- Éxito: `{ "ok": true, "data": ... }`
- Error: `{ "ok": false, "error": { "code": "...", "message": "...", "details?": ... } }`

## Auth (cookies + CSRF)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Eventos

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:eventId`
- `PATCH /api/events/:eventId`
- `DELETE /api/events/:eventId`
- `PATCH /api/events/:eventId/publish`

## Subrecursos de evento

- `GET /api/events/:eventId/fields`
- `GET /api/events/:eventId/registrations`
- `PATCH /api/events/:eventId/registrations/:registrationId`
- `PATCH /api/events/:eventId/registrations/:registrationId/check-in`
- `DELETE /api/events/:eventId/registrations/:registrationId/check-in`
- `POST /api/events/:eventId/registrations/quick`
- `GET /api/events/:eventId/registrations.xlsx`
- `GET /api/events/:eventId/registrations.pdf`
- `GET /api/events/:eventId/members`

## Público

- `GET /api/public/events/:slug`
- `POST /api/public/events/:slug/register`
