import LoginPage from '@features/auth/pages/LoginPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Login | Beggy',
};
/**
 * App Router entry for the login route.
 *
 * @remarks
 * Thin routing boundary that delegates rendering to the
 * feature-layer `LoginPage` composer.
 */
export default function Page() {
	return <LoginPage />;
}
