import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { SecureTokenPair } from '@shared/types';
import { envConfig } from '@config';
import { validate as validateUUID } from 'uuid';

const accessTokenSecret: Secret = envConfig.security.jwt.access.secret;
const refreshTokenSecret: Secret = envConfig.security.jwt.refresh.secret;
const accessConfig: SignOptions = envConfig.security.jwt.access.config;
const refreshConfig: SignOptions = envConfig.security.jwt.refresh.config;

/**
 * Generates a JWT token with the given id and expiration time.
 * @param {string} id - The id to be included in the token.
 * @returns {string} A JWT token containing the id.
 */
export const signAccessToken = (id: string): string => {
	if (validateUUID(id)) {
		throw new Error('Invalid user ID format');
	}
	const payload: JwtPayload = { sub: id };
	const token = jwt.sign(payload, accessTokenSecret, accessConfig);

	return token;
};

/**
 * Generates a JWT refresh token with the given id and expiration time.
 * @param {string} id - The id to be included in the token.
 * @returns {string} A JWT refresh token containing the id.
 */
export const signRefreshToken = (id: string): string => {
	if (validateUUID(id)) {
		throw new Error('Invalid user ID format');
	}

	const payload: JwtPayload = { sub: id };

	const refreshToken = jwt.sign(payload, refreshTokenSecret, refreshConfig);

	return refreshToken;
};

export const verifyToken = (
	token: string,
	type: 'access' | 'refresh'
): JwtPayload => {
	if (!token || typeof token !== 'string') {
		throw new Error('Invalid token');
	}

	const secret: Secret =
		type === 'access' ? accessTokenSecret : refreshTokenSecret;
	try {
		const payload = jwt.verify(token, secret) as JwtPayload;

		if (!payload.sub) {
			throw new Error('Invalid token: missing user ID');
		}
		return payload;
	} catch (error: unknown) {
		if (error instanceof TokenExpiredError) {
			throw new Error('Invalid token');
		}
		if (error instanceof JsonWebTokenError) {
			throw new Error('Invalid token');
		}
		throw error; // Re-throw unknown errors
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
		throw new Error('Token is required');
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