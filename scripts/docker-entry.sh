#!/bin/sh
set -e
[ "${#SESSION_SECRET}" -ge 32 ] || { echo "Thiếu SESSION_SECRET (>= 32 ký tự). Đặt trong .env hoặc docker-compose."; exit 1; }
npx prisma db push --skip-generate
npx tsx prisma/seed.ts
exec npx next start -p "${PORT:-3000}"
