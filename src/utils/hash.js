import { hash, compare, genSalt } from 'bcrypt';
import { bcryptConfig } from '../config/env.js';
import { ErrorHandler } from './error.js';

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
