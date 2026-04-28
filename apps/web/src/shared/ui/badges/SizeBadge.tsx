'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { cn } from '@shadcn-lib';
import type { Size } from '@beggy/shared/constants';
import {
	SIZE_OPTIONS,
	getEnumShortLabel,
	getEnumLabel,
} from '@shared/ui/mappers';

// ─── Variants ─────────────────────────────────────────────────────────────────

const sizeBadgeVariants = cva(
	[
		'inline-flex items-center',
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
		},
		defaultVariants: {
			size: 'md',
		},
	}
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SizeBadgeProps extends VariantProps<typeof sizeBadgeVariants> {
	/**
	 * Size enum value from the API.
	 *
	 * @remarks
	 * Returns `null` when absent to avoid conditional rendering at call sites.
	 */
	value: Size | null | undefined;

	/**
	 * Controls label format.
	 *
	 * @defaultValue 'short'
	 */
	display?: 'short' | 'full';

	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Renders a size indicator badge.
 *
 * @description
 * Displays a compact or full label representation of a {@link Size} enum.
 *
 * @remarks
 * - Designed as low-emphasis metadata (muted styling)
 * - Unknown or unsupported enum values are ignored
 * - Uses `aria-label` to expose the full label for accessibility
 *
 * @example
 * <SizeBadge value={bag.size} />                  // "M"
 * <SizeBadge value={bag.size} display="full" />   // "Medium"
 */
const SizeBadge = ({
	value,
	size,
	display = 'short',
	className,
}: SizeBadgeProps) => {
	// ── Null guard — silent omission is the correct UX ───────────────────────
	if (!value) return null;

	const label =
		display === 'short'
			? getEnumShortLabel(SIZE_OPTIONS, value)
			: getEnumLabel(SIZE_OPTIONS, value);

	// Future-proof: unknown enum values are silently dropped
	if (!label) return null;

	// Full label is used for aria even in short display mode
	const fullLabel = getEnumLabel(SIZE_OPTIONS, value);

	return (
		<Badge
			role="img"
			aria-label={`Size: ${fullLabel}`}
			className={cn(
				sizeBadgeVariants({ size }),
				// Size is supplementary — muted token, quieter than secondary
				'bg-muted text-muted-foreground border-border/50',
				'hover:bg-muted/80',
				className
			)}
		>
			<span>{label}</span>
		</Badge>
	);
};

export default SizeBadge;
