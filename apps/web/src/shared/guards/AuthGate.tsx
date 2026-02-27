'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

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

	const { status, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (initialized && status === 'unauthenticated') {
			router.replace('/login');
		}
	}, [initialized, status, router]);

	// Still resolving — don't flash protected content or redirect prematurely
	if (!initialized) return null; // swap null with <FullScreenSkeleton /> later

	// Unauthenticated — redirect is in flight, render nothing
	if (status === 'unauthenticated') return null;
	/**
	 * If authenticated, render protected children.
	 */
	return <>{children}</>;
};

export default AuthGate;
