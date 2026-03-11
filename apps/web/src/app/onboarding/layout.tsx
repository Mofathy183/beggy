'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

/**
 * OnboardingLayout
 *
 * Auth guard for the /onboarding route.
 *
 * Redirect rules (evaluated only after bootstrap completes):
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ status            │ onboardingCompleted │ action            │
 *  ├─────────────────────────────────────────────────────────────┤
 *  │ unauthenticated   │ any                 │ → /login          │
 *  │ authenticated     │ true                │ → /dashboard      │
 *  │ authenticated     │ false               │ render children   │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * Render guard mirrors redirect logic to prevent flash:
 * - Returns null while bootstrap is in-flight
 * - Returns null while redirect effects are firing
 * - Only renders children for the authenticated + not-onboarded case
 */
export default function OnboardingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { status, profile, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (!initialized) return;

		// No session → go log in
		if (status === 'unauthenticated') {
			router.replace('/login');
			return;
		}

		// Already completed onboarding → go to dashboard
		// This handles returning users who somehow land on /onboarding again
		if (status === 'authenticated' && profile?.onboardingCompleted) {
			router.replace('/dashboard');
		}
	}, [initialized, status, profile, router]);

	// ── Render guards ────────────────────────────────────────────────────────
	// Return null in all cases where a redirect will fire, to prevent
	// the onboarding page from briefly flashing before navigation.

	// Bootstrap not yet complete
	if (!initialized) return null;

	// Unauthenticated — redirect effect will fire
	if (status === 'unauthenticated') return null;

	// Already onboarded — redirect effect will fire
	if (status === 'authenticated' && profile?.onboardingCompleted) return null;

	// Safe to render: authenticated + onboarding not yet completed
	return <>{children}</>;
}
