import {
	addUser,
	getUserById,
	getUserPublicProfile,
	getAllUsers,
	changeUserRole,
	removeUser,
	removeAllUsers,
} from '../../services/userService.js';
import { statusCode } from '../../config/status.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const createUser = async (req, res, next) => {
	try {
		const { body } = req;

		const { newUser, meta } = await addUser(body);

		if (!newUser) {
			return next(
				new ErrorResponse(
					'User already exists',
					"Couldn't add user",
					statusCode.badRequestCode
				)
			);
		}

		if (newUser.error) {
			return next(
				new ErrorResponse(
					newUser.error,
					'Invalid user data ' + newUser.error.message,
					statusCode.badRequestCode
				)
			);
		}

		return next(
			new SuccessResponse(
				statusCode.createdCode,
				'User Created Successfully',
				newUser,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to create user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const findUserPublicProfile = async (req, res, next) => {
	try {
		const { id } = req.params;

		const user = await getUserPublicProfile(id);

		if (!user)
			return next(
				new ErrorResponse(
					'User not found',
					"Couldn't find user by this id",
					statusCode.notFoundCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					"Couldn't find user by this id " + user.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Retrieved By Its ID Successfully',
				user
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to retrieve public user profile',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const findUserById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const user = await getUserById(id);

		if (!user)
			return next(
				new ErrorResponse(
					'User not found',
					"Couldn't find user by this id",
					statusCode.notFoundCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					"Couldn't find user by this id " + user.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Found Successfully',
				user
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to find user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const findAllUsers = async (req, res, next) => {
	try {
		const {
			searchFilter = undefined,
			pagination,
			orderBy = undefined,
		} = req;

		const { users, meta } = await getAllUsers(
			pagination,
			searchFilter,
			orderBy
		);

		if (!users)
			return next(
				new ErrorResponse(
					'No users found',
					"Couldn't find any users",
					statusCode.notFoundCode
				)
			);

		if (users.error)
			return next(
				new ErrorResponse(
					users.error,
					"Couldn't find all users " + users.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`Users Found Successfully${searchFilter ? ' By Search' : ''}`,
				users,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to find all users',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const changeUserRoleById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { body } = req;

		const updatedUser = await changeUserRole(id, body);

		if (!updatedUser)
			return next(
				new ErrorResponse(
					'User not found',
					"Couldn't modify user by this id",
					statusCode.notFoundCode
				)
			);

		if (updatedUser.error)
			return next(
				new ErrorResponse(
					updatedUser.error,
					"Couldn't modify user by this id " +
						updatedUser.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Change User Role Successfully',
				updatedUser
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to modify user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteUserById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { userDeleted, meta } = await removeUser(id);

		if (!userDeleted)
			return next(
				new ErrorResponse(
					'User not found',
					"Couldn't find user by this id",
					statusCode.notFoundCode
				)
			);

		if (userDeleted.error)
			return next(
				new ErrorResponse(
					userDeleted.error,
					"Couldn't delete user by this id " +
						userDeleted.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'User Deleted Successfully',
				userDeleted,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllUsers = async (req, res, next) => {
	try {
		const { usersDeleted, meta } = await removeAllUsers();

		if (usersDeleted.error)
			return next(
				new ErrorResponse(
					usersDeleted.error,
					"Couldn't delete all users " + usersDeleted.error.message,
					statusCode.internalServerErrorCode
				)
			);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'All Users Are Deleted Successfully',
				usersDeleted,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to delete all users',
				statusCode.internalServerErrorCode
			)
		);
	}
};
