import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import {
	SecureTokenPair,
	VerifiedRefreshToken,
	VerifiedAccessToken,
} from '@shared/types';
import { envConfig } from '@config';
import { Role } from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import { FieldsSchema, ParamsSchema } from '@beggy/shared/schemas';
import { appErrorMap } from '@shared/utils';

const accessTokenSecret: Secret = envConfig.security.jwt.access.secret;
const refreshTokenSecret: Secret = envConfig.security.jwt.refresh.secret;
const accessConfig: SignOptions = envConfig.security.jwt.access.config;
const refreshConfig: SignOptions = envConfig.security.jwt.refresh.config;

/**
 * Signs a short-lived access token.
 *
 * Access tokens are used for authenticating API requests
 * and may contain authorization-related claims such as user role.
 *
 * @param id - User UUID
 * @param role - User role used for authorization
 * @returns Signed JWT access token
 */
export const signAccessToken = (id: string, role: Role): string => {
	const payload: JwtPayload = {
		sub: id,
		role,
	};

	return jwt.sign(payload, accessTokenSecret, accessConfig);
};

/**
 * Signs a long-lived refresh token.
 *
 * Refresh tokens are used only to obtain new access tokens
 * and should contain the minimum amount of information.
 *
 * @param id - User UUID
 * @returns Signed JWT refresh token
 */
export const signRefreshToken = (id: string): string => {
	const payload: JwtPayload = {
		sub: id,
	};

	return jwt.sign(payload, refreshTokenSecret, refreshConfig);
};

/**
 * Verifies an access token and extracts trusted user data.
 *
 * This function:
 * - Verifies the token signature & expiration
 * - Validates payload shape and domain values
 * - Returns normalized application-level data
 *
 * @param token - JWT access token
 * @returns Verified user identity and role
 * @throws Unauthorized or validation errors
 */
export const verifyAccessToken = (token: string): VerifiedAccessToken => {
	try {
		const payload = jwt.verify(token, accessTokenSecret) as JwtPayload;

		const userId = ParamsSchema.uuid.safeParse(payload.sub);
		if (!userId.success) {
			throw appErrorMap.badRequest(
				ErrorCode.INVALID_FORMAT,
				userId.error
			);
		}
		const role = FieldsSchema.enum<typeof Role>(Role).safeParse(
			payload.role
		);
		if (!role.success) {
			throw appErrorMap.badRequest(ErrorCode.INVALID_INPUT, role.error);
		}

		return { id: userId.data, role: role.data as Role };
	} catch (error: unknown) {
		throw appErrorMap.unauthorized(ErrorCode.TOKEN_INVALID, error);
	}
};

/**
 * Verifies a refresh token and extracts the user identity.
 *
 * Refresh tokens are intentionally minimal and are only used
 * for issuing new access tokens.
 *
 * @param token - JWT refresh token
 * @returns Verified user identity
 * @throws Unauthorized or validation errors
 */
export const verifyRefreshToken = (token: string): VerifiedRefreshToken => {
	try {
		const payload = jwt.verify(token, refreshTokenSecret) as JwtPayload;

		const userId = ParamsSchema.uuid.safeParse(payload.sub);
		if (!userId.success) {
			throw appErrorMap.badRequest(
				ErrorCode.INVALID_FORMAT,
				userId.error
			);
		}

		return { id: userId.data };
	} catch (error: unknown) {
		throw appErrorMap.unauthorized(ErrorCode.TOKEN_INVALID, error);
	}
};

/**
 * to generate Crypto Token for.
 * reset password to store hash token in DB and send the token via email
 * and for verify email to do the same
 * Generates a SHA256 hash of the given token.
 * @param {string} token - The token to be hashed.
 * @returns {string} The SHA256 hash of the token as a hexadecimal string.
 */
export const generatePasswordResetToken = (token: string): string => {
	if (!token) {
		throw appErrorMap.badRequest(ErrorCode.TOKEN_MISSING);
	}
	return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a SHA256 hash of a randomly generated token, and returns the
 * original token and the hash as an object with the properties `token` and
 * `hashToken`.
 * @returns {SecureTokenPair}
 */
export const generateEmailVerificationToken = (): SecureTokenPair => {
	//* the reset token will send to the user via email
	const token = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hash = crypto.createHash('sha256').update(token).digest('hex');

	return { token, hash };
};
