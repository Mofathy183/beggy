import { Badge } from '@shadcn-ui/badge';
import type { Role } from '@beggy/shared/constants';

/**
 * Maps domain roles → semantic badge variants.
 */
const roleVariantMap: Record<Role, 'default' | 'secondary' | 'outline'> = {
	ADMIN: 'default',
	MODERATOR: 'secondary',
	MEMBER: 'outline',
	USER: 'outline',
};

export type UserRoleBadgeProps = {
	role: Role;
};

/**
 * Displays a user role with semantic styling.
 *
 * Domain → intent → UI mapping.
 */
const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
	return (
		<Badge
			variant={roleVariantMap[role]}
			className="text-xs font-medium tracking-wide uppercase"
			aria-label={`User role: ${role}`}
		>
			{role}
		</Badge>
	);
};

export default UserRoleBadge;
