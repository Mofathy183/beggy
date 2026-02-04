import type { Metadata } from 'next';
import { AuthGate } from '@shared/guards';
import '../globals.css';

/**
 * Metadata for all protected routes.
 *
 * @remarks
 * - Applied to every route under `(protected)`
 * - Signals that this section of the app requires authentication
 * - Useful for debugging, SEO clarity, and developer intent
 */
export const metadata: Metadata = {
	title: 'Beggy – Protected Area',
	description: 'Authenticated and authorized application routes',
};

/**
 * ProtectedLayout
 *
 * Root layout for all **authenticated** application routes.
 *
 * @remarks
 * Responsibilities:
 * - Acts as the first auth boundary for protected routes
 * - Ensures a valid session exists before rendering any child pages
 *
 * Design decisions:
 * - Delegates authentication logic entirely to `AuthGate`
 * - Does NOT perform authorization (abilities/permissions)
 * - Does NOT fetch user data directly
 *
 * Authorization is handled at:
 * - Route level → `ProtectedRoute`
 * - Component level → `Can`
 *
 * This keeps concerns clean and composable.
 */
export default function ProtectedLayout({
	children,
}: {
	/** Protected route content */
	children: React.ReactNode;
}) {
	/**
	 * AuthGate:
	 * - Verifies authentication state
	 * - Blocks unauthenticated access
	 * - Handles redirects or fallback UI
	 */
	return <AuthGate>{children}</AuthGate>;
}
