# KONEVX Deployment Guide

## Overview

This document describes how to deploy **KONEVX** to production using a
VPS with Docker, Caddy, and PostgreSQL.

Infrastructure stack:

- Ubuntu 24.04 LTS VPS
- Docker + Docker Compose
- Caddy reverse proxy (automatic HTTPS)
- PostgreSQL
- Node.js API
- React frontend (Vite + Nginx)
- Automated backups
- Firewall with UFW

---

# Architecture

## Domains

Frontend: https://konevx.com

API: https://api.konevx.com

## Services

web → React frontend served by nginx\
api → Node.js / Express backend\
db → PostgreSQL database\
caddy → reverse proxy + automatic TLS

---

# Server Requirements

Minimum recommended VPS:

- 2 vCPU
- 4GB RAM
- 40GB SSD
- Ubuntu 24.04 LTS

---

# DNS Configuration

Configure these records in your DNS provider.

Type Name Value

---

A @ VPS_IP
A api VPS_IP
CNAME www konevx.com

---

# Server Directory Structure

Project root:

/var/eventplanner

Uploads:

/var/eventplanner/uploads

Backups:

/var/backups/konevx

---

# Required Software

Install updates:

sudo apt update sudo apt upgrade -y

Install Docker:

sudo apt install docker.io docker-compose-plugin -y

Enable Docker:

sudo systemctl enable docker sudo systemctl start docker

---

# Project Setup

Clone the repository:

cd /var/eventplanner git clone `<REPOSITORY_URL>`{=html} .

---

# Environment Variables

Create production env file.

nano .env.prod

Example:

POSTGRES_USER=konevx POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=konevx

DATABASE_URL=postgresql://konevx:CHANGE_THIS_PASSWORD@db:5432/konevx?schema=public

WEB_ORIGIN=https://konevx.com VITE_API_URL=https://api.konevx.com/api

AUTH_ACCESS_TOKEN_SECRET=CHANGE_THIS_SECRET
AUTH_REFRESH_TOKEN_SECRET=CHANGE_THIS_SECRET

AUTH_ACCESS_TOKEN_TTL=15m AUTH_REFRESH_TOKEN_TTL=7d

COOKIE_SECURE=true COOKIE_SAMESITE=lax

RUN_MIGRATIONS=true RUN_SEEDS=false DEMO_MODE=false

---

# Caddy Configuration

Caddyfile

konevx.com { reverse_proxy web:80 }

www.konevx.com { redir https://konevx.com{uri} 301 }

api.konevx.com { reverse_proxy api:3001 }

---

# First Deployment

Build and start services:

docker compose --env-file .env.prod -f docker-compose.prod.yml up -d
--build

Check status:

docker compose --env-file .env.prod -f docker-compose.prod.yml ps

---

# Health Checks

Frontend:

curl -I https://konevx.com

API:

curl https://api.konevx.com/api/health

Expected:

{"ok":true,"service":"api"}

---

# Create Admin User

docker compose --env-file .env.prod -f docker-compose.prod.yml exec -e
SEED_ADMIN_EMAIL=admin@konevx.com -e
SEED_ADMIN_PASSWORD='CHANGE_PASSWORD' api pnpm seed:admin

Login:

https://konevx.com/login

---

# Redeploy

Update application:

redeploy-konevx.sh

Manual redeploy:

git pull docker compose --env-file .env.prod -f docker-compose.prod.yml
up -d --build

---

# Logs

API logs:

logs-api-konevx.sh

Web logs:

logs-web-konevx.sh

Caddy logs:

logs-caddy-konevx.sh

---

# Backups

Backup script:

/usr/local/bin/backup-konevx-db.sh

Manual backup:

/usr/local/bin/backup-konevx-db.sh

Backup directory:

/var/backups/konevx

---

# Automated Backup

Cron job:

0 3 \* \* \* /usr/local/bin/backup-konevx-db.sh

This runs daily at 03:00.

Backups older than 7 days are deleted automatically.

---

# Firewall

Enable firewall:

ufw allow OpenSSH ufw allow 80/tcp ufw allow 443/tcp ufw enable

Verify:

ufw status

---

# Health Script

health-konevx.sh

Shows:

- container status
- API health
- frontend availability

---

# Troubleshooting

## Login returns 404

Check frontend API URL.

VITE_API_URL must include /api

Example:

VITE_API_URL=https://api.konevx.com/api

---

## Caddy returns 502

Ensure upstream syntax has no spaces.

Correct:

reverse_proxy web:80 reverse_proxy api:3001

Incorrect:

reverse_proxy web: 80

---

## Uploads not working

Check docker volume:

/var/eventplanner/uploads:/app/apps/api/public/uploads

---

# Monitoring (recommended)

External monitoring services:

- UptimeRobot
- BetterStack
- StatusCake

Recommended checks:

https://konevx.com\
https://api.konevx.com/api/health

---

# Security Recommendations

Enable:

- UFW firewall
- Fail2Ban
- SSH key login only
- Regular backups
- Strong secrets in .env.prod

---

# Maintenance

Check containers:

docker compose --env-file .env.prod -f docker-compose.prod.yml ps

Restart services:

docker compose --env-file .env.prod -f docker-compose.prod.yml restart

---

# Production Summary

Infrastructure:

- Ubuntu VPS
- Docker
- Caddy reverse proxy
- PostgreSQL
- React frontend
- Node API

Domains:

https://konevx.com\
https://api.konevx.com

Security:

- TLS
- firewall
- automated backups

---
