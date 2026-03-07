import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';

// ─── Variants ──────────────────────────────────────────────────────────────────
// Badge used as the wrapper shell — styling is driven entirely by CVA
// via className, overriding shadcn's default variant styling.
// Follows the same pattern as GenderBadge (§12.9 domain → token mapping).

const fragileBadgeVariants = cva(
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
		},
		defaultVariants: {
			size: 'md',
		},
	}
);

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ItemFragileBadgeProps extends VariantProps<
	typeof fragileBadgeVariants
> {
	/**
	 * When false, the badge renders nothing.
	 * No guard needed at the call site — safe to render unconditionally.
	 */
	isFragile: boolean;
	/**
	 * When true, renders only the icon — useful in compact / card header contexts.
	 */
	iconOnly?: boolean;
	className?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ItemFragileBadge
 *
 * A shadcn `Badge`-based pill that indicates an item requires careful handling.
 *
 * Renders nothing when `isFragile` is false — intentional silent omission,
 * no placeholder shown. Safe to render unconditionally at the call site.
 *
 * Design follows §12.9 Domain → UI mapping rule:
 *   isFragile: true → "handle with care" intent → destructive token (soft)
 *
 * Uses the soft destructive pattern (tinted bg + full-chroma text) rather
 * than the full `bg-destructive` — fragile is a property, not an error state.
 * The tone should be "pay attention" not "something went wrong".
 *
 * @example
 * // Safe — renders nothing when isFragile is false
 * <ItemFragileBadge isFragile={item.isFragile} />
 *
 * // Icon-only for compact card header use
 * <ItemFragileBadge isFragile={item.isFragile} iconOnly size="sm" />
 */
const ItemFragileBadge = ({
	isFragile,
	size,
	iconOnly = false,
	className,
}: ItemFragileBadgeProps) => {
	// ── Silent omission — correct UX for a property badge ────────────────────
	if (!isFragile) return null;

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		// Badge used as wrapper shell only — all color driven by className CVA.
		// shadcn's variant prop is intentionally omitted here.
		<Badge
			role="status"
			aria-label="Fragile item — handle with care"
			className={cn(
				fragileBadgeVariants({ size }),
				// Soft destructive: tinted bg + full-chroma text.
				// Never use bg-destructive here — that reads as an error state.
				'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15',
				className
			)}
		>
			<HugeiconsIcon
				icon={Alert02Icon}
				size={iconSize}
				className="shrink-0"
				aria-hidden="true"
			/>
			{!iconOnly && <span>Fragile</span>}
		</Badge>
	);
};

export default ItemFragileBadge;
