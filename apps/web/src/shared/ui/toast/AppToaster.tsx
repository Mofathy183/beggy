'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/**
 * Global toast provider aligned with the application's design system.
 *
 * @description
 * Wraps Sonner's `Toaster` to enforce consistent theming, spacing, and styling
 * across the app. This acts as the single integration point with the toast library.
 *
 * @remarks
 * - Uses `resolvedTheme` to avoid passing unsupported `"system"` to Sonner.
 * - Styling is driven via Tailwind + CSS variables (see `globals.css`),
 *   avoiding overrides of Sonner's internal styles.
 * - Position is RTL-aware via logical properties (mirrored automatically).
 */
const AppToaster = () => {
	const { resolvedTheme } = useTheme();

	const theme: ToasterProps['theme'] =
		resolvedTheme === 'light' ? 'light' : 'dark';

	return (
		<SonnerToaster
			theme={theme}
			position="top-right"
			expand
			gap={8}
			richColors={false}
			toastOptions={{
				classNames: {
					/**
					 * Base toast container.
					 *
					 * @remarks
					 * - Uses semantic tokens (`bg-card`, `text-foreground`, etc.)
					 * - Variant styling is applied via `data-[type=*]` attributes
					 *   provided by Sonner.
					 */
					toast: [
						'group font-sans rounded-xl border shadow-lg',
						'bg-card text-card-foreground border-border',
						'data-[type=success]:border-success/30 data-[type=success]:bg-success/8',
						'data-[type=error]:border-destructive/30 data-[type=error]:bg-destructive/8',
						'data-[type=warning]:border-warning/30 data-[type=warning]:bg-warning/8',
						'data-[type=info]:border-primary/30 data-[type=info]:bg-primary/8',
					].join(' '),

					/** Toast title (primary message) */
					title: 'text-sm font-semibold text-foreground leading-snug',

					/** Secondary message or suggestion */
					description:
						'text-xs text-muted-foreground mt-0.5 leading-relaxed',

					/**
					 * Icon container.
					 *
					 * @remarks
					 * Inherits color via `currentColor`, mapped per variant.
					 */
					icon: [
						'shrink-0',
						'group-data-[type=success]:text-success',
						'group-data-[type=error]:text-destructive',
						'group-data-[type=warning]:text-warning',
						'group-data-[type=info]:text-primary',
					].join(' '),

					/** Dismiss button */
					closeButton: [
						'rounded-md border border-border bg-background/80',
						'text-muted-foreground hover:text-foreground',
						'transition-colors',
					].join(' '),

					/** Primary action button (optional) */
					actionButton:
						'bg-primary text-primary-foreground rounded-lg px-3 py-1.5 text-xs font-medium',

					/** Secondary/cancel action */
					cancelButton:
						'bg-muted text-muted-foreground rounded-lg px-3 py-1.5 text-xs font-medium',
				},
			}}
		/>
	);
};

export default AppToaster;
