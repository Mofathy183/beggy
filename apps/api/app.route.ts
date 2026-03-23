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

import {
	createItemRouter,
	ItemController,
	ItemService,
} from './src/modules/items';

import {
	createDashboardRouter,
	DashboardController,
	DashboardService,
} from './src/modules/dashboard';

enum ROUTES {
	USERS = '/users',
	PROFILES = '/profiles',
	AUTH = '/auth',
	ITEMS = '/items',
	DASHBOARD = '/dashboard',
}

/**
 * Root application router.
 *
 * @description
 * Central composition layer responsible for wiring domain modules
 * into HTTP routes. Acts as the boundary between infrastructure
 * (Express, Prisma) and application modules.
 *
 * @remarks
 * - All dependencies are instantiated here (composition root pattern)
 * - Each module is mounted under a dedicated route prefix
 * - This router should be mounted once in `app.ts`
 *
 * @example
 * app.use('/api', rootRouter);
 */
export const rootRouter = Router();

/* -------------------------------------------------------------------------- */
/*                                Users Module                                */
/* -------------------------------------------------------------------------- */

/**
 * Handles system-level user management operations.
 */
const userService = new UserService(prisma);
const userController = new UserController(userService);

/**
 * @route /users
 */
rootRouter.use(ROUTES.USERS, createUserRouter(userController));

/* -------------------------------------------------------------------------- */
/*                               Profiles Module                              */
/* -------------------------------------------------------------------------- */

/**
 * Profiles represent user-facing identity and personal data.
 */
const profileService = new ProfileService(prisma);
const profileController = new ProfileController(profileService);

/**
 * @route /profiles
 */
rootRouter.use(ROUTES.PROFILES, createProfileRouter(profileController));

/* -------------------------------------------------------------------------- */
/*                                 Auth Module                                */
/* -------------------------------------------------------------------------- */

/**
 * Handles authentication flows and session management.
 *
 * @remarks
 * Depends on both AuthService and UserService due to user lifecycle coupling.
 */
const authService = new AuthService(prisma);
const authController = new AuthController(authService, userService);

/**
 * @route /auth
 */
rootRouter.use(ROUTES.AUTH, createAuthRouter(authController));

/* -------------------------------------------------------------------------- */
/*                                 Items Module                               */
/* -------------------------------------------------------------------------- */

/**
 * Items represent physical objects that can be packed into containers.
 */
const itemService = new ItemService(prisma);
const itemController = new ItemController(itemService);

/**
 * @route /items
 */
rootRouter.use(ROUTES.ITEMS, createItemRouter(itemController));

/* -------------------------------------------------------------------------- */
/*                              Dashboard Module                              */
/* -------------------------------------------------------------------------- */

/**
 * Aggregates cross-domain data for dashboard views.
 *
 * @remarks
 * Typically composes multiple domain queries into a single response
 * optimized for frontend consumption.
 */
const dashboardService = new DashboardService(prisma);
const dashboardController = new DashboardController(dashboardService);

/**
 * @route /dashboard
 */
rootRouter.use(ROUTES.DASHBOARD, createDashboardRouter(dashboardController));
