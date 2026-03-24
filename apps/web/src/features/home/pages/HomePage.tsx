'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Hero from '@features/home/components/hero/Hero';
import SocialProofBar from '@features/home/components/sections/SocialProofBar';
import HowItWorksSection from '@features/home/components/sections/HowItWorksSection';
import FeaturesSection from '@features/home/components/sections/FeaturesSection';
import CtaSection from '@features/home/components/sections/CtaSection';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * HomePage — orchestrates all homepage sections in order.
 *
 * Server Component shell — each interactive section is a client component.
 * Navbar and Footer are rendered by (public)/layout.tsx, not here.
 *
 * Section order:
 *  1. Hero                — headline, CTAs, mockup visual
 *  2. SocialProofBar      — 3 trust metrics
 *  3. HowItWorksSection   — 3-step explainer (id="how-it-works")
 *  4. FeaturesSection     — alternating feature rows (id="features")
 *  5. CtaSection          — final conversion push
 */
const HomePage = () => {
	const router = useRouter();

	const handleSignUp = useCallback(() => {
		router.push('/signup');
	}, [router]);

	const handleLogin = useCallback(() => {
		router.push('/login');
	}, [router]);

	return (
		<main>
			<Hero />
			<SocialProofBar />
			<HowItWorksSection />
			<FeaturesSection id="features" />
			<CtaSection onSignUp={handleSignUp} onLogin={handleLogin} />
		</main>
	);
};

export default HomePage;
