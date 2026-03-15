'use client';

import { Toaster as SonnerToaster } from 'sonner';

/**
 * AppToaster
 *
 * Drop this once in your root layout — it renders the Sonner toast container.
 *
 * Design decisions:
 * - richColors OFF       → our CSS variable classes own all color decisions
 * - position top-left    → renders visually top-right in RTL (dir="rtl" flips it)
 * - Soft tinted pattern  → matches §12.7: tinted bg + border + semantic title text
 * - font-serif           → matches Beggy's global html { font-family: serif }
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
			position="top-left"
			richColors={false}
			closeButton
			gap={12}
			toastOptions={{
				classNames: {
					/*
					 * Base toast shell — card surface so it feels native
					 * in both light (white card) and dark (elevated stone card).
					 * shadow-sm keeps it grounded without being heavy.
					 */
					toast: [
						'font-serif',
						'bg-card text-card-foreground',
						'border border-border',
						'shadow-sm',
						'rounded-lg',
						'w-[360px]',
					].join(' '),

					/*
					 * Title — medium weight, foreground color by default.
					 * Semantic variants override the color via the variant keys below.
					 */
					title: 'text-sm font-medium text-foreground leading-snug',

					/*
					 * Description — muted, smaller.
					 * Maps to `suggestion` from ErrorResponse or `description` elsewhere.
					 */
					description:
						'text-xs text-muted-foreground mt-1 leading-relaxed',

					/*
					 * Icon — vertically centered with the title.
					 */
					icon: 'mt-0.5 self-start',

					/*
					 * Close button — ghost style, consistent with other dismiss controls.
					 */
					closeButton: [
						'bg-muted text-muted-foreground',
						'border border-border',
						'hover:bg-accent hover:text-accent-foreground',
						'transition-colors',
						'rounded-md',
					].join(' '),

					/*
					 * Action button — primary CTA style.
					 */
					actionButton: [
						'bg-primary text-primary-foreground',
						'hover:bg-primary/90',
						'text-xs font-medium',
						'rounded-md',
						'transition-colors',
					].join(' '),

					/*
					 * Cancel button — muted/ghost style.
					 */
					cancelButton: [
						'bg-muted text-muted-foreground',
						'hover:bg-accent hover:text-accent-foreground',
						'text-xs',
						'rounded-md',
						'transition-colors',
					].join(' '),

					/*
					 * ── Semantic variants ──────────────────────────────────────────
					 *
					 * Soft tinted pattern from §12.7:
					 *   bg-{token}/10  → tinted surface (subtle, not alarming)
					 *   border-{token}/25 → tinted border (visible but calm)
					 *
					 * Title color is handled in the `title` classNames key above
					 * on a per-variant basis — Sonner merges both keys together.
					 *
					 * The travel buddy tone lives in the message strings passed to
					 * notify.success() / notify.error() etc. — not here.
					 * This is purely the visual shell.
					 */
					success: 'bg-success/10 border-success/25',
					error: 'bg-destructive/10 border-destructive/25',
					warning: 'bg-warning/10 border-warning/25',
					info: 'bg-primary/10 border-primary/25',
				},
			}}
		/>
	);
};

export default AppToaster;
