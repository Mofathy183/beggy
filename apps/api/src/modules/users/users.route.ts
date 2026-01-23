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

import { UserController } from '@modules/users';
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

//* USERS: "Manage your profile"
//* router.get('/users/me', requireAuth, usersController.getMe);
//* router.patch('/users/me', requireAuth, validate(updateProfileSchema), usersController.updateProfile);
//* router.patch('/users/me/password', requireAuth, validate(changePasswordSchema), usersController.changePassword);
//* router.patch('/users/me/email', requireAuth, validate(changeEmailSchema), usersController.changeEmail);
//* router.delete('/users/me', requireAuth, usersController.deactivateAccount);
//* router.get('/users/me/permissions', requireAuth, usersController.getPermissions);
//* router.post('/users/me/send-verification-email', requireAuth, usersController.sendVerificationEmail);

//* // Public user profiles
//* router.get('/users', usersController.getPublicUsers);
//* router.get('/users/:id', usersController.getUserPublicProfile);

//* // Admin endpoints
//* router.get('/admin/users', requireAuth, requireAdmin, usersController.getAllUsers);
//* // ... other admin endpoints

//*==============================================={{ USER ME ROUTES }}=====================================================

// //* for get user permissions => GET
// //* user must be login already to get his permissions
// authRoute.get(
// 	'/permissions',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	permissions
// );

// //* route for frontend to check if user is authentic
// authRoute.get('/me', VReqToHeaderToken, headersMiddleware, authMe);

// //* route for send verification email
// //* POST {email}
// authRoute.post(
// 	'/send-verification-email',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToEmail,
// 	sendVerificationEmail
// );

// //* route for changing password (only for logged-in users) => PATCH
// //   Requires: currentPassword, newPassword, confirmPassword
// authRoute.patch(
// 	'/change-password',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('update:own', 'user'),
// 	VReqToUpdatePassword,
// 	updatePassword
// );

// //* route for editing profile info (excluding password) => PATCH
// authRoute.patch(
// 	'/edit-profile',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToUpdateUserData,
// 	checkPermissionMiddleware('update:own', 'user'),
// 	updateData
// );

// //* route for change user email => PATCH (email) user must by login to change his email
// authRoute.patch(
// 	'/change-email',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToEmail,
// 	changeEmail
// );

// //* route for deactivate user account => DELETE  (User must be login already to be deactivated)
// authRoute.delete(
// 	'/deactivate',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('delete:own', 'user'),
// 	deActivate
// );

//*==============================================={{ USER ME ROUTES }}=====================================================

//*==============================================={{ ADMIN ROUTES }}=====================================================
// const adminRoute = express.Router();

// //* to check if the id in params is valid and exists
// adminRoute.param('id', (req, res, next, id) =>
// 	VReqToUUID(req, res, next, id, 'id')
// );

// //* route for get all users => GET (Only Admin)
// adminRoute.get(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('read:any', 'user'),
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	searchForUsersMiddleware,
// 	findAllUsers
// );

// //* route for get user private profile by id => GET param (id)
// adminRoute.get(
// 	'/:id',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('read:any', 'user'),
// 	findUserById
// );

// //* route for create user => POST (only Admin)
// adminRoute.post(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('create:any', 'user'),
// 	VReqToCreateUser,
// 	createUser
// );

// //* route for change user role => PATCH (Admin and Member only)
// adminRoute.patch(
// 	'/:id/role',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('update:any', 'user'),
// 	VReqToUserRole,
// 	changeUserRoleById
// );

// //* route for delete all users => DELETE  //delete
// adminRoute.delete(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'user'),
// 	searchForUsersMiddleware,
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllUsers
// );

// //* route for delete user by id => DELETE param(id) //delete
// adminRoute.delete(
// 	'/:id',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'user'),
// 	deleteUserById
// );

//*==============================================={{ ADMIN ROUTES }}=====================================================

//*======================================={Users Public Route}==============================================

// //* route for search for users by query => GET
// publicRoute.get(
// 	'/users',
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	searchForUsersMiddleware,
// 	getAllUsers
// );

// //* route to get user public profile by id => GET param (id)
// publicRoute.get('/users/:id', getUserPublicProfile);

//*======================================={Users Public Route}==============================================
