import { Card } from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';
import type { PaginationMeta } from '@beggy/shared/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRightIcon, ArrowLeftIcon } from '@hugeicons/core-free-icons';

type ListPaginationProps = {
	/**
	 * Pagination metadata returned from the API.
	 */
	meta: PaginationMeta | null;

	/**
	 * Called when the page should change.
	 */
	onPageChange: (page: number) => void;

	/**
	 * Disable interaction (e.g. while fetching).
	 */
	isDisabled?: boolean;
};

const ListPagination = ({
	meta,
	onPageChange,
	isDisabled,
}: ListPaginationProps) => {
	if (!meta) return null;

	const { page, hasNextPage, hasPreviousPage } = meta;

	if (!hasNextPage && !hasPreviousPage) return null;

	return (
		<Card className="flex items-center justify-between p-4">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(page - 1)}
				disabled={!hasPreviousPage || isDisabled}
			>
				<HugeiconsIcon icon={ArrowLeftIcon} className="mr-2 h-4 w-4" />
				Previous
			</Button>

			<span className="text-sm text-muted-foreground">
				Page <strong className="text-foreground">{page}</strong>
			</span>

			<Button
				variant="outline"
				size="sm"
				onClick={() => onPageChange(page + 1)}
				disabled={!hasNextPage || isDisabled}
			>
				Next
				<HugeiconsIcon icon={ArrowRightIcon} className="ml-2 h-4 w-4" />
			</Button>
		</Card>
	);
};

export default ListPagination;
