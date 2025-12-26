# @beggy/shared

Shared utilities and constants for the Beggy monorepo.

## Structure

```text
packages/shared/
├── src/
│   ├── utils/            # Shared utility functions
│   ├── constants/        # Shared constants
│   └── index.ts          # Main entry point (re-exports @beggy/types)
├── tsconfig.json
└── package.json
```

## Usage

### Types (Recommended: Use `@beggy/types` directly)

```typescript
// Direct import from types package (recommended)
import type { UserResponse, ApiResponse } from '@beggy/types';

// Or via shared package (convenience re-export)
import type { UserResponse, ApiResponse } from '@beggy/shared';
```

### Utilities and Constants

```typescript
// When you add utilities/constants
import { someUtility, SOME_CONSTANT } from '@beggy/shared';
```

## Package Organization

- **`@beggy/types`**: TypeScript types for API responses (standalone package)
- **`@beggy/shared`**: Utilities, constants, and re-exports of types

## Path Aliases

Both API and Web are configured to use these aliases:

- **TypeScript**: Configured in `tsconfig.json` files
- **Vite (Web)**: Configured in `vite.config.ts`
- **Imports**
    - `import { UserResponse } from '@beggy/types'` (recommended)
    - `import { UserResponse } from '@beggy/shared'` (convenience)
