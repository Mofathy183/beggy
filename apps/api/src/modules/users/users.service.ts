import { type ExtendedPrismaClient } from '@prisma';
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
import { logger } from '@shared/middlewares';
import type { PaginationPayload } from '@shared/types';
import { appErrorMap, buildUserQuery, hashPassword } from '@shared/utils';
import { BatchPayload as DeletePayload } from '@prisma/generated/prisma/internal/prismaNamespace';

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
export class UserService {
	/**
	 * Prisma client instance.
	 *
	 * @remarks
	 * - Typed as ExtendedPrismaClient to allow future extensions
	 * - Initialized once per service instance
	 */
	constructor(private readonly prisma: ExtendedPrismaClient) {}

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

		const hasNextPage = users.length > limit;
		const hasPreviousPage = page > 1;

		// Remove the extra record before returning the response
		if (hasNextPage) {
			users.pop();
		}

		const meta: PaginationMeta = {
			count: users.length, // count of records in the current page
			page,
			limit,
			hasNextPage,
			hasPreviousPage,
		};

		return { users, meta };
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

		if (!user) {
			logger.warn({ userId: id }, 'User not found');
			throw appErrorMap.notFound(ErrorCode.USER_NOT_FOUND);
		}

		return user;
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
						avatarUrl: user.avatarUrl,
						gender: user.gender,
						birthDate: user.birthDate,
						country: user.country,
						city: user.city,
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

		logger.info(
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
			data: {
				firstName: profile.firstName || undefined,
				lastName: profile.lastName || undefined,
				gender: profile.gender || undefined,
				birthDate: profile.birthDate || undefined,
				avatarUrl: profile.avatarUrl || undefined,
				country: profile.country || undefined,
				city: profile.city || undefined,
			},
		});

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

		logger.info(
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
				role: user.role
			},
		});

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

		return deletedUsers;
	}
}

// //*====================================================={ ADMIN }================================================================//
// /**
//  * @function addUser
//  * @description Creates a new user with the provided details, including password hashing and validation.
//  * @param {Object} body - The input details of the user.
//  * @param {string} body.firstName - The first name of the user.
//  * @param {string} body.lastName - The last name of the user.
//  * @param {string} body.email - The email of the user.
//  * @param {string} body.password - The password of the user.
//  * @param {string} body.confirmPassword - The confirmation password of the user.
//  * @param {string} body.gender - The gender of the user.
//  * @param {Date} body.birth - The date of birth of the user.
//  * @param {string} body.country - The country of residence of the user.
//  * @param {string} body.city - The city of residence of the user.
//  * @param {string} [body.profilePicture] - Optional profile picture URL of the user.
//  * @returns {Promise<Object>} The newly created user and metadata, or an error if the operation fails.
//  */
// export const addUser = async (body) => {
// 	try {
// 		const {
// 			firstName,
// 			lastName,
// 			email,
// 			password,
// 			confirmPassword,
// 			gender,
// 			birth,
// 			country,
// 			city,
// 			profilePicture,
// 		} = body;

// 		// Hashing the password
// 		if (password !== confirmPassword)
// 			return new ErrorHandler(
// 				'password',
// 				'password is not the same in confirmPassword',
// 				'Enter the same password in confirm password',
// 				statusCode.badRequestCode
// 			);

// 		const hashPassword = await hashingPassword(password);

// 		// Create new user in Prisma
// 		const newUser = await prisma.user.create({
// 			data: {
// 				firstName,
// 				lastName,
// 				email,
// 				password: hashPassword,
// 				gender: gender,
// 				birthDate: birthOfDate(birth),
// 				country,
// 				city,
// 				profilePicture: haveProfilePicture(profilePicture),
// 			},
// 			include: {
// 				suitcases: true,
// 				bags: true,
// 				items: true,
// 				account: true,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				role: true,
// 				isActive: true,
// 			},
// 		});

// 		if (!newUser)
// 			return new ErrorHandler(
// 				'user error',
// 				'No user created',
// 				'Failed to create user',
// 				statusCode.notFoundCode
// 			);

// 		if (newUser.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				newUser.error,
// 				'User already exists ' + newUser.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.user.count();

// 		const meta = {
// 			totalCount: totalCount,
// 			totalCreate: newUser ? 1 : 0,
// 		};

// 		return { newUser, meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Create User'
// 				: error,
// 			'Failed to create user',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function getUserById
//  * @description Retrieves a user's information based on their ID, including associated suitcases, bags, items, and account details.
//  * @param {string} userId - The ID of the user to retrieve.
//  * @returns {Promise<Object>} The user's details, or an error if the operation fails.
//  */
// export const getUserById = async (userId) => {
// 	try {
// 		const user = await prisma.user.findUnique({
// 			where: { id: userId },
// 			include: {
// 				suitcases: true,
// 				bags: true,
// 				items: true,
// 				account: true,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 			},
// 		});

// 		if (!user)
// 			return new ErrorHandler(
// 				'User null',
// 				'User not found',
// 				'There is no user with that id',
// 				statusCode.notFoundCode
// 			);

// 		if (user.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				user.error,
// 				'User not found ' + user.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return user;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Fine User By Id'
// 				: error,
// 			'Failed to get user by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function getAllUsers
//  * @description Fetches a list of users based on filtering criteria, pagination, and sorting options. Includes associated suitcases, bags, items, and account details.
//  * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
//  * @param {Object} searchFilter - Filtering conditions for the user query (supports logical OR operations).
//  * @param {Object} orderBy - Criteria to sort the results.
//  * @returns {Promise<Object>} An object containing the fetched users and metadata, or an error if the operation fails.
//  */
// export const getAllUsers = async (pagination, searchFilter, orderBy) => {
// 	try {
// 		const { page, limit, offset } = pagination;

// 		const users = await prisma.user.findMany({
// 			where: searchFilter,
// 			include: {
// 				suitcases: true,
// 				bags: true,
// 				items: true,
// 				account: true,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 			},
// 			skip: offset,
// 			take: limit,
// 			orderBy: orderBy,
// 		});

// 		if (!users)
// 			return new ErrorHandler(
// 				'user',
// 				'No users found',
// 				'No users found in the database',
// 				statusCode.notFoundCode
// 			);

// 		if (users.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				'No users found ' + users.error,
// 				'No users found in the database ' + users.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalUsers = await prisma.user.count({
// 			where: { isActive: true },
// 		});

// 		if (totalUsers.error)
// 			return new ErrorHandler(
// 				'Total users null',
// 				'No users found' || totalUsers.error,
// 				'No users found in the database',
// 				statusCode.internalServerErrorCode
// 			);

// 		const meta = {
// 			totalCount: totalUsers,
// 			totalFind: users.length,
// 			page: page,
// 			limit: limit,
// 			searchFilter: searchFilter,
// 			orderBy: orderBy,
// 		};

// 		return { users: users, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Fine All Users'
// 				: error,
// 			'Failed to get all users',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function changeUserRole
//  * @description Updates the role of a specific user in the database.
//  * @param {string} id - The ID of the user whose role will be updated.
//  * @param {Object} body - The request body containing the new role.
//  * @param {string} body.role - The new role for the user.
//  * @returns {Promise<Object>} The updated user details, or an error if the operation fails.
//  */
// export const changeUserRole = async (id, body) => {
// 	try {
// 		const { role } = body;

// 		const updatedUser = await prisma.user.update({
// 			where: { id: id },
// 			data: {
// 				role: role,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				isActive: true,
// 			},
// 		});

// 		if (!updatedUser)
// 			return new ErrorHandler(
// 				'User null',
// 				'User Cannot be modified',
// 				'There is no user with that id to modify',
// 				statusCode.notFoundCode
// 			);

// 		if (updatedUser.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updatedUser.error,
// 				'User cannot be modified ' + updatedUser.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return updatedUser;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Change User Role'
// 				: error,
// 			'Failed to modify user by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function removeUser
//  * @description Deletes a specific user from the database identified by their ID.
//  * @param {string} userId - The ID of the user to delete.
//  * @returns {Promise<Object>} An object containing the deleted user details and metadata, or an error if the operation fails.
//  */
// export const removeUser = async (userId) => {
// 	try {
// 		const userDeleted = await prisma.user.delete({
// 			where: { id: userId },
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				role: true,
// 				isActive: true,
// 			},
// 		});

// 		if (!userDeleted)
// 			return new ErrorHandler(
// 				'Delete null zero',
// 				'User cannot be deleted',
// 				'There is no user with that id to delete',
// 				statusCode.notFoundCode
// 			);

// 		if (userDeleted.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userDeleted.error,
// 				'User cannot be deleted for database ' +
// 					userDeleted.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.user.count();

// 		const meta = {
// 			totalCount: totalCount,
// 			totalDelete: userDeleted ? 1 : 0,
// 		};

// 		return { userDeleted: userDeleted, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Delete User'
// 				: error,
// 			'Failed to remove user by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Remove multiple users from the database based on a filter,
//  * excluding the user with the given admin ID to prevent self-deletion.
//  *
//  * @param {Object} searchFilter - The filter criteria to select users for deletion.
//  * @param {string} adminId - The ID of the admin user performing the deletion, to exclude from deletion.
//  * @returns {Promise<Object|ErrorHandler>} Returns an object containing:
//  *   - usersDeleted: The result of the deleteMany Prisma operation (includes count).
//  *   - meta: An object containing totalCount (remaining users), totalDelete (number deleted), and totalSearch (number matched by filter).
//  *   Returns an ErrorHandler instance if an error occurs.
//  *
//  * @throws {ErrorHandler} Throws an error if deletion or counting users fails.
//  */
// export const removeAllUsers = async (searchFilter, adminId) => {
// 	try {
// 		const usersDeleted = await prisma.user.deleteMany({
// 			where: {
// 				...searchFilter,
// 				NOT: { id: adminId },
// 			},
// 		});

// 		if (usersDeleted.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				usersDeleted.error,
// 				'Cannot remove all users for database ' +
// 					usersDeleted.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.user.count();

// 		const meta = {
// 			totalCount: totalCount,
// 			totalDelete: usersDeleted.count,
// 			totalSearch: searchFilter ? usersDeleted.count : 0,
// 		};

// 		return { usersDeleted: usersDeleted, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Delete Users By Filter'
// 				: error,
// 			'Failed to remove all users',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };
// //*====================================================={ ADMIN }================================================================//

// //*======================================={Users Public Route}==============================================

// /**
//  * @function findAllUsers
//  * @description Retrieves a paginated list of users based on filtering criteria and sorting options, omitting sensitive or unnecessary fields.
//  * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
//  * @param {Object} searchFilter - Filtering conditions for the user query (supports logical OR operations).
//  * @param {Object} orderBy - Criteria to sort the results.
//  * @returns {Promise<Object>} An object containing the fetched users and metadata, or an error if the operation fails.
//  */
// export const findAllUsers = async (pagination, searchFilter, orderBy) => {
// 	try {
// 		const { page, limit, offset } = pagination;

// 		const users = await prisma.user.findMany({
// 			where: searchFilter,
// 			omit: {
// 				suitcases: true,
// 				bags: true,
// 				items: true,
// 				account: true,
// 				password: true,
// 				passwordChangeAt: true,
// 			},
// 			skip: offset,
// 			take: limit,
// 			orderBy: orderBy,
// 		});

// 		if (!users)
// 			return new ErrorHandler(
// 				'user',
// 				'No users found',
// 				'No users found in the database',
// 				statusCode.notFoundCode
// 			);

// 		if (users.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				'No users found ' + users.error,
// 				'No users found in the database ' + users.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalUsers = await prisma.user.count({
// 			where: { isActive: true },
// 		});

// 		if (totalUsers.error)
// 			return new ErrorHandler(
// 				'Total users null',
// 				'No users found' || totalUsers.error,
// 				'No users found in the database',
// 				statusCode.internalServerErrorCode
// 			);

// 		const meta = {
// 			totalCount: totalUsers,
// 			totalFind: users.length,
// 			page: page,
// 			limit: limit,
// 			searchFilter: searchFilter,
// 			orderBy: orderBy,
// 		};

// 		return { users: users, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch error',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Users By Search'
// 				: error,
// 			'Failed to get all users',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function findUserPublicProfile
//  * @description Retrieves the public profile of a specific user based on their ID, ensuring the user is active.
//  * @param {string} userId - The ID of the user whose public profile is being retrieved.
//  * @returns {Promise<Object>} The public profile details of the user, or an error if the operation fails.
//  */
// export const findUserPublicProfile = async (userId) => {
// 	try {
// 		const user = await prisma.user.findUnique({
// 			where: {
// 				id: userId,
// 				AND: {
// 					isActive: true, // Only return active users
// 				},
// 			},
// 			select: {
// 				id: true,
// 				firstName: true,
// 				lastName: true,
// 				displayName: true,
// 				email: true,
// 				gender: true,
// 				birth: true,
// 				age: true,
// 				country: true,
// 				city: true,
// 				profilePicture: true,
// 				defaultProfilePicture: true,
// 			},
// 		});

// 		if (!user)
// 			return new ErrorHandler(
// 				'user',
// 				'User not found',
// 				'User not found in the database',
// 				statusCode.notFoundCode
// 			);

// 		if (user.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				'something went wrong ' + user.error,
// 				'User not found in the database ' + user.error.message
// 			);

// 		return user;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting User By Id'
// 				: error,
// 			'Failed to get user public profile',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// //*======================================={Users Public Route}==============================================

// //*======================================={Users ME Route}==============================================

// /**
//  * Authenticates and retrieves a user's profile from the database, including enriched metadata.
//  *
//  * This service:
//  * - Fetches the user by ID with related data: account, items, bags, and suitcases.
//  * - Excludes sensitive fields: `password`, `passwordChangeAt`, and `role`.
//  * - Adds `itemCount` to each bag and suitcase.
//  * - Aggregates overall statistics:
//  *   - `totalItemsInBags`: Total items across all bags.
//  *   - `totalItemsInSuitcases`: Total items across all suitcases.
//  *   - `stuffStates`: Global counts of items, bags, and suitcases.
//  *
//  * If the user is not found or an error occurs, returns a custom `ErrorHandler` instance.
//  *
//  * @param {string} userId - Unique identifier of the user.
//  * @returns {Promise<{
//  *   profile: {
//  *     user: object,
//  *     account: object,
//  *     suitcases: object[],
//  *     bags: object[],
//  *     items: object[],
//  *   },
//  *   meta: {
//  *     totalItemsInBags: number,
//  *     totalItemsInSuitcases: number,
//  *     stuffStates: { items: number, bags: number, suitcases: number }
//  *   }
//  * } | ErrorHandler>} - On success, returns enriched user data and stats; on failure, returns an error handler.
//  */
// export const authUser = async (userId) => {
// 	try {
// 		// Fetch user by ID, including associated account, bags, suitcases, and items
// 		const data = await prisma.user.findUnique({
// 			where: { id: userId },
// 			include: {
// 				account: true,
// 				suitcases: {
// 					include: {
// 						suitcaseItems: {
// 							include: { item: true },
// 						},
// 						// Count items in each suitcase
// 						_count: { select: { suitcaseItems: true } },
// 					},
// 				},
// 				bags: {
// 					include: {
// 						bagItems: {
// 							include: { item: true },
// 						},
// 						// Count items in each bag
// 						_count: { select: { bagItems: true } },
// 					},
// 				},
// 				items: {
// 					include: {
// 						bagItems: true,
// 						suitcaseItems: true,
// 					},
// 				},
// 				// Global counts for metadata
// 				_count: {
// 					select: {
// 						bags: true,
// 						suitcases: true,
// 						items: true,
// 					},
// 				},
// 			},
// 			// Omit sensitive fields
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				role: true,
// 			},
// 		});

// 		// If no user found, return 404 error
// 		if (!data) {
// 			return new ErrorHandler(
// 				'User Not Found',
// 				"User doesn't exist in the database",
// 				'User must exist to authenticate',
// 				statusCode.notFoundCode
// 			);
// 		}

// 		// Handle unexpected Prisma structure errors (just in case)
// 		if (data.error) {
// 			return new ErrorHandler(
// 				'Prisma Error',
// 				data.error,
// 				'Error occurred while authenticating user: ' +
// 					data.error.message,
// 				statusCode.internalServerErrorCode
// 			);
// 		}

// 		// Add `itemCount` to each bag
// 		const cleanedBags = data.bags.map((bag) => ({
// 			...bag,
// 			itemCount: bag._count.bagItems,
// 		}));

// 		// Add `itemCount` to each suitcase
// 		const cleanedSuitcases = data.suitcases.map((suitcase) => ({
// 			...suitcase,
// 			itemCount: suitcase._count.suitcaseItems,
// 		}));

// 		// Calculate total number of items in bags
// 		const totalItemsInBags = cleanedBags.reduce(
// 			(acc, bag) => acc + bag.itemCount,
// 			0
// 		);

// 		// Calculate total number of items in suitcases
// 		const totalItemsInSuitcases = cleanedSuitcases.reduce(
// 			(acc, suitcase) => acc + suitcase.itemCount,
// 			0
// 		);

// 		// Destructure sensitive/internal fields before returning
// 		const { account, suitcases, bags, items, _count, ...user } = data;

// 		// Return enriched profile and summary metadata
// 		return {
// 			profile: {
// 				user,
// 				account,
// 				suitcases: cleanedSuitcases,
// 				bags: cleanedBags,
// 				items,
// 			},
// 			meta: {
// 				totalItemsInBags,
// 				totalItemsInSuitcases,
// 				stuffStates: _count,
// 			},
// 		};
// 	} catch (error) {
// 		// Handle runtime or unexpected failures
// 		return new ErrorHandler(
// 			'Runtime Error',
// 			Object.keys(error).length === 0 ? 'Unknown error' : error,
// 			'Failed to authenticate user',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Updates the user's password.
//  *
//  * @description This function verifies the user's current password and updates it to a new one. The new password must match the confirmation password. The update is saved in the database, and the user is notified of the change.
//  *
//  * @param {string} userId - The ID of the user whose password is being updated.
//  * @param {Object} body - The request body containing the current password, new password, and confirmation.
//  * @param {string} body.currentPassword - The current password of the user.
//  * @param {string} body.newPassword - The new password to be set.
//  * @param {string} body.confirmPassword - The confirmation of the new password.
//  *
//  * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
//  */
// export const updateUserPassword = async (userId, body) => {
// 	try {
// 		const { currentPassword, newPassword, confirmPassword } = body;

// 		const userPassword = await prisma.user.findUnique({
// 			where: { id: userId },
// 			select: {
// 				password: true,
// 				passwordChangeAt: true,
// 			},
// 		});

// 		if (!userPassword)
// 			return new ErrorHandler(
// 				'user is null',
// 				'User not found',
// 				'User Not Signing Up',
// 				statusCode.notFoundCode
// 			);

// 		if (userPassword.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userPassword.error,
// 				'User Not Signing Up ' + userPassword.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const isMatch = await verifyPassword(
// 			currentPassword,
// 			userPassword.password
// 		);

// 		if (!isMatch)
// 			return new ErrorHandler(
// 				'password',
// 				'password is not correct',
// 				'Incorrect password',
// 				statusCode.badRequestCode
// 			);

// 		if (newPassword !== confirmPassword)
// 			return new ErrorHandler(
// 				'password',
// 				'password is not the same in Confirm Password',
// 				'Enter the same password in Confirm Password',
// 				statusCode.badRequestCode
// 			);

// 		const hashedPassword = await hashingPassword(newPassword);

// 		const updatePassword = await prisma.user.update({
// 			where: { id: userId },
// 			data: {
// 				password: hashedPassword,
// 				passwordChangeAt: passwordChangeAt(),
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				isActive: true,
// 				role: true,
// 			},
// 		});

// 		if (!updatePassword)
// 			return new ErrorHandler(
// 				'update password is null',
// 				"Couldn't update password",
// 				'Failed to update user password',
// 				statusCode.notFoundCode
// 			);

// 		if (updatePassword.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updatePassword.error,
// 				'Failed to update user password ' +
// 					updatePassword.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return updatePassword;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Update Your Password'
// 				: error,
// 			'Failed to update user password',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Updates the user's profile data.
//  *
//  * @description This function allows users to update their profile information, including their name, gender, birth date, country, city, and profile picture. It ensures the data is validated before updating.
//  *
//  * @param {string} userId - The ID of the user whose data is being updated.
//  * @param {Object} body - The request body containing the updated user data.
//  * @param {string} body.firstName - The updated first name of the user.
//  * @param {string} body.lastName - The updated last name of the user.
//  * @param {string} body.gender - The updated gender of the user.
//  * @param {string} body.birth - The updated birth date of the user.
//  * @param {string} body.country - The updated country of the user.
//  * @param {string} body.city - The updated city of the user.
//  * @param {string} body.profilePicture - The updated profile picture URL of the user.
//  *
//  * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
//  */
// export const updateUserData = async (userId, body) => {
// 	try {
// 		const {
// 			firstName,
// 			lastName,
// 			gender,
// 			birth,
// 			country,
// 			city,
// 			profilePicture,
// 		} = body;

// 		const updatedUserData = await prisma.user.update({
// 			where: { id: userId },
// 			data: {
// 				firstName: firstName || undefined,
// 				lastName: lastName || undefined,
// 				gender: gender || undefined,
// 				birth: birthOfDate(birth),
// 				country: country || undefined,
// 				city: city || undefined,
// 				profilePicture: haveProfilePicture(profilePicture),
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				isActive: true,
// 				role: true,
// 			},
// 		});

// 		if (!updatedUserData)
// 			return new ErrorHandler(
// 				'updateUserData is null',
// 				"Couldn't update user data",
// 				'Failed to update user data',
// 				statusCode.notFoundCode
// 			);

// 		if (updatedUserData.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updatedUserData.error,
// 				'Failed to update user data ' + updatedUserData.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return updatedUserData;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Update Your Info'
// 				: error,
// 			'Failed to update user data'
// 		);
// 	}
// };

// /**
//  * Changes the email address of a user.
//  *
//  * @description This function allows the user to change their email address. It first checks if the new email is already in use, then sends an email verification link to the new address.
//  *
//  * @param {string} userId - The ID of the user whose email is being changed.
//  * @param {string} email - The new email address to be set.
//  *
//  * @returns {Object|ErrorHandler} - Returns the verification token and user details or an ErrorHandler instance if an error occurs.
//  */
// export const changeUserEmail = async (userId, email) => {
// 	try {
// 		//* check if email is never use before
// 		const user = await prisma.user.findUnique({ where: { email: email } });

// 		if (user)
// 			return new ErrorHandler(
// 				'User Email Error',
// 				'Error Duplicate Unique Field',
// 				'That Email is Already Exists',
// 				statusCode.badRequestCode
// 			);

// 		const { token, hashToken } = generateCryptoHashToken();

// 		const userToken = await prisma.userToken.create({
// 			data: {
// 				userId,
// 				type: 'CHANGE_EMAIL',
// 				hashToken,
// 				expiresAt: setExpiredAt('change'),
// 			},
// 		});

// 		if (!userToken)
// 			return new ErrorHandler(
// 				'userToken is null',
// 				"Couldn't update user",
// 				'Failed to change user email',
// 				statusCode.notFoundCode
// 			);

// 		if (userToken.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userToken.error,
// 				'Failed to change user email ' + userToken.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const updateEmail = await prisma.user.update({
// 			where: { id: userId },
// 			data: {
// 				email: email,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				isActive: true,
// 				role: true,
// 			},
// 		});

// 		if (!updateEmail)
// 			return new ErrorHandler(
// 				'updateEmail is null',
// 				"Couldn't update user",
// 				'Failed to change user email',
// 				statusCode.notFoundCode
// 			);

// 		if (updateEmail.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updateEmail.error,
// 				'Failed to change user email ' + updateEmail.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return {
// 			token: token,
// 			userName: updateEmail.displayName,
// 			userEmail: updateEmail.email,
// 		};
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Change Your Email'
// 				: error,
// 			'Failed to change user email',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Sends a verification email to the user for email verification.
//  *
//  * @description This function sends a verification email to the user after they initiate the email change process. The email contains a token that the user can use to verify the new email address.
//  *
//  * @param {string} email - The email address of the user requesting email verification.
//  *
//  * @returns {Object|ErrorHandler} - Returns a token and the user's name for email verification or an ErrorHandler instance if an error occurs.
//  */
// export const sendVerificationUserEmail = async (email) => {
// 	try {
// 		const user = await prisma.user.findUnique({ where: { email: email } });

// 		if (!user)
// 			return new ErrorHandler(
// 				'user',
// 				'There is no user with that email',
// 				'User not found',
// 				statusCode.notFoundCode
// 			);

// 		if (user.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				user.error,
// 				'User not found ' + user.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const { token, hashToken } = generateCryptoHashToken();

// 		const userToken = await prisma.userToken.create({
// 			data: {
// 				userId: user.id,
// 				type: 'EMAIL_VERIFICATION',
// 				hashToken: hashToken,
// 				expiresAt: setExpiredAt('verify'),
// 			},
// 		});

// 		if (!userToken)
// 			return new ErrorHandler(
// 				'userToken is null',
// 				"Couldn't update user",
// 				'Failed to update user',
// 				statusCode.notFoundCode
// 			);

// 		if (userToken.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userToken.error,
// 				'Failed to update user ' + userToken.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return { token, userName: user.displayName };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Sending Verification Email'
// 				: error,
// 			'Failed to verify user email',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Retrieves the permissions associated with a user role.
//  *
//  * @description This function fetches the permissions tied to a specific role (such as Admin, Member, etc.) from the database. It returns a list of permissions that dictate the actions allowed for users of that role.
//  *
//  * @param {string} userRole - The role of the user (e.g., "Admin", "Member").
//  *
//  * @returns {Object|ErrorHandler} - Returns the permissions associated with the user's role or an ErrorHandler instance if an error occurs.
//  */
// export const getUserPermissions = async (userRole) => {
// 	try {
// 		const userPermissions = await prisma.roleOnPermission.findMany({
// 			where: { role: userRole },
// 			include: {
// 				permission: true,
// 			},
// 		});

// 		if (!userPermissions)
// 			return new ErrorHandler(
// 				'userPermissions is null',
// 				"Couldn't get user permissions",
// 				'Failed to get user permissions',
// 				statusCode.notFoundCode
// 			);

// 		if (userPermissions.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userPermissions.error,
// 				'Failed to get user permissions ' +
// 					userPermissions.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalPermissions = await prisma.roleOnPermission.count({
// 			where: { role: userRole },
// 		});

// 		const meta = {
// 			totalPermissions: totalPermissions,
// 			role: userRole,
// 		};

// 		return { permissions: userPermissions, meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Get User Permissions'
// 				: error,
// 			'Failed to get user permissions',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Deactivates a user's account.
//  *
//  * @description This function disables a user's account, preventing them from logging in or accessing the system. It can be used when a user requests to deactivate their account or when a system administrator disables an account.
//  *
//  * @param {string} userId - The ID of the user whose account is to be deactivated.
//  *
//  * @returns {Object|ErrorHandler} - Returns the deactivated user data or an ErrorHandler instance if an error occurs.
//  */
// export const deactivateUserAccount = async (userId) => {
// 	try {
// 		const deactivateUser = await prisma.user.update({
// 			where: { id: userId },
// 			data: {
// 				isActive: false,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				role: true,
// 			},
// 		});

// 		if (!deactivateUser)
// 			return new ErrorHandler(
// 				'deactivateUser is null',
// 				"Couldn't deactivate user",
// 				'Failed to deactivate User Account',
// 				statusCode.notFoundCode
// 			);

// 		if (deactivateUser.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				deactivateUser.error,
// 				'Failed to deactivate user ' + deactivateUser.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return deactivateUser;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			"Couldn't deactivate",
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Deactivate Your Account'
// 				: error,
// 			'Failed to deactivate User Account',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// //*======================================={Users ME Route}==============================================
