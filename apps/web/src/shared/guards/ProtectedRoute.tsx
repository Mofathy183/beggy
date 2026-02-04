'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Action, Subject } from '@beggy/shared/constants';
import { useAbility } from '@shared/store/ability';

type ProtectedRouteProps = {
	/** Required action to access this route */
	action: Action;
	/** Required subject to access this route */
	subject: Subject;
	/** Route content */
	children: React.ReactNode;
};

/**
 * ProtectedRoute
 *
 * Authorization boundary for route-level access control.
 *
 * @remarks
 * Responsibilities:
 * - Prevent access to routes the user is not authorized to view
 * - Redirect to a dedicated forbidden (403) page when access is denied
 *
 * Assumptions:
 * - Authentication is already resolved by {@link AuthGate}
 * - Permissions are already loaded into Redux
 *
 * Design decisions:
 * - Does NOT redirect to login
 * - Does NOT attempt to refresh authentication
 * - Does NOT silently hide forbidden content
 *
 * Forbidden access is treated as a **hard stop**.
 */
const ProtectedRoute = ({ action, subject, children }: ProtectedRouteProps) => {
	const router = useRouter();
	const ability = useAbility();

	const isAllowed = ability.can(action, subject);

	/**
	 * Redirect forbidden access **after render** to avoid
	 * side effects during the render phase.
	 */
	useEffect(() => {
		if (!isAllowed) {
			router.replace('/forbidden');
		}
	}, [isAllowed, router]);

	/**
	 * Block rendering while redirecting.
	 */
	if (!isAllowed) {
		return null;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
