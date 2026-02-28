import { Separator } from '@shadcn-ui/separator';

/**
 * Authentication method divider.
 *
 * @description
 * Visual separator between OAuth-based authentication
 * and credential-based (email/password) forms.
 *
 * @remarks
 * Purely presentational component. Shared across login and signup flows.
 */
const AuthDivider = () => (
	<div className="flex items-center gap-3">
		<Separator className="flex-1" />
		<span className="shrink-0 text-xs font-medium uppercase tracking-widest text-muted-foreground">
			or
		</span>
		<Separator className="flex-1" />
	</div>
);

export default AuthDivider;
