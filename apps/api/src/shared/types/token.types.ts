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
 * Used after successful JWT verification to authorize requests.
 */
export type VerifiedAccessToken = {
	/**
	 * Subject identifier (usually user or account ID).
	 */
	id: string;

	/**
	 * Role associated with the authenticated subject.
	 */
	role: Role;
};

/**
 * Payload extracted from a verified refresh token.
 *
 * Refresh tokens should contain minimal data to reduce risk.
 */
export type VerifiedRefreshToken = {
	/**
	 * Subject identifier (usually user or account ID).
	 */
	id: string;
};
