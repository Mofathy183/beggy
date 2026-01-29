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
 * Authentication providers supported by the system.
 */
export enum AuthProvider {
	GOOGLE = 'GOOGLE',
	FACEBOOK = 'FACEBOOK',
	LOCAL = 'LOCAL',
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
