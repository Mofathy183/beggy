'use client';

import { useRouter } from 'next/navigation';
import { Shield01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { TearLine, TicketField, TicketCodeValue } from './ticket.primitives';
import { ErrorCode } from '@beggy/shared/constants';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * ForbiddenStateProps
 *
 * @remarks
 * This component is intentionally UI-only. It does NOT:
 * - check permissions
 * - perform routing or redirects
 * - infer roles or abilities
 *
 * The caller decides when to render it — typically inside <ProtectedRoute />
 * or as a section-level restriction.
 *
 * The `action` prop accepts any React node, allowing callers to inject
 * contextual CTAs: "Request access", "Contact admin", "Upgrade plan".
 */
export interface ForbiddenStateProps {
	/**
	 * Optional title explaining the restriction.
	 * @default "This stop isn't on your itinerary just yet."
	 */
	title?: string;

	/**
	 * Optional description providing context.
	 * @default Beggy-style explanation
	 */
	description?: string;

	/**
	 * The CASL/app permission that was denied — shown as a code field.
	 * @example "update:Bag" | "manage:User"
	 */
	requiredPermission?: string;

	/**
	 * The ErrorCode from @beggy/shared/constants returned by the API.
	 * Displayed as a code field on the ticket so the caller has full context.
	 *
	 * @example ErrorCode.FORBIDDEN | ErrorCode.INSUFFICIENT_PERMISSIONS | ErrorCode.ROLE_RESTRICTED
	 */
	errorCode?: ErrorCode;

	/**
	 * Optional callback for the "Go back" button.
	 * When absent, the button is hidden.
	 * Defaults to router.back() when provided as true.
	 */
	onBack?: (() => void) | true;

	/**
	 * Optional custom action node.
	 * Renders after the back button in the footer strip.
	 * @example <Button>Request access</Button>
	 */
	action?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ForbiddenState = ({
	title = "This stop isn't on your itinerary just yet.",
	description = 'Looks like this area requires a different level of access. If you think you should be here, a quick check with your admin should set things straight.',
	requiredPermission,
	errorCode = ErrorCode.ACCESS_DENIED,
	onBack,
	action,
}: ForbiddenStateProps) => {
	const router = useRouter();

	const handleBack =
		onBack === true
			? () => router.back()
			: typeof onBack === 'function'
				? onBack
				: null;

	const hasFooter = !!handleBack || !!action;

	return (
		<section
			aria-labelledby="forbidden-title"
			className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16"
		>
			{/* ── Boarding pass card ── */}
			<div className="animate-fade-in w-full max-w-sm">
				<div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card shadow-sm">
					{/* ── Header strip — warning tones (amber) ── */}
					<div className="flex items-start justify-between bg-warning/10 px-6 py-5">
						<div className="flex items-start gap-3">
							{/* Icon */}
							<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/20">
								<HugeiconsIcon
									icon={Shield01Icon}
									size={18}
									className="text-warning-foreground"
									aria-hidden="true"
								/>
							</div>

							<div>
								<p className="text-[0.625rem] font-semibold uppercase tracking-widest text-warning-foreground/70">
									Access restricted
								</p>
								<h1
									id="forbidden-title"
									className="mt-0.5 text-base font-semibold leading-snug text-foreground"
								>
									{title}
								</h1>
							</div>
						</div>

						{/* 403 badge */}
						<Badge
							variant="secondary"
							className="mt-0.5 shrink-0 bg-warning/20 font-bold tracking-wide text-warning-foreground hover:bg-warning/20"
							aria-hidden="true"
						>
							403
						</Badge>
					</div>

					{/* ── Tear line ── */}
					<div className="px-6">
						<TearLine />
					</div>

					{/* ── Ticket body ── */}
					<div className="px-6 py-5">
						<div className="grid grid-cols-2 gap-x-4 gap-y-4">
							{/* Description field — full width */}
							<TicketField
								label="What happened"
								value={
									<span className="text-muted-foreground">
										{description}
									</span>
								}
								className="col-span-2"
							/>

							{errorCode && (
								<TicketField
									label="Error code"
									value={
										<TicketCodeValue>
											{errorCode}
										</TicketCodeValue>
									}
									// If both are present, each takes one column
									className={
										requiredPermission ? '' : 'col-span-2'
									}
								/>
							)}

							{/* Required permission — only if provided */}
							{requiredPermission && (
								<TicketField
									label="Required permission"
									value={
										<TicketCodeValue>
											{requiredPermission}
										</TicketCodeValue>
									}
									className="col-span-2"
								/>
							)}
						</div>
					</div>

					{/* ── Footer strip — actions ── */}
					{hasFooter && (
						<div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-border bg-muted/40 px-6 py-4">
							{handleBack && (
								<Button
									variant="ghost"
									size="sm"
									onClick={handleBack}
								>
									← Go back
								</Button>
							)}
							{action}
						</div>
					)}
				</div>

				{/* ── Sub-text below card ── */}
				<p className="mt-4 text-center text-xs text-muted-foreground/60">
					Not all destinations are open to every traveler — that's
					okay.
				</p>
			</div>
		</section>
	);
};

export default ForbiddenState;
