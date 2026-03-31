import type { Request, Response } from 'express';
import { type UserService, UserMapper } from '@modules/users';
import { ProfileMapper } from '@modules/profiles';
import type {
	AdminUserDTO,
	UserOrderByInput,
	ProfileDTO,
} from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import { BaseController } from '@shared/core';
import { STATUS_CODE } from '@shared/constants';

export class UserController extends BaseController {
	/**
	 * User controller layer.
	 *
	 * @remarks
	 * - Acts as the HTTP boundary for the Users domain
	 * - Responsible ONLY for:
	 *   - Extracting request data
	 *   - Calling the service layer
	 *   - Mapping domain models to DTOs
	 *   - Returning standardized API responses
	 *
	 * - Business rules, validation, and error handling
	 *   are delegated to services and middleware
	 */
	constructor(private readonly userService: UserService) {
		super({ domain: 'users', controller: 'UserService' });
	}

	/**
	 * GET /users
	 *
	 * Retrieves a paginated list of users with optional filtering and ordering.
	 *
	 * @remarks
	 * - Intended for administrative usage
	 * - Supports pagination, filtering, and sorting
	 * - Returns pagination metadata for client-side navigation
	 */
	getUsers = async (req: Request, res: Response): Promise<void> => {
		const { users, meta } = await this.userService.listUsers(
			this.getPagination(req),
			req.query,
			this.getOrderBy<UserOrderByInput>(req)
		);

		this.ok<AdminUserDTO[]>(
			res,
			UserMapper.toAdminDTOList(users),
			'USERS_FETCHED',
			meta
		);
	};

	/**
	 * GET /users/:id
	 *
	 * Retrieves a single user by its unique identifier.
	 *
	 * @remarks
	 * - Throws USER_NOT_FOUND via the service if the user does not exist
	 * - Accessible only to authorized administrative roles
	 */
	getUserById = async (req: Request, res: Response): Promise<void> => {
		const id = this.getParam(req);

		const user = await this.userService.getById(id);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<AdminUserDTO>(
				UserMapper.toAdminDTO(user),
				'USER_RETRIEVED'
			)
		);
	};

	/**
	 * POST /users
	 *
	 * Creates a new user account.
	 *
	 * @remarks
	 * - Used by administrators to provision accounts
	 * - Returns the newly created user for immediate client use
	 */
	createUser = async (req: Request, res: Response): Promise<void> => {
		const newUser = await this.userService.createUser(req.body);

		this.created<AdminUserDTO>(
			res,
			UserMapper.toAdminDTO(newUser),
			'USER_CREATED'
		);
	};

	/**
	 * PATCH /users/:id/profile
	 *
	 * Updates profile-related user information.
	 *
	 * @remarks
	 * - Operates strictly on the Profile domain
	 * - Uses PATCH semantics (partial updates allowed)
	 * - Does NOT affect authentication, role, or status
	 */
	updateUserProfile = async (req: Request, res: Response): Promise<void> => {
		const id = this.getParam(req);

		const updatedUser = await this.userService.updateProfile(id, req.body);

		this.ok<ProfileDTO>(
			res,
			ProfileMapper.toDTO(updatedUser),
			'PROFILE_UPDATED'
		);
	};

	/**
	 * PATCH /users/:id/status
	 *
	 * Updates a user's operational and verification status.
	 *
	 * @remarks
	 * - Intended for moderation and enforcement workflows
	 * - Controls access without deleting the account
	 */
	updateUserStatus = async (req: Request, res: Response): Promise<void> => {
		const id = this.getParam(req);

		const updatedUser = await this.userService.updateStatus(id, req.body);

		this.ok<AdminUserDTO>(
			res,
			UserMapper.toAdminDTO(updatedUser),
			'USER_STATUS_UPDATED'
		);
	};

	/**
	 * PATCH /users/:id/role
	 *
	 * Changes the role assigned to a user.
	 *
	 * @remarks
	 * - Restricted to authorized administrators
	 * - Role-based access control is enforced elsewhere
	 */
	changeUserRole = async (req: Request, res: Response): Promise<void> => {
		const id = this.getParam(req);

		const updatedUser = await this.userService.changeRole(id, req.body);

		this.ok<AdminUserDTO>(
			res,
			UserMapper.toAdminDTO(updatedUser),
			'USER_ROLE_UPDATED'
		);
	};

	/**
	 * DELETE /users/:id
	 *
	 * Deletes a single user by ID.
	 *
	 * @remarks
	 * - Administrative operation
	 * - Uses no-content semantics since the resource no longer exists
	 */
	deleteUserById = async (req: Request, res: Response): Promise<void> => {
		const id = this.getParam(req);

		await this.userService.deleteById(id);

		this.noContent(res);
	};

	/**
	 * DELETE /users
	 *
	 * Bulk deletes users based on optional filter criteria.
	 *
	 * @remarks
	 * - Admin-only operation
	 * - Intended for cleanup and moderation workflows
	 * - Uses no-content semantics
	 */
	deleteUsers = async (req: Request, res: Response): Promise<void> => {
		const { query: filter } = req;

		await this.userService.deleteUsers(filter);

		this.noContent(res);
	};
}
