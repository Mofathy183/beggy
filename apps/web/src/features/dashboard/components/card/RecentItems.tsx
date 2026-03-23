'use client';

import { Button } from '@shadcn-ui/button';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Card, CardContent } from '@shadcn-ui/card';
import { Package01Icon } from '@hugeicons/core-free-icons';
import type { RecentItemDto } from '@beggy/shared/types';
import RecentItemCard from './RecentItemCard';
import ListEmptyState from '@shared-ui/list/ListEmptyState';
import ErrorState from '@shared-ui/states/ErrorState';

interface RecentItemsProps {
	/**
	 * List of recently added items to display.
	 */
	items: RecentItemDto[];

	/**
	 * Indicates whether the data is currently being fetched.
	 */
	isLoading: boolean;

	/**
	 * Indicates whether the last fetch resulted in an error.
	 */
	isError: boolean;

	/**
	 * Retries the failed request.
	 */
	onRetry: () => void;

	/** Navigate to the full items list */
	onViewAll: () => void;

	/** Navigate to the item detail / edit page */
	onEdit: (id: string) => void;

	/**
	 * Triggers item deletion.
	 * @remarks Caller is responsible for handling errors and user feedback.
	 */
	onDelete: (id: string) => void;

	/** Navigate to the new item creation page */
	onAddItem: () => void;
}

const SKELETON_COUNT = 5;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * @description
 * Placeholder card used while recent items are loading.
 *
 * @remarks
 * Matches the layout of {@link RecentItemCard} to avoid layout shift.
 */
const RecentItemCardSkeleton = () => (
	<Card>
		<CardContent className="flex flex-col p-3">
			<Skeleton className="mb-3 aspect-square w-full rounded-md" />
			<Skeleton className="h-3.5 w-3/4 rounded" />
			<Skeleton className="mt-2 h-5 w-16 rounded-full" />
			<Skeleton className="mt-1.5 h-3 w-2/5 rounded" />
		</CardContent>
	</Card>
);

/**
 * @description
 * Grid skeleton used during initial or refetch loading states.
 */
const RecentItemsSkeleton = () => (
	<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{Array.from({ length: SKELETON_COUNT }).map((_, i) => (
			<RecentItemCardSkeleton key={i} />
		))}
	</div>
);

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * @description
 * Displays a dashboard section for recently added items with full state handling.
 *
 * @remarks
 * - Prioritizes perceived performance via skeleton loading.
 * - Handles mutually exclusive UI states: error → loading → empty → data.
 * - Delegates item rendering to {@link RecentItemCard}.
 */
const RecentItems = ({
	items,
	isLoading,
	isError,
	onRetry,
	onViewAll,
	onEdit,
	onDelete,
	onAddItem,
}: RecentItemsProps) => {
	return (
		<section>
			{/* Header */}
			<div className="mb-3 flex items-center justify-between">
				<p className="text-foreground text-[15px] font-medium">
					Recently added
				</p>
				<Button
					variant="link"
					size="sm"
					className="text-muted-foreground h-auto p-0 text-xs"
					onClick={onViewAll}
				>
					View all →
				</Button>
			</div>

			{/* Content states */}
			{isError ? (
				<ErrorState reset={onRetry} />
			) : isLoading ? (
				<RecentItemsSkeleton />
			) : items.length === 0 ? (
				<ListEmptyState
					icon={Package01Icon}
					title="No items yet"
					description="Start building your travel library by adding your first item."
					action={{ label: 'Add item', onClick: onAddItem }}
				/>
			) : (
				<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{items.map((item) => (
						<RecentItemCard
							key={item.id}
							item={item}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default RecentItems;
