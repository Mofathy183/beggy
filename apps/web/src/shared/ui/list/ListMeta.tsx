import { Card } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Badge } from '@shadcn-ui/badge';
import type { PaginationMeta } from '@beggy/shared/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

/**
 * Props for the ListMeta component.
 *
 * This component is responsible for displaying pagination context
 * to the user in a clear and compact way.
 *
 * It communicates:
 * - The currently visible item range (e.g. 21–40)
 * - The total number of items
 * - The current page position (if multiple pages exist)
 *
 * Designed to work with API-driven pagination metadata.
 */
type ListMetaProps = {
	/**
	 * Pagination metadata returned from the API.
	 *
	 * Expected structure:
	 * - page: current page number (1-based)
	 * - limit: number of items per page
	 * - count: number of items in the current response
	 * - totalItems: total items across all pages (optional)
	 * - totalPages: total number of pages (optional)
	 *
	 * If null, the component renders nothing.
	 */
	meta: PaginationMeta | null;

	/**
	 * Indicates whether the list query is currently loading.
	 *
	 * When true, a skeleton placeholder is rendered
	 * to preserve layout stability and prevent layout shift.
	 */
	isLoading?: boolean;

	/**
	 * Human-readable label for the entity being listed.
	 *
	 * Example:
	 * - "users"
	 * - "orders"
	 * - "products"
	 *
	 * Used in the "Showing X–Y of Z {label}" sentence.
	 *
	 * @default "results"
	 */
	label?: string;
};

/**
 * ListMeta
 *
 * A small, UX-focused informational component that provides
 * contextual pagination feedback to the user.
 *
 * UX Goals:
 * - Reduce cognitive load by clearly showing item position.
 * - Avoid overwhelming users with too much pagination data.
 * - Maintain layout consistency during loading.
 * - Gracefully handle empty states.
 */
const ListMeta = ({ meta, isLoading, label = 'results' }: ListMetaProps) => {
	/**
	 * Loading State
	 *
	 * We render a skeleton inside a Card to:
	 * - Preserve vertical rhythm
	 * - Prevent layout shift
	 * - Indicate system activity
	 */
	if (isLoading) {
		return (
			<Card className="flex items-center gap-3 p-4">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-4 w-60" />
			</Card>
		);
	}

	/**
	 * If no metadata is available,
	 * we intentionally render nothing.
	 *
	 * This avoids misleading UI when pagination
	 * data hasn't been fetched or isn't applicable.
	 */
	if (!meta) {
		return null;
	}

	const { page, limit, count, totalItems, totalPages } = meta;

	/**
	 * Calculate visible range.
	 *
	 * Example:
	 * page = 2
	 * limit = 10
	 * count = 10
	 *
	 * start = 11
	 * end = 20
	 *
	 * We ensure start is 0-safe when count === 0.
	 */
	const start = (page - 1) * limit + (count > 0 ? 1 : 0);
	const end = (page - 1) * limit + count;

	return (
		<Card className="flex flex-wrap items-center justify-between gap-3 p-4">
			{/* 
				Main informational section.
				Muted color reduces visual weight while still providing clarity.
			*/}
			<div
				className="flex items-center gap-2 text-sm text-muted-foreground"
				aria-live="polite"
			>
				<HugeiconsIcon
					icon={InformationCircleIcon}
					className="h-4 w-4"
				/>

				{/* Empty State */}
				{count === 0 ? (
					<Badge variant="secondary" className="font-normal">
						No {label} found
					</Badge>
				) : (
					<div className="flex flex-wrap items-center gap-2">
						<span>Showing</span>

						{/* Current visible range */}
						<Badge variant="secondary">
							{start}–{end}
						</Badge>

						<span>of</span>

						{/* 
							If totalItems is not provided by the API,
							we fallback to the calculated end value.
							This keeps the UI functional even with partial metadata.
						*/}
						<Badge variant="outline">{totalItems ?? end}</Badge>

						<span>{label}</span>
					</div>
				)}
			</div>

			{/* 
				Page Indicator
				Only shown when multiple pages exist.
				Prevents unnecessary visual noise.
			*/}
			{totalPages != null && totalPages > 1 && (
				<Badge
					variant="outline"
					className="text-xs font-normal text-muted-foreground"
				>
					Page{' '}
					<strong className="mx-1 text-foreground">{page}</strong>
					of{' '}
					<strong className="ml-1 text-foreground">
						{totalPages}
					</strong>
				</Badge>
			)}
		</Card>
	);
};

export default ListMeta;
