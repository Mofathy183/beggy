'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@shared/store';
import { authApi } from '@features/auth';
import { clearPermissions } from '@shared/store/ability';

/**
 * useLogout
 *
 * Centralized logout lifecycle handler.
 *
 * @remarks
 * Responsibilities:
 * - Invalidate server-side session
 * - Revoke all client-side permissions
 * - Reset auth-related RTK Query cache
 * - Redirect user to a public route
 *
 * This hook is the **single source of truth**
 * for logout behavior across the app.
 */
const useLogout = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const [logout] = authApi.useLogoutMutation();

	return async () => {
		try {
			/**
			 * Attempt server-side logout.
			 *
			 * Failure here should NOT block client-side
			 * security cleanup.
			 */
			await logout().unwrap();
		} catch (error: unknown) {
			// Intentionally ignored
		} finally {
			/**
			 * Clear all permissions immediately.
			 *
			 * This ensures:
			 * - CASL ability is emptied
			 * - ProtectedRoute denies access
			 */
			dispatch(clearPermissions());

			/**
			 * Reset auth-related API cache
			 * to prevent stale session usage.
			 */
			dispatch(authApi.util.resetApiState());

			/**
			 * Redirect to public entry point.
			 */
			router.replace('/login');
		}
	};
};

export default useLogout;
