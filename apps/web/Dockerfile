# ---------- base ----------
	FROM node:22-alpine AS base
	WORKDIR /app
	RUN corepack enable && corepack prepare pnpm@9.15.2 --activate

	# ---------- deps ----------
	FROM base AS deps
	WORKDIR /app/apps/web
	COPY apps/web/package.json apps/web/pnpm-lock.yaml* ./
	RUN pnpm install --frozen-lockfile || pnpm install

	# ---------- dev ----------
	FROM base AS dev
	ENV NODE_ENV=development
	WORKDIR /app/apps/web
	COPY --from=deps /app/apps/web/node_modules ./node_modules
	COPY apps/web ./
	EXPOSE 5173
	CMD ["pnpm","dev","--host","0.0.0.0","--port","5173"]

	# ---------- build ----------
	FROM base AS build
	ARG VITE_API_URL
	ENV VITE_API_URL=$VITE_API_URL
	WORKDIR /app/apps/web
	COPY --from=deps /app/apps/web/node_modules ./node_modules
	COPY apps/web ./
	RUN pnpm build

	# ---------- runtime ----------
	FROM nginx:1.27-alpine AS runtime
	WORKDIR /usr/share/nginx/html
	RUN rm -rf ./*
	COPY --from=build /app/apps/web/dist ./
	COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
	EXPOSE 80
	CMD ["nginx","-g","daemon off;"]
