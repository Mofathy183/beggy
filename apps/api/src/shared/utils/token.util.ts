import jwt from 'jsonwebtoken';
import { addMinutes } from 'date-fns';
import crypto from 'crypto';
import type { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import {
	type VerifiedRefreshToken,
	type VerifiedAccessToken,
	type SecureTokenPair,
} from '@shared/types';
import { env, envConfig } from '@config';
import { Role, TokenType } from '@prisma-generated/enums';
import { ErrorCode } from '@beggy/shared/constants';
import { FieldsSchema, ParamsSchema } from '@beggy/shared/schemas';
import { appErrorMap } from '@shared/utils';

/**
 * Secrets used for signing and verifying JWTs.
 *
 * @remarks
 * Access and refresh tokens MUST use separate secrets
 * to reduce blast radius in case of key compromise.
 */
const accessTokenSecret: Secret = envConfig.security.jwt.access.secret;
const refreshTokenSecret: Secret = envConfig.security.jwt.refresh.secret;

/**
 * JWT signing configurations.
 *
 * @remarks
 * These options include algorithm, issuer, audience,
 * and expiration rules. They are injected from the
 * centralized security configuration to avoid drift.
 */
const accessConfig: SignOptions = envConfig.security.jwt.access.signOptions;
const refreshConfig: SignOptions = envConfig.security.jwt.refresh.signOptions;

/**
 * Verification options shared across access and refresh tokens.
 *
 * @remarks
 * Issuer and audience validation ensures tokens were:
 * - Issued by this API
 * - Intended for this client
 *
 * These checks prevent token replay across services.
 */
const verifyJwtOptions = {
	issuer: envConfig.security.jwt.base.issuer,
	audience: envConfig.security.jwt.base.audience,
};

/**
 * Signs a short-lived access token.
 *
 * @remarks
 * Access tokens:
 * - Are sent with every authenticated request
 * - Are short-lived by design
 * - May contain authorization-related claims (e.g. role)
 *
 * They are optimized for frequent verification and
 * MUST be strictly validated on each request.
 *
 * @param userId - Authenticated user UUID
 * @param role - User role used for authorization checks
 * @returns Signed JWT access token
 */
export const signAccessToken = (userId: string, role: Role): string => {
	const payload: JwtPayload = {
		/**
		 * Subject (`sub`) uniquely identifies the authenticated user.
		 */
		sub: userId,

		/**
		 * Role claim is used for authorization decisions.
		 */
		role,
	};

	return jwt.sign(payload, accessTokenSecret, accessConfig);
};

/**
 * Signs a long-lived refresh token.
 *
 * @remarks
 * Refresh tokens:
 * - Are used ONLY to issue new access tokens
 * - Are never used to access protected resources
 * - Contain the minimum identity data possible
 *
 * Token lifetime is decided at runtime based on
 * the "remember me" flag.
 *
 * @param userId - Authenticated user UUID
 * @param rememberMe - Whether extended session lifetime is requested
 * @returns Signed JWT refresh token
 */
export const signRefreshToken = (
	userId: string,
	rememberMe: boolean = false
): string => {
	const payload: JwtPayload = {
		/**
		 * Subject (`sub`) identifies the account requesting refresh.
		 */
		sub: userId,
	};

	/**
	 * Decide refresh token expiration dynamically.
	 *
	 * @remarks
	 * - Standard sessions use a shorter TTL
	 * - "Remember me" sessions extend token lifetime
	 */
	const expiresIn = rememberMe
		? env.JWT_REFRESH_REMEMBER_EXPIRES_IN
		: env.JWT_REFRESH_EXPIRES_IN;

	return jwt.sign(payload, refreshTokenSecret, {
		...refreshConfig,
		expiresIn,
	});
};

/**
 * Verifies an access token and extracts trusted identity data.
 *
 * @remarks
 * This function:
 * - Verifies the JWT signature and expiration
 * - Validates required claims and domain constraints
 * - Normalizes token data into application-safe types
 *
 * Access tokens are used on every protected request and therefore
 * must be strictly validated.
 *
 * @param token - JWT access token
 * @returns Verified access token payload
 * @throws Unauthorized or validation errors if verification fails
 */
export const verifyAccessToken = (token: string): VerifiedAccessToken => {
	try {
		/**
		 * Verify JWT signature and standard claims.
		 *
		 * @remarks
		 * `jwt.verify` ensures:
		 * - Token integrity
		 * - Token is not expired
		 * - Token was signed using the expected secret
		 * - Issuer and audience are valid
		 */
		const payload = jwt.verify(
			token,
			accessTokenSecret,
			verifyJwtOptions
		) as JwtPayload;

		/**
		 * Validate subject (`sub`) claim.
		 *
		 * @remarks
		 * - `sub` represents the authenticated user identifier
		 * - Must conform to the application's UUID format
		 */
		const userId = ParamsSchema.uuid.safeParse({ id: payload.sub });
		if (!userId.success) {
			throw appErrorMap.badRequest(
				ErrorCode.INVALID_FORMAT,
				userId.error
			);
		}

		/**
		 * Validate role claim.
		 *
		 * @remarks
		 * - Role determines authorization boundaries
		 * - Must match one of the allowed domain roles
		 */
		const role = FieldsSchema.enum<typeof Role>(Role).safeParse(
			payload.role
		);
		if (!role.success) {
			throw appErrorMap.badRequest(ErrorCode.INVALID_INPUT, role.error);
		}

		/**
		 * Validate `iat` (Issued At) claim.
		 *
		 * @remarks
		 * - Indicates when the token was issued
		 * - Used for advanced security checks such as:
		 *   - Token invalidation after password change
		 *   - Forced logout / session revocation
		 * - Must be a numeric UNIX timestamp per JWT spec
		 */
		if (typeof payload.iat !== 'number') {
			throw appErrorMap.badRequest(ErrorCode.INVALID_FORMAT);
		}

		/**
		 * Normalize verified JWT payload into application-safe data.
		 *
		 * @remarks
		 * - Only validated and trusted fields are exposed
		 * - Raw JWT payload is never leaked into the app
		 * - Returned object becomes the single source of truth
		 *   for authenticated identity
		 */
		return {
			id: userId.data.id,
			role: role.data as Role,
			issuedAt: payload.iat,
		};
	} catch (error: unknown) {
		/**
		 * Catch any verification or validation failure
		 * and convert it into a unified unauthorized error.
		 */
		throw appErrorMap.unauthorized(ErrorCode.TOKEN_INVALID, error);
	}
};

/**
 * Verifies a refresh token and extracts the subject identity.
 *
 * @remarks
 * Refresh tokens:
 * - Are long-lived
 * - Must contain minimal data
 * - Are used exclusively to issue new access tokens
 *
 * They must NEVER grant direct access to protected resources.
 *
 * @param token - JWT refresh token
 * @returns Verified refresh token payload
 * @throws Unauthorized or validation errors if verification fails
 */
export const verifyRefreshToken = (token: string): VerifiedRefreshToken => {
	try {
		/**
		 * Verify JWT signature and expiration.
		 *
		 * @remarks
		 * Uses a dedicated refresh secret to reduce
		 * blast radius if an access token secret leaks.
		 */
		const payload = jwt.verify(
			token,
			refreshTokenSecret,
			verifyJwtOptions
		) as JwtPayload;

		/**
		 * Validate subject (`sub`) claim.
		 *
		 * @remarks
		 * - Identifies the account requesting token refresh
		 * - Must be a valid UUID
		 */
		const userId = ParamsSchema.uuid.safeParse({ id: payload.sub });
		if (!userId.success) {
			throw appErrorMap.badRequest(
				ErrorCode.INVALID_FORMAT,
				userId.error
			);
		}

		/**
		 * Validate `iat` (Issued At) claim.
		 *
		 * @remarks
		 * - Required to support refresh token rotation
		 * - Enables revocation strategies (e.g. password change)
		 */
		if (typeof payload.iat !== 'number') {
			throw appErrorMap.badRequest(ErrorCode.INVALID_FORMAT);
		}

		/**
		 * Normalize refresh token payload.
		 *
		 * @remarks
		 * Only the minimal identity data required to issue
		 * a new access token is returned.
		 */
		return {
			id: userId.data.id,
			issuedAt: payload.iat,
		};
	} catch (error: unknown) {
		/**
		 * Any refresh token failure is treated as unauthorized
		 * to prevent token probing or abuse.
		 */
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
export const hashToken = (token: string): string => {
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

/**
 * @description Returns the expiration Date for different token types.
 *
 * Token Expiry Durations:
 * - "EMAIL_VERIFICATION": 24 hours
 * - "CHANGE_EMAIL": 60 minutes
 * - "PASSWORD_RESET": 15 minutes
 *
 * Explain type names:
 * - "EMAIL_VERIFICATION": EMAIL_VERIFICATION
 * - "CHANGE_EMAIL": CHANGE_EMAIL
 * - "PASSWORD_RESET": PASSWORD_RESET
 *
 * @param {TokenType} type - Either 'EMAIL_VERIFICATION', 'CHANGE_EMAIL', or 'PASSWORD_RESET'.
 * @returns {Date}
 */
export const setExpiredAt = (type: TokenType): Date => {
	//* the verify email token will expire in 24 hours
	if (type === TokenType.EMAIL_VERIFICATION)
		return addMinutes(new Date(), 60 * 24);

	//* the change email token will expire in 60 minutes
	if (type === TokenType.CHANGE_EMAIL) return addMinutes(new Date(), 60);

	//* the password reset token will expire in 15 minutes
	return addMinutes(new Date(), 15);
};
