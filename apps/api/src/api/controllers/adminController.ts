import {
	addUser,
	getUserById,
	getAllUsers,
	changeUserRole,
	removeUser,
	removeAllUsers,
} from '../../services/adminService.js';
import { statusCode } from '../../config/status.js';
import { ErrorResponse, sendServiceResponse } from '../../utils/error.js';
import { storeSession, sendCookies } from '../../utils/authHelper.js';
import SuccessResponse from '../../utils/successResponse.js';

export const createUser = async (req, res, next) => {
	try {
		const { body } = req as Request<{}, {}, any>;
		const { userRole, userId } = req.session;

		const user = await addUser(body);

		if (sendServiceResponse(next, user)) return;

		if (!user)
			return next(
				new ErrorResponse(
					'Failed to create user',
					'Failed to create',
					statusCode.badRequestCode
				)
			);

		if (user.error)
			return next(
				new ErrorResponse(
					user.error,
					"Error Couldn't create user " + user.error.message,
					statusCode.badRequestCode
				)
			);

		const { newUser, meta } = user;

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

		//* for add the user id to session
		storeSession(userId, userRole, req);

		sendCookies(userId, res);

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
				Object.keys(error).length === 0
					? 'Error Occur while Creating User'
					: error,
				'Failed to create user',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const findUserById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { userRole, userId } = req.session;

		const user = await getUserById(id);

		if (sendServiceResponse(next, user)) return;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Fine User By Id'
					: error,
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

		const { userRole, userId } = req.session;

		const AllUser = await getAllUsers(pagination, searchFilter, orderBy);

		if (sendServiceResponse(next, AllUser)) return;

		if (!AllUser)
			return next(
				new ErrorResponse(
					'No users found',
					"Couldn't find any users",
					statusCode.notFoundCode
				)
			);

		if (AllUser.error)
			return next(
				new ErrorResponse(
					AllUser.error,
					"Couldn't find all users " + AllUser.error.message,
					statusCode.internalServerErrorCode
				)
			);

		const { users, meta } = AllUser;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Fine All Users'
					: error,
				'Failed to find all users',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const changeUserRoleById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { body } = req as Request<{}, {}, any>;

		const { userRole, userId } = req.session;

		const updatedUser = await changeUserRole(id, body);

		if (sendServiceResponse(next, updatedUser)) return;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Change User Role'
					: error,
				'Failed to modify user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteUserById = async (req, res, next) => {
	try {
		const { id } = req.params;

		const { userRole, userId } = req.session;

		const removingUser = await removeUser(id);

		if (sendServiceResponse(next, removingUser)) return;

		const { userDeleted, meta } = removingUser;

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

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

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
				Object.keys(error).length === 0
					? 'Error Occur while Delete User'
					: error,
				'Failed to delete user by id',
				statusCode.internalServerErrorCode
			)
		);
	}
};

export const deleteAllUsers = async (req, res, next) => {
	try {
		const { searchFilter = undefined } = req;

		const { userRole, userId } = req.session;

		const removeUsers = await removeAllUsers(searchFilter, userId);

		if (sendServiceResponse(next, removeUsers)) return;

		const { usersDeleted, meta } = removeUsers;

		if (usersDeleted.error)
			return next(
				new ErrorResponse(
					usersDeleted.error,
					"Couldn't delete all users " + usersDeleted.error.message,
					statusCode.internalServerErrorCode
				)
			);

		sendCookies(userId, res);
		storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				`All Users Are Deleted Successfully${searchFilter ? ' By Search Filter' : ''}`,
				usersDeleted,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				Object.keys(error).length === 0
					? 'Error Occur while Delete Users By Filter'
					: error,
				'Failed to delete all users',
				statusCode.internalServerErrorCode
			)
		);
	}
};
