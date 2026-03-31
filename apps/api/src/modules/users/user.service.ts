import type { PrismaClientType } from '@prisma';
import type { Profile, User } from '@prisma/generated/prisma/client';
import type {
	UserFilterInput,
	UserOrderByInput,
	PaginationMeta,
	CreateUserPayload,
	UpdateStatusInput,
	EditProfileInput,
	ChangeRoleInput,
} from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import { BaseService } from '@shared/core';
import type { PaginationPayload } from '@shared/types';
import { buildMeta, buildUserQuery, hashPassword } from '@shared/utils';
import { type BatchPayload as DeletePayload } from '@prisma/generated/prisma/internal/prismaNamespace';

/**
 * UserService
 * -----------
 * Service layer responsible for managing User domain operations.
 *
 * @remarks
 * - Encapsulates all database access related to users
 * - Contains business-level orchestration (not HTTP concerns)
 * - Does NOT handle request validation or HTTP error responses
 * - Throws domain-specific AppErrors where appropriate
 *
 * Error handling strategy:
 * - Domain errors are thrown explicitly (e.g. USER_NOT_FOUND)
 * - Infrastructure errors (Prisma, hashing, etc.) are allowed to bubble up
 *   and are normalized by the centralized errorHandler middleware
 */
export class UserService extends BaseService {
	/**
	 * Prisma client instance.
	 *
	 * @remarks
	 * - Typed as PrismaClientType to allow future extensions
	 * - Initialized once per service instance
	 */
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'users', service: 'UserService' });
	}

	/**
	 * Retrieves a paginated list of users with filtering and ordering support.
	 *
	 * @remarks
	 * - Uses cursor-less pagination via offset/limit
	 * - Fetches `limit + 1` records to determine `hasNextPage`
	 * - Filtering and ordering are delegated to `buildUserQuery`
	 *
	 * @param pagination - Pagination configuration (page, limit, offset)
	 * @param filter - Optional user filtering criteria
	 * @param orderBy - Ordering configuration
	 *
	 * @returns
	 * - A list of users for the current page
	 * - Pagination metadata describing navigation state
	 */
	async listUsers(
		pagination: PaginationPayload,
		filter: UserFilterInput,
		orderBy: UserOrderByInput
	): Promise<{ users: User[]; meta: PaginationMeta }> {
		const { offset, limit, page } = pagination;

		// Build Prisma-compatible query inputs from domain-level filters
		const { where, orderBy: prismaOrderBy } = buildUserQuery(
			filter,
			orderBy
		);

		/**
		 * Fetch one extra record to detect whether a next page exists.
		 */
		const users = await this.prisma.user.findMany({
			where,
			orderBy: prismaOrderBy,
			skip: offset,
			take: limit + 1,
		});

		this.log.debug({ page, limit }, 'Users listed');

		return { users, meta: buildMeta<User>(users, limit, page) };
	}

	/**
	 * Retrieves a single user by its unique identifier.
	 *
	 * @param id - User ID
	 *
	 * @throws AppError
	 * - USER_NOT_FOUND when the user does not exist
	 *
	 * @returns The matching user record
	 */
	async getById(id: string): Promise<User> {
		const user = await this.prisma.user.findUnique({
			where: { id },
		});

		return this.assertFound<User>(user, ErrorCode.USER_NOT_FOUND, {
			userId: id,
		});
	}

	/**
	 * Creates a new user along with its related profile and account records.
	 *
	 * @remarks
	 * - Password hashing is performed before persistence
	 * - Relies on database-level unique constraints (e.g. email)
	 * - Does NOT pre-check for duplicates to avoid race conditions
	 *
	 * @param user - Payload containing user, profile, and credential data
	 *
	 * @returns The newly created user record
	 */
	async createUser(user: CreateUserPayload): Promise<User> {
		// Hash password before persisting credentials
		const hashedPassword = await hashPassword(user.password);

		const newUser = await this.prisma.user.create({
			data: {
				email: user.email,

				/**
				 * Profile is created as a nested relation
				 * and contains non-authentication user data.
				 */
				profile: {
					create: {
						firstName: user.firstName,
						lastName: user.lastName,
					},
				},

				/**
				 * Account contains authentication-related data.
				 */
				account: {
					create: {
						authProvider: 'LOCAL',
						hashedPassword,
					},
				},
			},
		});

		this.log.info(
			{ userId: newUser.id, email: newUser.email },
			'User account created'
		);

		return newUser;
	}

	/**
	 * Updates a user's profile information.
	 *
	 * @remarks
	 * - Operates strictly on the Profile domain
	 * - Uses PATCH semantics (partial updates allowed)
	 * - Identifies the profile via the associated userId
	 *
	 * @param id - User ID whose profile should be updated
	 * @param profile - Partial profile update payload
	 *
	 * @returns The updated profile record
	 */
	async updateProfile(
		id: string,
		profile: EditProfileInput
	): Promise<Profile> {
		const updatedProfile = await this.prisma.profile.update({
			where: { userId: id },
			data: this.stripNullish(profile as Record<string, unknown>),
		});

		this.log.info(
			{
				userId: id,
				profileId: updatedProfile.id,
			},
			'User Profile updated'
		);

		return updatedProfile;
	}

	/**
	 * Updates a user's account status and verification flags.
	 *
	 * @remarks
	 * - Intended for moderation and administrative workflows
	 * - Does NOT affect authentication credentials or profile data
	 *
	 * @param id - User ID
	 * @param status - Status and verification update payload
	 *
	 * @returns The updated user record
	 */
	async updateStatus(id: string, status: UpdateStatusInput): Promise<User> {
		const updatedStatus = await this.prisma.user.update({
			where: { id },
			data: {
				isActive: status.isActive,
				isEmailVerified: status.isEmailVerified,
			},
		});

		this.log.info(
			{
				userId: id,
				isActive: status.isActive,
				isEmailVerified: status.isEmailVerified,
			},
			'User status updated'
		);

		return updatedStatus;
	}

	/**
	 * Changes the role assigned to a user.
	 *
	 * @remarks
	 * - Authorization is enforced outside the service layer
	 * - This method assumes the caller is already authorized
	 *
	 * @param id - User ID
	 * @param role - New role to assign
	 *
	 * @returns The updated user record
	 */
	async changeRole(id: string, user: ChangeRoleInput): Promise<User> {
		const updatedRole = await this.prisma.user.update({
			where: { id },
			data: {
				role: user.role,
			},
		});

		this.log.warn({ userId: id, role: user.role }, 'User role changed');

		return updatedRole;
	}

	/**
	 * Deletes a single user by ID.
	 *
	 * @remarks
	 * - Intended for administrative use
	 * - Cascading behavior is controlled by Prisma schema relations
	 *
	 * @param id - User ID
	 *
	 * @returns The deleted user record
	 */
	async deleteById(id: string): Promise<User> {
		const deletedUser = await this.prisma.user.delete({
			where: { id },
		});

		this.log.warn({ userId: id }, 'User account deleted');

		return deletedUser;
	}

	/**
	 * Deletes multiple users based on optional filtering criteria.
	 *
	 * @remarks
	 * - Admin-only operation
	 * - Supports safe bulk deletion using the same filtering logic
	 *   as list queries
	 *
	 * @param filter - Optional user filtering criteria
	 *
	 * @returns Summary payload describing the delete operation
	 */
	async deleteUsers(filter?: UserFilterInput): Promise<DeletePayload> {
		const { where } = buildUserQuery(
			filter ?? ({} as UserFilterInput),
			{} as UserOrderByInput
		);

		const deletedUsers = await this.prisma.user.deleteMany({
			where,
		});

		this.log.warn(
			{ deletedCount: deletedUsers.count, filter },
			'Bulk user deletion executed'
		);

		return deletedUsers;
	}
}
