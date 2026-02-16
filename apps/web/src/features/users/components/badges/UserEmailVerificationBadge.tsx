import { Badge } from '@shadcn-ui/badge';

/**
 * Props for `UserEmailVerificationBadge`.
 */
export type UserEmailVerificationBadgeProps = {
	/** Indicates whether the user's email address is verified. */
	isEmailVerified: boolean;
};

/**
 * Displays the user's email verification status.
 *
 * Maps verification state → semantic intent → badge variant.
 */
const UserEmailVerificationBadge = ({
	isEmailVerified,
}: UserEmailVerificationBadgeProps) => {
	const label = isEmailVerified ? 'Email Verified' : 'Email Unverified';

	const variant = isEmailVerified ? 'default' : 'secondary';

	return (
		<Badge
			variant={variant}
			className="text-xs font-medium tracking-wide"
			aria-label={`User email status: ${label}`}
		>
			{label}
		</Badge>
	);
};

export default UserEmailVerificationBadge;
