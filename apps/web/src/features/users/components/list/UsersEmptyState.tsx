import { ListEmptyState } from '@shared/ui/list';

/**
 * Props for `UsersEmptyState`.
 */
export type UsersEmptyStateProps = {
	/** Indicates whether filters are currently applied. */
	hasFilters: boolean;

	/** Invoked when the user chooses to reset active filters. */
	onReset: () => void;
};

/**
 * Users domain empty state component.
 *
 * Adapts the shared `ListEmptyState` to provide contextual
 * messaging based on whether the list is empty due to
 * filtering or because no users exist.
 */
const UsersEmptyState = ({ hasFilters, onReset }: UsersEmptyStateProps) => {
	if (hasFilters) {
		return (
			<ListEmptyState
				title="Nothing’s showing up with these filters"
				description="Looks like your filters are being a bit too specific. Try adjusting or clearing them — you might uncover the full crew."
				action={{
					label: 'Reset filters',
					onClick: onReset,
				}}
			/>
		);
	}

	return (
		<ListEmptyState
			title="No travelers here just yet"
			description="Once users are added, they’ll appear right here — ready to be managed and set on their journey."
		/>
	);
};

export default UsersEmptyState;
