import { Role } from '@beggy/shared/types';

/**
 * Represents a secure token pair used during authentication flows.
 *
 * - `token` is sent to the client (JWT or opaque token)
 * - `hash` is stored securely in the database for verification
 *
 * This pattern prevents token leakage from database exposure.
 */
export interface SecureTokenPair {
	/**
	 * Raw token value returned to the client.
	 */
	token: string;

	/**
	 * Hashed version of the token stored in the database.
	 */
	hash: string;
}

/**
 * Payload extracted from a verified access token.
 *
 * @remarks
 * This represents the **trusted, application-level identity**
 * derived from a valid access JWT.
 *
 * - Contains only the minimum data required for authorization
 * - Does NOT expose raw JWT internals
 * - Safe to attach to request context
 */
export type VerifiedAccessToken = {
	/**
	 * Subject identifier.
	 *
	 * Typically the user or account ID (`sub` claim).
	 */
	id: string;

	/**
	 * Role associated with the authenticated subject.
	 *
	 * Used for role-based authorization checks.
	 */
	role: Role;

	/**
	 * Token issuance timestamp.
	 *
	 * Unix timestamp (seconds) derived from the `iat` claim.
	 * Used for session freshness checks (e.g. password change invalidation).
	 */
	issuedAt: number;
};

/**
 * Payload extracted from a verified refresh token.
 *
 * @remarks
 * Refresh tokens are intentionally minimal to reduce security risk.
 * They should never be used to authorize requests directly.
 */
export type VerifiedRefreshToken = {
	/**
	 * Subject identifier.
	 *
	 * Typically the user or account ID (`sub` claim).
	 */
	id: string;

	/**
	 * Token issuance timestamp.
	 *
	 * Unix timestamp (seconds) derived from the `iat` claim.
	 * Useful for refresh-token rotation and session lifecycle checks.
	 */
	issuedAt: number;
};
