<div align="center">

# `@beggy/web`

**The Beggy frontend — a production-grade Next.js dashboard with a semantic design system.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## Overview

`@beggy/web` is the frontend for Beggy. It is built with **Next.js 16 App Router**, **React 19**, and a **semantic token-based design system** on Tailwind CSS v4 + shadcn/ui.

The current UI implements a structured admin dashboard — auth/OAuth session hydration, onboarding, user management, and the personal item library — as a fully wired blueprint that new packing features will follow.

---

## Tech Stack

| Category | Technology |

|---|---|
| **Framework** | Next.js 16 (App Router), React 19, React Compiler |
| **Styling** | Tailwind CSS v4, shadcn/ui, Radix UI, Base UI |
| **State** | Redux Toolkit, React Redux |
| **Forms** | React Hook Form, Zod resolver, `@beggy/shared` schemas |
| **Authorization** | CASL (`@casl/ability`, `@casl/react`) |
| **Icons** | HugeIcons (`@hugeicons/react`, `@hugeicons/core-free-icons`) |
| **Dark mode** | next-themes |
| **Dates** | react-day-picker, date-fns |
| **Notifications** | Sonner (via centralized `notify` utility) |
| **Testing** | Vitest, React Testing Library, Storybook 10, Playwright |

---

## Project Structure

```text
apps/web/
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── (protected)/               # Authenticated route group
│   │   │   ├── layout.tsx             # AuthGate + AppShell wrapper
│   │   │   ├── users/
│   │   │   │   ├── page.tsx           # /users
│   │   │   │   └── [id]/page.tsx      # /users/[id]
│   │   │   ├── items/page.tsx         # /items
│   │   │   └── onboarding/page.tsx    # /onboarding
│   │   ├── auth/callback/page.tsx     # OAuth callback landing
│   │   ├── globals.css                # Design tokens + Tailwind v4 imports
│   │   └── layout.tsx                 # Root layout
│   │
│   ├── features/                      # Business features (self-contained)
│   │   ├── auth/                      # Auth UX, session hydration, OAuth
│   │   ├── profiles/                  # Profile editing, onboarding flow
│   │   ├── users/                     # User management UI
│   │   └── items/                     # Personal item library
│   │
│   └── shared/
│       ├── api/                       # Base fetch + RTK slice setup
│       ├── components/ui/             # shadcn/ui primitives
│       ├── layouts/                   # AppShell, Header, Sidebar
│       ├── store/                     # Redux store, Provider, ability slice
│       ├── guards/                    # ProtectedRoute, AuthGate
│       ├── hooks/                     # useLogout, useListQuery
│       ├── ui/                        # Shared reusable UI patterns
│       │   ├── list/                  # ListPagination, ListMeta, ListFilters, etc.
│       │   ├── filter/                # SearchInput, ToggleFilter, DateRangeFilter
│       │   ├── chips/                 # Chips + Chip components
│       │   ├── actions/               # ActionsMenu
│       │   ├── grid/                  # DataGrid
│       │   └── states/                # ErrorState, Forbidden, NotFoundState
│       ├── mappers/                   # sort.mapper, filters.mapper
│       ├── lib/                       # cn() utility
│       ├── types/                     # Shared web types
│       └── utils/                     # query.utils, error.utils, notify.utils
│
├── .storybook/                        # Storybook configuration
├── tests/                             # Test setup files
└── public/                            # Static assets
```

---

## Feature Architecture

Each feature is **fully self-contained**:

```text
src/features/<feature>/
├── components/
│   ├── list/          # List views (grid, filters, order-by, empty state)
│   ├── details/       # Detail views (cards, metadata)
│   ├── forms/         # Forms — always split into container + UI
│   │   ├── <Name>Form.tsx         # Container: logic, submission, errors
│   │   └── <Name>FormUI.tsx       # Presentational: pure UI, no side effects
│   ├── actions/       # Action components (menus, dialogs)
│   └── badges/        # Domain-specific badge components
├── hooks/             # Feature hooks (useListQuery, useMutations, useActions)
├── api/               # API client functions
├── pages/             # Page-level components (consumed by app router)
└── index.ts           # Named exports
```

The container/presenter split (e.g., `CreateUserForm` + `CreateUserFormUI`) keeps logic testable and UI stories clean in Storybook.

---

## Current Screens

| Route | Description |

|---|---|
| `/` | Public landing page |
| `/users` | Paginated user list with filters, sorting, actions |
| `/users/[id]` | User detail — status, role, verification badges |
| `/onboarding` | Post-login profile onboarding flow |
| `/items` | Personal item library — CRUD, filters, sorting |
| `/auth/callback` | OAuth redirect landing (session hydration) |

---

## Design System

Beggy uses a **semantic token design system** built on Tailwind CSS v4. All color decisions live in `src/app/globals.css`. Components never use raw palette colors.

### The golden rule

```text
❌  className="bg-red-500 text-blue-600"
✅  className="bg-destructive text-primary"
```

### Token categories

| Category | Examples |

|---|---|
| **Surfaces** | `bg-background`, `bg-card`, `bg-muted`, `bg-popover` |
| **Text** | `text-foreground`, `text-muted-foreground`, `text-card-foreground` |
| **Brand** | `bg-primary`, `bg-secondary`, `bg-accent` |
| **Semantic states** | `bg-success`, `bg-warning`, `bg-destructive` |
| **Borders** | `border-border`, `border-input` |
| **Focus** | `ring`, `outline-ring` |
| **Sidebar** | `bg-sidebar`, `bg-sidebar-primary`, `bg-sidebar-accent` |
| **Charts** | `var(--chart-1)` through `var(--chart-5)` |

### shadcn/ui — always first

```tsx
// shadcn is the first choice for all UI
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

// Only use Base UI when shadcn doesn't cover the use case
import * as Switch from '@base-ui/react/switch';
```

### HugeIcons — the only icon library

All icons use the `HugeiconsIcon` wrapper. Never import icon definitions as JSX directly, and never use any other icon library.

```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, CalendarIcon } from '@hugeicons/core-free-icons';

// ✅ Correct
<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
<HugeiconsIcon icon={CalendarIcon} className="h-5 w-5 text-muted-foreground" />

// ❌ Wrong — direct JSX or other libraries
<Add01Icon size={16} />
<Calendar className="h-4 w-4" />  // lucide — not used
```

### RTL support

The design system is RTL-enabled. Always use logical properties:

```tsx
// ✅ RTL-safe
className = 'ps-4 pe-2 ms-auto text-start border-s';

// ❌ Not RTL-safe
className = 'pl-4 pr-2 ml-auto text-left border-l';
```

### Domain → semantic state mapping

```typescript
// Always map domain state to semantic intent, then to tokens
const intentMap = {
	PACKED: 'bg-success text-success-foreground',
	NEAR_LIMIT: 'bg-warning text-warning-foreground',
	OVERWEIGHT: 'bg-destructive text-destructive-foreground',
	IN_PROGRESS: 'bg-primary text-primary-foreground',
};
```

For full design system documentation see [Section 12 of BEGGY_PROJECT_CONTEXT.md](../../BEGGY_PROJECT_CONTEXT.md).

---

## State Management

Redux Toolkit handles global state. The store lives at `src/shared/store/`.

```text
store/
├── store.ts          # Store configuration
├── Provider.tsx      # Redux Provider wrapper
├── hooks.ts          # useAppSelector, useAppDispatch
└── ability/
    ├── ability.ts     # CASL ability definition
    ├── ability.slice  # Redux slice (synced from API auth response)
    ├── useAbility.ts  # Hook
    └── Can.tsx        # Permission-based rendering component
```

### Using permissions in components

```tsx
import { Can } from '@shared/store/ability/Can';

<Can I="create" a="User">
	<CreateUserButton />
</Can>;
```

---

## Forms Pattern

All forms follow the **container + UI split**:

```tsx
// Container — handles logic
function CreateUserForm({ onSuccess }: Props) {
	const form = useForm({ resolver: zodResolver(createUserSchema) });
	const { mutate } = useCreateUser();

	return <CreateUserFormUI form={form} onSubmit={mutate} />;
}

// UI — pure presentation (Storybook-friendly)
function CreateUserFormUI({ form, onSubmit }: UIProps) {
	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Input {...form.register('email')} />
			<Button type="submit">Create</Button>
		</form>
	);
}
```

Validation schemas always come from `@beggy/shared`:

```typescript
import { createUserSchema } from '@beggy/shared/schemas';
```

---

## Notifications

All notifications go through the centralized `notify` utility — never call Sonner's toast directly.

```typescript
import { notify } from '@shared/utils/notify.utils';

notify.success({ message: 'User created successfully' });
notify.error({
	message: 'Failed to save changes',
	suggestion: 'Check your connection and try again.',
});
notify.warning({
	message: 'Approaching weight limit',
	description: 'Pack heavier items first to stay within limits.',
});
notify.info({
	message: 'Packing suggestion ready',
	description: 'You can review the tip in your packing list.',
});
```

---

## List Pattern

All list pages use a shared set of reusable components wired through `useListQuery`:

```text
UsersPage
├── UsersFilters      → filter controls
├── UsersOrderBy      → sort controls
├── ListMeta          → total count, current page info
├── UsersGrid         → DataGrid of UserCard items
├── ListPagination    → page controls
└── ListEmptyState    → shown when results are empty
```

---

## Path Aliases

| Alias | Resolves to |

|---|---|
| `@/*` | `src/*` |
| `@shared/*` | `src/shared/*` |
| `@features/*` | `src/features/*` |
| `@shadcn-ui/*` | `src/shared/components/ui/*` |
| `@shared-ui/*` | `src/shared/ui/*` |
| `@shadcn-lib` | `src/shared/lib/utils.ts` |
| `@beggy/shared` | `../../packages/shared/src` |

---

## Environment Variables

| Variable | Required | Description |

|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the Beggy API |

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Running Locally

```bash
# From apps/web
pnpm dev        # Dev server at http://localhost:3000
pnpm build      # Production build
pnpm start      # Start production server
```

Or from monorepo root:

```bash
pnpm dev        # Starts all apps including web
```

---

## Testing

```bash
# Unit + component tests
pnpm test
pnpm test:watch
pnpm test:coverage

# Storybook browser tests (requires Storybook to be built or running)
pnpm test:storybook
```

Tests use **Vitest** with `jsdom` environment and `@testing-library/react`.

---

## Storybook

```bash
# Start Storybook dev server
pnpm storybook        # http://localhost:6006

# Build static Storybook
pnpm build-storybook
```

Storybook is configured with:

- **Chromatic** — visual regression testing
- **a11y addon** — accessibility audits
- **Vitest addon** — story-level tests in the browser via Playwright
- **Themes addon** — light/dark mode switching in the preview

Stories live alongside components: `src/features/**/*.stories.tsx`

---

## Adding New Features

When building a new feature (e.g., bags), follow this checklist:

1. Create `src/features/bags/` with the standard structure
2. Define Zod schemas in `@beggy/shared/schemas/bag.schema.ts`
3. Define TypeScript types in `@beggy/shared/types/bag.types.ts`
4. Add API client functions in `features/bags/api/bags.api.ts`
5. Build list + detail + form components using shared UI primitives
6. Use `useListQuery` for list state (filters, sort, pagination)
7. Map domain status enums to semantic tokens — never hardcode colors
8. Write component tests and Storybook stories
9. Add the route in `src/app/(protected)/bags/page.tsx`

---

<div align="center">
<sub>Part of the <a href="../../README.md">Beggy monorepo</a> · MIT License</sub>
</div>
