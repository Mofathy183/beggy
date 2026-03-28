'use client';

import { InboxIcon } from '@hugeicons/core-free-icons';
import ListEmptyState from '@shared/ui/list/ListEmptyState';

export interface ContainerStatusEmptyStateProps {
	/** Contextual noun (e.g., "bag", "suitcase") used in the description. */
	containerLabel?: string;
	className?: string;
}

/**
 * Empty state displayed when a container has no items.
 *
 * @description
 * Provides a consistent, reusable message encouraging users to add items
 * in order to visualize weight and capacity metrics.
 */
const ContainerStatusEmptyState = ({
	containerLabel = 'container',
	className,
}: ContainerStatusEmptyStateProps) => (
	<ListEmptyState
		icon={InboxIcon}
		title="Nothing packed yet"
		description={`Add items to this ${containerLabel} to see weight and capacity.`}
		className={className}
	/>
);

export default ContainerStatusEmptyState;
