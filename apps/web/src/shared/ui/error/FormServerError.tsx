'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { Alert, AlertDescription, AlertTitle } from '@shadcn-ui/alert';
import { cn } from '@shadcn-lib';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormServerErrorProps = {
	/**
	 * The primary error message — maps to HttpClientError.body.message.
	 * When null or undefined the component renders nothing.
	 */
	message: string | null | undefined;

	/**
	 * The actionable suggestion — maps to HttpClientError.body.suggestion.
	 * Rendered below the message in a smaller, muted style.
	 * Optional — not all errors include a suggestion.
	 */
	suggestion?: string | null;

	/** Optional className forwarded to the Alert root for layout overrides. */
	className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FormServerError
 *
 * Reusable server-error block for all form UIs.
 * Renders nothing when `message` is null/undefined — safe to always render,
 * no wrapper conditional needed at the call site.
 *
 * Implements the soft destructive alert pattern from §12.7:
 * - Tinted bg (bg-destructive/8) + tinted border (border-destructive/30)
 * - Full-chroma icon + title text (text-destructive)
 * - Muted description for the suggestion
 *
 * Place it inside a <FieldGroup>, above the submit button.
 *
 * Maps directly to HttpClientError:
 *   message    → HttpClientError.body.message    (what went wrong)
 *   suggestion → HttpClientError.body.suggestion (what to do)
 *   code       → intentionally omitted           (machine-readable, not for UI)
 *
 * @example — always render, no wrapper needed
 * <FormServerError
 *   message={serverError}
 *   suggestion={serverSuggestion}
 * />
 *
 * @example — from a hook that exposes the full error object
 * <FormServerError
 *   message={error?.body.message}
 *   suggestion={error?.body.suggestion}
 * />
 */
const FormServerError = ({
	message,
	suggestion,
	className,
}: FormServerErrorProps) => {
	// Renders nothing when there is no error — call site needs no conditional
	if (!message) return null;

	return (
		<Alert
			variant="destructive"
			role="alert"
			aria-live="polite"
			className={cn(
				'border-destructive/30 bg-destructive/8 text-foreground',
				className
			)}
		>
			<HugeiconsIcon
				icon={AlertCircleIcon}
				className="h-4 w-4 text-destructive"
			/>
			<AlertTitle className="text-destructive font-semibold">
				{message}
			</AlertTitle>
			{suggestion && (
				<AlertDescription className="text-muted-foreground text-sm">
					{suggestion}
				</AlertDescription>
			)}
		</Alert>
	);
};

export default FormServerError;
