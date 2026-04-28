import { AbilityBuilder, type AbilityClass, PureAbility } from '@casl/ability';
import { Action, type Subject, Scope } from '@beggy/shared/constants';
import type { Permissions } from '@beggy/shared/types';
import { toCaslAction } from '@beggy/shared/utils';

/**
 * Compound subject key encoding both resource and scope.
 * Must match the API's ScopedSubject: `${Subject}:${Scope}`
 *
 * Examples: "BAG:OWN" | "BAG:ANY" | "USER:ANY"
 */
export type ScopedSubject = `${Subject}:${Scope}`;

/**
 * Application-wide CASL ability type.
 *
 * @remarks
 * - Uses tuple-based checks: `[Action, Subject]`
 * - Frontend authorization is **capability-based**, not role-based
 * - Ownership and scope checks are enforced by the API
 *
 * Application-wide CASL ability type.
 * Uses ScopedSubject so frontend checks mirror API authorization exactly.
 */
export type AppAbility = PureAbility<[Action, ScopedSubject]>;

/**
 * Explicit CASL ability class reference.
 *
 * Required by `AbilityBuilder` to correctly construct typed abilities.
 */
export const AppAbilityClass = PureAbility as AbilityClass<AppAbility>;

/**
 * defineAbilityForUser
 *
 * Constructs a CASL ability instance from backend-provided permissions.
 *
 * @param permissions - Flat list of permissions returned from `/auth/me`
 *
 * @remarks
 * Design principles:
 * - Backend is the **single authority** for permissions
 * - Frontend does NOT infer, merge, or elevate access
 * - No role-based shortcuts or defaults
 *
 * Security considerations:
 * - Empty permissions = zero access
 * - Permissions are applied verbatim
 * - UI authorization mirrors API authorization
 *
 * CASL configuration:
 * - Uses explicit subject detection to prevent accidental object-based checks
 * - Locks authorization to `[Action, Subject]` tuples
 *
 * @returns A fully constructed {@link AppAbility} instance

 * Constructs a CASL ability instance from backend-provided permissions.
 *
 * The API encodes scope into each permission's subject string ("BAG:OWN").
 * We register each permission verbatim — no inference, no elevation.
 *
 * Additionally, for each ANY-scoped permission we also register the OWN
 * variant, mirroring the API's builder logic: a role that can act on
 * ANY records can obviously act on their own.
 */
export const defineAbilityForUser = (permissions: Permissions): AppAbility => {
	const { can, build } = new AbilityBuilder(AppAbilityClass);

	for (const permission of permissions) {
		const caslAction = toCaslAction(permission.action) as Action;
		// ✅ Compare against the enum VALUE, not a hardcoded string literal.
		// If Action.MANAGE === 'MANAGE' at runtime this is equivalent,
		// but this form is safe if the enum value ever changes.
		if (permission.action === Action.MANAGE) {
			can(
				caslAction,
				`${permission.subject}:${Scope.OWN}` as ScopedSubject
			);
			can(
				caslAction,
				`${permission.subject}:${Scope.ANY}` as ScopedSubject
			);
		} else {
			const scopedSubject =
				`${permission.subject}:${permission.scope}` as ScopedSubject;

			can(caslAction, scopedSubject);

			if (permission.scope === Scope.ANY) {
				can(
					caslAction,
					`${permission.subject}:${Scope.OWN}` as ScopedSubject
				);
			}
		}
	}

	return build({
		// ✅ This is critical — without it CASL tries to detect subject type
		// from objects, which breaks string-based subjects entirely.
		detectSubjectType: (subject) => subject as ScopedSubject,
	});
};
