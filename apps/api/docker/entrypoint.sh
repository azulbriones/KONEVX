#!/bin/sh
set -eu

echo "🔧 API entrypoint starting..."

echo "NODE_ENV=${NODE_ENV:-}"
echo "DEMO_MODE=${DEMO_MODE:-false}"

echo "🧬 prisma generate"
npm run prisma:generate

echo "🗄️ prisma migrate deploy"
npm run prisma:deploy

if [ "${DEMO_MODE:-false}" = "true" ]; then
	echo "🌱 seed admin"
	npm run seed:admin || true

	echo "🎭 seed demo (reset + seed)"
	npm run seed:demo -- --reset || npm run seed:demo || true
fi

echo "🚀 starting api"
exec npm run start
