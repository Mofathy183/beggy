import React from 'react';
import { cn } from '@shared/lib/utils';

type DataGridProps = {
	/**
	 * Grid items.
	 * Typically a mapped array of feature-level components (e.g., UserCard).
	 */
	children: React.ReactNode;

	/**
	 * Indicates whether data is currently loading.
	 * Prevents empty state from rendering while fetching.
	 */
	isLoading?: boolean;

	/**
	 * Optional empty state UI.
	 * Rendered only when:
	 * - Not loading
	 * - No children exist
	 */
	empty?: React.ReactNode;

	/**
	 * Optional additional class names for layout customization.
	 */
	className?: string;
};

/**
 * DataGrid
 *
 * A reusable responsive grid layout primitive.
 *
 * Architectural role:
 * - Lives in shared layer
 * - Responsible ONLY for layout
 * - Must not contain business logic or data fetching
 *
 * Behavior:
 * - Renders children in a responsive CSS grid
 * - Displays provided empty state when no items exist
 * - Suppresses empty state while loading
 *
 * Usage example:
 *
 * <DataGrid empty={<EmptyState />}>
 *   {items.map(item => (
 *     <ItemCard key={item.id} />
 *   ))}
 * </DataGrid>
 */
const DataGrid = ({
	children,
	isLoading = false,
	empty,
	className,
}: DataGridProps) => {
	/**
	 * React.Children.count is safer than Array.isArray(children)
	 * because children may be:
	 * - A single element
	 * - A fragment
	 * - Conditional JSX
	 */
	const hasItems = React.Children.count(children) > 0;

	/**
	 * Render empty state only when:
	 * - Not currently loading
	 * - No items exist
	 * - An empty component was provided
	 */
	if (!isLoading && !hasItems && empty) {
		return <>{empty}</>;
	}

	return (
		<div
			className={cn(
				`
        grid
        gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        `,
				className
			)}
		>
			{children}
		</div>
	);
};

export default DataGrid;
