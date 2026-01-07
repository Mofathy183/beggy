import { Role } from '@prisma/generated/prisma/enums';
import { type NormalizedPagination } from '@shared/types';
import { OrderBy } from '@shared/types';

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
			pagination?: NormalizedPagination;

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
		}
	}
}

//* Extend Express Session interface locally
declare module 'express-session' {
	interface SessionData {
		userId: string;
		userRole: Role;
	}
}
