/**
 * Canonical error codes used across Beggy (API & Web).
 *
 * @remarks
 * - Stable, machine-readable identifiers
 * - Safe to expose to clients
 * - Used for i18n, UI handling, logging, and analytics
 *
 * @example
 * throw new AppError(ErrorCode.BAG_OVERWEIGHT);
 */
export enum ErrorCode {
	// =========================================================================
	// CLIENT ERRORS (4xx) — Invalid input, auth, permissions
	// =========================================================================

	/** Generic malformed request */
	BAD_REQUEST = 'BAD_REQUEST',

	/** Request failed schema or semantic validation */
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	INVALID_INPUT = 'INVALID_INPUT',
	MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
	INVALID_FORMAT = 'INVALID_FORMAT',

	// -------------------------------------------------------------------------
	// 401 — Authentication
	// -------------------------------------------------------------------------
	UNAUTHORIZED = 'UNAUTHORIZED',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
	TOKEN_EXPIRED = 'TOKEN_EXPIRED',
	TOKEN_INVALID = 'TOKEN_INVALID',
	TOKEN_MISSING = 'TOKEN_MISSING',
	SESSION_EXPIRED = 'SESSION_EXPIRED',
	ACCOUNT_NOT_VERIFIED = 'ACCOUNT_NOT_VERIFIED',

	// -------------------------------------------------------------------------
	// 403 — Authorization
	// -------------------------------------------------------------------------
	FORBIDDEN = 'FORBIDDEN',
	ACCESS_DENIED = 'ACCESS_DENIED',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
	ROLE_RESTRICTED = 'ROLE_RESTRICTED',

	// -------------------------------------------------------------------------
	// 404 — Not Found
	// -------------------------------------------------------------------------
	NOT_FOUND = 'NOT_FOUND',
	PAGE_NOT_FOUND = 'PAGE_NOT_FOUND', // Web UI routes
	ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND', // API routes

	RESOURCE_NOT_FOUND_WEB = 'RESOURCE_NOT_FOUND_WEB',
	USER_NOT_FOUND = 'USER_NOT_FOUND',
	BAG_NOT_FOUND = 'BAG_NOT_FOUND',
	SUITCASE_NOT_FOUND = 'SUITCASE_NOT_FOUND',
	ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
	BAG_ITEM_NOT_FOUND = 'BAG_ITEM_NOT_FOUND',
	SUITCASE_ITEM_NOT_FOUND = 'SUITCASE_ITEM_NOT_FOUND',

	// -------------------------------------------------------------------------
	// 409 — Conflict
	// -------------------------------------------------------------------------
	CONFLICT = 'CONFLICT',
	EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
	BAG_NAME_CONFLICT = 'BAG_NAME_CONFLICT',
	SUITCASE_NAME_CONFLICT = 'SUITCASE_NAME_CONFLICT',
	DUPLICATE_ITEM = 'DUPLICATE_ITEM',
	ITEM_ALREADY_PACKED = 'ITEM_ALREADY_PACKED',

	// -------------------------------------------------------------------------
	// 422 — Business rule violations
	// -------------------------------------------------------------------------
	UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',

	BAG_OVERWEIGHT = 'BAG_OVERWEIGHT',
	BAG_OVER_CAPACITY = 'BAG_OVER_CAPACITY',
	SUITCASE_OVERWEIGHT = 'SUITCASE_OVERWEIGHT',
	SUITCASE_OVER_CAPACITY = 'SUITCASE_OVER_CAPACITY',

	INVALID_BAG_CONFIGURATION = 'INVALID_BAG_CONFIGURATION',
	INVALID_SUITCASE_CONFIGURATION = 'INVALID_SUITCASE_CONFIGURATION',
	INVALID_BAG_DIMENSIONS = 'INVALID_BAG_DIMENSIONS',
	INVALID_SUITCASE_DIMENSIONS = 'INVALID_SUITCASE_DIMENSIONS',
	INVALID_WEIGHT_VALUE = 'INVALID_WEIGHT_VALUE',
	INVALID_CAPACITY_VALUE = 'INVALID_CAPACITY_VALUE',
	CANNOT_PACK_ITEM = 'CANNOT_PACK_ITEM',

	// -------------------------------------------------------------------------
	// 429 — Rate limiting
	// -------------------------------------------------------------------------
	RATE_LIMITED = 'RATE_LIMITED',
	TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

	// =========================================================================
	// VALIDATION & DATABASE (Internal but user-visible)
	// =========================================================================

	/** Zod / schema parsing failure */
	INVALID_REQUEST_DATA = 'INVALID_REQUEST_DATA',

	/** Prisma P2002 */
	RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',

	/** Prisma P2001 / P2025 */
	RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

	/** Prisma P2003 */
	INVALID_RELATION_REFERENCE = 'INVALID_RELATION_REFERENCE',

	DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
	DATABASE_ERROR = 'DATABASE_ERROR',
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

	// =========================================================================
	// SERVER ERRORS (5xx)
	// =========================================================================

	INTERNAL_ERROR = 'INTERNAL_ERROR',
	DATABASE_ERROR_WEB = 'DATABASE_ERROR_WEB',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	OPERATION_FAILED = 'OPERATION_FAILED',

	SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
	EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',

	// =========================================================================
	// AUTHENTICATION DETAILS
	// =========================================================================

	INVALID_EMAIL = 'INVALID_EMAIL',
	INVALID_PASSWORD = 'INVALID_PASSWORD',
	PASSWORD_TOO_WEAK = 'PASSWORD_TOO_WEAK',
	PASSWORDS_DO_NOT_MATCH = 'PASSWORDS_DO_NOT_MATCH',
	CURRENT_PASSWORD_INCORRECT = 'CURRENT_PASSWORD_INCORRECT',
	SAME_AS_OLD_PASSWORD = 'SAME_AS_OLD_PASSWORD',

	EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
	VERIFICATION_TOKEN_INVALID = 'VERIFICATION_TOKEN_INVALID',
	VERIFICATION_TOKEN_EXPIRED = 'VERIFICATION_TOKEN_EXPIRED',
	RESET_TOKEN_INVALID = 'RESET_TOKEN_INVALID',
	RESET_TOKEN_EXPIRED = 'RESET_TOKEN_EXPIRED',
	ALREADY_VERIFIED = 'ALREADY_VERIFIED',

	// OAuth
	OAUTH_FAILED = 'OAUTH_FAILED',
	GOOGLE_AUTH_FAILED = 'GOOGLE_AUTH_FAILED',
	FACEBOOK_AUTH_FAILED = 'FACEBOOK_AUTH_FAILED',
	OAUTH_ACCOUNT_NOT_FOUND = 'OAUTH_ACCOUNT_NOT_FOUND',
	OAUTH_EMAIL_CONFLICT = 'OAUTH_EMAIL_CONFLICT',

	// =========================================================================
	// DOMAIN — Packing Logic
	// =========================================================================

	MAX_BAGS_REACHED = 'MAX_BAGS_REACHED',
	MAX_SUITCASES_REACHED = 'MAX_SUITCASES_REACHED',

	BAG_ALREADY_FULL = 'BAG_ALREADY_FULL',
	SUITCASE_ALREADY_FULL = 'SUITCASE_ALREADY_FULL',

	CANNOT_DELETE_NON_EMPTY_BAG = 'CANNOT_DELETE_NON_EMPTY_BAG',
	CANNOT_DELETE_NON_EMPTY_SUITCASE = 'CANNOT_DELETE_NON_EMPTY_SUITCASE',

	ITEM_TOO_HEAVY = 'ITEM_TOO_HEAVY',
	ITEM_TOO_LARGE = 'ITEM_TOO_LARGE',
	INVALID_ITEM_QUANTITY = 'INVALID_ITEM_QUANTITY',
	ITEM_NOT_IN_BAG = 'ITEM_NOT_IN_BAG',
	ITEM_NOT_IN_SUITCASE = 'ITEM_NOT_IN_SUITCASE',

	INSUFFICIENT_SPACE = 'INSUFFICIENT_SPACE',
	INSUFFICIENT_WEIGHT_CAPACITY = 'INSUFFICIENT_WEIGHT_CAPACITY',
	PACKING_VALIDATION_ERROR = 'PACKING_VALIDATION_ERROR',
	INVALID_PACKING_ORDER = 'INVALID_PACKING_ORDER',

	// =========================================================================
	// API-ONLY / INFRASTRUCTURE
	// =========================================================================

	SESSION_DESTROY_FAILED = 'SESSION_DESTROY_FAILED',
	PASSWORD_HASH_FAILED = 'PASSWORD_HASH_FAILED',
	PASSWORD_VERIFY_FAILED = 'PASSWORD_VERIFY_FAILED',

	/** Authorization middleware executed before authentication */
	ABILITY_NOT_INITIALIZED = 'ABILITY_NOT_INITIALIZED',
}
