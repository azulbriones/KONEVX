# ---------- base ----------
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Prisma engines need OpenSSL + certs
RUN apt-get update -y \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# ---------- deps ----------
FROM base AS deps
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci

# ---------- dev ----------
FROM base AS dev
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["npm","run","dev"]

# ---------- build ----------
FROM base AS build
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY apps/api ./apps/api

WORKDIR /app/apps/api

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

RUN npm run build

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules

COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package*.json ./apps/api/
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts

# Entrypoint
COPY apps/api/docker/entrypoint.sh ./apps/api/docker/entrypoint.sh

WORKDIR /app/apps/api
RUN chmod +x ./docker/entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker/entrypoint.sh"]
