'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

type PublicOnlyRouteProps = {
	/** Elements accessible only to unauthenticated users */
	children: React.ReactNode;
};

/**
 * Public-only route guard.
 *
 * @description
 * Prevents authenticated users from accessing public pages
 * such as login or registration screens.
 *
 * @remarks
 * - Redirects authenticated users to `/dashboard`.
 * - Renders nothing until auth state is initialized to avoid UI flicker.
 * - Designed for client-side enforcement only. Must not replace
 *   server-side authorization when required.
 */
const PublicOnlyRoute = ({ children }: PublicOnlyRouteProps) => {
	const router = useRouter();
	const { status, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (initialized && status === 'authenticated') {
			router.replace('/dashboard');
		}
	}, [initialized, status, router]);

	// Avoid rendering before auth state hydration completes
	if (!initialized) return null;

	// Prevent brief exposure before redirect executes
	if (status === 'authenticated') return null;

	return <>{children}</>;
};

export default PublicOnlyRoute;
