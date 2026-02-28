import SignupPage from '@features/auth/pages/SignupPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign Up | Beggy',
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
