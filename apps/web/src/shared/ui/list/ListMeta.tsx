import { Card } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';
import type { PaginationMeta } from '@beggy/shared/types';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';

type ListMetaProps = {
	/**
	 * Pagination metadata returned from the API.
	 */
	meta: PaginationMeta | null;

	/**
	 * Loading state of the list query.
	 */
	isLoading?: boolean;

	/**
	 * Optional entity label.
	 * Example: "users", "items", "bags"
	 */
	label?: string;
};

const ListMeta = ({ meta, isLoading, label = 'results' }: ListMetaProps) => {
	if (isLoading) {
		return (
			<Card className="flex items-center gap-3 p-4">
				<Skeleton className="h-4 w-4 rounded-full" />
				<Skeleton className="h-4 w-60" />
			</Card>
		);
	}

	if (!meta) {
		return null;
	}

	const { page, limit, count, totalItems, totalPages } = meta;

	const start = (page - 1) * limit + (count > 0 ? 1 : 0);
	const end = (page - 1) * limit + count;

	return (
		<Card className="flex flex-wrap items-center justify-between gap-3 p-4">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<HugeiconsIcon
					icon={InformationCircleIcon}
					className="h-4 w-4"
				/>

				<p>
					{count === 0 ? (
						<span>No {label} found</span>
					) : (
						<>
							Showing{' '}
							<strong className="text-foreground">
								{start}–{end}
							</strong>{' '}
							of{' '}
							<strong className="text-foreground">
								{totalItems ?? end}
							</strong>{' '}
							{label}
						</>
					)}
				</p>
			</div>

			{totalPages != null && totalPages > 1 && (
				<p className="text-sm text-muted-foreground">
					Page <strong className="text-foreground">{page}</strong> of{' '}
					<strong className="text-foreground">{totalPages}</strong>
				</p>
			)}
		</Card>
	);
};

export default ListMeta;
