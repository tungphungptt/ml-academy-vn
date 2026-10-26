FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV DATABASE_URL="file:/data/app.db" LESSON_CONTENT_DIR="/data/lesson-overrides" PORT=3000 NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
# Optional local cloud proxy CA, mounted only during build; TLS stays enabled.
RUN --mount=type=secret,id=extra_ca if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi; npm ci --include=dev
COPY . .
RUN --mount=type=secret,id=extra_ca if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi; npm run build
ENV NODE_ENV=production
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "scripts/docker-entry.sh"]
