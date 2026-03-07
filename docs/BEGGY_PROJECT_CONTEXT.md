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
- Env: `NODE_ENV`, `DATABASE_URL`, `VITE_API_URL`

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

- `VITE_API_URL` – API URL for web app (if needed)

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

Here's the updated **Section 12. Design System & UI Architecture** with the correct Tailwind CSS v4 implementation details:

---

## 12. Design System & UI Architecture (CRITICAL FOR UI CHANGES)

Beggy uses a **semantic token-based design system** built on:

- **Tailwind CSS 4** (`@tailwindcss/postcss`)
- **shadcn/ui** (Nova style, Zinc base, Teal accent)
- **Base UI** (`@base-ui/react`) — unstyled primitives
- **Radix UI** (`radix-ui`) — additional accessible primitives
- **OKLCH color space** throughout — no hsl, no hex inside CSS vars
- **WCAG 2.1 AA compliant** (after applying audit fixes)
- CSS variables defined in `src/app/globals.css`
- Light + dark mode via `.dark` class on `<html>` (managed by `next-themes`)
- No hardcoded palette colors inside components — ever

The design system is **brand-driven**: warm, travel-inspired, teal-accented, and calm in dark mode.

All UI must consume tokens. Every color, radius, and semantic state comes from `globals.css`.

---

### 12.1 Design Philosophy

Beggy is:

- 🌍 **Warm** — travel journal aesthetic, approachable
- 🧠 **Intelligent** — AI assistant, calm and helpful
- 🧳 **Structured** — organized packing, clear hierarchy
- 🌗 **Calm in dark mode** — deep zinc, not aggressive SaaS black

UI must feel: layered, intentional, soft, accessible, consistent.

---

### 12.2 The Three Non-Negotiable Rules

### 🚫 NEVER

1. Use raw Tailwind palette colors (`bg-red-500`, `text-blue-600`, `bg-teal-400`)
2. Hardcode `hex`, `rgb`, `hsl`, or `oklch` values inside component files
3. Write color logic inside components — that belongs in `globals.css`
4. Mirror light mode values blindly into dark mode (they are intentionally different)
5. Mix color spaces — the entire system is `oklch`, keep it that way

### ✅ ALWAYS

1. Consume semantic Tailwind utilities that map to CSS variables
2. Let `globals.css` own all color decisions
3. Use the correct semantic token for the correct intent (don't use `destructive` for warnings)
4. Test in both light and dark mode before shipping
5. Verify WCAG AA contrast compliance for any new color combinations

---

### 12.3 Stack Overview & Package Responsibilities

### UI Component Libraries

| Package                           | Version         | Purpose                            | When to Use                                                               |
| --------------------------------- | --------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| **`@base-ui/react`**              | ^1.1.0          | Unstyled accessible primitives     | Building custom components from scratch where shadcn doesn't have a match |
| **`radix-ui`**                    | ^1.4.3          | Additional accessible components   | Dialog, Dropdown Menu, Toast primitives                                   |
| **`shadcn`**                      | ^3.8.5          | Pre-styled components using tokens | Buttons, Cards, Inputs — use as first choice                              |
| **`class-variance-authority`**    | ^0.7.1          | Type-safe variant styling          | Creating component variants (e.g., button sizes)                          |
| **`clsx`** + **`tailwind-merge`** | ^2.1.1 + ^3.4.0 | Conditional className merging      | Combine classes without conflicts                                         |
| **`next-themes`**                 | ^0.4.6          | Dark mode management               | Automatic `.dark` class application                                       |
| **`tw-animate-css`**              | ^1.4.0          | CSS animations for Tailwind        | Entry/exit animations, micro-interactions                                 |

### Component Styling Hierarchy

**Priority order when building UI:**

1. **shadcn components** — Use first if available (Button, Card, Input, Badge, etc.)
2. **Base UI primitives** — Use for headless components (Switch, Slider, NumberField)
3. **Radix UI** — Use for overlay components (Dialog, DropdownMenu, Toast)
4. **Custom components** — Only when above don't fit; always use semantic tokens

### Example: Building a Button

```tsx
// ✅ CORRECT: Use shadcn Button with variants
import { Button } from '@/shared/components/ui/button';

<Button variant="default">Add to bag</Button>  // Uses bg-primary
<Button variant="destructive">Delete</Button>  // Uses bg-destructive
<Button variant="ghost">Cancel</Button>        // Uses transparent bg

// ❌ WRONG: Custom button with hardcoded colors
<button className="bg-teal-600 text-white px-4 py-2 rounded">
    Add to bag
</button>
```

---

### 12.4 Import Order in globals.css (Never Change This)

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';
```

This order is load-order critical. Changing it breaks Tailwind utility generation.

---

### 12.5 How the Token System Works (Tailwind v4)

The system has **two separate layers** in `globals.css`:

### Layer 1: `:root` and `.dark` — Define Raw OKLCH Values

```css
:root {
	--primary: 0.55 0.095 185; /* raw oklch components, no wrapper */
}
.dark {
	--primary: 0.7 0.12 183; /* different value in dark — intentional */
}
```

**Critical:** Values are **raw components** without `oklch()` wrapper. The wrapper is added in Layer 2.

### Layer 2: `@theme inline` — Map to Tailwind Utilities

```css
@theme inline {
	--color-primary: oklch(var(--primary)); /* wraps with oklch() */
	--color-primary-foreground: oklch(var(--primary-foreground));
}
```

This enables Tailwind utilities like `bg-primary`, `text-primary-foreground`, etc.

**Why this matters:** Never add `oklch()` inside `:root` or `.dark` blocks. The values will be double-wrapped and break.

---

### 12.6 Complete Token Reference (WCAG AA Compliant)

All tokens below are **WCAG 2.1 AA compliant** after applying accessibility audit fixes.

### Surface Tokens

| CSS Variable           | Tailwind Class            | Light Value                      | Dark Value                        | Purpose                      |
| ---------------------- | ------------------------- | -------------------------------- | --------------------------------- | ---------------------------- |
| `--background`         | `bg-background`           | `1 0 0` (white)                  | `0.141 0.005 285.823` (deep zinc) | Page background              |
| `--foreground`         | `text-foreground`         | `0.141 0.005 285.823`            | `0.985 0 0`                       | Body text, headings          |
| `--card`               | `bg-card`                 | `1 0 0`                          | `0.21 0.006 285.885`              | Card backgrounds             |
| `--card-foreground`    | `text-card-foreground`    | near black                       | near white                        | Text inside cards            |
| `--popover`            | `bg-popover`              | white                            | zinc card                         | Dropdowns, tooltips          |
| `--popover-foreground` | `text-popover-foreground` | near black                       | near white                        | Text in popovers             |
| `--muted`              | `bg-muted`                | `0.967 0.001 286.375` (zinc 100) | `0.274 0.006 286.033`             | Item rows, subtle containers |
| `--muted-foreground`   | `text-muted-foreground`   | `0.52 0.017 285.9` ✅ **FIXED**  | `0.705 0.015 286.067`             | Placeholder, secondary text  |

### Brand Tokens — Teal (WCAG Compliant)

| CSS Variable           | Tailwind Class                | Light Value                   | Dark Value      | Contrast           | Purpose                          |
| ---------------------- | ----------------------------- | ----------------------------- | --------------- | ------------------ | -------------------------------- |
| `--primary`            | `bg-primary` / `text-primary` | `0.55 0.095 185` ✅ **FIXED** | `0.7 0.12 183`  | **4.58:1 ✅ AA**   | Buttons, links, active states    |
| `--primary-foreground` | `text-primary-foreground`     | `0.98 0.01 181`               | `0.28 0.04 193` | —                  | Text on primary bg               |
| `--accent`             | `bg-accent` / `text-accent`   | `0.96 0.025 185`              | `0.26 0.04 185` | **10.84:1 🌟 AAA** | Hover backgrounds, selected rows |
| `--accent-foreground`  | `text-accent-foreground`      | `0.32 0.07 185`               | `0.82 0.08 183` | —                  | Text on accent bg                |
| `--ring`               | `ring` / `outline-ring`       | `0.55 0.095 185` ✅ **FIXED** | `0.7 0.12 183`  | —                  | Focus rings, keyboard nav        |

### Structural Tokens

| CSS Variable             | Tailwind Class              | Light Value           | Dark Value            | Purpose                        |
| ------------------------ | --------------------------- | --------------------- | --------------------- | ------------------------------ |
| `--secondary`            | `bg-secondary`              | `0.967 0.001 286.375` | `0.274 0.006 286.033` | Secondary interactive surfaces |
| `--secondary-foreground` | `text-secondary-foreground` | `0.21 0.006 285.885`  | `0.985 0 0`           | Text on secondary bg           |
| `--border`               | `border-border`             | `0.92 0.004 286.32`   | `0.985 0 0 / 10%`     | All borders                    |
| `--input`                | `border-input`              | `0.92 0.004 286.32`   | `0.985 0 0 / 15%`     | Input field borders            |

### Semantic State Tokens (WCAG Compliant)

| CSS Variable               | Tailwind Class                        | Light Value                  | Dark Value                  | Contrast                  | Use For                      |
| -------------------------- | ------------------------------------- | ---------------------------- | --------------------------- | ------------------------- | ---------------------------- |
| `--success`                | `bg-success` / `text-success`         | `0.53 0.14 162`              | `0.62 0.14 162`             | **4.51:1 ✅ AA**          | Item packed, bag complete    |
| `--success-foreground`     | `text-success-foreground`             | `0.98 0 0`                   | `0.15 0.01 162`             | —                         | Text on success bg           |
| `--warning`                | `bg-warning` / `text-warning`         | `0.78 0.17 75`               | `0.82 0.17 75`              | **8.84:1 🌟 AAA**         | Near weight limit, reminders |
| `--warning-foreground`     | `text-warning-foreground`             | `0.2 0.02 75`                | `0.2 0.02 75`               | —                         | Text on warning bg           |
| `--destructive`            | `bg-destructive` / `text-destructive` | `0.565 0.24 27` ✅ **FIXED** | `0.56 0.22 24` ✅ **FIXED** | **4.67:1 / 5.10:1 ✅ AA** | Errors, remove actions       |
| `--destructive-foreground` | `text-destructive-foreground`         | `0.98 0 0`                   | `0.985 0 0`                 | —                         | Text on destructive bg       |

**✅ FIXED** markers indicate values adjusted from original shadcn output to meet WCAG AA standards.

### Sidebar Tokens

| Token                          | Purpose                   | Note                      |
| ------------------------------ | ------------------------- | ------------------------- |
| `--sidebar`                    | Sidebar background        | Teal-tinted in light mode |
| `--sidebar-foreground`         | Sidebar text              | —                         |
| `--sidebar-primary`            | Active nav item bg        | Matches `--primary`       |
| `--sidebar-primary-foreground` | Text on active nav        | —                         |
| `--sidebar-accent`             | Hover state in sidebar    | Matches `--accent`        |
| `--sidebar-accent-foreground`  | Text on sidebar hover     | —                         |
| `--sidebar-border`             | Sidebar dividers          | —                         |
| `--sidebar-ring`               | Focus ring inside sidebar | —                         |

**Rule:** Sidebar tokens are independent. Never use `bg-primary` or `bg-accent` inside the sidebar — use `bg-sidebar-primary` and `bg-sidebar-accent`.

### Chart Tokens

| Token       | Value                                | Usage                    |
| ----------- | ------------------------------------ | ------------------------ |
| `--chart-1` | `oklch(0.85 0.13 181)`               | Lightest data series     |
| `--chart-2` | `oklch(0.78 0.13 182)`               | Second data series       |
| `--chart-3` | `oklch(0.70 0.12 183)`               | Third data series        |
| `--chart-4` | `oklch(0.55 0.095 185)` ✅ **FIXED** | Fourth (matches primary) |
| `--chart-5` | `oklch(0.51 0.09 186)`               | Darkest data series      |

Always use `var(--chart-1)` through `var(--chart-5)` in chart components. Never invent new chart colors.

### Radius Tokens

| CSS Variable   | Tailwind Class | Value                        |
| -------------- | -------------- | ---------------------------- |
| `--radius`     | base           | `0.625rem`                   |
| `--radius-sm`  | `rounded-sm`   | `calc(var(--radius) - 4px)`  |
| `--radius-md`  | `rounded-md`   | `calc(var(--radius) - 2px)`  |
| `--radius-lg`  | `rounded-lg`   | `= --radius` (0.625rem)      |
| `--radius-xl`  | `rounded-xl`   | `calc(var(--radius) + 4px)`  |
| `--radius-2xl` | `rounded-2xl`  | `calc(var(--radius) + 8px)`  |
| `--radius-3xl` | `rounded-3xl`  | `calc(var(--radius) + 12px)` |
| `--radius-4xl` | `rounded-4xl`  | `calc(var(--radius) + 16px)` |

Never hardcode `rounded-[8px]` or similar. Always use the radius scale above.

---

### 12.7 Component Usage Patterns

### Buttons (shadcn)

```tsx
import { Button } from '@/shared/components/ui/button';

// ✅ Primary action — Add to bag, Save, Confirm
<Button variant="default">Add to bag</Button>

// ✅ Secondary action — View, Browse
<Button variant="secondary">View suitcase</Button>

// ✅ Destructive — Remove, Delete
<Button variant="destructive">Remove item</Button>

// ✅ Ghost — Cancel, Dismiss
<Button variant="ghost">Cancel</Button>

// ✅ Outline — Less prominent actions
<Button variant="outline">Edit details</Button>

// ❌ NEVER do this
<button className="bg-teal-600 text-white">Add</button>
<button className="bg-[oklch(0.55_0.095_185)] text-white">Add</button>
```

### Cards

```tsx
// ✅ CORRECT — semantic tokens
<div className="bg-card text-card-foreground border border-border rounded-xl p-5">
    <h3 className="text-foreground font-semibold">Weekend Carry-on</h3>
    <p className="text-muted-foreground text-sm">Paris · 3 nights</p>
</div>

// ❌ WRONG — hardcoded colors
<div className="bg-white border border-gray-200 rounded-xl p-5">
    <h3 className="text-black font-semibold">Weekend Carry-on</h3>
    <p className="text-gray-500 text-sm">Paris · 3 nights</p>
</div>
```

### Semantic State Feedback (Toasts, Alerts, Badges)

```tsx
// ✅ Success — item packed, bag complete
<div className="bg-success text-success-foreground rounded-md px-3 py-2">
    Passport added! You're all set.
</div>

// ✅ Warning — near weight limit
<div className="bg-warning text-warning-foreground rounded-md px-3 py-2">
    Almost at the limit — want to shift something?
</div>

// ✅ Error — save failed
<div className="bg-destructive text-destructive-foreground rounded-md px-3 py-2">
    Couldn't save. Let's try that again together.
</div>

// ✅ PREFERRED: Soft semantic (border + tinted bg) — better for toasts
<div className="border border-success/30 bg-success/8 text-foreground rounded-md px-3 py-2">
    <span className="text-success font-semibold">Success!</span> Passport added.
</div>
```

### Hover / Selected Rows — Use Accent

```tsx
// ✅ List rows, nav items, selectable items
<div className="bg-muted hover:bg-accent hover:text-accent-foreground
                border border-transparent hover:border-primary
                rounded-lg px-4 py-2 cursor-pointer transition-colors">
    Weekend carry-on
</div>

// ✅ Selected state
<div className="bg-accent text-accent-foreground border border-primary
                rounded-lg px-4 py-2">
    Weekend carry-on (selected)
</div>
```

### Input Focus Rings — Automatic

The `@layer base` in `globals.css` applies `outline-ring/50` globally. Input focus will automatically render a Teal ring.

```tsx
// ✅ Just use shadcn Input — ring is automatic
import { Input } from '@/shared/components/ui/input';

<Input placeholder="Search items..." />;
// Focus ring is Teal, matches --ring token, no extra work needed
```

### Badges — Domain State → Semantic Token Mapping

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

// ✅ Define badge variants using semantic tokens
const badgeVariants = cva(
	'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
	{
		variants: {
			variant: {
				primary: 'bg-primary/12 text-primary',
				success: 'bg-success/12 text-success',
				warning: 'bg-warning/12 text-warning',
				destructive: 'bg-destructive/12 text-destructive',
				secondary: 'bg-secondary/12 text-secondary-foreground',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
);

// ✅ Map domain state → badge variant
const bagStatusVariant = {
	PACKED: 'success',
	NEAR_LIMIT: 'warning',
	OVERWEIGHT: 'destructive',
	IN_PROGRESS: 'primary',
} as const;

// ✅ Usage
function BagStatusBadge({ status }: { status: ContainerStatus }) {
	return (
		<span className={badgeVariants({ variant: bagStatusVariant[status] })}>
			{statusLabel[status]}
		</span>
	);
}

// ❌ NEVER map domain → hardcoded color
const colorMap = {
	OVERWEIGHT: 'bg-red-500 text-white', // Wrong
	PACKED: 'bg-green-500 text-white', // Wrong
};
```

### Muted Text Hierarchy

```tsx
// ✅ Primary content
<h2 className="text-foreground font-semibold">Weekend Carry-on</h2>

// ✅ Supporting / secondary content
<p className="text-muted-foreground text-sm">Paris · 3 nights · 7 items</p>

// ✅ Disabled / placeholder
<span className="text-muted-foreground/60">No items added yet</span>
```

### Using Base UI Primitives

```tsx
import { Switch } from '@base-ui/react/switch';
import { cn } from '@/shared/lib/utils';

// ✅ Style Base UI with semantic tokens
function CustomSwitch() {
	return (
		<Switch.Root
			className={cn(
				'relative inline-flex h-6 w-11 items-center rounded-full',
				'bg-muted border border-border',
				'data-[state=checked]:bg-primary',
				'transition-colors'
			)}
		>
			<Switch.Thumb
				className={cn(
					'inline-block h-4 w-4 rounded-full',
					'bg-background shadow-sm',
					'transition-transform',
					'data-[state=checked]:translate-x-6',
					'data-[state=unchecked]:translate-x-1'
				)}
			/>
		</Switch.Root>
	);
}
```

### Using class-variance-authority for Variants

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

// ✅ Define component variants with semantic tokens
const alertVariants = cva('relative w-full rounded-lg border p-4', {
	variants: {
		variant: {
			default: 'bg-background text-foreground',
			success: 'border-success/30 bg-success/8 text-foreground',
			warning: 'border-warning/30 bg-warning/8 text-foreground',
			destructive:
				'border-destructive/30 bg-destructive/8 text-foreground',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export interface AlertProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
	return (
		<div className={cn(alertVariants({ variant }), className)} {...props} />
	);
}
```

---

### 12.8 Dark Mode Rules

Dark mode is applied via the `.dark` class on `<html>`. `next-themes` (^0.4.6) handles this automatically.

### Setting Up next-themes

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

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
```

### Theme Toggle Component

```tsx
'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/shared/components/ui/button';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		>
			<span className="dark:hidden">🌙</span>
			<span className="hidden dark:inline">☀️</span>
		</Button>
	);
}
```

### Key Dark Mode Characteristics

- Background: `oklch(0.141 0.005 285.823)` — deep zinc, not pure black
- Card: `oklch(0.21 0.006 285.885)` — slightly lighter than background (creates layering)
- Primary (Teal): lightens to `oklch(0.7 0.12 183)` for contrast on dark bg
- Accent: dark Teal tint `oklch(0.26 0.04 185)` — visible but not glowing
- Borders: white/10% transparency — soft, not harsh
- Warning foreground: stays dark brown in both modes (yellow bg needs dark text)

**Rule:** Dark mode values are **intentionally different** from light. Never copy one to the other.

---

### 12.9 Domain → UI Mapping Rule

```
Domain enum → semantic intent → CSS token → Tailwind class
```

**Correct:**

```ts
// ✅ ContainerStatus.OVERWEIGHT → "destructive intent" → bg-destructive
import { ContainerStatus } from '@beggy/shared/constants';

const intentMap: Record<ContainerStatus, string> = {
	[ContainerStatus.PACKED]: 'bg-success text-success-foreground',
	[ContainerStatus.NEAR_LIMIT]: 'bg-warning text-warning-foreground',
	[ContainerStatus.OVERWEIGHT]: 'bg-destructive text-destructive-foreground',
	[ContainerStatus.IN_PROGRESS]: 'bg-primary text-primary-foreground',
};
```

**Wrong:**

```ts
// ❌ Domain controlling color directly
const colorMap = {
	OVERWEIGHT: 'bg-red-500', // raw palette
	PACKED: '#22c55e', // hardcoded hex
};
```

---

### 12.10 Component Pre-Ship Checklist

Before merging any UI component PR, verify:

- [ ] No raw Tailwind palette colors (`bg-red-*`, `text-blue-*`, etc.)
- [ ] No hardcoded hex, rgb, hsl, or oklch in JSX/TSX
- [ ] All colors come from semantic utilities (`bg-primary`, `bg-success`, `text-muted-foreground`, etc.)
- [ ] Hover states use `bg-accent text-accent-foreground`
- [ ] Focus rings are not manually overridden (global `outline-ring/50` handles it)
- [ ] Radius uses Tailwind classes from the scale (`rounded-lg`, `rounded-xl`, etc.)
- [ ] **Dark mode tested** — toggle theme and verify nothing looks broken
- [ ] Semantic state (success/warning/destructive) matches the actual intent
- [ ] Chart components use `var(--chart-1)` through `var(--chart-5)` only
- [ ] Sidebar components use `bg-sidebar-*` tokens, not general tokens
- [ ] **WCAG AA contrast verified** — use browser DevTools or online checker

---

### 12.11 Accessibility (WCAG 2.1 AA Compliance)

### Compliance Status

✅ **WCAG 2.1 Level AA COMPLIANT** — All color combinations meet minimum 4.5:1 contrast for normal text after applying audit fixes.

### Key Fixes Applied

| Token                   | Original              | Fixed              | Contrast Improvement         |
| ----------------------- | --------------------- | ------------------ | ---------------------------- |
| `--primary` (light)     | `0.6 0.1 185`         | `0.55 0.095 185`   | 3.56:1 ❌ → **4.58:1 ✅ AA** |
| `--destructive` (light) | `0.577 0.245 27.325`  | `0.565 0.24 27`    | 4.50:1 ⚠️ → **4.67:1 ✅ AA** |
| `--destructive` (dark)  | `0.704 0.191 22.216`  | `0.56 0.22 24`     | 2.77:1 ❌ → **5.10:1 ✅ AA** |
| `--muted-foreground`    | `0.552 0.016 285.938` | `0.52 0.017 285.9` | 4.39:1 ❌ → **4.93:1 ✅ AA** |

### Accessibility Rules

1. **Semantic tokens are tuned for WCAG compliance** — use them as-is
2. **Do not reduce opacity** on semantic colors (e.g., `bg-success/40`) in ways that break contrast
3. **`bg-success/12 text-success`** (badge pattern) is fine — pairs light bg with full-chroma text
4. **`bg-warning text-warning-foreground`** is specifically tuned — yellow bg requires dark brown text
5. **Always add `aria-label`** to badges and status indicators that convey meaning visually
6. **Dark mode preserves contrast** — do not override dark mode tokens in components

### Testing Contrast

Use browser DevTools or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify any new color combinations meet 4.5:1 minimum.

---

### 12.12 Animation & Micro-interactions

### Using tw-animate-css

```tsx
import 'tw-animate-css';

// ✅ Entry animations
<div className="animate-fade-in">
    <Card>Content appears smoothly</Card>
</div>

// ✅ Exit animations
<div className="animate-fade-out">
    <Toast>Disappears gracefully</Toast>
</div>

// ✅ Attention-seeking (use sparingly)
<Badge className="animate-bounce">New</Badge>
```

### Custom Transitions

```tsx
// ✅ Hover transitions on interactive elements
<button className="transition-colors hover:bg-accent hover:text-accent-foreground">
    Hover me
</button>

// ✅ Transform transitions
<div className="transition-transform hover:scale-105">
    Scales on hover
</div>

// ✅ Multiple properties
<button className="transition-[background-color,transform,box-shadow]
                   hover:bg-primary hover:scale-105 hover:shadow-lg">
    Complex transition
</button>
```

---

### 12.13 Common Pitfalls & Solutions

### ❌ Problem: Utilities not applying

**Cause:** Missing `@theme inline` mapping or Tailwind not scanning component files.

**Solution:**

- Verify `@theme inline` block includes the token
- Check `tailwind.config.ts` `content` array includes component paths:
    ```ts
    content: [
    	'./src/app/**/*.{ts,tsx}',
    	'./src/shared/**/*.{ts,tsx}',
    	'./src/features/**/*.{ts,tsx}',
    ];
    ```

### ❌ Problem: Dark mode not working

**Cause:** Missing `.dark` class on root or incorrect theme provider setup.

**Solution:**

- Ensure `ThemeProvider` wraps app with `attribute="class"`
- Verify `suppressHydrationWarning` on `<html>` tag
- Check dark mode variables are defined in `.dark` selector in `globals.css`

### ❌ Problem: Colors look different in production

**Cause:** Tailwind purging classes or build cache issues.

**Solution:**

- Clear `.next` cache: `rm -rf .next && pnpm build`
- Verify all dynamic classNames use `cn()` or are in safelist

### ❌ Problem: shadcn component overriding custom styles

**Cause:** Higher specificity in shadcn component CSS.

**Solution:**

- Use `!important` sparingly: `className="!bg-accent"`
- Or increase specificity: `className="[&]:bg-accent"`
- Or modify the shadcn component file directly in `src/shared/components/ui/`

---

### 12.14 Adding New Semantic Tokens

If a new semantic color is needed (e.g., `--info`):

**Step 1:** Add raw oklch values to `:root` and `.dark`

```css
:root {
	--info: 0.6 0.15 230; /* sky blue */
	--info-foreground: 0.98 0 0;
}
.dark {
	--info: 0.7 0.15 228;
	--info-foreground: 0.15 0.02 230;
}
```

**Step 2:** Add Tailwind mapping to `@theme inline`

```css
@theme inline {
	--color-info: oklch(var(--info));
	--color-info-foreground: oklch(var(--info-foreground));
}
```

**Step 3:** Verify WCAG contrast

- Light: `info-foreground` on `info` must be ≥ 4.5:1
- Dark: `info-foreground` on `info` must be ≥ 4.5:1

**Step 4:** Use it

```tsx
<div className="bg-info text-info-foreground">AI suggestion ready</div>
```

Never add tokens only in one place.

---

### 12.15 Storybook Integration

Storybook (^10.2.8) is configured with theme switching and accessibility testing.

### Preview Configuration

```tsx
// .storybook/preview.tsx
import '../src/app/globals.css';
import { withThemeByClassName } from '@storybook/addon-themes';

export const decorators = [
	withThemeByClassName({
		themes: {
			light: '',
			dark: 'dark',
		},
		defaultTheme: 'light',
	}),
];
```

### Writing Stories with Semantic Tokens

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './button';

const meta: Meta<typeof Button> = {
	title: 'UI/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
	args: {
		variant: 'default',
		children: 'Add to bag',
	},
};

export const Destructive: Story = {
	args: {
		variant: 'destructive',
		children: 'Delete item',
	},
};

// ✅ Test all variants in both themes automatically
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Button variant="default">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
		</div>
	),
};
```

### Accessibility Testing in Storybook

```tsx
// Enable a11y addon checks
export const Accessible: Story = {
	args: {
		variant: 'default',
		children: 'Accessible button',
	},
	parameters: {
		a11y: {
			config: {
				rules: [
					{
						id: 'color-contrast',
						enabled: true,
					},
				],
			},
		},
	},
};
```

---

### 12.16 Quick Reference — Package Usage Summary

| Package                    | Use For               | Example                           |
| -------------------------- | --------------------- | --------------------------------- |
| `shadcn`                   | Pre-styled components | `<Button variant="default">`      |
| `@base-ui/react`           | Unstyled primitives   | `<Switch.Root>`, `<NumberField>`  |
| `radix-ui`                 | Overlay components    | `<Dialog>`, `<DropdownMenu>`      |
| `class-variance-authority` | Component variants    | `const buttonVariants = cva(...)` |
| `clsx` + `tailwind-merge`  | Conditional classes   | `cn('bg-card', className)`        |
| `next-themes`              | Dark mode             | `useTheme()` hook                 |
| `tw-animate-css`           | Animations            | `className="animate-fade-in"`     |
| `@casl/react`              | Permissions           | `<Can I="update" a="Bag">`        |
| `react-hook-form` + `zod`  | Forms                 | Validated inputs                  |
| `date-fns`                 | Date utils            | Format trip dates                 |

---

### 12.17 Final Notes

- **Never regenerate `globals.css` from shadcn** without reapplying WCAG fixes
- **Test every component in both light and dark mode** before shipping
- **When in doubt, use shadcn components first** — they're pre-configured with semantic tokens
- **Refer to WCAG audit report** (`wcag-contrast-audit-report.md`) for detailed contrast analysis
- **Keep this section updated** when adding new tokens or components

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
