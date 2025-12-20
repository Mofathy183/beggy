import app from './app';
import { serverConfig } from './src/config/env.js';

// Application Listen
app.listen(serverConfig.port, () => {
	console.log(`Server is running on port ${serverConfig.port}`);
	console.log(`http://localhost:${serverConfig.port}`);
});



/**
── api/                          # Your main API that use PNPM & SWC
    ├── src/
    │   ├── config/               # Configuration files
    │   │   ├── passport.config.ts       # Passport strategies
    │   │   ├── permissions.config.ts    # CASL abilities
    │   │   └── env.config.ts            # Environment variables validation
    │   │   └── index.ts # export point
    │   │
    │   ├── modules/              # Feature-based modules (RECOMMENDED)
    │   │   ├── auth/
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.service.ts
    │   │   │   ├── auth.routes.ts
    │   │   │   ├── auth.validator.ts
    │   │   │   ├── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── auth.test.ts
    │   │   │   └── strategies/   # Passport strategies
    │   │   │       ├── google.strategy.ts
    │   │   │       ├── facebook.strategy.ts
    │   │   │       └── jwt.strategy.ts
    │   │   │
    │   │   ├── users/
    │   │   │   ├── users.controller.ts
    │   │   │   ├── users.service.ts
    │   │   │   ├── users.routes.ts
    │   │   │   └── users.validator.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── user.test.ts
    │   │   │
    │   │   ├── bags/
    │   │   │   ├── bags.controller.ts
    │   │   │   ├── bags.service.ts
    │   │   │   ├── bags.routes.ts
    │   │   │   └── bags.validator.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── bag.test.ts
    │   │   │
    │   │   ├── items/
    │   │   │   ├── items.controller.ts
    │   │   │   ├── items.service.ts
    │   │   │   ├── items.routes.ts
    │   │   │   └── items.validator.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── item.test.ts
    │   │   │
    │   │   ├── bag-items/        # Junction/relationship
    │   │   │   ├── bag-items.controller.ts
    │   │   │   ├── bag-items.service.ts
    │   │   │   └── bag-items.routes.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── bag-items.test.ts
    │   │   │
    │   │   ├── gemini/               # gemini AI features
    │   │   │   ├── gemini.controller.ts
    │   │   │   ├── gemini.service.ts
    │   │   │   └── gemini.route.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── gemini.test.ts
    │   │   │
    │   │   ├── weather/               # OpenWeather API features
    │   │   │   ├── weather.controller.ts
    │   │   │   ├── weather.service.ts
    │   │   │   └── weather.route.ts
    │   │   │   └── index.ts # export point
    │   │   │   └── __test__/
    │   │   │        └── weather.test.ts
    │   │
    │   ├── shared/               # Shared utilities
    │   │   ├── middlewares/
    │   │   │   ├── auth.middleware.ts              # Authentication
    │   │   │   ├── permission.middleware.ts
    │   │   │   ├── rateLimiter.middleware.ts
    │   │   │   ├── error.middleware.ts             # Main error handler
    │   │   │   └── validator.middleware.ts         # Request validator
    │   │   │   └── index.ts
    │   │   │
    │   │   ├── utils/
    │   │   │   ├── jwt.util.ts
    │   │   │   ├── hash.util.ts
        │   │   ├── api-response.util.ts     # For success/fail responses
        │   │   ├── app-error.util.ts        # For throwing errors in services
    │   │   │   └── index.ts
    │   │   │
    │   │   ├── types/
    │   │   │   ├── models.type.ts          # Prism Models Types for the Response
    │   │   │   └── index.ts
    │   │   │
    │   │   └── constants/
    │   │       ├── permissions.ts
    │   │       ├── status.ts
    │   │       └── messages.ts
    │   │       └── index.ts # export point
    │   │
    │   ├── emails/               # Email templates using React Emails & Resend
    │   │   ├── templates/ 
    │   │   │   ├── verify-email.tsx
    │   │   │   ├── reset-password.tsx
    │   │   │   └── welcome.tsx
            │   └── partials/
            │       ├── header.tsx
            │       ├── footer.tsx
            │       └── button.tsx
    │   │   └── email.service.ts  # export point
    │   │   └── email.util.ts
    │
    │
    ├── tests/                    # Tests (mirror src structure)
    │   ├── unit/
    │   ├── integration/
    │   └── e2e/
    │
    ├── docs/                # OpenAPI/Swagger docs
    │   ├── openapi.yaml
    │   ├── user.swagger.yaml
    │   ├── auth.swagger.yaml
    │   └── swagger-ui/
    │
    ├── prisma/             # Prisma ORM
    │   │   ├── generated/prisma       # the generated output
    │   │   ├── migrations/
    │   │   ├── models/         # prisma models (user.prisma, bag.prisma, ets..)
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   │   └── prisma.client.ts # export point  # will add the prisma client and provide extends for prisma
    │   │   └── prisma.utils.ts         # add the function that will use in the extends
    │
    ├── app.ts                   # Express app setup
    ├── server.ts                # Server entry point
    ├── .env.example
    ├── .env
    ├── package.json
    ├── pnpm-lock.yaml           # PNPM lock file
    └── tsconfig.json
    └── .swcrc                   # SWC config file
    └── .gitignore
    └── README.md
    └── eslint.config.mjs
    └── jest.config.ts
    └── prisma.config.ts        # Prisma config file that (for Prisma 7)
*/