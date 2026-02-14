import { Badge } from '@shadcn-ui/badge';
import { cn } from '@shadcn-lib';

type UserStatusBadgeProps = {
	isActive: boolean;
};

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
