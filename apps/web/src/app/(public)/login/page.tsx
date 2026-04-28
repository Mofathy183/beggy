import LoginPage from '@features/auth/pages/LoginPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Welcome back',
	description:
		'Pick up where you left off. Your bags and packing lists are waiting.',
};

type Props = {
	searchParams: Promise<{ error?: string }>;
};

/**
 * App Router entry for the login route.
 *
 * @remarks
 * Thin routing boundary that delegates rendering to the
 * feature-layer `LoginPage` composer.
 */
export default async function Page({ searchParams }: Props) {
	const isOauthError = await searchParams;

	return <LoginPage isOauthError={isOauthError.error === 'oauth_failed'} />;
}
