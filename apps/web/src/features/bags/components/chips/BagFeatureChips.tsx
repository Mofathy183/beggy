'use client';

import { BagFeature } from '@beggy/shared/constants';
import { BAG_FEATURE_OPTIONS } from '@shared/ui/mappers';
import { ChipList } from '@shared/ui/chips';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BagFeatureChipsProps {
	/**
	 * Array of BagFeature values from BagDTO.
	 * Renders nothing when empty or undefined.
	 */
	features: BagFeature[] | null | undefined;

	/**
	 * Maximum number of feature chips to display before collapsing.
	 * Remaining count is shown as a "+N more" overflow chip.
	 *
	 * @defaultValue 3
	 */
	maxVisible?: number;

	/**
	 * Controls label display mode:
	 * - `short` (default): shortLabel ("Laptop slot", "USB port") — card context
	 * - `full`: full label ("Padded laptop compartment") — detail page
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
 * Read-only display of BagFeature[] as a collection of Chip components.
 *
 * Design decision: features are ALWAYS chips, NEVER badges.
 * They represent a multi-value collection, not a single semantic state.
 * (See decision matrix: BagFeature → Chips read-only only, no Badge.)
 *
 * Uses the existing Chip primitive in read-only mode:
 * - `selected={true}` applies the active visual style
 * - No `onClick` — no hover affordance needed (pointer-events handled at chip level)
 * - No `onRemove` — display only
 *
 * `maxVisible` prevents card layout overflow — default 3 chips + "+N more".
 * The overflow chip uses the same secondary styling to keep visual weight consistent.
 *
 * @example
 * // Card context — short labels, max 3
 * <BagFeatureChips features={bag.features} />
 *
 * // Detail page — full labels, show all
 * <BagFeatureChips features={bag.features} display="full" maxVisible={Infinity} />
 */
const BagFeatureChips = ({
	features,
	maxVisible = 3,
	display = 'short',
	className,
}: BagFeatureChipsProps) => {
	// ── Null / empty guard — renders nothing, no empty state placeholder ─────
	if (!features || features.length === 0) return null;

	return (
		<ChipList
			values={features}
			options={BAG_FEATURE_OPTIONS}
			display={display}
			variant="destructive"
			maxVisible={maxVisible}
			groupLabel="Status reasons"
			className={className}
		/>
	);
};

export default BagFeatureChips;
