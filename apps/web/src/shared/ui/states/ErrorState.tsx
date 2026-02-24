'use client';

import { AlertTriangle, Lightbulb } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { HttpClientError } from '@shared/types';
import {
	isHttpClientError,
	titleFromStatus,
	descriptionFromStatus,
} from '@shared/utils';
import { TearLine, TicketField, TicketCodeValue } from './ticket.primitives';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ErrorStateProps {
	/**
	 * The error — can be:
	 * - HttpClientError (API call failed — has statusCode + Beggy body)
	 * - Native JS Error (from Next.js error boundary — no statusCode)
	 * - undefined (generic fallback)
	 */
	error?: HttpClientError | Error | unknown;

	/**
	 * Next.js error boundary reset callback.
	 * When provided, renders a "Try again" button.
	 */
	reset?: () => void;

	/** Override the displayed title. */
	title?: string;

	/** Override the displayed description. */
	description?: string;

	/** Override the suggestion. When absent, uses error.body.suggestion. */
	suggestion?: string;

	/** Label for the retry button. Defaults to "Try again". */
	retryLabel?: string;

	/** Show "Go home" button. Defaults to true. */
	showHomeButton?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ErrorState = ({
	error,
	reset,
	title,
	description,
	suggestion,
	retryLabel = 'Try again',
	showHomeButton = true,
}: ErrorStateProps) => {
	// Narrow to HttpClientError — gives us statusCode + body cleanly
	const httpError = isHttpClientError(error) ? error : null;

	// statusCode comes from the wrapper, not the body — no bracket access needed
	const statusCode = httpError?.statusCode ?? null;

	// Title: prop → Beggy body message → status fallback
	const resolvedTitle =
		title ?? httpError?.body.message ?? titleFromStatus(statusCode);

	// Description: prop → status copy
	const resolvedDescription =
		description ?? descriptionFromStatus(statusCode);

	// Suggestion: prop → Beggy body suggestion
	const resolvedSuggestion = suggestion ?? httpError?.body.suggestion ?? null;

	const errorCode = httpError?.body.code ?? null;

	return (
		<div
			role="alert"
			aria-labelledby="error-state-title"
			aria-describedby="error-state-desc"
			className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16"
		>
			<div className="animate-fade-in w-full max-w-sm">
				<div className="overflow-hidden rounded-2xl border border-dashed border-border bg-card shadow-sm">
					{/* ── Header strip — destructive tones ── */}
					<div className="flex items-start justify-between bg-destructive/8 px-6 py-5">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
								<HugeiconsIcon
									icon={AlertTriangle}
									size={18}
									className="text-destructive"
									aria-hidden="true"
								/>
							</div>
							<div>
								<p className="text-[0.625rem] font-semibold uppercase tracking-widest text-destructive/70">
									Disruption notice
								</p>
								<h1
									id="error-state-title"
									className="mt-0.5 text-base font-semibold leading-snug text-foreground"
								>
									{resolvedTitle}
								</h1>
							</div>
						</div>

						{statusCode && (
							<Badge
								variant="destructive"
								className="mt-0.5 shrink-0 text-xs font-bold tracking-wide"
								aria-label={`HTTP status ${statusCode}`}
							>
								{statusCode}
							</Badge>
						)}
					</div>

					{/* ── Tear line ── */}
					<div className="px-6">
						<TearLine />
					</div>

					{/* ── Ticket body ── */}
					<div className="px-6 py-5">
						<div className="grid grid-cols-2 gap-x-4 gap-y-4">
							<TicketField
								label="Status"
								value={
									<span className="text-muted-foreground">
										{resolvedDescription}
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
								/>
							)}

							{statusCode && (
								<TicketField
									label="HTTP"
									value={
										<span className="font-mono text-sm text-muted-foreground">
											{statusCode}
										</span>
									}
								/>
							)}
						</div>

						{/* ── Suggestion — Beggy personality ── */}
						{resolvedSuggestion && (
							<>
								<div className="mt-5">
									<TearLine />
								</div>
								<Alert
									id="error-state-desc"
									className="mt-5 border-0 bg-accent/60 px-4 py-3"
								>
									<div className="flex items-start gap-2">
										<HugeiconsIcon
											icon={Lightbulb}
											aria-hidden="true"
											className="mt-px shrink-0 text-sm"
										/>
										<AlertDescription className="text-sm leading-relaxed text-accent-foreground">
											{resolvedSuggestion}
										</AlertDescription>
									</div>
								</Alert>
							</>
						)}
					</div>

					{/* ── Footer strip ── */}
					<div className="flex flex-wrap items-center justify-end gap-2 border-t border-dashed border-border bg-muted/40 px-6 py-4">
						{showHomeButton && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => (window.location.href = '/')}
							>
								Go home
							</Button>
						)}
						{reset && (
							<Button variant="default" size="sm" onClick={reset}>
								{retryLabel}
							</Button>
						)}
					</div>
				</div>

				<p className="mt-4 text-center text-xs text-muted-foreground/60">
					Your bags and lists are safe — this is just a detour.
				</p>
			</div>
		</div>
	);
};

export default ErrorState;
