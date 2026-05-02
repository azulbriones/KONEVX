# Guía de API: Konevx v2.0 (Estándar PEI)

Rutas base:

- API: `/api/v2`
- Salud/Monitoreo: `GET /api/v2/health`

## Convención de Respuesta

Todas las respuestas siguen el sobre de resultados PEI:
Éxito: `{ "ok": true, "data": {}, "latency": "145ms" }`
Error: `{ "ok": false, "error": { "code": "ERR_CODE", "message": "Razón del error" } }`

---

## 1. Autenticación (Basada en Cookies + JWT)

Usamos cookies httpOnly para la web y Tokens de Portador (Bearer Tokens) para Móvil/Tablet.

- `POST /api/v2/auth/login`: Inicio de sesión.
- `POST /api/v2/auth/refresh`: Renovación de tokens.
- `GET /api/v2/auth/me`: Obtener perfil del usuario autenticado.

---

## 2. Endpoints Públicos

- `GET /api/v2/public/events/:slug`: Devuelve datos del evento + campos dinámicos (`fields`).
- `POST /api/v2/public/events/:slug/register`:
    - Cuerpo: `{ "contact": {...}, "answers": {...} }`
    - Devuelve: Objeto `Registration` con el `hashedId` para el QR.

---

## 3. Staff y Check-in (Alto Rendimiento)

- `POST /api/v2/checkin/:hashedId`: Valida la asistencia en tiempo real.
- `POST /api/v2/sync/checkins`: **Endpoint de Sincronización Offline**.
    - Acepta un array de eventos de check-in registrados fuera de línea.
    - Cuerpo: `[{ "hashedId": "...", "checkedAt": "FECHA-ISO", "deviceId": "..." }]`

---

## 4. Módulo Financiero (Admin)

- `GET /api/v2/events/:eventId/registrations/:regId/transactions`: Listar pagos y cargos.
- `POST /api/v2/events/:eventId/registrations/:regId/transactions`: Registrar un nuevo pago o descuento.
    - Cuerpo: `{ "amount": 100, "type": "PAYMENT", "reference": "ID_STRIPE_O_PAYPAL" }`

---

## 5. Integración con Azul-Guard

Cada petición debe pasar por el `GuardMiddleware`.

- Headers requeridos: `X-Device-ID`.
- Métricas enviadas a Azul-Guard: Tiempo de respuesta, uso de memoria y estado de autenticación.

---

## 5. Integración con Azul-Guard

Cada petición debe pasar por el `GuardMiddleware`.

- Headers requeridos: `X-Device-ID`.
- Métricas enviadas a Azul-Guard: Tiempo de respuesta, uso de memoria y estado de autenticación.
