import LoginPage from '@features/auth/pages/LoginPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Login | Beggy',
};

type Props = {
	searchParams: { error?: string };
};

/**
 * App Router entry for the login route.
 *
 * @remarks
 * Thin routing boundary that delegates rendering to the
 * feature-layer `LoginPage` composer.
 */
export default function Page({ searchParams }: Props) {
	const isOauthError = searchParams.error === 'oauth_failed';

	return <LoginPage isOauthError={isOauthError} />;
}
