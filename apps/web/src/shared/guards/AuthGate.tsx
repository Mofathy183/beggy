'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMeQuery } from '../../features/auth/auth.api';
import { useAppDispatch } from '@shared/store';
import { setPermissions, clearPermissions } from '@shared/store/ability';

type AuthGateProps = {
	/** UI rendered only when the user is authenticated */
	children: React.ReactNode;
};

/**
 * AuthGate
 *
 * Authentication boundary for protected application areas.
 *
 * @remarks
 * Responsibilities:
 * - Ensures a valid authenticated session exists
 * - Bootstraps permission state from `/auth/me`
 * - Redirects unauthenticated users to `/login`
 *
 * Non-responsibilities:
 * - Does NOT perform permission checks
 * - Does NOT render forbidden (403) UI
 * - Does NOT infer or modify permissions
 *
 * This component should typically wrap:
 * - protected layouts
 * - dashboards
 * - authenticated-only routes
 */
const AuthGate = ({ children }: AuthGateProps) => {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const { data, isLoading, isError } = useMeQuery();

	/**
	 * Synchronize permissions into Redux when auth state changes.
	 */
	useEffect(() => {
		if (data?.data?.permissions) {
			dispatch(
				setPermissions({
					permissions: data.data.permissions,
				})
			);
		}
	}, [data, dispatch]);

	/**
	 * Handle unauthenticated state.
	 *
	 * Any error from `/auth/me` is treated as:
	 * - no active session
	 * - user must re-authenticate
	 */
	useEffect(() => {
		if (!isLoading && isError) {
			dispatch(clearPermissions());
			router.replace('/login');
		}
	}, [isLoading, isError, dispatch, router]);

	/**
	 * While authentication state is resolving,
	 * avoid rendering protected content.
	 *
	 * Replace this with a skeleton or spinner if desired.
	 */
	if (isLoading) {
		return null;
	}

	/**
	 * If authenticated, render protected children.
	 */
	return <>{children}</>;
};

export default AuthGate;
