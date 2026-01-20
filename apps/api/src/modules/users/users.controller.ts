import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@prisma';
import { UserService, UserMapper } from '@modules/users';
import type { User, UserOrderByInput } from '@beggy/shared/types';
import { apiResponseMap } from '@shared/utils';
import type { PaginationPayload } from '@shared/types';

const userService = new UserService(prisma);

export const getUsers = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	const { pagination, orderBy, query: filter } = req;

	const { users, meta } = await userService.listUsers(
		pagination as PaginationPayload,
		filter,
		orderBy as UserOrderByInput
	);

	const userResponse = users.map(() => UserMapper.fromPrisma);

	res.json(apiResponseMap.ok<User[]>(userResponse, 'LOGIN_SUCCESS', meta));
};

// 	try {
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userRole, userId } = req.session;

// 		const user = await addUser(body);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to create user',
// 					'Failed to create',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					"Error Couldn't create user " + user.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { newUser, meta } = user;

// 		if (!newUser) {
// 			return next(
// 				new ErrorResponse(
// 					'User already exists',
// 					"Couldn't add user",
// 					statusCode.badRequestCode
// 				)
// 			);
// 		}

// 		if (newUser.error) {
// 			return next(
// 				new ErrorResponse(
// 					newUser.error,
// 					'Invalid user data ' + newUser.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);
// 		}

// 		//* for add the user id to session
// 		storeSession(userId, userRole, req);

// 		sendCookies(userId, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.createdCode,
// 				'User Created Successfully',
// 				newUser,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Creating User'
// 					: error,
// 				'Failed to create user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const findUserById = async (req, res, next) => {
// 	try {
// 		const { id } = req.params;

// 		const { userRole, userId } = req.session;

// 		const user = await getUserById(id);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'User not found',
// 					"Couldn't find user by this id",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					"Couldn't find user by this id " + user.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'User Found Successfully',
// 				user
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Fine User By Id'
// 					: error,
// 				'Failed to find user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const findAllUsers = async (req, res, next) => {
// 	try {
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const { userRole, userId } = req.session;

// 		const AllUser = await getAllUsers(pagination, searchFilter, orderBy);

// 		if (sendServiceResponse(next, AllUser)) return;

// 		if (!AllUser)
// 			return next(
// 				new ErrorResponse(
// 					'No users found',
// 					"Couldn't find any users",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (AllUser.error)
// 			return next(
// 				new ErrorResponse(
// 					AllUser.error,
// 					"Couldn't find all users " + AllUser.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		const { users, meta } = AllUser;

// 		if (!users)
// 			return next(
// 				new ErrorResponse(
// 					'No users found',
// 					"Couldn't find any users",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (users.error)
// 			return next(
// 				new ErrorResponse(
// 					users.error,
// 					"Couldn't find all users " + users.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Users Found Successfully${searchFilter ? ' By Search' : ''}`,
// 				users,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Fine All Users'
// 					: error,
// 				'Failed to find all users',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const changeUserRoleById = async (req, res, next) => {
// 	try {
// 		const { id } = req.params;

// 		const { body } = req as Request<{}, {}, any>;

// 		const { userRole, userId } = req.session;

// 		const updatedUser = await changeUserRole(id, body);

// 		if (sendServiceResponse(next, updatedUser)) return;

// 		if (!updatedUser)
// 			return next(
// 				new ErrorResponse(
// 					'User not found',
// 					"Couldn't modify user by this id",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (updatedUser.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedUser.error,
// 					"Couldn't modify user by this id " +
// 						updatedUser.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Change User Role Successfully',
// 				updatedUser
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Change User Role'
// 					: error,
// 				'Failed to modify user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteUserById = async (req, res, next) => {
// 	try {
// 		const { id } = req.params;

// 		const { userRole, userId } = req.session;

// 		const removingUser = await removeUser(id);

// 		if (sendServiceResponse(next, removingUser)) return;

// 		const { userDeleted, meta } = removingUser;

// 		if (!userDeleted)
// 			return next(
// 				new ErrorResponse(
// 					'User not found',
// 					"Couldn't find user by this id",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (userDeleted.error)
// 			return next(
// 				new ErrorResponse(
// 					userDeleted.error,
// 					"Couldn't delete user by this id " +
// 						userDeleted.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'User Deleted Successfully',
// 				userDeleted,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Delete User'
// 					: error,
// 				'Failed to delete user by id',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deleteAllUsers = async (req, res, next) => {
// 	try {
// 		const { searchFilter = undefined } = req;

// 		const { userRole, userId } = req.session;

// 		const removeUsers = await removeAllUsers(searchFilter, userId);

// 		if (sendServiceResponse(next, removeUsers)) return;

// 		const { usersDeleted, meta } = removeUsers;

// 		if (usersDeleted.error)
// 			return next(
// 				new ErrorResponse(
// 					usersDeleted.error,
// 					"Couldn't delete all users " + usersDeleted.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`All Users Are Deleted Successfully${searchFilter ? ' By Search Filter' : ''}`,
// 				usersDeleted,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Delete Users By Filter'
// 					: error,
// 				'Failed to delete all users',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };
// //*====================================================={ ADMIN }================================================================//

// //*======================================={Users Public Route}==============================================

// export const getAllUsers = async (req, res, next) => {
// 	try {
// 		const {
// 			searchFilter = undefined,
// 			pagination,
// 			orderBy = undefined,
// 		} = req;

// 		const allUsers = await findAllUsers(pagination, searchFilter, orderBy);

// 		if (sendServiceResponse(next, allUsers)) return;

// 		const { users, meta } = allUsers;

// 		if (users.error)
// 			return next(
// 				new ErrorResponse(
// 					"Couldn't find all users " + users.error,
// 					"Couldn't find all users " + users.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				`Users Found Successfully${searchFilter ? ' By Search' : ''}`,
// 				users,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting Users By Search'
// 					: error,
// 				'Failed to find all users',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const getUserPublicProfile = async (req, res, next) => {
// 	try {
// 		const { id } = req.params;

// 		const user = await findUserPublicProfile(id);

// 		if (sendServiceResponse(next, user)) return;

// 		if (!user)
// 			return next(
// 				new ErrorResponse(
// 					'User not found',
// 					"Couldn't find user by this id",
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (user.error)
// 			return next(
// 				new ErrorResponse(
// 					user.error,
// 					"Couldn't find user by this id " + user.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'User Retrieved By Its ID Successfully',
// 				user
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Getting User By Id'
// 					: error,
// 				'Failed to retrieve public user profile',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Users Public Route}==============================================

// //*======================================={Users ME Route}==============================================

// export const authMe = async (req, res, next) => {
// 	try {
// 		// Destructure user ID and role from the session
// 		const { userId, userRole } = req.session;

// 		// Attempt to authenticate the user by ID
// 		const me = await authUser(userId);

// 		if (sendServiceResponse(next, me)) return;

// 		const { profile, meta } = me;

// 		// If no user is returned, forward a not found error
// 		if (!profile) {
// 			return next(
// 				new ErrorResponse(
// 					'User Not Found',
// 					'User must exist to authenticate',
// 					statusCode.notFoundCode
// 				)
// 			);
// 		}

// 		// If user has an embedded error (e.g., from authUser), forward a bad request error
// 		if (profile.error) {
// 			return next(
// 				new ErrorResponse(
// 					profile.error,
// 					'Error occurred while authenticating user',
// 					statusCode.badRequestCode
// 				)
// 			);
// 		}

// 		// Send cookies and update session with user info
// 		sendCookies(userId, res);
// 		storeSession(userId, userRole, req);

// 		// Return a success response with the user data
// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				"You've Authenticated Successfully",
// 				profile,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		// Catch unexpected errors and forward an internal server error response
// 		next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Authenticating You'
// 					: error,
// 				'Failed to authenticate user',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const updatePassword = async (req, res, next) => {
// 	try {
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		const updatePassword = await updateUserPassword(userId, body);

// 		if (sendServiceResponse(next, updatePassword)) return;

// 		if (!updatePassword)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to update password',
// 					'Failed to update',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (updatePassword.error)
// 			return next(
// 				new ErrorResponse(
// 					updatePassword.error,
// 					"Error Couldn't update password " +
// 						updatePassword.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		//* store user id and role in session
// 		storeSession(userId, userRole, req);

// 		//* Log the user in and send JWT token via cookie
// 		sendCookies(userId, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Password changed successfully',
// 				'Your password has been updated.'
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'An error occurred while changing your password.'
// 					: error,
// 				'Unable to change password',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const updateData = async (req, res, next) => {
// 	try {
// 		const { body } = req as Request<{}, {}, any>;
// 		const { userId, userRole } = req.session;

// 		const updatedUserData = await updateUserData(userId, body);

// 		if (sendServiceResponse(next, updatedUserData)) return;

// 		if (!updatedUserData)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to update user data',
// 					'Failed to update',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (updatedUserData.error)
// 			return next(
// 				new ErrorResponse(
// 					updatedUserData.error,
// 					"Error Couldn't update user data " +
// 						updatedUserData.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		//* store user id and role in session
// 		storeSession(userId, userRole, req);

// 		//* Log the user in and send JWT token via cookie
// 		sendCookies(userId, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Profile updated successfully',
// 				'Your profile information has been updated.'
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'An error occurred while updating your profile.'
// 					: error,
// 				'Unable to update profile',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const changeEmail = async (req, res, next) => {
// 	try {
// 		const { email } = req.body;

// 		const { userId, userRole } = req.session;

// 		const updateEmail = await changeUserEmail(userId, email);

// 		if (sendServiceResponse(next, updateEmail)) return;

// 		if (!updateEmail)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to change user email',
// 					'Failed to update',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (updateEmail.error)
// 			return next(
// 				new ErrorResponse(
// 					updateEmail.error,
// 					"Error Couldn't change user email " +
// 						updateEmail.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { token, userEmail, userName } = updateEmail;

// 		if (!token || !userEmail || !userName)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to change user email',
// 					'Failed to generate token and get user email and name',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const verifyEmailURL = `${req.protocol}://${req.get('host') || 'localhost'}${verifyEmailUrl}?token=${token}type=change_email`;

// 		const sended = await sendEmail(
// 			verifyEmailURL,
// 			userName,
// 			userEmail,
// 			'verify-email',
// 			'verify',
// 			'change_email'
// 		);

// 		if (sended.error)
// 			return next(
// 				new ErrorResponse(
// 					sended.error,
// 					'Failed to send verification email ' + sended.error.message,
// 					statusCode.internalServerErrorCode
// 				)
// 			);

// 		storeSession(userId, userRole, req);

// 		sendCookies(userId, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Updated Your Email',
// 				'Check your email inbox to verify your email',
// 				sended
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Change Your Email'
// 					: error,
// 				'Failed to change user email',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const sendVerificationEmail = async (req, res, next) => {
// 	try {
// 		const { email } = req.body;

// 		const userToken = await sendVerificationUserEmail(email);

// 		if (sendServiceResponse(next, userToken)) return;

// 		if (!userToken)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to send verification email',
// 					'Failed to update',
// 					statusCode.badRequestCode
// 				)
// 			);

// 		if (userToken.error)
// 			return next(
// 				new ErrorResponse(
// 					userToken.error,
// 					"Error Couldn't send verification email " +
// 						userToken.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		const { token, userName } = userToken;

// 		const verifyEmailURL = `${req.protocol}://${req.get('host')}${verifyEmailUrl}?token=${token}type=email_verification`;

// 		const sended = await sendEmail(
// 			verifyEmailURL,
// 			userName,
// 			email,
// 			'verify-email',
// 			'verify'
// 		);

// 		if (sended.error)
// 			return new ErrorResponse(
// 				sended.error,
// 				'Failed to send verification email ' + sended.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Verification email send Successfully',
// 				'Check your email inbox to verify your email',
// 				sended
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Sending Verification Email'
// 					: error,
// 				'Failed to send verification email',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const permissions = async (req, res, next) => {
// 	try {
// 		const { userId, userRole } = req.session;

// 		const userPermissions = await getUserPermissions(userRole);

// 		if (sendServiceResponse(next, userPermissions)) return;

// 		const { permissions, meta } = userPermissions;

// 		if (!permissions)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to get user permissions',
// 					'Failed to get user permissions',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (permissions.error)
// 			return next(
// 				new ErrorResponse(
// 					permissions.error,
// 					'Failed to get user permissions' +
// 						permissions.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		storeSession(userId, userRole, req);

// 		sendCookies(userId, res);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Get User Permissions',
// 				permissions,
// 				meta
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Get User Permissions'
// 					: error,
// 				'Failed to get user permissions',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// export const deActivate = async (req, res, next) => {
// 	try {
// 		const { userId } = req.session;

// 		const deActivateUser = await deactivateUserAccount(userId);

// 		if (sendServiceResponse(next, deActivateUser)) return;

// 		if (!deActivateUser)
// 			return next(
// 				new ErrorResponse(
// 					'Failed to deactivate user account',
// 					'Failed to deactivate',
// 					statusCode.notFoundCode
// 				)
// 			);

// 		if (deActivateUser.error)
// 			return next(
// 				new ErrorResponse(
// 					deActivateUser.error,
// 					'Failed to deactivate ' + deActivateUser.error.message,
// 					statusCode.badRequestCode
// 				)
// 			);

// 		return next(
// 			new SuccessResponse(
// 				statusCode.okCode,
// 				'Successfully Deactivated User Account',
// 				'Your Account Deactivated Successfully'
// 			)
// 		);
// 	} catch (error) {
// 		return next(
// 			new ErrorResponse(
// 				Object.keys(error).length === 0
// 					? 'Error Occur while Deactivate Your Account'
// 					: error,
// 				'Failed to deactivate user account',
// 				statusCode.internalServerErrorCode
// 			)
// 		);
// 	}
// };

// //*======================================={Users ME Route}==============================================
