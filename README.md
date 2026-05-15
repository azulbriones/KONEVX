# 🚀 Konevx

<p align="center">
  <strong>Modern Event Management Platform</strong><br/>
  Create, manage, and scale your events with ease.
</p>

<p align="center">
  <a href="https://konevx.com">🌐 Live Demo</a> •
  <a href="https://api.konevx.com/api/health">🟢 API Status</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-production-success" />
  <img src="https://img.shields.io/badge/license-MIT-blue" />
  <img src="https://img.shields.io/badge/docker-ready-blue" />
  <img src="https://img.shields.io/badge/typescript-strict-blue" />
</p>

---

## ✨ Overview

**Konevx** is a modern SaaS-ready platform for event management:

- 📋 Dynamic registration forms
- 👥 Participant management
- 🎟️ Capacity control
- ⚡ Real-time availability
- 🔐 Secure authentication (cookies + CSRF)

---

## 🧪 Try it now

👉 Event: <https://konevx.com/e/demo-event>
👉 Login: <https://konevx.com/login>

**Demo credentials:**

- Email: <demo_1@konevx.com>
- Password: demo_konevx

⚠️ Shared environment — data may reset.

---

## 📸 Preview

> Add screenshots here

```
/screenshots/landing.png
/screenshots/form.png
/screenshots/mobile.png
```

---

## 🧩 Tech Stack

### Frontend

- React + Vite
- TypeScript
- Material UI

### Backend

- Node.js + Express
- Prisma ORM
- PostgreSQL

### Infrastructure

- Docker
- Caddy (HTTPS)
- Nginx

---

## ⚙️ Local Setup

```bash
cp .env.example .env
docker compose -f docker-compose.local.yml up --build
```

O, en desarrollo local sin Docker:

```bash
pnpm --dir apps/api dev
pnpm --dir apps/web dev
```

---

## 🌱 Environment Variables

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🧠 Architecture

See: [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🚀 Deployment

See: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔐 Security

- CSRF protection
- Secure cookies
- Rate limiting
- Helmet headers

---

## 📄 License

MIT

---

## 👨‍💻 Author

Built with ❤️ by you.
