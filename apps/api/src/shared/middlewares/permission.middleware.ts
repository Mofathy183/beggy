import type { Request, Response, NextFunction } from 'express';
import { type AbilityClass, PureAbility, AbilityBuilder } from '@casl/ability';
import { RolePermissions, ErrorCode } from '@beggy/shared/constants';
import {
	type Role,
	Action,
	Scope,
	type Subject,
} from '@prisma-generated/enums';
import type { AppAbility, ScopedSubject } from '@shared/types';
import type { Permissions } from '@beggy/shared/types';
import { toCaslAction } from '@beggy/shared/utils';
import { logger } from '@shared/middlewares';
import { appErrorMap } from '@shared/utils';

/**
 * Typed CASL ability class used across the application.
 */
export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

/**
 * Builds a CASL ability instance for a given user role.
 *
 * @param role - Authenticated user's role
 * @returns Ability instance used for permission checks
 *
 * @remarks
 * Expands permission rules to simplify runtime checks:
 * - MANAGE → grants access to both OWN and ANY scopes
 * - ANY → implicitly grants OWN access
 *
 * Does not enforce ownership at the data level.
 */
export const defineAbilityFor = (role: Role): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	const permissions: Permissions = RolePermissions[role] ?? [];

	for (const permission of permissions) {
		const caslAction = toCaslAction(permission.action) as Action;

		// Normalize MANAGE handling explicitly
		if (caslAction === Action.MANAGE) {
			can(caslAction, `${permission.subject}:${Scope.ANY}`);
			can(caslAction, `${permission.subject}:${Scope.OWN}`);
			continue;
		}

		can(caslAction, `${permission.subject}:${permission.scope}`);

		// ANY implies OWN
		if (permission.scope === Scope.ANY) {
			can(caslAction, `${permission.subject}:${Scope.OWN}`);
		}
	}

	return build();
};

/**
 * Express middleware enforcing scoped permissions using CASL.
 *
 * @param action - CRUD action required by the route
 * @param subject - Target resource
 * @param scope - Access scope (OWN or ANY)
 *
 * @throws {AppError} ABILITY_NOT_INITIALIZED if ability is missing
 * @throws {AppError} INSUFFICIENT_PERMISSIONS if access is denied
 *
 * @remarks
 * - Requires `requireAuth` to run beforehand
 * - Uses `subject:scope` pattern for resource scoping
 * - Relies on CASL rule expansion for MANAGE handling
 */
export const requirePermission =
	(action: Action, subject: Subject, scope: Scope = Scope.OWN) =>
	async (req: Request, _res: Response, next: NextFunction) => {
		if (!req.ability) {
			logger.error(
				{
					domain: 'auth',
					middleware: 'requirePermission',
					action,
					subject,
					scope,
				},
				'Ability not initialized before permission check'
			);

			throw appErrorMap.serverError(ErrorCode.ABILITY_NOT_INITIALIZED);
		}

		const scopedSubject: ScopedSubject = `${subject}:${scope}`;
		const caslAction = toCaslAction(action) as Action;

		const hasPermission = req.ability.can(caslAction, scopedSubject);

		if (!hasPermission) {
			logger.warn(
				{
					domain: 'auth',
					middleware: 'requirePermission',
					userId: req.user?.id,
					action,
					subject,
					scope,
				},
				'Permission denied'
			);

			throw appErrorMap.forbidden(ErrorCode.INSUFFICIENT_PERMISSIONS);
		}

		next();
	};
