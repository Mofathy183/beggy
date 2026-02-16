import { Card, CardHeader, CardContent } from '@shadcn-ui/card';
import { Avatar, AvatarFallback } from '@shadcn-ui/avatar';
import { format } from 'date-fns';
import type { AdminUserDTO } from '@beggy/shared/types';

import {
	UserRoleBadge,
	UserStatusBadge,
	UserActions,
	UserEmailVerificationBadge,
} from '@features/users/components';

/**
 * Props for `UserCard`.
 */
export type UserCardProps = {
	/** User entity to display. */
	user: AdminUserDTO;

	/** Indicates whether the rendered user is the currently authenticated user. */
	isCurrentUser?: boolean;

	/** Optional edit handler. */
	onEdit?: () => void;

	/** Controls visibility of contextual actions. */
	showActions?: boolean;
};

/**
 * Returns the uppercase initial derived from an email address.
 */
const getInitial = (email: string) => {
	return email.charAt(0).toUpperCase();
};

/**
 * Domain presentation component for displaying a user summary.
 *
 * Composes user-related badges and actions into a cohesive card layout.
 * Purely presentational — data fetching and business logic remain external.
 */
const UserCard = ({
	user,
	isCurrentUser = false,
	onEdit,
	showActions = true,
}: UserCardProps) => {
	return (
		<Card className="transition-shadow hover:shadow-sm">
			<CardHeader className="flex flex-row items-start justify-between pb-3">
				<div className="flex items-start gap-3">
					<Avatar className="h-10 w-10">
						<AvatarFallback className="bg-muted text-muted-foreground">
							{getInitial(user.email)}
						</AvatarFallback>
					</Avatar>

					<div className="space-y-1">
						<p className="text-sm font-semibold">{user.email}</p>

						<UserRoleBadge role={user.role} />
					</div>
				</div>

				{showActions && (
					<UserActions
						userId={user.id}
						isActive={user.isActive}
						isCurrentUser={isCurrentUser}
						onEdit={onEdit}
					/>
				)}
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="flex flex-wrap gap-2">
					<UserStatusBadge isActive={user.isActive} />
					<UserEmailVerificationBadge
						isEmailVerified={user.isEmailVerified}
					/>
				</div>

				<p className="text-xs text-muted-foreground">
					Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
				</p>
			</CardContent>
		</Card>
	);
};

export default UserCard;
