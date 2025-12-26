import { hash, compare, genSalt } from 'bcrypt';
import crypto from 'crypto';
import { envConfig } from "@config"
const { security: { bcrypt } } = envConfig;

/**
 * @async
 * @description This function is to hash a password using the bcrypt library
 * @param {string} password - The password to hash
 * @returns {Promise<string>} - The hashed password
 * @throws {Error} - If there is an error while hashing the password
 */
export const hashPassword = async (password: string): Promise<string> => {
    if (!password || typeof password !== 'string') {
        throw new Error('Password is required');
    }
    
	try {
		const saltRound = await genSalt(bcrypt.saltRounds);

		const hashedPassword = await hash(password, saltRound);

		return hashedPassword;
	} catch (error) {
		throw new Error('Failed to hash password');
	}
};

/**
 * @async
 * @description This function is to verify the password against the hashed password from the database
 * @param {string} password - The password to verify
 * @param {string} hashedPassword - The hashed password from the database
 * @returns {Promise<boolean>} - If the password is correct or not
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
        throw new Error('Invalid hash provided');
    }
    
	try {
		const match = await compare(password, hashedPassword);
		return match;
	} catch (error: unknown) {
		console.error('Password verify error: ', error);
		return false;
	}
};

/**
 * generate random reset token for forgot password
 * Generates a random password and returns its SHA256 hash.
 * @returns {string} The hashed password
 */
export const generateSecureTokenHash = (): string => {
	//* the reset token will send to the user via email
	const password = crypto.randomBytes(32).toString('hex');

	//* this hash token will add to the database
	const hashedPassword = crypto
		.createHash('sha256')
		.update(password)
		.digest('hex');

	return hashedPassword;
};
