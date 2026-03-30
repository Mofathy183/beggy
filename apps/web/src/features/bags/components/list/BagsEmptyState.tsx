'use client';

import { ListEmptyState } from '@shared-ui/list';
import { Luggage01Icon, FilterIcon } from '@hugeicons/core-free-icons';

// ─── Types ─────────────────────────────────────────────────────────────────────

type BagsEmptyStateProps = {
	/** Whether filters are currently active — changes copy and CTA */
	hasFilters?: boolean;
	/** Called when the user clicks "Clear filters" */
	onReset: () => void;
};

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * BagsEmptyState
 *
 * @description
 * Empty state for the Bags list.
 *
 * @remarks
 * - Two variants:
 *   1. Filters active but no results → clear filters CTA
 *   2. No bags at all → inventory-building encouragement
 * - Delegates layout and styling to the shared `ListEmptyState`.
 * - Icons and copy are domain-specific to the bags feature.
 */
const BagsEmptyState = ({
	hasFilters = false,
	onReset,
}: BagsEmptyStateProps) => {
	if (hasFilters) {
		return (
			<ListEmptyState
				icon={FilterIcon}
				title="No bags match your filters"
				description="Try adjusting or clearing your filters to find what you're looking for."
				action={{
					label: 'Clear filters',
					onClick: onReset,
				}}
			/>
		);
	}

	return (
		<ListEmptyState
			icon={Luggage01Icon}
			title="No bags yet"
			description="Start packing — add your first bag and begin building your travel kit."
		/>
	);
};

export default BagsEmptyState;
