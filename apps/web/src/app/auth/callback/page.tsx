'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Luggage01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Spinner } from '@shadcn-ui/spinner';
import { useAppSelector } from '@shared/store';
import { cn } from '@shared/lib/utils';

/**
 * OAuthCallbackPage
 *
 * Silent landing pad after OAuth redirect.
 *
 * @remarks
 * - API has already set the session cookie before landing here.
 * - AuthBootstrap (root layout) fires useMeQuery automatically.
 * - This page waits for authSlice to resolve then redirects.
 * - No user input required — purely transitional.
 *
 * Redirect logic:
 * - authenticated + profile null  → /onboarding  (new OAuth user)
 * - authenticated + profile set   → /dashboard   (returning user)
 * - unauthenticated after resolve → /login?error=oauth_failed
 */
export default function OAuthCallbackPage() {
	const router = useRouter();
	const { status, profile, initialized } = useAppSelector((s) => s.auth);

	useEffect(() => {
		if (!initialized) return;

		if (status === 'authenticated') {
			router.replace(profile === null ? '/onboarding' : '/dashboard');
			return;
		}

		if (status === 'unauthenticated') {
			router.replace('/login?error=oauth_failed');
		}
	}, [initialized, status, profile, router]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
			{/* Branded logo chip — Beggy identity during transition */}
			<div
				className={cn(
					'flex h-14 w-14 items-center justify-center',
					'rounded-2xl bg-primary',
					'shadow-sm'
				)}
				aria-hidden="true"
			>
				<HugeiconsIcon
					icon={Luggage01Icon}
					size={26}
					strokeWidth={1.8}
					className="text-primary-foreground"
				/>
			</div>

			{/* Spinner + copy */}
			<div className="flex flex-col items-center gap-3">
				<Spinner
					className="text-primary"
					aria-label="Finishing sign-in"
				/>
				<div className="flex flex-col items-center gap-1">
					<p className="text-sm font-medium text-foreground">
						Finishing sign-in...
					</p>
					<p className="text-xs text-muted-foreground">
						You&apos;ll be on your way in a moment
					</p>
				</div>
			</div>
		</div>
	);
}
