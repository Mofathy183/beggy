'use client';

import { DataGrid } from '@shared-ui/grid';
import { UserCard } from '@features/users/components/details';
import type { AdminUserDTO } from '@beggy/shared/types';

type UsersGridProps = {
	/**
	 * Array of users to render.
	 * Should already be filtered/paginated by parent.
	 */
	users: AdminUserDTO[];

	/**
	 * Indicates whether data is loading.
	 * Used to control empty state visibility.
	 */
	isLoading?: boolean;

	/**
	 * Optional override for empty state UI.
	 */
	empty?: React.ReactNode;

	/**
	 * Additional class names passed to DataGrid.
	 */
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
	empty,
	className,
}: UsersGridProps) => {
	return (
		<DataGrid
			aria-busy={isLoading}
			isLoading={isLoading}
			empty={empty}
			className={className}
		>
			{users.map((user) => (
				<div key={user.id} role="listitem">
					<UserCard user={user} />
				</div>
			))}
		</DataGrid>
	);
};

export default UsersGrid;
