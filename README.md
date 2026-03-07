# Beggy — AI-Powered Smart Travel Packing Assistant 🧳

**Beggy is an intelligent travel packing assistant that helps users organize bags and suitcases efficiently using AI, weather insights, and smart container management.**

---

# ✨ Overview

Travelers often **overpack, underpack, or pack inefficiently**.

**Beggy solves this problem** by combining:

- structured packing management
- intelligent AI estimations
- weather-aware recommendations
- container capacity tracking

Users can create **bags or suitcases**, add **items**, and visually manage everything with **drag-and-drop interactions** while the system tracks:

- weight usage
- capacity
- container status (available / full / overloaded)

Beggy is built as a **production-ready full-stack monorepo** with modern architecture, strong typing, and scalable design patterns.

---

# 🧠 Smart AI Features

Beggy integrates **Google Gemini AI** to assist users automatically.

### AI Capabilities

**Smart Bag Estimation**

AI estimates:

- maximum weight
- internal capacity
- size characteristics

based on **bag brand and model**.

**Item Intelligence**

Users only type something like:

```txt
Nike Running Shoes
```

Beggy automatically estimates:

- weight
- volume
- item category

**Form Autofill**

AI prefills data fields to reduce manual work.

---

# 🌦 Weather-Aware Packing

Beggy integrates the **OpenWeather API** to help travelers pack smarter.

Workflow:

```txt
User enters destination
        ↓
Weather data fetched
        ↓
AI analyzes conditions
        ↓
Beggy suggests what to pack
```

Examples:

- Bring **rain jacket**
- Pack **warm clothing**
- Add **sunscreen**
- Include **umbrella**

Users receive **packing suggestions via notifications**.

---

# 🧳 Container System

Beggy models luggage using a **flexible container architecture**.

Containers include:

- Bags
- Suitcases

Each container tracks:

- **maximum capacity**
- **maximum weight**
- **current usage**

Status indicators:

```txt
AVAILABLE
FULL
OVERLOADED
```

This prevents:

- overweight luggage
- inefficient packing
- forgotten items

---

# 🔐 Authentication & Security

Beggy implements a **production-grade authentication system**.

### Authentication Methods

- Email & Password
- Google OAuth
- Facebook OAuth

### Security Features

- JWT access & refresh tokens
- HTTP-only secure cookies
- CSRF protection
- rate limiting
- XSS sanitization
- password hashing with bcrypt
- secure email flows

### Email Flows

Handled using **Resend + React Email**:

- Email verification
- Password reset
- Change email confirmation

---

# 🏗 Monorepo Architecture

Beggy uses a **modern monorepo architecture** powered by **Turborepo + pnpm workspaces**.

```bash
beggy
│
├─ apps
│  ├─ api        → Express backend
│  ├─ web        → Next.js frontend
│  └─ mcp        → MCP development tooling
│
├─ packages
│  └─ shared     → shared types, schemas, utilities
│
└─ tooling
   ├─ eslint
   ├─ prettier
   ├─ vitest
   └─ turbo
```

---

# 🧩 Architecture Diagram

```bash
                 ┌───────────────────────┐
                 │       Next.js Web     │
                 │  React + Tailwind UI  │
                 └───────────┬───────────┘
                             │
                             │ API Requests
                             ▼
                 ┌───────────────────────┐
                 │      Express API      │
                 │   Controllers/Services│
                 └───────────┬───────────┘
                             │
                    Prisma ORM
                             │
                             ▼
                     PostgreSQL DB
                             │
          ┌──────────────────┴─────────────────┐
          │                                    │
          ▼                                    ▼
   Google Gemini AI                     OpenWeather API
 AI packing suggestions               Weather-based advice
```

---

# 📦 Monorepo Packages

|Package|Description|
|---|---|
|**@beggy/api**|Express backend API|
|**@beggy/web**|Next.js frontend|
|**@beggy/shared**|Shared types, Zod schemas, constants|
|**@beggy/mcp**|Model Context Protocol development tooling|

The **shared package** ensures **type safety across frontend and backend**.

---

# 🧰 Tech Stack

## Backend

- Express 5
- Prisma ORM
- PostgreSQL
- Passport (OAuth)
- JWT authentication
- CASL authorization
- Zod validation
- Pino logging
- Swagger API docs

---

## Frontend

- Next.js 16
- React 19
- Tailwind CSS 4
- shadcn/ui
- Radix UI
- Redux Toolkit
- React Hook Form
- CASL permissions

---

## AI & Integrations

- Google Gemini AI
- OpenWeather API
- Resend Email API

---

## Developer Tooling

- Turborepo
- pnpm workspaces
- TypeScript
- Vitest
- Testing Library
- Storybook
- ESLint
- Prettier
- SWC

---

# 🧪 Testing

Beggy includes **multiple testing layers**.

### Backend

- Unit tests
- Integration tests
- Supertest HTTP testing

### Frontend

- Component tests
- React Testing Library
- Storybook interaction tests

### Shared

- Utility tests

---

# 🎨 UI System

Beggy uses a **token-based design system** built with:

- Tailwind CSS v4
- shadcn/ui
- Radix UI
- OKLCH color tokens
- dark mode via `next-themes`

Features:

- WCAG AA accessibility
- semantic color tokens
- consistent design primitives
- reusable UI patterns

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/your-username/beggy.git
cd beggy
```

---

## 2. Install Dependencies

```bash
pnpm install
```

---

## 3. Setup Environment Variables

Create environment files:

```bash
.env
.env.local
.env.test
```

Example variables:

```bash
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

OPENWEATHER_API_KEY=
AI_API_KEY=
RESEND_API_KEY=
```

---

## 4. Run Database

```bash
pnpm prisma migrate dev
```

---

## 5. Start Development

```bash
pnpm dev
```

---

# 📚 Available Scripts

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Tests

```bash
pnpm test
```

### Storybook

```bash
pnpm storybook
```

---

# 📖 API Documentation

Swagger documentation is available at:

```bash
/api-docs
```

after running the API server.

---

# 🧭 Project Goals

Beggy focuses on demonstrating **real-world engineering practices**:

- scalable monorepo architecture
- strong typing across frontend & backend
- clean separation of concerns
- testable systems
- secure authentication
- AI integrations

---

# 🛠 Roadmap

Upcoming features:

- drag-and-drop packing UI
- packing analytics
- travel checklist generator
- trip management
- AI packing assistant chat
- mobile optimization
- collaborative packing lists
- 
---

# 🤝 Contributing

Contributions are welcome.

Steps:

1. Fork repository
2. Create feature branch
3. Commit changes
4. Submit pull request

---

# 📜 License

MIT License

---

# 🧳 Beggy

**Your seasoned travel buddy for smarter packing.**