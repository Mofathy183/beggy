'use client';

import type { ContainerStatusReason } from '@beggy/shared/constants';
import { CONTAINER_STATUS_REASON_OPTIONS } from '@shared/ui/mappers';
import { ChipList } from '@shared-ui/chips';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ContainerStatusReasonChipsProps {
	/**
	 * Array of ContainerStatusReason values from ContainerStatusDTO.state.reasons.
	 * Renders nothing when empty or undefined — no placeholder, no "no reasons" text.
	 *
	 * @remarks
	 * An empty reasons array is valid — it means the bag is in a clean state (OK/EMPTY).
	 * The component correctly renders nothing in that case.
	 */
	reasons: ContainerStatusReason[] | null | undefined;

	/**
	 * Maximum number of chips to display before collapsing.
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
 * ContainerStatusReasonChips
 *
 * Read-only display of ContainerStatusReason[] as diagnostic chips.
 * Renders on detail pages only — never on list cards.
 *
 * Design decision: reasons are read-only chips, never badges, never interactive.
 * - Too verbose for badges (multi-value, longer labels)
 * - User does NOT select reasons — they are system-derived diagnostics
 * - Rendered with `destructive` variant to signal actionable warnings
 *   (reasons always indicate something worth the user's attention)
 *
 * The "why" behind the status: if ContainerStatusBadge says "Overweight",
 * these chips explain the specific causes — "Weight over limit",
 * "Capacity exceeded" — giving users actionable context.
 *
 * Uses full labels (not shortLabel) — detail page context has space,
 * and the diagnostic value of "Approaching weight limit" > "Near weight".
 *
 * @example
 * // Detail page — render below ContainerStatusBadge
 * <ContainerStatusReasonChips reasons={bag.status.state.reasons} />
 */
const ContainerStatusReasonChips = ({
	reasons,
	maxVisible = 3,
	display = 'full',
	className,
}: ContainerStatusReasonChipsProps) => {
	// ── Null / empty guard — clean state means no reasons to show ────────────
	if (!reasons || reasons.length === 0) return null;

	return (
		<ChipList
			values={reasons}
			options={CONTAINER_STATUS_REASON_OPTIONS}
			display={display}
			variant="destructive"
			maxVisible={maxVisible}
			groupLabel="Status reasons"
			className={className}
		/>
	);
};

export default ContainerStatusReasonChips;
