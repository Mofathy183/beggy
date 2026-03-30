'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';
import { Material } from '@beggy/shared/constants';
import {
	MATERIAL_OPTIONS,
	getEnumLabel,
	getEnumIcon,
} from '@shared/ui/mappers';

// ─── Variants ─────────────────────────────────────────────────────────────────

const materialBadgeVariants = cva(
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

export interface MaterialBadgeProps extends VariantProps<
	typeof materialBadgeVariants
> {
	/**
	 * Material enum value from the API.
	 *
	 * @remarks
	 * Returns `null` when absent to avoid conditional rendering at call sites.
	 */
	value: Material | null | undefined;

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
 * Renders a material indicator badge.
 *
 * @description
 * Displays an optional icon and label representation of a {@link Material}.
 *
 * @remarks
 * - Designed as low-emphasis metadata (muted styling)
 * - Unknown enum values are ignored
 * - `iconOnly` is intended for space-constrained layouts
 * - Accessibility is preserved via `aria-label`
 *
 * @example
 * <MaterialBadge value={bag.material} />
 * <MaterialBadge value={bag.material} iconOnly size="sm" />
 */
const MaterialBadge = ({
	value,
	size,
	iconOnly = false,
	className,
}: MaterialBadgeProps) => {
	// ── Null guard — nullable field, silent omission is intentional ──────────
	if (!value) return null;

	const label = getEnumLabel(MATERIAL_OPTIONS, value);
	const icon = getEnumIcon(MATERIAL_OPTIONS, value);

	// Future-proof: unknown enum values are silently dropped
	if (!label) return null;

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		<Badge
			role="img"
			aria-label={`Material: ${label}`}
			className={cn(
				materialBadgeVariants({ size }),
				// Material is supplementary — muted token, quieter tone
				'bg-muted text-muted-foreground border-border/50',
				'hover:bg-muted/80',
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

export default MaterialBadge;
