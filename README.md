# Title

<div align="center">

```text

██████╗ ███████╗ ██████╗  ██████╗ ██╗   ██╗
██╔══██╗██╔════╝██╔════╝ ██╔════╝ ╚██╗ ██╔╝
██████╔╝█████╗  ██║  ███╗██║  ███╗ ╚████╔╝
██╔══██╗██╔══╝  ██║   ██║██║   ██║  ╚██╔╝
██████╔╝███████╗╚██████╔╝╚██████╔╝   ██║
╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝    ╚═╝
```

**Your seasoned travel buddy for smarter packing.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.6-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square)](LICENSE)

</div>

---

## What is Beggy?

Beggy is an **AI-powered smart travel packing assistant** that eliminates the guesswork from packing. It combines weather intelligence, AI recommendations, and structured container management to help travelers pack the right things — nothing more, nothing less.

```text
Destination entered  →  Weather fetched  →  AI analyzes  →  Smart suggestions delivered
```

**Core capabilities:**

- 🌦 **Weather-aware packing** via OpenWeather API
- 🤖 **AI-powered suggestions** via Google Gemini
- 🧳 **Container management** — bags & suitcases with physical constraints (weight, volume, capacity)
- 🔐 **Production-grade auth** — JWT, OAuth (Google + Facebook), CSRF, rate limiting
- 🛡 **RBAC authorization** — fine-grained permissions via CASL

---

## Monorepo Structure

This repository is a **Turborepo + pnpm workspaces** monorepo.

```text
beggy/
├── apps/
│   ├── api/          → @beggy/api     Express 5 REST API backend
│   ├── web/          → @beggy/web     Next.js 16 frontend
│   └── mcp/          → @beggy/mcp     MCP dev tooling server
│
├── packages/
│   └── shared/       → @beggy/shared  Shared types, Zod schemas, constants
│
├── turbo.json                          Turborepo task orchestration
├── pnpm-workspace.yaml                 Workspace + catalog definitions
└── docker-compose.dev.yml              Docker development setup
```

| Package | Description | Docs |

|---|---|---|
| `@beggy/api` | Express 5 REST API — auth, users, bags, AI, weather | [apps/api/README.md](apps/api/README.md) |
| `@beggy/web` | Next.js 16 frontend with full design system | [apps/web/README.md](apps/web/README.md) |
| `@beggy/shared` | Single source of truth for types & schemas | [packages/shared/README.md](packages/shared/README.md) |
| `@beggy/mcp` | Model Context Protocol dev tooling server | [apps/mcp/README.md](apps/mcp/README.md) |

---

## Tech Stack at a Glance

| Layer | Technology |

|---|---|
| **Monorepo** | Turborepo 2.6, pnpm workspaces |
| **API** | Express 5, Prisma 7, PostgreSQL, SWC, Pino, Swagger |
| **Auth** | JWT, Passport.js, Google OAuth, Facebook OAuth, CASL |
| **Web** | Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Redux Toolkit |
| **Validation** | Zod 4 (shared across API + Web) |
| **AI** | Google Gemini API |
| **Weather** | OpenWeather API |
| **Email** | Resend |
| **Testing** | Vitest, React Testing Library, Playwright, Storybook |
| **Code Quality** | TypeScript 5.9 (strict), ESLint 9 flat config, Prettier |

---

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (`npm install -g pnpm`)
- **Docker** (recommended for local database)
- **PostgreSQL** (if not using Docker)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mofathy183/Beggy-backend.git
cd beggy
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Each app has its own env file. Start from the examples:

```bash
# API environment
cp apps/api/.env.example apps/api/.env.local

# Web environment
cp apps/web/.env.example apps/web/.env.local
```

Minimum required variables:

```env
# apps/api/.env.local
DATABASE_URL=postgresql://user:password@localhost:5432/beggy
JWT_ACCESS_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
SESSION_SECRET=your-session-secret
CSRF_SECRET_KEY=your-csrf-secret

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000
```

> See [Environment Variables](#environment-variables) for the full reference.

### 4. Start the database

```bash
# Recommended: use Docker
pnpm docker:dev

# Or run only the database service
docker compose -f docker-compose.dev.yml up postgres
```

### 5. Run database migrations

```bash
cd apps/api
pnpm prisma:migrate
pnpm prisma:generate
```

### 6. Start development

```bash
# From the root — starts all apps in parallel
pnpm dev
```

| Service | URL |

|---|---|
| API | `http://localhost:4000` |
| API Docs (Swagger) | `http://localhost:4000/docs` |
| Web | `http://localhost:3000` |

---

## Available Scripts

Run from the **monorepo root** — Turborepo handles task orchestration and caching.

```bash
# Development
pnpm dev                    # Start all apps in watch mode

# Building
pnpm build                  # Build all packages and apps

# Testing
pnpm test                   # Run all test suites
pnpm test:coverage          # Run tests with coverage reports

# Code quality
pnpm lint                   # Lint all packages
pnpm lint:fix               # Lint and auto-fix
pnpm format                 # Format all files with Prettier
pnpm format:check           # Check formatting without writing
pnpm type-check             # TypeScript type checking across all packages

# Docker
pnpm docker:dev:build      # Build development images (run after dependency/Dockerfile changes)
pnpm docker:dev            # Start development Docker stack
pnpm docker:dev:down       # Stop development stack
pnpm docker:dev:reset      # Reset development stack (removes volumes + rebuilds)

pnpm docker:prod           # Build & start production Docker stack
pnpm docker:prod:down      # Stop production stack
```

---

## Docker

### Development

```bash
pnpm docker:dev
```

Starts:

- `postgres` on port `5432`
- `postgres_test` on port `5433`
- `api` on port `4000` (with Node inspector on `9229`)
- `web` on port `3000`

> ⚠️ Run `pnpm docker:dev:build` only when dependencies or Docker config change.  
> For daily development, just use `pnpm docker:dev`.

Source files are mounted into containers with hot reload via polling.

### Production

```bash
pnpm docker:prod
```

Builds optimized production images for `api` and `web`. The `api` image uses multi-stage build with `dist/` output; the `web` image uses Next.js `standalone` output.

---

## Environment Variables

### Required for API

| Variable | Description |

|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | JWT access token signing secret |
| `JWT_REFRESH_SECRET` | JWT refresh token signing secret |
| `SESSION_SECRET` | Express session secret |
| `CSRF_SECRET_KEY` | CSRF protection secret |

### Optional / Feature-specific

| Variable | Description |

|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth app ID |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth app secret |
| `AI_API_KEY` | Google Gemini AI API key |
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `RESEND_API_KEY` | Resend email service API key |

### Required for Web

| Variable | Description |

|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API (used client-side) |

> **Never commit `.env` files.** Use `.env.example` as documentation only.

---

## Architecture

```text
┌─────────────────────────┐
│     Next.js Web App     │   React 19 · Tailwind v4 · shadcn/ui
│    (apps/web · :3000)   │   Redux Toolkit · CASL · React Hook Form
└────────────┬────────────┘
             │ HTTP (fetch / RTK Query)
             ▼
┌─────────────────────────┐
│     Express 5 API       │   Prisma ORM · Pino · Swagger · SWC
│    (apps/api · :4000)   │   JWT · CASL · Passport · csrf-csrf
└────────────┬────────────┘
             │
         Prisma ORM
             │
             ▼
┌─────────────────────────┐
│       PostgreSQL        │
└──────────┬──────┬───────┘
           │      │
     ┌─────▼──┐ ┌─▼──────────────┐
     │ Gemini │ │  OpenWeather   │
     │   AI   │ │      API       │
     └────────┘ └────────────────┘

  ┌──────────────────────────┐
  │     @beggy/shared        │  Zod schemas · TypeScript types
  │   (packages/shared)      │  Constants · Enums · Utilities
  └──────────────────────────┘
         consumed by both api + web
```

---

## Project Conventions

### Module structure (API)

Each domain module follows: `service → controller → route (factory)`.

```text

src/modules/users/
├── users.service.ts       # Business logic
├── users.controller.ts    # Request/response handling
├── users.route.ts         # Route factory function
├── users.mapper.ts        # Data transformation
├── users.validator.ts     # Route-level validation
└── __tests__/
    └── users.service.test.ts
```

### Feature structure (Web)

```text

src/features/users/
├── components/            # UI components
│   ├── list/              # List views
│   ├── details/           # Detail views
│   ├── forms/             # Form components (container + UI split)
│   └── actions/           # Action components
├── hooks/                 # Feature hooks
├── api/                   # API client functions
└── index.ts               # Feature exports
```

### Shared types

Always import from `@beggy/shared` — never duplicate types between API and Web.

```typescript
import type { UserType } from '@beggy/shared/types';
import { createUserSchema } from '@beggy/shared/schemas';
```

---

## Testing Strategy

| Layer | Tool | Coverage |

|---|---|---|
| API unit tests | Vitest + Faker | Services, controllers, mappers |
| API integration tests | Vitest + Supertest | Full HTTP request/response cycle |
| Web component tests | Vitest + Testing Library | React components, hooks |
| Web Storybook tests | Playwright (Chromium) | Browser-rendered stories + a11y |
| Shared unit tests | Vitest | Utility functions, schemas |

```bash
# Run all tests
pnpm test

# API only
cd apps/api && pnpm test

# Web only (with browser)
cd apps/web && pnpm test:storybook
```

---

## Deployment

The `deploy.sh` script at the repo root handles server-side deployment:

1. Loads secrets from `/etc/beggy/secrets.env`
2. Pulls latest `main`
3. Brings up production Docker stack (`--detach`)
4. Runs `prisma migrate deploy` inside the `api` container

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Follow the existing architecture patterns for your target app
4. Write tests for new functionality
5. Ensure `pnpm lint`, `pnpm type-check`, and `pnpm test` all pass
6. Open a pull request against `main`

---

## License

[MIT](LICENSE) — Mohamed Fathy · [mofathy1833@gmail.com](mailto:mofathy1833@gmail.com)

---

<div align="center">
    <sub>Built with TypeScript · Powered by Turborepo · Designed for travelers</sub>
</div>
