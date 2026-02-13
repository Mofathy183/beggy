import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationPrevious,
	PaginationNext,
} from '@shadcn-ui/pagination';
import { Card } from '@shadcn-ui/card';
import { Badge } from '@shadcn-ui/badge';

import type { PaginationMeta } from '@beggy/shared/types';

/**
 * Props for the ListPagination component.
 */
type ListPaginationProps = {
	/**
	 * Pagination metadata returned from the API.
	 *
	 * Expected structure:
	 * - page: current page number (1-based)
	 * - hasNextPage: whether a next page exists
	 * - hasPreviousPage: whether a previous page exists
	 * - totalPages: total number of available pages
	 *
	 * If `null`, the pagination UI will not render.
	 */
	meta: PaginationMeta | null;

	/**
	 * Called when the user requests a page change.
	 *
	 * This component is fully controlled —
	 * it does not manage pagination state internally.
	 */
	onPageChange: (page: number) => void;

	/**
	 * When true, disables interaction.
	 *
	 * Useful during:
	 * - Data fetching
	 * - Mutations
	 * - Transitional UI states
	 *
	 * Prevents race conditions and double navigation.
	 */
	isDisabled?: boolean;
};

/**
 * ListPagination
 *
 * A minimal, controlled pagination component designed for
 * API-driven lists (admin dashboards, tables, public listings).
 *
 * ---
 * UX Principles:
 * - Clear directional navigation
 * - Disabled states prevent invalid interaction
 * - Consistent layout (no layout shifts)
 * - Minimal cognitive load
 *
 * ---
 * Architectural Principles:
 * - Fully controlled (stateless)
 * - Defensive against invalid API metadata
 * - Reusable across different list contexts
 */
const ListPagination = ({
	meta,
	onPageChange,
	isDisabled,
}: ListPaginationProps) => {
	/**
	 * If no pagination metadata is available,
	 * we cannot determine navigation state.
	 */
	if (!meta) return null;

	const { page, hasNextPage, hasPreviousPage, totalPages } = meta;

	/**
	 * Derived disabled states.
	 * Centralizing this logic improves readability and avoids duplication.
	 */
	const isPrevDisabled = !hasPreviousPage || isDisabled;
	const isNextDisabled = !hasNextPage || isDisabled;

	/**
	 * Navigate to the previous page.
	 *
	 * Defensive safeguards:
	 * - Prevents navigation if disabled
	 * - Ensures page never drops below 1
	 */
	const handlePrevious = () => {
		if (isPrevDisabled) return;
		onPageChange(Math.max(1, page - 1));
	};

	/**
	 * Navigate to the next page.
	 *
	 * Defensive safeguards:
	 * - Prevents navigation if disabled
	 */
	const handleNext = () => {
		if (isNextDisabled) return;
		onPageChange(page + 1);
	};

	return (
		<Card className="flex items-center justify-between p-4">
			{/* 
				Page indicator.
				Displayed as a badge to visually separate metadata
				from interactive controls.
			*/}
			<Badge variant="secondary">
				Page {page} of {totalPages}
			</Badge>

			{/* 
				Pagination navigation controls.
				Accessibility considerations:
				- aria-disabled communicates state to screen readers
				- tabIndex prevents keyboard focus when disabled
			*/}
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={handlePrevious}
							aria-disabled={isPrevDisabled}
							tabIndex={isPrevDisabled ? -1 : 0}
							className={
								isPrevDisabled
									? 'pointer-events-none opacity-50'
									: ''
							}
						/>
					</PaginationItem>

					{/* Current page indicator */}
					<PaginationItem>
						<PaginationLink isActive>{page}</PaginationLink>
					</PaginationItem>

					<PaginationItem>
						<PaginationNext
							onClick={handleNext}
							aria-disabled={isNextDisabled}
							tabIndex={isNextDisabled ? -1 : 0}
							className={
								isNextDisabled
									? 'pointer-events-none opacity-50'
									: ''
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</Card>
	);
};

export default ListPagination;
