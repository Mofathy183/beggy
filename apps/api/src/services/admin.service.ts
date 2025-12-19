import prisma from '../../prisma/prisma.js';
import type { PrismaClient } from '../generated/client/index.js';
import { birthOfDate, haveProfilePicture } from '../utils/userHelper.js';
import { hashingPassword } from '../utils/hash.js';
import { ErrorHandler } from '../utils/error.js';
import { statusCode } from '../config/status.js';
import { id } from 'date-fns/locale';

/**
 * @function addUser
 * @description Creates a new user with the provided details, including password hashing and validation.
 * @param {Object} body - The input details of the user.
 * @param {string} body.firstName - The first name of the user.
 * @param {string} body.lastName - The last name of the user.
 * @param {string} body.email - The email of the user.
 * @param {string} body.password - The password of the user.
 * @param {string} body.confirmPassword - The confirmation password of the user.
 * @param {string} body.gender - The gender of the user.
 * @param {Date} body.birth - The date of birth of the user.
 * @param {string} body.country - The country of residence of the user.
 * @param {string} body.city - The city of residence of the user.
 * @param {string} [body.profilePicture] - Optional profile picture URL of the user.
 * @returns {Promise<Object>} The newly created user and metadata, or an error if the operation fails.
 */
export const addUser = async (body) => {
	try {
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			gender,
			birth,
			country,
			city,
			profilePicture,
		} = body;

		// Hashing the password
		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password',
				statusCode.badRequestCode
			);

		const hashPassword = await hashingPassword(password);

		// Create new user in Prisma
		const newUser = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashPassword,
				gender: gender,
				birth: birthOfDate(birth),
				country,
				city,
				profilePicture: haveProfilePicture(profilePicture),
			},
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				role: true,
				isActive: true,
			},
		});

		if (!newUser)
			return new ErrorHandler(
				'user error',
				'No user created',
				'Failed to create user',
				statusCode.notFoundCode
			);

		if (newUser.error)
			return new ErrorHandler(
				'prisma',
				newUser.error,
				'User already exists ' + newUser.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalCreate: newUser ? 1 : 0,
		};

		return { newUser, meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Create User'
				: error,
			'Failed to create user',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function getUserById
 * @description Retrieves a user's information based on their ID, including associated suitcases, bags, items, and account details.
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user's details, or an error if the operation fails.
 */
export const getUserById = async (userId) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
			},
		});

		if (!user)
			return new ErrorHandler(
				'User null',
				'User not found',
				'There is no user with that id',
				statusCode.notFoundCode
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message,
				statusCode.internalServerErrorCode
			);

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Fine User By Id'
				: error,
			'Failed to get user by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function getAllUsers
 * @description Fetches a list of users based on filtering criteria, pagination, and sorting options. Includes associated suitcases, bags, items, and account details.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} searchFilter - Filtering conditions for the user query (supports logical OR operations).
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the fetched users and metadata, or an error if the operation fails.
 */
export const getAllUsers = async (pagination, searchFilter, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await prisma.user.findMany({
			where: searchFilter,
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
			},
			skip: offset,
			take: limit,
			orderBy: orderBy,
		});

		if (!users)
			return new ErrorHandler(
				'user',
				'No users found',
				'No users found in the database',
				statusCode.notFoundCode
			);

		if (users.error)
			return new ErrorHandler(
				'prisma',
				'No users found ' + users.error,
				'No users found in the database ' + users.error.message,
				statusCode.internalServerErrorCode
			);

		const totalUsers = await prisma.user.count({
			where: { isActive: true },
		});

		if (totalUsers.error)
			return new ErrorHandler(
				'Total users null',
				'No users found' || totalUsers.error,
				'No users found in the database',
				statusCode.internalServerErrorCode
			);

		const meta = {
			totalCount: totalUsers,
			totalFind: users.length,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { users: users, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Fine All Users'
				: error,
			'Failed to get all users',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function changeUserRole
 * @description Updates the role of a specific user in the database.
 * @param {string} id - The ID of the user whose role will be updated.
 * @param {Object} body - The request body containing the new role.
 * @param {string} body.role - The new role for the user.
 * @returns {Promise<Object>} The updated user details, or an error if the operation fails.
 */
export const changeUserRole = async (id, body) => {
	try {
		const { role } = body;

		const updatedUser = await prisma.user.update({
			where: { id: id },
			data: {
				role: role,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				isActive: true,
			},
		});

		if (!updatedUser)
			return new ErrorHandler(
				'User null',
				'User Cannot be modified',
				'There is no user with that id to modify',
				statusCode.notFoundCode
			);

		if (updatedUser.error)
			return new ErrorHandler(
				'prisma',
				updatedUser.error,
				'User cannot be modified ' + updatedUser.error.message,
				statusCode.internalServerErrorCode
			);

		return updatedUser;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Change User Role'
				: error,
			'Failed to modify user by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeUser
 * @description Deletes a specific user from the database identified by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<Object>} An object containing the deleted user details and metadata, or an error if the operation fails.
 */
export const removeUser = async (userId) => {
	try {
		const userDeleted = await prisma.user.delete({
			where: { id: userId },
			omit: {
				password: true,
				passwordChangeAt: true,
				role: true,
				isActive: true,
			},
		});

		if (!userDeleted)
			return new ErrorHandler(
				'Delete null zero',
				'User cannot be deleted',
				'There is no user with that id to delete',
				statusCode.notFoundCode
			);

		if (userDeleted.error)
			return new ErrorHandler(
				'prisma',
				userDeleted.error,
				'User cannot be deleted for database ' +
					userDeleted.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: userDeleted ? 1 : 0,
		};

		return { userDeleted: userDeleted, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Delete User'
				: error,
			'Failed to remove user by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Remove multiple users from the database based on a filter,
 * excluding the user with the given admin ID to prevent self-deletion.
 *
 * @param {Object} searchFilter - The filter criteria to select users for deletion.
 * @param {string} adminId - The ID of the admin user performing the deletion, to exclude from deletion.
 * @returns {Promise<Object|ErrorHandler>} Returns an object containing:
 *   - usersDeleted: The result of the deleteMany Prisma operation (includes count).
 *   - meta: An object containing totalCount (remaining users), totalDelete (number deleted), and totalSearch (number matched by filter).
 *   Returns an ErrorHandler instance if an error occurs.
 *
 * @throws {ErrorHandler} Throws an error if deletion or counting users fails.
 */
export const removeAllUsers = async (searchFilter, adminId) => {
	try {
		const usersDeleted = await prisma.user.deleteMany({
			where: {
				...searchFilter,
				NOT: { id: adminId },
			},
		});

		if (usersDeleted.error)
			return new ErrorHandler(
				'prisma',
				usersDeleted.error,
				'Cannot remove all users for database ' +
					usersDeleted.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: usersDeleted.count,
			totalSearch: searchFilter ? usersDeleted.count : 0,
		};

		return { usersDeleted: usersDeleted, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			Object.keys(error).length === 0
				? 'Error Occur while Delete Users By Filter'
				: error,
			'Failed to remove all users',
			statusCode.internalServerErrorCode
		);
	}
};
