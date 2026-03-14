'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * AppToaster
 *
 * Drop this once in your root layout — it renders the Sonner toast container.
 * Configured to match Beggy's design system:
 *
 * - theme="system"   → follows next-themes dark/light class on <html>
 * - position         → top-right on desktop, top-center on mobile (Sonner default)
 * - richColors        → uses Sonner's semantic color system as the base,
 *                       overridden by our CSS variables below
 * - toastOptions      → className hooks let us apply semantic token classes
 *                       so toasts match the design system exactly
 *
 * Usage:
 * // app/layout.tsx
 * import { AppToaster } from '@shared-ui/toaster';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="ar" dir="rtl" suppressHydrationWarning>
 *       <body>
 *         <Providers>{children}</Providers>
 *         <AppToaster />
 *       </body>
 *     </html>
 *   );
 * }
 */
const AppToaster = () => {
	return (
		<SonnerToaster
			theme="system"
			position="top-right"
			richColors
			closeButton
			gap={8}
			toastOptions={{
				classNames: {
					/*
					 * Base toast — uses card surface + foreground text so it
					 * looks native on both light and dark backgrounds.
					 * border-border gives the same divider color as cards/inputs.
					 */
					toast: [
						'font-serif',
						'bg-card text-card-foreground',
						'border border-border',
						'shadow-md',
						'rounded-lg',
					].join(' '),

					/*
					 * Title — slightly heavier than description for hierarchy.
					 * Sonner applies this to the first line of text.
					 */
					title: 'text-sm font-medium text-foreground',

					/*
					 * Description — muted, smaller, sits below the title.
					 * Maps to the `suggestion` field from ErrorResponse.
					 */
					description: 'text-xs text-muted-foreground mt-0.5',

					/*
					 * Close button — ghost-style, uses muted token.
					 */
					closeButton: [
						'bg-muted text-muted-foreground',
						'border border-border',
						'hover:bg-accent hover:text-accent-foreground',
					].join(' '),

					/*
					 * Action button (if used) — primary style.
					 */
					actionButton:
						'bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium',

					cancelButton:
						'bg-muted text-muted-foreground hover:bg-accent text-xs',

					/*
					 * Semantic variants — soft tinted pattern matching §12.7.
					 * These override Sonner's richColors defaults with our tokens.
					 *
					 * Pattern: tinted bg + matching border + full-chroma text on title
					 */
					success: [
						'bg-success/10 border-success/30',
						'[&_[data-title]]:text-success',
					].join(' '),

					error: [
						'bg-destructive/10 border-destructive/30',
						'[&_[data-title]]:text-destructive',
					].join(' '),

					warning: [
						'bg-warning/10 border-warning/30',
						'[&_[data-title]]:text-warning-foreground',
					].join(' '),

					info: [
						'bg-primary/10 border-primary/30',
						'[&_[data-title]]:text-primary',
					].join(' '),
				},
			}}
		/>
	);
};

export default AppToaster;
