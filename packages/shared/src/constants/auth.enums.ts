/**
 * Application-level user roles.
 *
 * @remarks
 * - Roles define **permission bundles**, not behavior
 * - Changing a role's capabilities should be done via permissions,
 *   not conditionals in business logic
 */
export enum Role {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
	MODERATOR = 'MODERATOR',
	USER = 'USER',
}

/**
 * Supported authentication providers.
 *
 * @remarks
 * - Defines how a user authenticates with the system
 * - Used for login flows, account linking, and security auditing
 * - Designed to be safely extendable (e.g. APPLE, GITHUB) without
 *   breaking existing users or accounts
 */
export enum AuthProvider {
	/**
	 * Google OAuth provider.
	 */
	GOOGLE = 'GOOGLE',

	/**
	 * Facebook OAuth provider.
	 */
	FACEBOOK = 'FACEBOOK',

	/**
	 * Native email/password authentication.
	 */
	LOCAL = 'LOCAL',
}

/**
 * Types of one-time or short-lived tokens.
 *
 * @remarks
 * - Used for security-sensitive workflows
 * - Each type usually has a different expiration policy
 */
export enum TokenType {
	EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
	PASSWORD_RESET = 'PASSWORD_RESET',
	CHANGE_EMAIL = 'CHANGE_EMAIL',
}

/**
 * Domain entities that can be protected by permissions.
 *
 * @remarks
 * - Acts as the RBAC "resource" identifier
 * - Should map closely to API models or bounded contexts
 */
export enum Subject {
	USER = 'USER',
	PROFILE = 'PROFILE',
	BAG = 'BAG',
	ITEM = 'ITEM',
	SUITCASE = 'SUITCASE',
	ROLE = 'ROLE',
	PERMISSION = 'PERMISSION',
}

/**
 * Scope of a permission.
 *
 * @remarks
 * - OWN: resource is owned by the current user
 * - ANY: applies globally across all resources
 */
export enum Scope {
	OWN = 'OWN',
	ANY = 'ANY',
}

/**
 * Actions that can be performed on a subject.
 *
 * @remarks
 * - MANAGE is a super-action that implies all CRUD operations
 * - Useful for reducing permission verbosity
 */
export enum Action {
	CREATE = 'CREATE',
	READ = 'READ',
	UPDATE = 'UPDATE',
	DELETE = 'DELETE',
	MANAGE = 'MANAGE',
}
