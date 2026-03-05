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

/**
 * Root application router.
 *
 * @description
 * Acts as the top-level routing composition layer for the API.
 * Each domain module registers its own router here.
 *
 * @remarks
 * Responsibilities:
 * - Instantiate controllers with their required services
 * - Inject infrastructure dependencies (e.g., Prisma)
 * - Mount feature routers under their route prefixes
 *
 * This router should be mounted once in `app.ts`.
 *
 * Example:
 * ```ts
 * app.use('/api', rootRouter);
 * ```
 */
export const rootRouter = Router();

/**
 * Users module composition.
 *
 * Handles administrative user management and system-level user operations.
 */
const userController = new UserController(new UserService(prisma));

/**
 * Mounts Users routes under `/users`.
 */
rootRouter.use('/users', createUserRouter(userController));

/**
 * Profiles module composition.
 *
 * Profiles represent user-facing identity and personal information
 * separate from the system-level User entity.
 */
const profileController = new ProfileController(new ProfileService(prisma));

/**
 * Mounts Profile routes under `/profiles`.
 *
 * Typical routes include:
 * - GET   /profiles/me
 * - PATCH /profiles/me
 * - GET   /profiles/:id
 */
rootRouter.use('/profiles', createProfileRouter(profileController));

/**
 * Auth module composition.
 *
 * Handles authentication flows such as login, registration,
 * and token/session management.
 */
const authController = new AuthController(
	new AuthService(prisma),
	new UserService(prisma)
);

/**
 * Mounts authentication routes under `/auth`.
 */
rootRouter.use('/auth', createAuthRouter(authController));

/**
 * Items module composition.
 *
 * Items represent reusable physical objects that can be packed
 * into containers such as bags or suitcases.
 */
const itemController = new ItemController(new ItemService(prisma));

/**
 * Mounts item management routes under `/items`.
 */
rootRouter.use('/items', createItemRouter(itemController));
