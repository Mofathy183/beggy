'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Location01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { TearLine, TicketField, TicketCodeValue } from './ticket.primitives';
import { ErrorCode } from '@beggy/shared/constants';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NotFoundStateProps {
	title?: string;
	description?: string;
	backLabel?: string;
	homeLabel?: string;
	onBack?: () => void;
	onHome?: () => void;
	/**
	 * Hide the back button.
	 * Use at top-level pages where there is no navigation history
	 * (e.g. app/not-found.tsx renders at the root — no history guaranteed).
	 */
	hideBack?: boolean;

	/**
	 * Optional ErrorCode from @beggy/shared/constants.
	 * Use when rendering NotFoundState inside a feature page
	 * after an API call returns 404 — e.g. ErrorCode.BAG_NOT_FOUND.
	 *
	 * Not needed in app/not-found.tsx (route-level 404 has no error code).
	 *
	 * @example
	 * <NotFoundState errorCode={ErrorCode.BAG_NOT_FOUND} />
	 */
	errorCode?: ErrorCode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NotFoundState = ({
	title = 'Looks like this page packed up and left.',
	description = "The page you're looking for doesn't exist, was moved, or the link is broken.",
	backLabel = 'Go back',
	homeLabel = 'Go home',
	onBack,
	onHome,
	hideBack = false,
	errorCode = ErrorCode.PAGE_NOT_FOUND,
}: NotFoundStateProps) => {
	const router = useRouter();
	const pathname = usePathname();

	const handleOnBack = onBack ?? (() => router.back());

	const handleOnHome = onHome ?? (() => router.push('/'));

	return (
		<div
			role="main"
			aria-labelledby="not-found-title"
			className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16"
		>
			<div className="animate-fade-in w-full max-w-sm">
				<div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card shadow-sm">
					{/* ── Header strip — primary/teal tones ── */}
					<div className="flex items-start justify-between bg-accent/40 px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
								<HugeiconsIcon
									icon={Location01Icon}
									size={18}
									className="text-primary"
									aria-hidden="true"
								/>
							</div>
							<div>
								<p className="text-[0.625rem] font-semibold uppercase tracking-widest text-primary/70">
									Destination not found
								</p>
								<h1
									id="not-found-title"
									className="mt-0.5 text-base font-semibold leading-snug text-foreground"
								>
									{title}
								</h1>
							</div>
						</div>

						<Badge
							variant="secondary"
							className="mt-0.5 shrink-0 font-bold tracking-wide"
							aria-hidden="true"
						>
							404
						</Badge>
					</div>

					{/* ── Tear line ── */}
					<div className="px-6">
						<TearLine />
					</div>

					{/* ── Ticket body ── */}
					<div className="px-6 py-5">
						<div className="grid grid-cols-2 gap-x-4 gap-y-4">
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
									className="col-span-2"
								/>
							)}

							{pathname && (
								<TicketField
									label="Requested route"
									value={
										<TicketCodeValue>
											{pathname}
										</TicketCodeValue>
									}
									className="col-span-2"
								/>
							)}
						</div>
					</div>

					{/* ── Footer strip ── */}
					<div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-border bg-muted/40 px-6 py-4">
						{!hideBack && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleOnBack}
							>
								← {backLabel}
							</Button>
						)}
						<Button
							variant="default"
							size="sm"
							onClick={handleOnHome}
						>
							{homeLabel}
						</Button>
					</div>
				</div>

				<p className="mt-4 text-center text-xs text-muted-foreground/60">
					Every great trip has a wrong turn. Let's find your way back.
				</p>
			</div>
		</div>
	);
};

export default NotFoundState;
