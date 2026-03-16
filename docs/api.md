# EventPlanner API

Base paths:

- API: `/api`
- Health: `GET /api/health`

## Convención de respuesta

Éxito:

```json
{ "ok": true, "data": {} }
```

Error (vía middleware):

```json
{ "ok": false, "error": { "code": "SOME_CODE", "message": "Readable message" } }
```

## Auth (cookies httpOnly + CSRF)

### Cookies

- `ep_access` (httpOnly) — access token
- `ep_refresh` (httpOnly) — refresh token
- `ep_csrf` (NO httpOnly) — token CSRF para enviar en header

### CSRF

Para requests “mutables” (POST/PUT/PATCH/DELETE) protegidos:

- header: `x-csrf-token: <valor de cookie ep_csrf>`

> En local y demo el navegador maneja cookies automáticamente si `credentials: true`.

---

## Public (sin login)

### Obtener evento público por slug

`GET /api/public/events/:slug`

Devuelve:

- datos del evento (incluye `remaining`)
- fields (campos dinámicos del formulario)

Ejemplo:

```bash
curl -s http://localhost:3001/api/public/events/demo-event
```

### Registro público

`POST /api/public/events/:slug/register`

Body:

```json
{
	"contact": { "email": "a@b.com", "phone": null },
	"answers": { "empresa": "ACME", "talla": "M" }
}
```

Ejemplo:

```bash
curl -s -X POST http://localhost:3001/api/public/events/demo-event/register   -H "Content-Type: application/json"   -d '{"contact":{"email":"a@b.com"},"answers":{"empresa":"ACME","talla":"M"}}'
```

Respuestas típicas:

- `201 CREATED` si se creó la inscripción
- `200 EXISTS` si ya existía
- `409 EVENT_FULL` si se llegó al cupo

---

## Auth (admin)

### Login

`POST /api/auth/login`

Body:

```json
{ "email": "admin@...", "password": "..." }
```

### Me

`GET /api/auth/me`
Devuelve el usuario autenticado (requiere cookie `ep_access` válida).

### Refresh

`POST /api/auth/refresh`
Renueva cookies usando `ep_refresh`.

### Logout

`POST /api/auth/logout`

---

## Demo (solo si DEMO_MODE=true)

> Estos endpoints deben estar deshabilitados en prod si no estás en modo demo.

- `POST /api/demo/reset` (interno) — resetea y siembra demo

---

## Events (admin)

### Listar eventos (scoped por membership)

`GET /api/events`

### Crear evento

`POST /api/events`

### Publicar / despublicar

`PATCH /api/events/:eventId/publish`
Body:

```json
{ "isPublished": true }
```

---

## Event Fields (admin)

Rutas:

- `GET /api/events/:eventId/fields`
- `PUT /api/events/:eventId/fields` (requiere CSRF)

---

## Event Members (admin)

- `GET /api/events/:eventId/members`
- `POST /api/events/:eventId/members`
- `PATCH /api/events/:eventId/members/:userId`
- `DELETE /api/events/:eventId/members/:userId`

Roles por evento:

- `EDITOR` (puede modificar)
- `VIEWER` (solo lectura)

---

## Registrations (admin)

- `GET /api/events/:eventId/registrations?page=&limit=&status=&q=`
- `PATCH /api/events/:eventId/registrations/:registrationId/status`

---

## Reports (admin)

- EXCEL export
- PDF export
