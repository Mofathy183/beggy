import Link from 'next/link';
import { AuthPageLayout } from '@features/auth/components/layouts';
import { OAuthButtons, AuthDivider } from '@features/auth/components';
import { SignupForm } from '@features/auth/components/forms';

/**
 * Signup page composer.
 *
 * @description
 * Declarative composition of the account creation experience.
 *
 * @remarks
 * - No hooks, state, or side effects.
 * - Business logic resides inside `SignupForm` and auth hooks.
 * - Intended for usage within the Next.js App Router.
 */
const SignupPage = () => (
	<AuthPageLayout
		title="Create your account"
		subtitle="Start packing smarter — free forever"
		footer={
			<>
				Already have an account?{' '}
				<Link
					href="/login"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign in
				</Link>
			</>
		}
	>
		<OAuthButtons mode="signup" />
		<AuthDivider />
		<SignupForm />
	</AuthPageLayout>
);

export default SignupPage;
