'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Luggage01Icon } from '@hugeicons/core-free-icons';
import OnboardingForm from '@features/profiles/components/forms/OnboardingForm';

/**
 * OnboardingPage
 *
 * Route: /onboarding
 * Layout: /onboarding/layout.tsx  ← auth guard already there
 *
 * Design: warm, travel-journal first impression.
 * Soft teal radial washes + subtle dot-grid give depth
 * without competing with the form card.
 */
export default function OnboardingPage() {
	return (
		<main className="relative min-h-screen overflow-hidden bg-background">
			{/* ── Decorative background ─────────────────────────────────── */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-0"
			>
				{/* Teal wash — top-left */}
				<div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
				{/* Accent wash — bottom-right */}
				<div className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full bg-accent/40 blur-3xl" />
				{/* Passport dot-grid */}
				<div
					className="absolute inset-0 opacity-[0.025]"
					style={{
						backgroundImage:
							'radial-gradient(circle, oklch(var(--primary)) 1px, transparent 1px)',
						backgroundSize: '28px 28px',
					}}
				/>
			</div>

			{/* ── Content ───────────────────────────────────────────────── */}
			<div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
				{/* Brand lockup */}
				<div className="mb-8 flex flex-col items-center gap-3 animate-fade-in">
					<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
						<HugeiconsIcon
							icon={Luggage01Icon}
							size={28}
							className="text-primary-foreground"
						/>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold tracking-tight text-foreground">
							Beggy
						</p>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Your intelligent packing companion
						</p>
					</div>
				</div>

				{/* Form card */}
				<div className="w-full max-w-lg animate-fade-in [animation-delay:80ms]">
					<OnboardingForm />
				</div>

				{/* Reassurance line */}
				<p className="mt-6 text-center text-xs text-muted-foreground/60 animate-fade-in [animation-delay:160ms]">
					You can update all of this later in your profile settings.
				</p>
			</div>
		</main>
	);
}
