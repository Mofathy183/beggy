'use client';

import { AlertTriangle, Lightbulb } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert, AlertDescription } from '@shadcn-ui/alert';
import { Badge } from '@shadcn-ui/badge';
import { Button } from '@shadcn-ui/button';
import type { HttpClientError } from '@shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import {
	isHttpClientError,
	suggestionFromCode,
	fallbackCodeFromStatus,
	messageFromCode,
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

	// Resolve the ErrorCode — from the API body if available,
	// otherwise derive from status code, otherwise UNKNOWN_ERROR.
	const errorCode: ErrorCode =
		httpError?.body.code ??
		(statusCode
			? fallbackCodeFromStatus(statusCode)
			: ErrorCode.UNKNOWN_ERROR);

	// Title: prop → API body message → ErrorMessages lookup by code
	const resolvedTitle =
		title ?? httpError?.body.message ?? messageFromCode(errorCode);

	// Description: prop → ErrorMessages lookup by code (same source as API)
	// When we have a real API error, body.message IS already from ErrorMessages.
	// For native JS errors we fall through to the code lookup.
	const resolvedDescription = description ?? messageFromCode(errorCode);

	// Suggestion: prop → API body suggestion → ErrorSuggestions lookup by code
	const resolvedSuggestion =
		suggestion ??
		httpError?.body.suggestion ??
		suggestionFromCode(errorCode);

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
