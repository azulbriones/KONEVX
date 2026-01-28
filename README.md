# Event Planner

Plataforma web para gestión de eventos: un organizador crea eventos, define campos personalizados de registro y administra participantes y estatus.

## Stack
- Backend: Node.js + Express + TypeScript
- Frontend: React (Vite) + TypeScript
- DB: PostgreSQL
- Infra dev: Docker Compose

## Requisitos
- Docker Desktop

## Desarrollo (Docker)
Levanta todo el stack (DB + API + Web):

```bash
    docker compose up --build
    URLs
        •	Web: http://localhost:5173
        •	API health: http://localhost:3001/health
        •	Postgres: localhost:5432 (solo si lo necesitas desde afuera)
        
        Scripts útiles

    Detener contenedores:
    docker compose down

    Reiniciar desde cero (borra volúmenes de DB):
    docker compose down -v

    Estructura del repo
    apps/
    api/   # Express + TS
    web/   # React + Vite
    
    Notas
        •	Variables de entorno se manejan con .env (no se sube al repo).
        •	MVP: creación de evento + formulario dinámico + registro público con cupo.
```bash