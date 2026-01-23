import { Router } from 'express';
import { prisma } from '@prisma';
import {
	createUserRouter,
	UserController,
	UserService,
} from './src/modules/users';

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
