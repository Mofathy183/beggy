import type { PrismaClientType } from '@prisma';
import { User, AuthProvider, Role } from '@prisma-generated/client';
import type {
	SignUpPayload,
	LoginInput,
	Permissions,
} from '@beggy/shared/types';
import { ErrorCode, RolePermissions } from '@beggy/shared/constants';
import { appErrorMap, hashPassword, verifyPassword } from '@shared/utils';
import { logger } from '@shared/middlewares';
import { AuthMe } from '@shared/types';

/**
 * AuthService
 *
 * Handles authentication-related business logic:
 * - User registration (LOCAL accounts)
 * - Credential verification (login)
 * - Authenticated user context resolution
 *
 * This service is framework-agnostic and contains no HTTP concerns.
 */
export class AuthService {
	/**
	 * Scoped logger for authentication domain events
	 */
	private readonly authLogger = logger.child({ domain: 'auth' });
	constructor(private readonly prisma: PrismaClientType) {}

	/**
	 * Registers a new user using email & password authentication.
	 *
	 * @remarks
	 * - Creates a LOCAL auth account with a hashed password
	 * - Creates an initial user profile
	 * - Persists multiple related records in a single operation
	 * - Email uniqueness is assumed to be validated at a higher layer
	 *
	 * @param user - Signup payload containing identity and profile data
	 * @returns The newly created User entity
	 */
	async signupUser(user: SignUpPayload): Promise<User> {
		const hashedPassword = await hashPassword(user.password);

		const newUser = await this.prisma.user.create({
			data: {
				email: user.email,
				account: {
					create: {
						authProvider: 'LOCAL',
						hashedPassword,
					},
				},
				profile: {
					create: {
						firstName: user.firstName,
						lastName: user.lastName,
						city: user.city,
						country: user.country,
						avatarUrl: user.avatarUrl,
						gender: user.gender,
						birthDate: user.birthDate,
					},
				},
			},
		});

		this.authLogger.info(
			{ userId: newUser.id },
			'User signed up successfully'
		);

		return newUser;
	}

	/**
	 * Authenticates a user using LOCAL credentials.
	 *
	 * @remarks
	 * - Validates email/password
	 * - Ensures the user is active
	 * - Rejects OAuth-only accounts (no password exists)
	 *
	 * @param input - Login credentials
	 * @throws INVALID_CREDENTIALS if authentication fails
	 * @throws USER_DISABLED if the account is inactive
	 *
	 * @returns Minimal identity required to establish a session
	 */
	async loginUser(input: LoginInput): Promise<{ id: string; role: Role }> {
		const user = await this.prisma.user.findUnique({
			where: { email: input.email },
			include: { account: true },
		});

		if (!user) {
			this.authLogger.warn(
				{ email: input.email },
				'Login failed: user not found'
			);
			throw appErrorMap.badRequest(ErrorCode.INVALID_CREDENTIALS);
		}

		if (!user.isActive) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login blocked: user disabled'
			);
			throw appErrorMap.forbidden(ErrorCode.USER_DISABLED);
		}

		// Only LOCAL accounts are allowed to authenticate with passwords
		const localAccount = user.account.find(
			(a) => a.authProvider === AuthProvider.LOCAL
		);

		if (!localAccount || !localAccount.hashedPassword) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login failed: no LOCAL auth provider'
			);
			throw appErrorMap.badRequest(ErrorCode.INVALID_CREDENTIALS);
		}

		const isValid = await verifyPassword(
			input.password,
			localAccount.hashedPassword
		);

		if (!isValid) {
			this.authLogger.warn(
				{ userId: user.id },
				'Login failed: invalid password'
			);
			throw appErrorMap.badRequest(ErrorCode.PASSWORDS_DO_NOT_MATCH);
		}

		this.authLogger.info(
			{ userId: user.id, role: user.role },
			'User logged in successfully'
		);

		return { id: user.id, role: user.role };
	}

	/**
	 * Resolves the authenticated user's identity and authorization context.
	 *
	 * @remarks
	 * - Used by `/auth/me`
	 * - Excludes sensitive authentication data (e.g. passwords)
	 * - Permissions are derived from role, not stored directly
	 * - Assumes the caller has already been authenticated
	 *
	 * @param userId - Authenticated user ID (from access token)
	 * @throws UNAUTHORIZED if the user does not exist
	 *
	 * @returns Authenticated user snapshot and effective permissions
	 */
	async authUser(
		userId: string
	): Promise<{ user: AuthMe; permissions: Permissions }> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				profile: true,
				account: { omit: { hashedPassword: true } },
			},
		});

		if (!user) {
			this.authLogger.warn(
				{ userId },
				'Auth context requested for non-existent user'
			);
			throw appErrorMap.unauthorized(ErrorCode.UNAUTHORIZED);
		}

		return {
			user,
			permissions: RolePermissions[user.role],
		};
	}
}

// import { ErrorHandler } from '../utils/error.js';
// import type { PrismaClient } from '../generated/client/index.js';
// import { hashingPassword, verifyPassword } from '../utils/hash.js';
// import prisma from '../../prisma/prisma.js';
// import { generateCryptoToken, generateCryptoHashToken } from '../utils/jwt.js';
// import {
// 	setExpiredAt,
// 	passwordChangeAt,
// 	birthOfDate,
// 	haveProfilePicture,
// } from '../utils/userHelper.js';
// import { statusCode } from '../config/status.js';

// /**
//  * Signs up a new user.
//  *
//  * @description This function handles the user registration process. It takes user details from the request body, validates them, and creates a new user in the database. It also hashes the user's password before storing it and sends a confirmation email for verification.
//  *
//  * @param {Object} body - The request body containing user details.
//  * @param {string} body.firstName - The first name of the user.
//  * @param {string} body.lastName - The last name of the user.
//  * @param {string} body.email - The email address of the user.
//  * @param {string} body.password - The password for the user.
//  * @param {string} body.confirmPassword - The confirmation of the user's password.
//  *
//  * @returns {Object|ErrorHandler} - Returns the role and safe user data or an ErrorHandler instance if an error occurs.
//  */
// export const singUpUser = async (body) => {
// 	try {
// 		const { firstName, lastName, email, password, confirmPassword } = body;

// 		// Hashing the password
// 		if (password !== confirmPassword)
// 			return new ErrorHandler(
// 				'password',
// 				'Password is not the same in Confirm Password',
// 				'Enter the same password in Confirm Password',
// 				statusCode.badRequestCode
// 			);
// 		const hashPassword = await hashingPassword(password);

// 		// Check if user email is unique
// 		const userEmail = await prisma.user.findUnique({
// 			where: { email },
// 		});

// 		if (userEmail)
// 			return new ErrorHandler(
// 				'User Email Error',
// 				'Error Duplicate Unique Field',
// 				'That Email is Already Exists',
// 				statusCode.badRequestCode
// 			);

// 		// Create new user in Prisma
// 		const newUser = await prisma.user.create({
// 			data: {
// 				firstName,
// 				lastName,
// 				email,
// 				password: hashPassword,
// 			},
// 		});

// 		if (!newUser)
// 			return new ErrorHandler(
// 				'User Not Found',
// 				"Could'\t Created user",
// 				'Failed to create user',
// 				statusCode.notFoundCode
// 			);

// 		if (newUser.error)
// 			return new ErrorHandler(
// 				'Database Error',
// 				newUser.error,
// 				'User already exists ' + newUser.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const { role, id } = newUser;

// 		return { role, id };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Signing Up'
// 				: error,
// 			'Failed To Sign Up User',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Logs in a user.
//  *
//  * @description This function validates the user's email and password, and if valid, generates a JWT token for session management. The function also returns the user's role and safe user data.
//  *
//  * @param {Object} body - The request body containing the user's login credentials.
//  * @param {string} body.email - The email address of the user.
//  * @param {string} body.password - The password of the user.
//  *
//  * @returns {Object|ErrorHandler} - Returns the role and safe user data or an ErrorHandler instance if an error occurs.
//  */
// export const loginUser = async (body) => {
// 	try {
// 		const { email, password } = body;

// 		// Check if user exists
// 		const user = await prisma.user.findUnique({
// 			where: { email },
// 			omit: {
// 				passwordChangeAt: true,
// 			},
// 		});

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
// 				'Error Occur Login User ' + user.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const { role, isActive, password: userPassword, ...safeUser } = user;

// 		// Check if password matches
// 		const isPasswordMatch = await verifyPassword(password, userPassword);

// 		if (!isPasswordMatch)
// 			return new ErrorHandler(
// 				'password',
// 				'Password is not correct',
// 				'Incorrect password',
// 				statusCode.unauthorizedCode
// 			);

// 		//? Check if user is deActive (isActive is false)
// 		//* to make it isActive to true
// 		if (!isActive) {
// 			await prisma.user.update({
// 				where: { id: user.id },
// 				data: { isActive: true },
// 			});
// 		}

// 		return { role, id: safeUser.id };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Logs In'
// 				: error,
// 			'Failed to login user',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Initiates the process for a user to reset their password.
//  *
//  * @description This function sends a password reset link to the user's email address. It generates a unique token for the password reset process and sends it along with instructions to the user's email.
//  *
//  * @param {string} email - The email address of the user requesting a password reset.
//  *
//  * @returns {Object|ErrorHandler} - Returns a token and user details for password reset or an ErrorHandler instance if an error occurs.
//  */
// export const userForgotPassword = async (email) => {
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

// 		//* Generate a random password by crypto
// 		const { token, hashToken } = generateCryptoHashToken();

// 		const userToken = await prisma.userToken.create({
// 			data: {
// 				userId: user.id,
// 				type: 'PASSWORD_RESET',
// 				hashToken: hashToken,
// 				expiresAt: setExpiredAt('password'),
// 			},
// 		});

// 		if (!userToken)
// 			return new ErrorHandler(
// 				'user is null',
// 				'Failed to update user password reset token and expired at',
// 				'Failed to update user password',
// 				statusCode.badRequestCode
// 			);

// 		if (userToken.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userToken.error,
// 				'Failed to update user password reset token and expired at ' +
// 					userToken.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		//* return reset token to send an email
// 		return {
// 			token,
// 			userName: user.displayName,
// 			userEmail: user.email,
// 		};
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Send Reset Password Email'
// 				: error,
// 			'Failed to send reset password email to user'
// 		);
// 	}
// };

// /**
//  * Resets a user's password using a reset token.
//  *
//  * @description This function verifies the provided reset token and checks that the new password and confirmation match. If valid, it updates the user's password and invalidates the reset token.
//  *
//  * @param {Object} body - The request body containing the new password and confirmation.
//  * @param {string} body.password - The new password for the user.
//  * @param {string} body.confirmPassword - The confirmation of the new password.
//  * @param {string} token - The password reset token.
//  *
//  * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
//  */
// export const resetUserPassword = async (body, token) => {
// 	try {
// 		const hashedToken = generateCryptoToken(token);

// 		const { password, confirmPassword } = body;

// 		const userToken = await prisma.userToken.findUnique({
// 			where: {
// 				hashToken: hashedToken,
// 			},
// 		});

// 		if (!userToken)
// 			return new ErrorHandler(
// 				'Invalid token',
// 				'Password reset token is invalid',
// 				"Can't reset password with invalid token",
// 				statusCode.notFoundCode
// 			);

// 		if (userToken.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userToken.error,
// 				'User not found ' + userToken.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		//? if the 10 minutes to reset the password is still in effect
// 		if (new Date() > userToken.expiresAt)
// 			return new ErrorHandler(
// 				'timeout to reset password',
// 				'You passed the time to reset your password',
// 				'Password reset token expired',
// 				statusCode.badRequestCode
// 			);

// 		if (password !== confirmPassword)
// 			return new ErrorHandler(
// 				'password',
// 				'password is not the same in confirmPassword',
// 				'Enter the same password in confirm password',
// 				statusCode.badRequestCode
// 			);

// 		const hashedPassword = await hashingPassword(password);

// 		//* update the password
// 		const updatePassword = await prisma.user.update({
// 			where: { id: userToken.userId },
// 			data: {
// 				password: hashedPassword,
// 				passwordChangeAt: passwordChangeAt(),
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				isActive: true,
// 			},
// 		});

// 		if (!updatePassword)
// 			return new ErrorHandler(
// 				'user is null',
// 				'Failed to update user password',
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

// 		await prisma.userToken.delete({
// 			where: {
// 				id: userToken.id,
// 			},
// 		});

// 		return updatePassword;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Reset Password'
// 				: error,
// 			'Failed to reset user password',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * Verifies a user's email address using a token.
//  *
//  * @description This function verifies the token sent to the user's email and confirms the new email address. If successful, it updates the user's email in the database.
//  *
//  * @param {string} token - The verification token sent to the user's email.
//  * @param {string} type - The type of verification (e.g., "EMAIL_VERIFICATION").
//  *
//  * @returns {Object|ErrorHandler} - Returns the updated user data or an ErrorHandler instance if an error occurs.
//  */
// export const verifyUserEmail = async (token, type) => {
// 	try {
// 		const hashToken = generateCryptoToken(token);

// 		const userToken = await prisma.userToken.findUnique({
// 			where: {
// 				hashToken: hashToken,
// 				type: type,
// 			},
// 		});

// 		if (!userToken)
// 			return new ErrorHandler(
// 				'userToken is null',
// 				"Couldn't update user",
// 				'Failed to verify user email',
// 				statusCode.notFoundCode
// 			);

// 		if (userToken.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				"Couldn't Find token" + userToken.error,
// 				'Failed to verify user email ' + userToken.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		if (userToken.expiresAt < new Date())
// 			return new ErrorHandler(
// 				'userToken is expired',
// 				'token is expired',
// 				'Failed to verify user email',
// 				statusCode.badRequestCode
// 			);

// 		const updateUser = await prisma.user.update({
// 			where: { id: userToken.userId },
// 			data: {
// 				isEmailVerified: true,
// 			},
// 			omit: {
// 				password: true,
// 				passwordChangeAt: true,
// 				role: true,
// 			},
// 		});

// 		if (!updateUser)
// 			return new ErrorHandler(
// 				'updateUser is null',
// 				"Couldn't update user",
// 				'Failed to verify user email',
// 				statusCode.notFoundCode
// 			);

// 		if (updateUser.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updateUser.error,
// 				'Failed to verify user email ' + updateUser.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		await prisma.userToken.delete({
// 			where: {
// 				id: userToken.id,
// 			},
// 		});

// 		return updateUser;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Verify Your Email'
// 				: error,
// 			'Failed to verify user email',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };
