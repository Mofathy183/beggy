import { Card, CardHeader, CardContent } from '@shadcn-ui/card';
import { Avatar, AvatarFallback } from '@shadcn-ui/avatar';
import { Separator } from '@shadcn-ui/separator';
import { format } from 'date-fns';
import { cn } from '@shared/lib/utils';
import type { AdminUserDTO } from '@beggy/shared/types';

import {
	UserRoleBadge,
	UserStatusBadge,
	UserEmailVerificationBadge,
} from '@features/users/components/badges';
import { UserActions } from '@features/users/components/actions';
/**
 * Props for `UserCard`.
 */
export type UserCardProps = {
	/** User entity to display. */
	user: AdminUserDTO;

	/** Optional edit handler. */
	onEdit: (user: AdminUserDTO) => void;
	onSelect: (user: AdminUserDTO) => void;
	onToggleStatus: (user: AdminUserDTO) => void;
	onDelete: (user: AdminUserDTO) => void;

	/** Controls visibility of contextual actions. */
	/** Indicates whether the rendered user is the currently authenticated user. */
	isCurrentUser?: boolean;
	isUpdatingStatus?: boolean;
	isDeleting?: boolean;
	className?: string;
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
	onSelect,
	onEdit,
	onToggleStatus,
	onDelete,
	isCurrentUser = false,
	isUpdatingStatus = false,
	isDeleting = false,
	className,
}: UserCardProps) => {
	return (
		<Card
			className={cn(
				'flex flex-col gap-0 transition-shadow hover:shadow-md',
				isDeleting && 'pointer-events-none opacity-60',
				className
			)}
		>
			{/* ── Header: avatar + email + actions ─────────────────────────── */}
			<CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
				<div className="flex min-w-0 items-start gap-3">
					<Avatar className="h-10 w-10 shrink-0">
						<AvatarFallback className="bg-muted text-muted-foreground text-sm font-semibold">
							{getInitial(user.email)}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0 space-y-1">
						{/*
						 * truncate + title: long emails are clipped visually
						 * but always readable on hover via the title attribute.
						 */}
						<p
							className="text-foreground truncate text-sm font-semibold"
							title={user.email}
						>
							{user.email}
						</p>
						<UserRoleBadge role={user.role} />
					</div>
				</div>

				<div className="shrink-0">
					<UserActions
						user={user}
						onSelect={onSelect}
						onEdit={onEdit}
						onToggleStatus={onToggleStatus}
						onDelete={onDelete}
						isCurrentUser={isCurrentUser}
						isUpdatingStatus={isUpdatingStatus}
						isDeleting={isDeleting}
					/>
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-3 pt-0">
				{/* ── Status badges ────────────────────────────────────────── */}
				<div className="flex flex-wrap items-center gap-1.5">
					<UserStatusBadge isActive={user.isActive} />
					<UserEmailVerificationBadge
						isEmailVerified={user.isEmailVerified}
					/>
				</div>

				<Separator />

				{/* ── Footer: join date ────────────────────────────────────── */}
				<p className="text-muted-foreground/70 text-[11px]">
					Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
				</p>
			</CardContent>
		</Card>
	);
};

export default UserCard;
