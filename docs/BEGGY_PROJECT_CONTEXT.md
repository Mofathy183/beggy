# Beggy – Complete Project Context & Technical Reference

**Use this document as comprehensive context for AI assistants, new contributors, or yourself** to understand the entire Beggy project: idea, architecture, tech stack, packages, tools, tests, Storybook, and all implementation details.

---

## 1. Project Idea & Purpose

**Beggy** is an **AI-powered smart travel packing assistant** that helps travelers organize their luggage efficiently using:

- **Weather data integration** (OpenWeather API) for destination-aware packing recommendations
- **Intelligent AI recommendations** (Google Gemini AI) for personalized packing suggestions
- **Structured packing management**: bags, suitcases, items, categories with physical constraints
- **Role-based access control (RBAC)** for multi-user scenarios

**Core value proposition**: Reduce over/under-packing, optimize luggage organization, and provide intelligent recommendations based on destination weather and travel context.

**Keywords**: monorepo, turborepo, travel, packing, AI, weather, organization, trip-planning, luggage, TypeScript, React, Express, Prisma, PostgreSQL, RBAC, CASL.

---

## 2. Repository Structure (Monorepo)

### 2.1 Package Manager & Orchestration

- **Package manager**: `pnpm` (>= 8.0.0), workspace root at repo root
- **Orchestration**: **Turborepo** (`turbo.json`) for task orchestration and caching
- **Package manager version**: `pnpm@10.30.x` at root (see `packageManager` in root `package.json`); individual apps may pin different versions
- **Workspace catalog**: `pnpm-workspace.yaml` defines a `catalog` for shared dependency versions (notably `zod`). Apps/packages can reference versions via `zod: "catalog:"` for consistency.

### 2.2 Workspaces (`pnpm-workspace.yaml`)

| Path              | Name            | Purpose                                                       |
| ----------------- | --------------- | ------------------------------------------------------------- |
| `apps/api`        | `@beggy/api`    | REST API backend (Express, Prisma, PostgreSQL)                |
| `apps/web`        | `@beggy/web`    | Next.js frontend (React 19, Tailwind, shadcn)                 |
| `apps/mcp`        | `@beggy/mcp`    | MCP server for dev tooling (TS conversion, scaffolding, etc.) |
| `packages/shared` | `@beggy/shared` | Shared types, schemas (Zod), constants, enums, utils          |

**Ignored built dependencies**: `sharp`, `unrs-resolver` (handled by pnpm)

### 2.3 Root Path Aliases (`tsconfig.json`)

- `@beggy/shared` → `./packages/shared/src`
- `@beggy/shared/*` → `./packages/shared/src/*`

---

## 3. Shared Package (`@beggy/shared`)

### 3.1 Purpose & Role

**Single source of truth** for types, Zod schemas, constants, enums, and utility functions used by both API and web applications. Prevents type drift and ensures consistency.

### 3.2 Build & Output

- **Build tool**: TypeScript compiler (`tsc`)
- **Output**: `dist/` directory with declarations (`.d.ts` files)
- **Type**: ESM (`"type": "module"`)
- **Main entry**: `./dist/index.js` with types `./dist/index.d.ts`

### 3.3 Exports (`package.json`)

- `./schemas` → `./dist/schemas/index.js` (Zod schemas)
- `./types` → `./dist/types/index.js` (TypeScript types)

**Note**: Additional exports may be added for `./utils`, `./constants`, `./containers` (see comments in `src/index.ts`)

### 3.4 Contents Structure

**Constants** (`src/constants/`):

- `user.enums.ts` – User-related enums
- `suitcase.enums.ts` – Suitcase-related enums
- `profile.enums.ts` – Profile-related enums
- `item.enums.ts` – Item-related enums
- `bag.enums.ts` – Bag-related enums
- `auth.enums.ts` – Authentication-related enums
- `api.enums.ts` – API-related enums
- `constraints.ts` – Validation constraints
- `constraints.enums.ts` – Constraint enums
- `permissions.ts` – RBAC permissions
- `messages.ts` – User-facing messages
- `error.codes.ts` – Error code constants

**Containers** (`src/containers/`):

- `status.ts` – Container status utilities
- `calculations.ts` – Container calculation utilities

**Schemas** (`src/schemas/`):

- `auth.schema.ts` – Authentication Zod schemas
- `user.schema.ts` – User Zod schemas
- `profile.schema.ts` – Profile Zod schemas
- `bag.schema.ts` – Bag Zod schemas
- `item.schema.ts` – Item Zod schemas
- `suitcase.schema.ts` – Suitcase Zod schemas
- `api.schema.ts` – API request/response schemas
- `fields.schema.ts` – Field-level schemas

**Types** (`src/types/`):

- `auth.types.ts` – Authentication TypeScript types
- `user.types.ts` – User TypeScript types
- `profile.types.ts` – Profile TypeScript types
- `bag.types.ts` – Bag TypeScript types
- `item.types.ts` – Item TypeScript types
- `suitcase.types.ts` – Suitcase TypeScript types
- `api.types.ts` – API TypeScript types
- `schema.types.ts` – Schema-related types
- `constraints.types.ts` – Constraint types

**Utils** (`src/utils/`):

- `schema.util.ts` – Schema utility functions

### 3.5 Dependencies

- `zod` (^4.1.13) – Schema validation

### 3.6 Scripts

- `build` – Compile TypeScript to `dist/`
- `test` / `test:watch` / `test:coverage` – Vitest tests
- `lint` / `lint:fix` – ESLint
- `type-check` – TypeScript type checking

### 3.7 Tests

- **Runner**: Vitest (merges with root `vitest.base.config.ts`)
- **Environment**: Node
- **Include**: `tests/**/*.test.ts`
- **Coverage**: `src/**/*.ts`

### 3.8 TypeScript Config

- **Target**: ES2022
- **Module**: ESNext
- **Module resolution**: Bundler
- **Strict mode**: Enabled with additional strict checks
- **Composite**: true (for incremental builds)
- **Declaration**: true (generates `.d.ts` files)

**Usage**: Always import from `@beggy/shared` and `@beggy/shared/schemas` (or `/types`) in both API and web to maintain consistency.

---

## 4. API Application (`@beggy/api`)

### 4.1 Technology Stack

**Runtime & Language**:

- **Node.js**: >= 18.0.0
- **TypeScript**: Compiled with **SWC** (faster than tsc)
- **Module system**: ESM (`"type": "module"`)

**Framework & Server**:

- **Express.js**: ^5.1.0 (v5)
- **Entry point**: `server.ts` → `app.ts`

**Database & ORM**:

- **PostgreSQL**: Database
- **Prisma**: ^7.3.0 (ORM + migrations)
- **@prisma/adapter-pg**: ^7.3.0 (PostgreSQL adapter)
- **@prisma/client**: ^7.3.0 (Prisma Client)

**Authentication & Authorization**:

- **JWT**: `jsonwebtoken` ^9.0.3 (access + refresh tokens)
- **Passport.js**: ^0.7.0 (authentication strategies)
    - `passport-google-oauth20` ^2.0.0 (Google OAuth)
    - `passport-facebook` ^3.0.0 (Facebook OAuth)
- **csrf-csrf**: ^4.0.3 (double-submit cookie CSRF protection)
- **cookie-parser**: ^1.4.7 (cookie handling)
- **express-session**: ^1.18.1 (session management)
- **express-flash**: ^0.0.2 (flash messages)
- **CASL**: `@casl/ability` ^6.8.0 (RBAC authorization)

**Security**:

- **helmet**: ^8.1.0 (HTTP security headers)
- **express-xss-sanitizer**: ^2.0.1 (XSS protection)
- **express-sanitizer**: ^1.0.6 (input sanitization)
- **express-rate-limit**: ^7.5.0 (rate limiting)
- **bcryptjs**: ^3.0.3 (password hashing)

**Validation**:

- **Zod**: ^4.1.13 (via `@beggy/shared` schemas + route-level validators)

**Logging**:

- **pino**: ^9.6.0 (structured JSON logging)
- **pino-http**: ^10.4.0 (HTTP request logging)
- **pino-pretty**: ^13.1.3 (dev pretty printing)

**API Documentation**:

- **swagger-jsdoc**: ^6.2.8 (Swagger/OpenAPI docs generation)
- **swagger-ui-express**: ^5.0.1 (Swagger UI at `/api-docs`)

**Email**:

- **Resend**: ^4.2.0 (transactional emails)

**External APIs**:

- **axios**: ^1.8.4 (HTTP client for weather, AI, etc.)

**Utilities**:

- **date-fns**: ^4.1.0 (date manipulation)
- **dotenv**: ^16.4.7 (environment variables)

**Development Tools**:

- **tsx**: ^4.21.0 (TypeScript execution for dev and seeds)
- **@swc/cli**: ^0.7.9 (SWC compiler CLI)
- **@swc/core**: ^1.15.3 (SWC core)
- **dotenv-cli**: ^11.0.0 (env vars for test scripts)
- **@faker-js/faker**: ^9.6.0 (test data generation)
- **supertest**: ^7.1.0 (API testing)

### 4.2 API Structure

**Entry Points**:

- `server.ts` – Loads environment, starts Express app
- `app.ts` – Express app configuration, middleware, routes
- `app.route.ts` – Root router composition (mounts all module routes)

**Base Path**: All API routes are mounted under `/api/beggy`

**Route Modules** (`app.route.ts`) — **currently mounted**:

- `/users` – User management (create, list, get, update, delete, etc.)
- `/profiles` – Profile management (`GET/PATCH /profiles/me`, `GET /profiles/:id`)
- `/auth` – Authentication (signup, login, logout, refresh-token, csrf-token, OAuth callbacks)

**Module Structure** (`src/modules/`):

Each module follows a consistent pattern:

- `{module}.service.ts` – Business logic
- `{module}.controller.ts` – Request/response handling
- `{module}.route.ts` – Route definitions (factory function pattern)
- `{module}.mapper.ts` – Data transformation (optional)
- `{module}.validator.ts` – Route-level validation (optional)
- `__tests__/` or `__test__/` – Test files

**Modules present in codebase**:

- **Mounted in router**: **auth**, **users**, **profiles** (see `app.route.ts`).
- **Implemented but not mounted** (routes exist in code and Swagger/docs; add to `app.route.ts` when needed): **bags**, **bag-items**, **items**, **suitcases**, **suitcase-items**, **weather**, **gemini**.

**Shared Infrastructure** (`src/shared/`):

- **middlewares/**:
    - `auth.middleware.ts` – Authentication middleware
    - `permission.middleware.ts` – CASL-based authorization
    - `validator.middleware.ts` – Request validation
    - `query.middleware.ts` – Query parameter parsing
    - `error.middleware.ts` – Error handling
    - `app.middleware.ts` – Application-level middleware
- **utils/**:
    - `cookies.util.ts` – Cookie utilities
    - `app-error.util.ts` – Error creation
    - `api-response.util.ts` – Standardized API responses
    - `password.util.ts` – Password hashing/verification
    - `transform.util.ts` – Data transformation
    - `token.util.ts` – JWT token utilities
- **constants/** – Shared constants
- **types/** – Shared TypeScript types

**Configuration** (`src/config/`):

- `env.config.ts` – Environment variable validation and configuration (JWT, CSRF, session, Passport, cookies, etc.)
- `passport.config.ts` – Passport strategies configuration (when enabled)
- `index.ts` – Config exports

**Path Aliases** (API `tsconfig.json` / `.swcrc`):

- `@beggy/shared` → `../../packages/shared/src`
- `@beggy/shared/*` → `../../packages/shared/src/*`
- `@/*` → `src/*`
- `@config` → `src/config/index.ts`
- `@shared` → `src/shared/index.ts`
- `@modules` → `src/modules/index.ts`
- `@emails` → `src/emails/index.ts`
- `@route` → `app.route.ts`
- `@prisma` → `prisma`
- `@prisma/*` → `prisma/*`
- `@prisma-generated/*` → `prisma/generated/prisma/*`
- `@doc` → `docs/swaggerDef.doc`

### 4.3 Prisma Database Schema

**Schema Location**: `prisma/schema.prisma` (main) + `prisma/models/*.prisma` (model files)

**Generator**:

- Provider: `prisma-client`
- Output: `./generated/prisma`
- Preview features: `relationJoins`

**Datasource**: PostgreSQL

**Enums** (defined in main schema):

- **Auth**: `AuthProvider` (GOOGLE, FACEBOOK, LOCAL), `Role` (ADMIN, MODERATOR, MEMBER, USER), `Action` (CREATE, READ, UPDATE, DELETE, MANAGE), `Scope` (OWN, ANY), `Subject` (BAG, ITEM, SUITCASE, USER, ROLE, PERMISSION), `TokenType` (EMAIL_VERIFICATION, PASSWORD_RESET, CHANGE_EMAIL)
- **Domain**: `Material`, `ItemCategory`, `BagType`, `SuitcaseType`, `SuitcaseFeature`, `BagFeature`, `Size`, `WheelType`, `ContainerType`, `Gender`
- **Measurement**: `WeightUnit`, `VolumeUnit`

**Models** (in `prisma/models/`):

- `user.prisma` – User, UserToken, Permission, RoleOnPermission
- `account.prisma` – Account (OAuth accounts)
- `profile.prisma` – Profile
- `bag.prisma` – Bags
- `item.prisma` – Items
- `suitcase.prisma` – Suitcases
- `containers.prisma` – Containers, ContainerItems (polymorphic container system)

**Prisma Scripts**:

- `prisma:push` – Push schema to database (dev)
- `prisma:generate` – Generate Prisma Client
- `prisma:migrate` – Create and apply migrations
- `prisma:deploy` – Deploy migrations (production)
- `prisma:reset` – Reset database
- `prisma:seed` – Seed database
- `prisma:test` – Run migrations for test DB (`dotenv -e .env.test -- pnpm prisma migrate deploy`)

### 4.4 API Tests

**Test Runner**: Vitest (merges with root `vitest.base.config.ts`)

**Configuration** (`vitest.config.ts`):

- **Environment**: Node
- **Setup**: `./vitest.setup.ts`
- **Include**: `**/__tests__/*.test.ts`
- **Coverage**: `src/**/*.ts`

**Test Patterns**:

- **Unit tests**: Next to modules (e.g., `auth.service.test.ts`, `users.routes.test.ts`)
- **Integration tests**: Full API testing (e.g., `auth.integration.test.ts`, `users.integration.test.ts`, `profiles.integration.test.ts`, bags, bag-items, items, suitcases, suitcase-items, weather, gemini)
- **Test utilities**: `@faker-js/faker` for test data, `supertest` for HTTP testing

**Test Scripts**:

- `test` – Run tests once
- `test:watch` – Watch mode
- `test:integration` – Run integration tests (includes DB setup)
- `test:coverage` – Generate coverage report

### 4.5 Build & Scripts

**Build**:

- `build` – SWC compile `src` → `dist/src`, `server.ts` and `app.ts` → `dist/`
- `build:watch` – Watch mode build
- `start` – Run production build (`node dist/server.js`)
- `dev` – Development mode (`tsx watch server.ts`)

**Other Scripts**:

- `type-check` – TypeScript type checking
- `lint` / `lint:fix` – ESLint
- `format` / `format:check` – Prettier

---

## 5. Web Application (`@beggy/web`)

### 5.1 Technology Stack

**Framework**:

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **React DOM**: 19.2.3
- **React Compiler**: Enabled (`reactCompiler: true` in `next.config.ts`)
- **Output**: `standalone` (for Docker/deployment)

**Styling & UI**:

- **Tailwind CSS**: ^4.1.18 (`@tailwindcss/postcss` ^4.1.18)
- **shadcn**: ^3.8.5 (UI component library)
- **Radix UI**: ^1.4.3 (headless UI primitives)
- **Base UI**: `@base-ui/react` ^1.1.0 (additional UI primitives)
- **tw-animate-css**: ^1.4.0 (Tailwind animations)
- **class-variance-authority**: ^0.7.1 (component variants)
- **clsx**: ^2.1.1 (conditional classes)
- **tailwind-merge**: ^3.4.0 (merge Tailwind classes)
- **next-themes**: ^0.4.6 (dark mode support)

**State Management**:

- **Redux Toolkit**: `@reduxjs/toolkit` ^2.11.2
- **React Redux**: `react-redux` ^9.2.0

**Forms**:

- **React Hook Form**: `react-hook-form` ^7.71.1
- **Zod Resolver**: `@hookform/resolvers` ^5.2.2 (Zod validation)
- **Zod**: ^4.1.13 (via `@beggy/shared`)

**Authorization**:

- **CASL**: `@casl/ability` ^6.8.0, `@casl/react` ^5.0.1 (same RBAC model as API)

**Icons**:

- **Hugeicons**: `@hugeicons/react` ^1.1.5, `@hugeicons/core-free-icons` ^3.1.1

**Date Handling**:

- **react-day-picker**: ^9.13.2 (date picker)
- **date-fns**: ^4.1.0 (date utilities)

**Utilities**:

- **tslib**: ^2.8.1 (TypeScript helpers)

**Shared Package**: `@beggy/shared` (workspace) – types, schemas, constants

### 5.2 Web Structure

**App Router** (`src/app/`):

- Next.js 16 App Router structure
- `globals.css` – Global styles (Tailwind imports, theme variables)
- Layout and page components

**Features** (`src/features/`):
Feature-based organization. Each feature contains:

- `components/` – Feature-specific components
    - `details/` – Detail views (e.g., `UserCard.tsx`)
    - `list/` – List views (e.g., `UsersGrid.tsx`, `UsersFilters.tsx`, `UsersOrderBy.tsx`, `UsersEmptyState.tsx`)
    - `forms/` – Form components (e.g., `CreateUserForm.tsx`, `CreateUserFormUI.tsx`)
    - `actions/` – Action components (e.g., `UserActions.tsx`)
    - `badges/` – Badge components (e.g., `UserStatusBadge.tsx`, `UserRoleBadge.tsx`)
    - `filters/` – Filter components
- `hooks/` – Feature-specific hooks (e.g., `useUserMutations.ts`, `useUserActions.ts`, `useListQuery.ts`)
- `api/` – API client functions (e.g., `users.api.ts`)
- `index.ts` – Feature exports

**Example Features**:

- **auth** – Authentication UX + session hydration (login/signup forms, OAuth buttons, `/auth/callback`)
- **profiles** – Profile editing + onboarding completion flow (soft-nudge onboarding)
- **items** – Personal item library (list, filters, order-by, create/update dialogs)
- **users** – User management UI (list, create, edit, filters, badges, actions)

**Shared UI** (`src/shared/ui/`):

- **list/** – List components:
    - `ListPagination.tsx` – Pagination controls
    - `ListOrderBy.tsx` – Sort/order controls
    - `ListMeta.tsx` – List metadata display
    - `ListFilters.tsx` – Filter container
    - `ListEmptyState.tsx` – Empty state display
- **filter/** – Filter components:
    - `ToggleFilter.tsx` – Toggle/boolean filters
    - `SearchInput.tsx` – Search input
    - `NumberRangeFilter.tsx` – Number range filter
    - `DateRangeFilter.tsx` – Date range filter
- **chips/** – Chip components:
    - `Chips.tsx` – Chip container
    - `Chip.tsx` – Individual chip
- **actions/** – Action components:
    - `ActionsMenu.tsx` – Actions menu
- **grid/** – Grid components:
    - `DataGrid.tsx` – Data grid layout
- **states/** – State components:
    - `Forbidden.tsx` – 403 forbidden state
    - `ErrorState.tsx` – Error state
    - `NotFoundState.tsx` – 404 not found state

**Shared Infrastructure** (`src/shared/`):

- **api/** – API client layer:
    - `baseQuery.ts` – Base fetch/query setup
    - `api.slice.ts` – Redux API slice
- **layouts/** – App shell and navigation:
    - `AppShell.tsx` – Header + Sidebar wrapper for dashboard pages
    - `HeaderUI.tsx`, `Sidebar.tsx`, `SidebarUI.tsx` – Layout components
- **store/** – Redux store:
    - `store.ts` – Store configuration
    - `Provider.tsx` – Redux Provider component
    - `hooks.ts` – Redux hooks
    - **ability/** – CASL ability:
        - `ability.ts` – Ability definition
        - `ability.slice.ts` – Redux slice
        - `useAbility.ts` – Hook
        - `Can.tsx` – Permission component
- **hooks/** – Shared hooks:
    - `useLogout.ts` – Logout hook
    - `useListQuery.ts` – List query hook
- **guards/** – Route guards:
    - `ProtectedRoute.tsx` – Protected route wrapper
    - `AuthGate.tsx` – Authentication gate
- **components/ui/** – shadcn-style UI primitives (button, input, select, card, dialog, etc.)
- **lib/** – Utilities (e.g., `utils.ts` for `cn()`)
- **types/** – Shared TypeScript types
- **mappers/** – Data mappers:
    - `sort.mapper.ts` – Sort parameter mapping
    - `filters.mapper.ts` – Filter parameter mapping
- **utils/** – Shared utilities:
    - `query.utils.ts` – List/query utilities
    - `error.utils.ts` – API error handling
    - `notify.utils.ts` – Typed notifications wrapper around Sonner (success/error/warning/info) + `HttpClientError` mapping

**Web path aliases** (`apps/web/tsconfig.json`): `@/*` → `./src/*`, `@shared/*` → `./src/shared/*`, `@features/*` → `./src/features/*`, `@shadcn-ui/*` → `src/shared/components/ui/*`, `@shared-ui/*` → `./src/shared/ui/*`, `@beggy/shared` and `@beggy/shared/*` for the shared package.

### 5.3 Web Tests

**Test Runner**: Vitest (merges with root `vitest.base.config.ts`)

**Configuration** (`vitest.config.ts`):

- **Environment**: jsdom
- **Setup**: `./tests/vitest.setup.ts` (includes `@testing-library/jest-dom`)
- **Include**: `src/**/*.test.{ts,tsx}`, `src/**/__tests__/**/*.{ts,tsx}`
- **Exclude**: node_modules, dist, build, .next, out, `**/*.stories.*`, `.storybook`, storybook-static, `**/*.spec.{e2e,cy}.*`
- **Coverage**: `src/**/*.{ts,tsx}`, report dir `coverage/vitest/web`
- **File parallelism**: false (for stability)

**Test Libraries**:

- `@testing-library/react` ^16.3.2
- `@testing-library/jest-dom` ^6.9.1
- `@testing-library/user-event` ^14.6.1
- `jsdom` ^28.0.0 (DOM environment)

**Test Scripts**:

- `test` – Run tests once
- `test:dev` – Standalone Vitest
- `test:watch` – Watch mode
- `test:coverage` – Generate coverage
- `test:ui` – Vitest UI

### 5.4 Storybook

**Framework**: `@storybook/nextjs-vite` (Storybook 10.2.8)

**Configuration** (`.storybook/main.ts`):

- **Stories**: `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- **Addons**:
    - `@chromatic-com/storybook` ^5.0.1 (Chromatic integration)
    - `@storybook/addon-vitest` ^10.2.8 (Vitest integration)
    - `@storybook/addon-a11y` ^10.2.8 (Accessibility testing)
    - `@storybook/addon-docs` ^10.2.8 (Documentation)
    - `@storybook/addon-themes` ^10.2.8 (Theme switching)
- **Framework**: `@storybook/nextjs-vite`
- **Static dirs**: `../public`

**Preview** (`.storybook/preview.ts`):

- Imports `globals.css`
- Theme decorator (`withThemeByClassName`) – light/dark mode
- A11y test mode configurable (e.g., `todo`)

**Storybook Tests** (`vitest.storybook.config.ts`):

- **Browser**: Playwright (Chromium) via `@vitest/browser-playwright` ^4.0.18
- **Plugin**: `@storybook/addon-vitest` – `storybookTest({ configDir: '.storybook' })`
- **Setup**: `.storybook/vitest.setup.ts` (setProjectAnnotations from preview + a11y)
- **Test name**: `storybook`
- **Headless**: true

**Storybook Scripts**:

- `storybook` – Dev server (port 6006)
- `build-storybook` – Build static Storybook
- `test:storybook` – Run Storybook tests (`vitest run -c vitest.storybook.config.ts`)

**Story Examples**:

- `CreateUserFormUI.stories.tsx` – Form component stories with docs
- `ListFilters.stories.tsx` – List filter stories
- Component stories follow Storybook best practices with autodocs, argTypes, and descriptions

### 5.5 Build & Scripts

**Build**:

- `dev` – Next.js dev server
- `build` – Next.js production build
- `start` – Start production server

**Other Scripts**:

- `lint` – ESLint
- `test` / `test:watch` / `test:coverage` / `test:ui` / `test:storybook` – Tests
- `storybook` / `build-storybook` – Storybook

### 5.6 Key Screens & Flows (Current Web UI)

**High-level UX**: A small but production-style admin UI for managing Beggy users, built to showcase the **design system, layout shell, RBAC patterns, and data-fetching patterns** that future bags/suitcases/packing features will follow.

- **Public Landing (`/`)**
    - Simple marketing-style entry point rendered from `src/app/page.tsx`.
    - Uses the shared `ThemeToggle` and shadcn `Button` components.
    - Copy: "Beggy – Discover the perfect bag for your journey", with primary calls-to-action like **"Browse Bags"** and **"Add New Bag"** (currently stubbed – wiring into real flows is future work).

- **Protected Area Layout (`src/app/(protected)/layout.tsx`)**
    - Wraps all authenticated routes in `AuthGate` and renders the `AppShell` from `@shared/layouts` (Header + Sidebar).
    - Intended responsibilities:
        - **Auth boundary** via `AuthGate` (`@shared/guards`) to check session and redirect if unauthenticated.
        - Provide a consistent dashboard chrome (header/sidebar) for admin-style pages.
    - Future-proofed so that some authenticated pages can opt out of the dashboard shell if needed (e.g., wizards, print views).

- **Users List (`/users`)**
    - Implemented as a protected route at `src/app/(protected)/users/page.tsx` which delegates to `UsersPage` from `@features/users/pages`.
    - Provides:
        - Paginated grid of users (`UsersGrid`) wrapped in shared list components (`ListPagination`, `ListMeta`, `ListEmptyState`, filters, order-by).
        - **Filters** and **sorting** via `UsersFilters` and `UsersOrderBy`, powered by the shared `useListQuery` utilities.
        - **Actions** such as viewing details, opening dialogs, and invoking mutations via `UserActions` and `useUserActions`.

- **User Details (`/users/[id]`)**
    - Dynamic route in `src/app/(protected)/users/[id]/page.tsx` that renders `UserDetailsPage`.
    - `UserDetailsPage`:
        - Reads the user id from `useParams`.
        - Fetches data via `useUserDetails` (feature hook that talks to `features/users/api/users.api.ts`).
        - Renders:
            - `UserDetailsHeader` (title, metadata, back button).
            - `UserCard` with badges for **status**, **role**, and **email verification** (using semantic design tokens for visual state).
        - Handles **loading**, **error**, and **empty** states:
            - Skeleton loaders while fetching.
            - Error card with destructive-colored icon and "Try Again" button (retry via `refetch`).

- **OAuth Callback (`/auth/callback`)**
    - Transitional client-only landing page after OAuth redirects.
    - Assumes the API has already set auth cookies; the web app hydrates session state via `AuthBootstrap` (mounted in root layout).
    - Intended redirect outcomes:
        - **authenticated + onboarding incomplete** → `/onboarding`
        - **authenticated + onboarding completed** → `/dashboard`
        - **unauthenticated** → `/login?error=oauth_failed`

- **Onboarding (`/onboarding`)**
    - Soft-nudge onboarding flow that collects optional profile info after first login/OAuth.
    - Uses a single orchestrator hook pattern:
        - `useOnboarding` performs:
            - `POST /profiles/me/onboarding`
            - `GET /auth/me` (rehydrate auth slice)
            - redirect to dashboard (default `/dashboard`)
    - Supports “Skip for now” which sets the onboarding completion flag without forcing data entry.

- **Items Library (`/items`)**
    - Personal item inventory feature (create/update, list, filters, sorting, pagination).
    - Mirrors the same list + dialog + form patterns used in Users.
    - Uses `notify` utilities for consistent user feedback.

- **Users CRUD & Role Management (Component-Level Flows)**
    - **Create User**:
        - `CreateUserForm` (container) + `CreateUserFormUI` (presentational) follow the **form pattern**:
            - React Hook Form + Zod schemas from `@beggy/shared`.
            - Server/API error surfaced at form level.
            - Tested via `CreateUserForm.test.tsx`.
        - `CreateUserDialog` wires the form into a modal flow.
    - **Change Role**:
        - `ChangeRoleForm` + `ChangeRoleFormUI` for updating roles.
        - `ChangeRoleDialog` wraps the form in a dialog for inline admin actions.
    - All of these flows are designed to be **copy-paste-ready blueprints** for future domain features (bags, suitcases, items, packing lists) while reusing the same shared list, filters, and badge patterns.

**Takeaway**: The current web app is a **thin but fully structured frontend slice**: landing page, protected dashboard shell, and a complete user-management feature wired to the API. New features (bags, suitcases, packing flows) should follow the same **feature structure, list/detail patterns, forms pattern, and design system rules** documented here.

### 5.7 Notifications & Toast UX (Sonner)

Beggy standardizes notifications via:

- `Toaster` from Sonner (mounted once at the app root)
- `notify` from `src/shared/utils/notify.utils.ts` as the **single API** components should call

UX rules:

- **Consistency**: icon, duration defaults, and message shape are centralized.
- **Error hygiene**: user-facing copy is `message + suggestion`; machine-readable codes stay out of toasts.
- **Theme + tokens**: Sonner is configured so the semantic token system owns colors in light/dark mode (no “rich colors” overrides).
- **RTL-friendly positioning**: toast position relies on logical behavior to render correctly under RTL.

---

## 6. MCP Application (`@beggy/mcp`)

### 6.1 Purpose

**Model Context Protocol (MCP) server** for automated development tasks:

- TypeScript conversion (JS → TS)
- Component scaffolding
- API testing
- Code generation

### 6.2 Technology Stack

- **Runtime**: Node >= 18.0.0, ESM (`"type": "module"`)
- **SDK**: `@modelcontextprotocol/sdk` ^1.24.3
- **Build**: SWC (`@swc/cli` ^0.7.9, `@swc/core` ^1.10.1)
- **Dev**: `tsx` ^4.19.2 (watch mode)
- **Dependencies**: `@beggy/shared` (workspace), `axios` ^1.7.9, `dotenv` ^16.4.5, `zod` ^4.1.13

### 6.3 Scripts

- `dev` – Watch mode (`tsx watch src/index.ts`)
- `build` – SWC compile
- `start` – Run production build
- `test:convert` – Test conversion tool
- `lint` / `lint:fix` – ESLint
- `format` / `format:check` – Prettier
- `type-check` – TypeScript checking

### 6.4 Bin

- `beggy-mcp` → `./dist/src/index.js` (CLI command)

---

## 7. Root / Shared Tooling

### 7.1 Root Scripts (`package.json`)

- `dev` – `turbo run dev` (all apps/packages)
- `build` – `turbo run build`
- `lint` / `lint:fix` – `turbo run lint` / `lint:fix`
- `type-check` – `turbo run type-check` (depends on ^build)
- `test` / `test:coverage` – `turbo run test` / `test:coverage`
- `clean` – `turbo run clean && rm -rf node_modules`
- `format` / `format:check` – Prettier on `**/*.{ts,tsx,js,jsx,json,md,mjs}`
- `docker:dev` – `docker compose -f docker-compose.dev.yml up --build`
- `docker:dev:down` – `docker compose -f docker-compose.dev.yml down`
- `docker:dev:reset` – `docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up --build`
- `docker:prod` – `docker compose -f docker-compose.prod.yml up --build`
- `docker:prod:down` – `docker compose -f docker-compose.prod.yml down`

### 7.2 ESLint Configuration (`eslint.config.mjs`)

**Base**: ESLint 9 flat config, `@eslint/js` recommended

**Ignores**:

- `**/node_modules/**`, `**/dist/**`, `**/build/**`, `**/.turbo/**`, `**/coverage/**`, `**/.next/**`, `**/out/**`
- Config files: `*.config.js`, `*.config.mjs`, `*.config.ts`
- Test files: `**/__tests__/**`, `**/tests/**`, `**/*.test.*`

**TypeScript Configuration**:

- **Parser**: `@typescript-eslint/parser`
- **Plugin**: `@typescript-eslint/eslint-plugin`
- **Rules**:
    - Recommended TypeScript rules
    - `@typescript-eslint/no-explicit-any`: warn
    - `@typescript-eslint/no-unused-vars`: error (ignore `^_`)
    - `@typescript-eslint/consistent-type-imports`: warn (prefer type-imports)
- **Import plugin**: `eslint-plugin-import`
    - `import/first`: error
    - `import/no-duplicates`: error
- **Prettier**: `eslint-plugin-prettier`, `eslint-config-prettier` (Prettier rules off in base)
- **General**: `no-console`: warn (allow warn/error), `prefer-const`: error, `no-var`: error

**JavaScript Configuration**:

- `no-console`: off

**Apps/packages**: Can extend or override with local `eslint.config.mjs`

### 7.3 Prettier Configuration (`.prettierrc`)

```json
{
	"arrowParens": "always",
	"bracketSpacing": true,
	"printWidth": 80,
	"semi": true,
	"singleQuote": true,
	"tabWidth": 4,
	"trailingComma": "es5",
	"useTabs": true,
	"endOfLine": "lf"
}
```

### 7.4 TypeScript Configuration (`tsconfig.json`)

**Language & Environment**:

- **Target**: ES2022
- **Lib**: ES2022
- **Module**: ESNext
- **Module resolution**: bundler
- **JSX**: preserve

**Type Checking** (strict):

- `strict`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noFallthroughCasesInSwitch`: true
- `noUncheckedIndexedAccess`: true
- `noImplicitReturns`: true
- `noImplicitOverride`: true
- `allowUnusedLabels`: false
- `allowUnreachableCode`: false

**Module Resolution**:

- `resolveJsonModule`: true
- `allowSyntheticDefaultImports`: true
- `esModuleInterop`: true
- `forceConsistentCasingInFileNames`: true
- `isolatedModules`: true

**Testing**:

- `types`: `["vitest/globals"]` (enables global Vitest APIs)

**Emit**:

- `declaration`: true
- `declarationMap`: true
- `sourceMap`: true
- `removeComments`: false
- `importHelpers`: true

**Interop**:

- `allowJs`: false
- `checkJs`: false
- `skipLibCheck`: true

**Incremental**:

- `incremental`: true
- `composite`: false

**Path Aliases**:

- `@beggy/shared` → `./packages/shared/src`
- `@beggy/shared/*` → `./packages/shared/src/*`

**Exclude**: `node_modules`, `dist`, `build`, `.turbo`, `coverage`

### 7.5 Vitest Base Configuration (`vitest.base.config.ts`)

**Plugins**: `vite-tsconfig-paths` (path alias support)

**Test Configuration**:

- `globals`: true (global APIs: describe, it, expect)
- `clearMocks`: true
- `restoreMocks`: true
- `mockReset`: true

**Coverage**:

- **Provider**: v8
- **Reports directory**: `coverage/vitest`
- **Reporters**: text, json, html
- **Include**: `src/**/*.ts`
- **Exclude**: `src/tests/**`, `src/index.ts`, `**/*.d.ts`

### 7.6 Turborepo Configuration (`turbo.json`)

**UI**: TUI (Terminal UI)

**Tasks**:

**build**:

- Depends on: `^build` (build dependencies first)
- Inputs: `$TURBO_DEFAULT$`, `.env*`
- Outputs: `dist/**`, `build/**`, `.next/**`
- Env: `NODE_ENV`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`

**dev**:

- Cache: false
- Persistent: true
- Env: Full list (NODE_ENV, DATABASE_URL, JWT secrets, session, CSRF, OAuth, API keys)

**lint** / **lint:fix**:

- Depends on: `^lint` / `^lint:fix`
- Inputs: `src/**/*.{ts,tsx,js,jsx}`, `eslint.config.mjs`, `tsconfig.json`
- Outputs: [] (no outputs)

**type-check**:

- Depends on: `^build`
- Inputs: `src/**/*.{ts,tsx}`, `tsconfig.json`
- Outputs: []

**test**:

- Inputs: `src/**/*.{ts,tsx}`, `**/*.test.{ts,tsx}`, `**/*.spec.{ts,tsx}`
- Outputs: []
- Env: Full list (same as dev)

**test:coverage**:

- Cache: false
- Outputs: `coverage/**`

**clean**:

- Cache: false

**prisma:generate**:

- Cache: false
- Outputs: `node_modules/.prisma/**`

**prisma:migrate**:

- Cache: false
- Env: `DATABASE_URL`

**prisma:studio**:

- Cache: false
- Persistent: true
- Env: `DATABASE_URL`

**Global Environment**: `NODE_ENV`, `CI`

**Global Dependencies**: `**/.env.*local`, `**/.env`, `.eslintrc.js`, `eslint.config.mjs`, `tsconfig.json`, `turbo.json`

---

## 8. Environment Variables & Secrets

**Important**: Never commit actual values. Use `.env`, `.env.local`, `.env.test`, `.env.docker` as needed.

**Environment Variables** (used by Turbo and/or apps):

**Core**:

- `NODE_ENV` – Environment (development, production, test)
- `DATABASE_URL` – PostgreSQL connection string

**JWT**:

- `JWT_ACCESS_SECRET` – Access token secret
- `JWT_REFRESH_SECRET` – Refresh token secret
- `JWT_ACCESS_EXPIRES_IN` – Access token expiration
- `JWT_REFRESH_EXPIRES_IN` – Refresh token expiration
- `JWT_REFRESH_REMEMBER_EXPIRES_IN` – "Remember me" refresh token expiration
- `JWT_ACCESS_TOKEN_NAME` – Access token cookie name
- `JWT_REFRESH_TOKEN_NAME` – Refresh token cookie name

**Session**:

- `SESSION_SECRET` – Session secret

**CSRF**:

- `CSRF_SECRET_KEY` – CSRF secret key

**OAuth**:

- `GOOGLE_CLIENT_ID` – Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` – Google OAuth client secret
- `FACEBOOK_CLIENT_ID` – Facebook OAuth app ID
- `FACEBOOK_CLIENT_SECRET` – Facebook OAuth app secret

**External Services**:

- `RESEND_API_KEY` – Resend email API key
- `AI_API_KEY` – Google Gemini AI API key
- `OPENWEATHER_API_KEY` – OpenWeather API key

**Web**:

- `NEXT_PUBLIC_API_URL` – API URL for the Next.js web app (build-time + runtime client usage)

### 8.1 Environment files (current convention)

**Repo root**:

- `.env.example` exists to document a minimal set of database variables for local/dev container use.

**API (`apps/api`)**:

- `apps/api/.env.example` documents the full API environment surface area (auth, CSRF, OAuth, AI, weather, DB).
- The API currently loads an env file based on `NODE_ENV` via a simple mapping in `apps/api/src/config/env.config.ts`:
    - `development` → `.env.local`
    - `test` → `.env.test`
    - `production` → `.env.production` (noted as WIP in code)
- **Database URL behavior**:
    - If `DATABASE_URL` is set, it is used.
    - Otherwise the API **constructs** `DATABASE_URL` from `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DB_HOST`, `DB_PORT`, `POSTGRES_DB`.

**Web (`apps/web`)**:

- Docker development expects `apps/web/.env.local` (loaded via compose `env_file`) for local envs like `NEXT_PUBLIC_API_URL`.

---

## 9. Quick Reference – Complete Tech Stack

| Category         | Technology                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Monorepo**     | pnpm workspaces (>= 8.0.0), Turborepo 2.6.1                                                                                                                                                                                                                                                                                                      |
| **API**          | Express 5.1.0, Prisma 7.3.0, PostgreSQL, SWC, tsx, Zod 4.1.13, CASL 6.8.0, Passport 0.7.0 (JWT, Google, Facebook), pino 9.6.0, Swagger (swagger-jsdoc 6.2.8, swagger-ui-express 5.0.1), Resend 4.2.0, axios 1.8.4, helmet 8.1.0, csrf-csrf 4.0.3, express-rate-limit 7.5.0, express-xss-sanitizer 2.0.1, bcryptjs 3.0.3, date-fns 4.1.0          |
| **Web**          | Next.js 16.1.6, React 19.2.3, Tailwind CSS 4.1.18, shadcn 3.8.5, Radix UI 1.4.3, Base UI 1.1.0, Redux Toolkit 2.11.2, CASL 6.8.0, react-hook-form 7.71.1, Zod 4.1.13, @hugeicons/react 1.1.5, react-day-picker 9.13.2, date-fns 4.1.0, next-themes 0.4.6, class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.4.0, tw-animate-css 1.4.0 |
| **Shared**       | TypeScript 5.9.3, Zod 4.1.13, constants/enums/types/schemas/utils                                                                                                                                                                                                                                                                                |
| **MCP**          | Model Context Protocol SDK 1.24.3, tsx 4.19.2, SWC, axios 1.7.9, dotenv 16.4.5, zod 4.1.13                                                                                                                                                                                                                                                       |
| **Testing**      | Vitest 4.0.18, jsdom 28.0.0 (web), Playwright 1.58.2 (Storybook), @testing-library/react 16.3.2, @testing-library/jest-dom 6.9.1, @testing-library/user-event 14.6.1, @faker-js/faker 9.6.0, supertest 7.1.0, @vitest/coverage-v8 4.0.18, @vitest/browser 4.0.18, @vitest/browser-playwright 4.0.18                                              |
| **Storybook**    | Storybook 10.2.8, @storybook/nextjs-vite 10.2.8, @chromatic-com/storybook 5.0.1, @storybook/addon-vitest 10.2.8, @storybook/addon-a11y 10.2.8, @storybook/addon-docs 10.2.8, @storybook/addon-themes 10.2.8, @storybook/addon-onboarding 10.2.8                                                                                                  |
| **Code Quality** | ESLint 9.39.1 (flat config), @typescript-eslint/eslint-plugin 8.48.1, @typescript-eslint/parser 8.48.1, eslint-plugin-import 2.32.0, eslint-plugin-prettier 5.5.4, eslint-config-prettier 10.1.8, Prettier 3.7.3                                                                                                                                 |
| **Build Tools**  | SWC (@swc/cli 0.7.9, @swc/core 1.15.3), TypeScript 5.9.3, vite-tsconfig-paths 6.0.4, vite 7.3.1 (web tests)                                                                                                                                                                                                                                      |

---

## 10. Architecture Patterns & Conventions

### 10.1 API Patterns

**Module Pattern**:

- Service → Controller → Route (factory function)
- Dependency injection (explicit constructor injection)
- Mapper pattern for data transformation
- Validator middleware for request validation

**Middleware Order** (in `app.ts`):

1. Security (helmet, xss, rate-limit, CORS)
2. Request parsing (JSON, URL-encoded, cookies)
3. Session & flash
4. Passport (if enabled)
5. Logging (pino)
6. API docs (Swagger, no CSRF)
7. CSRF (inject token, then protect)
8. Routes
9. Error handling (404, error handler)

**Route Factory Pattern**:

```typescript
export const createUserRouter = (controller: UserController) => {
	const router = Router();
	router.get('/', controller.list);
	return router;
};
```

**Error Handling**:

- Custom `AppError` class
- Standardized API responses (`api-response.util.ts`)
- Error middleware for centralized handling

### 10.2 Web Patterns

**Feature-Based Organization**:

- Each feature is self-contained (components, hooks, API, types)
- Shared UI components in `src/shared/ui/`
- Container/presenter pattern (e.g., `CreateUserForm` + `CreateUserFormUI`)

**Form Pattern**:

- React Hook Form for state
- Zod resolver for validation (via `@beggy/shared` schemas)
- Separate UI component for presentation
- Server error handling at form level

**List Pattern**:

- `useListQuery` hook for list state (filters, sort, pagination)
- `ListFilters`, `ListOrderBy`, `ListPagination`, `ListMeta`, `ListEmptyState` components
- Grid component (`DataGrid`) for layout

**Authorization Pattern**:

- CASL ability in Redux store
- `Can` component for conditional rendering
- `ProtectedRoute` and `AuthGate` for route protection

### 10.3 Testing Patterns

**API**:

- Unit tests: Test services, controllers, mappers in isolation
- Integration tests: Full HTTP requests with test database
- Factories: Use Faker for test data generation

**Web**:

- Component tests: React Testing Library
- Storybook tests: Browser-based with Playwright
- Mock API responses in tests

**Shared**:

- Unit tests for utilities and functions

### 10.4 Storybook Patterns

- Stories follow Storybook best practices
- Autodocs enabled
- A11y addon for accessibility testing
- Theme addon for light/dark mode
- Comprehensive component documentation in `parameters.docs.description.component`

---

## 11. How to Use This Document

### 11.1 For AI Assistants

**Paste or attach this entire document** (or relevant sections) when:

- Asking for code changes or refactors
- Requesting new features
- Debugging issues
- Understanding architecture decisions

**Example prompts**:

- "Using BEGGY_PROJECT_CONTEXT.md, add a new API endpoint for..."
- "Following the patterns in BEGGY_PROJECT_CONTEXT.md, create a new web feature..."
- "Based on BEGGY_PROJECT_CONTEXT.md, fix the test setup for..."

### 11.2 For New Contributors

**Reading order**:

1. **Section 1** – Understand the project idea
2. **Section 2** – Understand monorepo structure
3. **Section 9** – Quick tech stack reference
4. **Section 3** – Shared package (foundation)
5. **Section 4** – API (if working on backend)
6. **Section 5** – Web (if working on frontend)
7. **Section 7** – Tooling (for development setup)
8. **Section 10** – Architecture patterns

### 11.3 For Prompts & Context

**Include in prompts**:

- "Use BEGGY_PROJECT_CONTEXT.md for all stack and structure details"
- "Follow the patterns documented in BEGGY_PROJECT_CONTEXT.md"
- "Maintain consistency with BEGGY_PROJECT_CONTEXT.md conventions"

**Reference specific sections**:

- "See Section 4.2 for API module structure"
- "Follow Section 5.2 for web feature organization"
- "Use Section 7.2 for ESLint configuration"

### 11.4 Maintenance

**Update this document when**:

- Adding new apps or packages
- Changing major dependencies
- Introducing new tools or patterns
- Updating architecture decisions
- Adding new environment variables

**Keep it current**: This document should reflect the actual state of the codebase.

---

## 11.5 Docker, Compose, and Deployment (current setup)

Beggy now supports **Docker-first** development and production runs at the monorepo root.

### Development compose (`docker-compose.dev.yml`)

- **Services**:
    - `postgres` (port `5432:5432`) with a named volume `postgres_dev_data`
    - `postgres_test` (port `5433:5432`) with a named volume `postgres_test_data`
    - `api` (port `4000:4000` + Node inspector `9229:9229`)
    - `web` (port `3000:3000`)
- **Hot reload strategy**:
    - Source is mounted into containers (`.:/app`)
    - `node_modules` paths are excluded from bind mount via anonymous volumes (`/app/node_modules`, etc.) to avoid Windows bind-mount performance issues and host/container mismatch
    - Watch mode is stabilized with polling envs (`WATCHPACK_POLLING`, `CHOKIDAR_USEPOLLING`)
- **Env files**:
    - API uses `env_file: ./apps/api/.env.local`
    - Web uses `env_file: ./apps/web/.env.local`
    - Web also sets `NEXT_PUBLIC_API_URL` to `http://localhost:4000` in compose for local dev

### Production compose (`docker-compose.prod.yml`)

- **Services**:
    - `postgres` (no host ports exposed; internal network only) with named volume `postgres_prod_data`
    - `api` (port `4000:4000`) built from `apps/api/Dockerfile`
    - `web` (port `3000:3000`) built from `apps/web/Dockerfile`
- **Configuration**:
    - `api` reads secrets from environment variables passed by compose (JWT, CSRF, OAuth, AI, weather, origins/URLs, DB variables)
    - `web` receives `NEXT_PUBLIC_API_URL` at **build time** as a Docker build arg (Next.js public env requirement)

### Dockerfiles

- **API**:
    - `apps/api/Dockerfile.dev`: installs dependencies, runs `pnpm dev` (source mounted by compose)
    - `apps/api/Dockerfile`: multi-stage build, compiles the API, ships a smaller runtime image containing `dist/` + Prisma assets
- **Web**:
    - `apps/web/Dockerfile.dev`: installs dependencies, runs `pnpm dev` (source mounted by compose)
    - `apps/web/Dockerfile`: multi-stage build, outputs Next.js `standalone` runtime and runs `node server.js`

### Deployment script (`deploy.sh`)

There is a server-side helper script `deploy.sh` intended to be run on the deployment machine:

- Loads secrets from `/etc/beggy/secrets.env`
- Pulls latest `main`
- Brings up production compose in detached mode
- Runs Prisma migrations inside the `api` container (`npx prisma migrate deploy`)

### Ignore rules for Docker build context (`.dockerignore`)

The `.dockerignore` is configured to:

- Exclude build outputs (`dist`, `.next`, `out`, `coverage`, `.turbo`)
- Exclude all `.env*` files by default while explicitly allowing `!.env.example` and `!**/.env.example`
- Exclude IDE/git metadata and Storybook build output

---

Here's the updated **Section 12. Design System & UI Architecture** with the correct Tailwind CSS v4 implementation details:

---

# 12. Design System & UI Architecture (CRITICAL FOR UI CHANGES)

Beggy uses a **semantic token-based design system** built on:

- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **shadcn/ui** (`style: "base-maia"`, `baseColor: "stone"`) — **first choice for all UI**
- **Base UI** (`@base-ui/react`) — unstyled primitives, only when shadcn has no match
- **HugeIcons** (`@hugeicons/react`) — **only icon library**, always via `HugeiconsIcon` wrapper
- **OKLCH color space** throughout — no hsl, no hex inside CSS vars
- **WCAG 2.1 AA compliant** color pairs
- CSS variables defined in `src/app/globals.css`
- Light + dark mode via `.dark` class on `<html>` (managed by `next-themes`)
- **RTL enabled** (`"rtl": true`) — use `start`/`end` logical properties everywhere
- No hardcoded palette colors inside components — ever

---

## 12.1 Design Philosophy

Beggy is:

- 🌍 **Warm** — travel journal aesthetic, approachable
- 🧠 **Intelligent** — AI assistant, calm and helpful
- 🧳 **Structured** — organized packing, clear hierarchy
- 🌗 **Calm in dark mode** — deep stone/zinc tones, not harsh SaaS black

UI must feel: layered, intentional, soft, accessible, consistent.

---

## 12.2 The Three Non-Negotiable Rules

### 🚫 NEVER

1. Use raw Tailwind palette colors (`bg-red-500`, `text-blue-600`, `bg-rose-400`)
2. Hardcode `hex`, `rgb`, `hsl`, or `oklch` values inside component files
3. Write color logic inside components — that belongs in `globals.css`
4. Use `left`/`right` directional classes — always use `start`/`end` (RTL)
5. Mix color spaces — the entire system is `oklch`, keep it that way
6. Import icons directly as JSX components — always use `HugeiconsIcon` wrapper
7. Use any icon library other than `@hugeicons/react`

### ✅ ALWAYS

1. Use **shadcn components first** — if shadcn has it, use it
2. Consume semantic Tailwind utilities that map to CSS variables
3. Let `globals.css` own all color decisions
4. Use the correct semantic token for the correct intent
5. Test in both light and dark mode before shipping
6. Use `HugeiconsIcon` wrapper for all icons with `className` for sizing

---

## 12.3 How the Token System Works (Tailwind v4)

The `globals.css` file has **two layers**:

**Layer 1: `:root` and `.dark`** — full `oklch()` values directly

```css
:root {
	--primary: oklch(0.525 0.223 3.958);
}
.dark {
	--primary: oklch(0.459 0.187 3.815);
}
```

**Layer 2: `@theme inline`** — maps to Tailwind utilities via `var()`

```css
@theme inline {
	--color-primary: var(--primary);
}
```

This enables `bg-primary`, `text-primary`, etc. in Tailwind.

> **Critical difference from old system:** Values in `:root`/`.dark` are **full `oklch()` values** — not raw components. `@theme inline` just passes them through with `var()`. Never add `oklch()` again inside `@theme inline`.

---

## 12.4 Complete Token Reference

### Surface Tokens

| CSS Variable           | Tailwind Class            | Light Value                 | Dark Value                   | Purpose                     |
| ---------------------- | ------------------------- | --------------------------- | ---------------------------- | --------------------------- |
| `--background`         | `bg-background`           | `oklch(1 0 0)`              | `oklch(0.147 0.004 49.25)`   | Page background             |
| `--foreground`         | `text-foreground`         | `oklch(0.147 0.004 49.25)`  | `oklch(0.985 0.001 106.423)` | Body text, headings         |
| `--card`               | `bg-card`                 | `oklch(1 0 0)`              | `oklch(0.216 0.006 56.043)`  | Card backgrounds            |
| `--card-foreground`    | `text-card-foreground`    | same as foreground          | same as foreground           | Text inside cards           |
| `--popover`            | `bg-popover`              | `oklch(1 0 0)`              | `oklch(0.216 0.006 56.043)`  | Dropdowns, tooltips         |
| `--popover-foreground` | `text-popover-foreground` | same as foreground          | same as foreground           | Text in popovers            |
| `--muted`              | `bg-muted`                | `oklch(0.97 0.001 106.424)` | `oklch(0.268 0.007 34.298)`  | Subtle bg, disabled areas   |
| `--muted-foreground`   | `text-muted-foreground`   | `oklch(0.553 0.013 58.071)` | `oklch(0.709 0.01 56.259)`   | Placeholder, secondary text |

### Brand / Interactive Tokens

| CSS Variable             | Tailwind Class              | Light Value                  | Dark Value                   | Purpose                   |
| ------------------------ | --------------------------- | ---------------------------- | ---------------------------- | ------------------------- |
| `--primary`              | `bg-primary` `text-primary` | `oklch(0.525 0.223 3.958)`   | `oklch(0.459 0.187 3.815)`   | CTAs, active states       |
| `--primary-foreground`   | `text-primary-foreground`   | `oklch(0.971 0.014 343.198)` | same                         | Text on primary bg        |
| `--secondary`            | `bg-secondary`              | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary actions         |
| `--secondary-foreground` | `text-secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`           | Text on secondary bg      |
| `--accent`               | `bg-accent`                 | `oklch(0.97 0.001 106.424)`  | `oklch(0.268 0.007 34.298)`  | Hover bg, selected rows   |
| `--accent-foreground`    | `text-accent-foreground`    | `oklch(0.216 0.006 56.043)`  | `oklch(0.985 0.001 106.423)` | Text on accent bg         |
| `--border`               | `border-border`             | `oklch(0.923 0.003 48.717)`  | `oklch(1 0 0 / 10%)`         | All borders               |
| `--input`                | `border-input`              | `oklch(0.923 0.003 48.717)`  | `oklch(1 0 0 / 15%)`         | Input field borders       |
| `--ring`                 | `ring` `outline-ring`       | `oklch(0.709 0.01 56.259)`   | `oklch(0.553 0.013 58.071)`  | Focus rings, keyboard nav |

### Semantic State Tokens

| CSS Variable               | Tailwind Class                | Light Value                  | Dark Value                  | Use For                |
| -------------------------- | ----------------------------- | ---------------------------- | --------------------------- | ---------------------- |
| `--destructive`            | `bg-destructive`              | `oklch(0.577 0.245 27.325)`  | `oklch(0.704 0.191 22.216)` | Errors, delete         |
| `--destructive-foreground` | `text-destructive-foreground` | `oklch(0.971 0.014 343.198)` | `oklch(0.985 0 0)`          | Text on destructive bg |
| `--success`                | `bg-success`                  | `oklch(0.53 0.14 162)`       | `oklch(0.62 0.14 162)`      | Confirmation, packed   |
| `--success-foreground`     | `text-success-foreground`     | `oklch(0.98 0 0)`            | `oklch(0.15 0.01 162)`      | Text on success bg     |
| `--warning`                | `bg-warning`                  | `oklch(0.78 0.17 75)`        | `oklch(0.82 0.17 75)`       | Caution, near limits   |
| `--warning-foreground`     | `text-warning-foreground`     | `oklch(0.2 0.02 75)`         | `oklch(0.2 0.02 75)`        | Text on warning bg     |

### Sidebar Tokens

Use **only** sidebar-prefixed tokens inside sidebar components. Never use `bg-primary` or `bg-accent` there.

| Token                          | Light                        | Dark                         |
| ------------------------------ | ---------------------------- | ---------------------------- |
| `--sidebar`                    | `oklch(0.985 0.001 106.423)` | `oklch(0.216 0.006 56.043)`  |
| `--sidebar-foreground`         | `oklch(0.147 0.004 49.25)`   | `oklch(0.985 0.001 106.423)` |
| `--sidebar-primary`            | `oklch(0.592 0.249 0.584)`   | `oklch(0.656 0.241 354.308)` |
| `--sidebar-primary-foreground` | `oklch(0.971 0.014 343.198)` | same                         |
| `--sidebar-accent`             | `oklch(0.97 0.001 106.424)`  | `oklch(0.268 0.007 34.298)`  |
| `--sidebar-accent-foreground`  | `oklch(0.216 0.006 56.043)`  | `oklch(0.985 0.001 106.423)` |
| `--sidebar-border`             | `oklch(0.923 0.003 48.717)`  | `oklch(1 0 0 / 10%)`         |
| `--sidebar-ring`               | `oklch(0.709 0.01 56.259)`   | `oklch(0.553 0.013 58.071)`  |

### Chart Tokens

Always use `var(--chart-1)` through `var(--chart-5)` — never invent new chart colors.

```
--chart-1: oklch(0.823 0.12 346.018)   /* lightest */
--chart-2: oklch(0.656 0.241 354.308)
--chart-3: oklch(0.592 0.249 0.584)
--chart-4: oklch(0.525 0.223 3.958)
--chart-5: oklch(0.459 0.187 3.815)    /* darkest */
```

### Radius Scale

Never hardcode `rounded-[8px]`. Always use the scale.

| CSS Variable   | Tailwind Class | Value                       |
| -------------- | -------------- | --------------------------- |
| `--radius`     | base           | `0.625rem`                  |
| `--radius-sm`  | `rounded-sm`   | `calc(var(--radius) * 0.6)` |
| `--radius-md`  | `rounded-md`   | `calc(var(--radius) * 0.8)` |
| `--radius-lg`  | `rounded-lg`   | `var(--radius)` (0.625rem)  |
| `--radius-xl`  | `rounded-xl`   | `calc(var(--radius) * 1.4)` |
| `--radius-2xl` | `rounded-2xl`  | `calc(var(--radius) * 1.8)` |
| `--radius-3xl` | `rounded-3xl`  | `calc(var(--radius) * 2.2)` |
| `--radius-4xl` | `rounded-4xl`  | `calc(var(--radius) * 2.6)` |

---

## 12.5 HugeIcons — The Only Icon Library

**Package:** `@hugeicons/react` + `@hugeicons/core-free-icons`

All icons **must** use the `HugeiconsIcon` wrapper component. Never render icon definitions directly as JSX. This is the consistent pattern used throughout the entire codebase.

### Import Pattern

```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import {
	CalendarIcon,
	Home01Icon,
	Search01Icon,
	Add01Icon,
} from '@hugeicons/core-free-icons';
```

### Usage — Always `HugeiconsIcon` Wrapper

```tsx
// ✅ CORRECT — always use HugeiconsIcon wrapper
<HugeiconsIcon
    icon={CalendarIcon}
    className="h-4 w-4"
/>

// ✅ Color via Tailwind text-* class
<HugeiconsIcon
    icon={Home01Icon}
    className="h-5 w-5 text-primary"
/>

// ✅ Muted / secondary icon
<HugeiconsIcon
    icon={Search01Icon}
    className="h-4 w-4 text-muted-foreground"
/>

// ✅ Inside a button (standard pattern)
<Button variant="ghost" size="icon">
    <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
</Button>

// ✅ Inside a trigger with conditional state (real codebase pattern)
<PopoverTrigger
    type="button"
    disabled={disabled}
    aria-expanded={open}
    className={cn(
        'w-full inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm font-normal transition-colors',
        isActive
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-background hover:bg-accent hover:text-accent-foreground'
    )}
>
    <span className="flex items-center gap-2 truncate">
        <HugeiconsIcon
            icon={CalendarIcon}
            className="h-4 w-4"
        />
        {formattedLabel}
    </span>
</PopoverTrigger>

// ❌ WRONG — direct JSX without wrapper
import { CalendarIcon } from '@hugeicons/core-free-icons';
<CalendarIcon size={16} />

// ❌ WRONG — any other icon library
import { Calendar } from 'lucide-react';
import { FiCalendar } from 'react-icons/fi';
<Calendar size={16} />
```

### Sizing Convention

Use Tailwind `h-*`/`w-*` classes via `className`. Icons inherit `currentColor` — color them via `text-*` on the icon or a parent element.

| Context               | className  |
| --------------------- | ---------- |
| Inside buttons/inputs | `h-4 w-4`  |
| Standalone / medium   | `h-5 w-5`  |
| Large / decorative    | `h-6 w-6`  |
| Hero / display        | `h-8 w-8`+ |

---

## 12.6 shadcn/ui — First Choice for All UI

**Always reach for shadcn first.** If shadcn has the component, use it. Only fall back to Base UI or custom code when shadcn genuinely doesn't cover the use case.

### Component Resolution Priority

```
1. shadcn/ui     → Button, Card, Input, Badge, Dialog, Popover, Select, Tabs, etc.
2. Base UI       → Switch, Slider, NumberField, Progress (when shadcn lacks it)
3. Custom        → Only when 1 and 2 don't fit — always use semantic tokens
```

### Core shadcn Patterns

```tsx
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

// ✅ Buttons — variants map to semantic tokens automatically
<Button variant="default">Add to bag</Button>       // bg-primary
<Button variant="secondary">View suitcase</Button>  // bg-secondary
<Button variant="destructive">Remove item</Button>  // bg-destructive
<Button variant="outline">Edit details</Button>     // bordered
<Button variant="ghost">Cancel</Button>             // transparent

// ✅ Button with HugeIcon (standard pattern)
<Button variant="default">
    <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
    Add item
</Button>

// ✅ Icon-only button
<Button variant="ghost" size="icon">
    <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
</Button>

// ✅ Cards — use card tokens, not bg-white
<Card>
    <CardHeader>
        <CardTitle>Weekend Carry-on</CardTitle>
    </CardHeader>
    <CardContent>
        <p className="text-muted-foreground text-sm">Paris · 3 nights</p>
    </CardContent>
</Card>

// ✅ Input — focus ring is automatic via globals.css
<Input placeholder="Search items..." />

// ❌ WRONG — never raw <button> with hardcoded colors
<button className="bg-rose-600 text-white px-4 py-2 rounded">Add</button>
```

### Building Custom Components on shadcn Primitives

Always compose from shadcn primitives + HugeiconsIcon + cn(). This is the canonical pattern:

```tsx
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/shared/components/ui/popover';
import { HugeiconsIcon } from '@hugeicons/react';
import { CalendarIcon, ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/shared/lib/utils';

function DatePickerTrigger({
	open,
	disabled,
	isActive,
	formattedLabel,
}: Props) {
	return (
		<PopoverTrigger
			type="button"
			disabled={disabled}
			aria-expanded={open}
			className={cn(
				'w-full inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm font-normal transition-colors',
				isActive
					? 'bg-secondary text-secondary-foreground'
					: 'bg-background hover:bg-accent hover:text-accent-foreground'
			)}
		>
			<span className="flex items-center gap-2 truncate">
				<HugeiconsIcon icon={CalendarIcon} className="h-4 w-4" />
				{formattedLabel}
			</span>
			<HugeiconsIcon
				icon={ArrowDown01Icon}
				className={cn(
					'h-4 w-4 text-muted-foreground transition-transform',
					open && 'rotate-180'
				)}
			/>
		</PopoverTrigger>
	);
}
```

### Adding shadcn Components

```bash
# Always add via CLI — never copy-paste from docs
npx shadcn@latest add button
npx shadcn@latest add card dialog popover select tabs

# Components install to @/shared/components/ui/
# Do not manually edit generated files — extend via className instead
```

---

## 12.7 Component Patterns

### cn() — Always for Class Merging

```tsx
import { cn } from '@/shared/lib/utils';

// ✅ Always use cn() — never string concatenation or template literals for classes
<div
	className={cn(
		'base-class other-class',
		condition && 'conditional-class',
		variant === 'active' && 'active-class',
		className // always expose and forward className prop
	)}
/>;
```

### RTL — Logical Properties Only

```tsx
// ✅ RTL-safe — logical properties
<div className="ps-4 pe-2 ms-auto me-4 text-start border-s" />
<div className="rounded-s-md" />
<div className="start-0 end-auto" />

// ❌ Not RTL-safe — physical properties
<div className="pl-4 pr-2 ml-auto mr-4 text-left border-l" />
<div className="rounded-l-md" />
<div className="left-0 right-auto" />
```

### Hover / Selected Rows

```tsx
// ✅ Selectable list item
<div
	className={cn(
		'rounded-lg px-4 py-2 cursor-pointer transition-colors border',
		isSelected
			? 'bg-accent text-accent-foreground border-primary'
			: 'bg-muted border-transparent hover:bg-accent hover:text-accent-foreground'
	)}
>
	Weekend carry-on
</div>
```

### Semantic State Feedback

```tsx
// ✅ Full bg — toasts, banners where color carries the full message
<div className="bg-success text-success-foreground rounded-md px-3 py-2">
    Passport added!
</div>

// ✅ Soft tinted — preferred for inline alerts, callouts, badges
<div className="border border-success/30 bg-success/10 text-foreground rounded-md px-3 py-2">
    <span className="text-success font-semibold">Done!</span> Passport added.
</div>

<div className="border border-warning/30 bg-warning/10 text-foreground rounded-md px-3 py-2">
    <span className="text-warning-foreground font-semibold">Heads up</span> — near limit.
</div>

<div className="border border-destructive/30 bg-destructive/10 text-foreground rounded-md px-3 py-2">
    <span className="text-destructive font-semibold">Error</span> — save failed.
</div>
```

### Badges with CVA

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
	{
		variants: {
			variant: {
				primary: 'bg-primary/12 text-primary',
				success: 'bg-success/12 text-success',
				warning: 'bg-warning/12 text-warning-foreground',
				destructive: 'bg-destructive/12 text-destructive',
				secondary: 'bg-secondary text-secondary-foreground',
			},
		},
		defaultVariants: { variant: 'primary' },
	}
);

// ✅ Map domain state → badge variant (never to raw colors)
const bagStatusVariant = {
	PACKED: 'success',
	NEAR_LIMIT: 'warning',
	OVERWEIGHT: 'destructive',
	IN_PROGRESS: 'primary',
} as const;

function BagStatusBadge({ status }: { status: ContainerStatus }) {
	return (
		<span
			className={cn(badgeVariants({ variant: bagStatusVariant[status] }))}
		>
			{statusLabel[status]}
		</span>
	);
}
```

### Muted Text Hierarchy

```tsx
<h2 className="text-foreground font-semibold">Weekend Carry-on</h2>
<p className="text-muted-foreground text-sm">Paris · 3 nights · 7 items</p>
<span className="text-muted-foreground/60">No items added yet</span>
```

### Opacity Modifier Pattern

```tsx
// Use / notation for alpha — works with all CSS var tokens
<div className="bg-primary/10 border-border/50 text-muted-foreground/70" />
```

### Using Base UI (when shadcn has no match)

```tsx
import * as Switch from '@base-ui/react/switch';
import { cn } from '@/shared/lib/utils';

// ✅ Style Base UI primitives with semantic tokens via data-* attributes
function CustomSwitch({ checked, onChange }: Props) {
	return (
		<Switch.Root
			checked={checked}
			onCheckedChange={onChange}
			className={cn(
				'relative inline-flex h-6 w-11 items-center rounded-full border border-border',
				'bg-muted data-[state=checked]:bg-primary',
				'transition-colors focus-visible:outline-ring/50'
			)}
		>
			<Switch.Thumb className="block h-4 w-4 rounded-full bg-background shadow transition-transform data-[state=checked]:translate-x-5" />
		</Switch.Root>
	);
}
```

---

## 12.8 Dark Mode

Handled automatically by `next-themes` + CSS vars. Components need zero extra work — tokens switch automatically.

```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
			{children}
		</ThemeProvider>
	);
}
```

```tsx
// app/layout.tsx — suppressHydrationWarning is required on <html>
<html lang="ar" dir="rtl" suppressHydrationWarning>
	<body>
		<Providers>{children}</Providers>
	</body>
</html>
```

```tsx
// Theme toggle — HugeIcons + shadcn Button
'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Moon01Icon, Sun01Icon } from '@hugeicons/core-free-icons';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		>
			<HugeiconsIcon icon={Moon01Icon} className="h-4 w-4 dark:hidden" />
			<HugeiconsIcon
				icon={Sun01Icon}
				className="h-4 w-4 hidden dark:block"
			/>
		</Button>
	);
}
```

**Dark mode characteristics:**

- Background: deep stone, not pure black — creates a warm dark feel
- Card: slightly lighter than background — creates layering effect
- Primary: lightens in dark mode for contrast on dark bg
- Borders: white/10% transparency — soft, not harsh
- Warning foreground: stays dark brown in both modes (yellow bg needs dark text)

**Rule:** Dark mode token values are **intentionally different** from light. Never copy one to the other.

---

## 12.9 Domain → UI Mapping Rule

```
Domain enum → semantic intent → CSS token → Tailwind class
```

```ts
// ✅ Correct — domain state maps to semantic intent
import { ContainerStatus } from '@beggy/shared/constants';

const intentMap: Record<ContainerStatus, string> = {
	[ContainerStatus.PACKED]: 'bg-success text-success-foreground',
	[ContainerStatus.NEAR_LIMIT]: 'bg-warning text-warning-foreground',
	[ContainerStatus.OVERWEIGHT]: 'bg-destructive text-destructive-foreground',
	[ContainerStatus.IN_PROGRESS]: 'bg-primary text-primary-foreground',
};

// ❌ Wrong — never map domain directly to raw palette or hex
const colorMap = {
	OVERWEIGHT: 'bg-red-500',
	PACKED: '#22c55e',
};
```

---

## 12.10 Adding New Semantic Tokens

If a new semantic color is genuinely needed (e.g., `--info`):

```css
/* Step 1: Add to :root and .dark in globals.css */
:root {
	--info: oklch(0.6 0.15 230);
	--info-foreground: oklch(0.98 0 0);
}
.dark {
	--info: oklch(0.7 0.15 228);
	--info-foreground: oklch(0.15 0.02 230);
}

/* Step 2: Map in @theme inline */
@theme inline {
	--color-info: var(--info);
	--color-info-foreground: var(--info-foreground);
}
```

Then verify WCAG AA (≥ 4.5:1) for both light and dark before using it anywhere.

---

## 12.11 Pre-Ship Checklist

- [ ] No raw Tailwind palette colors (`bg-red-*`, `text-blue-*`, etc.)
- [ ] No hardcoded hex, rgb, hsl, or oklch in JSX/TSX
- [ ] All colors from semantic utilities only
- [ ] All icons use `HugeiconsIcon` wrapper — no direct icon JSX, no other libraries
- [ ] All icon sizing via `className="h-* w-*"` — not `size` prop
- [ ] Hover/selected states use `bg-accent text-accent-foreground`
- [ ] Focus rings not manually overridden (global `outline-ring/50` handles it)
- [ ] Radius uses Tailwind scale only (`rounded-lg`, `rounded-xl`, etc.)
- [ ] All directional classes use `start`/`end` — RTL-safe
- [ ] Dark mode tested — toggle and verify nothing breaks
- [ ] Semantic state (success/warning/destructive) matches actual intent
- [ ] Chart components use `var(--chart-1)` through `var(--chart-5)` only
- [ ] Sidebar components use `bg-sidebar-*` tokens exclusively
- [ ] `cn()` used for all conditional className logic

---

## 12.2 Component Aliases & Package Summary

### Path Aliases

```
@/shared/components/ui    → shadcn primitives (don't edit generated files)
@/shared/components       → shared/custom components
@/shared/lib/utils        → cn() — always use for class merging
@/shared/lib              → shared utilities
@/shared/hooks            → shared React hooks
```

### Package Usage

| Package                      | Use For                        | Example                                       |
| ---------------------------- | ------------------------------ | --------------------------------------------- |
| `shadcn`                     | **All UI — always first**      | `<Button variant="default">`                  |
| `@base-ui/react`             | Unstyled primitives (fallback) | `<Switch.Root>`, `<NumberField.Root>`         |
| `@hugeicons/react`           | Wrapper for all icons          | `<HugeiconsIcon icon={CalendarIcon} />`       |
| `@hugeicons/core-free-icons` | Icon definitions               | `import { CalendarIcon } from '...'`          |
| `class-variance-authority`   | Component variant styling      | `const badgeVariants = cva(...)`              |
| `clsx` + `tailwind-merge`    | Conditional classes via `cn()` | `cn('base', condition && 'extra', className)` |
| `next-themes`                | Dark mode toggling             | `useTheme()` hook                             |
| `tw-animate-css`             | Entry/exit animations          | `className="animate-fade-in"`                 |
| `react-hook-form` + `zod`    | Form state + validation        | Validated inputs                              |
| `@casl/react`                | Permission-based rendering     | `<Can I="update" a="Bag">`                    |
| `date-fns`                   | Date formatting                | Format trip dates                             |

---

**END OF SECTION 12**

---

## 13. Additional Resources

- **Repository**: https://github.com/Mofathy183/Beggy-backend.git

- **Author**: Mohamed Fathy (mofathy1833@gmail.com)

- **License**: MIT

---

**Last Updated**: Based on current codebase state (February 2026)

**Version**: 1.0.0
