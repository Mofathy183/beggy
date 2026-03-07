# Beggy Shared

Shared **types, schemas, constants, and utilities** for the **Beggy** monorepo.

This package acts as the **single source of truth** for all domain models, validation schemas, and shared logic used across the Beggy ecosystem.

It ensures **type safety, consistency, and maintainability** between the backend (`@beggy/api`) and frontend (`@beggy/web`).

---

# Purpose

The `@beggy/shared` package exists to:

- Prevent **type drift** between API and frontend
- Provide **centralized Zod validation schemas**
- Share **constants, enums, and constraints**
- Provide **utility functions for schemas and container calculations**
- Maintain **consistent domain models**

Both **backend and frontend import directly from this package**.

---

# Installation (Internal Workspace)

This package is **not meant to be installed externally**.  
It is used via **pnpm workspaces** inside the Beggy monorepo.

Example usage inside another workspace package:

```ts
import { UserRole } from "@beggy/shared/constants"
import { loginSchema } from "@beggy/shared/schemas"
import type { User } from "@beggy/shared/types"
````

---

# Package Structure

```
src/
│
├── constants/
│
├── containers/
│
├── schemas/
│
├── types/
│
├── utils/
│
└── index.ts
```

---

# Exports

The package exposes modular entry points:

| Export                  | Description             |
| ----------------------- | ----------------------- |
| `@beggy/shared`         | Main entry point        |
| `@beggy/shared/types`   | Shared TypeScript types |
| `@beggy/shared/schemas` | Zod validation schemas  |

Example:

```ts
import { loginSchema } from "@beggy/shared/schemas"
import type { LoginRequest } from "@beggy/shared/types"
```

---

# Key Features

## Zod Schema Validation

All API request and response validation is defined with **Zod**.

Example:

```ts
import { loginSchema } from "@beggy/shared/schemas"

const result = loginSchema.parse(request.body)
```

This ensures:

* API validation
* Frontend type inference
* Consistent contracts

---

## Shared Domain Types

Types are defined once and reused everywhere.

Example:

```ts
import type { User, Suitcase, Bag, Item } from "@beggy/shared/types"
```

---

## Constants & Enums

Centralized constants improve maintainability.

Examples include:

* User roles
* API status codes
* Suitcase statuses
* Constraint definitions
* RBAC permissions

Example:

```ts
import { UserRole } from "@beggy/shared/constants"
```

---

## Container Utilities

Helpers for suitcase and bag calculations.

Example responsibilities:

* Capacity calculations
* Container state updates
* Packing status

Located in:

```txt
src/containers/
```

---

# Build Output

The package compiles into:

```txt
dist/
```

Contents include:

* compiled JavaScript
* TypeScript declaration files (`.d.ts`)

Entry point:

```txt
dist/index.js
dist/index.d.ts
```

---

# Development

## Install dependencies

From repository root:

```bash
pnpm install
```

---

## Build package

```bash
pnpm --filter @beggy/shared build
```

---

## Type checking

```bash
pnpm --filter @beggy/shared type-check
```

---

## Linting

```bash
pnpm --filter @beggy/shared lint
```

---

# Testing

Tests use **Vitest**.

Run tests:

```bash
pnpm --filter @beggy/shared test
```

Watch mode:

```bash
pnpm --filter @beggy/shared test:watch
```

Coverage:

```bash
pnpm --filter @beggy/shared test:coverage
```

Test files are located in:

```txt
tests/**/*.test.ts
```

---

# TypeScript Configuration

Important compiler settings:

| Option            | Value   |
| ----------------- | ------- |
| Target            | ES2022  |
| Module            | ESNext  |
| Module Resolution | Bundler |
| Strict Mode       | Enabled |
| Composite         | true    |
| Declarations      | true    |

These settings ensure:

* strong type safety
* compatibility with Turborepo builds
* generated `.d.ts` for other packages

---

# Dependencies

| Package | Purpose                                      |
| ------- | -------------------------------------------- |
| `zod`   | Runtime schema validation and type inference |

---

# Best Practices

When working in the Beggy codebase:

✔ Always import shared types and schemas from `@beggy/shared`
✔ Avoid redefining domain types in apps
✔ Keep validation schemas inside this package
✔ Use Zod inference to generate TypeScript types

Example:

```ts
type LoginRequest = z.infer<typeof loginSchema>
```

---

# Related Packages

| Package      | Description                  |
| ------------ | ---------------------------- |
| `@beggy/api` | Express backend              |
| `@beggy/web` | Next.js frontend             |
| `@beggy/mcp` | MCP developer tooling server |

---

# Role in Beggy Architecture

`@beggy/shared` is a **core architectural package** in the Beggy monorepo.

It ensures:

* type-safe communication between services
* centralized validation
* shared domain logic
* reduced duplication

Without this package, API and frontend contracts would easily diverge.

---

```

---

✅ This README now functions as:

- **Developer onboarding guide**
- **AI assistant context**
- **Architectural documentation**
- **Shared package reference**

---
```
