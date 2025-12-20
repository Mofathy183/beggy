import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JWTConfig } from '../config/env.js';
import { ErrorHandler } from './error.utils.js';

/**
 * Generates a JWT token with the given id and expiration time.
 * @param {number} id - The id to be included in the token.
 * @returns {string} A JWT token containing the id.
 */
export const signToken = (id) => {
	const token = jwt.sign({ id: id }, JWTConfig.secret, {
		expiresIn: JWTConfig.expiresIn,
	});

	return token;
};

/**
 * Verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @returns {object|false} The decoded token if verification is successful, or false
 * if the token is invalid.
 */
export const verifyToken = (token) => {
	try {
		const verified = jwt.verify(token, JWTConfig.secret);
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
 * @param {number} id - The id to be included in the token.
 * @returns {string} A JWT refresh token containing the id.
 */
export const signRefreshToken = (id) => {
	const refreshToken = jwt.sign({ id: id }, JWTConfig.refreshSecret, {
		expiresIn: JWTConfig.refreshExpiresIn,
	});

	return refreshToken;
};

/**
 * Verifies a JWT refresh token.
 * @param {string} refreshToken - The JWT refresh token to verify.
 * @returns {object|false} The decoded token if verification is successful, or false
 * if the token is invalid.
 */
export const verifyRefreshToken = (refreshToken) => {
	try {
		const verified = jwt.verify(refreshToken, JWTConfig.refreshSecret);
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
export const generateCryptoToken = (token) => {
	return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a SHA256 hash of a randomly generated token, and returns the
 * original token and the hash as an object with the properties `token` and
 * `hashToken`.
 * @returns {{token: string, hashToken: string}}
 */
export const generateCryptoHashToken = () => {
	//* the reset token will send to the user via email
	const token = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashToken = crypto.createHash('sha256').update(token).digest('hex');

	return { hashToken: hashToken, token: token };
};
