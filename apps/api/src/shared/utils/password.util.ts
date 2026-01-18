import { hash, compare, genSalt } from 'bcrypt';
import { envConfig } from '@config';
import { appErrorMap } from '@shared/utils';
import { ErrorCode } from '@beggy/shared/constants';
const {
	security: { bcrypt },
} = envConfig;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param password - Validated plain-text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
	try {
		const saltRound = await genSalt(bcrypt.saltRounds);

		return await hash(password, saltRound);
	} catch (error) {
		throw appErrorMap.serverError(ErrorCode.PASSWORD_HASH_FAILED, error);
	}
};

/**
 * Verifies a plain-text password against a bcrypt hash.
 *
 * @param password - Plain-text password
 * @param hashedPassword - Stored bcrypt hash
 * @returns Whether the password matches
 */
export const verifyPassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	if (!hashedPassword) {
		return false;
	}
	try {
		return await compare(password, hashedPassword);
	} catch (error: unknown) {
		throw appErrorMap.serverError(ErrorCode.PASSWORD_VERIFY_FAILED, error);
	}
};

/**
 * @description this will add to the database because to handle the password change at felid
 * @returns {Date}
 */
export const passwordChangeAt = () => {
	const changeAt = new Date();
	return changeAt;
};

/**
 * @description for compare it with the timestamp in token
 * to make sure that the user has not change has password after issued the token
 * (if it before issued the token that means that the user has not change has password)
 *
 * @param {Date} changeAt
 * @returns {Number} Timestamp
 */
const passwordChangeTimestamp = (changeAt: Date): number => {
	const timestamp = Math.floor(changeAt.getTime() / 1000);
	return timestamp;
};

/**
 * @description Check if user password change
 * by check if the password change at timestamp
 * and compare it with the timestamp in token
 *
 * @param {Date} passwordChangeAt - will convert it to timestamp
 * @param {Number} tokenTimestamp - that is a timestamp from the token
 * @returns {Boolean} the result of compare passwordChangeAt timestamp and tokenTimestamp
 */
export const passwordChangeAfter = (
	passwordChangeAt: Date,
	tokenTimestamp: number
): boolean => {
	//? if the user has changed password
	//* that means the user has changed password
	if (passwordChangeAt) {
		const passwordTimestamp = passwordChangeTimestamp(passwordChangeAt);

		//? if the user has changed password after issued the token
		//* return true the user has changed password after issued the token
		//? else
		//* return false the user has not changed password
		return passwordTimestamp > tokenTimestamp;
	}

	//? if the user has not changed has password
	//* return false
	return false;
};
