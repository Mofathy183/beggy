import { Role } from '@prisma/generated/prisma/enums';
import type {
	AuthTokens,
	PaginationPayload,
	AuthUser,
	AppAbility,
} from '@shared/types';
import { OrderBy } from '@shared/types';

/**
 * Global Express type augmentations.
 *
 * @remarks
 * This file extends Express request and user typings with
 * application-specific authentication, authorization, and
 * list-query metadata.
 *
 * These properties are injected by middleware and are therefore
 * optional by design.
 */
declare global {
	namespace Express {
		interface Request {
			/**
			 * Normalized pagination parameters extracted from the query string.
			 *
			 * @remarks
			 * - Added by the list-query middleware
			 * - Guaranteed to be validated and normalized when present
			 * - Includes derived values such as `offset`
			 * - Undefined when pagination is disabled for the route
			 */
			pagination?: PaginationPayload;

			/**
			 * Normalized ordering parameters extracted from the query string.
			 *
			 * @remarks
			 * - Added by the list-query middleware
			 * - Represents a validated and safe ordering instruction
			 * - `orderBy` is guaranteed (by schema) to be an allowed sortable field
			 * - `direction` defaults to `ASC` when not explicitly provided
			 */
			orderBy?: OrderBy;

			/**
			 * Parsed authentication tokens extracted from cookies or headers.
			 *
			 * @remarks
			 * - Added by authentication middleware
			 * - Presence does NOT imply authentication was successful
			 * - Final authentication state is represented by `req.user`
			 */
			authTokens?: AuthTokens;

			/**
			 * CASL ability instance representing the current user's permissions.
			 *
			 * @remarks
			 * - Initialized by `requireAuth` after successful authentication
			 * - Used by authorization middleware (e.g. `requirePermission`)
			 * - Undefined when authentication middleware has not run
			 */
			ability?: AppAbility;

			/**
			 * Minimal refresh token context attached by `requireRefreshToken`.
			 *
			 * @remarks
			 * - Represents a previously authenticated identity
			 * - Must never be treated as an authenticated user
			 * - Intended exclusively for token refresh flows
			 */
			refreshPayload?: {
				userId: string;
			};
		}

		/**
		 * Authenticated user representation attached to `req.user`.
		 *
		 * @remarks
		 * - Populated after access token verification
		 * - Represents the minimum trusted identity payload
		 * - Should remain lightweight and free of database entities
		 */
		interface User extends AuthUser {}
	}
}
