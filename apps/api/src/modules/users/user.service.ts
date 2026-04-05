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
 * Service responsible for user-related domain operations.
 *
 * @remarks
 * Encapsulates persistence logic and domain orchestration for users.
 * Does not handle transport concerns (e.g. HTTP, validation).
 *
 * Error strategy:
 * - Known domain failures throw AppError via BaseService helpers
 * - Infrastructure errors are allowed to bubble up
 */
export class UserService extends BaseService {
	constructor(private readonly prisma: PrismaClientType) {
		super({ domain: 'users', service: 'UserService' });
	}

	/**
	 * Retrieves paginated users with filtering and sorting.
	 *
	 * @param pagination - Pagination configuration (offset-based)
	 * @param filter - Domain-level filtering criteria
	 * @param orderBy - Sorting configuration
	 *
	 * @returns Paginated users with navigation metadata
	 *
	 * @remarks
	 * Fetches `limit + 1` records to infer `hasNextPage`.
	 */
	async listUsers(
		pagination: PaginationPayload,
		filter: UserFilterInput,
		orderBy: UserOrderByInput
	): Promise<{ users: User[]; meta: PaginationMeta }> {
		const { offset, limit, page } = pagination;

		const { where, orderBy: prismaOrderBy } = buildUserQuery(
			filter,
			orderBy
		);

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
	 * Retrieves a user by ID.
	 *
	 * @param id - User identifier
	 * @returns The user entity
	 *
	 * @throws {AppError} When user does not exist
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
	 * Creates a user with associated profile and local account.
	 *
	 * @param payload - User creation data including credentials
	 * @returns Newly created user
	 *
	 * @remarks
	 * - Relies on DB constraints for uniqueness (e.g. email)
	 * - Avoids pre-checks to prevent race conditions
	 */
	async createUser(payload: CreateUserPayload): Promise<User> {
		const hashedPassword = await hashPassword(payload.password);

		const newUser = await this.prisma.user.create({
			data: {
				email: payload.email,
				profile: {
					create: {
						firstName: payload.firstName,
						lastName: payload.lastName,
					},
				},
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
	 * Partially updates a user's profile.
	 *
	 * @param id - User identifier
	 * @param profile - Partial profile fields
	 * @returns Updated profile entity
	 *
	 * @remarks
	 * Nullish values are stripped before persistence.
	 */
	async updateProfile(
		id: string,
		profile: EditProfileInput
	): Promise<Profile> {
		await this.getById(id);

		const updatedProfile = await this.prisma.profile.update({
			where: { userId: id },
			data: this.stripNullish(profile as Record<string, unknown>),
		});

		this.log.info(
			{ userId: id, profileId: updatedProfile.id },
			'User Profile updated'
		);

		return updatedProfile;
	}

	/**
	 * Updates account status flags.
	 *
	 * @param id - User identifier
	 * @param status - Status update payload
	 * @returns Updated user
	 *
	 * @remarks
	 * Intended for administrative or moderation workflows.
	 */
	async updateStatus(id: string, status: UpdateStatusInput): Promise<User> {
		await this.getById(id);

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
	 * Assigns a new role to a user.
	 *
	 * @param id - User identifier
	 * @param input - Role assignment payload
	 * @returns Updated user
	 *
	 * @remarks
	 * Assumes authorization is handled upstream.
	 */
	async changeRole(id: string, input: ChangeRoleInput): Promise<User> {
		await this.getById(id);

		const updatedRole = await this.prisma.user.update({
			where: { id },
			data: {
				role: input.role,
			},
		});

		this.log.warn({ userId: id, role: input.role }, 'User role changed');

		return updatedRole;
	}

	/**
	 * Deletes a user by ID.
	 *
	 * @param id - User identifier
	 * @returns Deleted user
	 *
	 * @remarks
	 * Cascading behavior is defined at the schema level.
	 */
	async deleteById(id: string): Promise<User> {
		await this.getById(id);

		const deletedUser = await this.prisma.user.delete({
			where: { id },
		});

		this.log.warn({ userId: id }, 'User account deleted');

		return deletedUser;
	}

	/**
	 * Deletes users matching filter criteria.
	 *
	 * @param filter - Optional filtering conditions
	 * @returns Batch delete result
	 *
	 * @remarks
	 * Uses same filtering logic as list queries for consistency.
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
