import HomePage from '@features/home/pages/HomePage';
import HomeFooter from '@features/home/components/layout/HomeFooter';
import Header from '@shared/layouts/Header';

// ─── Route metadata ───────────────────────────────────────────────────────────

export const metadata = {
	title: 'Beggy — Your AI-powered packing assistant',
	description:
		'Pack smarter with weather-aware AI recommendations. Beggy tells you exactly what to bring for your destination.',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Root page — /
 *
 * The homepage lives OUTSIDE all route groups:
 *  - Outside (public) — because the homepage is accessible to everyone,
 *    including authenticated users (who see the Header in auth mode)
 *  - Outside (protected) — because it does not require authentication
 *
 * Layout anatomy:
 *  ┌─────────────────────────────────────────────┐
 *  │  Header (from shared/layouts)               │
 *  │   ├── guest mode  → "Log in" + "Sign up"    │
 *  │   └── auth mode   → avatar dropdown         │
 *  ├─────────────────────────────────────────────┤
 *  │  <main> (HomePage sections)                 │
 *  │   ├── HeroSection                           │
 *  │   ├── SocialProofBar                        │
 *  │   ├── HowItWorksSection                     │
 *  │   ├── FeaturesSection                       │
 *  │   └── CtaSection                            │
 *  ├─────────────────────────────────────────────┤
 *  │  HomeFooter                                 │
 *  └─────────────────────────────────────────────┘
 *
 * Why use the shared Header here instead of HomeNavbar?
 *
 * Header already handles both guest and authenticated states via
 * state.auth.profile — null renders guest actions ("Log in" / "Sign up"),
 * non-null renders the UserMenu dropdown. This means authenticated users
 * who land on the homepage still see their avatar and can navigate the app
 * without a jarring guest-only navbar. No duplicate component needed.
 *
 * The anchor scroll links (#how-it-works, #features) are handled inside
 * HeroUI's "See how it works" ghost button — not in the Header.
 */
export default function Page() {
	return (
		<div className="flex min-h-screen flex-col">
			<Header />
			<div className="flex-1">
				<HomePage />
			</div>
			<HomeFooter />
		</div>
	);
}
