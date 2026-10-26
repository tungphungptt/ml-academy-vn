#!/bin/sh
set -e
[ "${#SESSION_SECRET}" -ge 32 ] || { echo "Thiếu SESSION_SECRET (>= 32 ký tự). Đặt trong .env hoặc docker-compose."; exit 1; }
node scripts/prepare-db.mjs
exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 -p "${PORT:-3000}"
