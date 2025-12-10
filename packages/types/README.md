# @beggy/types

TypeScript types package for the Beggy monorepo. Contains API response types (DTOs) that are shared between the API and Web applications.

## Structure

```text
packages/
├── src/
├────── types/
├───────── user.types.ts       # User, Account, UserToken types
├───────── bag.types.ts        # Bag and BagItem types
├───────── item.types.ts       # Item types
├───────── suitcase.types.ts   # Suitcase and SuitcaseItem types
├────── enum.ts             # Main Enum for all the User, Account, Bag, Suitcase and Item types
├────── index.ts            # Main entry point (exports all types)
├── package.json
└── tsconfig.json
```

## Usage

### Direct Import (Recommended)

```typescript
import type { UserResponse, ApiResponse } from '@beggy/types';

// In API
export async function getUser(id: string): Promise<ApiResponse<UserResponse>> {
  // ...
}

// In Web
function UserProfile({ user }: { user: UserResponse }) {
  return <div>{user.firstName}</div>;
}
```

### Via Shared Package (Re-export)

The `@beggy/shared` package re-exports all types for convenience:

```typescript
import type { UserResponse } from '@beggy/shared';
```

## Why a Separate Types Package?

1. **Separation of Concerns**: Types are independent from utilities and constants
2. **Selective Dependencies**: Packages can depend only on types without pulling in other shared code
3. **Clear Organization**: Makes it explicit that types are a first-class shared resource
4. **Independent Versioning**: Types can be versioned separately if needed
5. **Better Tree-shaking**: Bundlers can optimize imports more effectively

## Type Safety

- **API Response Types**: These types represent the structure of data returned from API endpoints
- **Derived from Prisma**: Types are manually maintained based on Prisma models but tailored for API responses
- **No Prisma Dependency**: The web app doesn't need Prisma installed - it only uses these API response types

## Best Practices

1. **Keep Prisma in API**: Prisma schema and client stay in `apps/api/prisma`
2. **Types in Separate Package**: API response types go in `packages/types/`
3. **Type Mapping**: Map Prisma models to API response types in API controllers/services
4. **Consistent Naming**: Use `*Response` suffix for API response types
5. **No Circular Dependencies**: Use type-only imports (`import type`) to avoid circular dependencies
