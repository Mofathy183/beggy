// src/app/onboarding/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';

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
		if (status === 'unauthenticated') router.replace('/login');
		// Profile exists → already onboarded, go to dashboard
		if (status === 'authenticated' && profile !== null)
			router.replace('/dashboard');
	}, [initialized, status, profile, router]);

	if (!initialized) return null;

	// Let the redirect effects fire before rendering anything
	if (status === 'unauthenticated') return null;
	if (status === 'authenticated' && profile !== null) return null;

	return <>{children}</>;
}
