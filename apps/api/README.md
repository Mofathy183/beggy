# Beggy API

**The Beggy REST API — authentication, authorization, packing, AI & weather.**

[Express](https://expressjs.com/)
[Prisma](https://www.prisma.io/)
[PostgreSQL](https://www.postgresql.org/)
[TypeScript](https://www.typescriptlang.org/)

---

## Overview

`@beggy/api` is the backend service for Beggy. It exposes a REST API for authentication, user management, profile management, and **currently implemented** inventory primitives like **items** (with additional packing domains such as bags/suitcases partially implemented).

**Base URL:** `/api/beggy`  
**API Docs:** `/docs` (Swagger UI, available in development)

---

## Tech Stack

| Category          | Technology                                                             |
| ----------------- | ---------------------------------------------------------------------- |
| **Runtime**       | Node.js ≥ 18, TypeScript (compiled with SWC)                           |
| **Framework**     | Express.js 5.2                                                         |
| **Database**      | PostgreSQL via Prisma 7.4 ORM                                          |
| **Auth**          | JWT (access + refresh), Passport.js, Google OAuth, Facebook OAuth      |
| **Authorization** | CASL 6.8 (Role-Based Access Control)                                   |
| **Validation**    | Zod 4 (via `@beggy/shared`)                                            |
| **Security**      | Helmet, csrf-csrf, express-rate-limit, express-xss-sanitizer, bcryptjs |
| **Logging**       | Pino 9.6 + pino-http + pino-pretty (dev)                               |
| **API Docs**      | swagger-jsdoc + swagger-ui-express                                     |
| **Email**         | Resend 4.2                                                             |
| **HTTP Client**   | axios 1.8 (weather + AI APIs)                                          |

---

## Project Structure

```text
apps/api/
│
├── src/
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication & token management
|   │   │   ├── strategies/        # OAuth Passport Strategies
│   │   ├── users/                 # User management
│   │   ├── profiles/              # Profile management
│   │   ├── bags/                  # Bag containers (implemented, not yet mounted)
│   │   ├── items/                 # Personal item library
│   │   ├── suitcases/             # Suitcase containers (planned)
│   │   ├── bag-items/             # Bag ↔ item relations
│   │   ├── suitcase-items/        # Suitcase ↔ item relations
│   │   ├── weather/               # OpenWeather integration
│   │   └── gemini/                # Google Gemini AI integration
│   │
│   ├── shared/
│   │   ├── middlewares/           # Auth, permission, validator, query, error
│   │   ├── utils/                 # Cookies, tokens, responses, errors, passwords
│   │   ├── constants/             # Shared constants
│   │   └── types/                 # Shared TypeScript types
│   │
│   ├── config/
│   │   ├── env.config.ts          # Environment variable validation
│   │   └── passport.config.ts     # Passport strategies
│   │
│   ├── emails/                    # Transactional email templates
│   ├── app.ts                     # Express app setup
│   ├── app.route.ts               # Root router composition
│   └── server.ts                  # Entry point
│
├── prisma/
│   ├── schema.prisma              # Generator + datasource + enums
│   ├── models/                    # Model files (user, bag, item, suitcase, etc.)
│   └── generated/prisma/          # Prisma Client output
│
└── docs/                          # Swagger definition
```

---

## Module Architecture

Each domain module follows a strict layered pattern:

```text
Route (factory) → Controller → Service → Prisma → Database
```

```text
src/modules/<domain>/
├── <domain>.route.ts          # Route factory function
├── <domain>.controller.ts     # Request/response handling
├── <domain>.service.ts        # Business logic
├── <domain>.mapper.ts         # Data transformation (optional)
├── <domain>.validator.ts      # Route-level validation (optional)
└── __tests__/
    ├── <domain>.service.test.ts
    └── <domain>.integration.test.ts
```

**Route factory pattern:**

```typescript
export const createUserRouter = (controller: UserController) => {
	const router = Router();
	router.get('/', authenticate, controller.list);
	router.post(
		'/',
		authenticate,
		authorize('CREATE', 'USER'),
		controller.create
	);
	return router;
};
```

---

## API Endpoints

### Mounted routes

| Module   | Base Path             | Description                                       |
| -------- | --------------------- | ------------------------------------------------- |
| Auth     | `/api/beggy/auth`     | Signup, login, logout, refresh token, CSRF, OAuth |
| Users    | `/api/beggy/users`    | User CRUD, role management                        |
| Profiles | `/api/beggy/profiles` | Profile view & update                             |
| Items    | `/api/beggy/items`    | CRUD for user-owned items                         |

### Auth endpoints

```text
POST   /auth/signup              Register with email & password
POST   /auth/login               Login with email & password
POST   /auth/logout              Invalidate tokens and clear cookies
POST   /auth/refresh-token       Generate new access token from refresh token
GET    /auth/csrf-token          Retrieve CSRF token (required before mutations)
GET    /auth/me                  Get authenticated user data
GET    /auth/google              Initiate Google OAuth flow
GET    /auth/google/callback     Google OAuth callback
GET    /auth/facebook            Initiate Facebook OAuth flow
GET    /auth/facebook/callback   Facebook OAuth callback
```

### Users endpoints

```text
GET    /users                    List users (paginated, filterable, sortable)
POST   /users                    Create a new user
GET    /users/:id                Get user by ID
PATCH  /users/:id                Update user
DELETE /users/:id                Delete user
PATCH  /users/:id/role           Change user role
```

### Profiles endpoints

```text
GET    /profiles/me              Get own profile
PATCH  /profiles/me              Update own profile
POST   /profiles/me/onboarding   Complete onboarding
GET    /profiles/:id             Get profile by ID (public)
```

### Planned / partially implemented

```text
GET    /bags                     List bags
POST   /bags                     Create a bag
GET    /bags/:id                 Get bag by ID
PATCH  /bags/:id                 Update bag
DELETE /bags/:id                 Delete bag

GET    /weather/:city            Get weather data for a city

POST   /gemini/recommendations   Get AI packing recommendations
```

---

## Authentication & Authorization

### Authentication flow

```text
POST /auth/login
  → validates credentials
  → issues access token (HTTP-only cookie, short-lived)
  → issues refresh token (HTTP-only cookie, long-lived)
  → returns user data

POST /auth/refresh-token
  → validates refresh token from cookie
  → issues new access token
  → rotates refresh token
```

### RBAC model (CASL)

Roles: `ADMIN` → `MODERATOR` → `MEMBER` → `USER`

Permissions are modeled as: **Action + Subject + Scope**

```text
Action:  CREATE | READ | UPDATE | DELETE | MANAGE
Subject: BAG | ITEM | SUITCASE | USER | ROLE | PERMISSION | DASHBOARD | PROFILE
Scope:   OWN | ANY
```

Example — a `USER` can `READ BAG OWN` but not `READ BAG ANY`. An `ADMIN` can `MANAGE USER ANY`.

### CSRF protection

All state-mutating requests require a valid CSRF token. Clients must:

1. Call `GET /auth/csrf-token` to obtain the token
2. Include it in subsequent mutation requests via the `x-csrf-token` header

---

## Database Schema

Managed by Prisma with multi-file models.

### Core models

| Model           | Description                                   |
| --------------- | --------------------------------------------- |
| `User`          | Core user identity, role, status              |
| `Account`       | OAuth accounts linked to a user               |
| `UserToken`     | Email verification & password reset tokens    |
| `Profile`       | User profile (bio, preferences, travel data)  |
| `Permission`    | Fine-grained permission records               |
| `Bag`           | Travel bag container                          |
| `Item`          | Packing item with physical attributes         |
| `Suitcase`      | Suitcase container                            |
| `Container`     | Polymorphic container system                  |
| `ContainerItem` | Container ↔ item junction with placement data |

### Prisma scripts

```bash
pnpm prisma:generate    # Generate Prisma Client
pnpm prisma:migrate     # Create and apply a new migration
pnpm prisma:push        # Push schema to DB (dev, no migration)
pnpm prisma:deploy      # Apply pending migrations (production)
pnpm prisma:reset       # Drop + recreate database
pnpm prisma:seed        # Seed database with initial data
pnpm prisma:test        # Run migrations against the test database
```

---

## Middleware Stack

Applied in this order in `app.ts`:

```text
1.  Security         helmet, xss-sanitizer, rate-limit, CORS
2.  Parsing          JSON body, URL-encoded, cookie-parser
3.  Session/Flash   (optional for now; `express-session` is commented out in `apps/api/app.ts`)
4.  Passport         (when OAuth is enabled)
5.  Logging          pino-http
6.  API Docs         Swagger UI at /docs (bypasses CSRF)
7.  CSRF             inject token middleware → CSRF protection middleware
8.  Routes           all module routers mounted here
9.  Error handling   404 handler → global error handler
```

---

## Environment Variables

The API loads env from a file based on `NODE_ENV`:

- `development` → `.env.local`
- `test` → `.env.test`
- `production` → `.env.production`

| Variable                 | Required | Description                                  |
| ------------------------ | -------- | -------------------------------------------- | ------ | ------------ |
| `NODE_ENV`               | ✅       | `development`                                | `test` | `production` |
| `PORT`                   | ✅       | API server listen port                       |
| `DATABASE_URL`           | ✅       | PostgreSQL connection string                 |
| `POSTGRES_USER`          | ✅       | DB username (used if `DATABASE_URL` not set) |
| `POSTGRES_PASSWORD`      | ✅       | DB password                                  |
| `POSTGRES_DB`            | ✅       | DB name                                      |
| `DB_HOST`                | ✅       | DB host                                      |
| `DB_PORT`                | ✅       | DB port                                      |
| `JWT_ACCESS_SECRET`      | ✅       | Access token signing key                     |
| `JWT_REFRESH_SECRET`     | ✅       | Refresh token signing key                    |
| `JWT_ACCESS_EXPIRES_IN`  | ✅       | Access token TTL (e.g., `15m`)               |
| `JWT_REFRESH_EXPIRES_IN` | ✅       | Refresh token TTL (e.g., `7d`)               |
| `JWT_ACCESS_TOKEN_NAME`  | ✅       | Cookie name for access token                 |
| `JWT_REFRESH_TOKEN_NAME` | ✅       | Cookie name for refresh token                |
| `CSRF_SECRET_KEY`        | ✅       | CSRF protection key                          |
| `CSRF_TOKEN_LENGTH`      | ⚙️       | CSRF token byte length (defaulted in code)   |
| `CSRF_COOKIE_NAME`       | ⚙️       | CSRF cookie name (defaulted in code)         |
| `GOOGLE_CLIENT_ID`       | ⚙️       | Google OAuth (optional)                      |
| `GOOGLE_CLIENT_SECRET`   | ⚙️       | Google OAuth (optional)                      |
| `FACEBOOK_CLIENT_ID`     | ⚙️       | Facebook OAuth (optional)                    |
| `FACEBOOK_CLIENT_SECRET` | ⚙️       | Facebook OAuth (optional)                    |
| `AI_API_KEY`             | ⚙️       | Google Gemini API key (optional)             |
| `OPENWEATHER_API_KEY`    | ⚙️       | OpenWeather API key (optional)               |
| `RESEND_API_KEY`         | ⚙️       | Resend email API key (optional)              |

> `*` — Provide either `DATABASE_URL` **or** the individual `POSTGRES_`_ + `DB\__` variables.

---

## Running Locally

### Development (with Docker database)

```bash
# From monorepo root: start database
docker compose -f docker-compose.dev.yml up postgres

# From apps/api
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev
```

### Development (full Docker stack)

```bash
# From monorepo root
pnpm docker:dev
```

> ⚠️ Run `pnpm docker:dev:build` only when dependencies or Docker config change.  
> For daily development, just use `pnpm docker:dev`.

### Production build

```bash
pnpm build
pnpm start
```

---

## Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Integration tests only (requires test DB)
pnpm test:integration

# Coverage report
pnpm test:coverage
```

Tests use **Vitest** with **Supertest** for HTTP assertions and **Faker** for test data.

Integration tests run against a dedicated `postgres_test` database. Ensure it is running:

```bash
docker compose -f docker-compose.dev.yml up postgres_test
pnpm prisma:test
```

---

## Path Aliases

| Alias                 | Resolves to                 |
| --------------------- | --------------------------- |
| `@/*`                 | `src/*`                     |
| `@config`             | `src/config/index.ts`       |
| `@shared`             | `src/shared/index.ts`       |
| `@modules`            | `src/modules/index.ts`      |
| `@emails`             | `src/emails/index.ts`       |
| `@route`              | `app.route.ts`              |
| `@prisma`             | `prisma/`                   |
| `@prisma-generated/*` | `prisma/generated/prisma/*` |
| `@beggy/shared`       | `../../packages/shared/src` |

---

## API Documentation

Swagger UI is available at `/docs` when the server is running in development. OpenAPI definitions are generated via `swagger-jsdoc` from JSDoc annotations throughout route files.

```url
http://localhost:4000/docs
```

---

## Contributing

Follow the module pattern documented above. When adding a new domain:

1. Create the module directory under `src/modules/<domain>/`
2. Implement service → controller → route (factory)
3. Add Zod schemas to `@beggy/shared`
4. Add TypeScript types to `@beggy/shared`
5. Mount the router in `app.route.ts`
6. Write unit and integration tests
7. Add Swagger JSDoc annotations to the route file

---

**Beggy API** — Authentication · Authorization · Packing · AI · Weather

Part of the [Beggy monorepo](../../README.md) · MIT License
