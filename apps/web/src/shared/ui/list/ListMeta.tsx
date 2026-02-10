import { Card } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';
import { Badge } from '@shadcn-ui/badge';
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

				{count === 0 ? (
					<span>No {label} found</span>
				) : (
					<div className="flex flex-wrap items-center gap-2">
						<span>Showing</span>

						<Badge variant="secondary">
							{start}–{end}
						</Badge>

						<span>of</span>

						<Badge variant="outline">{totalItems ?? end}</Badge>

						<span>{label}</span>
					</div>
				)}
			</div>

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
