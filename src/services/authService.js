import { ErrorHandler } from '../utils/error.js';
import { hashingPassword, verifyPassword } from '../utils/hash.js';
import prisma from '../../prisma/prisma.js';
import { generateCryptoToken, generateCryptoHashToken } from '../utils/jwt.js';
import {
	setExpiredAt,
	passwordChangeAt,
	birthOfDate,
	haveProfilePicture,
} from '../utils/userHelper.js';
import { statusCode } from '../config/status.js';

/**
 * Signs up a new user.
 *
 * @description This function handles the user registration process. It takes user details from the request body, validates them, and creates a new user in the database. It also hashes the user's password before storing it and sends a confirmation email for verification.
 *
 * @param {Object} body - The request body containing user details.
 * @param {string} body.firstName - The first name of the user.
 * @param {string} body.lastName - The last name of the user.
 * @param {string} body.email - The email address of the user.
 * @param {string} body.password - The password for the user.
 * @param {string} body.confirmPassword - The confirmation of the user's password.
 *
 * @returns {Object|ErrorHandler} - Returns the role and safe user data or an ErrorHandler instance if an error occurs.
 */
export const singUpUser = async (body) => {
	try {
		const { firstName, lastName, email, password, confirmPassword } = body;

		// Hashing the password
		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'Password is not the same in Confirm Password',
				'Enter the same password in Confirm Password',
				statusCode.badRequestCode
			);
		const hashPassword = await hashingPassword(password);

		// Check if user email is unique
		const userEmail = await prisma.user.findUnique({
			where: { email },
		});

		if (userEmail)
			return new ErrorHandler(
				'User Email Error',
				'Error Duplicate Unique Field',
				'That Email is Already Exists',
				statusCode.badRequestCode
			);

		// Create new user in Prisma
		const newUser = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashPassword,
			},
		});

		if (!newUser)
			return new ErrorHandler(
				'User Not Found',
				"Could'\t Created user",
				'Failed to create user',
				statusCode.notFoundCode
			);

		if (newUser.error)
			return new ErrorHandler(
				'Database Error',
				newUser.error,
				'User already exists ' + newUser.error.message,
				statusCode.internalServerErrorCode
			);

		const { role, id } = newUser;

		return { role, id };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Signing Up'
				: error,
			'Failed To Sign Up User',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Logs in a user.
 *
 * @description This function validates the user's email and password, and if valid, generates a JWT token for session management. The function also returns the user's role and safe user data.
 *
 * @param {Object} body - The request body containing the user's login credentials.
 * @param {string} body.email - The email address of the user.
 * @param {string} body.password - The password of the user.
 *
 * @returns {Object|ErrorHandler} - Returns the role and safe user data or an ErrorHandler instance if an error occurs.
 */
export const loginUser = async (body) => {
	try {
		const { email, password } = body;

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { email },
			omit: {
				passwordChangeAt: true,
			},
		});

		if (!user)
			return new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found',
				statusCode.notFoundCode
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'Error Occur Login User ' + user.error.message,
				statusCode.internalServerErrorCode
			);

		const { role, isActive, password: userPassword, ...safeUser } = user;

		// Check if password matches
		const isPasswordMatch = await verifyPassword(password, userPassword);

		if (!isPasswordMatch)
			return new ErrorHandler(
				'password',
				'Password is not correct',
				'Incorrect password',
				statusCode.unauthorizedCode
			);

		//? Check if user is deActive (isActive is false)
		//* to make it isActive to true
		if (!isActive) {
			await prisma.user.update({
				where: { id: user.id },
				data: { isActive: true },
			});
		}

		return { role, id: safeUser.id };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Logs In'
				: error,
			'Failed to login user',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Authenticates a user by fetching them from the database using their ID.
 *
 * - Retrieves the user from the database with sensitive fields omitted.
 * - If the user does not exist, returns a custom `ErrorHandler`.
 * - If Prisma returns an error in the response, returns an `ErrorHandler`.
 * - If an exception is thrown during the process, it catches and wraps it in an `ErrorHandler`.
 *
 * @param {string} userId - The unique ID of the user to authenticate.
 * @returns {Promise<Object|ErrorHandler>} The user object without sensitive fields, or an error handler object.
 */
export const authUser = async (userId) => {
	try {
		// Attempt to retrieve the user from the database by ID, excluding sensitive fields
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: {
				account: true,
				suitcases: {
					include: {
						suitcaseItems: {
							include: {
								item: true,
							},
						},
					},
				},
				bags: {
					include: {
						bagItems: {
							include: {
								item: true,
							},
						},
					},
				},
				items: {
					include: {
						bagItems: true,
						suitcaseItems: true,
					},
				},
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				role: true,
			},
		});

		// If user is not found, return a custom error
		if (!user) {
			return new ErrorHandler(
				'User Not Found',
				"User Doesn't exist in Database",
				'User needs to exist to be authenticated',
				statusCode.notFoundCode
			);
		}

		// If Prisma returned an error (rare case), return a different custom error
		if (user.error) {
			return new ErrorHandler(
				'prisma',
				user.error,
				'Error occurred while authenticating user: ' +
					user.error.message,
				statusCode.internalServerErrorCode
			);
		}

		// If all good, return the user object
		return user;
	} catch (error) {
		// Catch any unexpected exceptions and return them wrapped in a custom error
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Authenticating You'
				: error,
			'Failed to authenticate user',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Initiates the process for a user to reset their password.
 *
 * @description This function sends a password reset link to the user's email address. It generates a unique token for the password reset process and sends it along with instructions to the user's email.
 *
 * @param {string} email - The email address of the user requesting a password reset.
 *
 * @returns {Object|ErrorHandler} - Returns a token and user details for password reset or an ErrorHandler instance if an error occurs.
 */
export const userForgotPassword = async (email) => {
	try {
		const user = await prisma.user.findUnique({ where: { email: email } });

		if (!user)
			return new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found',
				statusCode.notFoundCode
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message,
				statusCode.internalServerErrorCode
			);

		//* Generate a random password by crypto
		const { token, hashToken } = generateCryptoHashToken();

		const userToken = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'PASSWORD_RESET',
				hashToken: hashToken,
				expiresAt: setExpiredAt('password'),
			},
		});

		if (!userToken)
			return new ErrorHandler(
				'user is null',
				'Failed to update user password reset token and expired at',
				'Failed to update user password',
				statusCode.badRequestCode
			);

		if (userToken.error)
			return new ErrorHandler(
				'prisma',
				userToken.error,
				'Failed to update user password reset token and expired at ' +
					userToken.error.message,
				statusCode.internalServerErrorCode
			);

		//* return reset token to send an email
		return {
			token,
			userName: user.displayName,
			userEmail: user.email,
		};
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Send Reset Password Email'
				: error,
			'Failed to send reset password email to user'
		);
	}
};

/**
 * Resets a user's password using a reset token.
 *
 * @description This function verifies the provided reset token and checks that the new password and confirmation match. If valid, it updates the user's password and invalidates the reset token.
 *
 * @param {Object} body - The request body containing the new password and confirmation.
 * @param {string} body.password - The new password for the user.
 * @param {string} body.confirmPassword - The confirmation of the new password.
 * @param {string} token - The password reset token.
 *
 * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
 */
export const resetUserPassword = async (body, token) => {
	try {
		const hashedToken = generateCryptoToken(token);

		const { password, confirmPassword } = body;

		const userToken = await prisma.userToken.findUnique({
			where: {
				hashToken: hashedToken,
			},
		});

		if (!userToken)
			return new ErrorHandler(
				'Invalid token',
				'Password reset token is invalid',
				"Can't reset password with invalid token",
				statusCode.notFoundCode
			);

		if (userToken.error)
			return new ErrorHandler(
				'prisma',
				userToken.error,
				'User not found ' + userToken.error.message,
				statusCode.internalServerErrorCode
			);

		//? if the 10 minutes to reset the password is still in effect
		if (new Date() > userToken.expiresAt)
			return new ErrorHandler(
				'timeout to reset password',
				'You passed the time to reset your password',
				'Password reset token expired',
				statusCode.badRequestCode
			);

		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password',
				statusCode.badRequestCode
			);

		const hashedPassword = await hashingPassword(password);

		//* update the password
		const updatePassword = await prisma.user.update({
			where: { id: userToken.userId },
			data: {
				password: hashedPassword,
				passwordChangeAt: passwordChangeAt(),
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				isActive: true,
			},
		});

		if (!updatePassword)
			return new ErrorHandler(
				'user is null',
				'Failed to update user password',
				'Failed to update user password',
				statusCode.notFoundCode
			);

		if (updatePassword.error)
			return new ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password ' +
					updatePassword.error.message,
				statusCode.internalServerErrorCode
			);

		await prisma.userToken.delete({
			where: {
				id: userToken.id,
			},
		});

		return updatePassword;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Reset Password'
				: error,
			'Failed to reset user password',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Updates the user's password.
 *
 * @description This function verifies the user's current password and updates it to a new one. The new password must match the confirmation password. The update is saved in the database, and the user is notified of the change.
 *
 * @param {string} userId - The ID of the user whose password is being updated.
 * @param {Object} body - The request body containing the current password, new password, and confirmation.
 * @param {string} body.currentPassword - The current password of the user.
 * @param {string} body.newPassword - The new password to be set.
 * @param {string} body.confirmPassword - The confirmation of the new password.
 *
 * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
 */
export const updateUserPassword = async (userId, body) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = body;

		const userPassword = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				password: true,
				passwordChangeAt: true,
			},
		});

		if (!userPassword)
			return new ErrorHandler(
				'user is null',
				'User not found',
				'User Not Signing Up',
				statusCode.notFoundCode
			);

		if (userPassword.error)
			return new ErrorHandler(
				'prisma',
				userPassword.error,
				'User Not Signing Up ' + userPassword.error.message,
				statusCode.internalServerErrorCode
			);

		const isMatch = await verifyPassword(
			currentPassword,
			userPassword.password
		);

		if (!isMatch)
			return new ErrorHandler(
				'password',
				'password is not correct',
				'Incorrect password',
				statusCode.badRequestCode
			);

		if (newPassword !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in Confirm Password',
				'Enter the same password in Confirm Password',
				statusCode.badRequestCode
			);

		const hashedPassword = await hashingPassword(newPassword);

		const updatePassword = await prisma.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
				passwordChangeAt: passwordChangeAt(),
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				isActive: true,
				role: true,
			},
		});

		if (!updatePassword)
			return new ErrorHandler(
				'update password is null',
				"Couldn't update password",
				'Failed to update user password',
				statusCode.notFoundCode
			);

		if (updatePassword.error)
			return new ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password ' +
					updatePassword.error.message,
				statusCode.internalServerErrorCode
			);

		return updatePassword;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Update Your Password'
				: error,
			'Failed to update user password',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Updates the user's profile data.
 *
 * @description This function allows users to update their profile information, including their name, gender, birth date, country, city, and profile picture. It ensures the data is validated before updating.
 *
 * @param {string} userId - The ID of the user whose data is being updated.
 * @param {Object} body - The request body containing the updated user data.
 * @param {string} body.firstName - The updated first name of the user.
 * @param {string} body.lastName - The updated last name of the user.
 * @param {string} body.gender - The updated gender of the user.
 * @param {string} body.birth - The updated birth date of the user.
 * @param {string} body.country - The updated country of the user.
 * @param {string} body.city - The updated city of the user.
 * @param {string} body.profilePicture - The updated profile picture URL of the user.
 *
 * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
 */
export const updateUserData = async (userId, body) => {
	try {
		const {
			firstName,
			lastName,
			gender,
			birth,
			country,
			city,
			profilePicture,
		} = body;

		const updatedUserData = await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				gender: gender || undefined,
				birth: birthOfDate(birth),
				country: country || undefined,
				city: city || undefined,
				profilePicture: haveProfilePicture(profilePicture),
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				isActive: true,
				role: true,
			},
		});

		if (!updatedUserData)
			return new ErrorHandler(
				'updateUserData is null',
				"Couldn't update user data",
				'Failed to update user data',
				statusCode.notFoundCode
			);

		if (updatedUserData.error)
			return new ErrorHandler(
				'prisma',
				updatedUserData.error,
				'Failed to update user data ' + updatedUserData.error.message,
				statusCode.internalServerErrorCode
			);

		return updatedUserData;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Update Your Info'
				: error,
			'Failed to update user data'
		);
	}
};

/**
 * Changes the email address of a user.
 *
 * @description This function allows the user to change their email address. It first checks if the new email is already in use, then sends an email verification link to the new address.
 *
 * @param {string} userId - The ID of the user whose email is being changed.
 * @param {string} email - The new email address to be set.
 *
 * @returns {Object|ErrorHandler} - Returns the verification token and user details or an ErrorHandler instance if an error occurs.
 */
export const changeUserEmail = async (userId, email) => {
	try {
		//* check if email is never use before
		const user = await prisma.user.findUnique({ where: { email: email } });

		if (user)
			return new ErrorHandler(
				'User Email Error',
				'Error Duplicate Unique Field',
				'That Email is Already Exists',
				statusCode.badRequestCode
			);

		const { token, hashToken } = generateCryptoHashToken();

		const userToken = await prisma.userToken.create({
			data: {
				userId,
				type: 'CHANGE_EMAIL',
				hashToken,
				expiresAt: setExpiredAt('change'),
			},
		});

		if (!userToken)
			return new ErrorHandler(
				'userToken is null',
				"Couldn't update user",
				'Failed to change user email',
				statusCode.notFoundCode
			);

		if (userToken.error)
			return new ErrorHandler(
				'prisma',
				userToken.error,
				'Failed to change user email ' + userToken.error.message,
				statusCode.internalServerErrorCode
			);

		const updateEmail = await prisma.user.update({
			where: { id: userId },
			data: {
				email: email,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				isActive: true,
				role: true,
			},
		});

		if (!updateEmail)
			return new ErrorHandler(
				'updateEmail is null',
				"Couldn't update user",
				'Failed to change user email',
				statusCode.notFoundCode
			);

		if (updateEmail.error)
			return new ErrorHandler(
				'prisma',
				updateEmail.error,
				'Failed to change user email ' + updateEmail.error.message,
				statusCode.internalServerErrorCode
			);

		return {
			token: token,
			userName: updateEmail.displayName,
			userEmail: updateEmail.email,
		};
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Change Your Email'
				: error,
			'Failed to change user email',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Sends a verification email to the user for email verification.
 *
 * @description This function sends a verification email to the user after they initiate the email change process. The email contains a token that the user can use to verify the new email address.
 *
 * @param {string} email - The email address of the user requesting email verification.
 *
 * @returns {Object|ErrorHandler} - Returns a token and the user's name for email verification or an ErrorHandler instance if an error occurs.
 */
export const sendVerificationUserEmail = async (email) => {
	try {
		const user = await prisma.user.findUnique({ where: { email: email } });

		if (!user)
			return new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found',
				statusCode.notFoundCode
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message,
				statusCode.internalServerErrorCode
			);

		const { token, hashToken } = generateCryptoHashToken();

		const userToken = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'EMAIL_VERIFICATION',
				hashToken: hashToken,
				expiresAt: setExpiredAt('verify'),
			},
		});

		if (!userToken)
			return new ErrorHandler(
				'userToken is null',
				"Couldn't update user",
				'Failed to update user',
				statusCode.notFoundCode
			);

		if (userToken.error)
			return new ErrorHandler(
				'prisma',
				userToken.error,
				'Failed to update user ' + userToken.error.message,
				statusCode.internalServerErrorCode
			);

		return { token, userName: user.displayName };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Sending Verification Email'
				: error,
			'Failed to verify user email',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Verifies a user's email address using a token.
 *
 * @description This function verifies the token sent to the user's email and confirms the new email address. If successful, it updates the user's email in the database.
 *
 * @param {string} token - The verification token sent to the user's email.
 * @param {string} type - The type of verification (e.g., "EMAIL_VERIFICATION").
 *
 * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
 */
export const verifyUserEmail = async (token, type) => {
	try {
		const hashToken = generateCryptoToken(token);

		const userToken = await prisma.userToken.findUnique({
			where: {
				hashToken: hashToken,
				type: type,
			},
		});

		if (!userToken)
			return new ErrorHandler(
				'userToken is null',
				"Couldn't update user",
				'Failed to verify user email',
				statusCode.notFoundCode
			);

		if (userToken.error)
			return new ErrorHandler(
				'prisma',
				"Couldn't Find token" + userToken.error,
				'Failed to verify user email ' + userToken.error.message,
				statusCode.internalServerErrorCode
			);

		if (userToken.expiresAt < new Date())
			return new ErrorHandler(
				'userToken is expired',
				'token is expired',
				'Failed to verify user email',
				statusCode.badRequestCode
			);

		const updateUser = await prisma.user.update({
			where: { id: userToken.userId },
			data: {
				isEmailVerified: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				role: true,
			},
		});

		if (!updateUser)
			return new ErrorHandler(
				'updateUser is null',
				"Couldn't update user",
				'Failed to verify user email',
				statusCode.notFoundCode
			);

		if (updateUser.error)
			return new ErrorHandler(
				'prisma',
				updateUser.error,
				'Failed to verify user email ' + updateUser.error.message,
				statusCode.internalServerErrorCode
			);

		await prisma.userToken.delete({
			where: {
				id: userToken.id,
			},
		});

		return updateUser;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Verify Your Email'
				: error,
			'Failed to verify user email',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Retrieves the permissions associated with a user role.
 *
 * @description This function fetches the permissions tied to a specific role (such as Admin, Member, etc.) from the database. It returns a list of permissions that dictate the actions allowed for users of that role.
 *
 * @param {string} userRole - The role of the user (e.g., "Admin", "Member").
 *
 * @returns {Object|ErrorHandler} - Returns the permissions associated with the user's role or an ErrorHandler instance if an error occurs.
 */
export const getUserPermissions = async (userRole) => {
	try {
		const userPermissions = await prisma.roleOnPermission.findMany({
			where: { role: userRole },
			include: {
				permission: true,
			},
		});

		if (!userPermissions)
			return new ErrorHandler(
				'userPermissions is null',
				"Couldn't get user permissions",
				'Failed to get user permissions',
				statusCode.notFoundCode
			);

		if (userPermissions.error)
			return new ErrorHandler(
				'prisma',
				userPermissions.error,
				'Failed to get user permissions ' +
					userPermissions.error.message,
				statusCode.internalServerErrorCode
			);

		const totalPermissions = await prisma.roleOnPermission.count({
			where: { role: userRole },
		});

		const meta = {
			totalPermissions: totalPermissions,
			role: userRole,
		};

		return { permissions: userPermissions, meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Get User Permissions'
				: error,
			'Failed to get user permissions',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * Deactivates a user's account.
 *
 * @description This function disables a user's account, preventing them from logging in or accessing the system. It can be used when a user requests to deactivate their account or when a system administrator disables an account.
 *
 * @param {string} userId - The ID of the user whose account is to be deactivated.
 *
 * @returns {Object|ErrorHandler} - Returns the deactivated user data or an ErrorHandler instance if an error occurs.
 */
export const deactivateUserAccount = async (userId) => {
	try {
		const deactivateUser = await prisma.user.update({
			where: { id: userId },
			data: {
				isActive: false,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				role: true,
			},
		});

		if (!deactivateUser)
			return new ErrorHandler(
				'deactivateUser is null',
				"Couldn't deactivate user",
				'Failed to deactivate User Account',
				statusCode.notFoundCode
			);

		if (deactivateUser.error)
			return new ErrorHandler(
				'prisma',
				deactivateUser.error,
				'Failed to deactivate user ' + deactivateUser.error.message,
				statusCode.internalServerErrorCode
			);

		return deactivateUser;
	} catch (error) {
		return new ErrorHandler(
			"Couldn't deactivate",
			Object.keys(error).length === 0
				? 'Error Occur while Deactivate Your Account'
				: error,
			'Failed to deactivate User Account',
			statusCode.internalServerErrorCode
		);
	}
};
