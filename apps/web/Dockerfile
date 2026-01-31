# ==============================
# Base WEB
# ==============================
FROM node:20-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV TURBO_TELEMETRY_DISABLED=1

RUN corepack enable \
    && corepack prepare pnpm@10.28.1 --activate

WORKDIR /repo


# ==============================
# Dependencies
# ==============================
FROM base AS deps

COPY pnpm-lock.yaml package.json turbo.json ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile


# ==============================
# Build (WEB only)
# ==============================
FROM deps AS build

RUN pnpm turbo run build --filter=@beggy/web...


# ==============================
# Runtime
# ==============================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./.next/static
COPY --from=build /repo/apps/web/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
