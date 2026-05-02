# Architecture Decision Records (ADR) - Konevx 2.0

**Project:** Konevx
**Lead Engineer:** Azul Briones
**Status:** Living Document

---

## ADR-001: Choice of Database Engine (PostgreSQL)

### Context

Konevx requires strict data integrity for financial transactions and complex relationships between events, members, and participants. We also need to handle dynamic metadata for custom forms.

### Decision

We will use **PostgreSQL 17** (via Prisma/Eloquent).

### Rationale

- **Relational Integrity:** Superior support for Foreign Keys and ACID compliance for the finance module.
- **JSONB Support:** PostgreSQL's JSONB allows us to store dynamic form fields (`EventField`) and responses (`RegistrationFieldValue`) while maintaining the ability to index and query them efficiently.
- **Ecosystem:** Excellent integration with Laravel and Prisma.

### Consequences

- **Positive:** High reliability and flexible data storage.
- **Negative:** Slightly more complex setup than a NoSQL solution for dynamic fields, but mitigated by JSONB.

---

## ADR-002: Backend Architecture (Laravel 11 API-First)

### Context

We need a backend that allows rapid development but scales in terms of business logic. It must serve a React web frontend and a Flutter mobile app.

### Decision

Use **Laravel 11** as a Stateless API.

### Rationale

- **Developer Velocity:** Laravel provides high-level abstractions for Auth, Queues, and Caching (Redis).
- **Statelessness:** Essential for the mobile app and future scaling.
- **Ecosystem:** Tools like Laravel Reverb (WebSockets) and Sanctum/Passport simplify our real-time and security requirements.

---

## ADR-003: Mobile Strategy (Flutter for Offline-First)

### Context

Event check-ins often happen in environments with poor connectivity. The staff needs to validate entries without latency.

### Decision

Use **Flutter** with local **SQLite** storage.

### Rationale

- **Performance:** Native performance for QR scanning.
- **Sync Logic:** Flutter's ecosystem (Sqflite + WorkManager) makes background synchronization robust and easier to manage than React Native for complex offline states.
- **Multi-platform:** Single codebase for Mobile and Tablet.

---

## ADR-004: Logic Decoupling (Action Pattern)

### Context

Standard Laravel controllers often become "Fat Controllers," making testing and reusability difficult.

### Decision

Implement the **Action Pattern** (Single Action Classes).

### Rationale

- **SRP (Single Responsibility Principle):** Each business process (e.g., `ProcessCheckIn`) is its own class.
- **Testing:** Much easier to Unit Test an Action than a Controller.
- **Portability:** Actions can be called from HTTP controllers, CLI commands, or Job Queues.

---

## ADR-005: Dynamic Form Implementation (JSONB Strategy)

### Context

Each event needs different registration fields (Age, Church, Size, etc.).

### Decision

Use a hybrid approach: **EventField** definitions in a table and **RegistrationFieldValue** storing responses in a JSON column.

### Rationale

- **Flexibility:** Organizers can add fields without database migrations.
- **Performance:** Avoids the "EAV Anti-pattern" bottleneck (multiple joins) by fetching values in a single row.
