'use client';

/**
 * app/error.tsx
 *
 * Next.js App Router error boundary for the root app segment.
 * Catches unhandled errors thrown inside page.tsx and layout.tsx
 * children — but NOT inside the root layout.tsx itself
 * (that's global-error.tsx's job).
 *
 * Must be 'use client' — Next.js requirement for error boundaries.
 *
 * Props injected by Next.js:
 * - error: Error & { digest?: string }
 *   The thrown error. digest is a server-side hash for log correlation.
 * - reset: () => void
 *   Re-renders the segment — lets the user retry without a full reload.
 *
 * What to do here in production:
 * Replace console.error with your error reporting service:
 *   import * as Sentry from '@sentry/nextjs';
 *   Sentry.captureException(error);
 */

import { useEffect } from 'react';
import { ErrorState } from '@shared-ui/states';
import type { HttpClientError } from '@shared/types';

interface ErrorPageProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	useEffect(() => {
		// TODO: replace with Sentry.captureException(error) in production
		console.error('[app/error]', error.message, error.digest);
	}, [error]);

	return (
		<ErrorState error={error as unknown as HttpClientError} reset={reset} />
	);
}
