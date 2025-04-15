import { hash, compare, genSalt } from 'bcrypt';
import { bcryptConfig } from '../config/env.js';
import { ErrorHandler } from './error.js';
import crypto from 'crypto';

export const hashingPassword = async (password) => {
	try {
		const saltRound = await genSalt(bcryptConfig.saltRounds);

		const hashedPassword = await hash(password, saltRound);

		return hashedPassword;
	} catch (error) {
		return ErrorHandler('catch', error, 'Failed to hash password');
	}
};

export const verifyPassword = async (password, hashedPassword) => {
	try {
		const match = await compare(password, hashedPassword);
		return match;
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to verify password');
		return false;
	}
};

//* generate random reset token for forgot password
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
