import { Badge } from '@shadcn-ui/badge';
import type { Role } from '@beggy/shared/constants';
import { ROLE_OPTIONS } from '@shared/ui/mappers';

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
	const roleOption = ROLE_OPTIONS.find((option) => option.value === role);

	return (
		<Badge
			variant={roleIntent[role]}
			className="text-xs font-medium tracking-wide"
			aria-label={`User role: ${role}`}
		>
			{roleOption?.label}
		</Badge>
	);
};

export default UserRoleBadge;
