'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '@shared/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AppShellProps {
	children: React.ReactNode;
	/** Set to false to hide the Sidebar — useful before /dashboard exists */
	showSidebar?: boolean;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AppShell
 *
 * The top-level layout wrapper for all authenticated dashboard pages.
 * Composes the Header and Sidebar into the standard two-panel layout.
 *
 * Usage — in your dashboard layout.tsx:
 *
 * ```tsx
 * // src/app/(dashboard)/layout.tsx
 * import { AppShell } from '@shared/components/layout/AppShell';
 *
 * export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 *   return <AppShell>{children}</AppShell>;
 * }
 * ```
 *
 * Layout structure:
 *
 * ┌──────────────────────────────────────────────┐
 * │              Header (h-16, sticky)           │
 * ├──────────┬───────────────────────────────────┤
 * │          │                                   │
 * │ Sidebar  │   Main content (children)         │
 * │ (h-full) │   flex-1, scrollable              │
 * │          │                                   │
 * └──────────┴───────────────────────────────────┘
 *
 * The Header is sticky (top-0 z-50) — the sidebar and content
 * area sit below it and fill the remaining viewport height.
 *
 * Sidebar width transitions between 64px (collapsed) and 240px (expanded)
 * via CSS transition in SidebarUI — AppShell does not need to track this.
 */
const AppShell = ({
	children,
	showSidebar = true,
	className,
}: AppShellProps) => {
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const pathname = usePathname();

	// Auto-close on navigation
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMobileSidebarOpen(false);
	}, [pathname]);

	const handleMobileMenuToggle = useCallback(() => {
		setIsMobileSidebarOpen((prev) => !prev);
	}, []);

	const handleMobileClose = useCallback(() => {
		setIsMobileSidebarOpen(false);
	}, []);

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			{/* ── Sticky header — full width ──────────────────────────── */}
			<Header
				onMobileMenuToggle={
					showSidebar ? handleMobileMenuToggle : undefined
				}
				isMobileMenuOpen={isMobileSidebarOpen}
			/>

			{/* ── Body: sidebar + main content ────────────────────────── */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar: fixed height, does not scroll with content */}
				{showSidebar && (
					<Sidebar
						isMobileOpen={isMobileSidebarOpen}
						onMobileClose={handleMobileClose}
					/>
				)}

				{/* Main content area */}
				<main
					role="main"
					className={cn(
						'flex-1 overflow-y-auto p-4 md:p-6',
						className
					)}
				>
					{children}
				</main>
			</div>
		</div>
	);
};

export default AppShell;
