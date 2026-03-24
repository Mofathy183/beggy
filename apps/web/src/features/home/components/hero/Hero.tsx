'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import HeroUI from './HeroUI';

// ─── Route constants ───────────────────────────────────────────────────────────

const ROUTES = {
	signup: '/signup',
	howItWorks: '#how-it-works',
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Smart container for the Beggy homepage hero section.
 *
 * What this component owns:
 *  ✅ Navigation — routes "Start packing" to /signup, "See how it works" to anchor
 *  ✅ Any future A/B variant logic (which CTA copy to show, etc.)
 *
 * What this component deliberately does NOT own:
 *  ✗ Any JSX layout — that lives entirely in HeroUI
 *  ✗ Auth state — hero is always rendered as a guest section
 *  ✗ Animation state — CSS handles all transitions
 *
 * Why not just put this logic in HeroUI?
 *
 * Following the same container/presenter split as Header / HeaderUI.
 * HeroUI is a pure, side-effect-free presentational component —
 * it can be dropped into Storybook with mock callbacks instantly.
 * HeroSection owns the routing side effects.
 */
const Hero = () => {
	const router = useRouter();

	const handleStartPacking = useCallback(() => {
		router.push(ROUTES.signup);
	}, [router]);

	const handleSeeHowItWorks = useCallback(() => {
		// Smooth-scroll to the how-it-works section on the same page
		const el = document.querySelector(ROUTES.howItWorks);
		el?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	return (
		<HeroUI
			onStartPacking={handleStartPacking}
			onSeeHowItWorks={handleSeeHowItWorks}
		/>
	);
};

export default Hero;
