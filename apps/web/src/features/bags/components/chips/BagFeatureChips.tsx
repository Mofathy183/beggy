'use client';

import type { BagFeature } from '@beggy/shared/constants';
import { BAG_FEATURE_OPTIONS } from '@shared/ui/mappers';
import { ChipList } from '@shared/ui/chips';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BagFeatureChipsProps {
	/**
	 * Array of BagFeature values from BagDTO.
	 * Renders nothing when empty or undefined — no placeholder rendered.
	 */
	features: BagFeature[] | null | undefined;

	/**
	 * Maximum number of feature chips to display before collapsing.
	 * Remaining count shown as "+N more" overflow chip.
	 * Pass `Infinity` to show all (detail page).
	 *
	 * @defaultValue 3
	 */
	maxVisible?: number;

	/**
	 * Controls label verbosity:
	 * - `'short'` — shortLabel with fallback to label. For cards and compact rows.
	 * - `'full'`  — always uses label. For detail pages and popovers.
	 *
	 * @defaultValue 'short'
	 */
	display?: 'short' | 'full';

	className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BagFeatureChips
 *
 * @description
 * Read-only display of BagFeature[] as a collection of Chip components.
 * Delegates entirely to ChipList — this component is a thin domain adapter.
 *
 * @remarks
 * Design decision: features are ALWAYS chips, never badges.
 * They represent a multi-value collection, not a single semantic state.
 *
 * ChipList handles:
 * - Read-only contract (pointer-events-none, cursor-default)
 * - maxVisible + "+N more" overflow chip
 * - Unknown enum value filtering (future-proof)
 * - Accessible role="list" + aria-label group
 *
 * Variant is `'default'` — features are identity metadata, not warnings.
 * (The original used `'destructive'` which implied an error state.)
 *
 * @example
 * // Card — short labels, max 3 chips + overflow
 * <BagFeatureChips features={bag.features} />
 *
 * // Detail page — full labels, all chips visible
 * <BagFeatureChips features={bag.features} display="full" maxVisible={Infinity} />
 */
const BagFeatureChips = ({
	features,
	maxVisible = 3,
	display = 'short',
	className,
}: BagFeatureChipsProps) => {
	if (!features || features.length === 0) return null;

	return (
		<ChipList
			values={features}
			options={BAG_FEATURE_OPTIONS}
			display={display}
			variant="accent"
			maxVisible={maxVisible}
			groupLabel="Bag features"
			className={className}
		/>
	);
};

export default BagFeatureChips;
