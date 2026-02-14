import { Badge } from '@shadcn-ui/badge';
import type { Role } from '@beggy/shared/constants';
import { cn } from '@shadcn-lib';

/**
 * Visual style mapping for each role.
 *
 * Centralizes role-to-style association to avoid
 * conditional styling inside the component body.
 */
const roleStyles: Record<Role, string> = {
	ADMIN: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',

	MODERATOR:
		'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',

	MEMBER: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',

	USER: 'bg-muted text-muted-foreground border-border',
};

/**
 * Props for `UserRoleBadge`.
 */
export type UserRoleBadgeProps = {
	/** User role value. */
	role: Role;
};

/**
 * Displays a role label with contextual styling.
 *
 * Maps domain role values to visual variants while
 * keeping presentation logic isolated from consumers.
 */
const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
	return (
		<Badge
			variant="outline"
			className={cn(
				'text-xs font-medium tracking-wide uppercase',
				roleStyles[role]
			)}
		>
			{role}
		</Badge>
	);
};

export default UserRoleBadge;
