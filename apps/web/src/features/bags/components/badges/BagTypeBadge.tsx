'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';
import { BagType } from '@beggy/shared/constants';
import {
	BAG_TYPE_OPTIONS,
	getEnumShortLabel,
	getEnumIcon,
} from '@shared/ui/mappers';

// ─── Variants ─────────────────────────────────────────────────────────────────

const bagTypeBadgeVariants = cva(
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
		},
		defaultVariants: {
			size: 'md',
		},
	}
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BagTypeBadgeProps extends VariantProps<
	typeof bagTypeBadgeVariants
> {
	/**
	 * BagType enum value from BagDTO.
	 * Renders nothing when null or undefined — no guard needed at call site.
	 */
	value: BagType | null | undefined;

	/**
	 * When true, renders only the icon — useful in compact / inline contexts.
	 */
	iconOnly?: boolean;

	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BagTypeBadge
 *
 * Renders a secondary-styled informational badge for the bag type.
 * BagType is core identity metadata — always secondary variant, never semantic.
 *
 * Uses `shortLabel` for the display text — "Laptop bag" fits a card header,
 * "Messenger" does not need shortening but the API is consistent.
 *
 * @example
 * <BagTypeBadge value={bag.type} />
 * <BagTypeBadge value={bag.type} iconOnly size="sm" />
 */
const BagTypeBadge = ({
	value,
	size,
	iconOnly = false,
	className,
}: BagTypeBadgeProps) => {
	// ── Null guard — silent omission is the correct UX ───────────────────────
	if (!value) return null;

	const label = getEnumShortLabel(BAG_TYPE_OPTIONS, value);
	const icon = getEnumIcon(BAG_TYPE_OPTIONS, value);

	// Future-proof: unknown enum values are silently dropped
	if (!label) return null;

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		<Badge
			role="img"
			aria-label={`Bag type: ${label}`}
			className={cn(
				bagTypeBadgeVariants({ size }),
				// BagType is informational — secondary token, never semantic
				'bg-secondary text-secondary-foreground border-border',
				'hover:bg-secondary/80',
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

export default BagTypeBadge;
