# Node 24, not 22, for two reasons: it matches the Node the app is developed on,
# and it bundles npm 11. next@16.2.12 pins @swc/helpers 0.5.15 while next-intl's
# nested @swc/core wants >=0.5.17; npm 11 dedupes and accepts that tree, npm 10
# (bundled with node:22) rejects it and `npm ci` fails with
# "Missing: @swc/helpers@0.5.23 from lock file".
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runs `prisma migrate deploy` as a one-shot container before the app starts.
# Kept as its own stage (rather than an app entrypoint) so the migration has the
# full node_modules the Prisma CLI needs, while the runner image stays lean and
# so two app containers can never race the same migration.
FROM node:24-slim AS migrator
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next's standalone server binds to localhost unless told otherwise, which is
# unreachable from outside the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# node:22-slim ships an unprivileged `node` user (uid 1000); storage/uploads is a
# mounted volume the app writes to, so it needs to be owned by that user.
RUN mkdir -p storage/uploads storage/review && chown -R node:node /app/storage
USER node

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
