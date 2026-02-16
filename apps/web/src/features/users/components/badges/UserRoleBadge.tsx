import { Badge } from '@shadcn-ui/badge';
import type { Role } from '@beggy/shared/constants';

/**
 * Semantic intent mapping for each role.
 *
 * Maps domain role → UI semantic intent,
 * not to specific colors.
 */
const roleIntent: Record<Role, 'default' | 'secondary' | 'outline'> = {
	ADMIN: 'default',
	MODERATOR: 'secondary',
	MEMBER: 'secondary',
	USER: 'outline',
};

export type UserRoleBadgeProps = {
	role: Role;
};

/**
 * Displays a role label with semantic styling.
 *
 * Domain → semantic intent → design token.
 */
const UserRoleBadge = ({ role }: UserRoleBadgeProps) => {
	return (
		<Badge
			variant={roleIntent[role]}
			className="text-xs font-medium tracking-wide uppercase"
			aria-label={`User role: ${role}`}
		>
			{role}
		</Badge>
	);
};

export default UserRoleBadge;
