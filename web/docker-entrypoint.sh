#!/bin/sh
set -eu

echo "[entrypoint] Aplicando migraciones de Prisma..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Verificando seed idempotente de la base de conocimiento..."
./node_modules/.bin/tsx prisma/seed.ts

echo "[entrypoint] Iniciando servidor Next.js..."
exec node server.js
