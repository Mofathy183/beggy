'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { Badge } from '@shadcn-ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@shadcn-lib';
import { Gender } from '@beggy/shared/constants';
import { GENDER_OPTIONS } from '@shared/ui/mappers';

// ─── Variants ─────────────────────────────────────────────────────────────────
// Built on top of shadcn Badge by overriding its default styling via className.
// We do NOT use shadcn's own "variant" prop — instead we compose our own
// semantic token mapping using CVA, following the badge pattern in §12.7.

const genderBadgeVariants = cva(
	// Base: mirror shadcn Badge shape but drive color from our tokens
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
			// gender: semantic color mapping — domain → token, never raw palette
			gender: {
				// MALE → primary teal tint (brand-aligned, neutral)
				MALE: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
				// FEMALE → accent teal wash (slightly distinct but still on-brand)
				FEMALE: 'bg-accent text-accent-foreground border-primary/15 hover:bg-accent/80',
				// OTHER → muted/secondary (deliberately neutral — not othering)
				OTHER: 'bg-muted text-muted-foreground border-border hover:bg-secondary',
			},
		},
		defaultVariants: {
			size: 'md',
			gender: 'OTHER',
		},
	}
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface GenderBadgeProps extends VariantProps<
	typeof genderBadgeVariants
> {
	/**
	 * Gender from ProfileDTO.
	 * When null / undefined → the component renders nothing.
	 * No guard needed at the call site — intentional omission is silent.
	 */
	gender: Gender;
	/**
	 * When true, renders only the icon — useful in compact / inline contexts
	 * like ProfileCardCompact sidebar footer.
	 */
	iconOnly?: boolean;
	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GenderBadge
 *
 * A shadcn <Badge>-based pill that maps Gender enum → semantic token.
 *
 * Renders nothing when gender is null — this is intentional by design.
 * Gender is optional on ProfileDTO; the badge simply disappears rather
 * than showing a "Not set" placeholder.
 *
 * Design follows §12.9 Domain → UI mapping rule:
 *   Gender enum → semantic intent → CSS token → Tailwind class
 *
 * @example
 * // Safe — renders nothing when gender is null
 * <GenderBadge gender={profile.gender} />
 *
 * // Icon-only for compact use
 * <GenderBadge gender={profile.gender} iconOnly size="sm" />
 */
const GenderBadge = ({
	gender,
	size,
	iconOnly = false,
	className,
}: GenderBadgeProps) => {
	// ── Null guard — silent omission is the correct UX ───────────────────────
	if (!gender) return null;

	const options = GENDER_OPTIONS.find((option) => option.value === gender);

	// Future-proof: unknown enum values are silently dropped
	if (!options) return null;

	const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

	return (
		// shadcn Badge used as the wrapper but with our CVA variant classes
		// overriding its defaults — we pass asChild={false} (default) and
		// drive styling entirely through className
		<Badge
			role="img"
			aria-label={`Gender: ${options.label}`}
			className={cn(genderBadgeVariants({ size, gender }), className)}
		>
			<HugeiconsIcon
				icon={options?.icon ?? (undefined as any)}
				size={iconSize}
				className="shrink-0"
			/>
			{!iconOnly && <span>{options.label}</span>}
		</Badge>
	);
};

export default GenderBadge;
