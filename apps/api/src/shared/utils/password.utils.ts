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
