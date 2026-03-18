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
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

WORKDIR /app/apps/web

# Needs NEXT_PUBLIC vars at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# -------------------------------------------------------
# Stage 3 — Production runtime
# -------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app/apps/web

# Next.js standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]