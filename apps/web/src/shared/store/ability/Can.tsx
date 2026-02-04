'use client';

import type { Action, Subject } from '@beggy/shared/constants';
import { useAbility } from './useAbility';

type CanProps = {
	/** Action to check (e.g. READ, UPDATE, DELETE) */
	action: Action;
	/** Subject to check against (e.g. USER, BAG, PROFILE) */
	subject: Subject;
	/** Elements rendered only if permission is granted */
	children: React.ReactNode;
};

/**
 * Declarative permission guard component.
 *
 * @remarks
 * - Renders children **only if** the user is allowed to perform
 *   the given action on the given subject
 * - Does NOT handle ownership or scope checks (API responsibility)
 * - Returns `null` when access is denied (hidden UI pattern)
 *
 * @example
 * ```tsx
 * <Can action={Action.UPDATE} subject={Subject.BAG}>
 *   <EditBagButton />
 * </Can>
 * ```
 */
const Can = ({ action, subject, children }: CanProps) => {
	const ability = useAbility();

	/**
	 * Hide content entirely when permission is missing.
	 * Alternative patterns (disable, tooltip) should be handled by callers.
	 */
	if (!ability.can(action, subject)) return null;

	return <>{children}</>;
};

export default Can;
