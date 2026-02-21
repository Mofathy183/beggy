import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppProvider } from '@shared/store';
import { ThemeProvider } from '@shadcn-components';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

/**
 * Root metadata applied to all pages.
 * Individual pages and layouts can override title via the `title` template.
 */
export const metadata: Metadata = {
	title: {
		default: 'Beggy',
		template: '%s · Beggy',
	},
	description:
		'AI-powered smart travel packing assistant. Pack smarter, travel lighter.',
};

/**
 * RootLayout
 *
 * The single root layout for the entire Next.js app.
 *
 * Responsibilities — and ONLY these:
 *  ✅ Sets <html> lang + suppressHydrationWarning (required by next-themes)
 *  ✅ Applies font CSS variables to <body>
 *  ✅ Mounts ThemeProvider (must wrap everything for dark mode to work)
 *  ✅ Mounts AppProvider (Redux store + CASL ability)
 *  ✅ Imports globals.css ONCE (never import it in nested layouts)
 *
 * Does NOT:
 *  ✗ Render AppShell (Header + Sidebar) — that belongs in the dashboard layout
 *  ✗ Render any auth UI — that belongs in (auth) layout
 *  ✗ Fetch any data — no auth checks here
 *
 * Layout tree:
 *  RootLayout
 *    ├── (auth)/layout.tsx        → login, signup pages (no shell)
 *    └── (protected)/layout.tsx  → AuthGate
 *          └── (dashboard)/layout.tsx → AppShell (Header + Sidebar)
 *                └── page.tsx    → dashboard pages
 */
export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/*
				 * ThemeProvider must be the outermost wrapper so that
				 * the .dark class on <html> is applied before any component renders.
				 * disableTransitionOnChange prevents a flash when switching themes.
				 */}
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{/*
					 * AppProvider mounts the Redux store and CASL AbilityProvider.
					 * It must be inside ThemeProvider (ThemeToggle uses both).
					 */}
					<AppProvider>{children}</AppProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
