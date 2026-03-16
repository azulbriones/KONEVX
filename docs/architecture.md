# 🧠 Architecture

## Overview

Konevx follows a modern decoupled architecture:

Frontend → React (Vite)
Backend → Node.js + Express
Database → PostgreSQL
Proxy → Caddy

---

## Flow

User → Caddy → Web/API → Database

---

## Components

### Frontend

- SPA (React)
- Communicates via REST API
- Handles UI + forms

### Backend

- Express API
- Authentication (JWT + cookies)
- CSRF protection

### Database

- PostgreSQL
- Prisma ORM

### Infrastructure

- Prisma ORM

### Infrastructure

- Docker containers
- Caddy reverse proxy
- HTTPS automatic

---

## Deployment

- VPS (Ubuntu)
- Docker Compose
- Isolated services
