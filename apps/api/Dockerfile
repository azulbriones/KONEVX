# ---------- deps ----------
	FROM node:20-bookworm-slim AS deps
	WORKDIR /app

	# Prisma (openssl) + certs
	RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

	COPY package*.json ./
	COPY apps/api/package*.json ./apps/api/
	RUN npm ci

	# ---------- build ----------
	FROM node:20-bookworm-slim AS build
	WORKDIR /app
	RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

	COPY --from=deps /app/node_modules ./node_modules
	COPY . .

	WORKDIR /app/apps/api

	RUN npm run prisma:generate
	RUN npm run build

	# ---------- runtime ----------
	FROM node:20-bookworm-slim AS runtime
	WORKDIR /app
	RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

	ENV NODE_ENV=production

	COPY --from=build /app/node_modules ./node_modules
	COPY --from=build /app/apps/api/package*.json ./apps/api/
	COPY --from=build /app/apps/api/dist ./apps/api/dist
	COPY --from=build /app/apps/api/prisma ./apps/api/prisma
	COPY --from=build /app/apps/api/docker/entrypoint.sh ./apps/api/docker/entrypoint.sh

	WORKDIR /app/apps/api

	RUN chmod +x ./docker/entrypoint.sh

	EXPOSE 3001
	ENTRYPOINT ["./docker/entrypoint.sh"]
