import type { Metadata } from 'next';
import { AuthGate } from '@shared/guards';

export const metadata: Metadata = {
	title: {
		default: 'Beggy',
		template: '%s | Beggy',
	},
	description:
		'Plan your trips, pack smarter, and travel with confidence using Beggy.',
};

/**
 * ProtectedLayout
 *
 * Auth boundary for ALL authenticated routes — this is the only place
 * `AuthGate` runs. Every route under `(protected)/` inherits this check.
 *
 * Responsibilities — and ONLY these:
 *  ✅ Verify session via AuthGate, redirect to /login if unauthenticated
 *
 * Does NOT:
 *  ✗ Render AppShell (Header + Sidebar) — that belongs in DashboardLayout
 *  ✗ Handle onboarding redirect — that belongs in DashboardLayout
 *  ✗ Import globals.css — RootLayout owns that
 *
 * Layout tree (this node):
 *  (protected)/layout.tsx       ← YOU ARE HERE — auth gate only
 *    ├── onboarding/layout.tsx  → wizard shell, no AppShell
 *    └── (dashboard)/layout.tsx → AppShell + onboarding redirect
 *          └── bags/, users/, dashboard/, etc.
 */
export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <AuthGate>{children}</AuthGate>;
}
