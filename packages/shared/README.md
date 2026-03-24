# Beggy Shared Package

**The single source of truth for types, Zod schemas, constants, and utilities across Beggy.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zod](https://img.shields.io/badge/Zod-4.3-3E67B1?style=flat-square)](https://zod.dev/)
[![ESM](https://img.shields.io/badge/Module-ESM-F59E0B?style=flat-square)](https://nodejs.org/api/esm.html)

---

## What is this package?

`@beggy/shared` is a workspace package consumed by both `@beggy/api` and `@beggy/web`. It holds everything that must stay in sync between the frontend and backend:

- **Zod schemas** — validation rules for API requests and form data
- **TypeScript types** — shared interfaces derived from schemas and Prisma models
- **Enums & constants** — domain values, error codes, messages, permissions
- **Utility functions** — schema helpers and shared logic

Keeping this as the single source of truth **eliminates type drift** between API validation and frontend form validation.

---

## Package Exports

```typescript
// Zod schemas
import { createUserSchema, loginSchema } from '@beggy/shared/schemas';

// TypeScript types
import type { UserType, BagType } from '@beggy/shared/types';

// Everything (re-exported from index)
import { createUserSchema, UserType } from '@beggy/shared';
```

| Export path             | Contents                             |
| ----------------------- | ------------------------------------ |
| `@beggy/shared`         | All exports (re-exported from index) |
| `@beggy/shared/schemas` | Zod schemas                          |
| `@beggy/shared/types`   | TypeScript types                     |

---

## Package Structure

```text
packages/shared/
│
├── src/
│   ├── constants/              # Enums and constants
│   │   ├── user.enums.ts
│   │   ├── suitcase.enums.ts
│   │   ├── profile.enums.ts
│   │   ├── item.enums.ts
│   │   ├── bag.enums.ts
│   │   ├── auth.enums.ts
│   │   ├── api.enums.ts
│   │   ├── constraints.ts       # Validation constraints (min/max values)
│   │   ├── constraints.enums.ts
│   │   ├── permissions.ts       # RBAC permission definitions
│   │   ├── messages.ts          # User-facing message strings
│   │   └── error.codes.ts       # Error code constants
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   ├── auth.schema.ts       # signup, login, refresh, change-password
│   │   ├── user.schema.ts       # createUser, updateUser, changeRole
│   │   ├── profile.schema.ts    # updateProfile, onboarding
│   │   ├── bag.schema.ts        # createBag, updateBag
│   │   ├── item.schema.ts       # createItem, updateItem
│   │   ├── suitcase.schema.ts   # createSuitcase, updateSuitcase
│   │   ├── api.schema.ts        # Pagination, filter, sort schemas
│   │   └── fields.schema.ts     # Reusable field-level schemas
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── profile.types.ts
│   │   ├── bag.types.ts
│   │   ├── item.types.ts
│   │   ├── suitcase.types.ts
│   │   ├── api.types.ts         # Pagination, list response, API error types
│   │   ├── schema.types.ts      # Schema-derived utility types
│   │   └── constraints.types.ts
│   │
│   ├── containers/              # Container-related utilities
│   │   ├── status.ts            # Container status helpers
│   │   └── calculations.ts      # Weight/volume calculation utilities
│   │
│   ├── utils/
│   │   └── schema.util.ts       # Schema utility functions
│   │
│   └── index.ts                 # Root re-exports
│
├── dist/                        # Compiled output (generated — do not edit)
├── tests/                       # Vitest tests
├── tsconfig.json
└── package.json
```

---

## Usage

### In the API (`@beggy/api`)

```typescript
// Validate incoming request body
import { createUserSchema } from '@beggy/shared/schemas';

const result = createUserSchema.safeParse(req.body);
if (!result.success) {
  throw new AppError(result.error);
}

// Use shared types
import type { CreateUserDto } from '@beggy/shared/types';

class UserService {
  async createUser(data: CreateUserDto) { ... }
}
```

### In the Web (`@beggy/web`)

```typescript
// Form validation — Zod resolver wires directly into React Hook Form
import { createUserSchema } from '@beggy/shared/schemas';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
	resolver: zodResolver(createUserSchema),
});

// Typed API responses
import type { UserType } from '@beggy/shared/types';

const [user, setUser] = useState<UserType | null>(null);
```

### Using constants and enums

```typescript
import { Role, AuthProvider } from '@beggy/shared';
import { MESSAGES, ERROR_CODES } from '@beggy/shared';

// Type-safe domain enums used by both API models and web components
const adminRole = Role.ADMIN;
```

---

## Schema Conventions

### Field-level schemas

Reusable atomic schemas are defined in `fields.schema.ts` and composed into request schemas:

```typescript
// fields.schema.ts — single source for field rules
export const emailField = z.string().email().max(EMAIL_MAX_LENGTH);
export const passwordField = z
	.string()
	.min(PASSWORD_MIN_LENGTH)
	.max(PASSWORD_MAX_LENGTH);

// auth.schema.ts — composed from fields
export const loginSchema = z.object({
	email: emailField,
	password: passwordField,
});
```

### Deriving types from schemas

Always derive TypeScript types from Zod schemas using `z.infer` — never write them by hand:

```typescript
export type LoginDto = z.infer<typeof loginSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
```

### API response types

```typescript
import type { PaginatedResponse, ApiError } from '@beggy/shared/types';

// Typed paginated API response
type UsersResponse = PaginatedResponse<UserType>;
```

---

## Constraints

Validation constraints (max lengths, min values, etc.) are centralized in `constants/constraints.ts` and imported into schemas:

```typescript
import {
	EMAIL_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	BAG_NAME_MAX_LENGTH,
} from '@beggy/shared';

export const createBagSchema = z.object({
	name: z.string().min(1).max(BAG_NAME_MAX_LENGTH),
	// ...
});
```

This ensures API-level database constraints and client-side form validation stay in sync.

---

## Building

```bash
# Compile TypeScript to dist/
pnpm build

# Watch mode
pnpm build:watch

# Type checking only
pnpm type-check
```

The build outputs to `dist/` with `.d.ts` declaration files. This is consumed by the API and web via TypeScript path aliases during development (no need to rebuild on every change in dev mode).

---

## Testing

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

Tests live in `tests/**/*.test.ts` and use **Vitest** in the Node environment.

---

## Adding New Schemas

When adding a new domain (e.g., packing lists):

1. Create `src/schemas/packing-list.schema.ts`

```typescript
import { z } from 'zod';
import { NAME_MAX_LENGTH } from '../constants/constraints';

export const createPackingListSchema = z.object({
	name: z.string().min(1).max(NAME_MAX_LENGTH),
	tripId: z.string().uuid(),
});

export type CreatePackingListDto = z.infer<typeof createPackingListSchema>;
```

1. Create `src/types/packing-list.types.ts` for response types that don't come from schemas

2. Export from the index files:

```typescript
// src/schemas/index.ts
export * from './packing-list.schema';

// src/types/index.ts
export * from './packing-list.types';
```

1. Run `pnpm build` to compile

2. Both `@beggy/api` and `@beggy/web` can immediately import the new schema

---

## TypeScript Configuration

| Setting            | Value                     |
| ------------------ | ------------------------- |
| `target`           | ES2022                    |
| `module`           | ESNext                    |
| `moduleResolution` | Bundler                   |
| `strict`           | true                      |
| `declaration`      | true                      |
| `composite`        | true (incremental builds) |

---

## Key Principle

> **If a type or schema exists in both the API and the web, it belongs here.**

Never duplicate validation rules. If the API validates that a bag name must be between 1 and 100 characters, the web form must use the exact same schema. `@beggy/shared` makes this automatic.

---

**Shared core of the Beggy ecosystem** · API ↔ Web contract layer

Part of the [Beggy monorepo](https://github.com/Mofathy183/Beggy-backend) · MIT License
