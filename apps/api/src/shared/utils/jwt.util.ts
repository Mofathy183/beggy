import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ErrorHandler } from './error.utils.js';
import type { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { envConfig } from '@config';

export interface CryptoTokenPair {
	plainToken: string;
	hashedToken: string;
}

export interface AppJwtPayload extends JwtPayload {
	userId: string;
}

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
	const token = jwt.sign({ id: id }, accessTokenSecret, accessConfig);

	return token;
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object|false} The decoded token if verification is successful, or false
 * if the token is invalid.
 */
export const verifyAccessToken = (token: string): AppJwtPayload | boolean => {
	try {
		const verified = jwt.verify(token, accessTokenSecret) as AppJwtPayload;
		return verified;
	} catch (error) {
		new ErrorHandler(
			'Invalid token Catch',
			error,
			'Failed to Verify token'
		);
		return false;
	}
};

/**
 * Generates a JWT refresh token with the given id and expiration time.
 * @param {string} id - The id to be included in the token.
 * @returns {string} A JWT refresh token containing the id.
 */
export const signRefreshToken = (id: string): string => {
	const refreshToken = jwt.sign(
		{ id: id },
		refreshTokenSecret,
		refreshConfig
	);

	return refreshToken;
};

/**
 * Verifies a JWT refresh token.
 * @param {string} refreshToken - The JWT refresh token to verify.
 * @returns {object|false} The decoded token if verification is successful, or false
 * if the token is invalid.
 */
export const verifyRefreshToken = (
	refreshToken: string
): AppJwtPayload | boolean => {
	try {
		const verified = jwt.verify(
			refreshToken,
			refreshTokenSecret
		) as AppJwtPayload;
		return verified;
	} catch (error) {
		new ErrorHandler(
			'Invalid Refresh token Catch',
			error,
			'Failed to Verify refresh token'
		);
		return false;
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
	return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a SHA256 hash of a randomly generated token, and returns the
 * original token and the hash as an object with the properties `token` and
 * `hashToken`.
 * @returns {CryptoTokenPair}
 */
export const generateEmailVerificationToken = (): CryptoTokenPair => {
	//* the reset token will send to the user via email
	const token = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashToken = crypto.createHash('sha256').update(token).digest('hex');

	return { plainToken: token, hashedToken: hashToken };
};
