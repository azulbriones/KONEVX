#!/bin/sh
set -eu

log() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*"; }

log "🔧 KONEVX API entrypoint"

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${AUTH_ACCESS_TOKEN_SECRET:?AUTH_ACCESS_TOKEN_SECRET is required}"
: "${AUTH_REFRESH_TOKEN_SECRET:?AUTH_REFRESH_TOKEN_SECRET is required}"

NODE_ENV="${NODE_ENV:-production}"
DEMO_MODE="${DEMO_MODE:-false}"

# Control flags
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
RUN_SEEDS="${RUN_SEEDS:-true}"

# Demo seed behavior
SEED_DEMO_RESET="${SEED_DEMO_RESET:-true}" # true => reset+seed

log "NODE_ENV=$NODE_ENV"
log "DEMO_MODE=$DEMO_MODE"
log "RUN_MIGRATIONS=$RUN_MIGRATIONS"
log "RUN_SEEDS=$RUN_SEEDS"
log "SEED_DEMO_RESET=$SEED_DEMO_RESET"

# Prisma generate
log "🧬 prisma generate"
npx prisma generate --schema=./prisma/schema.prisma

if [ "$RUN_MIGRATIONS" = "true" ]; then
  log "🗄️ prisma migrate deploy"
  npx prisma migrate deploy --schema=./prisma/schema.prisma
else
  log "⏭️ skipping migrations"
fi

if [ "$RUN_SEEDS" = "true" ]; then
  log "🌱 seed admin (best-effort)"
  pnpm seed:admin || log "⚠️ seed:admin failed (continuing)"
fi

# ✅ Seed demo solo en modo demo
if [ "$RUN_SEEDS" = "true" ] && [ "$DEMO_MODE" = "true" ]; then
  if [ "$SEED_DEMO_RESET" = "true" ]; then
    log "🎭 seed demo (reset + seed)"
    node dist/scripts/seedDemo.js --reset || log "⚠️ seed:demo failed (continuing)"
  else
    log "🎭 seed demo (seed only)"
    node dist/scripts/seedDemo.js || log "⚠️ seed:demo failed (continuing)"
  fi
fi

log "🚀 starting API"
exec pnpm run start
