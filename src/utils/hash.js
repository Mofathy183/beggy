import { hash, compare, genSalt } from 'bcrypt';
import { bcryptConfig } from '../config/env.js';
import { ErrorHandler } from './error.js';
import crypto from 'crypto';

/**
 * @async
 * @description This function is to hash a password using the bcrypt library
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 * @throws {Error} - If there is an error while hashing the password
 */
export const hashingPassword = async (password) => {
	try {
		const saltRound = await genSalt(bcryptConfig.saltRounds);

		const hashedPassword = await hash(password, saltRound);

		return hashedPassword;
	} catch (error) {
		return ErrorHandler('catch', error, 'Failed to hash password');
	}
};

/**
 * @async
 * @description This function is to verify the password against the hashed password from the database
 * @param {string} password - The password to verify
 * @param {string} hashedPassword - The hashed password from the database
 * @returns {boolean} - If the password is correct or not
 */
export const verifyPassword = async (password, hashedPassword) => {
	try {
		const match = await compare(password, hashedPassword);
		return match;
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to verify password');
		return false;
	}
};


/**
 * generate random reset token for forgot password
 * Generates a random password and returns its SHA256 hash.
 * @returns {string} The hashed password
 */
export const generateHashPassword = () => {
	//* the reset token will send to the user via email
	const password = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashedPassword = crypto
		.createHash('sha256')
		.update(password)
		.digest('hex');

	return hashedPassword;
};
