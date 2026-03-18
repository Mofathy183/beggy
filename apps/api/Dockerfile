FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# -------------------------------------------------------
# Stage 1 — Install dependencies
# -------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile

# -------------------------------------------------------
# Stage 2 — Build
# -------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Now copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN pnpm build

# -------------------------------------------------------
# Stage 3 — Production runtime (smallest possible image)
# -------------------------------------------------------
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

WORKDIR /app

# Only copy what's needed to run
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 4000

# Run compiled output — no tsx, no source maps, no dev tools
CMD ["node", "dist/index.js"]