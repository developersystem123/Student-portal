# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
COPY prisma.config.ts ./
COPY prisma ./prisma

RUN npm ci --frozen-lockfile

# Generate Prisma client to lib/generated/prisma (as defined in schema.prisma)
RUN npx prisma generate

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Overlay freshly generated Prisma client (may not exist in source tree on CI)
COPY --from=deps /app/lib/generated ./lib/generated

RUN npm run build

# ─── Stage 3: Development (source mounted via volume) ────────────────────────
FROM node:20-alpine AS dev

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat

# Only pre-install node_modules; source is mounted at runtime
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "dev"]

# ─── Stage 4: Production (standalone, non-root, minimal) ─────────────────────
FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN apk add --no-cache libc6-compat tini

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# ── Next.js standalone output ──
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

# ── Prisma for migrations (CLI + engine + schema) ──
# The Prisma CLI reads prisma.config.ts to locate schema & migrations.
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/prisma          ./node_modules/prisma
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules/@prisma         ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma                       ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts             ./prisma.config.ts

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=5 \
    CMD wget -qO- http://localhost:3000/api/health >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]

# Runs pending DB migrations then starts the app.
# Set RUN_MIGRATIONS=false to skip (e.g. when migrations are applied via CI).
CMD ["sh", "-c", \
  "if [ \"$RUN_MIGRATIONS\" != 'false' ]; then node node_modules/prisma/build/index.js migrate deploy; fi && node server.js"]
