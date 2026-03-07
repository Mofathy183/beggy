# BEGGY API

Beggy API is the backend service for **Beggy**, an AI-powered smart travel packing assistant. It provides REST endpoints for authentication, users, profiles, and future packing-related resources like bags, suitcases, and items.

The API integrates **AI recommendations**, **weather data**, and **structured packing management** to help travelers pack efficiently.

---

# Overview

Beggy helps travelers organize luggage intelligently using:

* 🌦 **Weather-based packing recommendations** (OpenWeather)
* 🤖 **AI-powered suggestions** (Google Gemini)
* 🧳 **Structured packing containers** (bags, suitcases, items)
* 🔐 **Secure authentication & RBAC authorization**
* 📦 **Monorepo architecture with shared types**

The API exposes endpoints used by the Beggy web application and other clients.

---

# Tech Stack

### Runtime & Language

* Node.js ≥ 18
* TypeScript
* SWC (fast compilation)

### Framework

* Express.js 5

### Database

* PostgreSQL
* Prisma ORM

### Authentication

* JWT (Access + Refresh Tokens)
* Passport.js
* Google OAuth
* Facebook OAuth

### Authorization

* CASL (Role Based Access Control)

### Validation

* Zod schemas (shared with frontend)

### Security

* Helmet
* CSRF protection
* Rate limiting
* XSS sanitization
* bcrypt password hashing

### Logging

* Pino

### API Documentation

* Swagger
* swagger-jsdoc
* swagger-ui-express

### External Integrations

* OpenWeather API
* Google Gemini AI
* Resend Email API

---

# API Base URL

```
/api/beggy
```

Example:

```
http://localhost:3000/api/beggy/users
```

---

# Project Structure

```
apps/api
│
├── src
│   ├── modules
│   │   ├── auth
│   │   ├── users
│   │   ├── profiles
│   │   ├── bags
│   │   ├── items
│   │   ├── suitcases
│   │   ├── weather
│   │   └── gemini
│   │
│   ├── shared
│   │   ├── middlewares
│   │   ├── utils
│   │   ├── types
│   │   └── constants
│   │
│   ├── config
│   │   ├── env.config.ts
│   │   └── passport.config.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma
│   ├── schema.prisma
│   └── models
│
└── tests
```

---

# API Architecture

The API follows a **modular layered architecture**.

```
Route → Controller → Service → Database
```

### Route

Defines endpoints and middleware.

### Controller

Handles request and response logic.

### Service

Contains business logic.

### Prisma

Handles database queries.

Example:

```
users.route.ts
users.controller.ts
users.service.ts
users.mapper.ts
users.validator.ts
```

---

# Available Modules

### Auth

The Auth domain is responsible for:

- User identity
- Authentication & authorization context
- Credential lifecycle (passwords, email, OAuth)
- Token management

Endpoints include:

```
POST /auth/signup
POST /auth/login
POST /auth/logout
POST /auth/refresh-token
GET  /auth/csrf-token
```

Supports:

* JWT authentication
* OAuth providers
* CSRF protection

---

### Users

Users are:

  - Managed by the system
  - Controlled via roles and permissions
  - Not responsible for authentication logic

Examples:

```
GET /users
GET /users/:id
POST /users
PATCH /users/:id
DELETE /users/:id
```

---

### Profiles

Profiles are:

  - Separate from authentication
  - Editable by the owning user
  - Publicly readable where allowed

Examples:

```
GET /profiles/me
PATCH /profiles/me
GET /profiles/:id
```

---

### Bags *(planned / partially implemented)*

Manage travel bags.

Examples:

```
GET /bags
POST /bags
GET /bags/:id
```

---

### Items

Items are:

- User-owned (private by default)
- Reusable across multiple containers
- Measured using structured physical constraints (weight, volume)
- Independent from container placement logic

Examples:

```text
GET /items
POST /items
PATCH /items
GET /items/:id
DELETE /items/:id
```
---

### Suitcases *(planned)*

Suitcase containers with physical constraints.

---

### Weather *(planned)*

Weather integration.

Example:

```txt
GET /weather/:city
```

Uses OpenWeather API.

---

### Gemini AI *(planned)*

AI-powered packing recommendations.

Example:

```txt
POST /gemini/recommendations
```

Uses Google Gemini API.

---

# Authentication

Beggy API uses **JWT authentication with refresh tokens**.

### Flow

```txt
Login → Access Token + Refresh Token
```

Access token is used for protected routes.

Refresh token generates a new access token when expired.

---

# RBAC Authorization

The API uses **CASL** to control permissions.

Roles include:

```txt
ADMIN
MODERATOR
MEMBER
USER
```

Permissions follow this model:

```txt
Action + Subject + Scope
```

Example:

```txt
CREATE BAG OWN
READ USER ANY
```

---

# Environment Variables

Create a `.env` file.

Example:

```env
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/beggy

JWT_ACCESS_SECRET=secret
JWT_REFRESH_SECRET=secret

SESSION_SECRET=session_secret
CSRF_SECRET_KEY=csrf_secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

OPENWEATHER_API_KEY=
AI_API_KEY=
RESEND_API_KEY=
```

---

# Running the API

## Install dependencies

From the monorepo root:

```bash
pnpm install
```

---

## Generate Prisma client

```bash
pnpm prisma:generate
```

---

## Run migrations

```bash
pnpm prisma:migrate
```

---

## Start development server

```bash
pnpm dev
```

---

## Start production

```bash
pnpm build
pnpm start
```

---

# API Documentation

Swagger documentation is available at:

```txt
/api-docs
```

Example:

```txt
http://localhost:3000/api-docs
```

---

# Testing

Beggy API uses **Vitest**.

### Run tests

```bash
pnpm test
```

### Watch mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

Tests include:

* Unit tests
* Integration tests
* HTTP endpoint tests using **Supertest**

---

# Database

Database is managed using **Prisma**.

### Commands

Generate client

```bash
pnpm prisma:generate
```

Run migrations

```bash
pnpm prisma:migrate
```

Reset database

```bash
pnpm prisma:reset
```

Seed database

```bash
pnpm prisma:seed
```

---

# Logging

The API uses **Pino** for structured logging.

Development logs are formatted with **pino-pretty**.

---

# Security

Security features include:

* Helmet HTTP headers
* CSRF protection
* Rate limiting
* XSS sanitization
* Password hashing with bcrypt
* Secure cookie handling

---

# Monorepo Context

The API lives inside the **Beggy Turborepo**.

Main packages:

```txt
apps/
  api
  web
  mcp

packages/
  shared
```

Shared types and schemas come from:

```txt
@beggy/shared
```

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Follow existing architecture patterns
4. Add tests
5. Submit a pull request

---

# License

MIT License

---
