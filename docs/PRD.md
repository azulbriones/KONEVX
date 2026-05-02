# Product Requirements Document (PRD): Konevx 2.0

**Project:** Konevx (Modern Event & Membership Management)
**Lead Engineer:** Azul Briones
**Status:** Approved - v2.1 (Prisma Schema Integrated)
**Version:** 2.1

---

## 1. Visión y Objetivos

Konevx 2.0 evoluciona de un registro estático a un ecosistema dinámico y resiliente. Utiliza un motor de formularios personalizables para adaptarse a cualquier tipo de evento, eliminando el papel y garantizando una entrada fluida.

- **Dynamic Agnostic Core:** Registro adaptable mediante campos configurables por evento.
- **Resiliencia Total:** Operación "Offline-first" para check-ins en zonas sin cobertura.
- **Transparencia Financiera:** Seguimiento detallado de balances y transacciones por asistente.

---

## 2. User Personas (Roles)

| Rol                  | Descripción             | Necesidad Clave                                                   |
| :------------------- | :---------------------- | :---------------------------------------------------------------- |
| **Super Admin**      | Dueño de la plataforma. | Gestión global de usuarios y monitoreo vía Azul-Guard.            |
| **Líder (User)**     | Organizador del evento. | Configuración de campos (fields), gestión de miembros y finanzas. |
| **Staff (Check-in)** | Apoyo en puerta.        | Escaneo rápido y búsqueda de participantes con baja latencia.     |
| **Asistente**        | Participante.           | Registro rápido y obtención de credencial digital segura (QR).    |

---

## 3. Requerimientos Funcionales (Basados en Prisma Schema)

### M1: Motor de Registro Dinámico (Flexible Fields)

- **Custom Schema:** Implementación de `EventField` (TEXT, SELECT, CHECKBOX, etc.) para definir qué se pregunta en cada evento.
- **Normalization:** Los participantes se identifican por `email` o `phone` normalizados para evitar duplicados.

### M2: Gestión de Membresía y Roles de Evento

- **Colaboración:** Soporte para múltiples miembros por evento con roles específicos (`EDITOR`, `VIEWER`, `CHECKIN`).
- **Seguridad de Sesión:** Gestión robusta de sesiones con Refresh Tokens para la App Móvil.

### M3: Módulo de Asistencia y Sincronización

- **QR Seguro:** Generación de `hashedId` (CUID) para validación de entrada sin exponer IDs de base de datos.
- **Offline Logic:** Almacenamiento local en Flutter (SQLite) y sincronización asíncrona mediante el campo `checkedAt`.

### M4: Módulo Financiero (Nuevo)

- **Transaction Ledger:** Registro de pagos y cargos asociados a la inscripción (`Registration`).
- **Real-time Balance:** Cálculo inmediato de deuda o saldo a favor por participante.

---

## 4. Requerimientos No Funcionales

- **Performance:** Validación de check-in en < 200ms mediante índices en `hashedId` y `status`.
- **Escalabilidad:** Optimización para ráfagas de 200 a 500 personas.
- **Observabilidad:** Integración de "Heartbeat" con Azul-Guard para monitorear la salud de la base de datos.

---

## 4. Requerimientos No Funcionales

- **Performance:** Validación de check-in en < 200ms mediante índices en `hashedId` y `status`.
- **Escalabilidad:** Optimización para ráfagas de 200 a 500 personas.
- **Observabilidad:** Integración de "Heartbeat" con Azul-Guard para monitorear la salud de la base de datos.
