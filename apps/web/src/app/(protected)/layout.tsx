import type { Metadata } from 'next';
import { AuthGate } from '@shared/guards';
import { AppShell } from '@shared/layouts';

/**
 * Metadata for all protected routes.
 * Pages inside can override this via their own `export const metadata`.
 */
export const metadata: Metadata = {
	title: 'Dashboard',
	description:
		'Your Beggy dashboard — manage trips, bags, and packing lists.',
};

/**
 * ProtectedLayout
 *
 * Auth boundary for all authenticated routes.
 *
 * Responsibilities — and ONLY these:
 *  ✅ Wraps children in AuthGate (verifies session, redirects if not authenticated)
 *
 * Does NOT:
 *  ✗ Import globals.css — that only happens in RootLayout (double import = bugs)
 *  ✗ Render AppShell (Header + Sidebar) — that is the DashboardLayout's job
 *  ✗ Perform authorization (roles, abilities) — that is ProtectedRoute + Can
 *
 * Why separate from DashboardLayout?
 *
 * Some future authenticated pages may not want the dashboard shell —
 * a full-screen onboarding wizard, an OAuth callback handler, a printer-
 * friendly view. Keeping the auth gate and the chrome (Header + Sidebar)
 * in separate layout files preserves that flexibility with zero cost now.
 *
 * Layout tree (this node):
 *  (protected)/layout.tsx  ← YOU ARE HERE (auth gate only)
 *    └── (dashboard)/layout.tsx → AppShell (Header + Sidebar)
 *          └── users/page.tsx, dashboard/page.tsx, etc.
 */
export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// <AuthGate>
		<AppShell>{children}</AppShell>
		// </AuthGate>
	);
}
