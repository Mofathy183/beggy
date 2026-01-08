import type { Request, Response, NextFunction } from 'express';
import { AbilityClass, PureAbility, AbilityBuilder } from '@casl/ability';
import { RolePermissions, ErrorCode } from '@beggy/shared/constants';
import { Role, Permissions, Action, Subject } from '@beggy/shared/types';
import type { AppAbility } from '@shared/types';
import { appErrorMap } from '@shared/utils';

/**
 * CASL Ability class bound to the application's ability type.
 *
 * @remarks
 * - Uses CASL `PureAbility` as the base engine
 * - Typed with {@link AppAbility} to enforce valid actions and subjects
 * - Passed to {@link AbilityBuilder} when defining abilities
 *
 * This indirection allows strong typing without leaking CASL internals
 * throughout the codebase.
 */
export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

/**
 * Builds a CASL ability instance for a given user role.
 *
 * @remarks
 * - Translates role-based permissions into CASL rules
 * - Does NOT handle ownership (OWN vs ANY); ownership is enforced
 *   explicitly in the service layer
 * - Intended to be called once per request (typically in `requireAuth`)
 *
 * @param role - Authenticated user's role
 * @returns A fully constructed {@link AppAbility} instance
 */
export const defineAbilityFor = (role: Role): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	// Resolve permissions for the given role (fallback to empty set)
	const permissions: Permissions = RolePermissions[role] ?? [];

	// Register each permission as a CASL rule
	for (const permission of permissions) {
		can(permission.action, permission.subject);
	}

	return build();
};

/**
 * Authorization guard middleware that enforces a specific permission using CASL.
 *
 *! IMPORTANT
 * This middleware MUST be preceded by `requireAuth`.
 *
 * If `req.ability` is missing, this indicates a developer
 * wiring/configuration error and will result in a server error.
 *
 * @remarks
 * - Requires `req.ability` to be initialized beforehand
 *   (typically by `requireAuth`)
 * - Throws a server error if ability is missing, indicating
 *   a middleware wiring/configuration issue
 * - Throws a forbidden error if the user lacks the required permission
 *
 * @param action - Action being performed (e.g. CREATE, UPDATE)
 * @param subject - Target subject/resource (e.g. BAG, ITEM)
 */
export const requirePermission =
	(action: Action, subject: Subject) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		/**
		 * Ability must exist if authentication middleware
		 * ran correctly.
		 */
		if (!req.ability) {
			throw appErrorMap.serverError(ErrorCode.ABILITY_NOT_INITIALIZED);
		}

		/**
		 * Enforce authorization using CASL rules.
		 */
		if (req.ability.cannot(action, subject)) {
			throw appErrorMap.forbidden(ErrorCode.INSUFFICIENT_PERMISSIONS);
		}

		next();
	};
