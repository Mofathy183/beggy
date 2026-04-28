'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';
import type { ContainerStatus } from '@beggy/shared/constants';
import {
	CONTAINER_STATUS_OPTIONS,
	CONTAINER_STATUS_BADGE_VARIANT,
	getEnumShortLabel,
	getEnumLabel,
	getEnumIcon,
} from '@shared/ui/mappers';

// ─── Variants ─────────────────────────────────────────────────────────────────
//
// Dark mode token strategy — the core fix:
//
// The problem with the previous version was using `text-warning-foreground`
// (oklch 0.2 — very dark brown) and `text-success` / `text-destructive` with
// a `/10` background tint. In dark mode, the card surface is
// oklch(0.216 0.006 56.043) — near-black — so a `/10` tint is invisible,
// and dark text on a dark background produces zero contrast.
//
// Fix per variant:
//
//   success:
//     Light → bg-success/10  + text-success              ✓ green text on near-white tint
//     Dark  → bg-success/20  + text-success              ✓ success lightens to 0.62 in dark mode
//
//   warning:
//     Light → bg-warning/10  + text-warning-foreground   ✓ dark brown on pale yellow — readable
//     Dark  → bg-warning/20  + text-warning              ✓ CANNOT use text-warning-foreground
//                                                           in dark — it is oklch(0.2) dark brown,
//                                                           invisible on near-black card.
//                                                           Switch to text-warning (the yellow
//                                                           oklch 0.82) — light on dark tint ✓
//
//   destructive:
//     Light → bg-destructive/10 + text-destructive       ✓ red on pale rose — readable
//     Dark  → bg-destructive/25 + text-destructive-foreground
//                                                         ✓ destructive stays at oklch(0.38)
//                                                           in both modes — that mid-dark-red
//                                                           is illegible on near-black card.
//                                                           Switch to text-destructive-foreground
//                                                           (oklch 0.971 — near white) on a
//                                                           more opaque tint bg ✓
//
//   secondary (EMPTY):
//     No dark: override needed — secondary/secondary-foreground
//     adapts correctly across modes automatically.

const containerStatusBadgeVariants = cva(
	[
		'inline-flex items-center gap-1.5',
		'rounded-full border font-medium leading-none',
		'transition-colors',
	],
	{
		variants: {
			size: {
				sm: 'px-2 py-1 text-[11px]',
				md: 'px-2.5 py-1.5 text-xs',
				lg: 'px-3 py-2 text-sm',
			},
			variant: {
				/**
				 * OK → success
				 *
				 * Light: pale emerald tint + emerald text (oklch 0.53) ✓
				 * Dark:  stronger emerald tint + lightened emerald text (oklch 0.62) ✓
				 * The success token already adjusts in dark — just need more bg
				 * opacity so the tint remains visible on the near-black card.
				 */
				success: [
					'border-success/30',
					'bg-success/10 text-success',
					'dark:bg-success/20 dark:text-success',
				],

				/**
				 * FULL → warning
				 *
				 * Light: pale amber tint + dark brown text (warning-foreground oklch 0.2)
				 *        Dark brown on pale yellow = readable ✓
				 * Dark:  stronger amber tint + amber text (warning oklch 0.82)
				 *        text-warning-foreground is oklch(0.2 0.02 75) — dark brown —
				 *        completely invisible on dark card. Must use text-warning instead.
				 */
				warning: [
					'border-warning/30',
					'bg-warning/10 text-warning-foreground',
					'dark:bg-warning/20 dark:text-warning',
				],

				/**
				 * OVERWEIGHT / OVER_CAPACITY → destructive
				 *
				 * Light: pale rose tint + red text (destructive oklch 0.38) ✓
				 * Dark:  destructive stays at oklch(0.38) — a mid-dark-red that
				 *        disappears on the near-black card surface.
				 *        Fix: boost bg opacity + switch to text-destructive-foreground
				 *        (oklch 0.971, near-white) for maximum contrast on dark. ✓
				 */
				destructive: [
					'border-destructive/30',
					'bg-destructive/10 text-destructive',
					'dark:bg-destructive/25 dark:text-destructive-foreground',
				],

				/**
				 * EMPTY → secondary
				 *
				 * Light: oklch(0.967) bg + oklch(0.21) text — light bg, dark text ✓
				 * Dark:  oklch(0.274) bg + oklch(0.985) text — dark bg, near-white text ✓
				 * Token pair self-corrects — no dark: override needed.
				 */
				secondary: [
					'border-border',
					'bg-secondary text-secondary-foreground',
					'hover:bg-secondary/80',
				],
			},
		},
		defaultVariants: {
			size: 'md',
			variant: 'secondary',
		},
	}
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ContainerStatusBadgeProps extends VariantProps<
	typeof containerStatusBadgeVariants
> {
	/**
	 * Status value from ContainerStatusDTO.
	 *
	 * @remarks
	 * Returns `null` when absent to simplify usage in UI trees.
	 */
	value: ContainerStatus | null | undefined;

	/**
	 * Controls label format.
	 *
	 * @defaultValue 'short'
	 */
	display?: 'short' | 'full';

	/**
	 * Renders only the icon when true.
	 *
	 * @defaultValue false
	 */
	iconOnly?: boolean;

	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a semantic badge representing container status.
 *
 * @description
 * Maps {@link ContainerStatus} to a visual variant (success, warning, destructive, secondary)
 * using a single source of truth (`CONTAINER_STATUS_BADGE_VARIANT`).
 *
 * @remarks
 * - Designed to reflect packing state (capacity / weight constraints)
 * - Unknown enum values are ignored
 * - Accessibility is preserved via `aria-label`
 * - Visual contrast is tuned for both light and dark themes
 *
 * @example
 * <ContainerStatusBadge value={bag.status.state.status} />
 * <ContainerStatusBadge value={ContainerStatus.OK} iconOnly size="sm" />
 */
const ContainerStatusBadge = ({
	value,
	size,
	display = 'short',
	iconOnly = false,
	className,
}: ContainerStatusBadgeProps) => {
	// ── Null guard — silent omission is the correct UX ───────────────────────
	if (!value) return null;

	const label =
		display === 'short'
			? getEnumShortLabel(CONTAINER_STATUS_OPTIONS, value)
			: getEnumLabel(CONTAINER_STATUS_OPTIONS, value);

	const icon = getEnumIcon(CONTAINER_STATUS_OPTIONS, value);

	// Future-proof: unknown enum values are silently dropped
	if (!label) return null;

	// Full label always drives the aria-label regardless of display mode
	const ariaLabel = getEnumLabel(CONTAINER_STATUS_OPTIONS, value);

	// Derive CVA variant from the canonical CONTAINER_STATUS_BADGE_VARIANT map
	const variant = CONTAINER_STATUS_BADGE_VARIANT[value] as
		| 'success'
		| 'warning'
		| 'destructive'
		| 'secondary';

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		<Badge
			role="img"
			aria-label={`Status: ${ariaLabel}`}
			className={cn(
				containerStatusBadgeVariants({ size, variant }),
				className
			)}
		>
			{icon && (
				<HugeiconsIcon
					icon={icon}
					size={iconSize}
					className="shrink-0"
				/>
			)}
			{!iconOnly && <span>{label}</span>}
		</Badge>
	);
};

export default ContainerStatusBadge;
