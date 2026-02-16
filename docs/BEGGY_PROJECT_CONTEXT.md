# Beggy – Full Project Context & Technical Reference

Use this document as **context for AI assistants, new contributors, or yourself** to understand the Beggy project: idea, architecture, tech stack, packages, tools, tests, and Storybook.

---

## 1. Project idea & purpose

**Beggy** is an **AI-powered smart travel packing assistant** that helps travelers organize their luggage efficiently using:

- **Weather data** (e.g. OpenWeather) for destination-aware packing
- **Intelligent recommendations** (e.g. Gemini AI) for what to pack
- **Structured packing**: bags, suitcases, items, categories

**Core value**: Reduce over/under-packing and keep bags and suitcases organized with roles, permissions, and optional AI/weather integration.

**Keywords**: monorepo, turborepo, travel, packing, AI, weather, organization, trip-planning, luggage, TypeScript, React, Express, Prisma, PostgreSQL.

---

## 2. Repository structure (monorepo)

- **Package manager**: `pnpm` (>= 8.0.0), workspace root at repo root.
- **Orchestration**: **Turborepo** (`turbo.json`) for `dev`, `build`, `lint`, `lint:fix`, `type-check`, `test`, `test:coverage`, `clean`, `format`, `format:check`.

**Workspaces** (`pnpm-workspace.yaml`):

| Path              | Name            | Purpose                                                       |
| ----------------- | --------------- | ------------------------------------------------------------- |
| `apps/api`        | `@beggy/api`    | REST API backend (Express, Prisma, PostgreSQL)                |
| `apps/web`        | `@beggy/web`    | Next.js frontend (React 19, Tailwind, shadcn)                 |
| `apps/mcp`        | `@beggy/mcp`    | MCP server for dev tooling (TS conversion, scaffolding, etc.) |
| `packages/shared` | `@beggy/shared` | Shared types, schemas (Zod), constants, enums, utils          |

**Root path aliases** (in root `tsconfig.json`):

- `@beggy/shared` → `./packages/shared/src`
- `@beggy/shared/*` → `./packages/shared/src/*`

---

## 3. Shared package (`@beggy/shared`)

- **Role**: Single source of truth for **types**, **Zod schemas**, **constants**, **enums**, and **utils** used by both API and web.
- **Build**: `tsc` → `dist/` with declarations.
- **Exports** (from `package.json`):
    - `./schemas` – Zod schemas (auth, user, profile, bag, item, suitcase, api, fields).
    - `./types` – TypeScript types (auth, user, profile, bag, item, suitcase, api, schema, constraints).
- **Contents**:
    - **Constants**: `user.enums`, `suitcase.enums`, `profile.enums`, `item.enums`, `bag.enums`, `auth.enums`, `api.enums`, `constraints`, `constraints.enums`, `permissions`, `messages`, `error.codes`, `containers/status`, `containers/calculations`.
    - **Schemas**: auth, user, profile, bag, item, suitcase, api, fields (Zod).
    - **Types**: matching domain types and API types.
    - **Utils**: e.g. `schema.util.ts`.
- **Dependencies**: `zod` (^4.1.13).
- **Tests**: Vitest, node environment, `tests/**/*.test.ts`, coverage for `src/**/*.ts`.

Use `@beggy/shared` and `@beggy/shared/schemas` (or `/types`) in both API and web to avoid drift.

---

## 4. API (`@beggy/api`)

### 4.1 Stack

- **Runtime**: Node >= 18, ESM (`"type": "module"`).
- **Framework**: **Express 5**.
- **Language**: **TypeScript** (compiled with **SWC** for build: `swc src -d dist/src`, etc.).
- **Database**: **PostgreSQL** with **Prisma 7** (client + `@prisma/adapter-pg`).
- **Auth**: JWT (access + refresh), **Passport** (Google, Facebook), **csrf-csrf** (double-submit cookie), **cookie-parser**, **express-session** (commented in current app), **express-flash**.
- **Security**: **helmet**, **express-xss-sanitizer**, **express-rate-limit**, **express-sanitizer**.
- **Validation**: **Zod** (via `@beggy/shared` schemas + route-level validators).
- **Authorization**: **CASL** (`@casl/ability`) – RBAC with Action/Scope/Subject (e.g. READ/OWN/BAG).
- **Logging**: **pino** + **pino-http** (JSON logs).
- **Docs**: **Swagger** (`swagger-jsdoc`, `swagger-ui-express`) at `/api-docs`.
- **Email**: **Resend**.
- **External**: **axios** (e.g. weather), **date-fns**.
- **Dev**: **tsx** for `dev` and seeds, **dotenv-cli** for test DB (`prisma:test`).

### 4.2 API structure

- **Entry**: `server.ts` (loads env, starts app) → `app.ts` (middleware + routes).
- **Routes**: Mounted in `app.route.ts` under **base path `/api/beggy`**:
    - `/users` – user management (create, list, get, update, delete, etc.).
    - `/profiles` – profile (e.g. `GET/PATCH /profiles/me`, `GET /profiles/:id`).
    - `/auth` – signup, login, logout, refresh-token, csrf-token, OAuth callbacks.
- **Modules** (feature-based under `src/modules/`):
    - **auth** – strategies (Google, Facebook), auth.service, auth.controller, auth.route, auth.mapper.
    - **users** – users.service, users.controller, users.route, user.mapper.
    - **profiles** – profiles.service, profiles.controller, profiles.route, profile.mapper.
    - **bags** – bags.service, bags.controller, bags.route.
    - **bag-items** – bag-items.service, bag-items.controller, bag-items.route.
    - **items** – items.service, items.controller, items.route.
    - **suitcases** – suitcases.service, suitcases.controller, suitcases.route.
    - **suitcase-items** – suitcase-items.service, suitcase-items.controller, suitcase-items.route.
    - **weather** – weather.service, weather.controller, weather.validator.
    - **gemini** – gemini.service (AI), integration tests.
- **Shared** (`src/shared/`): middlewares (auth, permission, validator, query, error, app), utils (cookies, app-error, api-response, password, transform, token), constants, types.
- **Config**: `src/config/` – env.config (validated env, cookies, JWT, CSRF, session, Passport), passport.config (when enabled).
- **Path aliases** (tsconfig / .swcrc): `@config`, `@shared`, `@modules`, `@emails`, `@route` (→ `app.route.ts`), `@prisma`, `@prisma-generated/*`, `@beggy/shared`.

### 4.3 Prisma

- **Schema**: Multi-file under `prisma/` – main `schema.prisma` (generator, datasource, enums) + `prisma/models/*.prisma` (User, Account, UserToken, Permission, RoleOnPermission, Profile, Bags, Items, Containers, ContainerItems, Suitcases, etc.).
- **Enums**: AuthProvider, Role, Action, Scope, Subject, TokenType, Material, ItemCategory, BagType, SuitcaseType, SuitcaseFeature, BagFeature, Size, WheelType, ContainerType, Gender, WeightUnit, VolumeUnit.
- **Generator**: `prisma-client`, output `./generated/prisma`, preview `relationJoins`.
- **Scripts**: `prisma:push`, `prisma:generate`, `prisma:migrate`, `prisma:deploy`, `prisma:reset`, `prisma:seed`, `prisma:test` (dotenv -e .env.test + migrate deploy).

### 4.4 API tests

- **Runner**: **Vitest** (merge with root `vitest.base.config.ts`).
- **Env**: Node, `setupFiles: ['./vitest.setup.ts']`.
- **Include**: `**/__tests__/*.test.ts`.
- **Coverage**: `src/**/*.ts`.
- **Types**: `@faker-js/faker`, `supertest`, `@types/supertest`.
- **Pattern**: Unit tests next to modules (e.g. `auth.service.test.ts`, `users.routes.test.ts`), integration tests (e.g. `auth.integration.test.ts`, `users.integration.test.ts`, `profiles.integration.test.ts`, bags, bag-items, items, suitcases, suitcase-items, weather, gemini).

---

## 5. Web app (`@beggy/web`)

### 5.1 Stack

- **Framework**: **Next.js 16** (React 19), `output: 'standalone'`, **React Compiler** enabled (`reactCompiler: true`).
- **UI**: **Tailwind CSS 4** (`@tailwindcss/postcss`), **shadcn**, **tw-animate-css**, **Radix UI**, **Base UI** (`@base-ui/react`), **class-variance-authority**, **clsx**, **tailwind-merge**.
- **State**: **Redux Toolkit** + **react-redux**.
- **Auth & RBAC**: **CASL** (`@casl/ability`, `@casl/react`) – same ability model as API; used in guards and UI.
- **Forms**: **react-hook-form** + **@hookform/resolvers** + **Zod**.
- **Icons**: **@hugeicons/react** / **@hugeicons/core-free-icons**.
- **Date**: **react-day-picker**, **date-fns**.
- **Data**: Uses `@beggy/shared` types/schemas; API client and list state (filters, sort, pagination) live in shared utils and store.

### 5.2 Web structure

- **App**: Next.js App Router – `src/app/` (e.g. `globals.css`, layout, pages).
- **Features**: Feature-based under `src/features/` (e.g. **users** – components/details, filters, actions, badges, etc.).
- **Shared**: `src/shared/` – **ui** (list: ListPagination, ListOrderBy, ListMeta, ListFilters, ListEmptyState; filter: ToggleFilter, SearchInput, NumberRangeFilter, DateRangeFilter; chips; actions), **store** (Redux store, Provider, ability slice, useAbility, Can), **hooks** (useLogout, useListQuery), **guards** (ProtectedRoute, AuthGate), **components/ui** (shadcn-style primitives), **lib** (e.g. utils), **types**, **mappers** (sort, filters).

### 5.3 Web tests

- **Runner**: **Vitest** (merge with root base config).
- **Env**: **jsdom**, `setupFiles: ./tests/vitest.setup.ts` (e.g. `@testing-library/jest-dom`).
- **Include**: `src/**/*.test.{ts,tsx}`, `src/**/__tests__/**/*.{ts,tsx}`.
- **Exclude**: node_modules, dist, build, .next, out, `**/*.stories.*`, `.storybook`, storybook-static, `**/*.spec.{e2e,cy}.*`.
- **Coverage**: `src/**/*.{ts,tsx}`, report dir `coverage/vitest/web`.
- **Storybook tests**: Separate config `vitest.storybook.config.ts` – **Playwright** browser (Chromium), `@storybook/addon-vitest` plugin, `storybookTest({ configDir: '.storybook' })`, setup `.storybook/vitest.setup.ts` (setProjectAnnotations from preview + a11y).

### 5.4 Storybook

- **Framework**: **@storybook/nextjs-vite** (Storybook 10).
- **Stories**: `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`.
- **Addons**: **@chromatic-com/storybook**, **@storybook/addon-vitest**, **@storybook/addon-a11y**, **@storybook/addon-docs**, **@storybook/addon-themes** (light/dark via `withThemeByClassName`).
- **Preview**: `globals.css` imported; theme decorator; a11y test mode configurable (e.g. `todo`).
- **Static**: `staticDirs: ['../public']`.
- **Scripts**: `storybook` (dev port 6006), `build-storybook`, `test:storybook` (Vitest with storybook config).

---

## 6. MCP app (`@beggy/mcp`)

- **Role**: **Model Context Protocol** server for dev/automation (e.g. TypeScript conversion, scaffolding, API-related tooling).
- **Stack**: **@modelcontextprotocol/sdk**, Node ESM, **tsx** for dev, **SWC** for build.
- **Uses**: `@beggy/shared`, **axios**, **dotenv**, **zod**.

---

## 7. Root / shared tooling

### 7.1 Scripts (root package.json)

- `pnpm dev` – turbo dev (all apps/packages).
- `pnpm build` – turbo build.
- `pnpm lint` / `pnpm lint:fix` – turbo lint.
- `pnpm type-check` – turbo type-check (depends on ^build).
- `pnpm test` / `pnpm test:coverage` – turbo test.
- `pnpm clean` – turbo clean + remove root node_modules.
- `pnpm format` / `pnpm format:check` – Prettier on `**/*.{ts,tsx,js,jsx,json,md,mjs}`.

### 7.2 ESLint (root eslint.config.mjs)

- **Base**: `@eslint/js` recommended, flat config.
- **Ignores**: node_modules, dist, build, .turbo, coverage, .next, out, config files, `**/__tests__/**`, `**/tests/**`, `**/*.test.*`.
- **TypeScript**: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-import`, `eslint-plugin-prettier`, `eslint-config-prettier`.
- **Rules**: recommended TS, Prettier (off in base), no-explicit-any (warn), no-unused-vars (error, ignore `^_`), consistent-type-imports (warn), import order, no-console (warn except warn/error), prefer-const, no-var.
- **Apps/packages**: Can extend or override with local `eslint.config.mjs`.

### 7.3 Prettier (.prettierrc)

- **Use tabs**, tabWidth 4, printWidth 80, singleQuote, semi, trailingComma es5, bracketSpacing true, arrowParens always, endOfLine lf.

### 7.4 TypeScript (root tsconfig.json)

- **Target**: ES2022, module ESNext, moduleResolution bundler, strict, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, noUncheckedIndexedAccess, noImplicitReturns, noImplicitOverride, skipLibCheck, incremental, types including `vitest/globals`.
- **Paths**: `@beggy/shared` → `./packages/shared/src`, `@beggy/shared/*` → `./packages/shared/src/*`.

### 7.5 Vitest (vitest.base.config.ts)

- **Plugins**: `vite-tsconfig-paths`.
- **Globals**: true, clearMocks, restoreMocks, mockReset.
- **Coverage**: v8, dir `coverage/vitest`, text/json/html, include `src/**/*.ts`, exclude tests/index.d.ts.

### 7.6 Turbo (turbo.json)

- **Tasks**: build (depends on ^build, outputs dist/build/.next, env NODE_ENV, DATABASE_URL, VITE_API_URL), dev (cache false, persistent, full env list), lint/lint:fix, type-check (depends on ^build), test (env list for secrets/API keys), test:coverage (cache false, outputs coverage/\*\*), clean, prisma:generate, prisma:migrate, prisma:studio.
- **globalEnv**: NODE_ENV, CI.
- **globalDependencies**: .env.\*local, .env, .eslintrc.js, eslint.config.mjs, tsconfig.json, turbo.json.

---

## 8. Environment & secrets (reference)

Used by Turbo and/or apps; **do not commit values**. Set in `.env`, `.env.local`, `.env.test`, `.env.docker` as needed:

- **NODE_ENV**, **DATABASE_URL**
- **JWT**: JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, JWT_REFRESH_REMEMBER_EXPIRES_IN, JWT_ACCESS_TOKEN_NAME, JWT_REFRESH_TOKEN_NAME
- **Session**: SESSION_SECRET
- **CSRF**: CSRF_SECRET_KEY
- **OAuth**: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET
- **Services**: RESEND_API_KEY, AI_API_KEY, OPENWEATHER_API_KEY

---

## 9. Quick reference – packages & tools

| Category     | Technology                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Monorepo     | pnpm workspaces, Turborepo                                                                                                                                         |
| API          | Express 5, Prisma 7, PostgreSQL, SWC, tsx, Zod, CASL, Passport (JWT, Google, Facebook), pino, Swagger, Resend, axios, helmet, csrf-csrf, rate-limit, xss-sanitizer |
| Web          | Next.js 16, React 19, Tailwind 4, shadcn, Radix/Base UI, Redux Toolkit, CASL, react-hook-form, Zod, Vitest (unit + Storybook), Playwright (Storybook tests)        |
| Shared       | TypeScript, Zod, constants/enums/types/schemas/utils                                                                                                               |
| MCP          | Model Context Protocol SDK, tsx, SWC                                                                                                                               |
| Testing      | Vitest (unit + integration + coverage), jsdom (web), Playwright (Storybook), @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, Faker |
| Storybook    | Storybook 10, nextjs-vite, addon-vitest, addon-a11y, addon-docs, addon-themes, Chromatic                                                                           |
| Code quality | ESLint 9 (TypeScript, import, Prettier), Prettier                                                                                                                  |

---

## 10. How to use this as “context”

- **For AI**: Paste or attach this file (or the sections that matter) when asking for code changes, refactors, or new features so the model knows stack, structure, and conventions.
- **For onboarding**: Read sections 1–2 and 9 first, then 3 (shared), 4 (API), 5 (web), and 7 (tooling) as needed.
- **For prompts**: You can say: “Use BEGGY_PROJECT_CONTEXT.md for stack and structure; keep using @beggy/shared, existing patterns for API modules and web features, and current test/Storybook setup.”

You can keep this file next to your Cursor rules or in the repo root and update it when you add apps, packages, or major tooling changes.
