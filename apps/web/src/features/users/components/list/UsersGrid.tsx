'use client';

import { DataGrid } from '@shared-ui/grid';
import { Card } from '@shadcn-ui/card';
import { Skeleton } from '@shadcn-ui/skeleton';

import { UserCard } from '@features/users/components/details';
import UsersEmptyState from '@features/users/components/list/UsersEmptyState';
import type { AdminUserDTO } from '@beggy/shared/types';

const UserCardSkeleton = () => (
	<Card className="flex flex-col gap-3 p-4">
		<div className="flex items-start justify-between gap-2">
			<div className="flex items-start gap-3">
				<Skeleton className="h-10 w-10 shrink-0 rounded-full" />
				<div className="flex flex-col gap-1.5">
					<Skeleton className="h-4 w-36 rounded" />
					<Skeleton className="h-5 w-20 rounded-full" />
				</div>
			</div>
			<Skeleton className="h-7 w-7 shrink-0 rounded-md" />
		</div>
		<div className="flex gap-1.5">
			<Skeleton className="h-5 w-16 rounded-full" />
			<Skeleton className="h-5 w-24 rounded-full" />
		</div>
		<Skeleton className="h-px w-full" />
		<Skeleton className="h-3 w-28 rounded" />
	</Card>
);

type UsersGridProps = {
	users: AdminUserDTO[];
	isLoading?: boolean;
	hasFilters?: boolean;
	onResetFilters: () => void;
	onSelect: (user: AdminUserDTO) => void;
	onEdit: (user: AdminUserDTO) => void;
	onToggleStatus: (user: AdminUserDTO) => void;
	onDelete: (user: AdminUserDTO) => void;
	currentUserId?: string;
	updatingStatusId?: string | null;
	deletingId?: string | null;
	className?: string;
};

/**
 * UsersGrid
 *
 * Feature-level layout component responsible for rendering
 * users inside a responsive grid.
 *
 * Responsibilities:
 * - Map domain entities (User) → UI components (UserCard)
 * - Delegate layout to shared DataGrid
 * - Handle empty state presentation
 *
 * This component contains NO fetching logic.
 */
const UsersGrid = ({
	users,
	isLoading = false,
	hasFilters = false,
	onResetFilters,
	onSelect,
	onEdit,
	onToggleStatus,
	onDelete,
	currentUserId,
	updatingStatusId,
	deletingId,
	className,
}: UsersGridProps) => {
	if (isLoading) {
		return (
			<DataGrid isLoading className={className}>
				{Array.from({ length: 8 }, (_, i) => (
					<UserCardSkeleton key={i} />
				))}
			</DataGrid>
		);
	}

	return (
		<DataGrid
			empty={
				<UsersEmptyState
					hasFilters={hasFilters}
					onReset={onResetFilters}
				/>
			}
			className={className}
		>
			{users.map((user) => (
				<UserCard
					key={user.id}
					user={user}
					onSelect={onSelect}
					onEdit={onEdit}
					onToggleStatus={onToggleStatus}
					onDelete={onDelete}
					isCurrentUser={user.id === currentUserId}
					isUpdatingStatus={updatingStatusId === user.id}
					isDeleting={deletingId === user.id}
				/>
			))}
		</DataGrid>
	);
};

export default UsersGrid;
