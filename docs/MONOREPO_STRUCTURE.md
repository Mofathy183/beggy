# Monorepo Structure & Best Practices

## Overview

This document outlines the recommended structure and best practices for organizing a TypeScript monorepo with Turbo, Express API, React Web, Prisma, and shared packages.

## Project Structure

```txt
beggy/
├── apps/
│   ├── api/              # Express + TypeScript + Prisma + PostgreSQL
│   │   ├── prisma/       # Prisma schema, migrations, generated client
│   │   ├── src/
│   │   │   ├── api/      # Controllers, routes, validators
│   │   │   ├── services/ # Business logic
│   │   │   ├── types/    # API-specific types (Prisma types)
│   │   │   └── utils/    # API-specific utilities
│   │   └── tsconfig.json
│   │
│   └── web/              # React + Redux Query + TypeScript
│       ├── src/
│       │   ├── components/
│       │   ├── features/ # Redux slices, RTK Query
│       │   ├── types/    # Web-specific types
│       │   └── utils/    # Web-specific utilities
│       └── tsconfig.json
│
├── packages/
│   ├── types/            # Shared TypeScript types (standalone package)
│   │   ├── user.types.ts
│   │   ├── bag.types.ts
│   │   ├── item.types.ts
│   │   ├── suitcase.types.ts
│   │   ├── index.ts
│   │   └── tsconfig.json
│   └── shared/           # Shared utilities and constants
│       ├── src/
│       │   ├── utils/    # Shared utilities
│       │   ├── constants/# Shared constants
│       │   └── index.ts  # Re-exports @beggy/types
│       └── tsconfig.json
│
├── tsconfig.json         # Root TypeScript config
├── turbo.json            # Turbo configuration
└── pnpm-workspace.yaml   # PNPM workspace config
```

## Key Decisions

### ❌ Prisma Should NOT Be in Packages

**Why?**

- Prisma Client is generated and tied to a specific database schema
- The web app doesn't need direct database access
- Prisma Client includes Node.js dependencies that aren't needed in the browser
- Keeping Prisma in the API maintains clear separation of concerns

**Where?**

- Keep Prisma in `apps/api/prisma/`
- Schema files: `apps/api/prisma/models/*.prisma`
- Generated client: `apps/api/prisma/generated/`
- Migrations: `apps/api/prisma/migrations/`

### ✅ API Response Types Should Be in Separate Types Package

**Why?**

- **Separation of Concerns**: Types are independent from utilities and constants
- **Selective Dependencies**: Packages can depend only on types without pulling in other shared code
- **Clear Organization**: Makes it explicit that types are a first-class shared resource
- **Independent Versioning**: Types can be versioned separately if needed
- **Better Tree-shaking**: Bundlers can optimize imports more effectively
- Web app needs to type API responses for type safety
- API needs to ensure consistent response structures
- Single source of truth for API contracts
- No Prisma dependency needed in web app

**Where?**

- `packages/types/` (standalone package)
- Types are manually maintained based on Prisma models
- Use `*Response` suffix (e.g., `UserResponse`, `BagResponse`)
- `@beggy/shared` re-exports types for convenience

## Type Flow

```txt
Prisma Models (apps/api/prisma)
    ↓
API Services/Controllers (apps/api/src)
    ↓ Map Prisma → API Response Types
API Response Types (packages/types)
    ↓
Web App (apps/web/src)
    ↓ Use in API calls, components, Redux
```

## Path Aliases Configuration

### Root `tsconfig.json`

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@beggy/types": ["./packages/types"],
			"@beggy/types/*": ["./packages/types/*"],
			"@beggy/shared": ["./packages/shared/src"],
			"@beggy/shared/*": ["./packages/shared/src/*"]
		}
	}
}
```

### API `apps/api/tsconfig.json`

```json
{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@beggy/types": ["../../packages/types"],
			"@beggy/types/*": ["../../packages/types/*"],
			"@beggy/shared": ["../../packages/shared/src"],
			"@beggy/shared/*": ["../../packages/shared/src/*"]
		}
	}
}
```

### Web `apps/web/tsconfig.app.json`

```json
{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@beggy/types": ["../../packages/types"],
			"@beggy/types/*": ["../../packages/types/*"],
			"@beggy/shared": ["../../packages/shared/src"],
			"@beggy/shared/*": ["../../packages/shared/src/*"]
		}
	}
}
```

### Web `apps/web/vite.config.ts`

```typescript
import path from 'path';

export default defineConfig({
	resolve: {
		alias: {
			'@beggy/types': path.resolve(__dirname, '../../packages/types'),
			'@beggy/shared': path.resolve(
				__dirname,
				'../../packages/shared/src'
			),
		},
	},
});
```

## Usage Examples

### In API - Mapping Prisma to API Response Types

```typescript
// apps/api/src/services/userService.ts
import type { UserResponse, ApiResponse } from '@beggy/types';
import prisma from '../../prisma/prisma';

export async function getUser(id: string): Promise<ApiResponse<UserResponse>> {
	const user = await prisma.user.findUnique({ where: { id } });

	if (!user) {
		throw new Error('User not found');
	}

	// Map Prisma model to API response type
	const userResponse: UserResponse = {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email,
		role: user.role,
		// ... map all fields
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
	};

	return {
		success: true,
		data: userResponse,
	};
}
```

### In Web - Using API Response Types

```typescript
// apps/web/src/features/users/userApi.ts (RTK Query)
import type { UserResponse, ApiResponse } from '@beggy/types';

export const userApi = createApi({
  endpoints: (builder) => ({
    getUser: builder.query<ApiResponse<UserResponse>, string>({
      query: (id) => `/api/users/${id}`,
    }),
  }),
});

// apps/web/src/components/UserProfile.tsx
import type { UserResponse } from '@beggy/shared';

function UserProfile({ user }: { user: UserResponse }) {
  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## Best Practices

1. **Type Safety**: Always use shared API response types in both API and Web
2. **Consistent Mapping**: Map Prisma models to API response types in API services/controllers
3. **No Direct Prisma in Web**: Web app should never import Prisma types directly
4. **Type-Only Imports**: Use `import type` to avoid circular dependencies
5. **Single Source of Truth**: API response types in shared package are the contract
6. **Date Handling**: Convert Prisma DateTime to ISO strings in API responses
7. **Optional Fields**: Mark optional/nullable fields appropriately in response types

## Migration Guide

If you're moving from a different structure:

1. **Move Prisma**: Ensure Prisma stays in `apps/api/prisma/`
2. **Create API Types**: Add API response types to `packages/shared/src/types/api/`
3. **Update Imports**: Change imports to use `@beggy/shared` alias
4. **Map Responses**: Update API controllers to map Prisma → API response types
5. **Update Web**: Update web app to use shared API response types

## Troubleshooting

### TypeScript Can't Resolve `@beggy/shared`

- Check `tsconfig.json` paths configuration
- Ensure `baseUrl` is set correctly
- Restart TypeScript server in your IDE

### Vite Can't Resolve `@beggy/shared`

- Check `vite.config.ts` alias configuration
- Ensure path resolution is correct
- Restart Vite dev server

### Circular Dependency Warnings

- Use `import type` instead of `import` for type-only imports
- Check for circular references in type definitions
