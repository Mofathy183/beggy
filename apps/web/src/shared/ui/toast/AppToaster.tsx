'use client';

import { useTheme } from 'next-themes';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

/**
 * AppToaster
 *
 * Design decisions:
 *
 * - resolvedTheme         → always "light" | "dark", never "system".
 *                           Sonner only understands these two values.
 *
 * - richColors={false}    → our CSS variables own all color decisions.
 *                           Sonner's richColors would override our tokens.
 *
 * - position="top-left"   → renders visually top-right in RTL (dir="rtl"
 *                           flips it automatically via logical properties).
 *
 * - expand                → toasts expand on hover to show full description.
 *
 * - Tinted bg pattern     → handled in globals.css via Sonner's own
 *                           --success-bg / --error-bg / etc. CSS vars.
 *                           Zero !important needed — we feed Sonner's own
 *                           system rather than fighting its inline styles.
 *
 * - Left accent border    → applied in globals.css via
 *                           [data-sonner-toast].toast-{variant} selectors.
 *
 * - pe-10                 → padding-inline-end reserves space so toast text
 *                           never runs under the close button (RTL-safe).
 */
const AppToaster = () => {
	const { resolvedTheme } = useTheme();

	return (
		<SonnerToaster
			theme={(resolvedTheme ?? 'light') as ToasterProps['theme']}
			position="top-left"
			richColors={false}
			closeButton
			expand
			gap={10}
			visibleToasts={4}
			toastOptions={{
				classNames: {
					/*
					 * Base toast shell.
					 * pe-10 → RTL-safe right padding to clear the close button.
					 * overflow-hidden → clips the left accent border cleanly
					 *   at the rounded corners.
					 */
					toast: 'font-serif rounded-xl shadow-sm w-full max-w-sm pe-10',

					/*
					 * Title — semibold so it reads clearly at small size.
					 * Color per variant is set in globals.css via [data-title].
					 */
					title: 'text-sm font-semibold leading-snug',

					/*
					 * Description — explicitly muted so it never inherits
					 * the title's semantic color. Reinforced in globals.css.
					 */
					description:
						'text-xs text-muted-foreground mt-0.5 leading-relaxed',

					/*
					 * Icon — top-aligned so it sits next to the first line
					 * of the title, not vertically centred on the whole toast.
					 */
					icon: 'self-start shrink-0 mt-0.5',

					/*
					 * Close button — positioned and styled entirely in
					 * globals.css via [data-close-button]. The classes here
					 * are lightweight helpers only.
					 */
					closeButton: 'rounded-full transition-colors',

					/*
					 * Variant marker classes — consumed by globals.css
					 * selectors for left accent border and title color.
					 * Background tinting is handled separately via Sonner's
					 * own --success-bg / --error-bg CSS vars in :root / .dark.
					 */
					success: 'toast-success',
					error: 'toast-error',
					warning: 'toast-warning',
					info: 'toast-info',
				},
			}}
		/>
	);
};

export default AppToaster;
