# Beggy Web

**Production-grade Next.js dashboard with a semantic design system.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)

---

## Quick Links

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)

---

## Overview

`@beggy/web` is the frontend for Beggy. It is built with **Next.js 16 App Router**, **React 19**, and a **semantic token-based design system** on Tailwind CSS v4 + shadcn/ui.

The current UI implements a structured admin dashboard — auth/OAuth session hydration, onboarding, user management, and the personal item library — as a fully wired blueprint that new packing features will follow.

---

## Tech Stack

| Category          | Technology                                                   |
| ----------------- | ------------------------------------------------------------ |
| **Framework**     | Next.js 16 (App Router), React 19, React Compiler            |
| **Styling**       | Tailwind CSS v4, shadcn/ui, Radix UI, Base UI                |
| **State**         | Redux Toolkit, React Redux                                   |
| **Forms**         | React Hook Form, Zod resolver, `@beggy/shared` schemas       |
| **Authorization** | CASL (`@casl/ability`, `@casl/react`)                        |
| **Icons**         | HugeIcons (`@hugeicons/react`, `@hugeicons/core-free-icons`) |
| **Dark mode**     | next-themes                                                  |
| **Dates**         | react-day-picker, date-fns                                   |
| **Notifications** | Sonner (via centralized `notify` utility)                    |
| **Testing**       | Vitest, React Testing Library, Storybook 10, Playwright      |

---

## Project Structure

```text
apps/web/
│
├── src/
│   ├── app/                                    # Next.js App Router
│   │   ├── layout.tsx                          # Root layout — Redux Provider, ThemeProvider, Sonner Toaster
│   │   ├── globals.css                         # Design tokens, Tailwind v4 imports, Sonner overrides
│   │   ├── page.tsx                            # / landing page (public, no auth)
│   │   ├── not-found.tsx                       # Global 404
│   │   ├── global-error.tsx                    # Global error boundary (Next.js)
│   │   ├── favicon.ico
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── page.tsx                    # /auth/callback — OAuth redirect landing
│   │   │
│   │   ├── (public)/                           # No auth, minimal shell
│   │   │   ├── layout.tsx                      # Public layout (logo, ThemeToggle only)
│   │   │   ├── login/
│   │   │   │   └── page.tsx                    # /login
│   │   │   └── signup/
│   │   │       └── page.tsx                    # /signup
│   │   │
│   │   └── (protected)/                        # Auth boundary — AuthGate runs once here
│   │       ├── layout.tsx                      # AuthGate only — no visual shell
│   │       │
│   │       ├── onboarding/                     # Isolated wizard flow — no AppShell
│   │       │   ├── layout.tsx                  # Wizard shell (centered, step indicators)
│   │       │   ├── page.tsx                    # /onboarding
│   │       │   └── error.tsx
│   │       │
│   │       └── (dashboard)/                    # Full dashboard shell
│   │           ├── layout.tsx                  # AppShell — Header + Sidebar
│   │           ├── error.tsx
│   │           ├── dashboard/
│   │           │   └── page.tsx                # /dashboard — stats, recent items, nudge
│   │           ├── users/
│   │           │   ├── page.tsx                # /users
│   │           │   ├── [id]/
│   │           │   │   └── page.tsx            # /users/[id]
│   │           │   └── error.tsx
│   │           ├── items/
│   │           │   ├── page.tsx                # /items
│   │           │   ├── [id]/
│   │           │   │   └── page.tsx            # /items/[id]
│   │           │   └── error.tsx
│   │           └── settings/
│   │               └── profile/
│   │                   └── page.tsx            # /settings/profile
│   │
│   ├── features/                               # Business features — each fully self-contained
│   │   ├── auth/                               # Auth UX, session hydration, OAuth callback
│   │   ├── dashboard/                          # Dashboard overview, stats, recent items, nudge
│   │   ├── items/                              # Personal item library — CRUD, filters, badges
│   │   ├── profiles/                           # Profile editing, onboarding flow
│   │   └── users/                             # User management — list, detail, roles
│   │
│   └── shared/
│       ├── api/                                # Base fetch setup + RTK apiSlice
│       ├── components/
│       │   └── ui/                             # shadcn/ui primitives (never edit directly)
│       ├── guards/                             # AuthGate, ProtectedRoute
│       ├── hooks/                              # useLogout, useListQuery
│       ├── layouts/                            # AppShell, Header, Sidebar, SidebarUI
│       ├── lib/                                # cn() utility
│       ├── store/                              # Redux store, Provider, hooks, ability slice
│       ├── types/                              # Shared web-layer TypeScript types
│       ├── ui/                                 # Shared reusable UI patterns
│       │   ├── actions/                        # ActionsMenu
│       │   ├── chips/                          # Chips + Chip
│       │   ├── dialogs/                        # Shared dialog wrappers
│       │   ├── error/                          # ticket.primitives, error boundary wrappers
│       │   ├── fields/                         # Shared form field components
│       │   ├── filter/                         # SearchInput, ToggleFilter, DateRangeFilter
│       │   ├── grid/                           # DataGrid
│       │   ├── list/                           # ListPagination, ListMeta, ListFilters, ListEmptyState, ListOrderBy
│       │   ├── mappers/                        # ITEM_CATEGORY_OPTIONS, getEnumLabel, sort/filter mappers
│       │   ├── states/                         # ErrorState, Forbidden, NotFoundState
│       │   ├── theme/                          # ThemeToggle
│       │   ├── toast/                          # Toaster mount point
│       │   └── index.ts
│       └── utils/                              # query.utils, error.utils, notify.utils
│
├── .storybook/                                 # Storybook configuration
├── tests/                                      # Vitest setup files
└── public/                                     # Static assets
```

---

## Route group layout chain

Each route group adds one layout layer. The chain for any given URL is:

```text
/                    →  root layout only
/login               →  root + (public) layout
/onboarding          →  root + (protected) [AuthGate] + onboarding layout
/dashboard           →  root + (protected) [AuthGate] + (dashboard) layout [AppShell]
/dashboard/users     →  root + (protected) [AuthGate] + (dashboard) layout [AppShell]
/auth/callback       →  root layout only  (outside all groups)
```

The key constraint: `(protected)/layout.tsx` runs `AuthGate` exactly once. Both `onboarding/` and `(dashboard)/` inherit it without repeating auth logic. `onboarding/` deliberately opts out of the `AppShell` — it is a focused wizard, not a dashboard page.

---

## Feature architecture

Each feature is fully self-contained. No feature imports from another feature — only from `@shared/*` and `@beggy/shared`.

```text
src/features/<feature>/
├── api/
│   └── <feature>.api.ts        # RTK Query endpoint injection + tag types
├── components/
│   ├── list/                   # Grid, filters, order-by, empty state
│   ├── details/                # Detail cards, metadata displays
│   ├── forms/                  # Always split: <Name>Form.tsx (container) + <Name>FormUI.tsx (presenter)
│   ├── actions/                # Action menus, confirm dialogs
│   └── badges/                 # Domain-specific badge components (CVA-driven)
├── hooks/
│   ├── use<Feature>Actions.ts  # Mutation wrappers with onSuccess/onError callbacks (no notify)
│   ├── use<Feature>Mutations.ts # Raw RTK Query mutation hooks, grouped by operation
│   └── use<Feature>Overview.ts # Query hooks — unwrap SuccessResponse envelope here
├── pages/
│   └── <Feature>Page.tsx       # Page orchestrator — owns notify, wires actions to components
├── store/                      # Feature-scoped Redux slices (if needed)
└── index.ts                    # Named exports
```

The container/presenter split (e.g., `CreateUserForm` + `CreateUserFormUI`) keeps logic testable and UI stories clean in Storybook.

---

### Container / presenter split

Every form and every list section with side effects follows this pattern:

```text
<FeaturePage>             ← owns: useRouter, notify, mutation callbacks
    └── <FeatureList>     ← pure props: onEdit, onDelete, onAdd — no hooks, Storybook-able
            └── <FeatureCard>   ← pure props: item data + action callbacks
```

`notify` is always called in the page or container — never inside hooks. Hooks expose `onSuccess`/`onError` callback slots; the component decides what feedback to show.

---

## Shared layer conventions

### `shared/ui/mappers/`

Single source of truth for enum → UI metadata. Always use `ITEM_CATEGORY_OPTIONS` + `getEnumLabel()` — never a separate label map.

### `shared/ui/states/`

`ErrorState` takes `reset?: () => void` (Next.js error boundary pattern) and optional `error`, `title`, `description`, `suggestion` overrides. Never pass `onRetry` — the prop is `reset`.

### `shared/utils/notify.utils.ts`

`notify` is the only entry point for toasts. Call it in page components and container components — never inside hooks or API functions.

```ts
notify.success({ message: 'Item saved' });
notify.error({ message: 'Save failed', suggestion: 'Try again.' });
notify.error.fromHttp(err); // HttpClientError → auto-maps body.message + body.suggestion
```

---

## Current Screens

| Route            | Description                                        |
| ---------------- | -------------------------------------------------- |
| `/`              | Public landing page                                |
| `/users`         | Paginated user list with filters, sorting, actions |
| `/users/[id]`    | User detail — status, role, verification badges    |
| `/onboarding`    | Post-login profile onboarding flow                 |
| `/items`         | Personal item library — CRUD, filters, sorting     |
| `/auth/callback` | OAuth redirect landing (session hydration)         |

---

## Design System

Beggy uses a **semantic token design system** built on Tailwind CSS v4. All color decisions live in `src/app/globals.css`. Components never use raw palette colors.

### The golden rule

```text
❌  className="bg-red-500 text-blue-600"
✅  className="bg-destructive text-primary"
```

### Token categories

| Category            | Examples                                                           |
| ------------------- | ------------------------------------------------------------------ |
| **Surfaces**        | `bg-background`, `bg-card`, `bg-muted`, `bg-popover`               |
| **Text**            | `text-foreground`, `text-muted-foreground`, `text-card-foreground` |
| **Brand**           | `bg-primary`, `bg-secondary`, `bg-accent`                          |
| **Semantic states** | `bg-success`, `bg-warning`, `bg-destructive`                       |
| **Borders**         | `border-border`, `border-input`                                    |
| **Focus**           | `ring`, `outline-ring`                                             |
| **Sidebar**         | `bg-sidebar`, `bg-sidebar-primary`, `bg-sidebar-accent`            |
| **Charts**          | `var(--chart-1)` through `var(--chart-5)`                          |

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

| Alias           | Resolves to                  |
| --------------- | ---------------------------- |
| `@/*`           | `src/*`                      |
| `@shared/*`     | `src/shared/*`               |
| `@features/*`   | `src/features/*`             |
| `@shadcn-ui/*`  | `src/shared/components/ui/*` |
| `@shared-ui/*`  | `src/shared/ui/*`            |
| `@shadcn-lib`   | `src/shared/lib/utils.ts`    |
| `@beggy/shared` | `../../packages/shared/src`  |

---

## Environment Variables

| Variable              | Required | Description               |
| --------------------- | -------- | ------------------------- |
| `NEXT_PUBLIC_API_URL` | ✅       | Base URL of the Beggy API |

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

Production-grade frontend · UI architecture · Design system

Part of the [Beggy monorepo](https://github.com/Mofathy183/Beggy-backend) · MIT License
