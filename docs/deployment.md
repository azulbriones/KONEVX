# 🚀 Deployment Guide

## Stack

- Docker
- Docker Compose
- Caddy (HTTPS)
- PostgreSQL
- Node API
- React frontend

---

## Deploy

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build
```

---

## Health Check

```bash
curl https://api.konevx.com/api/health
```

Expected:

```json
{ "ok": true }
```

---

## Backup

```bash
/usr/local/bin/backup-konevx-db.sh
```

---

## Monitoring

- UptimeRobot
- BetterStack

---

## Security

- HTTPS (Caddy)
- CSRF protection
- Secure cookies
- Firewall (UFW)

## Local parity

For local development, copy `.env.example` to `.env` and use `docker-compose.local.yml` so the API base URL stays `/api` and the browser auth flow matches production.

## Local parity

For local development, use `docker-compose.local.yml` with `.env.example` so the API base URL remains `/api` and cookies/CSRF settings match the runtime.
