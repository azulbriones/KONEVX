# ---------- base ----------
	FROM node:20-alpine AS base
	WORKDIR /app

	# ---------- deps ----------
	FROM base AS deps
	COPY apps/web/package*.json ./apps/web/
	WORKDIR /app/apps/web
	RUN npm ci

	# ---------- dev ----------
	FROM base AS dev
	ENV NODE_ENV=development
	COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
	COPY apps/web ./apps/web
	WORKDIR /app/apps/web
	EXPOSE 5173
	CMD ["npm","run","dev","--","--host","0.0.0.0","--port","5173"]

	# ---------- build ----------
	FROM base AS build
	ARG VITE_API_URL
	ENV VITE_API_URL=$VITE_API_URL
	COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
	COPY apps/web ./apps/web
	WORKDIR /app/apps/web
	RUN npm run build

	# ---------- runtime ----------
	FROM nginx:1.27-alpine AS runtime
	WORKDIR /usr/share/nginx/html
	RUN rm -rf ./*
	COPY --from=build /app/apps/web/dist ./
	COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
	EXPOSE 80
	CMD ["nginx","-g","daemon off;"]
