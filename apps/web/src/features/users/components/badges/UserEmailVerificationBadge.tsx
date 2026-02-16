import { Badge } from '@shadcn-ui/badge';

export type UserEmailVerificationBadgeProps = {
	isEmailVerified: boolean;
};

const UserEmailVerificationBadge = ({
	isEmailVerified,
}: UserEmailVerificationBadgeProps) => {
	const label = isEmailVerified ? 'Email Verified' : 'Email Unverified';

	const semanticClasses = isEmailVerified
		? 'bg-success/10 text-success border-success/30'
		: 'bg-warning/10 text-warning border-warning/30';

	return (
		<Badge
			variant="outline"
			className={`text-xs font-medium tracking-wide ${semanticClasses}`}
			aria-label={`User email status: ${label}`}
		>
			{label}
		</Badge>
	);
};

export default UserEmailVerificationBadge;
