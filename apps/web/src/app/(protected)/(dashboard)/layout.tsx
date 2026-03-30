'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';
import { AppShell } from '@shared/layouts';

/**
 * DashboardLayout
 *
 * Chrome and onboarding guard for all routes under `(dashboard)/`.
 * Auth is already guaranteed by the parent `(protected)/layout.tsx` —
 * this layout must NOT repeat the AuthGate.
 *
 * Responsibilities — and ONLY these:
 *  ✅ Wrap pages in AppShell (Header + Sidebar)
 *  ✅ Redirect authenticated users who haven't completed onboarding
 *
 * Does NOT:
 *  ✗ Run AuthGate — that runs once in (protected)/layout.tsx
 *
 * Redirect rules:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │ status            │ onboardingCompleted │ action                 │
 *  ├──────────────────────────────────────────────────────────────────┤
 *  │ unauthenticated   │ any                 │ (handled by AuthGate)  │
 *  │ authenticated     │ false               │ → /onboarding          │
 *  │ authenticated     │ true                │ render AppShell        │
 *  └──────────────────────────────────────────────────────────────────┘
 */
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { status, profile, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (!initialized) return;

		if (
			status === 'authenticated' &&
			profile !== null &&
			!profile.onboardingCompleted
		) {
			router.replace('/onboarding');
		}
	}, [initialized, status, profile, router]);

	return <AppShell>{children}</AppShell>;
}
