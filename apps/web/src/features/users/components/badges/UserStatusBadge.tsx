import { Badge } from '@shadcn-ui/badge';
import { cn } from '@shadcn-lib';

/**
 * Props for `UserStatusBadge`.
 */
export type UserStatusBadgeProps = {
	/** Indicates whether the user account is active. */
	isActive: boolean;
};

/**
 * Displays the user's account status as a styled badge.
 *
 * Pure presentation component that maps a boolean
 * active state to a contextual visual variant.
 */
const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
	return (
		<Badge
			variant="outline"
			className={cn(
				'text-xs font-medium',
				isActive
					? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
					: 'bg-muted text-muted-foreground border-border'
			)}
		>
			{isActive ? 'Active' : 'Inactive'}
		</Badge>
	);
};

export default UserStatusBadge;
