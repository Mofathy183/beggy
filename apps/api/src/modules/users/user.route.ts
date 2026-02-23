/**
 * 👥 USERS — Administrative / System Resource
 *
 * The Users domain represents user accounts as system-managed entities.
 * These endpoints are intended for administrative and internal use.
 *
 * Users are:
 * - Managed by the system
 * - Controlled via roles and permissions
 * - Not responsible for authentication logic
 *
 * ------------------------------------------------------------------
 * Administrative Endpoints (Protected)
 * ------------------------------------------------------------------
 *
 * GET /users
 * - Returns a paginated list of users
 * - Supports:
 *   - Pagination (page, limit)
 *   - Ordering (orderBy, direction)
 *   - Searching and filtering
 *
 * GET /users/:id
 * - Returns a private user record by ID
 * - Intended for admin or privileged roles only
 *
 * POST /users
 * - Creates a new user account
 * - Typically used by admins
 *
 * PATCH /users/:id/profile
 * - Updates a user's profile information
 * - Intended for administrative or moderation workflows
 * - Allows partial updates (PATCH semantics)
 * - Does NOT affect authentication, role, or status data
 * - Operates strictly on the Profile domain (name, avatar, location, etc.)
 *
 * PATCH /users/:id/status
 * - Updates a user's account status and trust flags
 * - Used for moderation, enforcement, and verification workflows
 * - Allows partial updates (PATCH semantics)
 * - Controls operational access without deleting the account
 * - Not exposed via self-service user endpoints
 *
 * PATCH /users/:id/role
 * - Updates the role assigned to a user
 * - Role changes are restricted to authorized administrators
 *
 * DELETE /users
 * - Bulk delete users (admin-only)
 * - Typically used with search and filtering criteria
 *
 * DELETE /users/:id
 * - Deletes a single user by ID
 *
 * Access control:
 * - No /admin prefix is required
 * - Authorization is enforced via roles and permissions
 *
 * Pagination and ordering are supported on list endpoints
 * to ensure scalability and predictable data access.
 */
import { Router } from 'express';

import { Action, Subject } from '@beggy/shared/constants';
import {
	AdminSchema,
	QuerySchema,
	OrderByQuerySchemas,
} from '@beggy/shared/schemas';

import { type UserController } from '@modules/users';
import {
	requireAuth,
	requirePermission,
	prepareListQuery,
	validateBody,
	validateUuidParam,
	validateQuery,
} from '@shared/middlewares';

export const createUserRouter = (userController: UserController): Router => {
	/**
	 * 👥 USERS — Administrative / System Resource
	 *
	 * @remarks
	 * The Users domain represents user accounts as **system-managed entities**.
	 * These endpoints are intended for:
	 * - Administrators
	 * - Moderators
	 * - Internal system workflows
	 *
	 * Users are:
	 * - Controlled via roles and permissions
	 * - NOT responsible for authentication logic
	 *
	 * ------------------------------------------------------------------
	 * Middleware layering philosophy:
	 * ------------------------------------------------------------------
	 * 1. Authentication (`requireAuth`)
	 * 2. Authorization (`requirePermission`)
	 * 3. Query normalization (`prepareListQuery`)
	 * 4. Request validation (Zod)
	 * 5. Controller execution
	 *
	 * Controllers can safely assume:
	 * - `req.user` is authenticated
	 * - `req.ability` is initialized
	 * - Request data is validated & normalized
	 */
	const router = Router();

	router.get(
		'/',
		requireAuth,
		requirePermission(Action.READ, Subject.USER),

		/**
		 * Normalize pagination and ordering metadata.
		 */
		prepareListQuery({
			orderBySchema: OrderByQuerySchemas.userOrderBy,
		}),

		/**
		 * Validate filtering and search parameters.
		 */
		validateQuery(QuerySchema.userFilter),

		userController.getUsers
	);

	router.get(
		'/:id',
		requireAuth,
		requirePermission(Action.READ, Subject.USER),
		validateUuidParam,
		userController.getUserById
	);

	router.post(
		'/',
		requireAuth,
		requirePermission(Action.CREATE, Subject.USER),
		validateBody(AdminSchema.createUser),
		userController.createUser
	);

	router.patch(
		'/:id/profile',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.USER),
		validateUuidParam,
		userController.updateUserProfile
	);

	router.patch(
		'/:id/status',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.USER),
		validateUuidParam,
		userController.updateUserStatus
	);

	router.patch(
		'/:id/role',
		requireAuth,
		requirePermission(Action.UPDATE, Subject.ROLE),
		validateUuidParam,
		userController.changeUserRole
	);

	router.delete(
		'/',
		requireAuth,
		requirePermission(Action.DELETE, Subject.USER),
		validateQuery(QuerySchema.userFilter),
		userController.deleteUsers
	);

	router.delete(
		'/:id',
		requireAuth,
		requirePermission(Action.DELETE, Subject.USER),
		validateUuidParam,
		userController.deleteUserById
	);

	return router;
};
