import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldAlert } from '@hugeicons/core-free-icons';
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@shadcn-ui/card';
import { Button } from '@shadcn-ui/button';

/**
 * ForbiddenProps
 *
 * Props for the Forbidden UI state component.
 *
 * @remarks
 * This component represents an **authorization denial state**.
 * It is intentionally UI-only and should not perform:
 * - redirects
 * - permission checks
 * - authentication logic
 *
 * The caller is responsible for deciding *when* this state is shown.
 */
type ForbiddenProps = {
	/**
	 * Optional title explaining the restriction.
	 *
	 * @example "Access restricted"
	 */
	title?: string;

	/**
	 * Optional description providing context to the user.
	 *
	 * @example "Only admins can manage users."
	 */
	description?: string;

	/**
	 * Optional callback for a "Go back" action.
	 *
	 * Typically wired to:
	 * - router.back()
	 * - navigate(-1)
	 */
	onBack?: () => void;

	/**
	 * Optional custom action element.
	 *
	 * @remarks
	 * Allows callers to inject contextual actions such as:
	 * - "Request access"
	 * - "Contact admin"
	 * - "Upgrade plan"
	 */
	action?: React.ReactNode;
};

/**
 * Forbidden
 *
 * Presentational component that renders a friendly
 * "access denied" UI state.
 *
 * @remarks
 * Design principles:
 * - Authorization denial is a **valid UI state**, not an error
 * - Visual tone is neutral and calm (no danger styling)
 * - Provides optional escape hatches (go back / custom action)
 *
 * Intended usage:
 * - As a fallback inside <ProtectedRoute />
 * - As a section-level restriction inside pages
 *
 * Non-responsibilities:
 * - Does NOT check permissions
 * - Does NOT perform routing or redirects
 * - Does NOT infer user roles or abilities
 */
const Forbidden = ({
	title = 'This stop isn’t on your itinerary just yet',
	description = 'Looks like this area requires a different level of access. If you think you should be here, a quick check with your admin should set things straight.',
	onBack,
	action,
}: ForbiddenProps) => (
	// Centered layout suitable for page-level or section-level usage
	<section className="flex min-h-[60vh] items-center justify-center px-4">
		<Card className="w-full max-w-md text-center shadow-sm">
			<CardHeader className="items-center text-center">
				<div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={ShieldAlert}
						className="h-6 w-6 text-muted-foreground"
					/>
				</div>

				<CardTitle className="text-xl tracking-tight">
					{title}
				</CardTitle>

				<CardDescription>{description}</CardDescription>
			</CardHeader>

			{(onBack || action) && (
				<CardFooter className="flex justify-center gap-2">
					{onBack && (
						<Button variant="outline" onClick={onBack}>
							Go back
						</Button>
					)}
					{action}
				</CardFooter>
			)}
		</Card>
	</section>
);

export default Forbidden;
