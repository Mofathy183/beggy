import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shared/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

import { ItemCategory } from '@beggy/shared/constants';
import { ITEM_CATEGORY_OPTIONS } from '@shared-ui/mappers';

// ─── Variants ──────────────────────────────────────────────────────────────────
// Badge used as the wrapper shell — styling driven entirely by CVA
// via className, overriding shadcn's default variant styling.
// Follows the same pattern as GenderBadge (§12.9 domain → token mapping).

const categoryBadgeVariants = cva(
	// Base: mirror shadcn Badge shape, drive color from semantic tokens
	[
		'inline-flex items-center gap-1.5',
		'rounded-full border font-medium leading-none',
		'transition-colors',
	],
	{
		variants: {
			// size: controls padding + text scale
			size: {
				sm: 'px-2 py-1 text-[11px]',
				md: 'px-2.5 py-1.5 text-xs',
				lg: 'px-3 py-2 text-sm',
			},

			/**
			 * category: semantic color mapping — domain → token, never raw palette.
			 *
			 * Mapping rationale:
			 * - ELECTRONICS  → primary   (core functional item, brand-aligned)
			 * - ACCESSORIES  → secondary (supporting item, neutral)
			 * - FURNITURE    → secondary (neutral, structural)
			 * - MEDICINE     → warning   (important, handle with care)
			 * - CLOTHING     → primary   (everyday essential)
			 * - BOOKS        → secondary (neutral, informational)
			 * - FOOD         → success   (positive — sustenance, perishable care)
			 * - TOILETRIES   → secondary (routine, low-stakes)
			 * - DOCUMENTS    → warning   (important, don't lose)
			 * - SPORTS       → accent    (active, energetic)
			 */
			category: {
				[ItemCategory.ELECTRONICS]:
					'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
				[ItemCategory.ACCESSORIES]:
					'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
				[ItemCategory.FURNITURE]:
					'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
				[ItemCategory.MEDICINE]:
					'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15',
				[ItemCategory.CLOTHING]:
					'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
				[ItemCategory.BOOKS]:
					'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
				[ItemCategory.FOOD]:
					'bg-success/10 text-success border-success/20 hover:bg-success/15',
				[ItemCategory.TOILETRIES]:
					'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80',
				[ItemCategory.DOCUMENTS]:
					'bg-warning/10 text-warning border-warning/20 hover:bg-warning/15',
				[ItemCategory.SPORTS]:
					'bg-accent text-accent-foreground border-primary/15 hover:bg-accent/80',
			},
		},
		defaultVariants: {
			size: 'md',
			category: ItemCategory.ACCESSORIES,
		},
	}
);

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ItemCategoryBadgeProps extends VariantProps<
	typeof categoryBadgeVariants
> {
	category: ItemCategory;
	/**
	 * When true, renders only the icon — useful in compact / card header contexts.
	 */
	iconOnly?: boolean;
	className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ItemCategoryBadge
 *
 * A shadcn `Badge`-based pill that maps `ItemCategory` → semantic token.
 *
 * Renders nothing when the category has no matching option in
 * `ITEM_CATEGORY_OPTIONS` — future-proof against unknown enum values.
 *
 * Design follows §12.9 Domain → UI mapping rule:
 *   ItemCategory enum → semantic intent → CSS token → Tailwind class
 *
 * Icon and label are sourced from `ITEM_CATEGORY_OPTIONS` — single source
 * of truth for category UI metadata. No duplication anywhere.
 *
 * @example
 * // Standard usage
 * <ItemCategoryBadge category={ItemCategory.MEDICINE} />
 *
 * // Icon-only for compact card header
 * <ItemCategoryBadge category={item.category} iconOnly size="sm" />
 */
const ItemCategoryBadge = ({
	category,
	size,
	iconOnly = false,
	className,
}: ItemCategoryBadgeProps) => {
	const option = ITEM_CATEGORY_OPTIONS.find((o) => o.value === category);

	// Future-proof: unknown enum values are silently dropped
	if (!option) return null;

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		// Badge used as wrapper shell only — all color driven by className CVA.
		// shadcn's variant prop is intentionally omitted here.
		<Badge
			role="img"
			aria-label={`Category: ${option.label}`}
			className={cn(categoryBadgeVariants({ size, category }), className)}
		>
			{option.icon && (
				<HugeiconsIcon
					icon={option.icon}
					size={iconSize}
					className="shrink-0"
					aria-hidden="true"
				/>
			)}
			{!iconOnly && <span>{option.label}</span>}
		</Badge>
	);
};

export default ItemCategoryBadge;
