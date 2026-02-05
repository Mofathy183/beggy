'use client';

import type { Action, Subject } from '@beggy/shared/constants';
import { useAbility } from '@shared/store/ability';

type ProtectedRouteProps = {
	/** Required action to access this content */
	action: Action;
	/** Required subject to access this content */
	subject: Subject;
	/** Content rendered when access is granted */
	children: React.ReactNode;
	/** Fallback UI rendered when access is denied */
	fallback?: React.ReactNode;
};

/**
 * ProtectedRoute
 *
 * Declarative authorization boundary for UI and route-level access.
 *
 * @remarks
 * Responsibilities:
 * - Checks whether the current user can perform an action on a subject
 * - Renders children when access is allowed
 * - Renders a fallback UI when access is denied
 *
 * Non-responsibilities:
 * - Does NOT handle authentication (AuthGate responsibility)
 * - Does NOT perform navigation or redirects
 * - Does NOT infer or elevate permissions
 *
 * Design principles:
 * - Authorization is treated as a **rendering concern**
 * - Forbidden access is a **valid UI state**, not an error
 * - Routing decisions are left to the caller
 *
 * @example
 * ```tsx
 * <ProtectedRoute
 *   action={Action.READ}
 *   subject={Subject.USER}
 *   fallback={<Forbidden />}
 * >
 *   <UsersPage />
 * </ProtectedRoute>
 * ```
 */
const ProtectedRoute = ({
	action,
	subject,
	children,
	fallback = null,
}: ProtectedRouteProps) => {
	const ability = useAbility();

	const isAllowed = ability.can(action, subject);

	if (!isAllowed) {
		return <>{fallback}</>;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
