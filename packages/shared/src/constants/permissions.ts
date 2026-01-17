import type { Permissions } from '../types/auth.types.js';
import { Role, Action, Scope, Subject } from '../constants/auth.enums.js';

/**
 * Default permission matrix for each application role.
 *
 * @remarks
 * - Acts as the **single source of truth** for RBAC defaults
 * - Used during:
 *   - Initial database seeding
 *   - Permission sync / migrations
 *   - Runtime authorization checks
 * - Should remain **deterministic and declarative**
 *
 * @example
 * ```ts
 * const permissions = RolePermissions[Role.ADMIN];
 * ```
 */
export const RolePermissions: Record<Role, Permissions> = {
	[Role.ADMIN]: [
		/**
		 * Administrators have unrestricted access across all resources.
		 * MANAGE implies CREATE, READ, UPDATE, and DELETE.
		 */
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.USER },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.BAG },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ITEM },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.SUITCASE },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ROLE },
		{
			action: Action.MANAGE,
			scope: Scope.ANY,
			subject: Subject.PERMISSION,
		},
	],

	[Role.MODERATOR]: [
		/**
		 * Moderators can fully manage domain content
		 * but have limited access to user data.
		 */
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.BAG },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ITEM },
		{ action: Action.MANAGE, scope: Scope.ANY, subject: Subject.SUITCASE },
		{ action: Action.READ, scope: Scope.ANY, subject: Subject.USER },
	],

	[Role.MEMBER]: [
		/**
		 * Members (e.g. paid users) have extended ownership privileges.
		 */
		{ action: Action.CREATE, scope: Scope.ANY, subject: Subject.BAG },
		{ action: Action.READ, scope: Scope.ANY, subject: Subject.BAG },
		{ action: Action.UPDATE, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.DELETE, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.MANAGE, scope: Scope.OWN, subject: Subject.ITEM },
		{ action: Action.MANAGE, scope: Scope.OWN, subject: Subject.SUITCASE },
	],

	[Role.USER]: [
		/**
		 * Default permissions for regular users.
		 * Access is strictly limited to owned resources.
		 */
		{ action: Action.CREATE, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.READ, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.UPDATE, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.DELETE, scope: Scope.OWN, subject: Subject.BAG },
		{ action: Action.MANAGE, scope: Scope.OWN, subject: Subject.ITEM },
		{ action: Action.READ, scope: Scope.OWN, subject: Subject.USER },
		{ action: Action.UPDATE, scope: Scope.OWN, subject: Subject.USER },
	],
};
