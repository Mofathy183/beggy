'use client';

import { cn } from '@shadcn-lib';
import type { IconSvgElement } from '@hugeicons/react';
import Chip from '@shared/ui/chips/Chip';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Represents a UI-friendly option derived from a domain enum.
 * Inlined here so ChipList is self-contained and importable
 * without depending on the full mapper module.
 *
 * @template E Enum value type (string)
 */
type UiEnumOptions<E extends string> = {
	value: E;
	label: string;
	shortLabel?: string;
	icon?: IconSvgElement;
	disabled?: boolean;
};

/**
 * Visual style variants passed down to individual Chip items.
 * Matches the ChipVariant type on the Chip primitive.
 */
type ChipVariant = 'default' | 'primary' | 'accent' | 'destructive';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ChipListProps<E extends string> {
	/**
	 * The selected feature values to display.
	 * Renders nothing when null, undefined, or empty.
	 *
	 * @remarks
	 * Accepts any enum array — BagFeature[], SuitcaseFeature[], etc.
	 * Type safety is enforced by the generic constraint against `options`.
	 */
	values: E[] | null | undefined;

	/**
	 * The full options definition for this enum.
	 * Drives label resolution, shortLabel, and icon lookup.
	 *
	 * Pass directly from the mapper:
	 * @example
	 * options={BAG_FEATURE_OPTIONS}
	 * options={SUITCASE_FEATURE_OPTIONS}
	 */
	options: readonly UiEnumOptions<E>[];

	/**
	 * Maximum number of chips to display before collapsing the rest
	 * into a "+N more" overflow chip.
	 *
	 * Pass `Infinity` to show all chips without overflow.
	 *
	 * @defaultValue 3
	 */
	maxVisible?: number;

	/**
	 * Controls which label field is used per chip:
	 * - `'short'` (default) — uses `shortLabel` with fallback to `label`.
	 *   Appropriate for cards, compact rows, and any space-constrained context.
	 * - `'full'` — always uses `label`, ignoring `shortLabel`.
	 *   Appropriate for detail pages and popovers with more room.
	 *
	 * @defaultValue 'short'
	 */
	display?: 'short' | 'full';

	/**
	 * Visual variant applied to all selected chips.
	 * Follows the same variant contract as the Chip primitive.
	 *
	 * @defaultValue 'default'
	 */
	variant?: ChipVariant;

	/**
	 * Accessible label for the chip group container.
	 * Defaults to "Features" — override when the context is more specific.
	 *
	 * @example
	 * groupLabel="Bag features"
	 * groupLabel="Suitcase features"
	 *
	 * @defaultValue 'Features'
	 */
	groupLabel?: string;

	className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves the display label for a single option based on `display` mode.
 * Falls back gracefully: shortLabel → label → raw enum value.
 */
function resolveLabel<E extends string>(
	option: UiEnumOptions<E>,
	display: 'short' | 'full'
): string {
	if (display === 'full') return option.label;
	return option.shortLabel ?? option.label;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ChipList
 *
 * A fully generic, read-only chip collection for any multi-value feature enum.
 *
 * @description
 * Renders an enum value array as a set of read-only Chip components,
 * driven entirely by a `UiEnumOptions` definition from the mapper layer.
 * No domain knowledge is baked in — it works identically for BagFeature,
 * SuitcaseFeature, or any future multi-value enum.
 *
 * @designPrinciples
 * - Zero domain coupling — accepts any `UiEnumOptions<E>[]`
 * - Read-only by contract — `pointer-events-none cursor-default` on every chip
 * - `maxVisible` + overflow chip prevents card layout break
 * - `display` prop adapts label verbosity to the rendering context
 * - Unknown enum values are silently skipped (future-proof)
 * - Renders nothing for empty/null input — no placeholder, no empty state
 *
 * @example
 * // Bag card — short labels, max 3 visible
 * <ChipList
 *   values={bag.features}
 *   options={BAG_FEATURE_OPTIONS}
 * />
 *
 * // Suitcase detail page — full labels, all visible
 * <ChipList
 *   values={suitcase.features}
 *   options={SUITCASE_FEATURE_OPTIONS}
 *   display="full"
 *   maxVisible={Infinity}
 *   groupLabel="Suitcase features"
 * />
 *
 * // Diagnostic chips with destructive variant (e.g. status reasons)
 * <ChipList
 *   values={status.reasons}
 *   options={CONTAINER_STATUS_REASON_OPTIONS}
 *   variant="destructive"
 *   maxVisible={Infinity}
 *   groupLabel="Status reasons"
 * />
 */
const ChipList = <E extends string>({
	values,
	options,
	maxVisible = 3,
	display = 'short',
	variant = 'default',
	groupLabel = 'Features',
	className,
}: ChipListProps<E>) => {
	// ── Null / empty guard ────────────────────────────────────────────────────
	if (!values || values.length === 0) return null;

	// ── Resolve options for the provided values ───────────────────────────────
	// Filter to only values that exist in the options map.
	// Unknown enum values (from future API versions) are silently skipped.
	const resolved = values.reduce<
		{ value: E; label: string; icon?: IconSvgElement }[]
	>((acc, val) => {
		const option = options.find((o) => o.value === val);
		if (!option) return acc; // unknown value — skip silently

		acc.push({
			value: val,
			label: resolveLabel(option, display),
			icon: option.icon,
		});

		return acc;
	}, []);

	// ── Apply maxVisible constraint ───────────────────────────────────────────
	const effectiveMax = maxVisible === Infinity ? resolved.length : maxVisible;
	const visible = resolved.slice(0, effectiveMax);
	const hidden = resolved.slice(effectiveMax);
	const overflowCount = hidden.length;

	// Build overflow chip aria-label from the hidden items' labels
	const overflowAriaLabel =
		overflowCount > 0 ? hidden.map((h) => h.label).join(', ') : undefined;

	return (
		<section
			role="list"
			aria-label={groupLabel}
			className={cn('flex flex-wrap gap-1.5', className)}
		>
			{visible.map(({ value, label, icon }) => (
				<article key={value} role="listitem">
					<Chip
						label={label}
						icon={icon}
						selected
						variant={variant}
						// Read-only contract: no hover affordance, no interaction
						className="cursor-default pointer-events-none"
						aria-label={label}
					/>
				</article>
			))}

			{/* Overflow chip — neutral unselected styling, lower visual weight */}
			{overflowCount > 0 && (
				<article role="listitem">
					<Chip
						label={`+${overflowCount}`}
						selected={false}
						className="cursor-default pointer-events-none text-muted-foreground"
						aria-label={`${overflowCount} more: ${overflowAriaLabel}`}
					/>
				</article>
			)}
		</section>
	);
};

export default ChipList;
