# BEGGY WEB

The **Beggy Web App** is the frontend interface for **Beggy**, an AI-powered smart travel packing assistant that helps travelers organize luggage intelligently using weather data and AI recommendations.

The web application provides a **modern dashboard-style interface** for managing users and (in the future) travel packing resources such as bags, suitcases, and items.

---

# Overview

Beggy helps travelers pack smarter by combining:

- 🌦 **Weather-aware packing recommendations**
- 🤖 **AI-powered packing suggestions**
- 🧳 **Structured luggage organization**
- 🔐 **Secure role-based access control**
- 🎨 **A modern design system with dark mode**

The web app communicates with the **Beggy API** and shares types and schemas through the **`@beggy/shared`** package.

---

# Tech Stack

### Framework

- **Next.js 16** (App Router)
- **React 19**

### Styling & UI

- **Tailwind CSS v4**
- **shadcn/ui**
- **Radix UI**
- **Base UI**
- **tw-animate-css**

### State Management

- **Redux Toolkit**
- **React Redux**

### Forms & Validation

- **React Hook Form**
- **Zod**
- **@hookform/resolvers**

### Authorization

- **CASL** (Role Based Access Control)

### Utilities

- **date-fns**
- **clsx**
- **tailwind-merge**
- **class-variance-authority**

### Icons

- **Hugeicons**

### Dark Mode

- **next-themes**

### Testing

- **Vitest**
- **React Testing Library**
- **Storybook**
- **Playwright (Storybook tests)**

---

# Application Structure

```txt
apps/web
│
├── src
│
│   ├── app
│   │   ├── (protected)
│   │   │   └── users
│   │   │       ├── page.tsx
│   │   │       └── [id]
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── features
│   │   └── users
│   │       ├── components
│   │       ├── hooks
│   │       ├── api
│   │       └── pages
│   │
│   ├── shared
│   │   ├── api
│   │   ├── layouts
│   │   ├── store
│   │   ├── hooks
│   │   ├── guards
│   │   ├── ui
│   │   └── utils
│   │
│   └── tests
│
└── public
```

---

# Architecture

The frontend follows a **feature-driven architecture**.

```txt
src
 ├── app          → Next.js routes
 ├── features     → Business features
 └── shared       → Reusable infrastructure
```

### Features

Each feature is self-contained and includes:

```txt
features/<feature>
 ├── components
 ├── hooks
 ├── api
 └── index.ts
```

Example:

```txt
features/users
 ├── components
 ├── hooks
 ├── api
 └── pages
```

---

# UI Architecture

The UI uses a **semantic token design system**.

All colors and design tokens come from:

```txt
src/app/globals.css
```

Components must use **semantic Tailwind classes** instead of hardcoded colors.

### Example

✅ Correct

```txt
bg-primary
text-foreground
bg-card
```

❌ Wrong

```txt
bg-blue-500
text-red-600
```

This ensures:

- dark mode support
- WCAG accessibility
- consistent branding

---

# Layout System

Protected pages use a **dashboard shell layout**.

```txt
AppShell
 ├── Header
 └── Sidebar
```

All authenticated routes live inside:

```txt
src/app/(protected)
```

These routes are protected by:

```txt
AuthGate
ProtectedRoute
```

---

# Current Screens

### Landing Page

Route:

```txt
/
```

Simple marketing-style page introducing Beggy.

---

### Users List

Route:

```txt
/users
```

Features:

- paginated user list
- sorting
- filtering
- actions menu

---

### User Details

Route:

```txt
/users/[id]
```

Displays:

- user metadata
- status badges
- role badges
- verification status

---

### User Management

Includes:

- create user dialog
- role change dialog
- user actions menu

Forms use:

- React Hook Form
- Zod validation
- shared schemas from `@beggy/shared`

---

# State Management

The application uses **Redux Toolkit**.

Store location:

```txt
src/shared/store
```

Includes:

- API slices
- ability state
- global UI state

---

# Authorization

The web app uses **CASL** to control UI permissions.

Abilities are stored in Redux and accessed using:

```bash
useAbility()
```

UI permissions are handled with:

```bash
<Can />
```

Example:

```bash
<Can I="create" a="User">
  <CreateUserButton />
</Can>
```

---

# API Integration

All API calls are centralized inside:

```txt
src/features/<feature>/api
```

Example:

```txt
features/users/api/users.api.ts
```

The base API configuration lives in:

```txt
src/shared/api
```

---

# Shared Package

The web app imports types and schemas from:

```txt
@beggy/shared
```

This ensures **type safety between frontend and backend**.

Example:

```txt
import { UserSchema } from "@beggy/shared/schemas"
```

---

# Running the Web App

### Install dependencies

From the monorepo root:

```bash
pnpm install
```

---

### Start development server

```bash
pnpm dev
```

---

### Build for production

```bash
pnpm build
```

---

### Start production server

```bash
pnpm start
```

---

# Environment Variables

Example `.env.local`:

```txt
NEXT_PUBLIC_API_URL=http://localhost:3000/api/beggy
```

---

# Testing

The web app uses **Vitest**.

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

- component tests
- hook tests
- UI interaction tests

---

# Storybook

Beggy uses **Storybook** for UI component development.

### Start Storybook

```bash
pnpm storybook
```

Open:

```txt
http://localhost:6006
```

### Build Storybook

```bash
pnpm build-storybook
```

---

# Design System

Beggy uses a **token-based design system**.

Key principles:

- OKLCH color space
- semantic tokens
- WCAG 2.1 AA accessibility
- light and dark themes

All design tokens are defined in:

```text
src/app/globals.css
```

---

# Monorepo Context

The web app is part of the **Beggy Turborepo**.

```txt
apps
 ├── api
 ├── web
 └── mcp

packages
 └── shared
```

Shared types, schemas, and constants come from:

```txt
@beggy/shared
```

---

# Future Features

Upcoming frontend features include:

- bag management UI
- suitcase management
- packing list editor
- AI packing assistant interface
- weather-based packing suggestions
- trip planning flows

---

# Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing architecture
4. Write tests
5. Submit a pull request

---

# License

MIT License

---
