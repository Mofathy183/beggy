import { ListEmptyState } from '@shared-ui/list';
import { PackageIcon, FilterIcon } from '@hugeicons/core-free-icons';

type ItemsEmptyStateProps = {
	/** Whether filters are currently active — changes copy and CTA */
	hasFilters?: boolean;
	/** Called when the user clicks "Clear filters" */
	onReset: () => void;
};

/**
 * Empty state for the Items list.
 *
 * @remarks
 * - Two variants:
 *   1. Filters active but no results → clear filters CTA
 *   2. No items at all → inventory-building encouragement
 * - Delegates layout and styling to the shared `ListEmptyState`.
 * - Icons and copy are domain-specific to the items feature.
 */
const ItemsEmptyState = ({
	hasFilters = false,
	onReset,
}: ItemsEmptyStateProps) => {
	if (hasFilters) {
		return (
			<ListEmptyState
				icon={FilterIcon}
				title="No items match your filters"
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
			icon={PackageIcon}
			title="Your packing list is empty"
			description="Start building your inventory — add the things you'd never leave behind."
		/>
	);
};

export default ItemsEmptyState;
