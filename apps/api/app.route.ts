import { prisma } from './prisma/prisma.client';
import { Router } from 'express';
import {
	createUserRouter,
	UserController,
	UserService,
} from './src/modules/users';
import {
	createProfileRouter,
	ProfileController,
	ProfileService,
} from './src/modules/profiles';
import {
	createAuthRouter,
	AuthController,
	AuthService,
} from './src/modules/auth';

/**
 * Root application router.
 *
 * @remarks
 * - Acts as the top-level routing composition layer
 * - Delegates request handling to domain-specific routers
 * - Keeps `app.ts` clean and focused on infrastructure concerns
 *
 * Route grouping:
 * - `/users` → Administrative user management
 *
 * This router should be mounted once in `app.ts`.
 */
export const rootRouter = Router();

const userController = new UserController(new UserService(prisma));
/**
 * 👥 Users domain routes.
 *
 * All `/users` endpoints are:
 * - Protected (authentication + authorization enforced downstream)
 * - Intended for administrative or system-level access
 */
rootRouter.use('/users', createUserRouter(userController));

/**
 * Profiles module wiring.
 *
 * @remarks
 * - Dependencies are constructed explicitly
 * - No hidden global state
 * - Easy to refactor or swap implementations later
 */
const profileController = new ProfileController(new ProfileService(prisma));
/**
 * Mounts the Profiles router under /profiles.
 *
 * Example routes:
 * - GET    /profiles/me
 * - PATCH  /profiles/me
 * - GET    /profiles/:id
 */
rootRouter.use('/profiles', createProfileRouter(profileController));

const authController = new AuthController(
	new AuthService(prisma),
	new UserService(prisma)
);

rootRouter.use('/auth', createAuthRouter(authController));
