import { Badge } from '@shadcn-ui/badge';

export type UserStatusBadgeProps = {
	isActive: boolean;
};

/**
 * Displays the user's account status.
 *
 * Domain → semantic state → token.
 */
const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
	const label = isActive ? 'Active' : 'Inactive';

	const semanticClasses = isActive
		? 'bg-success/10 text-success border-success/30'
		: 'bg-muted text-muted-foreground border-border';

	return (
		<Badge
			variant="outline"
			className={`text-xs font-medium tracking-wide ${semanticClasses}`}
			aria-label={`User account status: ${label}`}
		>
			{label}
		</Badge>
	);
};

export default UserStatusBadge;
