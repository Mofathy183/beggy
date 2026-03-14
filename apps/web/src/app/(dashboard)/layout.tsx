'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';
import { AuthGate } from '@shared/guards';
import { AppShell } from '@shared/layouts';

/**
 * DashboardLayout
 *
 * Layout for all routes inside (dashboard)/:
 *  - Wraps every dashboard page with AppShell (Header + Sidebar)
 *  - Delegates session enforcement to AuthGate
 *  - Redirects users who have NOT completed onboarding back to /onboarding
 *
 * Redirect rules:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │ status            │ onboardingCompleted │ action                 │
 *  ├──────────────────────────────────────────────────────────────────┤
 *  │ unauthenticated   │ any                 │ AuthGate → /login      │
 *  │ authenticated     │ false               │ → /onboarding          │
 *  │ authenticated     │ true                │ render AppShell        │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 * Soft Nudge note:
 * This layout is the correct place to inject the Getting Started
 * checklist widget in a future iteration. It will read profile
 * completeness from authSlice (already populated by AuthGate → /auth/me)
 * and render the widget alongside AppShell — zero extra API calls.
 */
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { status, profile, initialized } = useAppSelector((s) => s.auth);

	console.log('PRO => ', profile);

	useEffect(() => {
		if (!initialized) return;

		// Authenticated but onboarding not completed → send to onboarding
		// This is the only redirect this layout owns.
		// Unauthenticated users are handled entirely by AuthGate.
		if (
			status === 'authenticated' &&
			profile !== null &&
			!profile.onboardingCompleted
		) {
			router.replace('/onboarding');
		}
	}, [initialized, status, profile, router]);

	return (
		<AuthGate>
			<AppShell>{children}</AppShell>
		</AuthGate>
	);
}
