'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@shared/store';
import { AuthGate } from '@shared/guards';
import { AppShell } from '@shared/layouts';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { status, profile, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (initialized && status === 'authenticated' && profile === null) {
			router.replace('/onboarding');
		}
	}, [initialized, status, profile, router]);

	return (
		<AuthGate>
			<AppShell>{children}</AppShell>
		</AuthGate>
	);
}
