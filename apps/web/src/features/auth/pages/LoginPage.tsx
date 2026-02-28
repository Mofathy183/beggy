import Link from 'next/link';
import { OAuthButtons, AuthDivider } from '@features/auth/components';
import { AuthPageLayout } from '@features/auth/components/layouts';
import { LoginForm } from '@features/auth/components/forms';

type LoginPageProps = {
	isOauthError: boolean;
};

/**
 * Login page composer.
 *
 * @description
 * Declarative composition of the login experience using
 * layout and feature-level components.
 *
 * @remarks
 * - No hooks, state, or side effects.
 * - Business logic lives inside `LoginForm` and auth hooks.
 * - Intended for usage within the Next.js App Router.
 */
const LoginPage = ({ isOauthError = false }: LoginPageProps) => (
	<AuthPageLayout
		title="Welcome back"
		subtitle="Sign in to continue packing smarter"
		isOauthError={isOauthError}
		footer={
			<>
				Don&apos;t have an account?{' '}
				<Link
					href="/signup"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign up free
				</Link>
			</>
		}
	>
		<OAuthButtons mode="login" />
		<AuthDivider />
		<LoginForm />
	</AuthPageLayout>
);

export default LoginPage;
