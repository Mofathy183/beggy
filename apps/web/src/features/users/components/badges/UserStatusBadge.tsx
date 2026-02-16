import { Badge } from '@shadcn-ui/badge';

/**
 * Props for `UserStatusBadge`.
 */
export type UserStatusBadgeProps = {
	/** Indicates whether the user account is active. */
	isActive: boolean;
};

/**
 * Displays the user's account status.
 *
 * Domain → intent → UI mapping.
 */
const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => {
	const label = isActive ? 'Active' : 'Inactive';
	const variant = isActive ? 'default' : 'secondary';

	return (
		<Badge
			variant={variant}
			className="text-xs font-medium"
			aria-label={`User account status: ${label}`}
		>
			{label}
		</Badge>
	);
};

export default UserStatusBadge;
