# ---------- base ----------
	FROM node:20-bookworm-slim AS base
	WORKDIR /app

	RUN apt-get update -y \
	  && apt-get install -y openssl ca-certificates wget \
	  && rm -rf /var/lib/apt/lists/*

	RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

	# ---------- deps ----------
	FROM base AS deps
	WORKDIR /app/apps/api

	COPY apps/api/package.json apps/api/pnpm-lock.yaml* ./
	RUN pnpm install --frozen-lockfile || pnpm install

	# ---------- dev ----------
	FROM base AS dev
	ENV NODE_ENV=development
	WORKDIR /app/apps/api

	COPY --from=deps /app/apps/api/node_modules ./node_modules
	COPY apps/api ./

	EXPOSE 3001
	CMD ["pnpm","dev"]

	# ---------- build ----------
	FROM base AS build
	ENV NODE_ENV=production
	WORKDIR /app/apps/api

	COPY --from=deps /app/apps/api/node_modules ./node_modules
	COPY apps/api ./

	ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
	RUN pnpm prisma:generate

	RUN pnpm build

	# ---------- runtime ----------
	FROM base AS runtime
	ENV NODE_ENV=production
	WORKDIR /app/apps/api

	COPY --from=deps /app/apps/api/node_modules ./node_modules
	COPY --from=build /app/apps/api/dist ./dist
	COPY --from=build /app/apps/api/package.json ./package.json
	COPY --from=build /app/apps/api/prisma ./prisma
	COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts

	COPY apps/api/docker/entrypoint.sh ./docker/entrypoint.sh
	RUN chmod +x ./docker/entrypoint.sh

	EXPOSE 3001
	ENTRYPOINT ["./docker/entrypoint.sh"]
