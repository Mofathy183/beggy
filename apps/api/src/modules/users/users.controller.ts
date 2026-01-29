import type { Request, Response } from 'express';
import { type UserService, UserMapper } from '@modules/users';
import { ProfileMapper } from '@modules/profiles';
import type {
	UserDTO,
	UserOrderByInput,
	ProfileDTO,
} from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import type { PaginationPayload } from '@shared/types';
import { STATUS_CODE } from '@shared/constants';

export class UserController {
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
	constructor(private readonly userService: UserService) {}

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
		const { pagination, orderBy, query: filter } = req;

		const { users, meta } = await this.userService.listUsers(
			pagination as PaginationPayload,
			filter,
			orderBy as UserOrderByInput
		);

		//* Map domain models to transport-safe DTOs
		const usersResponse = users.map(UserMapper.toDTO);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<UserDTO[]>(usersResponse, 'USERS_FETCHED', meta)
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
		const { id } = req.params;

		const user = await this.userService.getById(id as string);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<UserDTO>(UserMapper.toDTO(user), 'USER_RETRIEVED')
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
		const { body } = req;

		const newUser = await this.userService.createUser(body);

		res.status(STATUS_CODE.CREATED).json(
			apiResponseMap.created<UserDTO>(
				UserMapper.toDTO(newUser),
				'USER_CREATED'
			)
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
		const {
			body,
			params: { id },
		} = req;

		const updatedUser = await this.userService.updateProfile(
			id as string,
			body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<ProfileDTO>(
				ProfileMapper.toDTO(updatedUser),
				'PROFILE_UPDATED'
			)
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
		const {
			body,
			params: { id },
		} = req;

		const updatedUser = await this.userService.updateStatus(
			id as string,
			body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<UserDTO>(
				UserMapper.toAdminDTO(updatedUser),
				'USER_STATUS_UPDATED'
			)
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
		const {
			body,
			params: { id },
		} = req;

		const updatedUser = await this.userService.changeRole(
			id as string,
			body
		);

		res.status(STATUS_CODE.OK).json(
			apiResponseMap.ok<UserDTO>(
				UserMapper.toDTO(updatedUser),
				'USER_ROLE_UPDATED'
			)
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
		const { id } = req.params;

		await this.userService.deleteById(id as string);

		res.sendStatus(STATUS_CODE.NO_CONTENT);
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

		res.sendStatus(STATUS_CODE.NO_CONTENT);
	};
}
