# Konevx Working Rules

Estas reglas aplican a todo el repositorio.

## Antes de tocar código

- Leé primero los archivos relevantes; no adivines.
- Si la intención no está clara, preguntá y frená.
- Cambios chicos, coherentes y reversibles.
- No rompas comportamiento existente salvo que el cambio lo pida.

## Frontend (apps/web)

- Usar **2 espacios** de indentación (estándar del formatter del frontend).
- `camelCase` para variables y funciones; `PascalCase` para componentes.
- `const` por defecto, nunca `var`.
- Punto y coma al final de statements, excepto en JSX/TSX dentro del return.
- `SCREAMING_SNAKE_CASE` para constantes.
- Preferí componentes funcionales y responsabilidad única.
- Mantené la UI organizada por features; `shared` primero, luego `features`.
- Evitá estilos inline salvo valores dinámicos o excepciones puntuales.
- Formas largas: separá por secciones y priorizá accesibilidad + feedback visible.
- Para formularios, mostrales errores claros; si un submit falla, no lo dejes silencioso.
- Props tipadas con TypeScript.
- Componentes chicos y con una sola responsabilidad.
- Custom hooks con nombres `useXxx()` y dependency arrays completas en `useEffect`.
- State global con Zustand; server state con TanStack Query; Context solo para casos realmente transversales.
- Estilos con CSS moderno/SCSS, clases en kebab-case y variables CSS para color/spacing.

### Componentes React

- Usar **functional components** con arrow functions.
- Props con type hints (TypeScript).
- Componentes pequeños (máximo 200 líneas).
- Un componente por archivo.
- Nombrar componentes: `WorkflowCard.tsx`, `DashboardView.tsx`.

### State Management

- **Zustand** para estado global de la app.
- **TanStack Query** para estado del servidor.
- **Context API** solo para theme y auth.

### Hooks

- Custom hooks: `useWorkflow()`, `useSocket()`.
- dependency array siempre completa en `useEffect`.

### Estilos

- **CSS moderno** con nesting (2 espacios) o SCSS si necesitás mixins/functions.
- **SCSS Modules** para estilos específicos de componente (opcional).
- Classes en kebab-case: `.workflow-card`.
- Variables CSS (`--color-primary`) para colores y spacing.
- No usar estilos inline excepto para dynamic values.

## Backend (apps/api)

- `camelCase` para funciones/variables, `PascalCase` para clases/componentes/tipos.
- Evitá lógica de negocio en rutas; separá controllers, services y repositorios.
- Validá entradas con el esquema existente (Zod u otros validadores del proyecto) antes de tocar la base.
- No mezcles acceso a DB con presentación; mantené la capa API delgada.

## Git y calidad

- Commits con conventional commits.
- No commitees secretos, credenciales ni archivos de entorno.
- No hagas push ni force-push salvo instrucción explícita.
- Si un cambio altera una convención, actualizá este archivo también.
- Antes de commitear: revisar staged files y evitar commits con lint roto.
- Verificar tests antes de cerrar un cambio cuando aplique.

## GGA (Gentleman Guardian Angel)

- Este repo usa `gga` para code review automático.
- El hook de pre-commit ejecuta `gga run`.
- La config vive en `.gga`.
- Si cambiás patrones de revisión, mantené `AGENTS.md` y `.gga` alineados.

## Criterio práctico

- Priorizá claridad sobre trucos.
- Priorizá consistencia sobre atajos.
- Si vas a dejar una decisión importante, documentala.

## Tecnologías reales del repo

- Frontend: React 19, TypeScript, Vite, MUI, TanStack Query, Zustand, React Hook Form, Yup.
- Backend: Node.js, TypeScript, Express 5, Prisma, PostgreSQL, Zod.
- Testing frontend: Vitest + Testing Library + jsdom.
- No hay Python en este repositorio.
