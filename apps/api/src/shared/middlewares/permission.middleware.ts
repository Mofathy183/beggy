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
import { logger } from '@shared/middlewares';
import { appErrorMap } from '@shared/utils';

// ─────────────────────────────────────────────────────────────────────────────
// ABILITY TYPE
// ─────────────────────────────────────────────────────────────────────────────

export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

// ─────────────────────────────────────────────────────────────────────────────
// ABILITY BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a CASL ability instance for a given user role.
 *
 * @remarks
 * ### What this does
 * Translates the flat `RolePermissions` matrix into scoped CASL rules.
 * Two expansion rules are applied at build time:
 *
 * 1. MANAGE on a subject registers rules for BOTH :OWN and :ANY scopes —
 *    a role with MANAGE has full access regardless of what scope a route requires.
 *
 * 2. ANY scope registers an additional :OWN rule —
 *    a role that can act on ALL records of a type can obviously act on their own.
 *
 * ### What this does NOT do
 * - Does not enforce ownership (OWN vs ANY at the data level).
 *   That is the service layer's responsibility.
 * - Does not read from the database.
 *   RolePermissions is the in-memory source of truth.
 *
 * @param role - Authenticated user's role from the JWT
 * @returns A fully constructed AppAbility instance for this request
 */
export const defineAbilityFor = (role: Role): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	const permissions: Permissions = RolePermissions[role] ?? [];

	for (const permission of permissions) {
		if (permission.action === Action.MANAGE) {
			// MANAGE is a super-action covering all CRUD at any scope.
			// Register on both so the check passes whether the route
			// requires :OWN or :ANY.
			can(Action.MANAGE, `${permission.subject}:${Scope.ANY}`);
			can(Action.MANAGE, `${permission.subject}:${Scope.OWN}`);
		} else {
			// Register the exact scoped rule from the permission matrix.
			can(permission.action, `${permission.subject}:${permission.scope}`);

			if (permission.scope === Scope.ANY) {
				// ANY is a superset of OWN. A role that can READ BAG:ANY
				// can also READ BAG:OWN — register both so OWN-scoped
				// routes pass for roles with ANY-level access.
				can(permission.action, `${permission.subject}:${Scope.OWN}`);
			}
		}
	}

	return build();
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION GUARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authorization guard middleware that enforces a scoped permission using CASL.
 *
 * @remarks
 * ### Scope parameter
 * - `Scope.OWN` (default) — the route operates on the caller's own resources.
 *   Pass this for all standard user-facing CRUD routes (bags, items, suitcases).
 * - `Scope.ANY` — the route operates across all users' resources.
 *   Pass this for all admin/privileged routes (users, bulk operations).
 *
 * ### MANAGE handling
 * A role with MANAGE on a subject passes regardless of which CRUD action
 * or scope the route requires. MANAGE is always checked as a fallback.
 *
 * ### Middleware ordering
 * requireAuth MUST run before requirePermission. If req.ability is missing,
 * that is a developer wiring error and results in a 500.
 *
 * @param action  - CRUD action the route performs (CREATE / READ / UPDATE / DELETE)
 * @param subject - Resource the route operates on (BAG / USER / ITEM / etc.)
 * @param scope   - Required access level (OWN = caller's resources, ANY = all resources)
 *                  Defaults to Scope.OWN — always pass Scope.ANY for admin routes.
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

		// Check the specific action first, then fall back to MANAGE.
		// Both checks use the scoped subject so scope is always enforced.
		const hasPermission =
			req.ability.can(action, scopedSubject) ||
			req.ability.can(Action.MANAGE, scopedSubject);

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
