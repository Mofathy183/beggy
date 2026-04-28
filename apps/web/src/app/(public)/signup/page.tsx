import SignupPage from '@features/auth/pages/SignupPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Create your account',
	description: 'Start planning your trips and pack smarter with Beggy.',
};

/**
 * App Router entry for the signup route.
 *
 * @remarks
 * Thin routing boundary that delegates rendering to the
 * feature-layer `SignupPage` composer.
 */
export default function Page() {
	return <SignupPage />;
}
