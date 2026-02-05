import { HugeiconsIcon } from '@hugeicons/react';
import { ShieldAlert } from '@hugeicons/core-free-icons';
import { Card, CardContent } from '@shadcn-ui/card';
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
	title = '',
	description = '',
	onBack,
	action,
}: ForbiddenProps) => (
	// Centered layout suitable for page-level or section-level usage
	<section className="flex min-h-[60vh] items-center justify-center px-4">
		<Card className="w-full max-w-md text-center shadow-sm">
			<CardContent className="flex flex-col items-center gap-4 py-8">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<HugeiconsIcon
						icon={ShieldAlert}
						className="h-6 w-6 text-muted-foreground"
					/>
				</div>

				<div className="space-y-1">
					<h2 className="text-lg font-semibold">{title}</h2>
					<p className="text-sm text-muted-foreground">
						{description}
					</p>
				</div>

				<div className="flex gap-2 pt-2">
					{onBack && (
						<Button variant="outline" onClick={onBack}>
							Go back
						</Button>
					)}

					{action}
				</div>
			</CardContent>
		</Card>
	</section>
);

export default Forbidden;
